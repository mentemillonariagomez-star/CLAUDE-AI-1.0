import { loadFont } from "@remotion/google-fonts/Montserrat";
import { Audio, Video } from "@remotion/media";
import {
  AbsoluteFill,
  CalculateMetadataFunction,
  Easing,
  Img,
  interpolate,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type {
  ConfigComparacion,
  Etiqueta,
  Flecha,
  Segmento,
  Texto,
} from "./config";

const { fontFamily } = loadFont("normal", {
  weights: ["900"],
  subsets: ["latin"],
});
const FPS = 30;
const CLAMP = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const CAJA = { top: 340, height: 1240 }; // zona donde va el clip nítido

const contorno = (px: number): React.CSSProperties => ({
  fontFamily,
  fontWeight: 900,
  color: "white",
  WebkitTextStroke: `${px}px black`,
  paintOrder: "stroke fill",
  textShadow: "0 6px 0 rgba(0,0,0,0.85)",
  letterSpacing: -1,
});

// Clip con el mismo clip desenfocado detrás, como en los videos de gameplay en vertical.
const ClipConFondo = ({
  clip,
  desde = 0,
  volumen = 0,
  caja = CAJA,
}: {
  readonly clip: string;
  readonly desde?: number;
  readonly volumen?: number;
  readonly caja?: { top: number; height: number };
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const punch = interpolate(frame, [0, 6], [1.08, 1], {
    ...CLAMP,
    easing: Easing.out(Easing.cubic),
  });
  const empuje = interpolate(frame, [0, durationInFrames], [1, 1.06]);
  const src = staticFile(clip);
  const trim = Math.round(desde * FPS);
  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <AbsoluteFill
        style={{ filter: "blur(28px) brightness(0.8)", scale: "1.25" }}
      >
        <Video
          src={src}
          trimBefore={trim}
          muted
          objectFit="cover"
          style={{ width: "100%", height: "100%" }}
        />
      </AbsoluteFill>
      <div
        style={{
          position: "absolute",
          top: caja.top,
          left: 0,
          width: 1080,
          height: caja.height,
          overflow: "hidden",
          boxShadow: "0 0 60px rgba(0,0,0,0.5)",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            scale: String(punch * empuje),
          }}
        >
          <Video
            src={src}
            trimBefore={trim}
            volume={volumen}
            objectFit="cover"
            style={{ width: "100%", height: "100%" }}
          />
        </div>
      </div>
    </AbsoluteFill>
  );
};

const EtiquetaArriba = ({ etiqueta }: { readonly etiqueta: Etiqueta }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 12 } });
  return (
    <div
      style={{
        position: "absolute",
        top: 120,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        scale: String(0.6 + 0.4 * s),
        opacity: s,
      }}
    >
      {etiqueta.logo ? (
        <Img
          src={staticFile(etiqueta.logo)}
          style={{
            height: 300,
            objectFit: "contain",
            filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.5))",
          }}
        />
      ) : (
        <div style={{ ...contorno(14), fontSize: 150, lineHeight: 1 }}>
          {etiqueta.texto}
        </div>
      )}
    </div>
  );
};

// Flecha roja con volumen que "golpea" hacia el detalle.
const FlechaRoja = ({ f }: { readonly f: Flecha }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame - Math.round(f.en * FPS);
  if (t < 0 || (f.dur !== undefined && t > f.dur * FPS)) return null;
  const s = spring({ frame: t, fps, config: { damping: 9 } });
  const vaiven = Math.sin(t / 3.5) * 14;
  return (
    <div
      style={{
        position: "absolute",
        left: f.x - 110,
        top: f.y,
        width: 220,
        height: 380,
        transformOrigin: "50% 0%",
        rotate: `${f.giro ?? 0}deg`,
        scale: String(s),
      }}
    >
      <svg
        viewBox="0 0 220 380"
        width={220}
        height={380}
        style={{
          translate: `0px ${vaiven + (1 - s) * 120}px`,
          overflow: "visible",
        }}
      >
        <path
          d="M110 0 L215 130 L150 130 L150 370 L70 370 L70 130 L5 130 Z"
          fill="black"
          transform="translate(16 14)"
        />
        <path
          d="M110 0 L215 130 L150 130 L150 370 L70 370 L70 130 L5 130 Z"
          fill="#ee1c1c"
          stroke="black"
          strokeWidth={8}
          strokeLinejoin="round"
        />
        <path
          d="M110 18 L185 118 L140 118"
          fill="none"
          stroke="#ff7d6e"
          strokeWidth={8}
          strokeLinecap="round"
          opacity={0.7}
        />
      </svg>
    </div>
  );
};

