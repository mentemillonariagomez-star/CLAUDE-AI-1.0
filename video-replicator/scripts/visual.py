"""Análisis visual: escenas, transiciones, ritmo, fotogramas clave, color y composición.

Todo el trabajo pesado lo hace FFmpeg sobre una versión reducida del vídeo
(320 px y 8 fps por defecto), y Python solo procesa miniaturas de 90 px, por lo
que funciona en móviles modestos. OpenCV se usa solo si está instalado
(detección de caras para la composición).
"""
from __future__ import annotations

import colorsys
import math
import statistics
from pathlib import Path

from .common import ffmpeg, log, warn

try:  # OpenCV es opcional
    import cv2  # type: ignore
except Exception:  # pragma: no cover - depende del dispositivo
    cv2 = None


# --------------------------------------------------------------------------
# 1. Señal por fotograma (una sola pasada de FFmpeg)
# --------------------------------------------------------------------------
def frame_signals(video: Path, work: Path, cfg: dict) -> list[dict]:
    """Devuelve [{t, scene, yavg, sat}] para cada fotograma muestreado."""
    perf = cfg["performance"]
    vf = (
        f"scale={perf['analysis_width']}:-2,fps={perf['analysis_fps']},"
        "signalstats,select='gte(scene\\,0)',metadata=print:file=frames.txt"
    )
    ffmpeg(["-i", str(Path(video).resolve()), "-an", "-sn", "-dn", "-vf", vf, "-f", "null", "-"], cwd=work)
    frames, cur = [], None
    for line in (work / "frames.txt").read_text(errors="replace").splitlines():
        if line.startswith("frame:"):
            if cur:
                frames.append(cur)
            t = 0.0
            for part in line.split():
                if part.startswith("pts_time:"):
                    t = float(part.split(":", 1)[1])
            cur = {"t": t, "scene": 0.0, "yavg": 0.0, "sat": 0.0}
        elif cur is not None and "=" in line:
            k, v = line.split("=", 1)
            try:
                if k.endswith("scene_score"):
                    cur["scene"] = float(v)
                elif k.endswith("signalstats.YAVG"):
                    cur["yavg"] = float(v)
                elif k.endswith("signalstats.SATAVG"):
                    cur["sat"] = float(v)
            except ValueError:
                pass
    if cur:
        frames.append(cur)
    if frames:
        frames[0]["scene"] = 0.0
    return frames


# --------------------------------------------------------------------------
# 2. Escenas y transiciones
# --------------------------------------------------------------------------
def detect_scenes(frames: list[dict], duration: float, cfg: dict) -> dict:
    thr = cfg["analysis"]["scene_threshold"]
    min_len = cfg["analysis"]["min_scene_sec"]
    if not frames:
        return {"scenes": [{"start": 0.0, "end": duration}], "transitions": []}
    dt = frames[1]["t"] - frames[0]["t"] if len(frames) > 1 else 0.125
    scores = [f["scene"] for f in frames]

    boundaries = []  # (t, tipo)

    # a) cortes duros
    for f in frames[1:]:
        if f["scene"] >= thr:
            boundaries.append((f["t"], "cut"))

    # b) fundidos a negro: tramos con luminancia casi negra (YAVG ~16 en rango limitado)
    black = [f["yavg"] <= 22 for f in frames]
    i = 0
    while i < len(frames):
        if black[i]:
            j = i
            while j + 1 < len(frames) and black[j + 1]:
                j += 1
            t0, t1 = frames[i]["t"], frames[j]["t"]
            if t0 > 0.3 and t1 < duration - 0.3:
                boundaries.append(((t0 + t1) / 2, "fade_black"))
            i = j + 1
        else:
            i += 1

    # c) fundidos encadenados: cambio acumulado en ~1 s muy superior al movimiento local,
    #    sin un salto único que supere el umbral de corte.
    win = max(3, int(round(1.0 / dt)))
    ctx = max(win, int(round(2.0 / dt)))
    soft = [s if s < thr else 0.0 for s in scores]
    i = 1
    while i + win <= len(frames):
        w = soft[i:i + win]
        total = sum(w)
        active = sum(1 for s in w if s > 0.012)
        near_black = any(frames[j]["yavg"] <= 30 for j in range(max(0, i - 2), min(len(frames), i + win + 2)))
        if total >= 0.15 and active >= 3 and not near_black:
            around = soft[max(1, i - ctx):i] + soft[i + win:i + win + ctx]
            local = statistics.median(around) if around else 0.0
            if local * win * 3 < total:
                tc = sum(frames[i + k]["t"] * w[k] for k in range(win)) / total
                boundaries.append((tc, "dissolve"))
                i += win
                continue
        i += 1

    # Fusionar límites cercanos; un corte junto a un fundido se clasifica como fundido
    boundaries.sort()
    merged = []
    for t, kind in boundaries:
        if merged and t - merged[-1][0] < max(min_len, 0.5):
            prio = {"cut": 0, "dissolve": 1, "fade_black": 2}
            if prio[kind] > prio[merged[-1][1]]:
                merged[-1] = (t if kind == "fade_black" else merged[-1][0], kind)
            continue
        merged.append((t, kind))
    merged = [(t, k) for t, k in merged if min_len <= t <= duration - min_len]

    cuts = [0.0] + [t for t, _ in merged] + [duration]
    scenes = [{"start": round(a, 3), "end": round(b, 3), "duration": round(b - a, 3)} for a, b in zip(cuts, cuts[1:])]
    transitions = [{"time": round(t, 3), "type": k} for t, k in merged]

    # Movimiento dentro de los planos (excluye fotogramas de corte)
    cut_set = {round(t, 2) for t, _ in merged}
    inner = [f["scene"] for f in frames[1:] if round(f["t"], 2) not in cut_set and f["scene"] < thr]
    motion = statistics.mean(inner) if inner else 0.0
    return {"scenes": scenes, "transitions": transitions, "motion_score": round(motion, 4)}


