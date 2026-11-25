import { loadFont as caveat } from "@remotion/google-fonts/Caveat";
import { loadFont as montserrat } from "@remotion/google-fonts/Montserrat";
import { loadFont as playfair } from "@remotion/google-fonts/PlayfairDisplay";
import { Audio } from "@remotion/media";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Fondo } from "./Fondos";
import { Fruta } from "./Fruta";
import type {
  Camara,
  DatosCapitulo,
  En,
  EscenaCap,
  EstadoFruta,
  Quien,
} from "./tipos";

const MONT = montserrat("normal", {
  weights: ["800", "900"],
  subsets: ["latin"],
}).fontFamily;
const MANO = caveat("normal", {
  weights: ["700"],
  subsets: ["latin"],
}).fontFamily;
const SERIF = playfair("italic", {
  weights: ["700"],
  subsets: ["latin"],
}).fontFamily;
const CLAMP = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const QUIENES: Quien[] = ["coco", "fresa", "pina"];
const BASE: Required<Omit<EstadoFruta, "prop" | "x">> = {
  expr: "normal",
  pose: "normal",
  brillo: false,
};

const mom = (frases: number[], en: En) =>
  typeof en === "number" ? (frases[en] ?? 0) : (frases[en[0]] ?? 0) + en[1];

