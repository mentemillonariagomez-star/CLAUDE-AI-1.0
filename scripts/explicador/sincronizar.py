# Reajusta un video explicador a una voz externa (ElevenLabs, tu grabación...).
# Uso: python sincronizar.py <proyecto> <slug> <audio>
# Compara el audio nuevo con la narración original (mismo texto) para saber dónde cae cada frase,
# y reescribe tiempos, encabezado, boca, música y la narración en public/explicador/<slug>/.
import json, os, shutil, subprocess, sys
import numpy as np, librosa, soundfile as sf
from musica import generar_musica

proj, slug, audio = sys.argv[1], sys.argv[2], sys.argv[3]
FPS, SR, LEAD = 30, 44100, 0.3
ts = f"{proj}/src/Explicador/videos/{slug}.ts"
carpeta = f"{proj}/public/explicador/{slug}"
original = f"{carpeta}/narracion-original.wav"
if not os.path.exists(original):
    shutil.copy(f"{carpeta}/narracion.wav", original)
datos_orig = f"{carpeta}/datos-original.json"
if not os.path.exists(datos_orig):
    js = subprocess.run(["node", "--experimental-strip-types", "--no-warnings", "-e",
                         f'import("{ts}").then(m => console.log(JSON.stringify(m.VIDEO)))'],
                        capture_output=True, text=True, check=True).stdout
    open(datos_orig, "w").write(js)
V = json.load(open(datos_orig))
guion = json.load(open(f"{proj}/scripts/explicador/{slug}.json"))

# Audio nuevo con un pequeño silencio al inicio
nuevo, _ = librosa.load(audio, sr=SR, mono=True)
nuevo = np.concatenate([np.zeros(int(LEAD * SR)), nuevo])
nuevo = nuevo / np.max(np.abs(nuevo)) * 0.95

# Alineación por DTW entre la narración original y la nueva
HOP, SRF = 160, 16000
def feats(y, sr):
    y = librosa.resample(y, orig_sr=sr, target_sr=SRF)
    m = librosa.feature.mfcc(y=y, sr=SRF, n_mfcc=20, hop_length=HOP)[1:]
    return (m - m.mean(1, keepdims=True)) / (m.std(1, keepdims=True) + 1e-6)
yo, sro = librosa.load(original, sr=None)
A, B = feats(yo, sro), feats(nuevo, SR)
_, wp = librosa.sequence.dtw(X=A, Y=B, metric="cosine")
wp = wp[::-1]
paso = HOP / SRF
to, tn = wp[:, 0] * paso, wp[:, 1] * paso
uo, idx = np.unique(to, return_index=True)
un = np.maximum.accumulate(np.array([np.median(tn[to == u]) for u in uo]))
mapear = lambda t: float(np.interp(t, uo, un))

# Inicios de habla en el audio nuevo (para ajustar cada frase al arranque real)
hop = int(SR / 100)
rms = librosa.feature.rms(y=nuevo, frame_length=2 * hop, hop_length=hop)[0]
voz = rms > max(0.02, np.percentile(rms, 30) * 2)
inicios = [i / 100 for i in range(1, len(voz)) if voz[i] and not voz[max(0, i - 12):i].any()]
def ajustar(t):
    cerca = [x for x in inicios if abs(x - t) < 0.3]
    return min(cerca, key=lambda x: abs(x - t)) if cerca else t

# Frases y palabras
frases = []
for f in V["frases"]:
    t0 = f["startMs"] / 1000
    n0 = ajustar(mapear(t0))
    d = n0 - mapear(t0)
    frases.append({**f, "startMs": round(n0 * 1000),
                   "palabras": [{**p, "startMs": round((mapear(p["startMs"] / 1000) + d) * 1000)} for p in f["palabras"]]})
for i, f in enumerate(frases):  # palabras siempre en orden y dentro de su frase
    fin = frases[i + 1]["startMs"] if i + 1 < len(frases) else 10 ** 9
    prev = f["startMs"]
    for p in f["palabras"]:
        p["startMs"] = min(max(p["startMs"], prev), fin - 40)
        prev = p["startMs"]

# Escenas
fin_voz = np.where(voz)[0][-1] / 100
k = 0
escenas = []
for i, e in enumerate(V["escenas"]):
    n = len(e["frases"])
    fs = frases[k:k + n]
    k += n
    primera = fs[0]["startMs"] / 1000 * FPS
    desde = 0 if i == 0 else min(round(mapear(e["from"] / FPS) * FPS), round(primera) - 4)
    escenas.append({**e, "from": desde, "_f": [f["startMs"] / 1000 * FPS for f in fs]})
TOTAL = round((fin_voz + 1.0) * FPS)
for i, e in enumerate(escenas):
    fin = escenas[i + 1]["from"] if i + 1 < len(escenas) else TOTAL
    e["dur"] = fin - e["from"]
    e["frases"] = [round(x - e["from"]) for x in e.pop("_f")]

# Boca, audio y música
N = int(TOTAL / FPS * SR)
nuevo = np.pad(nuevo, (0, max(0, N - len(nuevo))))[:N]
spf = SR // FPS
r = np.array([np.sqrt(np.mean(nuevo[i * spf:(i + 1) * spf] ** 2)) for i in range(TOTAL)])
boca = np.round(np.clip(r / np.percentile(r[r > 0.01], 85), 0, 1), 2).tolist()
sf.write(f"{carpeta}/narracion.wav", nuevo, SR)
tramos, ini = [], None
for i, v in enumerate(voz):
    if v and ini is None: ini = i / 100
    if not v and ini is not None: tramos.append((ini, i / 100)); ini = None
generar_musica(TOTAL, escenas, tramos, f"{carpeta}/musica.wav", guion.get("musica", 0), guion.get("bpm", 92), len(slug))

datos = {**V, "total": TOTAL, "escenas": escenas, "frases": frases, "boca": boca}
with open(ts, "w") as f:
    f.write(f"// Generado por scripts/explicador/sincronizar.py (voz externa) desde scripts/explicador/{slug}.json: no editar a mano.\n")
    f.write('import type { DatosVideo } from "../tipos";\n\n')
    f.write("export const VIDEO: DatosVideo = %s;\n" % json.dumps(datos, ensure_ascii=False))
print("total", TOTAL, TOTAL / FPS)
for e in escenas: print(e["id"], e["from"], e["dur"], e["frases"])
