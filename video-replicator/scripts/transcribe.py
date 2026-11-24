"""Subtítulos y transcripción.

Orden de búsqueda (motor "auto"):
1. Archivo .srt junto al vídeo (mismo nombre).
2. Pista de subtítulos incrustada en el vídeo.
3. whisper.cpp local (compilado en Termux) si existen el binario y el modelo.
4. Servidor remoto (config remote.url) que ejecute Whisper en un PC.
5. API de OpenAI (solo si existe OPENAI_API_KEY).
Si nada está disponible, el análisis continúa sin texto.
"""
from __future__ import annotations

import json
import os
import re
import shutil
import urllib.request
import uuid
from pathlib import Path

from .common import expand, ffmpeg, log, warn

TEXT_SUB_CODECS = {"subrip", "srt", "mov_text", "ass", "ssa", "webvtt", "text"}


def _ts(s: str) -> float:
    s = s.strip().replace(",", ".")
    h, m, sec = s.split(":")
    return int(h) * 3600 + int(m) * 60 + float(sec)


def parse_srt(text: str) -> list[dict]:
    cues = []
    for block in re.split(r"\n\s*\n", text.replace("\r", "").strip()):
        lines = [ln for ln in block.split("\n") if ln.strip()]
        for i, ln in enumerate(lines):
            if "-->" in ln:
                a, b = ln.split("-->")
                body = " ".join(lines[i + 1:])
                body = re.sub(r"<[^>]+>|\{[^}]+\}", "", body).strip()
                if body:
                    cues.append({"start": round(_ts(a), 3), "end": round(_ts(b.split()[0]), 3), "text": body})
                break
    return cues


def _extract_audio(video: Path, out: Path, max_sec: float, fmt: str = "wav") -> Path:
    args = ["-t", str(max_sec), "-i", str(video), "-vn", "-sn", "-ac", "1", "-ar", "16000"]
    args += ["-c:a", "pcm_s16le"] if fmt == "wav" else ["-c:a", "aac", "-b:a", "48k"]
    ffmpeg(args + [str(out)])
    return out


def whisper_cpp_available(cfg: dict) -> bool:
    t = cfg["transcription"]
    b = expand(t["whisper_cpp_bin"])
    return (os.path.isfile(b) or bool(shutil.which(b))) and os.path.isfile(expand(t["whisper_cpp_model"]))


def _whisper_cpp(video: Path, work: Path, cfg: dict, max_sec: float) -> list[dict]:
    t = cfg["transcription"]
    wav = _extract_audio(video, work / "audio16k.wav", max_sec)
    out_base = work / "whisper"
    from .common import run
    run([expand(t["whisper_cpp_bin"]), "-m", expand(t["whisper_cpp_model"]), "-f", str(wav),
         "-l", t.get("language", "auto"), "-t", str(cfg["performance"]["threads"]),
         "-osrt", "-of", str(out_base), "-np"], timeout=max_sec * 20 + 120)
    return parse_srt((work / "whisper.srt").read_text(encoding="utf-8", errors="replace"))


def _openai(video: Path, work: Path, cfg: dict, max_sec: float) -> list[dict]:
    audio = _extract_audio(video, work / "audio.m4a", max_sec, fmt="m4a")
    boundary = uuid.uuid4().hex
    fields = {"model": cfg["transcription"].get("openai_model", "whisper-1"), "response_format": "srt"}
    lang = cfg["transcription"].get("language", "auto")
    if lang and lang != "auto":
        fields["language"] = lang
    body = b""
    for k, v in fields.items():
        body += f"--{boundary}\r\nContent-Disposition: form-data; name=\"{k}\"\r\n\r\n{v}\r\n".encode()
    body += (f"--{boundary}\r\nContent-Disposition: form-data; name=\"file\"; filename=\"audio.m4a\"\r\n"
             "Content-Type: audio/mp4\r\n\r\n").encode() + audio.read_bytes() + f"\r\n--{boundary}--\r\n".encode()
    req = urllib.request.Request(
        "https://api.openai.com/v1/audio/transcriptions", data=body, method="POST",
        headers={"Authorization": f"Bearer {os.environ['OPENAI_API_KEY']}",
                 "Content-Type": f"multipart/form-data; boundary={boundary}"})
    with urllib.request.urlopen(req, timeout=600) as r:
        return parse_srt(r.read().decode("utf-8", "replace"))


def _remote(video: Path, work: Path, cfg: dict, max_sec: float) -> list[dict]:
    from .remote import RemoteClient
    wav = _extract_audio(video, work / "audio16k.wav", max_sec)
    return RemoteClient(cfg).transcribe(wav)


