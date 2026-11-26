// Serie "Trucos psicológicos de las tiendas" para zerx.ai.
import { ROJO } from "../Pantalla/Escritorio";
import { ESCENAS as ANCLA } from "./datos/ancla";
import { ESCENAS as P999 } from "./datos/precio999";
import { ESCENAS as SENUELO } from "./datos/senuelo";
import { VideoSerie } from "./VideoSerie";
import {
  WAncla,
  WDoble,
  WLista,
  WNumero,
  WOpciones,
  WPorcentajes,
  WPrecio,
  WReloj,
  WSello,
} from "./Widgets";

const AMARILLO = "#FFE11A";
const PALOMITAS = [
  { t: "Pequeñas", p: "$3" },
  { t: "Medianas", p: "$6,50" },
  { t: "Grandes", p: "$7" },
];

export const TrucoPrecio999 = () => (
  <VideoSerie
    slug="precio999"
    escenas={Object.values(P999)}
    gancho="¿Por qué todo cuesta 9,99? 🧠"
    ctaTitulo="Guárdalo"
    slides={{
      Gancho: {
        etiqueta: "// TRUCO 1 · EL 9,99",
        acentos: { noventa: "amarillo", nueve: "amarillo" },
        widget: () => <WNumero titulo="PRECIO" valor="$9,99" golpe={30} />,
      },
      Cerebro: {
        etiqueta: "// TRUCO 1 · EL 9,99",
        acentos: { izquierda: "amarillo" },
        widget: () => <WPrecio precio="$9,99" escaneo={10} marca={9999} />,
      },
      Primero: {
        etiqueta: "// TRUCO 1 · EL 9,99",
        acentos: { nueve: "amarillo", primero: "amarillo" },
        widget: ([, b]) => (
          <WPrecio
            precio="$9,99"
            escaneo={-30}
            marca={8}
            nota={`decides en ${(b / 30).toFixed(1)} s`}
          />
        ),
      },
      Siente: {
        etiqueta: "// TRUCO 1 · EL 9,99",
        acentos: { nueve: "amarillo", diez: "rojo" },
        widget: ([, b]) => (
          <WDoble
            izq={{ t: "SE SIENTE", v: "$9" }}
            der={{ t: "ES", v: "$10" }}
            en={b}
          />
        ),
      },
      Centavo: {
        etiqueta: "// TRUCO 1 · EL 9,99",
        acentos: { centavo: "amarillo" },
        widget: () => (
          <WNumero titulo="DIFERENCIA REAL" valor="$0,01" golpe={25} />
        ),
      },
      Nombre: {
        etiqueta: "// TRUCO 1 · EL NOMBRE",
        acentos: { dígito: "amarillo", izquierdo: "amarillo", tiendas: "rojo" },
        widget: () => <WSello texto={"EFECTO DEL\nDÍGITO IZQUIERDO"} en={30} />,
      },
      Truco: {
        etiqueta: "// TU DEFENSA",
        acentos: { arriba: "amarillo", real: "amarillo" },
        widget: ([, b]) => (
          <WReloj titulo="REDONDEA" antes="$9,99" despues="$10" en={b + 15} />
        ),
      },
    }}
  />
);

