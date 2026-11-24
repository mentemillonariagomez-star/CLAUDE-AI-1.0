"""Utilidades compartidas: rutas, configuración, FFmpeg/FFprobe y registro.

Solo usa la biblioteca estándar de Python para que funcione en Termux sin
compilar nada.
"""
from __future__ import annotations

import glob
import json
import os
import re
import shutil
import subprocess
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DIRS = {
    "input": ROOT / "input",
    "references": ROOT / "references",
    "templates": ROOT / "templates",
    "assets": ROOT / "assets",
    "output": ROOT / "output",
    "config": ROOT / "config",
}

DEFAULT_CONFIG = {
    "language": "es",
    "performance": {
        "threads": 2,
        "analysis_width": 320,
        "analysis_fps": 8,
        "max_keyframes": 24,
        "max_audio_analysis_sec": 180,
        "max_transcribe_sec": 600,
    },
    "analysis": {"scene_threshold": 0.30, "min_scene_sec": 0.4},
    "output": {
        "resolution": "auto",
        "fps": 30,
        "video_encoder": "auto",
        "preset": "veryfast",
        "crf": 23,
        "audio_bitrate": "128k",
    },
    "tts": {"engine": "auto", "voice": "es", "speed": 165},
    "transcription": {
        "engine": "auto",
        "language": "auto",
        "whisper_cpp_bin": "~/whisper.cpp/build/bin/whisper-cli",
        "whisper_cpp_model": "~/whisper.cpp/models/ggml-base.bin",
        "openai_model": "whisper-1",
    },
    "script_ai": {"engine": "auto", "model": "claude-opus-5-5"},
    "music": {"file": "", "volume": 0.18},
    "remote": {"url": "", "token": "", "timeout": 1800},
    "font": "",
}


# --------------------------------------------------------------------------
# Registro
# --------------------------------------------------------------------------
def log(msg: str) -> None:
    print(f"[{time.strftime('%H:%M:%S')}] {msg}", flush=True)


def warn(msg: str) -> None:
    print(f"[aviso] {msg}", file=sys.stderr, flush=True)


# --------------------------------------------------------------------------
# Configuración
# --------------------------------------------------------------------------
def _merge(base: dict, extra: dict) -> dict:
    out = dict(base)
    for k, v in extra.items():
        if isinstance(v, dict) and isinstance(out.get(k), dict):
            out[k] = _merge(out[k], v)
        else:
            out[k] = v
    return out


def load_config() -> dict:
    path = DIRS["config"] / "config.json"
    cfg = DEFAULT_CONFIG
    if path.exists():
        try:
            cfg = _merge(DEFAULT_CONFIG, json.loads(path.read_text(encoding="utf-8")))
        except json.JSONDecodeError as e:
            warn(f"config.json inválido ({e}); uso valores por defecto")
    return cfg


def expand(p: str) -> str:
    return os.path.expandvars(os.path.expanduser(p)) if p else p


def save_json(path: Path, data) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")


def slugify(text: str, maxlen: int = 40) -> str:
    import unicodedata

    t = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode()
    t = re.sub(r"[^a-zA-Z0-9]+", "-", t).strip("-").lower()
    return (t or "video")[:maxlen]


# --------------------------------------------------------------------------
# Entorno
# --------------------------------------------------------------------------
def is_termux() -> bool:
    return "com.termux" in os.environ.get("PREFIX", "") or "TERMUX_VERSION" in os.environ


def mem_total_gb() -> float:
    try:
        with open("/proc/meminfo") as f:
            for line in f:
                if line.startswith("MemTotal"):
                    return int(line.split()[1]) / 1024 / 1024
    except OSError:
        pass
    return 0.0


# --------------------------------------------------------------------------
# FFmpeg
# --------------------------------------------------------------------------
class FFmpegError(RuntimeError):
    pass


