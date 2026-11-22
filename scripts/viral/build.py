import json, sys, numpy as np, soundfile as sf
base, proj = sys.argv[1], sys.argv[2]
FPS = 30
data = json.load(open(base + "/out/frases.json"))
LEAD = {"Gancho": 0.05, "TodoCambio": 0.35}
TAIL = {"HastaQue": 0.9, "Loop": 0.7, "Gancho": 0.3}
GAP = {".": 0.32, ",": 0.14, ":": 0.3}

# --- Línea de tiempo de la narración ---
SR_V = 24000
t = 0.0
escenas, paginas, clips = [], [], []
for s in data:
    ini = t
    t += LEAD.get(s["id"], 0.15)
    frases_rel, textos = [], []
    for f in s["frases"]:
        frases_rel.append(round((t - ini) * FPS))
        clips.append((t, f["file"]))
        palabras = f["text"].split()
        pesos = np.array([len(p) + 2 for p in palabras], dtype=float)
        bordes = np.concatenate([[0], np.cumsum(pesos)]) / pesos.sum() * f["dur"]
        textos.append({"texto": f["text"], "palabras": [round((t - ini + bordes[i]) * FPS) for i in range(len(palabras))]})
        pag = []
        for i, p in enumerate(palabras):
            pag.append({"text": p, "startMs": round((t + bordes[i]) * 1000), "endMs": round((t + bordes[i + 1]) * 1000)})
            if len(pag) == 3 and i < len(palabras) - 1 and len(palabras) - i - 1 >= 2:
                paginas.append(pag); pag = []
        paginas.append(pag)
        t += f["dur"] + GAP.get(f["text"][-1], 0.2)
    t -= GAP.get(s["frases"][-1]["text"][-1], 0.2)
    t += TAIL.get(s["id"], 0.25)
    fr0 = round(ini * FPS); fr1 = round(t * FPS)
    escenas.append({"id": s["id"], "from": fr0, "dur": fr1 - fr0, "frases": frases_rel, "textos": textos})
    t = fr1 / FPS
TOTAL = escenas[-1]["from"] + escenas[-1]["dur"]
print("total frames", TOTAL, TOTAL / FPS, "s")

voz = np.zeros(int(TOTAL / FPS * SR_V) + SR_V)
habla = []
for (st, fn) in clips:
    a, sr = sf.read(fn); i = int(st * SR_V)
    voz[i:i + len(a)] += a; habla.append((st, st + len(a) / sr))
voz = voz / np.max(np.abs(voz)) * 0.95
sf.write(proj + "/public/viral/narracion.wav", voz[: int(TOTAL / FPS * SR_V)], SR_V)

# --- Música y efectos sintetizados ---
SR = 44100
N = int(TOTAL / FPS * SR)
tt = np.arange(N) / SR
rng = np.random.default_rng(7)
def sec(name): e = next(x for x in escenas if x["id"] == name); return e["from"] / FPS, (e["from"] + e["dur"]) / FPS
def nota(n): return 440 * 2 ** ((n - 69) / 12)
def env(n, a, r): x = np.ones(n); a = min(a, n); x[:a] = np.linspace(0, 1, a); r = min(r, n - a); x[n - r:] = np.linspace(1, 0, r) if r > 0 else x[n-r:]; return x
def pad(notas, t0, t1, vol, brillo=3):
    i0, i1 = int(t0 * SR), int(t1 * SR); x = tt[i0:i1] - t0; y = np.zeros(i1 - i0)
    for n in notas:
        f = nota(n)
        for h in range(1, brillo + 1):
            y += np.sin(2 * np.pi * f * h * x * (1 + 0.002 * (h % 2))) / h ** 1.6
    y *= (0.75 + 0.25 * np.sin(2 * np.pi * 0.25 * x)) * env(i1 - i0, int(0.4 * SR), int(0.4 * SR))
    musica[i0:i1] += y / len(notas) * vol
def kick(t0, vol, f0=120, f1=42, dec=0.35):
    i0 = int(t0 * SR); n = int(dec * 1.4 * SR); x = np.arange(n) / SR
    if i0 >= N: return
    fr = f1 + (f0 - f1) * np.exp(-x * 25); ph = 2 * np.pi * np.cumsum(fr) / SR
    y = np.sin(ph) * np.exp(-x / dec * 3); n = min(n, N - i0); musica[i0:i0 + n] += y[:n] * vol
def ruido(t0, dur, vol, dec, dest, hp=False):
    i0 = int(t0 * SR); n = min(int(dur * SR), N - i0); x = np.arange(n) / SR
    y = rng.standard_normal(n)
    if hp: y = np.diff(np.concatenate([[0], y]))
    dest[i0:i0 + n] += y * np.exp(-x / dec) * vol
def tono(t0, freqs, dur, vol, dest, dec=0.4):
    i0 = int(t0 * SR); n = min(int(dur * SR), N - i0); x = np.arange(n) / SR
    y = sum(np.sin(2 * np.pi * f * x) for f in freqs) / len(freqs)
    dest[i0:i0 + n] += y * np.exp(-x / dec) * env(n, 60, 200) * vol
def whoosh(tc, vol=0.35, dur=0.45):
    i0 = int((tc - dur * 0.7) * SR); n = int(dur * SR)
    if i0 < 0: return
    y = rng.standard_normal(n); y = np.convolve(y, np.ones(6) / 6, "same")
    e = np.sin(np.linspace(0, np.pi, n)) ** 2; sfx[i0:i0 + n] += y * e * vol

