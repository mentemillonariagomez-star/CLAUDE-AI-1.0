# Música lo-fi y efectos (whoosh en cortes, pop en cada frase), con la música bajando bajo la voz.
import numpy as np, soundfile as sf


def generar_musica(TOTAL, escenas, habla, salida, estilo=0, bpm=92, semilla=1):
    """habla: lista de (inicio_s, fin_s) donde hay voz."""
    FPS = 30
    # Música lo-fi + efectos (whoosh en cortes, pop en cada frase)
    SRM = 44100; NM = int(TOTAL / FPS * SRM)
    rng = np.random.default_rng(semilla)
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
        add(mus, t0, y * np.minimum(1, x / 0.05) * np.exp(-x * 0.9) * vol)
    PROGS = [[[57, 60, 64, 67], [53, 57, 60, 64], [48, 52, 55, 59], [55, 59, 62, 65]],
             [[50, 53, 57, 60], [55, 58, 62, 65], [48, 52, 55, 58], [53, 57, 60, 64]],
             [[52, 55, 59, 62], [48, 52, 55, 59], [55, 59, 62, 65], [50, 54, 57, 60]]]
    prog = PROGS[estilo % len(PROGS)]
    beat = 60 / bpm
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
    duck = np.ones(NM)
    for a0, a1 in habla: duck[int(a0 * SRM): int(a1 * SRM)] = 0.5
    duck = np.convolve(duck, np.ones(3000) / 3000, "same")
    mix = mus * duck * 0.25 + sfx * 0.5
    mix /= max(1.0, np.max(np.abs(mix)) / 0.9)
    fade = int(0.5 * SRM); mix[-fade:] *= np.linspace(1, 0, fade)
    sf.write(salida, mix, SRM)

