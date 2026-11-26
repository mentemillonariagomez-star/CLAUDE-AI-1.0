# Replicador audiovisual

Recrea el estilo del video de referencia (análisis en [docs/replica/ANALISIS.md](../../docs/replica/ANALISIS.md))
con contenido nuevo, a partir de un guion en JSON.

## 1. Analizar una referencia

```console
python3 scripts/replica/analizar.py referencia.mp4 salida/
```
Saca `analisis.json` (cortes, cambios de bloque, palabras/s, BPM, paleta, actividad por zona)
y hojas de contacto para revisar cada animación.

## 2. Crear un video nuevo

1. Copia `scripts/replica/ahorro1000/guion.json` a `scripts/replica/<slug>/guion.json` y cambia el texto.
   - `*palabra*` → serif cursiva roja en el subtítulo (y roja en títulos).
   - `widget.tipo`: `gancho`, `pasos`, `lista`, `formulario`, `progreso`, `escribir`, `contador`, `perfil`.
   - `marcas`: momentos internos del widget, anclados a una palabra (`"palabra"`, `"palabra#2"`, `"palabra+6"`).
   - `eventos`: `sello`, `nota`, `chip`, `confeti`, `titulo` (cambia el título), `tachar`, `pose`.
   - `pose` del presentador: `apunta`, `arriba`, `explica`, `alto`.
2. Genera y exporta:
   ```console
   pip install numpy soundfile
   python3 scripts/replica/generar.py scripts/replica/<slug>/guion.json --render
   ```
   Hace la voz (ElevenLabs, con tiempos por letra), la línea de tiempo, el lip-sync,
   la música y los efectos sincronizados, registra el video en Remotion como `Replica-<slug>`
   y exporta `out/<slug>.mp4` (1080×1920, 30 fps, −14 LUFS).
3. Para renderizarlo en GitHub, añade `Replica-<slug>` a la lista `TODOS` de
   `.github/workflows/render-videos.yml`.
