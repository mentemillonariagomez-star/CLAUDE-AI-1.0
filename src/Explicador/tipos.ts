// Momento: número de frase de la escena, o [frase, fotogramas extra].
export type En = number | [number, number];

type Pos = { x: number; y: number; w?: number; giro?: number };

export type Elemento =
  | (Pos & {
      tipo: "telefono";
      en: En;
      h?: number;
      texto?: string;
      vistas?: number;
      barra?: boolean;
      emoji?: string;
    })
  | (Pos & { tipo: "nota"; en: En; texto: string })
  | (Pos & {
      tipo: "sello";
      en: En;
      texto: string;
      size?: number;
      relleno?: boolean;
    })
  | (Pos & { tipo: "pasos"; en: En; check?: En; ritmo?: number })
  | (Pos & {
      tipo: "contador";
      en: En;
      hasta: En;
      emoji: string;
      desde: number;
      a: number;
      etiqueta: string;
    })
  | (Pos & {
      tipo: "lista";
      en: En;
      titulo?: string;
      items: {
        texto: string;
        en: En;
        marca?: "check" | "x" | "nada";
        tachar?: boolean;
      }[];
    })
  | (Pos & {
      tipo: "chips";
      items: { texto: string; en: En; rojo?: boolean }[];
      fila?: boolean;
    })
  | (Pos & {
      tipo: "barra";
      en: En;
      hasta: En;
      izquierda: string;
      derecha: string;
      pie?: string;
    })
  | (Pos & {
      tipo: "comparacion";
      en: En;
      izquierda: Lado;
      derecha: Lado;
      ganador?: "izquierda" | "derecha";
      marcar?: En;
    })
  | (Pos & { tipo: "calendario"; en: En; poco: En; todo?: En; titulo?: string })
  | (Pos & {
      tipo: "grafica";
      en: En;
      items: { etiqueta: string; valor: number }[];
      destacar: number;
      marcar?: En;
      titulo?: string;
    })
  | (Pos & {
      tipo: "grande";
      en: En;
      texto: string;
      size?: number;
      pie?: string;
    });

export type Lado = { titulo: string; texto: string; emoji?: string };

export type Titulo = {
  etiqueta?: string;
  texto: string;
  rojo?: string;
  n?: number;
  en: En;
  size?: number;
  top?: number;
};

export type Escena = {
  id: string;
  label: string;
  titulo?: Titulo;
  elementos: Elemento[];
  from: number;
  dur: number;
  frases: number[];
};

export type Palabra = { text: string; key: boolean; startMs: number };

export type DatosVideo = {
  slug: string;
  pasos: [string, string][];
  total: number;
  escenas: Escena[];
  frases: { startMs: number; palabras: Palabra[] }[];
  boca: number[];
};
