# Explicadores (formato "papel + personaje + pasos")

Cada video es un archivo JSON en esta carpeta (`errores.json`, `seguidores.json`, `guion.json`).
Para hacer uno nuevo, copia uno, cambia `slug`, `pasos` y las `escenas`, y ejecuta:

`<venv>/bin/python scripts/explicador/generar.py <base-con-models> <ruta-del-proyecto> scripts/explicador/<archivo>.json`

Luego impórtalo en `src/Root.tsx` (carpeta "Explicadores").

- `texto`: la narración. Las palabras entre `*asteriscos*` salen en rojo cursiva.
- `en`: cuándo aparece algo. Un número = la frase N de la escena (las frases se separan por `. , : ? !`);
  `[N, 15]` = la frase N más 15 fotogramas.
- Elementos: telefono, nota, sello, pasos, contador, lista, chips, barra, comparacion, calendario, grafica, grande
  (ver `src/Explicador/tipos.ts` para sus opciones). Zona útil: x 60–1020, y 540–1250.

## Usar una voz externa (ElevenLabs, tu grabación…)

Genera el audio con el texto de `textos-elevenlabs.txt` y ejecuta:

`<venv>/bin/python scripts/explicador/sincronizar.py <ruta-del-proyecto> <slug> <audio.mp3>`

Compara tu audio con la narración original para ubicar cada frase y reajusta encabezado, boca, tarjetas,
cortes y música. La narración original queda guardada como `narracion-original.wav` (y los tiempos en
`datos-original.json`), así que se puede volver a sincronizar con otro audio. Necesita `librosa`.
