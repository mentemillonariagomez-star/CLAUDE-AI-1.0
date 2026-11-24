import { loadFont } from "@remotion/google-fonts/Montserrat";
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
import {
  Cuarto,
  Escritorio,
  EstadoPersonaje,
  Manos,
  Personaje,
} from "./Escena2D";
import type { Camara, DatosHistoria, EscenaHistoria } from "./tipos";
import { PiezaUI, useMomento } from "./UI";

const { fontFamily } = loadFont("normal", {
  weights: ["600", "800", "900"],
  subsets: ["latin"],
});
const CLAMP = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const PANEL = { top: 400, h: 1000 };
const BASE: EstadoPersonaje = {
  pose: "mesa",
  ojos: "normal",
  boca: "neutra",
  ojeras: false,
  sudor: false,
  brillo: false,
  luz: false,
  cafes: 0,
};

// Estado actual del personaje y de la cámara (los estados se acumulan dentro de la escena).
const useEstado = (e: EscenaHistoria) => {
  const frame = useCurrentFrame();
  const m = useMomento(e.frases);
  let est = { ...BASE };
  let cam: Camara = { x: 540, y: 500, s: 1 };
  let desdeCam = 0;
  for (const s of e.estados) {
    const t = m(s.en);
    if (frame < t && t > 0) break;
    const { cam: c, ...resto } = s;
    delete (resto as { en?: unknown }).en;
    est = { ...est, ...resto };
    if (c) {
      cam = c;
      desdeCam = t;
    }
  }
  return { est, cam, desdeCam };
};

const Mundo = ({ e }: { readonly e: EscenaHistoria }) => {
  const frame = useCurrentFrame();
  const { est, cam, desdeCam } = useEstado(e);
  const dia = e.fondo === "dia";
  const punch = interpolate(frame, [desdeCam, desdeCam + 6], [1.12, 1], {
    ...CLAMP,
    easing: Easing.out(Easing.cubic),
  });
  const empuje = 1 + 0.03 * ((frame - desdeCam) / 90);
  const s = cam.s * punch * empuje;
  const tiembla = est.temblor
    ? [Math.sin(frame * 2.7) * 6, Math.cos(frame * 3.1) * 5]
    : [0, 0];
  const x = Math.min(Math.max(cam.x, 540 / s), 1080 - 540 / s);
  const y = Math.min(Math.max(cam.y, 500 / s), 1000 - 500 / s);
  return (
    <svg
      viewBox="0 0 1080 1000"
      width={1080}
      height={1000}
      style={{ display: "block" }}
    >
      <g
        transform={`translate(${540 - s * x + tiembla[0]} ${500 - s * y + tiembla[1]}) scale(${s})`}
      >
        <Cuarto dia={dia} desorden={!!e.desorden} />
        <Personaje e={est} frame={frame} />
        <Escritorio dia={dia} desorden={!!e.desorden} cafes={est.cafes} />
        <Manos e={est} />
      </g>
    </svg>
  );
};

const EscenaVista = ({ e }: { readonly e: EscenaHistoria }) => (
  <AbsoluteFill>
    {/* Fondo desenfocado: la misma escena, ampliada */}
    <div
      style={{
        position: "absolute",
        left: -60,
        top: -60,
        width: 1200,
        height: 2040,
        overflow: "hidden",
        filter: "blur(30px) brightness(0.85)",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 60,
          top: 0,
          transform: "scale(2.04)",
          transformOrigin: "0 0",
        }}
      >
        <Mundo e={e} />
      </div>
    </div>
    <div
      style={{
        position: "absolute",
        top: PANEL.top,
        left: 0,
        width: 1080,
        height: PANEL.h,
        overflow: "hidden",
      }}
    >
      <Mundo e={e} />
      {e.elementos.map((el, i) => (
        <PiezaUI key={i} e={el} frases={e.frases} />
      ))}
    </div>
  </AbsoluteFill>
);

// Subtítulos acumulativos: 1 a 3 palabras que se van sumando, en mayúsculas con contorno.
const Subtitulos = ({
  palabras,
}: {
  readonly palabras: DatosHistoria["palabras"];
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ms = (frame / fps) * 1000;
  const paginas: (typeof palabras)[] = [];
  let pag: typeof palabras = [];
  palabras.forEach((p) => {
    pag.push(p);
    if (p.finFrase || pag.length === 3) {
      paginas.push(pag);
      pag = [];
    }
  });
  if (pag.length) paginas.push(pag);
  const actual = [...paginas].reverse().find((pg) => pg[0].startMs <= ms);
  if (!actual) return null;
  const visibles = actual.filter((p) => p.startMs <= ms);
  const ultima = visibles[visibles.length - 1];
  const t = frame - (ultima.startMs / 1000) * fps;
  return (
    <div
      style={{
        position: "absolute",
        top: PANEL.top + 50,
        left: 40,
        right: 40,
        textAlign: "center",
        fontFamily,
        fontWeight: 900,
        fontSize: 70,
        lineHeight: 1.05,
        color: "white",
        textTransform: "uppercase",
        WebkitTextStroke: "12px #1d1530",
        paintOrder: "stroke fill",
        textShadow: "0 6px 0 #1d1530",
        scale: String(interpolate(t, [0, 3], [1.08, 1], CLAMP)),
      }}
    >
      {visibles.map((p) => p.text).join(" ")}
    </div>
  );
};

// Formato "POV · historia por partes": título fijo, panel ilustrado, subtítulos, "PARTE N".
export const Historia = ({
  datos,
  conVoz = true,
}: {
  readonly datos: DatosHistoria;
  readonly conVoz?: boolean;
}) => (
  <AbsoluteFill style={{ backgroundColor: "#1d1530" }}>
    {datos.escenas.map((e) => (
      <Sequence key={e.id} name={e.id} from={e.from} durationInFrames={e.dur}>
        <EscenaVista e={e} />
      </Sequence>
    ))}
    <div
      style={{
        position: "absolute",
        top: PANEL.top + 18,
        right: 24,
        fontFamily,
        fontWeight: 600,
        fontSize: 24,
        color: "rgba(255,255,255,0.75)",
        textShadow: "0 1px 3px rgba(0,0,0,0.6)",
      }}
    >
      {datos.usuario}
    </div>
    <Subtitulos palabras={datos.palabras} />
    <div
      style={{
        position: "absolute",
        top: 175,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          padding: "14px 36px",
          maxWidth: 820,
          textAlign: "center",
          fontFamily,
          fontWeight: 600,
          fontSize: 52,
          lineHeight: 1.15,
          color: "#111",
        }}
      >
        {datos.serie}
      </div>
    </div>
    <div
      style={{
        position: "absolute",
        top: PANEL.top + PANEL.h + 18,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          padding: "8px 22px",
          fontFamily,
          fontWeight: 800,
          fontSize: 46,
          color: "#111",
        }}
      >
        PARTE {datos.parte}
      </div>
    </div>
    {conVoz ? (
      <Audio
        name="Narración"
        src={staticFile(`historia/${datos.slug}/narracion.wav`)}
      />
    ) : null}
    <Audio
      name="Música y efectos"
      src={staticFile(`historia/${datos.slug}/musica.wav`)}
    />
  </AbsoluteFill>
);
