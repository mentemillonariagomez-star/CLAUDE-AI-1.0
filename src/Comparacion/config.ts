// Edita este archivo para armar tu video de comparación.
// Los clips van en public/comparacion/ (ruta relativa a public/). Tiempos en segundos.

export type Flecha = {
  en: number; // segundo (dentro del segmento) en que aparece
  x: number; // punta de la flecha, en px del lienzo 1080x1920
  y: number;
  giro?: number; // dirección: 0 = apunta hacia arriba, 90 = derecha, -45 = arriba-izquierda...
  dur?: number;
};
export type Texto = { en: number; texto: string; dur?: number };
export type Etiqueta = { texto?: string; logo?: string };

export type Segmento =
  | {
      tipo: "clip";
      clip: string;
      desde?: number; // segundo del clip donde empieza
      dur: number;
      etiqueta?: Etiqueta;
      flechas?: Flecha[];
      textos?: Texto[];
      volumen?: number;
    }
  | {
      tipo: "mosaico";
      dur: number;
      filas: {
        clip: string;
        desde?: number;
        portada?: string;
        etiqueta?: string;
      }[];
      textos?: Texto[];
    };

export type ConfigComparacion = {
  segmentos: Segmento[];
  musica?: string; // opcional, ruta en public/
  narracion?: string; // opcional, ruta en public/
};

// Ejemplo con clips de prueba. Sustituye por tus clips y textos.
export const CONFIG: ConfigComparacion = {
  segmentos: [
    {
      tipo: "clip",
      clip: "comparacion/ejemplo/clip-a.mp4",
      dur: 3,
      etiqueta: { texto: "JUEGO A" },
      textos: [
        { en: 0, texto: "esto", dur: 0.5 },
        { en: 0.5, texto: "es", dur: 0.4 },
        { en: 0.9, texto: "JUEGO A", dur: 1.2 },
      ],
    },
    {
      tipo: "clip",
      clip: "comparacion/ejemplo/clip-a.mp4",
      desde: 3,
      dur: 2.5,
      etiqueta: { texto: "JUEGO A" },
      flechas: [{ en: 0.4, x: 600, y: 1050, giro: -35 }],
      textos: [{ en: 0.4, texto: "fíjate aquí", dur: 1.6 }],
    },
    {
      tipo: "clip",
      clip: "comparacion/ejemplo/clip-b.mp4",
      dur: 3,
      etiqueta: { texto: "JUEGO B" },
      textos: [
        { en: 0.2, texto: "en el", dur: 0.5 },
        { en: 0.7, texto: "JUEGO B", dur: 1.2 },
        { en: 1.9, texto: "no existe", dur: 1 },
      ],
    },
    {
      tipo: "mosaico",
      dur: 4,
      filas: [
        { clip: "comparacion/ejemplo/clip-a.mp4", etiqueta: "A" },
        { clip: "comparacion/ejemplo/clip-b.mp4", etiqueta: "B" },
        { clip: "comparacion/ejemplo/clip-c.mp4", etiqueta: "C" },
        { clip: "comparacion/ejemplo/clip-d.mp4", etiqueta: "D" },
      ],
      textos: [
        { en: 0.5, texto: "en todos", dur: 1.2 },
        { en: 1.8, texto: "menos uno", dur: 1.5 },
      ],
    },
    {
      tipo: "clip",
      clip: "comparacion/ejemplo/clip-d.mp4",
      dur: 3,
      etiqueta: { texto: "JUEGO D" },
      flechas: [{ en: 0.6, x: 420, y: 980, giro: 30 }],
      textos: [{ en: 0.6, texto: "¿lo viste?", dur: 2 }],
    },
  ],
};
