// Primitivas de animación medidas en la referencia (30 fps).
import type { CSSProperties } from "react";
import { Easing, interpolate, spring } from "remotion";

export const CL = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;
export const SUAVE = Easing.bezier(0.22, 1, 0.36, 1);

export const tramo = (
  f: number,
  a: number,
  b: number,
  desde = 0,
  hasta = 1,
  easing = SUAVE,
) => interpolate(f, [a, b], [desde, hasta], { ...CL, easing });

// A5: resorte con overshoot (~10 f).
export const resorte = (f: number, en: number, rigidez = 190, amort = 12) =>
  spring({
    frame: f - en,
    fps: 30,
    config: { damping: amort, stiffness: rigidez, mass: 0.7 },
  });

// A5: pop de tarjeta (escala + desenfoque + subida).
export const pop = (
  f: number,
  en: number,
  extra: CSSProperties = {},
): CSSProperties => {
  const s = resorte(f, en);
  const t = tramo(f, en, en + 6);
  return {
    opacity: t,
    scale: String(0.85 + 0.15 * s),
    translate: `0 ${(1 - s) * 28}px`,
    filter: borroso((1 - t) * 8),
    ...extra,
  };
};

// Fundido simple.
export const aparece = (f: number, en: number, dur = 6) =>
  tramo(f, en, en + dur);

// A15: salida del paso (sube + desenfoque).
export const salida = (f: number, fin: number, dur = 5): CSSProperties => {
  const t = tramo(f, fin, fin + dur, 0, 1, Easing.in(Easing.cubic));
  return {
    opacity: 1 - t,
    translate: `0 ${-36 * t}px`,
    filter: borroso(t * 10),
  };
};

// A8: posición del cursor a lo largo de una ruta con tiempos.
export type Punto = { readonly en: number; readonly x: number; readonly y: number };
export const ruta = (f: number, puntos: readonly Punto[]) => {
  if (f <= puntos[0].en) return puntos[0];
  for (let i = 1; i < puntos.length; i++) {
    const a = puntos[i - 1];
    const b = puntos[i];
    if (f <= b.en) {
      const t = interpolate(f, [a.en, b.en], [0, 1], {
        ...CL,
        easing: Easing.inOut(Easing.cubic),
      });
      return { en: f, x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
    }
  }
  return puntos[puntos.length - 1];
};

// A8: escala del cursor en un clic.
export const clic = (f: number, en: number) =>
  1 - 0.18 * Math.max(0, 1 - Math.abs(f - en - 2) / 3);

// A9: texto escrito letra a letra.
export const escrito = (f: number, en: number, texto: string, cps = 22) =>
  texto.slice(0, Math.max(0, Math.floor(((f - en) / 30) * cps)));

// Desenfoque solo cuando existe: un filter: blur(0px) permanente hace que Chromium
// a veces descarte la capa entera en el render.
export const borroso = (px: number) => (px > 0.05 ? `blur(${px.toFixed(2)}px)` : undefined);

// Ruido determinista.
export const azar = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
