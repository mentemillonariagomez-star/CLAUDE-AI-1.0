"""Voz en off. Motores: espeak/espeak-ng (offline, `pkg install espeak`), gTTS (online, `pip install gTTS`)."""
from __future__ import annotations

import shutil
from pathlib import Path

from .common import ffmpeg, probe, warn


def available_engines() -> list[str]:
    out = []
    if shutil.which("espeak-ng") or shutil.which("espeak"):
        out.append("espeak")
    try:
        import gtts  # noqa: F401
        out.append("gtts")
    except ImportError:
        pass
    return out


def synth(text: str, out_wav: Path, cfg: dict) -> float | None:
    """Genera out_wav y devuelve su duración, o None si no hay motor de voz."""
    t = cfg["tts"]
    engine = t.get("engine", "auto")
    if engine == "none":
        return None
    order = [engine] if engine != "auto" else ["espeak", "gtts"]
    txt = out_wav.with_suffix(".txt")
    txt.write_text(text, encoding="utf-8")
    for eng in order:
        try:
            if eng == "espeak":
                b = shutil.which("espeak-ng") or shutil.which("espeak")
                if not b:
                    continue
                raw = out_wav.with_name(out_wav.stem + "_raw.wav")
                from .common import run
                run([b, "-v", t.get("voice", "es"), "-s", str(t.get("speed", 165)), "-f", str(txt), "-w", str(raw)])
            elif eng == "gtts":
                from gtts import gTTS  # type: ignore
                raw = out_wav.with_name(out_wav.stem + "_raw.mp3")
                gTTS(text=text, lang=t.get("voice", "es")[:2]).save(str(raw))
            else:
                continue
            ffmpeg(["-i", str(raw), "-ac", "1", "-ar", "44100", "-af", "silenceremove=start_periods=1:start_threshold=-50dB",
                    str(out_wav)])
            return probe(out_wav)["duration"]
        except Exception as e:  # noqa: BLE001
            warn(f"TTS {eng} falló: {e}")
    return None
