export type En = number | [number, number];
export type Quien = "coco" | "fresa" | "pina";
export type Expr =
  | "normal"
  | "feliz"
  | "orgullo"
  | "tierno"
  | "sorprendido"
  | "ambicion"
  | "malvado"
  | "enojado"
  | "triste"
  | "llorando"
  | "astuto"
  | "decidido";
export type PoseF =
  | "normal"
  | "cruzados"
  | "sostiene"
  | "celebra"
  | "llamada"
  | "cabeza";
export type Prop = "vaso" | "cuaderno" | "maletin" | "nota" | "telefono";
export type EstadoFruta = {
  expr?: Expr;
  pose?: PoseF;
  prop?: Prop;
  brillo?: boolean;
  x?: number;
};
export type Camara = { x: number; y: number; s: number };

export type EscenaCap = {
  id: string;
  fondo: "cocina" | "calle" | "lujo" | "lluvia" | "final";
  luz: "dia" | "noche" | "oscuro";
  letrero?: string;
  fila?: boolean;
  continuara?: boolean;
  personajes: Partial<
    Record<Quien, { x: number; mira: "izq" | "der"; ropa?: string }>
  >;
  estados: ({ en: En; cam?: Camara } & Partial<Record<Quien, EstadoFruta>>)[];
  notas?: { en: En; texto: string }[];
  from: number;
  dur: number;
  frases: number[];
};

export type DatosCapitulo = {
  slug: string;
  serie: string;
  capitulo: number;
  usuario: string;
  total: number;
  escenas: EscenaCap[];
  lineas: {
    quien: Quien;
    startMs: number;
    endMs: number;
    palabras: { text: string; startMs: number }[];
  }[];
  bocas: Record<Quien, number[]>;
};
