# Genera narración, música/efectos y src/Pasos/datos.ts a partir de guion.json.
# Uso: python pasos.py <base-con-models/> <proyecto> "<voz>" <velocidad>
import json, re, sys, numpy as np, soundfile as sf
from kokoro_onnx import Kokoro

base, proj, voice, speed = sys.argv[1], sys.argv[2], sys.argv[3], float(sys.argv[4])
here = proj + "/scripts/pasos"
FPS, SR = 30, 24000
k = Kokoro(base + "/models/kokoro-v1.0.onnx", base + "/models/voices-v1.0.bin")
if ":" in voice:
    voice = sum(k.get_voice_style(n) * float(w) for n, w in (p.split(":") for p in voice.split(",")))

GAP = {".": 0.3, ",": 0.12, ":": 0.25}
segs = json.load(open(here + "/guion.json"))
t = 0.35
voz = []
escenas, frases_out = [], []
for s in segs:
    ini = t if escenas else 0.0
    rel = []
    for f in [x for x in re.split(r"(?<=[.,:])\s+", s["text"]) if x]:
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
            abre = p.startswith("*")
            es = dentro or abre
            dentro = (dentro or abre) and not p.rstrip(".,:").endswith("*")
            lista.append({"text": p.replace("*", ""), "key": es, "startMs": round((t + bordes[i]) * 1000)})
        frases_out.append({"escena": s["id"], "startMs": round(t * 1000), "endMs": round((t + dur) * 1000), "palabras": lista})
        print(s["id"], round(dur, 2), limpio, flush=True)
        t += dur + GAP.get(limpio[-1], 0.15)
    t += 0.25
    f0, f1 = round(ini * FPS), round(t * FPS)
    escenas.append({"id": s["id"], "label": s["label"], "from": f0, "dur": f1 - f0, "frases": rel})
    t = f1 / FPS
TOTAL = escenas[-1]["from"] + escenas[-1]["dur"] + 20
escenas[-1]["dur"] += 20
print("total", TOTAL, TOTAL / FPS)

# Narración
N = int(TOTAL / FPS * SR)
v = np.zeros(N + SR)
for st, a in voz:
    i = int(st * SR); v[i:i + len(a)] += a
v = v[:N] / np.max(np.abs(v)) * 0.95
sf.write(proj + "/public/pasos/narracion.wav", v, SR)

# Boca: apertura por fotograma (0..1)
spf = SR // FPS
rms = np.array([np.sqrt(np.mean(v[i * spf:(i + 1) * spf] ** 2)) for i in range(TOTAL)])
boca = np.clip(rms / (np.percentile(rms[rms > 0.01], 85) if np.any(rms > 0.01) else 1), 0, 1)
boca = np.round(boca, 2).tolist()

# Música lo-fi + efectos
SRM = 44100; NM = int(TOTAL / FPS * SRM); tt = np.arange(NM) / SRM
rng = np.random.default_rng(3)
mus = np.zeros(NM); sfx = np.zeros(NM)
nota = lambda n: 440 * 2 ** ((n - 69) / 12)
def add(dest, t0, y):
    i = int(t0 * SRM); n = min(len(y), NM - i)
    if n > 0 and i >= 0: dest[i:i + n] += y[:n]
def kick(t0, vol=0.6):
    x = np.arange(int(0.4 * SRM)) / SRM; f = 45 + 90 * np.exp(-x * 30)
    add(mus, t0, np.sin(2 * np.pi * np.cumsum(f) / SRM) * np.exp(-x * 9) * vol)
def hat(t0, vol=0.08):
    x = np.arange(int(0.05 * SRM)) / SRM
    add(mus, t0, np.diff(np.concatenate([[0], rng.standard_normal(len(x))])) * np.exp(-x * 90) * vol)
def acorde(t0, dur, notas, vol=0.12):
    x = np.arange(int(dur * SRM)) / SRM
    y = sum(np.sin(2 * np.pi * nota(n) * x) + 0.3 * np.sin(4 * np.pi * nota(n) * x) for n in notas) / len(notas)
    e = np.minimum(1, x / 0.05) * np.exp(-x * 0.9)
    add(mus, t0, y * e * vol)
beat = 60 / 92
prog = [[57, 60, 64, 67], [53, 57, 60, 64], [48, 52, 55, 59], [55, 59, 62, 65]]
b, i = 0.0, 0
while b < TOTAL / FPS:
    if i % 4 == 0: acorde(b, beat * 4, prog[(i // 4) % 4])
    kick(b) if i % 2 == 0 else hat(b, 0.12)
    hat(b + beat / 2); b += beat; i += 1
def pop(t0, f=900, vol=0.35):
    x = np.arange(int(0.12 * SRM)) / SRM
    add(sfx, t0, np.sin(2 * np.pi * (f + 600 * np.exp(-x * 40)) * x) * np.exp(-x * 35) * vol)
def whoosh(tc, vol=0.3, dur=0.4):
    n = int(dur * SRM); y = np.convolve(rng.standard_normal(n), np.ones(8) / 8, "same")
    add(sfx, tc - dur * 0.7, y * np.sin(np.linspace(0, np.pi, n)) ** 2 * vol)
for e in escenas[1:]: whoosh(e["from"] / FPS)
for e in escenas:
    for r in e["frases"][1:]: pop((e["from"] + r) / FPS)
# Ducking
duck = np.ones(NM)
for st, a in voz: duck[int(st * SRM): int((st + len(a) / SR) * SRM)] = 0.5
duck = np.convolve(duck, np.ones(3000) / 3000, "same")
mix = mus * duck * 0.25 + sfx * 0.5
mix /= max(1.0, np.max(np.abs(mix)) / 0.9)
fade = int(0.5 * SRM); mix[-fade:] *= np.linspace(1, 0, fade)
sf.write(proj + "/public/pasos/musica-y-efectos.wav", mix, SRM)

with open(proj + "/src/Pasos/datos.ts", "w") as f:
    f.write("// Generado por scripts/pasos/pasos.py: no editar a mano.\n")
    f.write("export const DURACION_TOTAL = %d;\n\n" % TOTAL)
    f.write("export const ESCENAS = %s as const;\n\n" % json.dumps({e["id"]: {k2: e[k2] for k2 in ("label", "from", "dur", "frases")} for e in escenas}, ensure_ascii=False, indent=2))
    f.write("export type Palabra = { text: string; key: boolean; startMs: number };\n")
    f.write("export type Frase = { escena: string; startMs: number; endMs: number; palabras: Palabra[] };\n\n")
    f.write("export const FRASES: Frase[] = %s;\n\n" % json.dumps(frases_out, ensure_ascii=False))
    f.write("export const BOCA: number[] = %s;\n" % json.dumps(boca))
for e in escenas: print(e)
