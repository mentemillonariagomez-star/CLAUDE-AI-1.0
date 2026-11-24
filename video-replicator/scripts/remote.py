"""Procesamiento remoto opcional.

Si el móvil se queda corto, ejecuta este mismo proyecto en un PC o servidor:

    python main.py serve --host 0.0.0.0 --port 8765 --token MI_TOKEN

y en Termux pon en config/config.json:  "remote": {"url": "http://IP_DEL_PC:8765", "token": "MI_TOKEN"}
Luego usa --remote en analyze/generate, o el motor de transcripción "remote".

En el servidor, la transcripción usa (por orden) faster-whisper, openai-whisper o whisper.cpp,
lo que esté instalado allí. Solo biblioteca estándar en ambos lados.
"""
from __future__ import annotations

import json
import os
import shutil
import tempfile
import urllib.parse
import urllib.request
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

from .common import DIRS, log, warn


# --------------------------------------------------------------------------
# Cliente
# --------------------------------------------------------------------------
class RemoteClient:
    def __init__(self, cfg: dict):
        r = cfg["remote"]
        if not r.get("url"):
            raise RuntimeError("Configura remote.url en config/config.json")
        self.url = r["url"].rstrip("/")
        self.token = r.get("token", "")
        self.timeout = r.get("timeout", 1800)

    def _req(self, path: str, data=None, length=None, ctype="application/octet-stream"):
        headers = {"X-Token": self.token, "Content-Type": ctype}
        if length is not None:
            headers["Content-Length"] = str(length)
        req = urllib.request.Request(self.url + path, data=data, headers=headers, method="POST" if data is not None else "GET")
        return urllib.request.urlopen(req, timeout=self.timeout)

    def _upload(self, path: str, file: Path):
        with open(file, "rb") as f:
            return self._req(path, data=f, length=file.stat().st_size)

    def health(self) -> dict:
        with self._req("/health") as r:
            return json.loads(r.read())

    def analyze(self, video: Path, name: str) -> dict:
        log(f"Subiendo {video.name} al servidor remoto para analizar…")
        with self._upload(f"/analyze?name={urllib.parse.quote(name)}", video) as r:
            return json.loads(r.read())

    def transcribe(self, wav: Path) -> list[dict]:
        with self._upload("/transcribe", wav) as r:
            return json.loads(r.read())["cues"]

    def render(self, script: dict, tpl: dict, out: Path) -> Path:
        log("Enviando guion y plantilla al servidor remoto para renderizar…")
        body = json.dumps({"script": script, "template": tpl}).encode()
        with self._req("/render", data=body, length=len(body), ctype="application/json") as r, open(out, "wb") as f:
            shutil.copyfileobj(r, f, 1 << 20)
        return out


# --------------------------------------------------------------------------
# Servidor
# --------------------------------------------------------------------------
def _server_transcribe(wav: Path, cfg: dict) -> list[dict]:
    lang = cfg["transcription"].get("language", "auto")
    lang = None if lang == "auto" else lang
    try:
        from faster_whisper import WhisperModel  # type: ignore
        model = WhisperModel(os.environ.get("VR_WHISPER_MODEL", "small"), compute_type="int8")
        segs, _ = model.transcribe(str(wav), language=lang)
        return [{"start": round(s.start, 3), "end": round(s.end, 3), "text": s.text.strip()} for s in segs]
    except ImportError:
        pass
    try:
        import whisper  # type: ignore
        model = whisper.load_model(os.environ.get("VR_WHISPER_MODEL", "small"))
        res = model.transcribe(str(wav), language=lang)
        return [{"start": round(s["start"], 3), "end": round(s["end"], 3), "text": s["text"].strip()} for s in res["segments"]]
    except ImportError:
        pass
    from .transcribe import _whisper_cpp, whisper_cpp_available
    if whisper_cpp_available(cfg):
        return _whisper_cpp(wav, wav.parent, cfg, 3600)
    raise RuntimeError("El servidor no tiene faster-whisper, openai-whisper ni whisper.cpp")


def serve(cfg: dict, host: str, port: int, token: str) -> None:
    from .analyze import analyze_video
    from .render import render
    from .template import build_template, save_template

    class Handler(BaseHTTPRequestHandler):
        def _auth(self) -> bool:
            if token and self.headers.get("X-Token") != token:
                self._json(401, {"error": "token inválido"})
                return False
            return True

        def _json(self, code: int, obj) -> None:
            data = json.dumps(obj, ensure_ascii=False).encode()
            self.send_response(code)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(data)))
            self.end_headers()
            self.wfile.write(data)

        def _body_to(self, path: Path) -> Path:
            n = int(self.headers.get("Content-Length", 0))
            with open(path, "wb") as f:
                while n > 0:
                    chunk = self.rfile.read(min(n, 1 << 20))
                    if not chunk:
                        break
                    f.write(chunk)
                    n -= len(chunk)
            return path

        def do_GET(self):  # noqa: N802
            if self.path.startswith("/health"):
                self._json(200, {"ok": True, "service": "video-replicator"})
            else:
                self._json(404, {"error": "ruta no encontrada"})

        def do_POST(self):  # noqa: N802
            if not self._auth():
                return
            url = urllib.parse.urlparse(self.path)
            q = urllib.parse.parse_qs(url.query)
            tmp = Path(tempfile.mkdtemp(prefix="vr_srv_", dir=str(DIRS["output"])))
            try:
                if url.path == "/analyze":
                    name = q.get("name", ["remoto"])[0]
                    video = self._body_to(tmp / f"{name}.mp4")
                    analysis, _ = analyze_video(video, cfg, name)
                    tpl = build_template(analysis)
                    save_template(tpl)
                    self._json(200, {"analysis": analysis, "template": tpl})
                elif url.path == "/transcribe":
                    wav = self._body_to(tmp / "audio.wav")
                    self._json(200, {"cues": _server_transcribe(wav, cfg)})
                elif url.path == "/render":
                    req = json.loads(self._body_to(tmp / "req.json").read_text(encoding="utf-8"))
                    out = render(req["script"], req["template"], cfg, tmp / "out.mp4")
                    self.send_response(200)
                    self.send_header("Content-Type", "video/mp4")
                    self.send_header("Content-Length", str(out.stat().st_size))
                    self.end_headers()
                    with open(out, "rb") as f:
                        shutil.copyfileobj(f, self.wfile, 1 << 20)
                else:
                    self._json(404, {"error": "ruta no encontrada"})
            except Exception as e:  # noqa: BLE001
                warn(f"Error en {url.path}: {e}")
                self._json(500, {"error": str(e)})
            finally:
                shutil.rmtree(tmp, ignore_errors=True)

    if not token:
        warn("Servidor sin token: cualquiera en tu red podrá usarlo. Usa --token.")
    log(f"Servidor Video Replicator escuchando en http://{host}:{port}")
    ThreadingHTTPServer((host, port), Handler).serve_forever()
