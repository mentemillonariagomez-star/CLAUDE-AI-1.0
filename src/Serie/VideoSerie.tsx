// Plantilla de la serie zerx.ai: portátil de noche con diapositivas, narración y CTA amarillo.
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
import { Diapositiva } from "../Pantalla/Diapositiva";
import {
  AMARILLO,
  Fondo,
  GROTESK,
  MARCA,
  MONO,
  Portatil,
} from "../Pantalla/Escritorio";

const CLAMP = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

type Frase = { readonly texto: string; readonly palabras: readonly number[] };
export type Escena = {
  readonly id: string;
  readonly from: number;
  readonly dur: number;
  readonly frases: readonly Frase[];
};
export type Slide = {
  readonly etiqueta: string;
  readonly acentos?: Record<string, "amarillo" | "rojo">;
  readonly widget: (inicios: number[]) => React.ReactNode;
  readonly brillo?: string;
};

const Cta = ({
  titulo,
  frase,
}: {
  readonly titulo: string;
  readonly frase: Frase;
}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        backgroundColor: AMARILLO,
        justifyContent: "center",
        alignItems: "center",
        gap: 16,
        clipPath: `circle(${interpolate(frame, [0, 10], [0, 120], { ...CLAMP, easing: Easing.out(Easing.cubic) })}% at 50% 50%)`,
      }}
    >
      <svg
        width={80}
        height={96}
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
          fontSize: 100,
          color: "#0a0a0a",
          lineHeight: 1,
        }}
      >
        {titulo}
      </div>
      <div
        style={{
          fontFamily: GROTESK,
          fontWeight: 500,
          fontStyle: "italic",
          fontSize: 38,
          color: "#0a0a0a",
        }}
      >
        {frase.texto.split(" ").map((p, j) => (
          <span
            key={j}
            style={{
              opacity: interpolate(
                frame,
                [frase.palabras[j] - 1, frase.palabras[j] + 2],
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
        style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 6 }}
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

export const VideoSerie = ({
  slug,
  escenas,
  slides,
  gancho,
  ctaTitulo,
  nota,
}: {
  readonly slug: string;
  readonly escenas: readonly Escena[];
  readonly slides: Record<string, Slide>;
  readonly gancho: string;
  readonly ctaTitulo: string;
  readonly nota?: string;
}) => {
  const frame = useCurrentFrame();
  const cta = escenas[escenas.length - 1];
  const actual =
    escenas.find((e) => frame >= e.from && frame < e.from + e.dur) ?? cta;
  const brillo =
    actual === cta ? AMARILLO : (slides[actual.id]?.brillo ?? "#c8c8ff");
  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <Camara>
        <Fondo />
        <Portatil brillo={brillo}>
          {escenas.slice(0, -1).map((e) => {
            const s = slides[e.id];
            return (
              <Sequence
                key={e.id}
                name={e.id}
                from={e.from}
                durationInFrames={e.dur}
              >
                <Diapositiva
                  etiqueta={s.etiqueta}
                  frases={e.frases}
                  acentos={s.acentos}
                  widget={s.widget(e.frases.map((f) => f.palabras[0]))}
                />
              </Sequence>
            );
          })}
          <Sequence name="CTA" from={cta.from} durationInFrames={cta.dur}>
            <Cta
              titulo={ctaTitulo}
              frase={{
                texto: cta.frases.map((f) => f.texto).join(" "),
                palabras: cta.frases.flatMap((f) => f.palabras),
              }}
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
          fontSize: 58,
          lineHeight: 1.15,
          color: "white",
          textShadow: "0 4px 24px rgba(0,0,0,0.9)",
        }}
      >
        {gancho}
      </div>
      {nota ? (
        <div
          style={{
            position: "absolute",
            top: 1560,
            left: 80,
            right: 80,
            textAlign: "center",
            fontFamily: MONO,
            fontSize: 22,
            color: "#8a8a8a",
          }}
        >
          {nota}
        </div>
      ) : null}
      <Audio name="Narración" src={staticFile(`serie/${slug}/narracion.wav`)} />
      <Audio
        name="Música y efectos"
        src={staticFile(`serie/${slug}/musica-y-efectos.wav`)}
      />
    </AbsoluteFill>
  );
};
