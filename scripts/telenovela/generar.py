# Genera diálogo, música/efectos y src/Telenovela/videos/<slug>.ts de un capítulo.
# Uso: python generar.py <base-con-models/> <proyecto> <capitulo.json> [carpeta-con-audios]
# Sin carpeta: voces provisionales de Kokoro (una por personaje).
# Con carpeta: un archivo por línea, numerados en orden (01.mp3, 02.mp3, … o cualquier nombre que empiece por el número).
import json, os, re, sys, numpy as np, soundfile as sf, librosa

base, proj, ruta = sys.argv[1], sys.argv[2], sys.argv[3]
carpeta_audios = sys.argv[4] if len(sys.argv) > 4 else None
FPS, SR = 30, 44100
cap = json.load(open(ruta)); slug = cap["slug"]
salida = f"{proj}/public/telenovela/{slug}"; os.makedirs(salida, exist_ok=True)

lineas = [(i, l) for e in cap["escenas"] for l in e["lineas"] for i in [0]]
todas = [l for e in cap["escenas"] for l in e["lineas"]]

def recortar(a):
    idx = np.where(np.abs(a) > 0.012)[0]
    return a[max(idx[0] - 300, 0): idx[-1] + 900] if len(idx) else a

audios = []
if carpeta_audios:
    archivos = sorted([f for f in os.listdir(carpeta_audios) if re.match(r"^\d+", f)], key=lambda f: int(re.match(r"^\d+", f).group()))
    assert len(archivos) == len(todas), f"Hay {len(archivos)} audios y {len(todas)} líneas"
    for f in archivos:
        a, _ = librosa.load(os.path.join(carpeta_audios, f), sr=SR, mono=True)
        audios.append(recortar(a))
else:
    from kokoro_onnx import Kokoro
    k = Kokoro(base + "/models/kokoro-v1.0.onnx", base + "/models/voices-v1.0.bin")
    for l in todas:
        a, sr = k.create(l["texto"], voice=cap["voces"][l["quien"]], speed=1.05, lang="es")
        audios.append(recortar(librosa.resample(a, orig_sr=sr, target_sr=SR)))
        print(l["quien"], l["texto"], flush=True)

t = 0.3
escenas, lin_out, n = [], [], 0
for s in cap["escenas"]:
    ini = t if escenas else 0.0
    t += 0.25
    rel = []
    for l in s["lineas"]:
        a = audios[n]; dur = len(a) / SR
        rel.append(round((t - ini) * FPS))
        pals = l["texto"].split()
        pesos = np.array([len(p) + 2 for p in pals], float)
        bordes = np.concatenate([[0], np.cumsum(pesos)]) / pesos.sum() * dur
        lin_out.append({"quien": l["quien"], "startMs": round(t * 1000), "endMs": round((t + dur) * 1000),
                        "palabras": [{"text": p, "startMs": round((t + bordes[i]) * 1000)} for i, p in enumerate(pals)]})
        lin_out[-1]["_a"] = n
        t += dur + 0.45; n += 1
    t += 0.35 if not s.get("continuara") else 2.8
    f0, f1 = round(ini * FPS), round(t * FPS)
    escenas.append({**{kk: vv for kk, vv in s.items() if kk != "lineas"}, "from": f0, "dur": f1 - f0, "frases": rel})
    t = f1 / FPS
TOTAL = escenas[-1]["from"] + escenas[-1]["dur"]
N = int(TOTAL / FPS * SR) + SR
pistas = {q: np.zeros(N) for q in cap["voces"]}
voz = np.zeros(N)
for l in lin_out:
    a = audios[l.pop("_a")]; i = int(l["startMs"] / 1000 * SR)
    voz[i:i + len(a)] += a; pistas[l["quien"]][i:i + len(a)] += a
pico = np.max(np.abs(voz)); voz = voz / pico * 0.95
sf.write(f"{salida}/dialogo.wav", voz[: int(TOTAL / FPS * SR)], SR)
spf = SR // FPS
bocas = {}
for q, p in pistas.items():
    r = np.array([np.sqrt(np.mean((p[i * spf:(i + 1) * spf] / pico) ** 2)) for i in range(TOTAL)])
    ref = np.percentile(r[r > 0.01], 85) if np.any(r > 0.01) else 1
    bocas[q] = np.round(np.clip(r / ref, 0, 1), 2).tolist()

from sonido import generar_sonido
generar_sonido(escenas, [(l["startMs"] / 1000, l["endMs"] / 1000) for l in lin_out], TOTAL, f"{salida}/musica.wav")
datos = {"slug": slug, "serie": cap["serie"], "capitulo": cap["capitulo"], "usuario": cap["usuario"], "total": TOTAL,
         "escenas": escenas, "lineas": lin_out, "bocas": bocas}
with open(f"{proj}/src/Telenovela/videos/{slug}.ts", "w") as f:
    f.write(f"// Generado por scripts/telenovela/generar.py desde scripts/telenovela/{slug}.json: no editar a mano.\n")
    f.write('import type { DatosCapitulo } from "../tipos";\n\n')
    f.write("export const CAPITULO: DatosCapitulo = %s;\n" % json.dumps(datos, ensure_ascii=False))
print("total", TOTAL, TOTAL / FPS)
for e in escenas: print(e["id"], e["from"], e["dur"], e["frases"])
