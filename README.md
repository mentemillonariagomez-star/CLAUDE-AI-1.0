# CLAUDE-AI-1.0 · Videos

Proyecto de videos hechos con código ([Remotion](https://www.remotion.dev)).

## Renderizar en GitHub (sin instalar nada)

El flujo [`.github/workflows/render-videos.yml`](.github/workflows/render-videos.yml) renderiza todos los videos:

- **Automático:** cada vez que subes cambios en `src/` o `public/`.
- **Manual:** pestaña **Actions** → **Renderizar videos** → **Run workflow**. Escribe un ID (p. ej. `TrucoAncla`) o deja `todos`.
- **Descargar:** abre la ejecución y baja los MP4/PNG desde **Artifacts** (se guardan 30 días).

## Índice de videos

| ID | Formato | Código | Guion y audio |
| --- | --- | --- | --- |
| **Trucos de tiendas** | | | |
| `TrucoPrecio999` | 9:16 · 33 s | [src/Serie/Trucos.tsx](src/Serie/Trucos.tsx) | [scripts/serie/precio999](scripts/serie/precio999) · [public/serie/precio999](public/serie/precio999) |
| `TrucoSenuelo` | 9:16 · 35 s | [src/Serie/Trucos.tsx](src/Serie/Trucos.tsx) | [scripts/serie/senuelo](scripts/serie/senuelo) · [public/serie/senuelo](public/serie/senuelo) |
| `TrucoAncla` | 9:16 · 27 s | [src/Serie/Trucos.tsx](src/Serie/Trucos.tsx) | [scripts/serie/ancla](scripts/serie/ancla) · [public/serie/ancla](public/serie/ancla) |
| **Serie zerx.ai** | | | |
| `Regla1Porciento` | 9:16 · 29 s | [src/Serie/Videos.tsx](src/Serie/Videos.tsx) | [scripts/serie/regla1](scripts/serie/regla1) · [public/serie/regla1](public/serie/regla1) |
| `IAAhorraTiempo` | 9:16 · 34 s | [src/Serie/Videos.tsx](src/Serie/Videos.tsx) | [scripts/serie/ia-tiempo](scripts/serie/ia-tiempo) · [public/serie/ia-tiempo](public/serie/ia-tiempo) |
| `InteresCompuesto` | 9:16 · 29 s | [src/Serie/Videos.tsx](src/Serie/Videos.tsx) | [scripts/serie/interes](scripts/serie/interes) · [public/serie/interes](public/serie/interes) |
| **Portátil / pantalla** | | | |
| `ZerxDeNadaATodo` | 9:16 · 44 s | [src/Pantalla/DeNadaZerx.tsx](src/Pantalla/DeNadaZerx.tsx) | [scripts/pantalla](scripts/pantalla) · [public/pantalla](public/pantalla) |
| `ClaudeCanal` | 9:16 · 29 s | [src/Pantalla/Pantalla.tsx](src/Pantalla/Pantalla.tsx) | [scripts/pantalla](scripts/pantalla) · [public/pantalla](public/pantalla) |
| **Viral** | | | |
| `ViralDeNadaATodo` | 9:16 · 44 s | [src/Viral/Viral.tsx](src/Viral/Viral.tsx) | [scripts/viral](scripts/viral) · [public/viral](public/viral) |
| **Horizontales** | | | |
| `DeNadaATodo` | 16:9 · 46 s | [src/DeNadaATodo](src/DeNadaATodo) | — |
| `MiPrimerVideo` | 16:9 · 8 s | [src/MiPrimerVideo](src/MiPrimerVideo) | — |
| **Replicador (estilo de referencia)** | | | |
| `Replica-ahorro1000` | 9:16 · 48 s | [src/Replica](src/Replica) | [scripts/replica/ahorro1000](scripts/replica/ahorro1000) · [public/replica/ahorro1000](public/replica/ahorro1000) |
| **Fotos de perfil (PNG)** | | | |
| `PerfilNegroOro` · `PerfilAmarillo` · `PerfilNeon` | 1080×1080 | [src/Perfil/Perfil.tsx](src/Perfil/Perfil.tsx) | — |

Todos se registran en [src/Root.tsx](src/Root.tsx). Para crear un video nuevo de la serie mira
[scripts/serie/README.md](scripts/serie/README.md); para la narración, [scripts/viral/README.md](scripts/viral/README.md).
Para crear videos con el replicador mira [scripts/replica/README.md](scripts/replica/README.md).
Si añades un video, agrega también su ID a la lista `TODOS` del flujo de GitHub.

## En tu computadora

```console
npm i --loglevel=error      # instalar
npm run dev                 # vista previa (Remotion Studio)
npx remotion render <ID>    # renderizar un video
npx remotion still <ID>     # renderizar una foto de perfil
```
