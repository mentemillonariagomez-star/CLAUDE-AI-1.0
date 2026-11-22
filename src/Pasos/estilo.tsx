import { loadFont as anton } from "@remotion/google-fonts/Anton";
import { loadFont as dmMono } from "@remotion/google-fonts/DMMono";
import { loadFont as inter } from "@remotion/google-fonts/Inter";
import { loadFont as serif } from "@remotion/google-fonts/InstrumentSerif";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export const ANTON = anton("normal", {
  weights: ["400"],
  subsets: ["latin"],
}).fontFamily;
export const MONO = dmMono("normal", {
  weights: ["400"],
  subsets: ["latin"],
}).fontFamily;
export const SANS = inter("normal", {
  weights: ["500", "600", "700", "800"],
  subsets: ["latin"],
}).fontFamily;
export const SERIF = serif("italic", {
  weights: ["400"],
  subsets: ["latin"],
}).fontFamily;

export const C = {
  papel: "#ebe5dc",
  tinta: "#161616",
  gris: "#8b857c",
  tenue: "#cbc4b9",
  rojo: "#e2462c",
  blanco: "#ffffff",
  amarillo: "#ffd84a",
};

export const CLAMP = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

// Entrada con resorte a partir del fotograma `en` (relativo a la escena).
export const useEntrada = (en: number, damping = 13) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - en, fps, config: { damping, mass: 0.7 } });
};

export const Fondo = () => (
  <AbsoluteFill style={{ backgroundColor: C.papel }}>
    <svg width="100%" height="100%" style={{ position: "absolute" }}>
      <filter id="grano">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.9"
          numOctaves="2"
          stitchTiles="stitch"
        />
        <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.08 0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#grano)" />
    </svg>
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(circle at 50% 40%, rgba(255,255,255,0.45), rgba(0,0,0,0.06) 90%)",
      }}
    />
  </AbsoluteFill>
);

export const Tarjeta = ({
  children,
  en,
  style,
  desde = 60,
  giro = 0,
}: {
  readonly children: React.ReactNode;
  readonly en: number;
  readonly style?: React.CSSProperties;
  readonly desde?: number;
  readonly giro?: number;
}) => {
  const s = useEntrada(en);
  return (
    <div
      style={{
        position: "absolute",
        backgroundColor: C.blanco,
        borderRadius: 30,
        boxShadow: "0 2px 0 rgba(0,0,0,0.04), 0 24px 50px rgba(60,40,20,0.16)",
        opacity: interpolate(s, [0, 0.3], [0, 1], CLAMP),
        translate: `0px ${(1 - s) * desde}px`,
        scale: String(0.85 + 0.15 * s),
        rotate: `${giro}deg`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// Sello rojo que cae girado sobre la tarjeta.
export const Sello = ({
  en,
  texto,
  x,
  y,
  giro = -7,
  size = 64,
  relleno = false,
}: {
  readonly en: number;
  readonly texto: string;
  readonly x: number;
  readonly y: number;
  readonly giro?: number;
  readonly size?: number;
  readonly relleno?: boolean;
}) => {
  const frame = useCurrentFrame();
  const t = frame - en;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        fontFamily: ANTON,
        fontSize: size,
        lineHeight: 1,
        color: relleno ? C.blanco : C.rojo,
        backgroundColor: relleno ? C.rojo : "rgba(255,255,255,0.35)",
        border: `6px solid ${C.rojo}`,
        borderRadius: 14,
        padding: "8px 22px",
        whiteSpace: "nowrap",
        rotate: `${giro}deg`,
        opacity: interpolate(t, [0, 2], [0, 1], CLAMP),
        scale: String(
          interpolate(t, [0, 5, 9], [2.4, 0.92, 1], {
            ...CLAMP,
            easing: Easing.out(Easing.quad),
          }),
        ),
      }}
    >
      {texto}
    </div>
  );
};

export const Insignia = ({
  n,
  en,
}: {
  readonly n: number;
  readonly en: number;
}) => {
  const s = useEntrada(en, 10);
  return (
    <div
      style={{
        width: 120,
        height: 120,
        borderRadius: 26,
        backgroundColor: C.tinta,
        color: C.blanco,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 12px 24px rgba(0,0,0,0.25)",
        scale: String(s),
        rotate: `${(1 - s) * 30}deg`,
      }}
    >
      <div style={{ fontFamily: ANTON, fontSize: 74, lineHeight: 1 }}>{n}</div>
      <div style={{ display: "flex", gap: 5, marginTop: 6 }}>
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            style={{
              width: 7,
              height: 7,
              borderRadius: 4,
              backgroundColor: i < 3 ? "#777" : "#444",
            }}
          />
        ))}
      </div>
    </div>
  );
};

