"""Orquesta el análisis completo de un vídeo de referencia."""
from __future__ import annotations

import shutil
import tempfile
import time
from pathlib import Path

from .audio import run_audio
from .common import DIRS, log, probe, save_json, slugify
from .transcribe import get_cues, narrative_structure, text_analysis
from .visual import run_visual


def analyze_video(video: Path, cfg: dict, name: str | None = None) -> tuple[dict, Path]:
    t0 = time.time()
    name = slugify(name or video.stem)
    ref_dir = DIRS["references"] / name
    if ref_dir.exists():
        shutil.rmtree(ref_dir / "keyframes", ignore_errors=True)
    ref_dir.mkdir(parents=True, exist_ok=True)
    work = Path(tempfile.mkdtemp(prefix="vr_an_", dir=str(DIRS["output"])))
    try:
        log(f"Analizando {video.name}")
        info = probe(video)
        if not info["video"]:
            raise ValueError("El archivo no contiene pista de vídeo")
        v = info["video"]
        log(f"  {v['width']}x{v['height']} · {v['fps']} fps · {info['duration']:.1f} s · audio: {'sí' if info['audio'] else 'no'}")
        visual = run_visual(video, info, work, ref_dir, cfg)
        audio = run_audio(video, info, cfg)
        cues, src = get_cues(video, info, work, cfg)
        if cues:
            save_json(ref_dir / "subtitles.json", cues)
        text = text_analysis(cues, info["duration"], visual["scenes"])
        text["source"] = src
        narrative = narrative_structure(info["duration"], visual["pacing"], text, audio)
        analysis = {
            "name": name,
            "source": str(video),
            "analyzed_at": time.strftime("%Y-%m-%d %H:%M:%S"),
            "elapsed_sec": None,
            "media": {
                "duration": round(info["duration"], 3),
                "width": v["width"],
                "height": v["height"],
                "orientation": "vertical" if v["height"] > v["width"] else ("horizontal" if v["width"] > v["height"] else "cuadrado"),
                "fps": v["fps"],
                "video_codec": v["codec"],
                "audio": info["audio"],
                "size_mb": round(info["size_bytes"] / 1e6, 2),
            },
            **visual,
            "audio": audio,
            "text": text,
            "narrative": narrative,
        }
        analysis["elapsed_sec"] = round(time.time() - t0, 1)
        save_json(ref_dir / "analysis.json", analysis)
        log(f"Análisis guardado en {ref_dir / 'analysis.json'} ({analysis['elapsed_sec']} s)")
        return analysis, ref_dir
    finally:
        shutil.rmtree(work, ignore_errors=True)


def summary(a: dict) -> str:
    p, c, n, t, au = a["pacing"], a.get("color", {}), a["narrative"], a["text"], a["audio"]
    lines = [
        f"Vídeo: {a['media']['width']}x{a['media']['height']} ({a['media']['orientation']}), {a['media']['duration']} s",
        f"Ritmo: {p['scene_count']} planos, media {p['avg_shot_sec']} s ({p['rhythm']}), {p['cuts_per_minute']} cortes/min",
        f"Transiciones: {a['transition_summary'] or 'solo un plano'}",
        f"Movimiento: {a['motion']['level']} ({a['motion']['score']})",
        f"Color: {c.get('mood', '?')} · paleta {', '.join(x['hex'] for x in c.get('palette', [])[:5])}",
        f"Composición: {a.get('composition', {}).get('dominant_layout', '?')}, texto probable: "
        f"{a.get('composition', {}).get('probable_text_position') or 'no detectado'}",
        f"Audio: {au.get('integrated_lufs', '—')} LUFS, tempo {au.get('tempo_bpm') or '—'} BPM, silencio {au.get('silence_ratio', '—')}",
        f"Texto ({t.get('source')}): " + (f"{t['word_count']} palabras, {t['words_per_minute']} ppm, gancho tipo «{t['hook_type']}»"
                                           if t.get("available") else "no disponible"),
        "Estructura: " + " → ".join(f"{s['role']} ({s['start']}-{s['end']} s)" for s in n["sections"]),
    ]
    return "\n".join(lines)
