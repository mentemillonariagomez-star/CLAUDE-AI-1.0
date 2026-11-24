# Música (tensa de noche, luminosa desde la escena de cambio) y efectos ligados a lo que pasa en pantalla.
import numpy as np, soundfile as sf

FPS, SRM = 30, 44100


def generar_sonido(ep, escenas, habla, TOTAL, salida):
    NM = int(TOTAL / FPS * SRM)
    tt = np.arange(NM) / SRM
    rng = np.random.default_rng(11)
    mus, sfx = np.zeros(NM), np.zeros(NM)
    nota = lambda n: 440 * 2 ** ((n - 69) / 12)

    def add(dest, t0, y):
        i = int(t0 * SRM); n = min(len(y), NM - i)
        if n > 0 and i >= 0: dest[i:i + n] += y[:n]

    def env(n, a=0.01, r=0.2):
        x = np.arange(n) / SRM
        return np.minimum(1, x / a) * np.minimum(1, np.maximum(0, (n / SRM - x) / r))

    def tono(t0, freqs, dur, vol, dest=sfx, dec=8.0):
        n = int(dur * SRM); x = np.arange(n) / SRM
        add(dest, t0, sum(np.sin(2 * np.pi * f * x) for f in freqs) / len(freqs) * np.exp(-x * dec) * env(n, 0.003, 0.02) * vol)

    def kick(t0, vol=0.5):
        x = np.arange(int(0.35 * SRM)) / SRM; f = 45 + 100 * np.exp(-x * 30)
        add(mus, t0, np.sin(2 * np.pi * np.cumsum(f) / SRM) * np.exp(-x * 10) * vol)

    def hat(t0, vol=0.06):
        n = int(0.04 * SRM); x = np.arange(n) / SRM
        add(mus, t0, np.diff(np.concatenate([[0], rng.standard_normal(n)])) * np.exp(-x * 100) * vol)

    def pluck(t0, n_, vol=0.07):
        n = int(0.5 * SRM); x = np.arange(n) / SRM
        add(mus, t0, (np.sin(2 * np.pi * nota(n_) * x) + 0.4 * np.sin(4 * np.pi * nota(n_) * x)) * np.exp(-x * 6) * vol)

    def pad(t0, t1, notas, vol=0.08):
        n = int((t1 - t0) * SRM); x = np.arange(n) / SRM
        y = sum(np.sin(2 * np.pi * nota(m) * x) * (1 + 0.15 * np.sin(2 * np.pi * 0.25 * x)) for m in notas) / len(notas)
        add(mus, t0, y * env(n, 0.3, 0.3) * vol)

    cambio = next((e["from"] for e in escenas if e["id"] == ep.get("cambio_musica")), TOTAL) / FPS
    fin = TOTAL / FPS
    beat = 60 / 100
    oscuro = [[45, 52, 57, 60], [41, 48, 53, 57], [43, 50, 55, 59], [40, 47, 52, 55]]
    claro = [[48, 55, 60, 64], [43, 50, 55, 59], [45, 52, 57, 60], [41, 48, 53, 57]]
    b, i = 0.0, 0
    while b < fin:
        claro_ahora = (b >= cambio) != (ep.get("musica_inicio") == "claro")
        prog = claro if claro_ahora else oscuro
        ac = prog[(i // 8) % 4]
        if i % 8 == 0: pad(b, min(fin, b + beat * 8 + 0.2), ac, 0.09 if claro_ahora else 0.07)
        if i % 2 == 0: kick(b, 0.55 if claro_ahora else 0.45)
        hat(b + beat / 2)
        if claro_ahora or i % 2 == 0: pluck(b, ac[(i // 2) % 4] + 12, 0.07 if claro_ahora else 0.05)
        b += beat; i += 1

    def t_de(e, en):
        fr = e["frases"]
        return (e["from"] + (fr[en] if isinstance(en, int) else fr[en[0]] + en[1])) / FPS

    def whoosh(tc, vol=0.25, dur=0.35):
        n = int(dur * SRM); y = np.convolve(rng.standard_normal(n), np.ones(8) / 8, "same")
        add(sfx, tc - dur * 0.7, y * np.sin(np.linspace(0, np.pi, n)) ** 2 * vol)

    for e in escenas[1:]: whoosh(e["from"] / FPS)
    for e in escenas:
        for st in e.get("estados", [])[1:]:
            if "cam" in st: tono(t_de(e, st["en"]), [180, 90], 0.25, 0.35, dec=14)  # golpe de zoom
        for el in e.get("elementos", []):
            t0 = t_de(e, el["en"]) if "en" in el else None
            tp = el["tipo"]
            if tp in ("tel_vistas", "calendario", "subir", "reloj", "texto_grande", "cuenta", "exportar"): tono(t0, [880, 1320], 0.2, 0.25, dec=18)
            if tp == "cuenta":
                for j in range(int((t_de(e, el["hasta_en"]) - t0) / 0.5)): tono(t0 + 0.3 + j * 0.5, [2200], 0.05, 0.15, dec=60)
            if tp == "exportar":
                tf = t_de(e, el["falla"])
                if el.get("exito"): tono(tf, [784, 1047, 1319], 0.8, 0.4, dec=4)
                else: tono(tf, [70, 52], 1.2, 0.9, dec=2.5); n = int(0.5 * SRM); add(sfx, tf, rng.standard_normal(n) * np.exp(-np.arange(n) / SRM * 8) * 0.25)
            if tp == "tel_vistas" and "comentario" in el: tono(t_de(e, el["comentario"]["en"]), [1318, 1760], 0.4, 0.3, dec=10)
            if tp == "chat":
                if "escribir" in el:
                    t1 = t_de(e, el["escribir"])
                    for j in range(14): tono(t1 + j * 0.07, [2500 + rng.integers(0, 600)], 0.03, 0.12, dec=120)
                for r in el.get("respuestas", []): tono(t_de(e, r["en"]), [988, 1480], 0.35, 0.3, dec=9)
            if tp == "tarjetas":
                for it in el["items"]: tono(t_de(e, it["en"]), [660, 990], 0.25, 0.28, dec=14)
            if tp == "notis":
                a, b2 = t0, t_de(e, el["fin"])
                for j, tn in enumerate(np.linspace(a, b2, 12)): tono(tn, [1568, 2093], 0.15, 0.12 + 0.01 * j, dec=20)
            if tp == "llamada":
                for j in range(3): tono(t0 + j * 0.5, [523, 659], 0.35, 0.22, dec=6)
            if tp == "burbuja": tono(t0, [1046, 1318], 0.3, 0.25, dec=10)
            if tp == "dm":
                tono(t0, [1318, 1975], 0.5, 0.35, dec=8)
    # Golpe final del cliffhanger
    ult = escenas[-1]
    tc = t_de(ult, len(ult["frases"]) - 1)
    tono(tc, [55, 82], 1.6, 0.9, dec=2.2)
    duck = np.ones(NM)
    for a0, a1 in habla: duck[int(a0 * SRM): int(a1 * SRM)] = 0.55
    duck = np.convolve(duck, np.ones(3000) / 3000, "same")
    mix = mus * duck * 0.5 + sfx * 0.6
    mix /= max(1.0, np.max(np.abs(mix)) / 0.9)
    f = int(0.4 * SRM); mix[-f:] *= np.linspace(1, 0, f)
    sf.write(salida, mix, SRM)
