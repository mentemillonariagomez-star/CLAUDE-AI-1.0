import { loadFont } from "@remotion/google-fonts/Montserrat";
import { random } from "remotion";

export const { fontFamily: MONTSERRAT } = loadFont("normal", {
  weights: ["500", "800", "900"],
  subsets: ["latin"],
});

export const CLAMP = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

// Temblor de cámara que decae: devuelve un desplazamiento CSS "x y".
export const temblor = (frame: number, inicio: number, dur = 10, amp = 22) => {
  const t = frame - inicio;
  if (t < 0 || t > dur) return "0px 0px";
  const k = 1 - t / dur;
  const x = (random(`x${frame}-${inicio}`) - 0.5) * 2 * amp * k;
  const y = (random(`y${frame}-${inicio}`) - 0.5) * 2 * amp * k;
  return `${x}px ${y}px`;
};
