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
import { ESCENAS_TEXTO as E } from "../Viral/datos";
import { Diapositiva } from "./Diapositiva";
import { AMARILLO, Fondo, GROTESK, MARCA, Portatil, ROJO } from "./Escritorio";
import { WidgetTareas } from "./Widgets";
import {
  WidgetCarga,
  WidgetDias,
  WidgetEscalones,
  WidgetFallos,
  WidgetIdea,
  WidgetMensaje,
  WidgetMillon,
  WidgetSaldo,
} from "./WidgetsNada";

const CLAMP = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ini = (id: keyof typeof E) => E[id].frases.map((f) => f.palabras[0]);

// Diapositiva final amarilla (como el CTA del video de referencia).
const Guardar = () => {
  const frame = useCurrentFrame();
  const palabras = E.Guardar.frases[0];
  return (
    <AbsoluteFill
      style={{
        backgroundColor: AMARILLO,
        justifyContent: "center",
        alignItems: "center",
        gap: 18,
        clipPath: `circle(${interpolate(frame, [0, 10], [0, 120], { ...CLAMP, easing: Easing.out(Easing.cubic) })}% at 50% 50%)`,
      }}
    >
      <svg
        width={90}
        height={110}
        viewBox="0 0 100 120"
        style={{ scale: String(1 + 0.06 * Math.sin(frame / 4)) }}
      >
        <path
          d="M 15 8 Q 15 2 21 2 L 79 2 Q 85 2 85 8 L 85 115 L 50 88 L 15 115 Z"
          fill="#0a0a0a"
        />
      </svg>
      <div
        style={{
          fontFamily: GROTESK,
          fontWeight: 700,
          fontSize: 104,
          color: "#0a0a0a",
          lineHeight: 1,
        }}
      >
        Guárdalo
      </div>
      <div
        style={{
          fontFamily: GROTESK,
          fontWeight: 500,
          fontStyle: "italic",
          fontSize: 38,
          color: "#0a0a0a",
          maxWidth: 760,
          textAlign: "center",
        }}
      >
        {palabras.texto.split(" ").map((p, j) => (
          <span
            key={j}
            style={{
              opacity: interpolate(
                frame,
                [palabras.palabras[j] - 1, palabras.palabras[j] + 2],
                [0.25, 1],
                CLAMP,
              ),
            }}
          >
            {p}{" "}
          </span>
        ))}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginTop: 10,
        }}
      >
        <div
          style={{
            width: 54,
            height: 54,
            borderRadius: "50%",
            overflow: "hidden",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              width: 1080,
              height: 1080,
              scale: String(54 / 1080),
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
            fontSize: 34,
            color: "#0a0a0a",
          }}
        >
          @{MARCA}
        </div>
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
          interpolate(frame, [0, durationInFrames], [1, 1.08], CLAMP),
        ),
        translate: `${Math.sin(frame / 37) * 4}px ${Math.cos(frame / 29) * 4}px`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

const brilloDe = (frame: number) => {
  if (frame >= E.Guardar.from && frame < E.Loop.from) return AMARILLO;
  if (frame >= E.TodoCambio.from && frame < E.Mensaje.from) return "#fbbf24";
  if (frame >= E.Fracasos.from && frame < E.Levantarse.from) return ROJO;
  return "#c8c8ff";
};

