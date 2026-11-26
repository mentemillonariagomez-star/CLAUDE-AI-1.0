// Formato de los datos que genera scripts/replica/generar.py (fotogramas a 30 fps).
export type Palabra = {
  readonly t: string;
  readonly f: number; // relativo a la escena
  readonly clave: boolean;
};
export type Trozo = { readonly desde: number; readonly palabras: readonly Palabra[] };
export type Evento = {
  readonly accion: string;
  readonly f: number; // relativo a la escena
  readonly [k: string]: unknown;
};
export type Titulo = {
  readonly texto: string;
  readonly num?: number;
  readonly sobre?: string;
};
export type Widget = { readonly tipo: string; readonly [k: string]: unknown };
export type EscenaDatos = {
  readonly id: string;
  readonly from: number;
  readonly dur: number;
  readonly etiqueta: string;
  readonly trozos: readonly Trozo[];
  readonly titulo?: Titulo;
  readonly widget: Widget;
  readonly eventos: readonly Evento[];
  readonly marcas: Readonly<Record<string, number>>;
  readonly pose?: string;
};
export type DatosVideo = {
  readonly slug: string;
  readonly total: number;
  readonly escenas: readonly EscenaDatos[];
  readonly boca: readonly number[];
  readonly poses: readonly { readonly f: number; readonly pose: string }[];
};
