#!/usr/bin/env python3
"""Replicador: guion.json -> voz (ElevenLabs) -> línea de tiempo -> música/efectos -> datos -> MP4.

Uso:  python3 scripts/replica/generar.py scripts/replica/<slug>/guion.json [--render]

- Las *palabras* entre asteriscos salen en serif cursiva roja en el subtítulo.
- "marcas" y "eventos" se anclan a palabras del texto de la escena:
    "palabra"      primera vez que se pronuncia
    "palabra#2"    segunda vez
    "palabra+6"    6 fotogramas después
    número         fotograma fijo dentro de la escena
"""
import base64, glob, hashlib, json, os, re, subprocess, sys, unicodedata
import urllib.request
import numpy as np
import soundfile as sf

FPS, SR = 30, 44100
RAIZ = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))


def norm(p):
    p = unicodedata.normalize("NFD", p.lower())
    return re.sub(r"[^a-z0-9ñ]", "", "".join(c for c in p if unicodedata.category(c) != "Mn"))


def tts(texto, voz, cache):
    """Llama a ElevenLabs con marcas de tiempo por carácter (en caché por hash)."""
    clave = hashlib.sha1(json.dumps([texto, voz], sort_keys=True).encode()).hexdigest()[:12]
    ruta = os.path.join(cache, f"tts-{clave}.json")
    if os.path.exists(ruta):
        return json.load(open(ruta))
    cuerpo = {
        "text": texto,
        "model_id": voz.get("modelo", "eleven_multilingual_v2"),
        "voice_settings": {
            "stability": voz.get("estabilidad", 0.42),
            "similarity_boost": 0.8,
            "style": voz.get("estilo", 0.35),
            "use_speaker_boost": True,
            "speed": voz.get("velocidad", 1.06),
        },
    }
    req = urllib.request.Request(
        f"https://api.elevenlabs.io/v1/text-to-speech/{voz['id']}/with-timestamps?output_format=mp3_44100_128",
        data=json.dumps(cuerpo).encode(),
        headers={"Content-Type": "application/json", "xi-api-key": os.environ.get("ELEVENLABS_API_KEY", "proxy")},
    )
    d = json.load(urllib.request.urlopen(req, timeout=300))
    os.makedirs(cache, exist_ok=True)
    json.dump(d, open(ruta, "w"))
    return d


def palabras_con_tiempo(texto, al):
    """Une el texto con la alineación por caracteres -> [(palabra, inicio_s, fin_s)]."""
    chars, ini, fin = al["characters"], al["character_start_times_seconds"], al["character_end_times_seconds"]
    plano = "".join(chars)
    assert plano == texto, "la alineación no coincide con el texto"
    out = []
    for mt in re.finditer(r"\S+", texto):
        a, b = mt.start(), mt.end() - 1
        out.append((mt.group(), ini[a], fin[b]))
    return out


def envolvente(mp3, total):
    pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", mp3, "-ac", "1", "-ar", "16000", "-f", "f32le", "-"], capture_output=True, check=True).stdout
    x = np.frombuffer(pcm, np.float32)
    paso = 16000 // FPS
    rms = np.array([np.sqrt(np.mean(x[i * paso:(i + 1) * paso] ** 2)) if i * paso < len(x) else 0 for i in range(total)])
    rms = rms / (np.percentile(rms[rms > 0], 95) + 1e-9)
    rms = np.clip((rms - 0.08) / 0.92, 0, 1)
    out, v = [], 0.0
    for r in rms:  # ataque rápido, caída suave
        v = r if r > v else v * 0.55 + r * 0.45
        out.append(round(float(v), 3))
    return out, x


def resolver(ref, palabras, desde):
    """Ancla -> fotograma relativo a la escena."""
    if isinstance(ref, (int, float)):
        return int(ref)
    m = re.match(r"^(.*?)(?:#(\d+))?([+-]\d+)?$", ref)
    w, n, off = norm(m.group(1)), int(m.group(2) or 1), int(m.group(3) or 0)
    vistos = 0
    for p in palabras:
        if norm(p["t"]) == w:
            vistos += 1
            if vistos == n:
                return p["f"] + off
    raise SystemExit(f"No encuentro la palabra '{ref}' en la escena")


