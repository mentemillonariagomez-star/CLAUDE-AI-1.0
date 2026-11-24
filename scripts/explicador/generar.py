# Genera narración, música/efectos y src/Explicador/videos/<slug>.ts a partir de un guion JSON.
# Uso: python generar.py <base-con-models/> <proyecto> <guion.json> ["<voz>"] [velocidad]
import json, re, sys, os, numpy as np, soundfile as sf
from kokoro_onnx import Kokoro

base, proj, guion = sys.argv[1], sys.argv[2], sys.argv[3]
voice = sys.argv[4] if len(sys.argv) > 4 else open(proj + "/scripts/viral/voz.txt").read().strip()
speed = float(sys.argv[5]) if len(sys.argv) > 5 else 1.08
FPS, SR = 30, 24000
g = json.load(open(guion))
slug = g["slug"]
os.makedirs(f"{proj}/public/explicador/{slug}", exist_ok=True)
k = Kokoro(base + "/models/kokoro-v1.0.onnx", base + "/models/voices-v1.0.bin")
if ":" in voice:
    voice = sum(k.get_voice_style(n) * float(w) for n, w in (p.split(":") for p in voice.split(",")))

GAP = {".": 0.3, ",": 0.12, ":": 0.25, "?": 0.3, "!": 0.3}
t = 0.35
voz, escenas, frases_out = [], [], []
for s in g["escenas"]:
    ini = t if escenas else 0.0
    rel = []
    for f in [x for x in re.split(r"(?<=[.,:?!])\s+", s["texto"]) if x]:
        limpio = f.replace("*", "")
        a, sr = k.create(limpio, voice=voice, speed=speed, lang="es")
        idx = np.where(np.abs(a) > 0.012)[0]
        a = a[max(idx[0] - 150, 0): idx[-1] + 600]
        dur = len(a) / SR
        voz.append((t, a))
        rel.append(round((t - ini) * FPS))
        palabras = f.split()
        pesos = np.array([len(p.replace("*", "")) + 2 for p in palabras], float)
        bordes = np.concatenate([[0], np.cumsum(pesos)]) / pesos.sum() * dur
        dentro, lista = False, []
        for i, p in enumerate(palabras):
            abre = p.startswith("*") or p.startswith("¿*")
            es = dentro or abre
            dentro = es and not p.rstrip(".,:?!").endswith("*")
            lista.append({"text": p.replace("*", ""), "key": es, "startMs": round((t + bordes[i]) * 1000)})
        frases_out.append({"startMs": round(t * 1000), "palabras": lista})
        print(s["id"], round(dur, 2), limpio, flush=True)
        t += dur + GAP.get(limpio[-1], 0.15)
    t += 0.25
    f0, f1 = round(ini * FPS), round(t * FPS)
    e = {kk: vv for kk, vv in s.items() if kk != "texto"}
    e.update({"from": f0, "dur": f1 - f0, "frases": rel})
    escenas.append(e)
    t = f1 / FPS
escenas[-1]["dur"] += 20
TOTAL = escenas[-1]["from"] + escenas[-1]["dur"]
print("total", TOTAL, TOTAL / FPS)

N = int(TOTAL / FPS * SR)
v = np.zeros(N + SR)
for st, a in voz:
    i = int(st * SR); v[i:i + len(a)] += a
v = v[:N] / np.max(np.abs(v)) * 0.95
sf.write(f"{proj}/public/explicador/{slug}/narracion.wav", v, SR)
spf = SR // FPS
rms = np.array([np.sqrt(np.mean(v[i * spf:(i + 1) * spf] ** 2)) for i in range(TOTAL)])
boca = np.round(np.clip(rms / np.percentile(rms[rms > 0.01], 85), 0, 1), 2).tolist()

from musica import generar_musica
generar_musica(TOTAL, escenas, [(st, st + len(a) / SR) for st, a in voz], f"{proj}/public/explicador/{slug}/musica.wav", g.get("musica", 0), g.get("bpm", 92), len(slug))

datos = {"slug": slug, "pasos": g["pasos"], "total": TOTAL, "escenas": escenas, "frases": frases_out, "boca": boca}
with open(f"{proj}/src/Explicador/videos/{slug}.ts", "w") as f:
    f.write("// Generado por scripts/explicador/generar.py desde scripts/explicador/%s.json: no editar a mano.\n" % slug)
    f.write('import type { DatosVideo } from "../tipos";\n\n')
    f.write("export const VIDEO: DatosVideo = %s;\n" % json.dumps(datos, ensure_ascii=False))
for e in escenas: print(e["id"], e["from"], e["dur"], e["frases"])