def get_cues(video: Path, info: dict, work: Path, cfg: dict) -> tuple[list[dict], str]:
    side = video.with_suffix(".srt")
    if side.is_file():
        log(f"Subtítulos externos: {side.name}")
        return parse_srt(side.read_text(encoding="utf-8", errors="replace")), "srt_externo"

    for s in info.get("subtitles", []):
        if s["codec"] in TEXT_SUB_CODECS:
            try:
                out = work / "embedded.srt"
                ffmpeg(["-i", str(video), "-map", f"0:{s['index']}", "-f", "srt", str(out)])
                cues = parse_srt(out.read_text(encoding="utf-8", errors="replace"))
                if cues:
                    log(f"Subtítulos incrustados ({s['codec']}): {len(cues)} líneas")
                    return cues, "incrustados"
            except Exception as e:  # noqa: BLE001
                warn(f"No se pudieron extraer subtítulos incrustados: {e}")

    if not info.get("audio"):
        return [], "sin_audio"
    engine = cfg["transcription"].get("engine", "auto")
    max_sec = min(info["duration"] or 1e9, cfg["performance"]["max_transcribe_sec"])
    order = [engine] if engine != "auto" else ["whisper_cpp", "remote", "openai"]
    for eng in order:
        try:
            if eng == "none":
                return [], "desactivada"
            if eng == "whisper_cpp" and whisper_cpp_available(cfg):
                log("Transcribiendo con whisper.cpp (local)…")
                return _whisper_cpp(video, work, cfg, max_sec), "whisper_cpp"
            if eng == "remote" and cfg["remote"].get("url"):
                log("Transcribiendo en el servidor remoto…")
                return _remote(video, work, cfg, max_sec), "remoto"
            if eng == "openai" and os.environ.get("OPENAI_API_KEY"):
                log("Transcribiendo con la API de OpenAI…")
                return _openai(video, work, cfg, max_sec), "openai_api"
        except Exception as e:  # noqa: BLE001
            warn(f"Transcripción con {eng} falló: {e}")
    warn("Sin transcripción: no hay subtítulos ni motor Whisper disponible (ver README).")
    return [], "no_disponible"


# --------------------------------------------------------------------------
# Análisis de subtítulos y estructura narrativa
# --------------------------------------------------------------------------
CTA_WORDS = ["sígueme", "sigueme", "suscríbete", "suscribete", "comenta", "comparte", "guarda", "like",
             "link", "enlace", "descarga", "follow", "subscribe", "comment", "share", "save", "bio", "dale"]


def _words(text: str) -> list[str]:
    return re.findall(r"[\wáéíóúüñÁÉÍÓÚÜÑ']+", text)


def text_analysis(cues: list[dict], duration: float, scenes: list[dict]) -> dict:
    if not cues:
        return {"available": False}
    words = [w for c in cues for w in _words(c["text"])]
    speech = sum(c["end"] - c["start"] for c in cues)
    full = " ".join(c["text"] for c in cues)
    letters = [ch for ch in full if ch.isalpha()]
    upper_ratio = sum(ch.isupper() for ch in letters) / max(1, len(letters))
    wpc = [len(_words(c["text"])) for c in cues]
    hook_cues = [c for c in cues if c["start"] < 3.5] or cues[:1]
    hook = " ".join(c["text"] for c in hook_cues)
    tail = [c for c in cues if c["start"] >= duration * 0.8]
    tail_text = " ".join(c["text"] for c in tail).lower()
    cta = next((w for w in CTA_WORDS if w in tail_text), None)
    if "?" in hook or "¿" in hook:
        hook_type = "pregunta"
    elif re.search(r"\d", hook):
        hook_type = "dato/número"
    elif re.match(r"^\s*(no|nunca|deja|para|mira|escucha|stop|never)\b", hook.lower()):
        hook_type = "orden/contraste"
    else:
        hook_type = "afirmación"
    # cortes que coinciden con el inicio de una frase
    starts = [c["start"] for c in cues]
    aligned = sum(1 for s in scenes[1:] if any(abs(s["start"] - t) < 0.3 for t in starts))
    return {
        "available": True,
        "cue_count": len(cues),
        "word_count": len(words),
        "words_per_minute": round(len(words) / max(speech, 0.001) * 60, 1),
        "speech_coverage": round(speech / max(duration, 0.001), 3),
        "avg_words_per_caption": round(sum(wpc) / len(wpc), 2),
        "avg_caption_sec": round(speech / len(cues), 2),
        "uppercase_ratio": round(upper_ratio, 3),
        "hook_text": hook[:300],
        "hook_type": hook_type,
        "cta_keyword": cta,
        "cta_text": " ".join(c["text"] for c in tail)[:300] if cta else None,
        "cuts_aligned_with_sentences": round(aligned / max(1, len(scenes) - 1), 3),
        "transcript": full[:6000],
    }


def narrative_structure(duration: float, pacing: dict, text: dict, audio: dict) -> dict:
    hook_end = min(pacing.get("first_shot_sec") or 3, 3.5)
    if text.get("available") and text.get("hook_text"):
        hook_end = max(hook_end, min(4.0, duration * 0.15))
    outro_start = duration * (0.85 if text.get("cta_keyword") else 0.9)
    sections = [
        {"role": "hook", "start": 0.0, "end": round(hook_end, 2)},
        {"role": "desarrollo", "start": round(hook_end, 2), "end": round(outro_start, 2)},
        {"role": "cta" if text.get("cta_keyword") else "cierre", "start": round(outro_start, 2), "end": round(duration, 2)},
    ]
    peak = audio.get("energy_peak_sec")
    if peak is not None and hook_end < peak < outro_start:
        sections.insert(2, {"role": "clímax", "start": round(peak, 2), "end": round(min(peak + 2, outro_start), 2)})
    for s in sections:
        s["share"] = round((s["end"] - s["start"]) / max(duration, 0.001), 3)
    return {
        "sections": sections,
        "hook_sec": round(hook_end, 2),
        "has_cta": bool(text.get("cta_keyword")),
        "method": "transcripción + ritmo" if text.get("available") else "ritmo visual + energía de audio",
    }


def load_cues_json(path: Path) -> list[dict]:
    return json.loads(path.read_text(encoding="utf-8"))
