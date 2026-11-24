"""Análisis de audio: sonoridad (LUFS), silencios, energía y tempo aproximado."""
from __future__ import annotations

import array
import math
import re
import statistics
from pathlib import Path

from .common import ffmpeg, log, warn


def loudness_and_silence(video: Path, max_sec: float) -> dict:
    proc = ffmpeg(["-nostats", "-t", str(max_sec), "-i", str(video), "-vn", "-sn",
                   "-af", "silencedetect=n=-35dB:d=0.35,ebur128", "-f", "null", "-"])
    err = proc.stderr
    lufs = None
    m = re.findall(r"I:\s+(-?[\d.]+)\s+LUFS", err)
    if m:
        lufs = float(m[-1])
    lra = re.findall(r"LRA:\s+(-?[\d.]+)\s+LU", err)
    starts = [float(x) for x in re.findall(r"silence_start:\s*(-?[\d.]+)", err)]
    durs = [float(x) for x in re.findall(r"silence_duration:\s*([\d.]+)", err)]
    return {"integrated_lufs": lufs, "lra": float(lra[-1]) if lra else None,
            "silences": [{"start": round(s, 2), "duration": round(d, 2)} for s, d in zip(starts, durs)]}


def energy_and_tempo(video: Path, max_sec: float) -> dict:
    sr, hop = 8000, 400  # ventanas de 50 ms
    raw = ffmpeg(["-t", str(max_sec), "-i", str(video), "-vn", "-sn", "-ac", "1", "-ar", str(sr),
                  "-f", "s16le", "pipe:1"], binary=True).stdout
    samples = array.array("h")
    samples.frombytes(raw[: len(raw) // 2 * 2])
    n = len(samples) // hop
    if n < 40:
        return {}
    rms = []
    for i in range(n):
        seg = samples[i * hop:(i + 1) * hop]
        rms.append(math.sqrt(sum(s * s for s in seg) / hop) / 32768)
    onset = [max(0.0, rms[i] - rms[i - 1]) for i in range(1, n)]
    mean_o = statistics.mean(onset)
    o = [x - mean_o for x in onset]
    fps = sr / hop  # 20 ventanas por segundo
    best_lag, best_val = None, 0.0
    zero = sum(x * x for x in o) or 1e-9
    ac = {}
    for lag in range(int(fps * 60 / 200), int(fps * 60 / 60) + 1):  # 60–200 BPM
        ac[lag] = sum(o[i] * o[i + lag] for i in range(len(o) - lag)) / zero
        if ac[lag] > best_val:
            best_lag, best_val = lag, ac[lag]
    bpm = None
    if best_lag:
        # interpolación parabólica para afinar el periodo
        a, b, c = ac.get(best_lag - 1, best_val), best_val, ac.get(best_lag + 1, best_val)
        den = a - 2 * b + c
        shift = 0.5 * (a - c) / den if den else 0.0
        bpm = 60 * fps / (best_lag + shift)
        while bpm < 80:
            bpm *= 2
        while bpm > 180:
            bpm /= 2
    # curva de energía por segundo (normalizada)
    per_sec = [statistics.mean(rms[i:i + int(fps)]) for i in range(0, n, int(fps))]
    peak = max(per_sec) or 1e-9
    curve = [round(x / peak, 3) for x in per_sec]
    return {
        "tempo_bpm": round(bpm, 1) if bpm else None,
        "tempo_confidence": round(best_val, 3),
        "energy_curve": curve,
        "energy_peak_sec": curve.index(1.0) if 1.0 in curve else None,
    }


def run_audio(video: Path, info: dict, cfg: dict) -> dict:
    if not info.get("audio"):
        return {"present": False}
    log("Analizando audio (sonoridad, silencios, tempo)…")
    max_sec = min(info["duration"] or 1e9, cfg["performance"]["max_audio_analysis_sec"])
    out = {"present": True, "analyzed_sec": round(max_sec, 2)}
    try:
        out.update(loudness_and_silence(video, max_sec))
    except Exception as e:  # noqa: BLE001
        warn(f"Sonoridad no disponible: {e}")
    try:
        out.update(energy_and_tempo(video, max_sec))
    except Exception as e:  # noqa: BLE001
        warn(f"Tempo no disponible: {e}")
    sil = sum(s["duration"] for s in out.get("silences", []))
    out["silence_ratio"] = round(sil / max(max_sec, 0.001), 3)
    return out
