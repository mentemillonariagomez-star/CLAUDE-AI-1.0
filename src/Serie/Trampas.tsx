// Serie "Trampas mentales del dinero" para zerx.ai.
import { useCurrentFrame } from "remotion";
import { ROJO } from "../Pantalla/Escritorio";
import { ESCENAS as ESCASEZ } from "./datos/escasez";
import { ESCENAS as HUNDIDO } from "./datos/hundido";
import { ESCENAS as PERDIDA } from "./datos/perdida";
import { VideoSerie } from "./VideoSerie";
import {
  WBalanza,
  WCuentaAtras,
  WDoble,
  WFrascos,
  WLista,
  WNumero,
  WReloj,
  WSello,
} from "./Widgets";

// Muestra `antes` hasta el fotograma `en` y luego `despues`.
const Cambia = ({
  en,
  antes,
  despues,
}: {
  readonly en: number;
  readonly antes: React.ReactNode;
  readonly despues: React.ReactNode;
}) => (useCurrentFrame() < en ? antes : despues);

export const TrampaPerdida = () => (
  <VideoSerie
    slug="perdida"
    escenas={Object.values(PERDIDA)}
    gancho="Perder duele el doble 💸"
    ctaTitulo="Guárdalo"
    nota="Kahneman y Tversky, teoría prospectiva (1979)."
    slides={{
      Gancho: {
        etiqueta: "// TRAMPA 1 · LA PÉRDIDA",
        acentos: { perder: "rojo", doble: "amarillo", ganar: "amarillo" },
        brillo: ROJO,
        widget: () => <WBalanza perdida="−$100" ganancia="+$100" en={45} />,
      },
      Moneda: {
        etiqueta: "// TRAMPA 1 · LA APUESTA",
        acentos: { cincuenta: "amarillo", pierdes: "rojo", cien: "rojo" },
        widget: ([, , , d]) => (
          <WDoble
            izq={{ t: "CARA · GANAS", v: "+$150" }}
            der={{ t: "CRUZ · PIERDES", v: "−$100" }}
            en={d}
          />
        ),
      },
      Rechazas: {
        etiqueta: "// TRAMPA 1 · LA APUESTA",
        acentos: { buen: "amarillo", no: "rojo" },
        widget: ([, b]) => (
          <WLista
            titulo="¿ACEPTAS LA APUESTA?"
            items={[
              { t: "En promedio ganas +$25", en: 10, ok: true },
              { t: "La mayoría dice que no", en: b + 30, ok: false },
            ]}
          />
        ),
      },
      Doble: {
        etiqueta: "// TRAMPA 1 · LA RAZÓN",
        acentos: { pérdida: "rojo", dos: "amarillo", veces: "amarillo" },
        brillo: ROJO,
        widget: () => <WBalanza perdida="−$100" ganancia="+$100" en={30} />,
      },
      Nombre: {
        etiqueta: "// TRAMPA 1 · EL NOMBRE",
        acentos: { aversión: "amarillo", malas: "rojo", buenas: "amarillo" },
        widget: ([, b]) => (
          <Cambia
            en={b}
            antes={<WSello texto={"AVERSIÓN A\nLA PÉRDIDA"} en={20} />}
            despues={
              <WLista
                titulo="EN TU CARTERA"
                items={[
                  { t: "Guardas la que pierde", en: b + 25, ok: false },
                  { t: "Vendes la que gana", en: b + 50, ok: false },
                ]}
              />
            }
          />
        ),
      },
      Defensa: {
        etiqueta: "// TU DEFENSA",
        acentos: { hoy: "amarillo", cero: "amarillo" },
        widget: ([, , c]) => (
          <WLista
            titulo="ANTES DE DECIDIR"
            items={[
              { t: "¿Cuánto llevo perdido?", en: c - 10, ok: false },
              { t: "¿Lo elegiría hoy?", en: c + 30, ok: true },
            ]}
          />
        ),
      },
    }}
  />
);