def ffmpeg_bin() -> str:
    b = shutil.which("ffmpeg")
    if not b:
        raise FFmpegError("No se encontró ffmpeg. En Termux: pkg install ffmpeg")
    return b


def ffprobe_bin() -> str:
    b = shutil.which("ffprobe")
    if not b:
        raise FFmpegError("No se encontró ffprobe (viene con el paquete ffmpeg)")
    return b


def run(cmd: list, cwd=None, timeout=None, input_bytes=None, binary=False) -> subprocess.CompletedProcess:
    """Ejecuta un comando y lanza FFmpegError con el final de stderr si falla."""
    try:
        proc = subprocess.run(
            [str(c) for c in cmd],
            cwd=cwd,
            input=input_bytes,
            capture_output=True,
            timeout=timeout,
        )
    except subprocess.TimeoutExpired as e:
        raise FFmpegError(f"Tiempo agotado: {' '.join(map(str, cmd[:4]))}...") from e
    if proc.returncode != 0:
        tail = proc.stderr.decode("utf-8", "replace")[-1500:]
        raise FFmpegError(f"Falló {Path(str(cmd[0])).name} (código {proc.returncode}):\n{tail}")
    if not binary:
        proc.stdout = proc.stdout.decode("utf-8", "replace")
    proc.stderr = proc.stderr.decode("utf-8", "replace")
    return proc


def ffmpeg(args: list, cwd=None, timeout=None, binary=False) -> subprocess.CompletedProcess:
    return run([ffmpeg_bin(), "-hide_banner", "-nostdin", "-y", *args], cwd=cwd, timeout=timeout, binary=binary)


def probe(path) -> dict:
    out = run([ffprobe_bin(), "-v", "error", "-print_format", "json", "-show_format", "-show_streams", str(path)]).stdout
    data = json.loads(out)
    info = {
        "path": str(path),
        "duration": float(data.get("format", {}).get("duration", 0) or 0),
        "size_bytes": int(data.get("format", {}).get("size", 0) or 0),
        "video": None,
        "audio": None,
        "subtitles": [],
    }
    for s in data.get("streams", []):
        kind = s.get("codec_type")
        if kind == "video" and info["video"] is None and s.get("disposition", {}).get("attached_pic", 0) == 0:
            w, h = int(s.get("width", 0)), int(s.get("height", 0))
            rot = 0
            for sd in s.get("side_data_list", []) or []:
                if "rotation" in sd:
                    rot = int(sd["rotation"])
            rot = int((s.get("tags") or {}).get("rotate", rot))
            if abs(rot) in (90, 270):
                w, h = h, w
            info["video"] = {
                "codec": s.get("codec_name"),
                "width": w,
                "height": h,
                "fps": _rate(s.get("avg_frame_rate")) or _rate(s.get("r_frame_rate")),
                "rotation": rot,
                "duration": float(s.get("duration", 0) or 0),
            }
        elif kind == "audio" and info["audio"] is None:
            info["audio"] = {
                "codec": s.get("codec_name"),
                "sample_rate": int(s.get("sample_rate", 0) or 0),
                "channels": int(s.get("channels", 0) or 0),
            }
        elif kind == "subtitle":
            info["subtitles"].append(
                {"index": s.get("index"), "codec": s.get("codec_name"), "language": (s.get("tags") or {}).get("language")}
            )
    if not info["duration"] and info["video"]:
        info["duration"] = info["video"]["duration"]
    return info


def _rate(r) -> float:
    if not r or r in ("0/0", "0"):
        return 0.0
    try:
        if "/" in r:
            a, b = r.split("/")
            return round(float(a) / float(b), 3) if float(b) else 0.0
        return float(r)
    except ValueError:
        return 0.0


_FILTERS = None
_ENCODERS = None


def has_filter(name: str) -> bool:
    global _FILTERS
    if _FILTERS is None:
        out = run([ffmpeg_bin(), "-hide_banner", "-filters"]).stdout
        _FILTERS = {ln.split()[1] for ln in out.splitlines() if len(ln.split()) > 2 and ln.startswith(" ")}
    return name in _FILTERS


