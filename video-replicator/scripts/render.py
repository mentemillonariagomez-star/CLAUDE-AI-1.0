"""Generación de vídeo vertical a partir de una plantilla y un guion.

Estrategia pensada para Android:
- Cada plano se codifica por separado (grafos de filtros pequeños, poca RAM).
- Los subtítulos se dibujan dentro de cada plano, así la unión final es
  `-c copy` (sin recodificar el vídeo otra vez).
- La pista de audio (voz + música con ducking + normalización) se mezcla en
  una última pasada que solo codifica audio.
"""
from __future__ import annotations

import shutil
import time
from pathlib import Path

from .common import (DIRS, ffmpeg, find_font, has_filter, log, output_resolution, pick_video_encoder,
                     probe, save_json, slugify, warn, expand)
from .tts import synth

IMG_EXT = {".jpg", ".jpeg", ".png", ".webp", ".bmp"}
VID_EXT = {".mp4", ".mov", ".mkv", ".webm", ".m4v", ".3gp"}
AUD_EXT = {".mp3", ".m4a", ".aac", ".ogg", ".opus", ".wav", ".flac"}


def _even(x: float) -> int:
    return int(round(x / 2)) * 2


def _hex(c: str) -> str:
    return "0x" + c.lstrip("#")[:6]


def list_assets() -> list[Path]:
    out = []
    for p in sorted(DIRS["assets"].rglob("*")):
        if p.is_file() and p.parent.name not in ("fonts", "music") and p.suffix.lower() in IMG_EXT | VID_EXT:
            out.append(p)
    return out


def pick_music(cfg: dict) -> Path | None:
    f = expand(cfg["music"].get("file", ""))
    if f and Path(f).is_file():
        return Path(f)
    cands = [p for p in sorted((DIRS["assets"] / "music").glob("*")) if p.suffix.lower() in AUD_EXT]
    return cands[0] if cands else None


def _resolve_asset(name: str | None) -> Path | None:
    if not name:
        return None
    for p in (Path(expand(name)), DIRS["assets"] / name):
        if p.is_file():
            return p
    warn(f"Asset '{name}' no encontrado en assets/")
    return None


def _words(text: str) -> list[str]:
    return text.split()


def _wrap(text: str, max_chars: int) -> list[str]:
    lines, cur = [], ""
    for w in text.split():
        if cur and len(cur) + 1 + len(w) > max_chars:
            lines.append(cur)
            cur = w
        else:
            cur = f"{cur} {w}".strip()
    if cur:
        lines.append(cur)
    return lines


