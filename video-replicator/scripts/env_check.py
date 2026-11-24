"""Verifica qué herramientas funcionan en este dispositivo (Termux u otro Linux)."""
from __future__ import annotations

import os
import platform
import shutil
import sys
from pathlib import Path

from .common import (DIRS, FFmpegError, find_font, has_encoder, has_filter, is_termux, mem_total_gb,
                     output_resolution, run, save_json)
from .transcribe import whisper_cpp_available
from .tts import available_engines

REQUIRED_FILTERS = ["scale", "fps", "signalstats", "select", "metadata", "silencedetect", "ebur128",
                    "drawtext", "eq", "fade", "concat", "amix", "loudnorm", "apad", "atrim", "adelay"]
OPTIONAL_FILTERS = ["gradients", "colorbalance", "sidechaincompress", "tile", "drawbox"]


def check(cfg: dict) -> dict:
    r = {"termux": is_termux(), "platform": platform.platform(), "machine": platform.machine(),
         "python": sys.version.split()[0], "cpu_cores": os.cpu_count(), "ram_gb": round(mem_total_gb(), 2)}
    ok = sys.version_info >= (3, 9)
    items = [("Python ≥ 3.9", ok, r["python"])]

    ff = shutil.which("ffmpeg")
    if ff:
        try:
            ver = run([ff, "-version"]).stdout.splitlines()[0]
        except FFmpegError:
            ver = "?"
        items.append(("FFmpeg", True, ver))
        items.append(("FFprobe", bool(shutil.which("ffprobe")), shutil.which("ffprobe") or "falta"))
        missing = [f for f in REQUIRED_FILTERS if not has_filter(f)]
        items.append(("Filtros FFmpeg necesarios", not missing, "todos" if not missing else "faltan: " + ", ".join(missing)))
        opt_missing = [f for f in OPTIONAL_FILTERS if not has_filter(f)]
        items.append(("Filtros opcionales", True, "todos" if not opt_missing else "sin: " + ", ".join(opt_missing)))
        enc = [e for e in ("libx264", "h264_mediacodec", "libopenh264", "mpeg4", "aac") if has_encoder(e)]
        items.append(("Codificadores", "aac" in enc and len(enc) > 1, ", ".join(enc)))
    else:
        items.append(("FFmpeg", False, "no instalado → pkg install ffmpeg"))

    try:
        import numpy  # noqa: F401
        items.append(("NumPy (opcional)", True, numpy.__version__))
    except ImportError:
        items.append(("NumPy (opcional)", None, "no instalado; no es necesario"))
    try:
        import cv2  # type: ignore
        haar = bool(getattr(getattr(cv2, "data", None), "haarcascades", None))
        items.append(("OpenCV (opcional)", True, f"{cv2.__version__}{' + caras' if haar else ' (sin cascadas de caras)'}"))
    except Exception:  # noqa: BLE001
        items.append(("OpenCV (opcional)", None, "no disponible; se usa el análisis sin OpenCV"))

    tts = available_engines()
    items.append(("Voz (TTS)", bool(tts) or None, ", ".join(tts) if tts else "ninguno → pkg install espeak"))
    items.append(("whisper.cpp", whisper_cpp_available(cfg) or None,
                  "listo" if whisper_cpp_available(cfg) else "no encontrado (opcional, ver README)"))
    items.append(("Servidor remoto", bool(cfg["remote"].get("url")) or None, cfg["remote"].get("url") or "no configurado"))
    items.append(("API OpenAI (transcripción)", bool(os.environ.get("OPENAI_API_KEY")) or None,
                  "clave presente" if os.environ.get("OPENAI_API_KEY") else "sin clave (opcional)"))
    try:
        import anthropic  # noqa: F401
        items.append(("SDK anthropic (guiones IA)", True, "instalado"))
    except ImportError:
        items.append(("SDK anthropic (guiones IA)", None, "no instalado (opcional)"))
    font = find_font(cfg)
    items.append(("Fuente para subtítulos", bool(font), font or "ninguna → copia un .ttf a assets/fonts/"))
    storage = Path.home() / "storage" / "shared"
    if r["termux"]:
        items.append(("Acceso al almacenamiento", storage.exists(),
                      str(storage) if storage.exists() else "ejecuta termux-setup-storage"))
    if shutil.which("termux-media-scan"):
        items.append(("Termux:API", True, "termux-media-scan disponible"))
    W, H = output_resolution(cfg)
    items.append(("Resolución de salida", True, f"{W}x{H}" + (" (reducida por poca RAM)" if W < 1080 else "")))

    r["checks"] = [{"name": n, "ok": o, "detail": d} for n, o, d in items]
    r["ready_analysis"] = bool(ff) and all(c["ok"] for c in r["checks"][:5] if c["ok"] is not None)
    r["ready_render"] = r["ready_analysis"] and bool(font)
    save_json(DIRS["config"] / "env.json", r)
    return r


def print_report(r: dict) -> None:
    print(f"\nEntorno: {'Termux (Android)' if r['termux'] else r['platform']} · {r['machine']} · "
          f"{r['cpu_cores']} núcleos · {r['ram_gb']} GB RAM\n")
    for c in r["checks"]:
        mark = "✔" if c["ok"] else ("·" if c["ok"] is None else "✘")
        print(f"  {mark} {c['name']:<30} {c['detail']}")
    print(f"\nAnálisis: {'LISTO' if r['ready_analysis'] else 'NO DISPONIBLE'} · "
          f"Generación: {'LISTA' if r['ready_render'] else 'NO DISPONIBLE'}")
    print("(✔ funciona · · opcional ausente · ✘ necesario y falta)\n")
