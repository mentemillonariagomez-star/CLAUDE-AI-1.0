"""Narración con ElevenLabs, compatible con scripts/serie/build.py y scripts/viral/build.py.

Uso:
  python tts.py <guion.json> <voice_id> <carpeta_salida> [modelo]

Genera un WAV por frase y <carpeta_salida>/frases.json con el mismo formato que
scripts/viral/tts.py (la voz local), así el resto del flujo no cambia.
"""
import json
import re
import sys

import numpy as np
import soundfile as sf

from cliente import cliente

SR = 24000


def sintetizar(c, texto, voz, modelo, anterior, siguiente):
    pcm = b"".join(
        c.text_to_speech.convert(
            voz,
            text=texto,
            model_id=modelo,
            language_code="es",
            output_format="pcm_24000",
            previous_text=anterior or None,
            next_text=siguiente or None,
        )
    )
    audio = np.frombuffer(pcm, dtype=np.int16).astype(np.float32) / 32768
    idx = np.where(np.abs(audio) > 0.012)[0]
    return audio[max(idx[0] - 150, 0): idx[-1] + 600] if len(idx) else audio


def main():
    guion, voz, salida = sys.argv[1], sys.argv[2], sys.argv[3]
    modelo = sys.argv[4] if len(sys.argv) > 4 else "eleven_v4"
    c = cliente()
    escenas = json.load(open(guion))
    todas = [f for s in escenas for f in re.split(r"(?<=[.,:])\s+", s["text"]) if f]
    k = 0
    res = []
    for si, s in enumerate(escenas):
        frases = [f for f in re.split(r"(?<=[.,:])\s+", s["text"]) if f]
        out = []
        for fi, f in enumerate(frases):
            audio = sintetizar(c, f, voz, modelo, " ".join(todas[max(0, k - 2):k]), " ".join(todas[k + 1:k + 3]))
            fn = f"{salida}/s{si:02d}_{fi}.wav"
            sf.write(fn, audio, SR)
            out.append({"text": f, "file": fn, "dur": len(audio) / SR})
            print(si, fi, round(len(audio) / SR, 2), f, flush=True)
            k += 1
        res.append({"id": s["id"], "frases": out})
    json.dump(res, open(f"{salida}/frases.json", "w"), ensure_ascii=False, indent=1)


if __name__ == "__main__":
    main()
