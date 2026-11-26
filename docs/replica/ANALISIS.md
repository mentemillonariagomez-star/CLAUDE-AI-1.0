# Replicador audiovisual · análisis del video de referencia

Referencia: video vertical de 59,5 s (576×1024, 30 fps, H.264 + AAC estéreo 44,1 kHz),
tutorial "7 pasos" con presentador 3D y maquetas de interfaz.

## 1. Análisis técnico

| Aspecto | Medición |
| --- | --- |
| Formato | 9:16, 30 fps, 1 784 fotogramas, ~358 kbps |
| Cortes duros | **0**: detector de escena (umbral 0,25) no encuentra cortes. Todo es un único plano animado; las "escenas" cambian por animación, no por corte. |
| Audio | Narración continua + música de fondo sin silencios (silencio solo en los 0,6 s finales). |
| Ritmo | 9 bloques: gancho (0–8,5 s), hoja de ruta (8,5–12,5 s), 7 pasos de ~5–6 s, repaso (~52 s), CTA (~55–59 s). |
| Paleta | Fondo papel cálido `#E7E3DC` con viñeta y trama de puntos (halftone) abajo a la derecha · tinta `#141414` · gris `#9B968E` · rojo de acento `#E0322C` · tarjetas blancas · amarillo de post-it. |
| Tipografía | 1) Etiqueta mono gris "`// paso 1 · la app`". 2) Subtítulo sans negrita (tipo Inter 700). 3) Palabras clave en **serif cursiva roja** (tipo Instrument Serif). 4) Título condensado en mayúsculas (tipo Anton), negro + palabra roja. 5) Insignia negra cuadrada con el número del paso. |
| Composición | Zona 1 (y 0–300): etiqueta + subtítulo. Zona 2 (y 430–600): mini-etiqueta + título + insignia. Zona 3 (y 600–1300): maqueta/widget. Zona 4 (abajo-izq.): chip de anotación. Zona 5 (abajo-der., x>480, y>1300): presentador señalando la zona 3. |
| Cámara | Fija. Sin paneos; el movimiento lo aportan los elementos. |

## 2. Animaciones (catálogo medido a 30 fps)

| # | Animación | Comportamiento medido |
| --- | --- | --- |
| A1 | Subtítulo karaoke | Cada palabra entra al pronunciarse: opacidad 0→1 y gris claro→tinta en ~6 fotogramas. Frases cortas (2–6 palabras); al terminar la frase desaparece en ~2 fotogramas y empieza la siguiente. Palabras clave en serif cursiva roja. |
| A2 | Entrada de título | Letras separadas (tracking amplio), desenfocadas y transparentes → se comprimen a su sitio en ~5 fotogramas (ease-out). Salida inversa en ~3 fotogramas. |
| A3 | Tachado | Línea roja que se dibuja de izquierda a derecha (~6 f) y el título pasa a gris. |
| A4 | Insignia de paso | Cuadrado negro con número; aparece con resorte (overshoot) al entrar el paso. |
| A5 | Pop de tarjeta | Escala 0,85→1 con overshoot + desenfoque→nítido + sombra suave, ~10 f. Elementos de listas con retardo escalonado de ~4 f. |
| A6 | Sello de goma | El fondo se lava/desatura en ~6 f; el sello cae de escala ~1,8→1 en 2–3 f, rotado ~−8°, con textura gastada y una pequeña vibración al impactar. Se queda fijo. |
| A7 | Post-it | Nota amarilla rotada que entra con pop + caída. |
| A8 | Cursor | Flecha que viaja con ease-in-out entre puntos, "clic" = encogerse 0,85 y menú/selección que aparece. |
| A9 | Escritura | Texto que aparece letra a letra con cursor parpadeante. Contador de palabras que salta. |
| A10 | Barras de progreso | Panel oscuro; barras rojas que se llenan a ritmos distintos; al llegar al 100 % aparece un check rojo con pop. |
| A11 | Contador rodante | Número que gira hacia su valor (dígitos tipo cuentakilómetros) + píldora roja. |
| A12 | Morph de icono | Icono de app que encoge y se convierte en la ventana de la app (fundido cruzado ~5 f). |
| A13 | Confeti | Partículas de colores que caen al llegar a "lo divertido". |
| A14 | Polaroids con chincheta | Fotos inclinadas con chincheta roja a los lados del teléfono, con pie en serif cursiva. |
| A15 | Cambio de paso | El contenido anterior se desvanece hacia arriba con desenfoque (~6 f) mientras entra el nuevo. |
| A16 | Presentador | Personaje 3D abajo a la derecha, recortado por la cintura; señala el contenido, alterna poses (señalar arriba, dos manos), parpadea y mueve la boca con la voz. |
| A17 | Rejilla de pasos | "N PASOS" + píldoras numeradas en 2 columnas que entran escalonadas; la última, destacada en rojo. En el repaso cada píldora recibe un check. |

