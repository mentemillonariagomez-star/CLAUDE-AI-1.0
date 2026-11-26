# Serie zerx.ai (formato portátil)

Cada video = `scripts/serie/<slug>/guion.json` + una entrada en `src/Serie/Videos.tsx`.

1. Escribe `guion.json` (escenas con `id` y `text`; la última escena es el CTA amarillo).
2. Narración con la voz del canal: copia el guion a `<base>/guion.json` y ejecuta
   `python tts.py <base> "$(cat ../../viral/voz.txt)" 1.08 <base>/out` (scripts/viral/tts.py).
3. `python build.py <base>/out <proyecto> <slug>` genera `public/serie/<slug>/*.wav`
   y `src/Serie/datos/<slug>.ts` (tiempos palabra a palabra).
4. Añade el video en `src/Serie/Videos.tsx` (gancho, diapositivas y widgets de `src/Serie/Widgets.tsx`)
   y regístralo en `src/Root.tsx` con el `DURACION_TOTAL` del paso 3.
