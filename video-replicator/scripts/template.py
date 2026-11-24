"""Convierte un análisis en una plantilla audiovisual reutilizable (JSON editable)."""
from __future__ import annotations

import colorsys
import json
import time
from pathlib import Path

from .common import DIRS, save_json, slugify


def _clamp(x, a, b):
    return max(a, min(b, x))


def _lighten(hexc: str, amount: float) -> str:
    r, g, b = (int(hexc[i:i + 2], 16) / 255 for i in (1, 3, 5))
    h, l, s = colorsys.rgb_to_hls(r, g, b)
    l = _clamp(l + amount, 0, 1)
    r, g, b = colorsys.hls_to_rgb(h, l, s)
    return "#%02x%02x%02x" % (int(r * 255), int(g * 255), int(b * 255))


def build_template(a: dict, name: str | None = None) -> dict:
    p, c = a["pacing"], a.get("color", {})
    comp, t, au, n = a.get("composition", {}), a["text"], a["audio"], a["narrative"]
    trans = a.get("transition_summary", {})
    total_tr = sum(trans.values()) or 1
    soft = trans.get("fade_black", 0) + trans.get("dissolve", 0)
    if soft / total_tr >= 0.3:
        ttype = "fade_black" if trans.get("fade_black", 0) >= trans.get("dissolve", 0) else "dissolve"
    else:
        ttype = "cut"

    palette = [x["hex"] for x in c.get("palette", [])] or ["#101018", "#2a2a40", "#ffffff"]
    # fondos: colores oscuros/medios de la paleta; acento para resaltados
    by_light = sorted(palette, key=lambda h: sum(int(h[i:i + 2], 16) for i in (1, 3, 5)))
    bg = by_light[:3] if len(by_light) >= 3 else by_light + [_lighten(by_light[0], 0.15)]
    accent = c.get("accent", "#ffd400")
    if sum(int(accent[i:i + 2], 16) for i in (1, 3, 5)) < 200:
        accent = _lighten(accent, 0.3)

    text_pos = comp.get("probable_text_position") or "bottom"
    if a["media"]["orientation"] == "vertical" and text_pos == "bottom":
        text_y = 0.68  # fuera de la zona de botones de TikTok/Reels
    else:
        text_y = {"top": 0.18, "middle": 0.5, "bottom": 0.72}.get(text_pos, 0.7)

    bpm = au.get("tempo_bpm") if (au.get("tempo_confidence") or 0) >= 0.15 else None
    wpm = t.get("words_per_minute") if t.get("available") else 150
    tpl = {
        "name": slugify(name or a["name"]),
        "created_at": time.strftime("%Y-%m-%d %H:%M:%S"),
        "source_analysis": a["name"],
        "description": f"Ritmo {p['rhythm']}, {c.get('mood', 'color neutro')}, transición {ttype}",
        "format": {"width": 1080, "height": 1920, "fps": 30},
        "target_duration_sec": round(_clamp(a["media"]["duration"], 8, 180), 1),
        "pacing": {
            "avg_shot_sec": round(_clamp(p["avg_shot_sec"], 0.8, 8), 2),
            "hook_shot_sec": round(_clamp(p["first_shot_sec"], 0.6, 5), 2),
            "shot_pattern": p["shot_pattern"][:12] or [1.0],
            "by_section": p["avg_by_section"],
            "snap_to_beat_bpm": bpm,
        },
        "transitions": {"type": ttype, "duration_sec": 0.25 if ttype != "cut" else 0.0},
        "motion": {
            "level": a["motion"]["level"],
            "ken_burns": a["motion"]["level"] != "bajo",
            "zoom": 1.12 if a["motion"]["level"] == "alto" else 1.07,
        },
        "color": {
            "palette": palette,
            "background_colors": bg,
            "accent": accent,
            "grade": {
                "saturation": round(_clamp(0.7 + c.get("saturation", 0.3) * 1.2, 0.6, 1.5), 3),
                "contrast": round(_clamp(0.85 + c.get("contrast", 0.2) * 0.8, 0.8, 1.35), 3),
                "brightness": round(_clamp((c.get("brightness", 0.45) - 0.45) * 0.25, -0.12, 0.12), 3),
                "warmth": round(_clamp(c.get("warmth", 0.0) * 0.6, -0.25, 0.25), 3),
            },
        },
        "captions": {
            "enabled": True,
            "position_y": text_y,
            "words_per_caption": int(_clamp(round(t.get("avg_words_per_caption", 4) if t.get("available") else 4), 1, 8)),
            "uppercase": (t.get("uppercase_ratio", 0) or 0) > 0.6,
            "font_scale": 0.052,
            "color": "#ffffff",
            "highlight_color": accent,
            "border": 0.006,
            "box": False,
        },
        "narrative": {
            "structure": [{"role": s["role"], "share": s["share"]} for s in n["sections"]],
            "hook_type": t.get("hook_type", "pregunta"),
            "hook_example": t.get("hook_text"),
            "has_cta": n["has_cta"],
            "cta_example": t.get("cta_text"),
            "words_per_minute": round(_clamp(wpm or 150, 90, 220), 1),
        },
        "audio": {
            "target_lufs": round(_clamp(au.get("integrated_lufs") or -14, -24, -9), 1),
            "voiceover": bool(t.get("available")) or au.get("silence_ratio", 1) < 0.5,
            "music_volume": 0.18 if t.get("available") else 0.35,
            "tempo_bpm": au.get("tempo_bpm"),
        },
    }
    return tpl


def save_template(tpl: dict) -> Path:
    path = DIRS["templates"] / f"{tpl['name']}.json"
    save_json(path, tpl)
    return path


def load_template(name_or_path: str) -> dict:
    p = Path(name_or_path)
    if not p.is_file():
        p = DIRS["templates"] / (name_or_path if name_or_path.endswith(".json") else f"{name_or_path}.json")
    if not p.is_file():
        avail = ", ".join(x.stem for x in DIRS["templates"].glob("*.json")) or "ninguna"
        raise FileNotFoundError(f"Plantilla '{name_or_path}' no encontrada. Disponibles: {avail}")
    return json.loads(p.read_text(encoding="utf-8"))


def list_templates() -> list[dict]:
    out = []
    for p in sorted(DIRS["templates"].glob("*.json")):
        try:
            d = json.loads(p.read_text(encoding="utf-8"))
            out.append({"name": p.stem, "description": d.get("description", "")})
        except json.JSONDecodeError:
            out.append({"name": p.stem, "description": "(JSON inválido)"})
    return out