# ----------------------------- audio -----------------------------
def sintetizar(total_s, escenas, voz_x):
    N = int(total_s * SR) + SR
    t = np.arange(N) / SR
    mus, sfx = np.zeros(N), np.zeros(N)
    rng = np.random.default_rng(5)
    nota = lambda n: 440 * 2 ** ((n - 69) / 12)

    def tono(dest, t0, f0, f1, dur, vol, dec):
        i0 = int(t0 * SR); n = min(int(dur * SR), N - i0)
        if n <= 0 or i0 < 0: return
        x = np.arange(n) / SR; fr = f1 + (f0 - f1) * np.exp(-x * 40)
        dest[i0:i0 + n] += np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.exp(-x / dec) * vol

    def ruido(dest, t0, dur, vol, suave=1, forma="dec"):
        i0 = int(t0 * SR); n = min(int(dur * SR), N - i0)
        if n <= 0 or i0 < 0: return
        y = rng.standard_normal(n)
        if suave > 1: y = np.convolve(y, np.ones(suave) / suave, "same")
        env = np.exp(-np.arange(n) / SR / (dur / 4)) if forma == "dec" else np.sin(np.linspace(0, np.pi, n)) ** 2
        dest[i0:i0 + n] += y * env * vol

    # Música: pop ligero a 100 bpm, I–V–vi–IV en Do, piano eléctrico + bajo + batería suave.
    beat = 60 / 100
    acordes = [[60, 64, 67, 71], [55, 59, 62, 67], [57, 60, 64, 69], [53, 57, 60, 65]]
    bajos = [36, 43, 45, 41]
    b, k = 0.0, 0
    while b < total_s:
        for j in range(4):
            tb = b + j * beat
            for n_ in acordes[k % 4]:
                tono(mus, tb, nota(n_), nota(n_), beat * 0.95, 0.10, 0.35)
                tono(mus, tb, nota(n_ + 12), nota(n_ + 12), beat * 0.5, 0.03, 0.12)
            tono(mus, tb, nota(bajos[k % 4]), nota(bajos[k % 4]), beat * 0.9, 0.35, 0.3)
            if j in (0, 2): tono(mus, tb, 120, 48, 0.3, 0.9, 0.12)
            if j in (1, 3): ruido(mus, tb, 0.15, 0.22, 2)
            ruido(mus, tb + beat / 2, 0.04, 0.06)
            ruido(mus, tb, 0.04, 0.06)
        b += 4 * beat; k += 1
    # Ducking bajo la voz.
    vz = np.interp(np.arange(N) / SR, np.arange(len(voz_x)) / 16000, np.abs(voz_x), right=0)
    vz = np.convolve(vz, np.ones(4000) / 4000, "same")
    mus *= 1 - 0.55 * np.clip(vz / (np.percentile(vz, 90) + 1e-9), 0, 1)

    # Efectos sincronizados con la línea de tiempo.
    for i, e in enumerate(escenas):
        t0 = e["from"] / FPS
        if i: ruido(sfx, t0 - 0.22, 0.4, 0.35, 10, "swell")          # whoosh de cambio de paso
        if e.get("titulo", {}).get("num") is not None:
            tono(sfx, t0 + 2 / FPS, 700, 1300, 0.12, 0.35, 0.04)      # pop de la insignia
        for nombre, fr in e["marcas"].items():
            ts = t0 + fr / FPS
            if nombre in ("clic", "crear", "seguir", "resaltar"):
                tono(sfx, ts, 2400, 1800, 0.03, 0.4, 0.008); ruido(sfx, ts, 0.02, 0.15)
            elif re.match(r"^[ifc]\d+$", nombre):
                tono(sfx, ts, 900 + 120 * int(nombre[1:]), 1500 + 120 * int(nombre[1:]), 0.09, 0.22, 0.03)
            elif nombre == "escribe":
                largo = len(e["widget"].get("texto", "")) / 20
                for q in np.arange(0, largo, 0.075):
                    ruido(sfx, ts + q + rng.uniform(0, 0.02), 0.02, 0.18)
            elif nombre in ("fin",):
                tono(sfx, ts, 1568, 1568, 0.6, 0.3, 0.25); tono(sfx, ts + 0.08, 2093, 2093, 0.6, 0.25, 0.3)
            elif nombre in ("inicio", "reloj"):
                for q in range(18):
                    tono(sfx, ts + q * 0.12, 1200 + q * 40, 1200 + q * 40, 0.03, 0.12, 0.01)
        for ev in e["eventos"]:
            ts = t0 + ev["f"] / FPS
            a = ev["accion"]
            if a == "sello":
                tono(sfx, ts, 160, 45, 0.5, 1.0, 0.12); ruido(sfx, ts, 0.25, 0.5, 3)
            elif a in ("nota", "chip"):
                ruido(sfx, ts, 0.18, 0.25, 6); tono(sfx, ts, 600, 900, 0.08, 0.2, 0.03)
            elif a == "confeti":
                for q in range(16):
                    tono(sfx, ts + rng.uniform(0, 0.6), rng.uniform(2500, 5000), 3000, 0.06, 0.08, 0.02)
            elif a == "tachar":
                ruido(sfx, ts, 0.25, 0.3, 2, "swell")
            elif a == "titulo":
                ruido(sfx, ts - 0.1, 0.2, 0.2, 10, "swell")

    mix = mus * 0.16 + sfx * 0.42
    mix /= max(1, np.max(np.abs(mix)) / 0.9)
    return mix[: int(total_s * SR)]