export const TrampaHundido = () => (
  <VideoSerie
    slug="hundido"
    escenas={Object.values(HUNDIDO)}
    gancho="¿Te quedas a ver una película mala? 🎬"
    ctaTitulo="Guárdalo"
    slides={{
      Gancho: {
        etiqueta: "// TRAMPA 2 · EL CINE",
        acentos: { mala: "rojo", quedas: "amarillo" },
        widget: ([, b]) => (
          <WNumero
            titulo="ENTRADA"
            valor="$12"
            sub={b ? "★☆☆☆☆  la película" : "pagada ✓"}
            golpe={20}
          />
        ),
      },
      Quedas: {
        etiqueta: "// TRAMPA 2 · EL CINE",
        acentos: { quedan: "amarillo", pagaron: "rojo" },
        widget: ([, b]) => (
          <WLista
            titulo="¿QUÉ HACES?"
            items={[{ t: "«Ya pagué, me quedo»", en: b + 20, ok: false }]}
          />
        ),
      },
      Perdido: {
        etiqueta: "// TRAMPA 2 · LA VERDAD",
        acentos: { fue: "rojo", vuelve: "rojo" },
        brillo: ROJO,
        widget: ([, , c]) => (
          <WNumero
            titulo="RECUPERAS"
            valor="$0"
            color={ROJO}
            sub="te vayas o te quedes"
            golpe={c}
          />
        ),
      },
      Doble: {
        etiqueta: "// TRAMPA 2 · LA VERDAD",
        acentos: { dinero: "rojo", dos: "rojo", horas: "rojo" },
        brillo: ROJO,
        widget: ([, b, c]) => (
          <WDoble
            izq={{ t: "SI TE VAS", v: "−$12" }}
            der={{ t: "SI TE QUEDAS", v: "−$12 −2h" }}
            en={Math.max(b, c - 5)}
          />
        ),
      },
      Nombre: {
        etiqueta: "// TRAMPA 2 · EL NOMBRE",
        acentos: {
          hundido: "amarillo",
          negocios: "rojo",
          cursos: "rojo",
          relaciones: "rojo",
        },
        widget: ([, b]) => (
          <Cambia
            en={b}
            antes={<WSello texto={"FALACIA DEL\nCOSTO HUNDIDO"} en={20} />}
            despues={
              <WLista
                titulo="DONDE TE ATRAPA"
                items={[
                  { t: "Negocios", en: b + 35, ok: false },
                  { t: "Cursos", en: b + 48, ok: false },
                  { t: "Relaciones", en: b + 62, ok: false },
                ]}
              />
            }
          />
        ),
      },
      Defensa: {
        etiqueta: "// TU DEFENSA",
        acentos: { olvida: "amarillo", viene: "amarillo" },
        widget: ([, b, c]) => (
          <WLista
            titulo="PARA DECIDIR"
            items={[
              { t: "Lo que ya gasté", en: b + 10, ok: false },
              { t: "Lo que viene", en: c + 30, ok: true },
            ]}
          />
        ),
      },
    }}
  />
);

export const TrampaEscasez = () => (
  <VideoSerie
    slug="escasez"
    escenas={Object.values(ESCASEZ)}
    gancho="«Solo quedan 2» ⏳"
    ctaTitulo="Guárdalo"
    nota="Worchel, Lee y Adewole, experimento de las galletas (1975)."
    slides={{
      Gancho: {
        etiqueta: "// TRAMPA 3 · LA ESCASEZ",
        acentos: { dos: "rojo", diez: "rojo", minutos: "rojo" },
        brillo: ROJO,
        widget: () => <WCuentaAtras quedan={2} minutos={10} />,
      },
      Pulso: {
        etiqueta: "// TRAMPA 3 · LA ESCASEZ",
        acentos: { más: "amarillo" },
        widget: () => (
          <WNumero
            titulo="TUS GANAS DE COMPRAR"
            valor="↑↑↑"
            sub="mismo producto, mismo precio"
            golpe={40}
          />
        ),
      },
      Galletas: {
        etiqueta: "// TRAMPA 3 · LA PRUEBA",
        acentos: { iguales: "amarillo", diez: "amarillo", dos: "amarillo" },
        widget: ([, , , d]) => <WFrascos lleno={10} vacio={2} en={d} />,
      },
      Valor: {
        etiqueta: "// TRAMPA 3 · LA PRUEBA",
        acentos: { vacío: "amarillo", deseables: "amarillo" },
        widget: () => <WFrascos lleno={10} vacio={2} en={-30} marca={40} />,
      },
      Nombre: {
        etiqueta: "// TRAMPA 3 · EL NOMBRE",
        acentos: { escasez: "amarillo", escaso: "rojo", mismo: "amarillo" },
        widget: () => <WSello texto={"EFECTO\nESCASEZ"} en={25} />,
      },
      Defensa: {
        etiqueta: "// TU DEFENSA",
        acentos: {
          mañana: "amarillo",
          veinticuatro: "amarillo",
          horas: "amarillo",
        },
        widget: ([, , , d]) => (
          <WReloj
            titulo="REGLA DE 24 H"
            antes="Ahora"
            despues="Mañana"
            en={d}
          />
        ),
      },
    }}
  />
);
