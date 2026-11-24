# VIDEO REPLICATOR AI (Termux / Android)

Analiza un vídeo de referencia (ritmo, cortes, transiciones, color, composición,
subtítulos, audio y estructura narrativa), guarda su estilo como **plantilla
reutilizable** y genera **vídeos nuevos verticales 1080x1920** con ese estilo a
partir de un tema o un guion.

El núcleo solo necesita **Python + FFmpeg**: no hace falta compilar nada ni
instalar paquetes de pip. OpenCV, Whisper, la voz online y la IA para guiones
son opcionales y se detectan solos.

---

## 1. Instalación en Termux

```bash
pkg update && pkg upgrade -y
pkg install git -y
git clone https://github.com/mentemillonariagomez-star/claude-ai-1.0.git
cd claude-ai-1.0/video-replicator
bash install_termux.sh            # python, ffmpeg, espeak + permiso de almacenamiento
python main.py check              # comprueba qué funciona en tu móvil
python main.py demo --assets      # prueba completa con un vídeo sintético
```

Opciones del instalador:

| Opción | Qué añade |
|---|---|
| `--opencv` | `python-numpy` y `opencv-python` vía `pkg` (detección de caras en la composición) |
| `--whisper` | compila whisper.cpp y descarga el modelo `base` para transcribir sin internet |

> Instala NumPy y OpenCV con `pkg`, nunca con `pip`: en Android pip intenta
> compilarlos y suele fallar.

## 2. Uso

```bash
# Copia tu vídeo de referencia desde Android
cp ~/storage/downloads/mi_video.mp4 input/

# 1) Analizar → crea references/mi_video/ y templates/mi_video.json
python main.py analyze mi_video.mp4

# 2) Crear un guion desde un tema (con IA si está configurada; si no, borrador editable)
python main.py script -t mi_video --tema "Cómo ahorrar batería en Android"
nano input/guion_como-ahorrar-bateria-en-android.txt

# 3) Generar el vídeo y copiarlo a la galería
python main.py generate -t mi_video -s guion_como-ahorrar-bateria-en-android.txt \
       --exportar ~/storage/movies

# Todo en un paso
python main.py replicate mi_video.mp4 --tema "Tu tema" --exportar ~/storage/movies
```

Otros comandos: `python main.py templates` (lista), `python main.py templates --show mi_video`.

Opciones de `generate`/`replicate`: `--titulo "POV: ..."`, `--etiqueta "PARTE 5"`, `--res 720x1280`, `--duracion 30`,
`--musica archivo.mp3`, `--sin-voz`, `--sin-subtitulos`, `--keep` (conserva
intermedios), `--remote` (renderiza en un PC).

### Formato del guion (`input/*.txt`)

```text
# Título (también va en la caja de título fija, si la plantilla la tiene)
ETIQUETA: PARTE 5
HOOK: ¿Sabías que tu móvil puede editar como un estudio?

[asset: playa.jpg]
Primer bloque del desarrollo. Cada párrafo es un segmento.

Segundo bloque.

CTA: Sígueme para más trucos.
```

### Material propio (`assets/`)

- `assets/*.jpg|png|mp4|mov`: fondos de los planos (se reparten en orden, o se fijan con `[asset: nombre]`).
- `assets/music/*.mp3|m4a`: música de fondo (baja de volumen sola cuando habla la voz).
- `assets/fonts/*.ttf`: fuente de los subtítulos (si no hay, usa Roboto de Android).

Sin assets, el vídeo usa fondos degradados con la paleta del vídeo original.

## 3. Qué se analiza y cómo se replica

| Análisis (`references/<nombre>/analysis.json`) | Cómo se usa al generar |
|---|---|
| Escenas, duración de cada plano y patrón rítmico | Los segmentos se dividen en planos con la misma duración media y el mismo patrón |
| Transiciones: corte, fundido a negro, fundido encadenado y cambio animado dentro del plano | Se aplica el tipo dominante entre segmentos (los cambios animados cuentan para el ritmo, no como fundidos) |
| Elementos fijos: cajas de título y etiquetas que no cambian entre escenas | Se dibujan en la misma posición y color con tu texto (`# Título`, `ETIQUETA:`, `--titulo`, `--etiqueta`) |
| Diseño con relleno desenfocado (imagen nítida en el centro y franjas borrosas) | Tus assets se colocan igual: zona nítida + la misma imagen desenfocada de fondo |
| Altura y anchura de los subtítulos incrustados | Posición de los subtítulos y palabras por bloque |
| Tempo de la música (BPM) | Las duraciones de plano se ajustan al pulso |
| Movimiento de cámara | Paneo suave (efecto Ken Burns) si el original tiene movimiento |
| Paleta, brillo, contraste, saturación, temperatura | Corrección de color de tus assets y colores de los fondos |
| Composición y zona de texto incrustado | Posición de los subtítulos |
| Subtítulos y transcripción (palabras por minuto, palabras por línea, mayúsculas) | Ritmo de la voz, tamaño de los bloques de subtítulo |
| Gancho, desarrollo, clímax y CTA | Estructura del guion generado |
| Sonoridad (LUFS) | Normalización final del audio |