def main():
    guion_path = sys.argv[1]
    g = json.load(open(guion_path))
    slug = g["slug"]
    pub = os.path.join(RAIZ, "public", "replica", slug)
    os.makedirs(pub, exist_ok=True)
    cache = os.path.join(os.path.dirname(os.path.abspath(guion_path)), ".cache")

    # 1) Voz de todo el guion de una vez (prosodia natural entre escenas).
    limpios = [re.sub(r"\s+", " ", e["texto"].replace("*", "")).strip() for e in g["escenas"]]
    texto = " ".join(limpios)
    d = tts(texto, g["voz"], cache)
    open(os.path.join(pub, "voz.mp3"), "wb").write(base64.b64decode(d["audio_base64"]))
    pals = palabras_con_tiempo(texto, d["alignment"])

    # 2) Repartir palabras por escena y marcar las claves.
    escenas, k = [], 0
    for e, limpio in zip(g["escenas"], limpios):
        crudas = e["texto"].split()
        n = len(limpio.split())
        claves, dentro = [], False
        for c in crudas:
            ini = c.startswith("*")
            claves.append(ini or dentro)
            dentro = (ini or dentro) and not c.rstrip(".,;:!?¿¡").endswith("*")
        escenas.append({"src": e, "pals": pals[k:k + n], "claves": claves})
        k += n

    # 3) Fotogramas de cada escena.
    total_s = pals[-1][2] + g.get("cola", 1.8)
    inicios = [0] + [round((s["pals"][0][1] - 0.12) * FPS) for s in escenas[1:]]
    total = round(total_s * FPS)
    salida, poses = [], []
    for i, s in enumerate(escenas):
        e, f0 = s["src"], inicios[i]
        dur = (inicios[i + 1] if i + 1 < len(escenas) else total) - f0
        palabras = [{"t": w, "f": max(0, round(a * FPS) - f0), "clave": c}
                    for (w, a, _), c in zip(s["pals"], s["claves"])]
        # Trozos de subtítulo: corte tras puntuación (≥2 palabras) o a las 6 palabras.
        trozos, act = [], []
        for p in palabras:
            act.append(p)
            if (re.search(r"[.,;:?!]$", p["t"]) and (len(act) >= 2 or trozos)) or len(act) >= 7:
                trozos.append(act); act = []
        if act: trozos.append(act)
        trozos = [{"desde": t[0]["f"], "palabras": t} for t in trozos]
        marcas = {kk: resolver(v, palabras, f0) for kk, v in e.get("marcas", {}).items()}
        eventos = []
        for ev in e.get("eventos", []):
            ev = dict(ev); ev["f"] = resolver(ev.pop("en"), palabras, f0); eventos.append(ev)
            if ev["accion"] == "pose": poses.append({"f": f0 + ev["f"], "pose": ev["pose"]})
        poses.append({"f": f0, "pose": e.get("pose", "apunta")})
        salida.append({
            "id": e["id"], "from": f0, "dur": dur, "etiqueta": e.get("etiqueta", ""),
            "trozos": trozos, **({"titulo": e["titulo"]} if e.get("titulo") else {}),
            "widget": e["widget"], "eventos": eventos, "marcas": marcas,
        })
    poses.sort(key=lambda p: p["f"])

    # 4) Boca + música/efectos.
    boca, voz_x = envolvente(os.path.join(pub, "voz.mp3"), total)
    sf.write(os.path.join(pub, "musica.wav"), sintetizar(total / FPS, salida, voz_x), SR)

    # 5) Datos para Remotion + registro automático.
    datos_dir = os.path.join(RAIZ, "src", "Replica", "datos")
    os.makedirs(datos_dir, exist_ok=True)
    json.dump({"slug": slug, "total": total, "escenas": salida, "boca": boca, "poses": poses},
              open(os.path.join(datos_dir, f"{slug}.json"), "w"), ensure_ascii=False)
    slugs = sorted(os.path.basename(p)[:-5] for p in glob.glob(os.path.join(datos_dir, "*.json")))
    with open(os.path.join(datos_dir, "index.ts"), "w") as fh:
        fh.write("// Generado por scripts/replica/generar.py: no editar a mano.\nimport type { DatosVideo } from \"../tipos\";\n")
        for i, s_ in enumerate(slugs):
            fh.write(f"import d{i} from \"./{s_}.json\";\n")
        fh.write("\nexport const VIDEOS = [%s] as unknown as DatosVideo[];\n" % ", ".join(f"d{i}" for i in range(len(slugs))))
    print(f"{slug}: {total} fotogramas ({total / FPS:.1f} s), {len(salida)} escenas")
    for e in salida:
        print(f"  {e['id']:<10} from={e['from']:<5} dur={e['dur']:<4} marcas={e['marcas']} eventos={[(v['accion'], v['f']) for v in e['eventos']]}")

    # 6) Export.
    if "--render" in sys.argv:
        cmd = ["npx", "remotion", "render", f"Replica-{slug}", f"out/{slug}.mp4"]
        chrome = os.environ.get("REPLICA_CHROME") or next(iter(glob.glob("/opt/pw-browsers/chromium-*/chrome-linux*/chrome")), None)
        if chrome and not os.environ.get("CI"):
            # Un solo worker: con CPU limitada Chromium captura fotogramas a medio pintar.
            cmd += [f"--browser-executable={chrome}", "--concurrency=1"]
        subprocess.run(cmd, cwd=RAIZ, check=True)
        # Volumen estándar de redes (-14 LUFS) sin tocar el vídeo.
        tmp = os.path.join(RAIZ, "out", f".{slug}.norm.mp4")
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", f"out/{slug}.mp4", "-af", "loudnorm=I=-14:TP=-1.5:LRA=11",
                        "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", tmp], cwd=RAIZ, check=True)
        os.replace(tmp, os.path.join(RAIZ, "out", f"{slug}.mp4"))
        print(f"Listo: out/{slug}.mp4")


if __name__ == "__main__":
    main()
