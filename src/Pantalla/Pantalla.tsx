import { Audio } from "@remotion/media";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Perfil } from "../Perfil/Perfil";
import { ESCENAS } from "./datos";
import { Diapositiva } from "./Diapositiva";
import { AMARILLO, Fondo, GROTESK, Portatil } from "./Escritorio";
import {
  WidgetCeros,
  WidgetChat,
  WidgetCodigo,
  WidgetGiro,
  WidgetGuion,
  WidgetRec,
  WidgetTareas,
  WidgetVoz,
} from "./Widgets";

const CLAMP = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const inicios = (id: keyof typeof ESCENAS) =>
  ESCENAS[id].frases.map((f) => f.palabras[0]);

const Cta = () => {
  const frame = useCurrentFrame();
  const [, segunda] = inicios("Cta");
  return (
    <AbsoluteFill
      style={{
        backgroundColor: AMARILLO,
        justifyContent: "center",
        alignItems: "center",
        gap: 10,
        clipPath: `circle(${interpolate(frame, [0, 10], [0, 120], { ...CLAMP, easing: Easing.out(Easing.cubic) })}% at 50% 50%)`,
      }}
    >
      <div
        style={{
          width: 170,
          height: 170,
          borderRadius: "50%",
          overflow: "hidden",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: 1080,
            height: 1080,
            scale: String(170 / 1080),
            transformOrigin: "0 0",
          }}
        >
          <Perfil
            fondo="#0a0a0a"
            anillo="#fbbf24"
            flecha={AMARILLO}
            brillo="#f59e0b"
          />
        </div>
      </div>
      <div
        style={{
          fontFamily: GROTESK,
          fontWeight: 700,
          fontSize: 120,
          color: "#0a0a0a",
          lineHeight: 1,
        }}
      >
        Sígueme
      </div>
      <div
        style={{
          fontFamily: GROTESK,
          fontWeight: 500,
          fontStyle: "italic",
          fontSize: 44,
          color: "#0a0a0a",
          opacity: interpolate(frame, [segunda, segunda + 5], [0, 1], CLAMP),
        }}
      >
        y te enseño cómo hacerlo
      </div>
    </AbsoluteFill>
  );
};

const Camara = ({ children }: { readonly children: React.ReactNode }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return (
    <AbsoluteFill
      style={{
        scale: String(
          interpolate(frame, [0, durationInFrames], [1, 1.07], CLAMP),
        ),
        translate: `${Math.sin(frame / 37) * 4}px ${Math.cos(frame / 29) * 4}px`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

export const ClaudeCanal = () => {
  const frame = useCurrentFrame();
  const enCta = frame >= ESCENAS.Cta.from;
  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <Camara>
        <Fondo />
        <Portatil brillo={enCta ? AMARILLO : "#c8c8ff"}>
          <Sequence
            name="Problema"
            from={ESCENAS.Problema.from}
            durationInFrames={ESCENAS.Problema.dur}
          >
            <Diapositiva
              etiqueta="// 01 · EL PROBLEMA"
              frases={ESCENAS.Problema.frases}
              acentos={{ tiktok: "amarillo", grabarme: "rojo" }}
              widget={<WidgetRec tachar={inicios("Problema")[1] + 8} />}
            />
          </Sequence>
          <Sequence
            name="Nada"
            from={ESCENAS.Nada.from}
            durationInFrames={ESCENAS.Nada.dur}
          >
            <Diapositiva
              etiqueta="// 01 · EL PROBLEMA"
              frases={ESCENAS.Nada.frases}
              acentos={{ nada: "rojo" }}
              widget={
                <WidgetTareas marcas={inicios("Nada").map((x) => x + 6)} />
              }
            />
          </Sequence>
          <Sequence
            name="Idea"
            from={ESCENAS.Idea.from}
            durationInFrames={ESCENAS.Idea.dur}
          >
            <Diapositiva
              etiqueta="// 02 · LA IDEA"
              frases={ESCENAS.Idea.frases}
              acentos={{ claude: "amarillo" }}
              widget={<WidgetChat />}
            />
          </Sequence>
          <Sequence
            name="Guion"
            from={ESCENAS.Guion.from}
            durationInFrames={ESCENAS.Guion.dur}
          >
            <Diapositiva
              etiqueta="// 03 · EL PROCESO"
              frases={ESCENAS.Guion.frases}
              acentos={{ guion: "amarillo" }}
              widget={<WidgetGuion />}
            />
          </Sequence>
          <Sequence
            name="Voz"
            from={ESCENAS.Voz.from}
            durationInFrames={ESCENAS.Voz.dur}
          >
            <Diapositiva
              etiqueta="// 03 · EL PROCESO"
              frases={ESCENAS.Voz.frases}
              acentos={{ voz: "amarillo" }}
              widget={<WidgetVoz />}
            />
          </Sequence>
          <Sequence
            name="Codigo"
            from={ESCENAS.Codigo.from}
            durationInFrames={ESCENAS.Codigo.dur}
          >
            <Diapositiva
              etiqueta="// 03 · EL PROCESO"
              frases={ESCENAS.Codigo.frases}
              acentos={{ código: "amarillo" }}
              widget={<WidgetCodigo />}
            />
          </Sequence>
          <Sequence
            name="Ceros"
            from={ESCENAS.Ceros.from}
            durationInFrames={ESCENAS.Ceros.dur}
          >
            <Diapositiva
              etiqueta="// 04 · EL RESULTADO"
              frases={ESCENAS.Ceros.frases}
              acentos={{ cero: "amarillo" }}
              widget={<WidgetCeros inicios={inicios("Ceros")} />}
            />
          </Sequence>
          <Sequence
            name="Giro"
            from={ESCENAS.Giro.from}
            durationInFrames={ESCENAS.Giro.dur}
          >
            <Diapositiva
              etiqueta="// 05 · EL GIRO"
              frases={ESCENAS.Giro.frases}
              acentos={{ él: "amarillo" }}
              widget={<WidgetGiro badge={inicios("Giro")[1] + 4} />}
            />
          </Sequence>
          <Sequence
            name="Cta"
            from={ESCENAS.Cta.from}
            durationInFrames={ESCENAS.Cta.dur}
          >
            <Cta />
          </Sequence>
        </Portatil>
      </Camara>
      {/* Gancho fijo arriba, como en el video de referencia */}
      <div
        style={{
          position: "absolute",
          top: 250,
          left: 60,
          right: 60,
          textAlign: "center",
          fontFamily: GROTESK,
          fontWeight: 700,
          fontSize: 66,
          lineHeight: 1.15,
          color: "white",
          textShadow: "0 4px 24px rgba(0,0,0,0.9)",
        }}
      >
        Claude me hizo un canal de TikTok 🤯
      </div>
      <Audio name="Narración" src={staticFile("pantalla/narracion.wav")} />
      <Audio
        name="Música y efectos"
        src={staticFile("pantalla/musica-y-efectos.wav")}
      />
    </AbsoluteFill>
  );
};
