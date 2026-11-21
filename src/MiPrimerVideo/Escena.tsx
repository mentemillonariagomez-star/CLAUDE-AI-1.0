import { loadFont } from "@remotion/google-fonts/Poppins";
import {
  Easing,
  Interactive,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

loadFont("normal", { weights: ["400", "800"], subsets: ["latin"] });

type EscenaProps = {
  readonly titulo: string;
  readonly subtitulo: string;
  readonly acento: string;
};

const EscenaInner = ({ titulo, subtitulo, acento }: EscenaProps) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <>
      <Interactive.Div
        name="Barra de acento"
        style={{
          width: 160,
          height: 14,
          borderRadius: 7,
          marginBottom: 56,
          backgroundColor: acento,
          scale: interpolate(frame, [0, 0.6 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.spring({ damping: 200 }),
            output: "perceptual-scale",
          }),
        }}
      />
      <Interactive.Div
        name="Título"
        style={{
          fontFamily: "Poppins",
          fontWeight: 800,
          fontSize: 150,
          lineHeight: 1.1,
          color: "white",
          textAlign: "center",
          opacity: interpolate(frame, [0.2 * fps, 0.9 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          translate: interpolate(
            frame,
            [0.2 * fps, 1 * fps],
            ["0px 60px", "0px 0px"],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            },
          ),
        }}
      >
        {titulo}
      </Interactive.Div>
      <Interactive.Div
        name="Subtítulo"
        style={{
          fontFamily: "Poppins",
          fontWeight: 400,
          fontSize: 64,
          marginTop: 32,
          color: "#cbd5e1",
          textAlign: "center",
          opacity: interpolate(frame, [0.6 * fps, 1.3 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          translate: interpolate(
            frame,
            [0.6 * fps, 1.4 * fps],
            ["0px 40px", "0px 0px"],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            },
          ),
        }}
      >
        {subtitulo}
      </Interactive.Div>
    </>
  );
};

export const Escena = Interactive.create({
  Component: EscenaInner,
  layout: "absolute-fill",
  schema: {
    ...Interactive.backgroundSchema,
    titulo: { type: "string", default: "", description: "Título" },
    subtitulo: { type: "string", default: "", description: "Subtítulo" },
    acento: { type: "color", default: "#38bdf8", description: "Color de acento" },
  },
});
