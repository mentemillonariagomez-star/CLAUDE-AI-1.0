import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { useVideoConfig } from "remotion";
import { Escena } from "./Escena";

export const MiPrimerVideo = () => {
  const { fps } = useVideoConfig();

  return (
    <TransitionSeries name="Escenas">
      <TransitionSeries.Sequence name="Intro" durationInFrames={3 * fps}>
        <Escena
          name="Intro"
          titulo="Hola, Remotion"
          subtitulo="Mi primer video hecho con código"
          acento="#38bdf8"
          style={{
            backgroundColor: "#0f172a",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        presentation={slide({ direction: "from-right" })}
        timing={linearTiming({ durationInFrames: 20 })}
      />
      <TransitionSeries.Sequence name="Idea" durationInFrames={3 * fps}>
        <Escena
          name="Idea"
          titulo="Todo es React"
          subtitulo="Cada fotograma es un componente"
          acento="#a78bfa"
          style={{
            backgroundColor: "#1e1b4b",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        presentation={fade()}
        timing={linearTiming({ durationInFrames: 20 })}
      />
      <TransitionSeries.Sequence name="Cierre" durationInFrames={3 * fps}>
        <Escena
          name="Cierre"
          titulo="¡Empecemos!"
          subtitulo="Esto es solo el comienzo"
          acento="#f472b6"
          style={{
            backgroundColor: "#3b0a2a",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        />
      </TransitionSeries.Sequence>
    </TransitionSeries>
  );
};