// Título grande condensado: "texto" negro y "rojo" en rojo; con etiqueta y número.
export const Titular = ({
  etiqueta,
  texto,
  rojo,
  n,
  en,
  size = 128,
  tachado,
  top = 330,
}: {
  readonly etiqueta?: string;
  readonly texto: string;
  readonly rojo?: string;
  readonly n?: number;
  readonly en: number;
  readonly size?: number;
  readonly tachado?: number;
  readonly top?: number;
}) => {
  const frame = useCurrentFrame();
  const s = useEntrada(en, 14);
  return (
    <div
      style={{
        position: "absolute",
        top,
        left: 60,
        right: 60,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "space-between",
      }}
    >
      <div style={{ position: "relative" }}>
        {etiqueta ? (
          <div
            style={{
              fontFamily: MONO,
              fontSize: 34,
              color: C.gris,
              marginBottom: 6,
              opacity: s,
            }}
          >
            // {etiqueta}
          </div>
        ) : null}
        <div
          style={{
            fontFamily: ANTON,
            fontSize: size,
            lineHeight: 1,
            color:
              tachado !== undefined && frame >= tachado ? "#a39d94" : C.tinta,
            textTransform: "uppercase",
            whiteSpace: "nowrap",
            clipPath: `inset(0 ${(1 - s) * 100}% 0 0)`,
            translate: `${(1 - s) * -40}px 0px`,
          }}
        >
          {texto} {rojo ? <span style={{ color: C.rojo }}>{rojo}</span> : null}
        </div>
        {tachado !== undefined ? (
          <div
            style={{
              position: "absolute",
              left: -6,
              right: -6,
              bottom: size * 0.42,
              height: 12,
              backgroundColor: C.rojo,
              transformOrigin: "left",
              scale: `${interpolate(frame, [tachado, tachado + 7], [0, 1], CLAMP)} 1`,
            }}
          />
        ) : null}
      </div>
      {n ? <Insignia n={n} en={en + 4} /> : null}
    </div>
  );
};

export const Check = ({
  on,
  size = 52,
}: {
  readonly on: boolean;
  readonly size?: number;
}) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: on ? size / 2 : 8,
      border: on ? "none" : `5px solid ${C.tinta}`,
      backgroundColor: on ? C.rojo : "transparent",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      boxSizing: "border-box",
    }}
  >
    {on ? (
      <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 24 24">
        <path
          d="M4 12.5l5 5L20 6.5"
          fill="none"
          stroke="white"
          strokeWidth={3.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ) : null}
  </div>
);

// Teléfono simple con pantalla personalizable.
export const Telefono = ({
  children,
  w = 340,
  h = 640,
  fondo = "linear-gradient(180deg, #1c2550 0%, #0b1026 100%)",
}: {
  readonly children?: React.ReactNode;
  readonly w?: number;
  readonly h?: number;
  readonly fondo?: string;
}) => (
  <div
    style={{
      width: w,
      height: h,
      borderRadius: 54,
      backgroundColor: "#111",
      padding: 12,
      boxSizing: "border-box",
      boxShadow: "0 30px 60px rgba(30,20,10,0.35)",
    }}
  >
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        borderRadius: 42,
        overflow: "hidden",
        background: fondo,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 14,
          left: "50%",
          width: 100,
          height: 28,
          marginLeft: -50,
          borderRadius: 14,
          backgroundColor: "#000",
          zIndex: 5,
        }}
      />
      {children}
    </div>
  </div>
);
