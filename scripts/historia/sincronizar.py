# Pone una voz externa (ElevenLabs, grabación) en un episodio POV y reajusta todo a ese audio.
# Uso: python sincronizar.py <proyecto> <slug> <audio>
import json, os, shutil, subprocess, sys
import numpy as np, librosa, soundfile as sf
from sonido import generar_sonido

proj, slug, audio = sys.argv[1], sys.argv[2], sys.argv[3]
FPS, SR, LEAD = 30, 44100, 0.25
ts = f"{proj}/src/Historia/videos/{slug}.ts"
carpeta = f"{proj}/public/historia/{slug}"
original = f"{carpeta}/narracion-original.wav"
if not os.path.exists(original): shutil.copy(f"{carpeta}/narracion.wav", original)
dorig = f"{carpeta}/datos-original.json"
if not os.path.exists(dorig):
    js = subprocess.run(["node", "--experimental-strip-types", "--no-warnings", "-e",
                         f'import("{ts}").then(m => console.log(JSON.stringify(m.HISTORIA)))'], capture_output=True, text=True, check=True).stdout
    open(dorig, "w").write(js)
H = json.load(open(dorig))
ep = json.load(open(f"{proj}/scripts/historia/{slug}.json"))

nuevo, _ = librosa.load(audio, sr=SR, mono=True)
nuevo = np.concatenate([np.zeros(int(LEAD * SR)), nuevo]); nuevo = nuevo / np.max(np.abs(nuevo)) * 0.95
HOP, SRF = 160, 16000
def feats(y, sr):
    y = librosa.resample(y, orig_sr=sr, target_sr=SRF)
    m = librosa.feature.mfcc(y=y, sr=SRF, n_mfcc=20, hop_length=HOP)[1:]
    return (m - m.mean(1, keepdims=True)) / (m.std(1, keepdims=True) + 1e-6)
yo, sro = librosa.load(original, sr=None)
_, wp = librosa.sequence.dtw(X=feats(yo, sro), Y=feats(nuevo, SR), metric="cosine")
wp = wp[::-1] * (HOP / SRF)
uo = np.unique(wp[:, 0]); un = np.maximum.accumulate(np.array([np.median(wp[wp[:, 0] == u, 1]) for u in uo]))
mapear = lambda t: float(np.interp(t, uo, un))
hop = SR // 100
rms = librosa.feature.rms(y=nuevo, frame_length=2 * hop, hop_length=hop)[0]
voz = rms > max(0.02, np.percentile(rms, 30) * 2)
inicios = [i / 100 for i in range(1, len(voz)) if voz[i] and not voz[max(0, i - 8):i].any()]
ajustar = lambda t: min([x for x in inicios if abs(x - t) < 0.25], key=lambda x: abs(x - t), default=t)

# Inicios de frase originales (s) y su nueva posición
fr_orig = [(e["from"] + r) / FPS for e in H["escenas"] for r in e["frases"]]
fr_new = [ajustar(mapear(t)) for t in fr_orig]
palabras, k, inicio = [], 0, True
for p in H["palabras"]:
    t = p["startMs"] / 1000
    d = fr_new[k] - mapear(fr_orig[k])
    palabras.append({**p, "startMs": round((fr_new[k] if inicio else mapear(t) + d) * 1000)})
    inicio = p["finFrase"]
    if p["finFrase"]: k += 1
prev = 0
for i, p in enumerate(palabras):
    p["startMs"] = max(p["startMs"], prev); prev = p["startMs"]
fin_voz = np.where(voz)[0][-1] / 100
TOTAL = round((fin_voz + 1.2) * FPS)
escenas, k = [], 0
for i, e in enumerate(H["escenas"]):
    n = len(e["frases"]); fs = fr_new[k:k + n]; k += n
    desde = 0 if i == 0 else min(round(mapear(e["from"] / FPS) * FPS), round(fs[0] * FPS) - 3)
    escenas.append({**e, "from": desde, "_f": fs})
for i, e in enumerate(escenas):
    e["dur"] = (escenas[i + 1]["from"] if i + 1 < len(escenas) else TOTAL) - e["from"]
    e["frases"] = [round(x * FPS) - e["from"] for x in e.pop("_f")]
N = int(TOTAL / FPS * SR); nuevo = np.pad(nuevo, (0, max(0, N - len(nuevo))))[:N]
sf.write(f"{carpeta}/narracion.wav", nuevo, SR)
tramos, ini = [], None
for i, v in enumerate(voz):
    if v and ini is None: ini = i / 100
    if not v and ini is not None: tramos.append((ini, i / 100)); ini = None
generar_sonido(ep, escenas, tramos, TOTAL, f"{carpeta}/musica.wav")
datos = {**H, "total": TOTAL, "escenas": escenas, "palabras": palabras}
with open(ts, "w") as f:
    f.write(f"// Generado por scripts/historia/sincronizar.py (voz externa) desde scripts/historia/{slug}.json: no editar a mano.\n")
    f.write('import type { DatosHistoria } from "../tipos";\n\n')
    f.write("export const HISTORIA: DatosHistoria = %s;\n" % json.dumps(datos, ensure_ascii=False))
print("total", TOTAL, TOTAL / FPS)
for e in escenas: print(e["id"], e["from"], e["dur"], e["frases"])
