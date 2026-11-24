"""Guiones: lectura de archivos de guion y generación a partir de un tema.

Formato de guion en texto (input/*.txt):

    # Título opcional
    HOOK: ¿Sabías que tu móvil puede editar vídeos como un estudio?
    [asset: playa.jpg]
    Primer bloque del desarrollo.

    Segundo bloque del desarrollo.

    CTA: Sígueme para más trucos.

Cada párrafo (separado por línea en blanco) es un segmento. Las etiquetas
HOOK:, CTA: o CIERRE: marcan su función. [asset: archivo] fija el fondo del
segmento con un archivo de assets/.

Generación con IA: si el SDK `anthropic` está instalado y hay credenciales
(ANTHROPIC_API_KEY), se pide el guion a Claude. Si no, se crea un borrador
local con la estructura de la plantilla para que lo completes tú.
"""
from __future__ import annotations

import json
import re
from pathlib import Path

from .common import log, warn

ROLE_TAGS = {"hook": "hook", "gancho": "hook", "cta": "cta", "cierre": "cierre", "desarrollo": "desarrollo"}


def parse_script_text(text: str) -> dict:
    title = None
    segments = []
    for block in re.split(r"\n\s*\n", text.replace("\r", "").strip()):
        lines = []
        role, asset = None, None
        for ln in block.split("\n"):
            s = ln.strip()
            if not s:
                continue
            if s.startswith("#"):
                title = title or s.lstrip("#").strip()
                continue
            m = re.match(r"^\[(?:asset|imagen|video|fondo)\s*:\s*(.+?)\]$", s, re.I)
            if m:
                asset = m.group(1).strip()
                continue
            m = re.match(r"^(HOOK|GANCHO|CTA|CIERRE|DESARROLLO)\s*:\s*(.*)$", s, re.I)
            if m:
                role = ROLE_TAGS[m.group(1).lower()]
                s = m.group(2).strip()
            if s:
                lines.append(s)
        if lines:
            segments.append({"role": role, "text": " ".join(lines), "asset": asset})
    for i, seg in enumerate(segments):
        if not seg["role"]:
            seg["role"] = "hook" if i == 0 else "desarrollo"
    return {"title": title or (segments[0]["text"][:60] if segments else "video"), "segments": segments}


def load_script(path: Path) -> dict:
    text = path.read_text(encoding="utf-8")
    if path.suffix.lower() == ".json":
        data = json.loads(text)
        for s in data.get("segments", []):
            s.setdefault("role", "desarrollo")
            s.setdefault("asset", None)
        return data
    return parse_script_text(text)


def script_to_text(script: dict) -> str:
    out = [f"# {script.get('title', '')}".rstrip()]
    for s in script["segments"]:
        prefix = {"hook": "HOOK: ", "cta": "CTA: ", "cierre": "CIERRE: "}.get(s.get("role"), "")
        block = (f"[asset: {s['asset']}]\n" if s.get("asset") else "") + prefix + s["text"]
        out.append(block)
    return "\n\n".join(out) + "\n"


def _plan(template: dict, duration: float | None) -> dict:
    dur = duration or template.get("target_duration_sec", 30)
    wpm = template["narrative"].get("words_per_minute", 150)
    words = int(dur * wpm / 60)
    body = max(2, min(8, round(dur / max(template["pacing"]["avg_shot_sec"] * 2.5, 3))))
    return {"duration": dur, "total_words": words, "body_segments": body}