musica = np.zeros(N); sfx = np.zeros(N)
t_hq0, t_hq1 = sec("HastaQue"); t_tc0, _ = sec("TodoCambio"); t_ms0, t_ms1 = sec("Mensaje"); t_g0, _ = sec("Guardar")
fin = TOTAL / FPS
# Parte oscura: drone en La menor + latido
pad([45, 48, 52], 0, t_hq0, 0.55, 4); pad([33], 0, t_hq0, 0.5, 2)
t_f0, _ = sec("Fracasos")
b = 0.0
while b < t_hq0 - 0.4:
    rate = 1.0 if b < t_f0 else 0.8
    kick(b, 0.55); kick(b + 0.24, 0.35); b += rate
# Subida de tensión
i0, i1 = int(t_hq0 * SR), int(t_tc0 * SR); x = tt[i0:i1] - t_hq0; d = t_tc0 - t_hq0
fr = 150 + 900 * (x / d) ** 2; ph = 2 * np.pi * np.cumsum(fr) / SR
riser = (np.sin(ph) * 0.3 + rng.standard_normal(i1 - i0) * 0.25 * (x / d)) * (x / d) ** 2
riser[-int(0.08 * SR):] = 0; musica[i0:i1] += riser * 0.7
# Parte triunfal: I-V-vi-IV en Do mayor a 110 bpm
beat = 60 / 110; acordes = [[48, 52, 55, 60], [43, 50, 55, 59], [45, 48, 52, 57], [41, 48, 53, 57]]
t0 = t_tc0; k = 0
while t0 < t_ms1:
    t1 = min(t0 + 4 * beat, t_ms1); pad(acordes[k % 4], t0, t1 + 0.1, 0.6, 5)
    for j in range(4):
        tb = t0 + j * beat
        if tb >= t_ms1: break
        kick(tb, 0.7, 150, 45, 0.3); ruido(tb + beat / 2, 0.08, 0.12, 0.02, musica, hp=True)
        for q, n in enumerate([0, 2, 3, 2]):
            tono(tb + q * beat / 4, [nota(acordes[k % 4][n] + 24)], 0.25, 0.10, musica, 0.12)
    t0 += 4 * beat; k += 1
# Cierre suave (CTA y loop) que vuelve al tono oscuro del inicio para el loop
pad([48, 52, 55], t_ms1, t_g0 + 0.8, 0.45, 3); pad([45, 48, 52], t_g0 + 0.5, fin, 0.45, 3); pad([33], t_g0 + 0.5, fin, 0.4, 2)
# Ducking bajo la voz
duck = np.ones(N)
for a, z in habla:
    duck[int(a * SR):int(z * SR)] = 0.55
duck = np.convolve(duck, np.ones(2000) / 2000, "same")
musica *= duck
# Efectos
kick(0.0, 0.0); tono(0.0, [41, 55], 1.6, 0.9, sfx, 0.6); ruido(0.0, 0.6, 0.25, 0.15, sfx)
for e in escenas[1:]:
    whoosh(e["from"] / FPS)
for fr_rel in next(e for e in escenas if e["id"] == "Fracasos")["frases"]:
    tf = t_f0 + fr_rel / FPS; tono(tf, [60, 90], 0.5, 0.8, sfx, 0.18); ruido(tf, 0.2, 0.35, 0.04, sfx, hp=True)
tono(t_tc0, [36, 48], 2.5, 1.0, sfx, 0.9); ruido(t_tc0, 2.5, 0.35, 0.7, sfx, hp=True)
hoy = t_tc0 + next(e for e in escenas if e["id"] == "TodoCambio")["frases"][1] / FPS
tono(hoy, [1318.5, 1760], 0.9, 0.35, sfx, 0.35); tono(hoy + 0.09, [1568, 2093], 0.9, 0.3, sfx, 0.35)
tono(t_g0 + 0.1, [880, 1320], 0.3, 0.35, sfx, 0.08)
mix = musica * 0.22 + sfx * 0.45
mix = mix / max(1.0, np.max(np.abs(mix)) / 0.9)
fade = int(0.3 * SR); mix[-fade:] *= np.linspace(1, 0, fade)
sf.write(proj + "/public/viral/musica-y-efectos.wav", mix, SR)

# --- Datos para Remotion ---
with open(proj + "/src/Viral/datos.ts", "w") as f:
    f.write("// Generado a partir de la narración: tiempos en fotogramas (30 fps) y subtítulos en ms.\n")
    f.write("export const DURACION_TOTAL = %d;\n\n" % TOTAL)
    f.write("export const ESCENAS = %s as const;\n\n" % json.dumps({e["id"]: {"from": e["from"], "dur": e["dur"], "frases": e["frases"]} for e in escenas}, ensure_ascii=False, indent=2))
    f.write("// Texto de cada frase con el fotograma (relativo a la escena) de cada palabra.\n")
    f.write("export const ESCENAS_TEXTO = %s as const;\n\n" % json.dumps({e["id"]: {"from": e["from"], "dur": e["dur"], "frases": e["textos"]} for e in escenas}, ensure_ascii=False, indent=2))
    f.write("export type Palabra = { text: string; startMs: number; endMs: number };\n\n")
    f.write("export const SUBTITULOS: Palabra[][] = %s;\n" % json.dumps(paginas, ensure_ascii=False))
for e in escenas: print(e)