const Escena = ({
  e,
  bocas,
  desde,
}: {
  readonly e: EscenaCap;
  readonly bocas: DatosCapitulo["bocas"];
  readonly desde: number;
}) => {
  const frame = useCurrentFrame();
  const est: Partial<Record<Quien, EstadoFruta>> = {};
  let cam: Camara = { x: 540, y: 1100, s: 1 };
  let tCam = 0;
  for (const s of e.estados) {
    const t = mom(e.frases, s.en);
    if (frame < t && t > 0) break;
    for (const q of QUIENES) if (s[q]) est[q] = { ...est[q], ...s[q] };
    if (s.cam) {
      cam = s.cam;
      tCam = t;
    }
  }
  const punch = interpolate(frame, [tCam, tCam + 7], [1.1, 1], {
    ...CLAMP,
    easing: Easing.out(Easing.cubic),
  });
  const sc = cam.s * punch * (1 + 0.035 * ((frame - tCam) / 90));
  const x = Math.min(Math.max(cam.x, 540 / sc), 1080 - 540 / sc);
  const y = Math.min(Math.max(cam.y, 960 / sc), 1920 - 960 / sc);
  const tinte =
    e.fondo === "final"
      ? "transparent"
      : e.luz === "noche"
        ? "rgba(20,20,80,0.18)"
        : e.luz === "oscuro"
          ? "rgba(5,5,25,0.55)"
          : "transparent";
  return (
    <AbsoluteFill>
      <svg viewBox="0 0 1080 1920" width={1080} height={1920}>
        <g
          transform={`translate(${540 - sc * x} ${960 - sc * y}) scale(${sc})`}
        >
          <Fondo e={e} frame={frame} />
          {QUIENES.map((q) => {
            const p = e.personajes[q];
            if (!p) return null;
            const s = { ...BASE, ...est[q] };
            return (
              <Fruta
                key={q}
                quien={q}
                x={s.x ?? p.x}
                mira={p.mira}
                ropa={p.ropa}
                expr={s.expr}
                pose={s.pose}
                prop={est[q]?.prop}
                brillo={s.brillo}
                boca={bocas[q][desde + frame] ?? 0}
                frame={frame}
              />
            );
          })}
        </g>
      </svg>
      <AbsoluteFill style={{ backgroundColor: tinte }} />
      {e.luz === "oscuro" ? (
        <AbsoluteFill
          style={{
            background:
              "radial-gradient(circle at 50% 45%, rgba(120,160,255,0.18), transparent 45%)",
          }}
        />
      ) : null}
      {(e.notas ?? []).map((n) => {
        const t0 = mom(e.frases, n.en);
        if (frame < t0) return null;
        const s = interpolate(frame - t0, [0, 8], [0, 1], {
          ...CLAMP,
          easing: Easing.out(Easing.back(1.4)),
        });
        return (
          <div
            key={n.texto}
            style={{
              position: "absolute",
              left: 190,
              top: 380,
              width: 700,
              padding: "40px 46px",
              backgroundColor: "#fffdf3",
              boxShadow: "0 30px 60px rgba(0,0,0,0.5)",
              rotate: "-3deg",
              scale: String(s),
              fontFamily: MANO,
              fontSize: 82,
              lineHeight: 1.1,
              color: "#2a2a6a",
            }}
          >
            {n.texto}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// Subtítulo de una sola palabra, como en el formato de referencia.
const Palabra = ({ lineas }: { readonly lineas: DatosCapitulo["lineas"] }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ms = (frame / fps) * 1000;
  const l = lineas.find((x) => ms >= x.startMs - 50 && ms < x.endMs + 150);
  if (!l) return null;
  let p = l.palabras[0];
  for (const w of l.palabras) if (w.startMs <= ms) p = w;
  const t = frame - (p.startMs / 1000) * fps;
  return (
    <div
      style={{
        position: "absolute",
        top: 1450,
        left: 40,
        right: 40,
        textAlign: "center",
        fontFamily: MONT,
        fontWeight: 900,
        fontSize: 82,
        color: "white",
        textTransform: "uppercase",
        WebkitTextStroke: "12px black",
        paintOrder: "stroke fill",
        textShadow: "0 6px 14px rgba(0,0,0,0.6)",
        scale: String(interpolate(t, [0, 3], [1.15, 1], CLAMP)),
      }}
    >
      {p.text}
    </div>
  );
};

const Continuara = ({
  desde,
  serie,
  cap,
}: {
  readonly desde: number;
  readonly serie: string;
  readonly cap: number;
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < desde) return null;
  const s = spring({ frame: frame - desde, fps, config: { damping: 14 } });
  return (
    <AbsoluteFill
      style={{
        backgroundColor: `rgba(0,0,0,${0.7 * s})`,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 20,
      }}
    >
      <div
        style={{
          fontFamily: MONT,
          fontWeight: 900,
          fontSize: 46,
          letterSpacing: 10,
          color: "#ffd24a",
          opacity: s,
        }}
      >
        {serie.toUpperCase()} · CAP. {cap}
      </div>
      <div
        style={{
          fontFamily: SERIF,
          fontSize: 150,
          color: "white",
          scale: String(0.8 + 0.2 * s),
          opacity: s,
          textShadow: "0 0 40px rgba(255,210,74,0.6)",
        }}
      >
        Continuará…
      </div>
    </AbsoluteFill>
  );
};

// Formato "telenovela de frutas": escenas a pantalla completa, diálogo entre personajes, una palabra en pantalla.
export const Telenovela = ({
  datos,
  conVoz = true,
}: {
  readonly datos: DatosCapitulo;
  readonly conVoz?: boolean;
}) => {
  const ult = datos.escenas[datos.escenas.length - 1];
  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      {datos.escenas.map((e) => (
        <Sequence key={e.id} name={e.id} from={e.from} durationInFrames={e.dur}>
          <Escena e={e} bocas={datos.bocas} desde={e.from} />
        </Sequence>
      ))}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(circle at 50% 50%, transparent 55%, rgba(0,0,0,0.55) 100%)",
        }}
      />
      <Palabra lineas={datos.lineas} />
      <div
        style={{
          position: "absolute",
          top: 70,
          right: 40,
          fontFamily: MONT,
          fontWeight: 800,
          fontSize: 28,
          color: "rgba(255,255,255,0.75)",
        }}
      >
        {datos.usuario}
      </div>
      {ult.continuara ? (
        <Continuara
          desde={ult.from + ult.dur - 75}
          serie={datos.serie}
          cap={datos.capitulo}
        />
      ) : null}
      {conVoz ? (
        <Audio
          name="Diálogo"
          src={staticFile(`telenovela/${datos.slug}/dialogo.wav`)}
        />
      ) : null}
      <Audio
        name="Música y efectos"
        src={staticFile(`telenovela/${datos.slug}/musica.wav`)}
      />
    </AbsoluteFill>
  );
};