# --------------------------------------------------------------------------
# Planificación
# --------------------------------------------------------------------------
def plan_video(script: dict, tpl: dict, cfg: dict, work: Path, fps: int) -> dict:
    wpm = tpl["narrative"].get("words_per_minute", 150)
    voice_on = tpl["audio"].get("voiceover", True) and cfg["tts"].get("engine") != "none"
    segs = []
    for i, s in enumerate(script["segments"]):
        text = s["text"].strip()
        wav = work / f"voice_{i:02d}.wav"
        vdur = synth(text, wav, cfg) if voice_on else None
        if vdur:
            dur = vdur + 0.45
        else:
            dur = len(_words(text)) / wpm * 60 + 0.6
        dur = max(dur, 1.6 if s.get("role") == "hook" else 1.2)
        segs.append({"index": i, "role": s.get("role", "desarrollo"), "text": text, "asset": s.get("asset"),
                     "voice": str(wav) if vdur else None, "voice_sec": round(vdur, 3) if vdur else None,
                     "frames": int(round(dur * fps))})
    if voice_on and not any(s["voice"] for s in segs):
        warn("No hay motor de voz (instala espeak: pkg install espeak). El vídeo irá sin voz en off.")

    # Planos: se reparte cada segmento según el ritmo del original
    p = tpl["pacing"]
    pattern = p.get("shot_pattern") or [1.0]
    beat = 60 / p["snap_to_beat_bpm"] if p.get("snap_to_beat_bpm") else None
    shots, pi = [], 0
    for s in segs:
        base = p["hook_shot_sec"] if s["role"] == "hook" else p["avg_shot_sec"]
        if beat:
            base = max(1, round(base / beat)) * beat
        total = s["frames"]
        n = max(1, int(round(total / fps / base)))
        n = min(n, max(1, total // int(fps * 0.5)))
        weights = [max(0.4, min(2.5, pattern[(pi + k) % len(pattern)])) for k in range(n)]
        pi += n
        frames = [int(total * w / sum(weights)) for w in weights]
        frames[-1] += total - sum(frames)
        for k, f in enumerate(frames):
            shots.append({"segment": s["index"], "k": k, "n": n, "frames": f})
    return {"segments": segs, "shots": shots}


def caption_events(seg: dict, tpl: dict, fps: int) -> list[dict]:
    """Divide el texto en bloques de N palabras y reparte el tiempo por longitud."""
    c = tpl["captions"]
    words = _words(seg["text"])
    n = max(1, c.get("words_per_caption", 4))
    if seg["role"] == "hook":
        n = max(n, 12)  # el gancho se muestra completo si es corto
    chunks = [" ".join(words[i:i + n]) for i in range(0, len(words), n)] or [seg["text"]]
    dur = seg["frames"] / fps
    start, end = 0.1, max(0.5, (seg["voice_sec"] + 0.15) if seg["voice_sec"] else dur - 0.1)
    end = min(end, dur)
    total_chars = sum(len(x) + 3 for x in chunks)
    t, ev = start, []
    for ch in chunks:
        d = (end - start) * (len(ch) + 3) / total_chars
        ev.append({"start": t, "end": t + d, "text": ch.upper() if c.get("uppercase") else ch})
        t += d
    ev[-1]["end"] = dur  # el último bloque se mantiene hasta el final del segmento
    return ev


# --------------------------------------------------------------------------
# Render de planos
# --------------------------------------------------------------------------
def _background_input(shot: dict, asset: Path | None, tpl: dict, W: int, H: int, fps: int, dur: float, idx: int):
    """Devuelve (args de entrada, cadena de filtros inicial, es_asset)."""
    m = tpl["motion"]
    if asset is None:
        cols = tpl["color"]["background_colors"]
        c0, c1 = cols[idx % len(cols)], cols[(idx + 1) % len(cols)]
        if has_filter("gradients"):
            src = f"gradients=s={W}x{H}:c0={_hex(c0)}:c1={_hex(c1)}:x0=0:y0=0:x1={W}:y1={H}:d={dur:.3f}:r={fps}:speed=0.006"
        else:
            src = f"color=c={_hex(c0)}:s={W}x{H}:d={dur:.3f}:r={fps}"
        return ["-f", "lavfi", "-i", src], "[0:v]setsar=1", False
    z = m.get("zoom", 1.07) if m.get("ken_burns") else 1.0
    SW, SH = _even(W * z), _even(H * z)
    if asset.suffix.lower() in IMG_EXT:
        inp = ["-loop", "1", "-framerate", str(fps), "-t", f"{dur:.3f}", "-i", str(asset)]
    else:
        try:
            vdur = probe(asset)["duration"]
        except Exception:  # noqa: BLE001
            vdur = 0
        off = (idx * 2.3) % max(vdur - dur, 1) if vdur > dur + 1 else 0
        inp = ["-stream_loop", "-1", "-ss", f"{off:.2f}", "-t", f"{dur:.3f}", "-i", str(asset)]
    chain = f"[0:v]fps={fps},scale={SW}:{SH}:force_original_aspect_ratio=increase,crop={SW}:{SH},setsar=1"
    if z > 1.0:
        a, b = [(0, 1), (1, 0), (0.5, 0.5), (0.5, 0.5)][idx % 4]
        c, d = [(0.5, 0.5), (0.5, 0.5), (0, 1), (1, 0)][idx % 4]
        chain += (f",crop={W}:{H}:x='(iw-ow)*({a}+({b}-{a})*t/{dur:.3f})'"
                  f":y='(ih-oh)*({c}+({d}-{c})*t/{dur:.3f})'")
    g = tpl["color"]["grade"]
    chain += f",eq=saturation={g['saturation']}:contrast={g['contrast']}:brightness={g['brightness']}"
    if abs(g.get("warmth", 0)) > 0.02:
        w = g["warmth"] * 0.4
        chain += f",colorbalance=rm={w:.3f}:bm={-w:.3f}:rh={w / 2:.3f}:bh={-w / 2:.3f}"
    return inp, chain, True


def render_shot(i: int, shot: dict, seg: dict, events: list[dict], seg_offset: float, asset: Path | None,
                tpl: dict, cfg: dict, W: int, H: int, fps: int, font: str | None, work: Path,
                fade_in: float, fade_out: float) -> Path:
    dur = shot["frames"] / fps
    inp, chain, is_asset = _background_input(shot, asset, tpl, W, H, fps, dur, i)
    c = tpl["captions"]
    if is_asset and c.get("enabled", True):
        chain += ",drawbox=x=0:y=ih*0.52:w=iw:h=ih*0.48:color=black@0.28:t=fill"
    if fade_in:
        chain += f",fade=t=in:st=0:d={fade_in:.2f}"
    if fade_out:
        chain += f",fade=t=out:st={max(0, dur - fade_out):.3f}:d={fade_out:.2f}"

    if c.get("enabled", True) and font is not None:
        hook = seg["role"] == "hook"
        fs = int(H * c.get("font_scale", 0.052) * (1.2 if hook else 1.0))
        max_chars = max(8, int(W * 0.86 / (fs * 0.56)))
        y_center = 0.42 if hook else c.get("position_y", 0.68)
        color = _hex(c.get("highlight_color", "#ffd400") if hook else c.get("color", "#ffffff"))
        bw = max(2, int(H * c.get("border", 0.006)))
        ff = font.replace("\\", "/").replace("'", "")
        for e_i, ev in enumerate(events):
            a, b = ev["start"] - seg_offset, ev["end"] - seg_offset
            if b <= 0 or a >= dur:
                continue
            a, b = max(0, a), min(dur, b)
            lines = _wrap(ev["text"], max_chars)
            lh = fs * 1.22
            top = H * y_center - lh * len(lines) / 2
            for l_i, line in enumerate(lines):
                tf = f"cap_{i:03d}_{e_i:02d}_{l_i}.txt"
                (work / tf).write_text(line, encoding="utf-8")
                box = ":box=1:boxcolor=black@0.45:boxborderw=18" if c.get("box") else ""
                chain += (f",drawtext=fontfile='{ff}':textfile={tf}:expansion=none:fontsize={fs}"
                          f":fontcolor={color}:borderw={bw}:bordercolor=black@0.9{box}"
                          f":x=(w-text_w)/2:y={int(top + l_i * lh + fs * 0.95)}-ascent:enable='between(t,{a:.3f},{b:.3f})'")
    chain += f",fps={fps},format=yuv420p[v]"
    out = work / f"shot_{i:03d}.mp4"
    ffmpeg([*inp, "-filter_complex", chain, "-map", "[v]", "-frames:v", str(shot["frames"]), "-an",
            *pick_video_encoder(cfg), "-r", str(fps), "-g", str(fps * 2), "-pix_fmt", "yuv420p",
            "-threads", str(cfg["performance"]["threads"]), "-video_track_timescale", "90000", out.name], cwd=work)
    return out


# --------------------------------------------------------------------------
# Audio
# --------------------------------------------------------------------------
def build_audio_args(plan: dict, tpl: dict, cfg: dict, fps: int, total: float, music: Path | None):
    inputs, fc, labels = [], [], []
    for s in plan["segments"]:
        d = s["frames"] / fps
        if s["voice"]:
            inputs.append(["-i", s["voice"]])
        else:
            inputs.append(["-f", "lavfi", "-t", f"{d:.3f}", "-i", "anullsrc=r=44100:cl=mono"])
    for n, s in enumerate(plan["segments"]):
        d = s["frames"] / fps
        fc.append(f"[{n}:a]aformat=sample_rates=44100:channel_layouts=mono,adelay=100,apad,"
                  f"atrim=0:{d:.3f},asetpts=N/SR/TB[s{n}]")
        labels.append(f"[s{n}]")
    fc.append("".join(labels) + f"concat=n={len(labels)}:v=0:a=1,aformat=channel_layouts=stereo[voice]")
    has_voice = any(s["voice"] for s in plan["segments"])
    lufs = tpl["audio"].get("target_lufs", -14)
    if music:
        mi = len(inputs)
        inputs.append(["-stream_loop", "-1", "-i", str(music)])
        vol = cfg["music"].get("volume") or tpl["audio"].get("music_volume", 0.2)
        if not has_voice:
            vol = max(vol, 0.6)
        fc.append(f"[{mi}:a]aformat=sample_rates=44100:channel_layouts=stereo,atrim=0:{total:.3f},asetpts=N/SR/TB,"
                  f"volume={vol},afade=t=out:st={max(0, total - 1.5):.3f}:d=1.5[mus]")
        if has_voice:
            fc.append("[voice]asplit[v1][v2]")
            fc.append("[mus][v2]sidechaincompress=threshold=0.03:ratio=6:attack=15:release=350[duck]")
            fc.append("[v1][duck]amix=inputs=2:duration=first:normalize=0[mix]")
        else:
            fc.append("[voice][mus]amix=inputs=2:duration=first:normalize=0[mix]")
    else:
        fc.append("[voice]anull[mix]")
    if has_voice or music:
        fc.append(f"[mix]loudnorm=I={lufs}:TP=-1.5:LRA=11,aresample=44100[aout]")
    else:
        fc.append("[mix]anull[aout]")
    return [a for i in inputs for a in i], ";".join(fc), len(inputs)


# --------------------------------------------------------------------------
# Render completo
# --------------------------------------------------------------------------
def render(script: dict, tpl: dict, cfg: dict, out_path: Path | None = None, keep: bool = False) -> Path:
    t0 = time.time()
    W, H = output_resolution(cfg)
    fps = int(cfg["output"].get("fps") or tpl["format"].get("fps", 30))
    job = f"{slugify(script.get('title', 'video'))}_{time.strftime('%Y%m%d_%H%M%S')}"
    work = DIRS["output"] / ".work" / job
    work.mkdir(parents=True, exist_ok=True)
    out_path = out_path or DIRS["output"] / f"{job}.mp4"
    font = find_font(cfg)
    if font is None:
        warn("No se encontró ninguna fuente TTF: copia una a assets/fonts/. El vídeo saldrá sin subtítulos.")
    log(f"Generando {W}x{H} @ {fps} fps · plantilla «{tpl['name']}» · {len(script['segments'])} segmentos")

    log("Sintetizando voz y planificando planos…")
    plan = plan_video(script, tpl, cfg, work, fps)
    segs = plan["segments"]
    assets = list_assets()
    music = pick_music(cfg)
    total = sum(s["frames"] for s in segs) / fps
    log(f"  {len(plan['shots'])} planos · duración {total:.1f} s · assets: {len(assets)} · música: "
        f"{music.name if music else 'no'}")

    ttype = tpl["transitions"]["type"]
    tdur = 0.18 if ttype == "dissolve" else tpl["transitions"].get("duration_sec", 0.25)
    seg_start_frame = {}
    acc = 0
    for s in segs:
        seg_start_frame[s["index"]] = acc
        acc += s["frames"]
    events = {s["index"]: caption_events(s, tpl, fps) for s in segs}

    shot_files, asset_i, offset_in_seg = [], 0, {}
    for i, sh in enumerate(plan["shots"]):
        seg = segs[sh["segment"]]
        pinned = _resolve_asset(seg["asset"]) if sh["k"] == 0 else None
        if pinned:
            asset = pinned
        elif assets:
            asset = assets[asset_i % len(assets)]
            asset_i += 1
        else:
            asset = None
        off = offset_in_seg.get(seg["index"], 0)
        offset_in_seg[seg["index"]] = off + sh["frames"]
        first_overall, last_overall = i == 0, i == len(plan["shots"]) - 1
        fade_in = tdur if (ttype != "cut" and sh["k"] == 0 and not first_overall) else 0
        fade_out = tdur if (ttype != "cut" and sh["k"] == sh["n"] - 1 and not last_overall) else 0
        if last_overall and ttype != "cut":
            fade_out = 0.4
        log(f"  Plano {i + 1}/{len(plan['shots'])} ({sh['frames'] / fps:.2f} s, "
            f"{asset.name if asset else 'fondo generado'})")
        sh["asset"] = asset.name if asset else None
        shot_files.append(render_shot(i, sh, seg, events[seg["index"]], off / fps, asset, tpl, cfg, W, H, fps,
                                      font, work, fade_in, fade_out))

    log("Uniendo planos…")
    (work / "list.txt").write_text("".join(f"file '{p.name}'\n" for p in shot_files))
    ffmpeg(["-f", "concat", "-safe", "0", "-i", "list.txt", "-c", "copy", "video.mp4"], cwd=work)

    log("Mezclando voz, música y normalizando volumen…")
    a_in, a_fc, n_in = build_audio_args(plan, tpl, cfg, fps, total, music)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    ffmpeg([*a_in, "-i", str(work / "video.mp4"), "-filter_complex", a_fc,
            "-map", f"{n_in}:v", "-map", "[aout]", "-c:v", "copy", "-c:a", "aac",
            "-b:a", cfg["output"].get("audio_bitrate", "128k"), "-t", f"{total:.3f}",
            "-movflags", "+faststart", str(out_path)])

    info = probe(out_path)
    report = {
        "output": str(out_path),
        "resolution": f"{info['video']['width']}x{info['video']['height']}",
        "duration": round(info["duration"], 2),
        "size_mb": round(info["size_bytes"] / 1e6, 2),
        "elapsed_sec": round(time.time() - t0, 1),
        "template": tpl["name"],
        "script": script,
        "segments": [{k: v for k, v in s.items() if k != "voice"} for s in segs],
        "shots": plan["shots"],
        "captions": events,
        "font": font,
        "music": str(music) if music else None,
    }
    save_json(out_path.with_suffix(".json"), report)
    if not keep:
        shutil.rmtree(work, ignore_errors=True)
    log(f"Listo: {out_path} ({report['resolution']}, {report['duration']} s, {report['size_mb']} MB, "
        f"{report['elapsed_sec']} s de render)")
    return out_path
