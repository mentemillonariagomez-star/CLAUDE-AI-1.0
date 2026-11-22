import { Audio } from "@remotion/media";
import {
  AbsoluteFill,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { ESCENAS } from "./datos";
import {
  Fracasos,
  Gancho,
  Guardar,
  HastaQue,
  Idea,
  Levantarse,
  Loop,
  Mensaje,
  Noches,
  SinNada,
  TodoCambio,
} from "./Escenas";
import { Subtitulos } from "./Subtitulos";

// Barra de progreso arriba: ayuda a la retención (el espectador ve que falta poco).
const BarraProgreso = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        height: 12,
        width: `${(frame / durationInFrames) * 100}%`,
        backgroundColor: "#FFE11A",
      }}
    />
  );
};

export const ViralDeNadaATodo = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <Sequence
        name="Gancho"
        from={ESCENAS.Gancho.from}
        durationInFrames={ESCENAS.Gancho.dur}
      >
        <Gancho />
      </Sequence>
      <Sequence
        name="Sin nada"
        from={ESCENAS.SinNada.from}
        durationInFrames={ESCENAS.SinNada.dur}
      >
        <SinNada />
      </Sequence>
      <Sequence
        name="Idea"
        from={ESCENAS.Idea.from}
        durationInFrames={ESCENAS.Idea.dur}
      >
        <Idea />
      </Sequence>
      <Sequence
        name="Noches"
        from={ESCENAS.Noches.from}
        durationInFrames={ESCENAS.Noches.dur}
      >
        <Noches />
      </Sequence>
      <Sequence
        name="Fracasos"
        from={ESCENAS.Fracasos.from}
        durationInFrames={ESCENAS.Fracasos.dur}
      >
        <Fracasos />
      </Sequence>
      <Sequence
        name="Levantarse"
        from={ESCENAS.Levantarse.from}
        durationInFrames={ESCENAS.Levantarse.dur}
      >
        <Levantarse />
      </Sequence>
      <Sequence
        name="Hasta que"
        from={ESCENAS.HastaQue.from}
        durationInFrames={ESCENAS.HastaQue.dur}
      >
        <HastaQue />
      </Sequence>
      <Sequence
        name="Todo cambió"
        from={ESCENAS.TodoCambio.from}
        durationInFrames={ESCENAS.TodoCambio.dur}
      >
        <TodoCambio />
      </Sequence>
      <Sequence
        name="Mensaje"
        from={ESCENAS.Mensaje.from}
        durationInFrames={ESCENAS.Mensaje.dur}
      >
        <Mensaje />
      </Sequence>
      <Sequence
        name="Guardar"
        from={ESCENAS.Guardar.from}
        durationInFrames={ESCENAS.Guardar.dur}
      >
        <Guardar />
      </Sequence>
      <Sequence
        name="Loop"
        from={ESCENAS.Loop.from}
        durationInFrames={ESCENAS.Loop.dur}
      >
        <Loop />
      </Sequence>
      <Subtitulos />
      <BarraProgreso />
      <Audio name="Narración" src={staticFile("viral/narracion.wav")} />
      <Audio
        name="Música y efectos"
        src={staticFile("viral/musica-y-efectos.wav")}
      />
    </AbsoluteFill>
  );
};
