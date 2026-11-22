import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { ESCENAS, FRASES } from "./datos";

type FraseMin = {
  startMs: number;
  palabras: { text: string; key: boolean; startMs: number }[];
};
type EscenaMin = { label: string; from: number; dur: number };
import { C, CLAMP, MONO, SANS, SERIF } from "./estilo";

// Arriba a la izquierda: etiqueta "// paso 1 · ..." y la frase que se narra.
// Las palabras ya dichas se ven negras; las que faltan, en gris claro.
export const Encabezado = ({
  escenas = Object.values(ESCENAS),
  frases = FRASES,
}: {
  readonly escenas?: readonly EscenaMin[];
  readonly frases?: readonly FraseMin[];
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ms = (frame / fps) * 1000;
  const escena = escenas.find((e) => frame >= e.from && frame < e.from + e.dur);
  let idx = -1;
  frases.forEach((f, i) => {
    if (f.startMs - 60 <= ms) idx = i;
  });
  const frase = frases[idx];
  const inicio = frase ? (frase.startMs / 1000) * fps : 0;
  return (
    <div style={{ position: "absolute", top: 90, left: 60, right: 60 }}>
      <div style={{ fontFamily: MONO, fontSize: 32, color: C.gris }}>
        // {escena?.label}
      </div>
      {frase ? (
        <div
          style={{
            marginTop: 14,
            fontFamily: SANS,
            fontWeight: 600,
            fontSize: 58,
            lineHeight: 1.18,
            letterSpacing: -1,
            opacity: interpolate(
              frame,
              [inicio - 2, inicio + 3],
              [0, 1],
              CLAMP,
            ),
          }}
        >
          {frase.palabras.map((p, i) => {
            const dicha = ms >= p.startMs - 40;
            return (
              <span
                key={i}
                style={{
                  color: dicha ? (p.key ? C.rojo : C.tinta) : C.tenue,
                  fontFamily: p.key ? SERIF : SANS,
                  fontWeight: p.key ? 400 : 600,
                  fontSize: p.key ? 68 : 58,
                  letterSpacing: p.key ? 0 : -1,
                }}
              >
                {p.text}{" "}
              </span>
            );
          })}
        </div>
      ) : null}
    </div>
  );
};
