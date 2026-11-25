export type En = number | [number, number];
export type Ojos =
  | "normal"
  | "triste"
  | "sorprendido"
  | "decidido"
  | "cansado"
  | "feliz";
export type Boca = "neutra" | "triste" | "abierta" | "sonrisa" | "determinada";
export type Pose = "mesa" | "telefono" | "celebra";
export type Camara = { x: number; y: number; s: number };

export type Estado = {
  en: En;
  pose?: Pose;
  ojos?: Ojos;
  boca?: Boca;
  ojeras?: boolean;
  sudor?: boolean;
  brillo?: boolean;
  luz?: boolean;
  cafes?: number;
  cam?: Camara;
  temblor?: boolean;
};

type Pos = { x: number; y: number; w: number };
export type ElementoUI =
  | (Pos & {
      tipo: "tel_vistas";
      en: En;
      vistas: number;
      titulo?: string;
      comentario?: { en: En; autor: string; texto: string };
    })
  | (Pos & { tipo: "calendario"; en: En; vistas: number[]; tachar?: En })
  | (Pos & {
      tipo: "chat";
      en: En;
      pregunta: string;
      escribir?: En;
      respuestas: { en: En; texto: string }[];
    })
  | (Pos & { tipo: "texto_grande"; en: En; texto: string; color?: string })
  | (Pos & {
      tipo: "cuenta";
      en: En;
      desde: number;
      a: number;
      hasta_en: En;
      titulo?: string;
    })
  | (Pos & { tipo: "exportar"; en: En; falla: En; exito?: boolean })
  | (Pos & {
      tipo: "burbuja";
      en: En;
      autor: string;
      emoji: string;
      texto: string;
    })
  | (Pos & {
      tipo: "tarjetas";
      items: { en: En; emoji: string; titulo: string; sub: string }[];
    })
  | (Pos & {
      tipo: "reloj";
      en: En;
      titulo?: string;
      desde: number;
      hasta: number;
      hasta_en: En;
    })
  | (Pos & { tipo: "subir"; en: En; apagar: En })
  | (Pos & { tipo: "notis"; en: En; mil: En; fin: En })
  | (Pos & {
      tipo: "llamada";
      en: En;
      nombre: string;
      texto_en: En;
      texto: string;
    })
  | (Pos & { tipo: "dm"; en: En; de: string; texto: string });

export type EscenaHistoria = {
  id: string;
  fondo: "noche" | "dia";
  desorden?: boolean;
  estados: Estado[];
  elementos: ElementoUI[];
  from: number;
  dur: number;
  frases: number[];
};

export type DatosHistoria = {
  slug: string;
  serie: string;
  parte: number;
  usuario: string;
  total: number;
  escenas: EscenaHistoria[];
  palabras: { text: string; startMs: number; finFrase: boolean }[];
};
