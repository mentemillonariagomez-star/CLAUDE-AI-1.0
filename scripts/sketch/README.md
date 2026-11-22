# Sketch 3D (diálogo entre el chico y el robot)

Edita `guion.json` (quién habla, qué plano de cámara y el texto) y genera el audio y `src/Sketch/datos.ts`:

`<venv>/bin/python scripts/sketch/sketch.py <base-con-models> <ruta-del-proyecto>`

Planos disponibles: general, chico, chico_cerca, telefono, robot, robot_cerca, robot_camara (se definen en `src/Sketch/Sketch.tsx`).
Para renderizar en un servidor sin GPU: `npx remotion render Sketch3D --gl=angle`.