## 3. Tecnologías

- **Remotion 4 (React + TypeScript)**: render fotograma a fotograma, determinista, 1080×1920 a 30 fps. Todas las animaciones A1–A17 se programan con `interpolate`/`spring`.
- **Google Fonts**: Anton (títulos), Inter (subtítulos), Instrument Serif (palabras clave), JetBrains Mono (etiquetas).
- **ElevenLabs** (`/with-timestamps`): voz + tiempo de cada carácter → sincronía exacta de subtítulos, eventos y boca.
- **Python + NumPy**: análisis de la referencia, línea de tiempo, envolvente de voz para la boca, música y efectos sintetizados.
- **FFmpeg**: análisis de la referencia y decodificación de audio.
- **GitHub Actions**: export automático a MP4.

### Lo que no se puede replicar exactamente (y la alternativa)

- **Presentador 3D**: el personaje de la referencia es la mascota de otro creador; copiarlo sería usar su identidad. Además, es un render 3D. Se sustituye por un **personaje original** en SVG con sombreado de volumen (degradados tipo arcilla), en la misma posición, escala y poses, con parpadeo, gestos y boca sincronizada con la voz.
- **Capturas de apps reales** (Finder, Claude, YouTube Studio): se sustituyen por **maquetas genéricas** dibujadas con código, con la misma composición.
- **Música original**: no se reutiliza. Se genera una base propia con el mismo carácter (ligera, continua, con *ducking* bajo la voz) y efectos (pop, whoosh, clic, golpe de sello, tecleo, campanita).

## 4. Arquitectura

```
scripts/replica/
  analizar.py   VIDEO → analisis.json + hojas de contacto (cortes, ritmo, paleta, BPM, actividad)
  generar.py    guion.json → voz (ElevenLabs) → línea de tiempo → música/efectos → datos JSON → MP4
  <slug>/guion.json   el video nuevo, en lenguaje declarativo

src/Replica/
  estilo.ts        tokens extraídos de la referencia (colores, fuentes, zonas, tiempos)
  anim.ts          primitivas A1–A17 (pop, entrada, sello, cursor, escritura, rodante…)
  Escenario.tsx    fondo, rótulo (etiqueta + subtítulo karaoke), título + insignia
  Presentador.tsx  personaje original con poses, parpadeo y lip-sync
  Widgets.tsx      catálogo de maquetas (gancho, pasos, lista, formulario, progreso, escribir, contador, perfil)
  VideoReplica.tsx motor: lee el JSON y monta escenas, transiciones, eventos y audio
  datos/*.json     generados (uno por video) → se registran solos en Root.tsx
```

Flujo: **guion.json** (texto con `*palabras clave*`, título, widget y eventos anclados a palabras)
→ `generar.py` resuelve cada evento al fotograma exacto en que se pronuncia su palabra
→ Remotion lo dibuja con el lenguaje de animación de la referencia
→ render a `out/<slug>.mp4` (local o en GitHub Actions).

## 5. Plan de implementación

1. Tokens de estilo + primitivas de animación (A1–A17).
2. Escenario: fondo, rótulo karaoke, título con insignia, tachado, transición entre pasos.
3. Presentador original con poses y lip-sync.
4. Catálogo de widgets.
5. Motor declarativo (`VideoReplica`) + registro automático de videos.
6. Pipeline Python: análisis, voz, línea de tiempo, audio, render.
7. Prueba: video nuevo "Tus primeros 1.000 $ en 5 pasos" con la misma estructura que la referencia.
