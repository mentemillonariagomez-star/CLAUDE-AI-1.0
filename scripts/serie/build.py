"""Construye la línea de tiempo, la música/efectos y src/Pantalla/datos.ts
a partir de las frases narradas (frases.json de tts.py)."""
import json, sys, numpy as np, soundfile as sf

frases_dir, proj, slug = sys.argv[1], sys.argv[2], sys.argv[3]
IDS = [x["id"] for x in json.load(open(frases_dir + "/frases.json"))]
FPS, SR_V, SR = 30, 24000, 44100
data = json.load(open(frases_dir + "/frases.json"))
LEAD = {IDS[0]: 0.35}
TAIL = {IDS[-2]: 0.6, IDS[-1]: 1.6}
GAP = {".": 0.3, ",": 0.12, ":": 0.25}

t, escenas, clips = 0.0, [], []
for s in data:
    ini = t
    t += LEAD.get(s["id"], 0.18)
    frs = []
    for f in s["frases"]:
        clips.append((t, f["file"]))
        pal = f["text"].split()
        pesos = np.array([len(p) + 2 for p in pal], float)
        b = np.concatenate([[0], np.cumsum(pesos)]) / pesos.sum() * f["dur"]
        frs.append({"texto": f["text"], "palabras": [round((t - ini + b[i]) * FPS) for i in range(len(pal))]})
        t += f["dur"] + GAP.get(f["text"][-1], 0.2)
    t -= GAP.get(s["frases"][-1]["text"][-1], 0.2)
    t += TAIL.get(s["id"], 0.35)
    f0, f1 = round(ini * FPS), round(t * FPS)
    escenas.append({"id": s["id"], "from": f0, "dur": f1 - f0, "frases": frs})
    t = f1 / FPS
TOTAL = escenas[-1]["from"] + escenas[-1]["dur"]
fin = TOTAL / FPS
print("total", TOTAL, round(fin, 2), "s")

voz = np.zeros(int(fin * SR_V) + SR_V); habla = []
for st, fn in clips:
    a, _ = sf.read(fn); i = int(st * SR_V); voz[i:i + len(a)] += a; habla.append((st, st + len(a) / SR_V))
voz = voz / np.max(np.abs(voz)) * 0.95
sf.write(proj + f"/public/serie/{slug}/narracion.wav", voz[: int(fin * SR_V)], SR_V)

N = int(fin * SR); tt = np.arange(N) / SR; rng = np.random.default_rng(3)
mus, sfx = np.zeros(N), np.zeros(N)
nota = lambda n: 440 * 2 ** ((n - 69) / 12)
def pad(ns, t0, t1, vol):
    i0, i1 = int(t0 * SR), min(int(t1 * SR), N); x = tt[i0:i1] - t0; y = np.zeros(i1 - i0)
    for n in ns:
        for h in (1, 2, 3): y += np.sin(2 * np.pi * nota(n) * h * x) / h ** 2
    e = np.minimum(1, np.minimum(x / 0.3, (t1 - t0 - x) / 0.3).clip(0)); mus[i0:i1] += y * e / len(ns) * vol
def golpe(dest, t0, vol, f0=110, f1=45, dec=0.25):
    i0 = int(t0 * SR); n = min(int(dec * 1.5 * SR), N - i0)
    if n <= 0: return
    x = np.arange(n) / SR; fr = f1 + (f0 - f1) * np.exp(-x * 30)
    dest[i0:i0 + n] += np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.exp(-x / dec * 3) * vol
def ruido(dest, t0, dur, vol, dec, hp=True):
    i0 = int(t0 * SR); n = min(int(dur * SR), N - i0)
    if n <= 0: return
    y = rng.standard_normal(n); y = np.diff(np.concatenate([[0], y])) if hp else y
    dest[i0:i0 + n] += y * np.exp(-np.arange(n) / SR / dec) * vol
def tono(dest, t0, fs, dur, vol, dec):
    i0 = int(t0 * SR); n = min(int(dur * SR), N - i0)
    if n <= 0: return
    x = np.arange(n) / SR; dest[i0:i0 + n] += sum(np.sin(2 * np.pi * f * x) for f in fs) / len(fs) * np.exp(-x / dec) * vol

# Beat lo-fi oscuro a 92 bpm: Am7 - Fmaj7 - C - G
beat = 60 / 92; acordes = [[57, 60, 64, 67], [53, 57, 60, 64], [48, 55, 60, 64], [43, 50, 55, 59]]
cta = escenas[-1]["from"] / FPS
b, k = 0.0, 0
while b < fin:
    pad(acordes[k % 4], b, min(b + 4 * beat, fin) + 0.05, 0.5)
    for j in range(4):
        tb = b + j * beat
        if tb >= fin: break
        if j in (0, 2): golpe(mus, tb, 0.8)
        if j in (1, 3): ruido(mus, tb, 0.18, 0.18, 0.05)
        ruido(mus, tb + beat / 2, 0.05, 0.05, 0.01)
    b += 4 * beat; k += 1
duck = np.ones(N)
for a, z in habla: duck[int(a * SR):int(z * SR)] = 0.5
mus *= np.convolve(duck, np.ones(2200) / 2200, "same")
# Efectos: clic de interfaz + whoosh suave en cada cambio de diapositiva
for e in escenas[1:]:
    tc = e["from"] / FPS; tono(sfx, tc, [1800, 2400], 0.06, 0.25, 0.015)
    i0 = int((tc - 0.25) * SR); n = int(0.35 * SR); y = np.convolve(rng.standard_normal(n), np.ones(8) / 8, "same")
    sfx[i0:i0 + n] += y * np.sin(np.linspace(0, np.pi, n)) ** 2 * 0.25
golpe(sfx, cta, 1.0, 150, 40, 0.5); ruido(sfx, cta, 1.2, 0.2, 0.4)
mix = mus * 0.2 + sfx * 0.5; mix /= max(1, np.max(np.abs(mix)) / 0.9)
f = int(0.4 * SR); mix[-f:] *= np.linspace(1, 0, f)
sf.write(proj + f"/public/serie/{slug}/musica-y-efectos.wav", mix, SR)

with open(proj + f"/src/Serie/datos/{slug}.ts", "w") as fh:
    fh.write("// Generado por scripts/serie/build.py: fotogramas a 30 fps, relativos a cada escena.\n")
    fh.write("export const DURACION_TOTAL = %d;\n\n" % TOTAL)
    fh.write("export const ESCENAS = %s as const;\n" % json.dumps({e["id"]: e for e in escenas}, ensure_ascii=False, indent=2))
for e in escenas: print(e["id"], e["from"], e["dur"], [f["palabras"][0] for f in e["frases"]])
