# Música dramática de telenovela (piano y cuerdas en menor) y efectos en cada cambio de escena.
import numpy as np, soundfile as sf

FPS, SRM = 30, 44100


def generar_sonido(escenas, habla, TOTAL, salida):
    NM = int(TOTAL / FPS * SRM)
    rng = np.random.default_rng(21)
    mus, sfx = np.zeros(NM), np.zeros(NM)
    nota = lambda n: 440 * 2 ** ((n - 69) / 12)

    def add(dest, t0, y):
        i = int(t0 * SRM); n = min(len(y), NM - i)
        if n > 0 and i >= 0: dest[i:i + n] += y[:n]

    def piano(t0, n_, vol=0.12, dur=2.2):
        n = int(dur * SRM); x = np.arange(n) / SRM; f = nota(n_)
        y = (np.sin(2 * np.pi * f * x) + 0.5 * np.sin(4 * np.pi * f * x) + 0.2 * np.sin(6 * np.pi * f * x)) * np.exp(-x * 2.2)
        add(mus, t0, y * np.minimum(1, x / 0.005) * vol)

    def cuerdas(t0, t1, notas, vol=0.06):
        n = int((t1 - t0) * SRM); x = np.arange(n) / SRM
        y = sum(np.sin(2 * np.pi * nota(m) * x + 0.3 * np.sin(2 * np.pi * 5 * x)) for m in notas) / len(notas)
        e = np.minimum(1, x / 0.8) * np.minimum(1, np.maximum(0, (n / SRM - x) / 0.8))
        add(mus, t0, y * e * vol)

    def golpe(t0, vol=0.8):
        n = int(1.5 * SRM); x = np.arange(n) / SRM
        add(sfx, t0, (np.sin(2 * np.pi * 50 * x) + 0.5 * np.sin(2 * np.pi * 75 * x)) * np.exp(-x * 2.5) * vol)
        add(sfx, t0, rng.standard_normal(int(0.3 * SRM)) * np.exp(-np.arange(int(0.3 * SRM)) / SRM * 15) * 0.15)

    def whoosh(tc, vol=0.2, dur=0.5):
        n = int(dur * SRM); y = np.convolve(rng.standard_normal(n), np.ones(10) / 10, "same")
        add(sfx, tc - dur * 0.7, y * np.sin(np.linspace(0, np.pi, n)) ** 2 * vol)

    def lluvia(t0, t1, vol=0.06):
        n = int((t1 - t0) * SRM); y = np.convolve(rng.standard_normal(n), np.ones(3) / 3, "same")
        add(sfx, t0, y * vol * np.minimum(1, np.arange(n) / SRM / 0.5))

    # Modo por escena: tierno (mayor), tenso (menor), oscuro (grave)
    modos = {"Batido": "tierno", "Ricos": "tierno", "Puesto": "tierno", "Pina": "tenso", "Llamada": "oscuro", "Nota": "triste",
             "Fiesta": "tenso", "Lluvia": "triste", "Cerrado": "triste", "Giro": "oscuro", "Final": "oscuro"}
    acordes = {"tierno": [[60, 64, 67], [57, 60, 64], [65, 69, 72], [67, 71, 74]], "tenso": [[57, 60, 64], [58, 62, 65], [57, 60, 64], [56, 59, 64]],
               "triste": [[57, 60, 64], [53, 57, 60], [55, 59, 62], [52, 55, 59]], "oscuro": [[45, 48, 52], [46, 49, 53], [45, 48, 52], [44, 47, 52]]}
    for e in escenas:
        t0, t1 = e["from"] / FPS, (e["from"] + e["dur"]) / FPS
        m = modos.get(e["id"], "tierno")
        ac = acordes[m]
        cuerdas(t0, t1 + 0.4, [n - 12 for n in ac[0]], 0.05 if m != "oscuro" else 0.08)
        paso = 0.5 if m == "tierno" else 0.75
        b, i = t0, 0
        while b < t1:
            a = ac[(i // 4) % 4]
            piano(b, a[i % 3] + (12 if m == "tierno" else 0), 0.09 if m != "oscuro" else 0.07)
            b += paso; i += 1
        if e.get("fondo") == "lluvia": lluvia(t0, t1)
        if m in ("oscuro", "tenso") or e["id"] in ("Nota",): golpe(t0 + 0.05, 0.6)
    for e in escenas[1:]: whoosh(e["from"] / FPS)
    if escenas[-1].get("continuara"):
        tf = (escenas[-1]["from"] + escenas[-1]["dur"]) / FPS - 2.6
        golpe(tf, 1.0)
    duck = np.ones(NM)
    for a0, a1 in habla: duck[int(a0 * SRM): int(a1 * SRM)] = 0.5
    duck = np.convolve(duck, np.ones(4000) / 4000, "same")
    mix = mus * duck * 0.55 + sfx * 0.6
    mix /= max(1.0, np.max(np.abs(mix)) / 0.9)
    f = int(0.6 * SRM); mix[-f:] *= np.linspace(1, 0, f)
    sf.write(salida, mix, SRM)
