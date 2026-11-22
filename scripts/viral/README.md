# Narración y audio del video viral

Genera `public/viral/*.wav` y `src/Viral/datos.ts` a partir de `guion.json`.

1. Entorno: `python3 -m venv venv && ./venv/bin/pip install kokoro-onnx soundfile`
2. Modelos (en `<base>/models/`): `kokoro-v1.0.onnx` y `voices-v1.0.bin` de
   https://github.com/thewh1teagle/kokoro-onnx/releases/tag/model-files-v1.0
3. Copia `guion.json` a `<base>/` y ejecuta:
   - `./venv/bin/python tts.py <base> em_alex 1.0 <base>/out`
   - `./venv/bin/python build.py <base> <ruta-del-proyecto>`
4. Actualiza `durationInFrames` de `ViralDeNadaATodo` en `src/Root.tsx` con el total que imprime `build.py`.
