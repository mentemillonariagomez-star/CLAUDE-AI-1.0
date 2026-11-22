# Video "Pasos" (formato explicador por pasos)

Genera `public/pasos/*.wav` y `src/Pasos/datos.ts` (escenas, subtítulos y boca del personaje) a partir de `guion.json`.
En el guion, las palabras entre `*asteriscos*` salen en rojo cursiva.

1. Entorno y modelos: igual que en `scripts/viral/README.md` (kokoro-onnx).
2. `./venv/bin/python scripts/pasos/pasos.py <base-con-models> <ruta-del-proyecto> "$(cat scripts/viral/voz.txt)" 1.08`
3. La duración de la composición se actualiza sola (`DURACION_TOTAL`).