const Textos = ({
  textos,
  y = 1000,
}: {
  readonly textos: Texto[];
  readonly y?: number;
}) => {
  const frame = useCurrentFrame();
  const seg = frame / FPS;
  const actual = textos.find((x) => seg >= x.en && seg < x.en + (x.dur ?? 1));
  if (!actual) return null;
  const t = frame - actual.en * FPS;
  return (
    <div
      style={{
        position: "absolute",
        top: y,
        left: 40,
        right: 40,
        textAlign: "center",
        ...contorno(16),
        fontSize: 118,
        lineHeight: 1.05,
        scale: String(interpolate(t, [0, 3, 6], [0.6, 1.1, 1], CLAMP)),
      }}
    >
      {actual.texto}
    </div>
  );
};

const Mosaico = ({
  seg,
}: {
  readonly seg: Extract<Segmento, { tipo: "mosaico" }>;
}) => {
  const frame = useCurrentFrame();
  const n = seg.filas.length;
  const alto = 1920 / n;
  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      {seg.filas.map((f, i) => {
        const entra = interpolate(frame, [i * 4, i * 4 + 8], [1, 0], {
          ...CLAMP,
          easing: Easing.out(Easing.cubic),
        });
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              top: i * alto,
              left: 0,
              width: 1080,
              height: alto - 10,
              overflow: "hidden",
              translate: `${(i % 2 ? 1 : -1) * entra * 1080}px 0px`,
            }}
          >
            <Video
              src={staticFile(f.clip)}
              trimBefore={Math.round((f.desde ?? 0) * FPS)}
              muted
              objectFit="cover"
              style={{ width: "100%", height: "100%" }}
            />
            {f.portada ? (
              <Img
                src={staticFile(f.portada)}
                style={{
                  position: "absolute",
                  right: 50,
                  top: alto * 0.15,
                  height: alto * 0.6,
                  borderRadius: 8,
                  boxShadow: "0 8px 20px rgba(0,0,0,0.6)",
                }}
              />
            ) : f.etiqueta ? (
              <div
                style={{
                  position: "absolute",
                  right: 40,
                  top: 30,
                  ...contorno(10),
                  fontSize: 80,
                }}
              >
                {f.etiqueta}
              </div>
            ) : null}
          </div>
        );
      })}
      {seg.textos ? <Textos textos={seg.textos} y={1920 / 2 - 60} /> : null}
    </AbsoluteFill>
  );
};

export const Comparacion = ({
  segmentos,
  musica,
  narracion,
}: ConfigComparacion) => {
  let desde = 0;
  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      {segmentos.map((s, i) => {
        const dur = Math.round(s.dur * FPS);
        const from = desde;
        desde += dur;
        return (
          <Sequence
            key={i}
            from={from}
            durationInFrames={dur}
            name={`${i + 1} · ${s.tipo === "clip" ? (s.etiqueta?.texto ?? s.clip) : "mosaico"}`}
          >
            {s.tipo === "mosaico" ? (
              <Mosaico seg={s} />
            ) : (
              <>
                <ClipConFondo
                  clip={s.clip}
                  desde={s.desde}
                  volumen={s.volumen}
                />
                {s.etiqueta ? <EtiquetaArriba etiqueta={s.etiqueta} /> : null}
                {(s.flechas ?? []).map((f, j) => (
                  <FlechaRoja key={j} f={f} />
                ))}
                {s.textos ? <Textos textos={s.textos} /> : null}
              </>
            )}
          </Sequence>
        );
      })}
      {narracion ? <Audio src={staticFile(narracion)} /> : null}
      {musica ? <Audio src={staticFile(musica)} volume={0.25} /> : null}
    </AbsoluteFill>
  );
};

export const calcularDuracion: CalculateMetadataFunction<ConfigComparacion> = ({
  props,
}) => ({
  durationInFrames: Math.max(
    1,
    Math.round(props.segmentos.reduce((a, s) => a + s.dur, 0) * FPS),
  ),
});