def pacing_stats(scenes: list[dict], duration: float) -> dict:
    lens = [s["duration"] for s in scenes] or [duration]
    thirds = {"intro": [], "middle": [], "outro": []}
    for s in scenes:
        mid = (s["start"] + s["end"]) / 2 / max(duration, 0.001)
        key = "intro" if mid < 1 / 3 else ("middle" if mid < 2 / 3 else "outro")
        thirds[key].append(s["duration"])
    avg = statistics.mean(lens)
    return {
        "scene_count": len(scenes),
        "avg_shot_sec": round(avg, 3),
        "median_shot_sec": round(statistics.median(lens), 3),
        "min_shot_sec": round(min(lens), 3),
        "max_shot_sec": round(max(lens), 3),
        "shot_stdev_sec": round(statistics.pstdev(lens), 3),
        "cuts_per_minute": round((len(scenes) - 1) / max(duration, 0.001) * 60, 2),
        "first_shot_sec": round(lens[0], 3),
        "avg_by_section": {k: round(statistics.mean(v), 3) if v else None for k, v in thirds.items()},
        # patrón relativo de duraciones (para reproducir el ritmo)
        "shot_pattern": [round(x / avg, 3) for x in lens[:24]],
        "rhythm": "rápido" if avg < 1.5 else ("medio" if avg < 4 else "lento"),
    }


# --------------------------------------------------------------------------
# 3. Fotogramas clave
# --------------------------------------------------------------------------
def extract_keyframes(video: Path, scenes: list[dict], out_dir: Path, cfg: dict, src_w: int, src_h: int) -> list[dict]:
    out_dir.mkdir(parents=True, exist_ok=True)
    maxk = cfg["performance"]["max_keyframes"]
    idx = list(range(len(scenes)))
    if len(idx) > maxk:
        step = len(idx) / maxk
        idx = [int(i * step) for i in range(maxk)]
    sw = 90
    sh = max(2, int(round(sw * src_h / max(src_w, 1) / 2)) * 2)
    frames = []
    for n, i in enumerate(idx, 1):
        s = scenes[i]
        t = s["start"] + s["duration"] * 0.5
        jpg = out_dir / f"kf_{n:03d}.jpg"
        fc = f"[0:v]split[a][b];[a]scale=540:-2[o1];[b]scale={sw}:{sh}[o2]"
        proc = ffmpeg(
            ["-ss", f"{t:.3f}", "-i", str(video), "-filter_complex", fc,
             "-map", "[o1]", "-frames:v", "1", "-q:v", "3", str(jpg),
             "-map", "[o2]", "-frames:v", "1", "-f", "rawvideo", "-pix_fmt", "rgb24", "pipe:1"],
            binary=True,
        )
        raw = proc.stdout
        if len(raw) < sw * sh * 3:
            warn(f"No se pudo leer el fotograma en t={t:.2f}s")
            continue
        frames.append({"scene": i, "time": round(t, 3), "file": str(jpg), "w": sw, "h": sh, "raw": raw[: sw * sh * 3]})
    return frames


def contact_sheet(kf_dir: Path, count: int, out: Path) -> str | None:
    if count == 0:
        return None
    cols = min(6, count)
    rows = math.ceil(count / cols)
    try:
        ffmpeg(["-framerate", "1", "-i", str(kf_dir / "kf_%03d.jpg"),
                "-vf", f"scale=180:-2,tile={cols}x{rows}:padding=4:color=black", "-frames:v", "1", str(out)])
        return str(out)
    except Exception as e:  # noqa: BLE001 - la hoja de contactos es opcional
        warn(f"Sin hoja de contactos: {e}")
        return None


