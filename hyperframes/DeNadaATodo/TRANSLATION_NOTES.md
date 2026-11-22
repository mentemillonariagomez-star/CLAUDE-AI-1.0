# Notas de la traducción: DeNadaATodo (Remotion → HyperFrames)

Origen: `src/DeNadaATodo` (composición `DeNadaATodo`, 1.380 fotogramas a 30 fps = 46 s, 1920×1080).
Destino: este proyecto. Nivel de importación: **nativo** en todas las partes (HTML + GSAP).

## Qué corresponde a qué

| Remotion | HyperFrames |
| --- | --- |
| `TransitionSeries` con 10 escenas | 10 subcomposiciones en `compositions/`, montadas en `index.html` |
| `fade()` + `linearTiming(15)` | la escena que entra pasa de opacidad 0 a 1 en 0,5 s, encima de la que sale (igual que Remotion: la que sale no se desvanece) |
| Viñeta `AbsoluteFill` final | `compositions/vineta.html`, encima de todo durante los 46 s |
| `interpolate` lineal | `gsap.fromTo` con `ease: "none"` |
| `Easing.bezier(0.16, 1, 0.3, 1)` | `R2HF.bezier(...)` en `assets/remotion-easings.js`, el mismo algoritmo que Remotion |
| `Easing.spring({ damping: 12 })` | `R2HF.spring12`, tabla de 121 muestras calculada con la función de Remotion |
| `output: "perceptual-scale"` | `R2HF.perceptual(s0, s1, ease)`, la misma fórmula por área (s²) |
| `Easing.in(Easing.quad)` / `.cubic` | `power1.in` / `power2.in` |
| `Easing.out(Easing.back(2))` | `back.out(2)` |
| Contadores `Día` y `$` (`toLocaleString("de-DE")`) | tween de un número con `onUpdate`, con puntos de miles |
| `random()` de las 60 partículas | valores calculados con `random()` de Remotion y escritos en el HTML |
| `@remotion/google-fonts` (Playfair Display, Inter) | `<link>` a Google Fonts con los mismos pesos |

## Qué cambió o no se tradujo igual

- **GSAP local:** `assets/gsap.min.js` (3.12.5) en lugar del CDN, para que el render no dependa de internet.
- **Textos editables:** cada escena declara sus textos como variables (`data-composition-variables`). Los
  contadores (`Día 1.000`, `$1.000.000`) se calculan en cada cuadro y no son variables, igual que en el
  original (allí tampoco eran editables en Studio).
- **Partículas:** se escriben en el HTML una a una (60 `div`), no se generan en un bucle.

## Avisos de `check` que se dejaron a propósito

Son rasgos del video original; cambiarlos haría que la copia dejara de ser fiel:

- `first_frame_empty`: el cuadro 0 es negro porque "No tenía nada." aparece con un fundido.
- `film_silent`: el original no tiene sonido.
- `line_unread`: "Tu historia empieza hoy" está en pantalla 1,7 s antes de terminar el video.
- `content_overlap`: durante los fundidos se ven los textos de dos escenas a la vez.
- `svg_round_cap_hidden_dash`: la línea de la gráfica usa el mismo `stroke-dasharray` que el original.
