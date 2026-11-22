import json, re, sys, soundfile as sf, numpy as np
from kokoro_onnx import Kokoro
base, voice, speed, outdir = sys.argv[1], sys.argv[2], float(sys.argv[3]), sys.argv[4]
k = Kokoro(base + "/models/kokoro-v1.0.onnx", base + "/models/voices-v1.0.bin")
segs = json.load(open(base + "/guion.json"))
res = []
for si, s in enumerate(segs):
    frases = [f for f in re.split(r'(?<=[.,:])\s+', s["text"]) if f]
    fr = []
    for fi, f in enumerate(frases):
        a, sr = k.create(f, voice=voice, speed=speed, lang="es")
        idx = np.where(np.abs(a) > 0.012)[0]
        a = a[max(idx[0]-150, 0):idx[-1]+600]
        fn = f"{outdir}/s{si:02d}_{fi}.wav"
        sf.write(fn, a, sr)
        fr.append({"text": f, "file": fn, "dur": len(a)/sr})
        print(si, fi, round(len(a)/sr, 2), f, flush=True)
    res.append({"id": s["id"], "frases": fr})
json.dump(res, open(outdir + "/frases.json", "w"), ensure_ascii=False, indent=1)