# --------------------------------------------------------------------------
# 4. Color
# --------------------------------------------------------------------------
def _pixels(raw: bytes, step: int = 1):
    for i in range(0, len(raw) - 2, 3 * step):
        yield raw[i], raw[i + 1], raw[i + 2]


def _kmeans(points: list[tuple], k: int = 6, iters: int = 8) -> list[tuple]:
    if not points:
        return []
    k = min(k, len(points))
    # inicialización determinista por puntos lejanos
    cents = [points[len(points) // 2]]
    while len(cents) < k:
        best, bd = None, -1
        for p in points[:: max(1, len(points) // 400)]:
            d = min((p[0] - c[0]) ** 2 + (p[1] - c[1]) ** 2 + (p[2] - c[2]) ** 2 for c in cents)
            if d > bd:
                best, bd = p, d
        cents.append(best)
    counts = [0] * k
    for _ in range(iters):
        sums = [[0, 0, 0] for _ in range(k)]
        counts = [0] * k
        for p in points:
            bi, bd = 0, 1e18
            for ci, c in enumerate(cents):
                d = (p[0] - c[0]) ** 2 + (p[1] - c[1]) ** 2 + (p[2] - c[2]) ** 2
                if d < bd:
                    bi, bd = ci, d
            s = sums[bi]
            s[0] += p[0]; s[1] += p[1]; s[2] += p[2]
            counts[bi] += 1
        cents = [(s[0] / n, s[1] / n, s[2] / n) if n else c for s, n, c in zip(sums, counts, cents)]
    total = sum(counts) or 1
    out = sorted(zip(cents, counts), key=lambda x: -x[1])
    return [(c, n / total) for c, n in out if n]


def hexcolor(c) -> str:
    return "#%02x%02x%02x" % tuple(max(0, min(255, int(round(v)))) for v in c)


def color_analysis(keyframes: list[dict]) -> dict:
    pts, per_frame = [], []
    for kf in keyframes:
        lum, sat, warm = [], [], []
        for r, g, b in _pixels(kf["raw"]):
            lum.append(0.299 * r + 0.587 * g + 0.114 * b)
            _, s, _ = colorsys.rgb_to_hsv(r / 255, g / 255, b / 255)
            sat.append(s)
            warm.append((r - b) / 255)
        pts.extend(_pixels(kf["raw"], step=3))
        per_frame.append({
            "time": kf["time"],
            "brightness": round(statistics.mean(lum) / 255, 3),
            "contrast": round(statistics.pstdev(lum) / 255, 3),
            "saturation": round(statistics.mean(sat), 3),
            "warmth": round(statistics.mean(warm), 3),
        })
    if not per_frame:
        return {}
    palette = _kmeans(pts, k=6)

    def avg(key):
        return round(statistics.mean(f[key] for f in per_frame), 3)

    pal = [{"hex": hexcolor(c), "share": round(s, 3), "rgb": [int(v) for v in c]} for c, s in palette]
    # color de acento: el más saturado con presencia mínima
    accent = max(pal, key=lambda p: colorsys.rgb_to_hsv(*[v / 255 for v in p["rgb"]])[1] * (p["share"] > 0.03))
    b, w, s = avg("brightness"), avg("warmth"), avg("saturation")
    return {
        "palette": pal,
        "accent": accent["hex"],
        "brightness": b,
        "contrast": avg("contrast"),
        "saturation": s,
        "warmth": w,
        "mood": ("oscuro" if b < 0.3 else "luminoso" if b > 0.6 else "equilibrado")
        + (", cálido" if w > 0.06 else ", frío" if w < -0.06 else ", neutro")
        + (", saturado" if s > 0.45 else ", apagado" if s < 0.18 else ""),
        "per_keyframe": per_frame,
    }


# --------------------------------------------------------------------------
# 5. Composición y zonas de texto
# --------------------------------------------------------------------------
def _gray(kf):
    raw = kf["raw"]
    return [0.299 * raw[i] + 0.587 * raw[i + 1] + 0.114 * raw[i + 2] for i in range(0, len(raw), 3)]


def _faces(jpg: str):
    if cv2 is None:
        return None
    try:
        casc_dir = getattr(getattr(cv2, "data", None), "haarcascades", None)
        if not casc_dir:
            return None
        casc = cv2.CascadeClassifier(casc_dir + "haarcascade_frontalface_default.xml")
        img = cv2.imread(jpg, cv2.IMREAD_GRAYSCALE)
        if img is None or casc.empty():
            return None
        h, w = img.shape[:2]
        faces = casc.detectMultiScale(img, 1.15, 5, minSize=(int(w * 0.06), int(w * 0.06)))
        return [{"cx": (x + fw / 2) / w, "cy": (y + fh / 2) / h, "size": fw / w} for (x, y, fw, fh) in faces]
    except Exception:  # noqa: BLE001
        return None


def composition_analysis(keyframes: list[dict]) -> dict:
    res = []
    bands_total = {"top": 0.0, "middle": 0.0, "bottom": 0.0}
    face_frames = 0
    for kf in keyframes:
        w, h = kf["w"], kf["h"]
        g = _gray(kf)
        ex = ey = etot = 0.0
        texty_rows = []
        for y in range(1, h - 1):
            row = y * w
            trans = 0
            for x in range(1, w - 1):
                gx = abs(g[row + x + 1] - g[row + x - 1])
                gy = abs(g[row + w + x] - g[row - w + x])
                e = gx + gy
                ex += e * x; ey += e * y; etot += e
                if gx > 70:
                    trans += 1
            texty_rows.append(trans > 0.16 * w)
        cx = ex / etot / w if etot else 0.5
        cy = ey / etot / h if etot else 0.5
        n = len(texty_rows)
        bands = {
            "top": sum(texty_rows[: n // 3]) / max(1, n // 3),
            "middle": sum(texty_rows[n // 3: 2 * n // 3]) / max(1, n // 3),
            "bottom": sum(texty_rows[2 * n // 3:]) / max(1, n - 2 * n // 3),
        }
        for k in bands:
            bands_total[k] += bands[k]
        faces = _faces(kf["file"])
        if faces:
            face_frames += 1
            big = max(faces, key=lambda f: f["size"])
            cx, cy = big["cx"], big["cy"]
        thirds = min(math.hypot(cx - a, cy - b) for a in (1 / 3, 2 / 3) for b in (1 / 3, 2 / 3))
        if abs(cx - 0.5) < 0.1 and abs(cy - 0.5) < 0.15:
            layout = "centrado"
        elif thirds < 0.12:
            layout = "regla de tercios"
        else:
            layout = "libre"
        res.append({"time": kf["time"], "subject_x": round(cx, 3), "subject_y": round(cy, 3), "layout": layout,
                    "faces": len(faces) if faces else 0, "text_bands": {k: round(v, 3) for k, v in bands.items()}})
    if not res:
        return {}
    k = len(res)
    bands_avg = {b: round(v / k, 3) for b, v in bands_total.items()}
    text_band = max(bands_avg, key=bands_avg.get)
    layouts = [r["layout"] for r in res]
    return {
        "dominant_layout": max(set(layouts), key=layouts.count),
        "subject_x_avg": round(statistics.mean(r["subject_x"] for r in res), 3),
        "subject_y_avg": round(statistics.mean(r["subject_y"] for r in res), 3),
        "face_ratio": round(face_frames / k, 3) if cv2 is not None else None,
        "opencv": cv2 is not None,
        "text_bands_avg": bands_avg,
        "probable_text_position": text_band if bands_avg[text_band] > 0.08 else None,
        "per_keyframe": res,
    }


def run_visual(video: Path, info: dict, work: Path, ref_dir: Path, cfg: dict) -> dict:
    v = info["video"]
    log("Detectando escenas, transiciones y movimiento…")
    frames = frame_signals(video, work, cfg)
    sc = detect_scenes(frames, info["duration"], cfg)
    pacing = pacing_stats(sc["scenes"], info["duration"])
    log(f"  {pacing['scene_count']} escenas · plano medio {pacing['avg_shot_sec']} s · {len(sc['transitions'])} transiciones")
    log("Extrayendo fotogramas representativos…")
    kfs = extract_keyframes(video, sc["scenes"], ref_dir / "keyframes", cfg, v["width"], v["height"])
    sheet = contact_sheet(ref_dir / "keyframes", len(kfs), ref_dir / "contact_sheet.jpg")
    log("Analizando color y composición…")
    colors = color_analysis(kfs)
    comp = composition_analysis(kfs)
    trans_types = [t["type"] for t in sc["transitions"]]
    lum = [f["yavg"] for f in frames]
    return {
        "scenes": sc["scenes"],
        "transitions": sc["transitions"],
        "transition_summary": {t: trans_types.count(t) for t in sorted(set(trans_types))},
        "pacing": pacing,
        "motion": {
            "score": sc.get("motion_score", 0),
            "level": "bajo" if sc.get("motion_score", 0) < 0.02 else ("medio" if sc.get("motion_score", 0) < 0.06 else "alto"),
        },
        "luma_curve": [round(statistics.mean(lum[i:i + 8]) / 255, 3) for i in range(0, len(lum), 8)],
        "keyframes": [{"scene": k["scene"], "time": k["time"], "file": k["file"]} for k in kfs],
        "contact_sheet": sheet,
        "color": colors,
        "composition": comp,
    }