def has_encoder(name: str) -> bool:
    global _ENCODERS
    if _ENCODERS is None:
        out = run([ffmpeg_bin(), "-hide_banner", "-encoders"]).stdout
        _ENCODERS = {ln.split()[1] for ln in out.splitlines() if len(ln.split()) > 2 and ln.startswith(" ")}
    return name in _ENCODERS


def pick_video_encoder(cfg: dict) -> list:
    """Devuelve los argumentos de codificación de vídeo según config y disponibilidad."""
    o = cfg["output"]
    choice = o.get("video_encoder", "auto")
    if choice == "h264_mediacodec" and has_encoder("h264_mediacodec"):
        # Codificador por hardware de Android: rápido, pero no acepta -crf.
        return ["-c:v", "h264_mediacodec", "-b:v", o.get("bitrate", "6M")]
    if choice in ("auto", "libx264") and has_encoder("libx264"):
        return ["-c:v", "libx264", "-preset", o.get("preset", "veryfast"), "-crf", str(o.get("crf", 23))]
    if has_encoder("libopenh264"):
        return ["-c:v", "libopenh264", "-b:v", o.get("bitrate", "6M")]
    return ["-c:v", "mpeg4", "-q:v", "4"]


def find_font(cfg: dict) -> str | None:
    """Busca una fuente TTF. Android trae Roboto en /system/fonts."""
    cands = []
    if cfg.get("font"):
        cands.append(expand(cfg["font"]))
    cands += sorted(glob.glob(str(DIRS["assets"] / "fonts" / "*.[tToO][tT][fF]")))
    cands += [
        "/system/fonts/Roboto-Black.ttf",
        "/system/fonts/Roboto-Bold.ttf",
        "/system/fonts/NotoSans-Bold.ttf",
        "/system/fonts/Roboto-Regular.ttf",
        "/system/fonts/DroidSans-Bold.ttf",
        "/system/fonts/DroidSans.ttf",
    ]
    prefix = os.environ.get("PREFIX", "/usr")
    cands += glob.glob(f"{prefix}/share/fonts/**/DejaVuSans-Bold.ttf", recursive=True)
    cands += glob.glob("/usr/share/fonts/**/DejaVuSans-Bold.ttf", recursive=True)
    cands += glob.glob("/usr/share/fonts/**/*Bold*.ttf", recursive=True)
    for c in cands:
        if c and os.path.isfile(c):
            return c
    if shutil.which("fc-match"):
        try:
            p = run(["fc-match", "-f", "%{file}", "sans:bold"]).stdout.strip()
            if os.path.isfile(p):
                return p
        except FFmpegError:
            pass
    return None


def output_resolution(cfg: dict) -> tuple[int, int]:
    res = str(cfg["output"].get("resolution", "auto")).lower()
    if res != "auto":
        w, h = res.split("x")
        return int(w), int(h)
    # 1080x1920 si el dispositivo tiene memoria suficiente; si no, 720x1280.
    mem = mem_total_gb()
    if mem == 0 or mem >= 3.5:
        return 1080, 1920
    return 720, 1280


def resolve_video(arg: str) -> Path:
    """Acepta ruta absoluta/relativa, nombre en input/ o en el almacenamiento de Android."""
    p = Path(expand(arg))
    if p.is_file():
        return p.resolve()
    for base in (DIRS["input"], Path.home() / "storage" / "downloads", Path.home() / "storage" / "movies",
                 Path.home() / "storage" / "dcim" / "Camera", Path.home() / "storage" / "shared"):
        q = base / arg
        if q.is_file():
            return q.resolve()
    raise FileNotFoundError(f"No encuentro el vídeo '{arg}'. Cópialo a {DIRS['input']} o pasa la ruta completa.")