export const ZerxDeNadaATodo = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <Camara>
        <Fondo />
        <Portatil brillo={brilloDe(frame)}>
          <Sequence
            name="Gancho"
            from={E.Gancho.from}
            durationInFrames={E.Gancho.dur}
          >
            <Diapositiva
              etiqueta="// 01 · EL INICIO"
              frases={E.Gancho.frases}
              acentos={{ cero: "rojo" }}
              widget={<WidgetSaldo golpe={ini("Gancho")[1]} />}
            />
          </Sequence>
          <Sequence
            name="Sin nada"
            from={E.SinNada.from}
            durationInFrames={E.SinNada.dur}
          >
            <Diapositiva
              etiqueta="// 01 · EL INICIO"
              frases={E.SinNada.frases}
              acentos={{ nadie: "rojo" }}
              widget={
                <WidgetTareas
                  titulo="LO QUE TENÍA"
                  items={["Dinero", "Contactos", "Apoyo"]}
                  marcas={ini("SinNada").map((x) => x + 6)}
                />
              }
            />
          </Sequence>
          <Sequence
            name="Idea"
            from={E.Idea.from}
            durationInFrames={E.Idea.dur}
          >
            <Diapositiva
              etiqueta="// 02 · LA IDEA"
              frases={E.Idea.frases}
              acentos={{ idea: "amarillo", rendirse: "amarillo" }}
              widget={
                <WidgetIdea regla={ini("Idea")[1]} nunca={ini("Idea")[2]} />
              }
            />
          </Sequence>
          <Sequence
            name="Noches"
            from={E.Noches.from}
            durationInFrames={E.Noches.dur}
          >
            <Diapositiva
              etiqueta="// 03 · EL TRABAJO"
              frases={E.Noches.frases}
              acentos={{ mil: "amarillo", noche: "amarillo" }}
              widget={<WidgetDias mil={ini("Noches")[2]} />}
            />
          </Sequence>
          <Sequence
            name="Fracasos"
            from={E.Fracasos.from}
            durationInFrames={E.Fracasos.dur}
          >
            <Diapositiva
              etiqueta="// 03 · EL TRABAJO"
              frases={E.Fracasos.frases}
              acentos={{ falló: "rojo", cincuenta: "rojo" }}
              widget={<WidgetFallos inicios={ini("Fracasos")} />}
            />
          </Sequence>
          <Sequence
            name="Levantarse"
            from={E.Levantarse.from}
            durationInFrames={E.Levantarse.dur}
          >
            <Diapositiva
              etiqueta="// 03 · EL TRABAJO"
              frases={E.Levantarse.frases}
              acentos={{ más: "amarillo", levantaba: "amarillo" }}
              widget={<WidgetEscalones />}
            />
          </Sequence>
          <Sequence
            name="Hasta que"
            from={E.HastaQue.from}
            durationInFrames={E.HastaQue.dur}
          >
            <Diapositiva
              etiqueta="// 04 · EL CAMBIO"
              frases={E.HastaQue.frases}
              acentos={{ día: "amarillo" }}
              widget={<WidgetCarga />}
            />
          </Sequence>
          <Sequence
            name="Todo cambió"
            from={E.TodoCambio.from}
            durationInFrames={E.TodoCambio.dur}
          >
            <Diapositiva
              etiqueta="// 04 · EL CAMBIO"
              frases={E.TodoCambio.frases}
              acentos={{ todo: "amarillo" }}
              widget={<WidgetMillon hoy={ini("TodoCambio")[1]} />}
            />
          </Sequence>
          <Sequence
            name="Mensaje"
            from={E.Mensaje.from}
            durationInFrames={E.Mensaje.dur}
          >
            <Diapositiva
              etiqueta="// 05 · EL MENSAJE"
              frases={E.Mensaje.frases}
              acentos={{ empezar: "amarillo" }}
              widget={
                <WidgetMensaje
                  tachar={ini("Mensaje")[1] + 20}
                  check={ini("Mensaje")[2] + 10}
                />
              }
            />
          </Sequence>
          <Sequence
            name="Guardar"
            from={E.Guardar.from}
            durationInFrames={E.Guardar.dur}
          >
            <Guardar />
          </Sequence>
          <Sequence
            name="Loop"
            from={E.Loop.from}
            durationInFrames={E.Loop.dur}
          >
            <Diapositiva
              etiqueta="// 01 · EL INICIO"
              frases={E.Loop.frases}
              acentos={{ nada: "rojo" }}
              widget={<WidgetSaldo golpe={ini("Loop")[1]} />}
            />
          </Sequence>
        </Portatil>
      </Camara>
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
        No tenía nada. Mira lo que pasó 👀
      </div>
      <Audio
        name="Narración (De la nada a todo)"
        src={staticFile("viral/narracion.wav")}
      />
      <Audio
        name="Música y efectos (De la nada a todo)"
        src={staticFile("viral/musica-y-efectos.wav")}
      />
    </AbsoluteFill>
  );
};
