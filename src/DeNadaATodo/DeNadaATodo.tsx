import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { AbsoluteFill } from "remotion";
import {
  EscenaCaida,
  EscenaCierre,
  EscenaDecision,
  EscenaDias,
  EscenaFallo,
  EscenaIdea,
  EscenaNada,
  EscenaNi,
  EscenaSubida,
  EscenaTodo,
} from "./Escenas";

// 10 escenas (1.515 fotogramas) − 9 fundidos de 15 = 1.380 fotogramas = 46 s a 30 fps
export const DeNadaATodo = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <TransitionSeries name="Historia">
        <TransitionSeries.Sequence name="Nada" durationInFrames={150}>
          <EscenaNada />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 15 })}
        />
        <TransitionSeries.Sequence name="Ni dinero" durationInFrames={150}>
          <EscenaNi />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 15 })}
        />
        <TransitionSeries.Sequence name="Una idea" durationInFrames={150}>
          <EscenaIdea />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 15 })}
        />
        <TransitionSeries.Sequence name="No rendirse" durationInFrames={135}>
          <EscenaDecision />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 15 })}
        />
        <TransitionSeries.Sequence
          name="Días de trabajo"
          durationInFrames={180}
        >
          <EscenaDias />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 15 })}
        />
        <TransitionSeries.Sequence name="Fracasos" durationInFrames={150}>
          <EscenaFallo />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 15 })}
        />
        <TransitionSeries.Sequence name="Aprendizaje" durationInFrames={135}>
          <EscenaCaida />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 15 })}
        />
        <TransitionSeries.Sequence name="Subida" durationInFrames={195}>
          <EscenaSubida />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 15 })}
        />
        <TransitionSeries.Sequence name="Lo tenía todo" durationInFrames={165}>
          <EscenaTodo />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 15 })}
        />
        <TransitionSeries.Sequence name="Cierre" durationInFrames={105}>
          <EscenaCierre />
        </TransitionSeries.Sequence>
      </TransitionSeries>
      {/* Viñeta cinematográfica */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.65) 100%)",
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};
