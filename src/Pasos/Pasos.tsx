import { Audio } from "@remotion/media";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { ESCENAS } from "./datos";
import { Encabezado } from "./Encabezado";
import { Intro, P1, P2, P3, P4, P5, P6, Resumen, Ruta } from "./Escenas";
import { CLAMP, Fondo } from "./estilo";
import { Personaje } from "./Personaje";

const COMPONENTES = { Intro, Ruta, P1, P2, P3, P4, P5, P6, Resumen } as const;

// Cada escena entra deslizándose un poco y sale con un fundido rápido.
const Transicion = ({
  children,
  dur,
}: {
  readonly children: React.ReactNode;
  readonly dur: number;
}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        opacity: interpolate(frame, [dur - 5, dur], [1, 0], CLAMP),
        translate: `${interpolate(frame, [dur - 5, dur], [0, -80], { ...CLAMP, easing: Easing.in(Easing.quad) })}px 0px`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

// Formato "explicador por pasos": papel, encabezado tipo karaoke, tarjetas y personaje.
export const Pasos = () => (
  <AbsoluteFill>
    <Fondo />
    {Object.entries(ESCENAS).map(([id, e]) => {
      const Comp = COMPONENTES[id as keyof typeof COMPONENTES];
      return (
        <Sequence key={id} name={id} from={e.from} durationInFrames={e.dur}>
          <Transicion dur={e.dur}>
            <Comp />
          </Transicion>
        </Sequence>
      );
    })}
    <Encabezado />
    <Personaje />
    <Audio name="Narración" src={staticFile("pasos/narracion.wav")} />
    <Audio
      name="Música y efectos"
      src={staticFile("pasos/musica-y-efectos.wav")}
    />
  </AbsoluteFill>
);
