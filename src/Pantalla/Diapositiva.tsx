import { interpolate, useCurrentFrame } from "remotion";
import { AMARILLO, GROTESK, MARCA, MONO, ROJO } from "./Escritorio";

type Frase = { readonly texto: string; readonly palabras: readonly number[] };

const CLAMP = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const limpia = (p: string) => p.toLowerCase().replace(/[.,:¿?¡!]/g, "");

// Diapositiva dentro de la pantalla: etiqueta, marca, texto narrado palabra a palabra y un widget.
export const Diapositiva = ({
  etiqueta,
  frases,
  acentos = {},
  widget,
}: {
  readonly etiqueta: string;
  readonly frases: readonly Frase[];
  readonly acentos?: Record<string, "amarillo" | "rojo">;
  readonly widget: React.ReactNode;
}) => {
  const frame = useCurrentFrame();
  const actual = frases.reduce(
    (acc, f, i) => (frame >= f.palabras[0] ? i : acc),
    0,
  );
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        opacity: interpolate(frame, [0, 4], [0, 1], CLAMP),
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 26,
          left: 34,
          fontFamily: MONO,
          fontSize: 18,
          letterSpacing: 2,
          color: "#7d7d7d",
        }}
      >
        {etiqueta}
      </div>
      <div
        style={{
          position: "absolute",
          top: 26,
          right: 34,
          fontFamily: MONO,
          fontSize: 18,
          fontWeight: 700,
          color: "#d4d4d4",
        }}
      >
        <span style={{ color: AMARILLO }}>●</span> {MARCA}
      </div>
      <div
        style={{
          position: "absolute",
          left: 34,
          top: 90,
          bottom: 40,
          width: 430,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 14,
        }}
      >
        {frases.map((f, i) => {
          if (frame < f.palabras[0] - 2) return null;
          const esActual = i === actual;
          return (
            <div
              key={i}
              style={{
                fontFamily: GROTESK,
                fontWeight: esActual ? 700 : 500,
                fontSize: esActual ? 54 : 36,
                lineHeight: 1.08,
                color: esActual ? "white" : "#8b8b8b",
              }}
            >
              {f.texto.split(" ").map((p, j) => {
                const ini = f.palabras[j];
                const ac = acentos[limpia(p)];
                return (
                  <span
                    key={j}
                    style={{
                      display: "inline-block",
                      marginRight: "0.25em",
                      color:
                        ac === "amarillo"
                          ? AMARILLO
                          : ac === "rojo"
                            ? ROJO
                            : undefined,
                      fontStyle: ac ? "italic" : undefined,
                      opacity: interpolate(
                        frame,
                        [ini - 1, ini + 3],
                        [0, 1],
                        CLAMP,
                      ),
                      translate: `0px ${interpolate(frame, [ini - 1, ini + 4], [14, 0], CLAMP)}px`,
                      filter: `blur(${interpolate(frame, [ini - 1, ini + 3], [6, 0], CLAMP)}px)`,
                    }}
                  >
                    {p}
                  </span>
                );
              })}
            </div>
          );
        })}
      </div>
      <div
        style={{
          position: "absolute",
          right: 30,
          top: 90,
          bottom: 40,
          width: 420,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          scale: String(interpolate(frame, [2, 9], [0.9, 1], CLAMP)),
          opacity: interpolate(frame, [2, 7], [0, 1], CLAMP),
        }}
      >
        {widget}
      </div>
    </div>
  );
};
