"""Crea un vídeo de referencia sintético para probar el sistema sin descargar nada.

16 s, vertical 720x1280, 6 planos: cortes duros, un fundido a negro y un fundido
encadenado, música con pulso a 120 BPM y subtítulos incrustados (gancho + CTA).
También genera dos imágenes de prueba en assets/ si se pasa --assets.
"""
from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from scripts.common import DIRS, ffmpeg, log  # noqa: E402

SRT = """1
00:00:00,200 --> 00:00:02,600
¿Sabías que tu móvil puede editar como un estudio?

2
00:00:02,700 --> 00:00:05,400
Primero graba planos cortos y con buena luz

3
00:00:05,500 --> 00:00:09,000
Luego corta al ritmo de la música

4
00:00:09,100 --> 00:00:12,800
Usa colores cálidos y textos grandes

5
00:00:13,000 --> 00:00:15,800
Sígueme para más trucos de edición
"""


def make_sample(out: Path) -> Path:
    W, H = 720, 1280
    work = out.parent
    (work / "sample.srt").write_text(SRT, encoding="utf-8")
    srcs = [
        f"testsrc2=s={W}x{H}:r=30:d=2.5",
        f"color=c=0xd9480f:s={W}x{H}:r=30:d=3,drawbox=x='mod(t*200,{W})':y=500:w=200:h=200:color=0xffd43b:t=fill",
        f"mandelbrot=s={W}x{H}:r=30,trim=duration=3.5",
        f"color=c=0x1864ab:s={W}x{H}:r=30:d=3,drawbox=x=200:y='mod(t*300,{H})':w=320:h=180:color=white:t=fill",
        f"smptehdbars=s={W}x{H}:r=30:d=2.5",
        f"color=c=0x2b8a3e:s={W}x{H}:r=30:d=2.5,drawbox=x=160:y=400:w=400:h=400:color=0xffec99:t=fill",
    ]
    args = []
    for s in srcs:
        args += ["-f", "lavfi", "-i", s]
    args += ["-f", "lavfi", "-i", "aevalsrc='0.5*sin(2*PI*220*t)*exp(-25*mod(t,0.5))+0.08*sin(2*PI*330*t)':s=44100:d=16"]
    args += ["-i", str(work / "sample.srt")]
    fc = ";".join([
        *(f"[{i}:v]format=yuv420p,setsar=1,settb=1/30[v{i}]" for i in range(6)),
        # 0|1 corte · 1|2 corte · 2→3 fundido a negro · 3→4 fundido encadenado · 4|5 corte
        "[v2]fade=t=out:st=2.9:d=0.6[v2f]",
        "[v3]fade=t=in:st=0:d=0.6[v3f]",
        "[v3f][v4]xfade=transition=fade:duration=0.8:offset=2.2[v34]",
        "[v0][v1][v2f][v34][v5]concat=n=5:v=1:a=0[v]",
    ])
    ffmpeg([*args, "-filter_complex", fc, "-map", "[v]", "-map", "6:a", "-map", "7:s",
            "-c:v", "libx264", "-preset", "veryfast", "-crf", "26", "-c:a", "aac", "-b:a", "96k",
            "-c:s", "mov_text", "-metadata:s:s:0", "language=spa", "-t", "16", str(out)])
    (work / "sample.srt").unlink()
    return out


def make_assets() -> None:
    a = DIRS["assets"]
    ffmpeg(["-f", "lavfi", "-i", "gradients=s=1200x1600:c0=0xff6b6b:c1=0x4c6ef5:n=3:d=1",
            "-frames:v", "1", str(a / "prueba_01.jpg")])
    ffmpeg(["-f", "lavfi", "-i", "life=s=400x300:mold=10:r=30:ratio=0.2:death_color=#1b1b2f:life_color=#f9c74f,scale=800:600:flags=neighbor",
            "-t", "6", "-c:v", "libx264", "-preset", "veryfast", "-pix_fmt", "yuv420p", str(a / "prueba_02.mp4")])
    ffmpeg(["-f", "lavfi", "-i", "aevalsrc='0.3*sin(2*PI*196*t)*exp(-6*mod(t,0.5))+0.2*sin(2*PI*98*t)':s=44100:d=20",
            "-c:a", "aac", "-b:a", "96k", str(a / "music" / "prueba_musica.m4a")])


if __name__ == "__main__":
    out = DIRS["input"] / "muestra_referencia.mp4"
    log(f"Creando vídeo de muestra en {out}")
    make_sample(out)
    if "--assets" in sys.argv:
        make_assets()
        log("Assets de prueba creados en assets/")
    print(out)
