# Genera la narración, la música/efectos y src/Historia/videos/<slug>.ts de un episodio POV.
# Uso: python generar.py <base-con-models/> <proyecto> <episodio.json> ["<voz kokoro>"] [velocidad]
# La voz de Kokoro es provisional; para usar otra voz (ElevenLabs, grabación) ver sincronizar.py.
import json, re, sys, os, numpy as np, soundfile as sf
from kokoro_onnx import Kokoro

base, proj, ruta = sys.argv[1], sys.argv[2], sys.argv[3]
voice = sys.argv[4] if len(sys.argv) > 4 else open(proj + "/scripts/viral/voz.txt").read().strip()
speed = float(sys.argv[5]) if len(sys.argv) > 5 else 1.12
FPS, SR = 30, 24000
ep = json.load(open(ruta))
slug = ep["slug"]
carpeta = f"{proj}/public/historia/{slug}"
os.makedirs(carpeta, exist_ok=True)
k = Kokoro(base + "/models/kokoro-v1.0.onnx", base + "/models/voices-v1.0.bin")
if ":" in voice:
    voice = sum(k.get_voice_style(n) * float(w) for n, w in (p.split(":") for p in voice.split(",")))

PARTIR = r"(?<=[.,:?!])\s+"
GAP = {".": 0.18, ",": 0.06, ":": 0.12, "?": 0.2, "!": 0.2}  # narración continua, como el original
t = 0.25
clips, escenas, palabras = [], [], []
for s in ep["escenas"]:
    ini = t if escenas else 0.0
    rel = []
    for f in [x for x in re.split(PARTIR, s["texto"]) if x]:
        a, _ = k.create(f, voice=voice, speed=speed, lang="es")
        idx = np.where(np.abs(a) > 0.012)[0]
        a = a[max(idx[0] - 120, 0): idx[-1] + 400]
        dur = len(a) / SR
        clips.append((t, a))
        rel.append(round((t - ini) * FPS))
        pals = f.split()
        pesos = np.array([len(p) + 2 for p in pals], float)
        bordes = np.concatenate([[0], np.cumsum(pesos)]) / pesos.sum() * dur
        for i, p in enumerate(pals):
            palabras.append({"text": p, "startMs": round((t + bordes[i]) * 1000), "finFrase": i == len(pals) - 1})
        print(s["id"], round(dur, 2), f, flush=True)
        t += dur + GAP.get(f[-1], 0.1)
    t += 0.12
    f0, f1 = round(ini * FPS), round(t * FPS)
    escenas.append({**{kk: vv for kk, vv in s.items() if kk != "texto"}, "from": f0, "dur": f1 - f0, "frases": rel})
    t = f1 / FPS
escenas[-1]["dur"] += 30
TOTAL = escenas[-1]["from"] + escenas[-1]["dur"]

N = int(TOTAL / FPS * SR)
voz = np.zeros(N + SR)
for st, a in clips:
    i = int(st * SR); voz[i:i + len(a)] += a
voz = voz[:N] / np.max(np.abs(voz)) * 0.95
sf.write(f"{carpeta}/narracion.wav", voz, SR)

from sonido import generar_sonido
generar_sonido(ep, escenas, [(st, st + len(a) / SR) for st, a in clips], TOTAL, f"{carpeta}/musica.wav")

datos = {k2: ep[k2] for k2 in ("slug", "serie", "parte", "usuario")}
datos.update({"total": TOTAL, "escenas": escenas, "palabras": palabras})
with open(f"{proj}/src/Historia/videos/{slug}.ts", "w") as f:
    f.write(f"// Generado por scripts/historia/generar.py desde scripts/historia/{slug}.json: no editar a mano.\n")
    f.write('import type { DatosHistoria } from "../tipos";\n\n')
    f.write("export const HISTORIA: DatosHistoria = %s;\n" % json.dumps(datos, ensure_ascii=False))
print("total", TOTAL, TOTAL / FPS)
for e in escenas: print(e["id"], e["from"], e["dur"], e["frases"])