export const TrucoSenuelo = () => (
  <VideoSerie
    slug="senuelo"
    escenas={Object.values(SENUELO)}
    gancho="El truco de las palomitas 🍿"
    ctaTitulo="Guárdalo"
    nota="Experimento citado por Dan Ariely en «Las trampas del deseo» (2008)."
    slides={{
      Gancho: {
        etiqueta: "// TRUCO 2 · LAS PALOMITAS",
        acentos: { grandes: "amarillo" },
        widget: () => (
          <WOpciones
            opciones={PALOMITAS}
            precios={[9999, 9999, 9999]}
            ganga={60}
          />
        ),
      },
      Precios: {
        etiqueta: "// TRUCO 2 · LAS PALOMITAS",
        acentos: {
          tres: "amarillo",
          seis: "amarillo",
          cincuenta: "amarillo",
          siete: "amarillo",
        },
        widget: ([, b, , d, , f]) => (
          <WOpciones opciones={PALOMITAS} precios={[b, d, f]} />
        ),
      },
      NoEsta: {
        etiqueta: "// TRUCO 2 · LA TRAMPA",
        acentos: { medianas: "rojo" },
        widget: () => <WOpciones opciones={PALOMITAS} senuelo={30} />,
      },
      Ganga: {
        etiqueta: "// TRUCO 2 · LA TRAMPA",
        acentos: { ganga: "amarillo", grandes: "amarillo" },
        widget: () => <WOpciones opciones={PALOMITAS} senuelo={0} ganga={40} />,
      },
      Experimento: {
        etiqueta: "// TRUCO 2 · LA PRUEBA",
        acentos: { ochenta: "amarillo", cuatro: "amarillo", cara: "amarillo" },
        widget: ([, , c]) => (
          <WPorcentajes
            titulo="ELIGIERON LA MÁS CARA"
            items={[{ t: "Con señuelo", v: 84, en: c + 10, color: AMARILLO }]}
          />
        ),
      },
      Sin: {
        etiqueta: "// TRUCO 2 · LA PRUEBA",
        acentos: { treinta: "rojo", dos: "rojo" },
        brillo: ROJO,
        widget: ([, b]) => (
          <WPorcentajes
            titulo="ELIGIERON LA MÁS CARA"
            items={[
              { t: "Con señuelo", v: 84, en: -30, color: AMARILLO },
              { t: "Sin señuelo", v: 32, en: b, color: ROJO },
            ]}
          />
        ),
      },
      Nombre: {
        etiqueta: "// TRUCO 2 · EL NOMBRE",
        acentos: { señuelo: "amarillo", sabes: "amarillo" },
        widget: () => <WSello texto={"EFECTO\nSEÑUELO"} en={25} />,
      },
    }}
  />
);

export const TrucoAncla = () => (
  <VideoSerie
    slug="ancla"
    escenas={Object.values(ANCLA)}
    gancho="Antes $199, ahora $99 🏷️"
    ctaTitulo="Guárdalo"
    slides={{
      Gancho: {
        etiqueta: "// TRUCO 3 · EL ANCLA",
        acentos: { ahora: "amarillo" },
        widget: ([, , c]) => (
          <WReloj titulo="OFERTA" antes="$199" despues="$99" en={c} />
        ),
      },
      Siente: {
        etiqueta: "// TRUCO 3 · EL ANCLA",
        acentos: { cien: "amarillo" },
        widget: () => (
          <WNumero
            titulo="TU CEREBRO DICE"
            valor="+$100"
            sub="«¡me ahorré cien!»"
            golpe={25}
          />
        ),
      },
      Real: {
        etiqueta: "// TRUCO 3 · LA VERDAD",
        acentos: { nunca: "rojo" },
        brillo: ROJO,
        widget: () => (
          <WNumero
            titulo="AHORRO REAL"
            valor="$0"
            color={ROJO}
            sub="nunca ibas a pagar $199"
            golpe={40}
          />
        ),
      },
      Ancla: {
        etiqueta: "// TRUCO 3 · LA VERDAD",
        acentos: { ancla: "amarillo" },
        widget: ([a]) => <WAncla precio="$199" en={a + 30} />,
      },
      Pregunta: {
        etiqueta: "// TU DEFENSA",
        widget: () => <WSello texto={"LA PREGUNTA\nCORRECTA"} en={20} />,
      },
      Correcta: {
        etiqueta: "// TU DEFENSA",
        acentos: { precio: "amarillo", descuento: "amarillo" },
        widget: ([, b, c]) => (
          <WLista
            titulo="ANTES DE COMPRAR"
            items={[
              { t: "¿Cuánto me ahorro?", en: b, ok: false },
              { t: "¿Lo pagaría sin descuento?", en: c + 20, ok: true },
            ]}
          />
        ),
      },
    }}
  />
);
