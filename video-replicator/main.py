#!/usr/bin/env python3
"""VIDEO REPLICATOR AI: analiza un vídeo de referencia y genera vídeos nuevos con su estilo.

Uso rápido:
    python main.py check
    python main.py analyze input/mi_video.mp4
    python main.py script --template mi_video --tema "Cómo ahorrar batería"
    python main.py generate --template mi_video --script input/guion.txt
    python main.py replicate input/mi_video.mp4 --tema "Cómo ahorrar batería"
"""
from __future__ import annotations

import argparse
import json
import shutil
import sys
import time
from pathlib import Path

from scripts.common import DIRS, FFmpegError, load_config, log, resolve_video, save_json, slugify, warn


def _scan_media(path: Path) -> None:
    """En Termux, avisa a la galería de Android de que hay un vídeo nuevo."""
    if shutil.which("termux-media-scan"):
        import subprocess
        subprocess.run(["termux-media-scan", str(path)], capture_output=True)


def _export(path: Path, dest: str | None) -> None:
    if not dest:
        return
    d = Path(dest).expanduser()
    d.mkdir(parents=True, exist_ok=True)
    target = d / path.name
    shutil.copy2(path, target)
    _scan_media(target)
    log(f"Copiado a {target}")


def cmd_check(args, cfg):
    from scripts.env_check import check, print_report
    r = check(cfg)
    print_report(r)
    return 0 if r["ready_analysis"] else 1


def do_analyze(video_arg: str, cfg: dict, name: str | None, remote: bool) -> dict:
    from scripts.analyze import analyze_video, summary
    from scripts.template import build_template, save_template
    video = resolve_video(video_arg)
    name = slugify(name or video.stem)
    if remote:
        from scripts.remote import RemoteClient
        res = RemoteClient(cfg).analyze(video, name)
        analysis, tpl = res["analysis"], res["template"]
        save_json(DIRS["references"] / name / "analysis.json", analysis)
    else:
        analysis, _ = analyze_video(video, cfg, name)
        tpl = build_template(analysis, name)
    path = save_template(tpl)
    print("\n" + summary(analysis))
    log(f"Plantilla guardada: {path}")
    return tpl


def cmd_analyze(args, cfg):
    do_analyze(args.video, cfg, args.name, args.remote)
    return 0


def cmd_templates(args, cfg):
    from scripts.template import list_templates, load_template
    if args.show:
        print(json.dumps(load_template(args.show), ensure_ascii=False, indent=2))
        return 0
    items = list_templates()
    if not items:
        print("No hay plantillas. Crea una con: python main.py analyze <video>")
    for t in items:
        print(f"  {t['name']:<30} {t['description']}")
    return 0


def _get_script(args, cfg, tpl) -> dict:
    script = _load_or_generate(args, cfg, tpl)
    ov = script.setdefault("overlays", {})
    if getattr(args, "titulo", None):
        ov["title"] = args.titulo
    if getattr(args, "etiqueta", None):
        ov["label"] = args.etiqueta
    return script


def _load_or_generate(args, cfg, tpl) -> dict:
    from scripts.script_gen import generate_script, load_script, script_to_text
    if args.script:
        p = Path(args.script).expanduser()
        if not p.is_file():
            p = DIRS["input"] / args.script
        return load_script(p)
    if not args.tema:
        raise SystemExit("Indica --script archivo.txt o --tema \"...\"")
    script = generate_script(args.tema, tpl, cfg, args.duracion, args.notas or "")
    out = DIRS["input"] / f"guion_{slugify(args.tema)}.txt"
    out.write_text(script_to_text(script), encoding="utf-8")
    log(f"Guion guardado en {out} (puedes editarlo y volver a generar con --script)")
    return script


def cmd_script(args, cfg):
    from scripts.template import load_template
    args.script = None
    _get_script(args, cfg, load_template(args.template))
    return 0


def _apply_overrides(args, cfg):
    if getattr(args, "res", None):
        cfg["output"]["resolution"] = args.res
    if getattr(args, "sin_voz", False):
        cfg["tts"]["engine"] = "none"
    if getattr(args, "musica", None):
        cfg["music"]["file"] = args.musica


def do_generate(args, cfg, tpl) -> Path:
    from scripts.render import render
    script = _get_script(args, cfg, tpl)
    if getattr(args, "sin_subtitulos", False):
        tpl["captions"]["enabled"] = False
    out = Path(args.out).expanduser() if args.out else None
    if args.remote:
        from scripts.remote import RemoteClient
        out = out or DIRS["output"] / f"{slugify(script.get('title', 'video'))}_{time.strftime('%Y%m%d_%H%M%S')}.mp4"
        path = RemoteClient(cfg).render(script, tpl, out)
        log(f"Listo (renderizado remoto): {path}")
    else:
        path = render(script, tpl, cfg, out, keep=args.keep)
    _export(path, args.exportar)
    return path


def cmd_generate(args, cfg):
    from scripts.template import load_template
    _apply_overrides(args, cfg)
    do_generate(args, cfg, load_template(args.template))
    return 0


