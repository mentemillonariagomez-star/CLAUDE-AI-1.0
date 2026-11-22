# Genera el diálogo (dos voces), la música, y src/Sketch/datos.ts.
# Uso: python sketch.py <base-con-models/> <proyecto>
import json, sys, numpy as np, soundfile as sf
from kokoro_onnx import Kokoro

base, proj = sys.argv[1], sys.argv[2]
FPS, SR = 30, 24000
k = Kokoro(base + "/models/kokoro-v1.0.onnx", base + "/models/voices-v1.0.bin")
mezcla = lambda s: sum(k.get_voice_style(n) * float(w) for n, w in (p.split(":") for p in s.split(",")))
VOZ = {"chico": (mezcla(open(proj + "/scripts/viral/voz.txt").read().strip()), 1.05),
       "robot": (k.get_voice_style("ef_dora"), 1.0)}

def robotizar(a):
    t = np.arange(len(a)) / SR
    r = a * (0.65 + 0.35 * np.sin(2 * np.pi * 55 * t))  # modulación en anillo suave
    d = int(0.012 * SR); eco = np.zeros_like(r); eco[d:] = r[:-d] * 0.35
    r = r + eco
    return np.round(r * 48) / 48  # un poco de "bitcrush"

lineas = json.load(open(proj + "/scripts/sketch/guion.json"))
t = 0.5
clips, out = [], []
for l in lineas:
    t += l.get("pausa", 0)
    estilo, vel = VOZ[l["quien"]]
    a, _ = k.create(l["texto"], voice=estilo, speed=vel, lang="es")
    idx = np.where(np.abs(a) > 0.012)[0]; a = a[max(idx[0] - 150, 0): idx[-1] + 600]
    if l["quien"] == "robot": a = robotizar(a)
    a = a / np.max(np.abs(a)) * 0.9
    clips.append((t, a, l["quien"]))
    out.append({**l, "from": round(t * FPS), "dur": round(len(a) / SR * FPS)})
    print(l["quien"], round(len(a) / SR, 2), l["texto"], flush=True)
    t += len(a) / SR + 0.35
t += 1.0
TOTAL = round(t * FPS)
N = int(TOTAL / FPS * SR)
voz = np.zeros(N + SR); bocas = {"chico": np.zeros(N + SR), "robot": np.zeros(N + SR)}
for st, a, q in clips:
    i = int(st * SR); voz[i:i + len(a)] += a; bocas[q][i:i + len(a)] += a
voz = voz[:N]
sf.write(proj + "/public/sketch/dialogo.wav", voz, SR)
spf = SR // FPS
def boca(x):
    r = np.array([np.sqrt(np.mean(x[i * spf:(i + 1) * spf] ** 2)) for i in range(TOTAL)])
    return np.round(np.clip(r / max(np.percentile(r[r > 0.01], 85), 1e-3), 0, 1), 2).tolist()

# Ambiente nocturno: pad suave + grillos + golpe de "silencio incómodo"
SRM = 44100; NM = int(TOTAL / FPS * SRM); tt = np.arange(NM) / SRM
rng = np.random.default_rng(5)
nota = lambda n: 440 * 2 ** ((n - 69) / 12)
amb = np.zeros(NM)
acordes = [[50, 57, 62, 65], [46, 53, 58, 62], [48, 55, 60, 64], [45, 52, 57, 61]]
dur = 4.0
for j in range(int(TOTAL / FPS / dur) + 1):
    i0 = int(j * dur * SRM); i1 = min(NM, int((j + 1.15) * dur * SRM)); x = tt[i0:i1] - j * dur
    y = sum(np.sin(2 * np.pi * nota(n) * x) * (1 + 0.2 * np.sin(2 * np.pi * 0.3 * x)) for n in acordes[j % 4]) / 4
    e = np.minimum(1, x / 1.2) * np.minimum(1, np.maximum(0, (dur * 1.15 - x) / 0.6))
    amb[i0:i1] += y * e * 0.12
grillo = np.zeros(NM)
for c0 in np.arange(0.3, TOTAL / FPS, 1.7):
    for b in range(3):
        i = int((c0 + b * 0.06) * SRM); n = int(0.035 * SRM)
        if i + n < NM: grillo[i:i + n] += np.sin(2 * np.pi * 4300 * np.arange(n) / SRM) * np.hanning(n) * 0.04
duck = np.ones(NM)
for st, a, q in clips: duck[int(st * SRM): int((st + len(a) / SR) * SRM)] = 0.6
duck = np.convolve(duck, np.ones(4000) / 4000, "same")
mix = (amb + grillo) * duck
fade = int(0.8 * SRM); mix[:fade] *= np.linspace(0, 1, fade); mix[-fade:] *= np.linspace(1, 0, fade)
sf.write(proj + "/public/sketch/ambiente.wav", mix / max(1, np.max(np.abs(mix)) / 0.8), SRM)

with open(proj + "/src/Sketch/datos.ts", "w") as f:
    f.write("// Generado por scripts/sketch/sketch.py: no editar a mano.\n")
    f.write("export const DURACION_TOTAL = %d;\n\n" % TOTAL)
    f.write("export type Linea = { quien: \"chico\" | \"robot\"; plano: string; texto: string; from: number; dur: number };\n")
    f.write("export const LINEAS: Linea[] = %s;\n\n" % json.dumps([{k2: l[k2] for k2 in ("quien", "plano", "texto", "from", "dur")} for l in out], ensure_ascii=False, indent=1))
    f.write("export const BOCA_CHICO: number[] = %s;\n" % json.dumps(boca(bocas["chico"])))
    f.write("export const BOCA_ROBOT: number[] = %s;\n" % json.dumps(boca(bocas["robot"])))
print("total", TOTAL, TOTAL / FPS)
