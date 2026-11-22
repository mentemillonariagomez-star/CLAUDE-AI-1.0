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
