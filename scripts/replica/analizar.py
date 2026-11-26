#!/usr/bin/env python3
"""Analiza un video de referencia y extrae su estructura audiovisual.

Uso:  python3 scripts/replica/analizar.py VIDEO.mp4 [carpeta_salida]

Genera en la carpeta de salida:
  analisis.json   metadatos, cortes, ritmo de actividad, cambios de subtítulo,
                  paleta dominante, BPM estimado de la música y zonas de la pantalla
  hojas/*.jpg     hojas de contacto (un fotograma cada 0,5 s) para revisar animaciones
"""
import json, os, subprocess, sys
import numpy as np

W, H = 72, 128  # resolución de análisis (9:16)


def ffprobe(v):
    out = subprocess.run(["ffprobe", "-v", "error", "-show_entries",
                          "format=duration:stream=codec_type,width,height,r_frame_rate,sample_rate",
                          "-of", "json", v], capture_output=True, check=True).stdout
    return json.loads(out)


def fotogramas(v, fps):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", v, "-vf", f"fps={fps},scale={W}:{H}",
                          "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.uint8).reshape(-1, H, W, 3).astype(np.float32)


def paleta(frames, k=8):
    px = frames[:: max(1, len(frames) // 40)].reshape(-1, 3)
    px = px[np.random.default_rng(0).choice(len(px), min(20000, len(px)), replace=False)]
    c = px[np.linspace(0, len(px) - 1, k).astype(int)]
    for _ in range(15):
        d = ((px[:, None] - c[None]) ** 2).sum(-1); a = d.argmin(1)
        c = np.array([px[a == i].mean(0) if (a == i).any() else c[i] for i in range(k)])
    peso = np.bincount(a, minlength=k) / len(a)
    orden = np.argsort(-peso)
    return [{"hex": "#%02x%02x%02x" % tuple(int(x) for x in c[i]), "peso": round(float(peso[i]), 3)} for i in orden]


def bpm(v):
    pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", v, "-ac", "1", "-ar", "11025", "-f", "f32le", "-"],
                         capture_output=True, check=True).stdout
    x = np.frombuffer(pcm, np.float32)
    if len(x) == 0:
        return None, []
    hop = 256
    e = np.array([np.sum(x[i:i + hop] ** 2) for i in range(0, len(x) - hop, hop)])
    on = np.maximum(0, np.diff(np.log(e + 1e-9)))
    on -= on.mean()
    ac = np.correlate(on, on, "full")[len(on) - 1:]
    sr = 11025 / hop
    lags = np.arange(len(ac)) / sr
    ok = (lags > 60 / 180) & (lags < 60 / 70)
    lag = lags[ok][np.argmax(ac[ok])]
    rms = [float(np.sqrt(np.mean(x[i:i + 11025] ** 2))) for i in range(0, len(x), 11025)]
    return round(60 / lag, 1), [round(r, 4) for r in rms]


def main():
    v = sys.argv[1]
    out = sys.argv[2] if len(sys.argv) > 2 else os.path.splitext(v)[0] + "_analisis"
    os.makedirs(os.path.join(out, "hojas"), exist_ok=True)
    info = ffprobe(v)
    dur = float(info["format"]["duration"])
    fps = 10
    fr = fotogramas(v, fps)
    gris = fr.mean(-1)
    dif = np.abs(np.diff(gris, axis=0)).mean((1, 2))
    # Cortes: picos muy por encima de la actividad típica.
    umbral = max(25.0, np.percentile(dif, 99.5) * 1.5)
    cortes = [round((i + 1) / fps, 2) for i in np.where(dif > umbral)[0]]
    # Actividad por zonas (subtítulo arriba, escenario, presentador abajo-derecha).
    zonas = {"subtitulo": (slice(0, int(H * .14)), slice(None)), "titulo": (slice(int(H * .2), int(H * .33)), slice(None)),
             "escenario": (slice(int(H * .33), int(H * .68)), slice(None)),
             "presentador": (slice(int(H * .68), None), slice(int(W * .45), None))}
    act = {}
    for z, (a, b) in zonas.items():
        d = np.abs(np.diff(gris[:, a, b], axis=0)).mean((1, 2))
        act[z] = [round(float(d[i:i + fps].mean()), 2) for i in range(0, len(d), fps)]
    # Cambios de subtítulo ≈ palabras/segundo (picos de actividad en la zona superior).
    ds = np.abs(np.diff(gris[:, : int(H * .14)], axis=0)).mean((1, 2))
    cambios = int(((ds[1:-1] > ds[:-2]) & (ds[1:-1] > ds[2:]) & (ds[1:-1] > np.percentile(ds, 60))).sum())
    tempo, volumen = bpm(v)
    # Bloques: segmentos separados por momentos de alta actividad en el título (cambio de paso).
    dt = np.abs(np.diff(gris[:, int(H * .2):int(H * .33)], axis=0)).mean((1, 2))
    picos = [round((i + 1) / fps, 1) for i in range(1, len(dt) - 1)
             if dt[i] > np.percentile(dt, 97) and dt[i] >= dt[i - 1] and dt[i] >= dt[i + 1]]
    bloques = []
    for p in picos:
        if not bloques or p - bloques[-1] > 2.0:
            bloques.append(p)
    res = {
        "archivo": os.path.basename(v), "duracion_s": round(dur, 2),
        "video": [s for s in info["streams"] if s["codec_type"] == "video"][0],
        "cortes_duros": cortes,
        "cambios_de_bloque_s": bloques,
        "palabras_por_segundo_aprox": round(cambios / dur, 2),
        "bpm_musica_aprox": tempo,
        "paleta": paleta(fr),
        "actividad_por_segundo": act,
        "volumen_por_segundo": volumen,
    }
    json.dump(res, open(os.path.join(out, "analisis.json"), "w"), indent=1, ensure_ascii=False)
    # Hojas de contacto: 2 fotogramas por segundo, 8×3 por hoja.
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", v, "-vf", "fps=2,scale=270:480,tile=8x3:padding=4",
                    os.path.join(out, "hojas", "hoja_%02d.jpg")], check=True)
    print(json.dumps({k: res[k] for k in ("duracion_s", "cortes_duros", "cambios_de_bloque_s",
                                          "palabras_por_segundo_aprox", "bpm_musica_aprox")}, ensure_ascii=False))
    print("paleta:", " ".join(c["hex"] for c in res["paleta"]))
    print("salida:", out)


if __name__ == "__main__":
    main()