También se guardan los fotogramas representativos (`keyframes/`) y una hoja de contactos (`contact_sheet.jpg`).

La plantilla (`templates/<nombre>.json`) es un JSON legible: puedes editar a mano colores, ritmo, posición del texto, etc.

## 4. Transcripción (Whisper)

Orden automático: `.srt` con el mismo nombre que el vídeo → subtítulos incrustados → whisper.cpp local → servidor remoto → API de OpenAI (solo si existe `OPENAI_API_KEY`).
Si no hay ninguno, el análisis sigue sin texto y la estructura se deduce del ritmo y la energía del audio.

- **whisper.cpp en Termux**: `bash install_termux.sh --whisper`. Las rutas se configuran en `config/config.json` (`transcription.whisper_cpp_bin` y `whisper_cpp_model`). El modelo `base` va bien en móviles de gama media; `tiny` es más rápido.
- No se usa el paquete `openai-whisper` en el móvil porque depende de PyTorch, que no funciona en Termux.

## 5. Guiones con IA (opcional)

Con `pip install anthropic` y la variable `ANTHROPIC_API_KEY`, `script`/`--tema` piden el guion a Claude (`claude-opus-5-5`, configurable en `script_ai.model`), imitando la estructura del original. Si el SDK no se instala en tu Termux o no hay clave, se crea un borrador local con la estructura correcta para que lo completes.

## 6. Procesamiento en un PC o servidor

Si el móvil va lento, ejecuta el mismo proyecto en un PC con FFmpeg:

```bash
python main.py serve --port 8765 --token UNA_CLAVE
```

En el móvil, en `config/config.json`:

```json
"remote": {"url": "http://IP_DEL_PC:8765", "token": "UNA_CLAVE", "timeout": 1800}
```

y añade `--remote` a `analyze` o `generate`. El servidor también transcribe con `faster-whisper` u `openai-whisper` si están instalados en el PC.

## 7. Rendimiento en Android

- El análisis trabaja sobre una copia reducida (320 px, 8 fps) y miniaturas de 90 px.
- Cada plano se codifica por separado, y la unión final copia el vídeo sin recodificarlo.
- Ajustes en `config/config.json`: `performance.threads` (2 por defecto), `output.preset` (`veryfast`; `ultrafast` es más rápido y genera archivos más grandes), `output.resolution` (`auto` usa 1080x1920 si el móvil tiene ≥ 3,5 GB de RAM; si no, 720x1280).
- `output.video_encoder: "h264_mediacodec"` usa el codificador por hardware del móvil si tu FFmpeg lo incluye: es mucho más rápido, pero no está probado en todos los dispositivos.
- Usa `termux-wake-lock` para que Android no suspenda Termux durante renders largos.

## 8. Limitaciones conocidas

- **Probado en Linux (Ubuntu 24.04, FFmpeg 6.1, Python 3.13), no en un Android real.** Se usan las mismas herramientas que en Termux, pero los tiempos en el móvil serán mayores. Ejecuta `python main.py check` primero.
- Los fundidos encadenados se reproducen como fundidos breves a negro (un crossfade real obligaría a recodificar todo el vídeo).
- La detección de texto incrustado y de composición es heurística (bordes y contraste). Con OpenCV se añade la detección de caras. No hay OCR: el sistema sabe **dónde** está el texto del original y qué tamaño tiene, pero no lo lee. Si el original usa MAYÚSCULAS, activa `"uppercase": true` en la plantilla.
- El tempo se estima a partir de la energía del audio. Funciona bien con música rítmica y peor con voz sola.
- Sin assets propios, los fondos son degradados de la paleta: replica el ritmo, el color y la tipografía, no las imágenes del original.
- La voz de `espeak` es sintética y robótica. `gTTS` (`pip install gTTS`) suena más natural, pero necesita internet.
- El sistema copia el **estilo**, no el contenido. Usa tus propias imágenes, vídeos y música, o material con licencia.

## Estructura

```
video-replicator/
├── main.py              CLI
├── install_termux.sh    instalador para Termux
├── requirements.txt     dependencias opcionales
├── config/config.json   configuración
├── scripts/
│   ├── common.py        FFmpeg, rutas, configuración
│   ├── env_check.py     verificación del entorno
│   ├── visual.py        escenas, transiciones, color, composición
│   ├── audio.py         LUFS, silencios, tempo
│   ├── transcribe.py    subtítulos, Whisper, narrativa
│   ├── analyze.py       orquestación del análisis
│   ├── template.py      plantillas
│   ├── script_gen.py    guiones (archivo, IA o borrador)
│   ├── tts.py           voz en off
│   ├── render.py        generación del vídeo
│   └── remote.py        cliente y servidor remotos
├── tests/make_sample.py vídeo sintético de prueba
├── input/ references/ templates/ assets/ output/
```