# --------------------------------------------------------------------------
# Borrador local (sin IA)
# --------------------------------------------------------------------------
def local_draft(topic: str, template: dict, duration: float | None = None) -> dict:
    plan = _plan(template, duration)
    n = template["narrative"]
    topic = topic[:1].lower() + topic[1:] if topic[:2].istitle() else topic
    hooks = {
        "pregunta": f"¿Sabías esto sobre {topic}?",
        "dato/número": f"3 cosas sobre {topic} que casi nadie conoce",
        "orden/contraste": f"Deja de ignorar esto sobre {topic}",
        "afirmación": f"Esto va a cambiar cómo ves {topic}",
    }
    segs = [{"role": "hook", "text": hooks.get(n.get("hook_type"), hooks["pregunta"]), "asset": None}]
    per = max(8, (plan["total_words"] - 20) // plan["body_segments"])
    for i in range(plan["body_segments"]):
        segs.append({"role": "desarrollo",
                     "text": f"Punto {i + 1} sobre {topic}: escribe aquí unas {per} palabras con la idea principal.",
                     "asset": None})
    if n.get("has_cta", True):
        segs.append({"role": "cta", "text": "Sígueme para más contenido como este.", "asset": None})
    else:
        segs.append({"role": "cierre", "text": f"Y así es como {topic} puede marcar la diferencia.", "asset": None})
    return {"title": topic, "segments": segs, "generated_by": "borrador_local"}


# --------------------------------------------------------------------------
# Claude (opcional)
# --------------------------------------------------------------------------
def claude_script(topic: str, template: dict, cfg: dict, duration: float | None = None, notes: str = "") -> dict:
    import anthropic  # importación diferida: el SDK es opcional

    plan = _plan(template, duration)
    n = template["narrative"]
    lang = cfg.get("language", "es")
    prompt = f"""Escribe el guion de un vídeo vertical corto (TikTok/Reels) sobre: «{topic}».
Idioma: {lang}. Duración objetivo: {plan['duration']:.0f} segundos (unas {plan['total_words']} palabras en total).

Imita la estructura narrativa de un vídeo de referencia:
- Gancho de tipo «{n.get('hook_type')}». Ejemplo del original (solo como referencia de estilo, no lo copies): {n.get('hook_example') or '—'}
- Estructura: {', '.join(f"{s['role']} {int(s['share'] * 100)}%" for s in n.get('structure', []))}
- {plan['body_segments']} bloques de desarrollo, cada uno una idea concreta y verificable.
- {'Termina con una llamada a la acción breve. Ejemplo del original: ' + (n.get('cta_example') or '') if n.get('has_cta') else 'Termina con una frase de cierre, sin llamada a la acción.'}
- Frases cortas, para ser leídas en voz alta a unas {n.get('words_per_minute')} palabras por minuto.
{('Notas del autor: ' + notes) if notes else ''}

Responde SOLO con JSON válido, sin texto adicional, con esta forma:
{{"title": "...", "segments": [{{"role": "hook|desarrollo|cta|cierre", "text": "..."}}]}}"""

    client = anthropic.Anthropic()
    resp = client.beta.messages.create(
        model=cfg["script_ai"].get("model", "claude-opus-5-5"),
        max_tokens=16000,
        betas=["server-side-fallback-2026-07-01"],
        fallbacks="default",
        output_config={"effort": "low"},
        messages=[{"role": "user", "content": prompt}],
    )
    if resp.stop_reason == "refusal":
        raise RuntimeError("El modelo rechazó la petición")
    text = "".join(b.text for b in resp.content if b.type == "text")
    m = re.search(r"\{.*\}", text, re.S)
    if not m:
        raise ValueError("La respuesta no contiene JSON")
    data = json.loads(m.group(0))
    segs = [{"role": s.get("role", "desarrollo"), "text": s["text"].strip(), "asset": None}
            for s in data.get("segments", []) if s.get("text")]
    if not segs:
        raise ValueError("Guion vacío")
    return {"title": data.get("title", topic), "segments": segs, "generated_by": "claude"}


def generate_script(topic: str, template: dict, cfg: dict, duration: float | None = None, notes: str = "") -> dict:
    engine = cfg["script_ai"].get("engine", "auto")
    if engine in ("auto", "claude"):
        try:
            import anthropic  # noqa: F401
        except ImportError:
            if engine == "claude":
                warn("El SDK 'anthropic' no está instalado (pip install anthropic)")
        else:
            try:
                log("Generando guion con Claude…")
                return claude_script(topic, template, cfg, duration, notes)
            except Exception as e:  # noqa: BLE001 - cualquier fallo cae al borrador local
                warn(f"No se pudo generar con Claude ({type(e).__name__}: {e}); uso borrador local")
    log("Creando borrador de guion local (edítalo antes de renderizar para un mejor resultado)")
    return local_draft(topic, template, duration)
