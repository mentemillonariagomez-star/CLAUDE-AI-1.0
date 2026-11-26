// Tokens extraídos del video de referencia (ver docs/replica/ANALISIS.md).
import { loadFont as loadAnton } from "@remotion/google-fonts/Anton";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";

export const TITULO = loadAnton("normal", {
  weights: ["400"],
  subsets: ["latin"],
}).fontFamily;
export const SANS = loadInter("normal", {
  weights: ["500", "600", "700", "800"],
  subsets: ["latin"],
}).fontFamily;
export const SERIF = loadSerif("italic", {
  weights: ["400"],
  subsets: ["latin"],
}).fontFamily;
export const MONO = loadMono("normal", {
  weights: ["400", "500"],
  subsets: ["latin"],
}).fontFamily;

export const C = {
  fondo: "#e8e4dd",
  fondo2: "#d8d3ca",
  tinta: "#141414",
  gris: "#9b968e",
  grisClaro: "#cdc8c0",
  rojo: "#e0322c",
  rojoSuave: "#f6d5d3",
  blanco: "#ffffff",
  panel: "#1d1d1f",
  postit: "#f7d533",
  azul: "#2f6fe4",
} as const;

export const SOMBRA =
  "0 2px 4px rgba(0,0,0,0.06), 0 14px 34px rgba(40,30,20,0.16)";

// Zonas de la composición (1080×1920).
export const Z = {
  margen: 64,
  etiquetaY: 118,
  subtituloY: 176,
  tituloY: 430,
  escenarioY: 610,
  ancho: 1080,
  alto: 1920,
} as const;