def cmd_replicate(args, cfg):
    _apply_overrides(args, cfg)
    tpl = do_analyze(args.video, cfg, args.name, args.remote)
    do_generate(args, cfg, tpl)
    return 0


def cmd_serve(args, cfg):
    from scripts.remote import serve
    serve(cfg, args.host, args.port, args.token or cfg["remote"].get("token", ""))
    return 0


def cmd_demo(args, cfg):
    """Prueba de extremo a extremo con un vídeo sintético (no necesita archivos propios)."""
    sys.path.insert(0, str(Path(__file__).parent))
    from tests.make_sample import make_assets, make_sample
    sample = make_sample(DIRS["input"] / "muestra_referencia.mp4")
    if args.assets:
        make_assets()
    tpl = do_analyze(str(sample), cfg, "muestra", False)
    demo = DIRS["input"] / "guion_demo.txt"
    if not demo.exists():
        demo.write_text(
            "# Edita vídeos en tu móvil\n\n"
            "HOOK: ¿Tu móvil puede crear vídeos como un profesional?\n\n"
            "Graba planos cortos, de tres a cinco segundos, con buena luz.\n\n"
            "Corta siempre al ritmo de la música para mantener la atención.\n\n"
            "Usa textos grandes y colores que contrasten con el fondo.\n\n"
            "CTA: Sígueme para más trucos de edición.\n", encoding="utf-8")
    ns = argparse.Namespace(script=str(demo), tema=None, duracion=None, notas=None, out=None,
                            remote=False, keep=False, exportar=None, titulo=None, etiqueta=None)
    do_generate(ns, cfg, tpl)
    return 0


def build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(prog="video-replicator", description="VIDEO REPLICATOR AI para Termux/Android")
    sub = p.add_subparsers(dest="cmd", required=True)

    sub.add_parser("check", help="verifica herramientas disponibles").set_defaults(fn=cmd_check)

    a = sub.add_parser("analyze", help="analiza un vídeo y crea su plantilla")
    a.add_argument("video")
    a.add_argument("--name", help="nombre de la plantilla")
    a.add_argument("--remote", action="store_true", help="analizar en el servidor remoto")
    a.set_defaults(fn=cmd_analyze)

    t = sub.add_parser("templates", help="lista o muestra plantillas")
    t.add_argument("--show", metavar="NOMBRE")
    t.set_defaults(fn=cmd_templates)

    def gen_opts(x, need_template=True):
        if need_template:
            x.add_argument("--template", "-t", required=True)
        x.add_argument("--script", "-s", help="archivo de guion (.txt o .json)")
        x.add_argument("--tema", help="tema para generar el guion")
        x.add_argument("--duracion", type=float, help="duración objetivo en segundos")
        x.add_argument("--notas", help="indicaciones extra para el guion")
        x.add_argument("--out", "-o", help="archivo de salida .mp4")
        x.add_argument("--res", help="resolución, p. ej. 1080x1920 o 720x1280")
        x.add_argument("--musica", help="archivo de música")
        x.add_argument("--titulo", help="texto de la caja de título fija (si la plantilla la tiene)")
        x.add_argument("--etiqueta", help="texto de la etiqueta fija, p. ej. \"PARTE 5\"")
        x.add_argument("--sin-voz", action="store_true")
        x.add_argument("--sin-subtitulos", action="store_true")
        x.add_argument("--exportar", help="copia el resultado a esta carpeta (p. ej. ~/storage/movies)")
        x.add_argument("--remote", action="store_true", help="renderizar en el servidor remoto")
        x.add_argument("--keep", action="store_true", help="conservar archivos intermedios")

    s = sub.add_parser("script", help="genera un guion a partir de un tema")
    s.add_argument("--template", "-t", required=True)
    s.add_argument("--tema", required=True)
    s.add_argument("--duracion", type=float)
    s.add_argument("--notas")
    s.set_defaults(fn=cmd_script)

    g = sub.add_parser("generate", help="genera un vídeo con una plantilla")
    gen_opts(g)
    g.set_defaults(fn=cmd_generate)

    r = sub.add_parser("replicate", help="analiza + genera en un solo paso")
    r.add_argument("video")
    r.add_argument("--name")
    gen_opts(r, need_template=False)
    r.set_defaults(fn=cmd_replicate)

    sv = sub.add_parser("serve", help="servidor para procesar en un PC")
    sv.add_argument("--host", default="0.0.0.0")
    sv.add_argument("--port", type=int, default=8765)
    sv.add_argument("--token")
    sv.set_defaults(fn=cmd_serve)

    d = sub.add_parser("demo", help="prueba completa con un vídeo sintético")
    d.add_argument("--assets", action="store_true", help="crear también imágenes/vídeo/música de prueba")
    d.set_defaults(fn=cmd_demo)
    return p


def main() -> int:
    for d in DIRS.values():
        d.mkdir(parents=True, exist_ok=True)
    args = build_parser().parse_args()
    cfg = load_config()
    try:
        return args.fn(args, cfg)
    except (FFmpegError, FileNotFoundError, ValueError, RuntimeError) as e:
        warn(str(e))
        return 2
    except KeyboardInterrupt:
        warn("Cancelado")
        return 130


if __name__ == "__main__":
    sys.exit(main())
