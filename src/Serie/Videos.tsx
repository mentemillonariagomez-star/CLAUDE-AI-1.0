// Los videos de la serie zerx.ai: cada uno es un guion + una lista de diapositivas.
import { ROJO } from "../Pantalla/Escritorio";
import { ESCENAS as IA } from "./datos/ia-tiempo";
import { ESCENAS as INTERES } from "./datos/interes";
import { ESCENAS as REGLA } from "./datos/regla1";
import { VideoSerie } from "./VideoSerie";
import {
  WBarras,
  WCalendario,
  WChat,
  WContador,
  WCurva,
  WDoc,
  WFormula,
  WIdeas,
  WLista,
  WNumero,
  WReloj,
  WSello,
} from "./Widgets";

export const Regla1Porciento = () => (
  <VideoSerie
    slug="regla1"
    escenas={Object.values(REGLA)}
    gancho="La regla del 1% que nadie aplica 📈"
    ctaTitulo="Guárdalo"
    slides={{
      Gancho: {
        etiqueta: "// 01 · LA REGLA",
        acentos: { nada: "rojo" },
        widget: () => (
          <WNumero
            titulo="MEJORA DIARIA"
            valor="+1%"
            sub="parece poco…"
            golpe={30}
          />
        ),
      },
      Cuenta: {
        etiqueta: "// 01 · LA REGLA",
        acentos: { cuenta: "amarillo" },
        widget: () => (
          <WNumero titulo="CALCULADORA" valor="= ?" color="white" />
        ),
      },
      Formula: {
        etiqueta: "// 02 · LA CUENTA",
        widget: ([, b]) => (
          <WFormula
            base="1,01"
            exp="365"
            resultado={37.78}
            decimales={2}
            desde={b}
            hasta={b + 55}
          />
        ),
      },
      Resultado: {
        etiqueta: "// 02 · LA CUENTA",
        acentos: { treinta: "amarillo", siete: "amarillo", veces: "amarillo" },
        widget: ([a]) => (
          <WCurva titulo="TU PROGRESO" etiqueta="37,8×" hasta={a + 30} />
        ),
      },
      Inverso: {
        etiqueta: "// 03 · EL LADO OSCURO",
        acentos: { empeoras: "rojo", cero: "rojo" },
        brillo: ROJO,
        widget: ([, b]) => (
          <WCurva
            titulo="0,99 ^ 365"
            sube={false}
            color={ROJO}
            etiqueta="0,03×"
            hasta={b + 20}
          />
        ),
      },
      Clave: {
        etiqueta: "// 04 · LA CLAVE",
        acentos: { parar: "amarillo" },
        widget: ([a, b]) => (
          <WLista
            titulo="LO QUE NECESITAS"
            items={[
              { t: "Un gran salto", en: a + 40, ok: false },
              { t: "No parar", en: b + 30, ok: true },
            ]}
          />
        ),
      },
      Hoy: {
        etiqueta: "// 05 · TU TURNO",
        acentos: { hoy: "amarillo" },
        widget: ([, b]) => <WCalendario en={b} />,
      },
    }}
  />
);

export const IAAhorraTiempo = () => (
  <VideoSerie
    slug="ia-tiempo"
    escenas={Object.values(IA)}
    gancho="3 tareas que la IA hace por ti 🤖"
    ctaTitulo="Pruébalo hoy"
    slides={{
      Gancho: {
        etiqueta: "// 01 · EL PROBLEMA",
        acentos: { horas: "rojo", minutos: "amarillo" },
        widget: ([, b]) => <WReloj antes="5 h" despues="15 min" en={b + 50} />,
      },
      Correos: {
        etiqueta: "// 02 · TAREA 1",
        acentos: { correos: "amarillo", escribe: "amarillo" },
        widget: ([, , c]) => (
          <WChat
            pregunta="Pide el viernes libre a mi jefa, tono amable"
            respuesta="Hola Ana: ¿podría tomarme el viernes libre? Dejo todo listo antes. ¡Gracias!"
            responde={c + 20}
          />
        ),
      },
      Documentos: {
        etiqueta: "// 03 · TAREA 2",
        acentos: { segundos: "amarillo" },
        widget: ([, , c]) => (
          <WDoc
            en={c + 30}
            bullets={[
              "Ventas +12% este trimestre",
              "Problema: envíos lentos",
              "Propuesta: nuevo proveedor",
            ]}
          />
        ),
      },
      Ideas: {
        etiqueta: "// 04 · TAREA 3",
        acentos: { mejor: "amarillo" },
        widget: ([, , , d]) => (
          <WIdeas
            mejor={6}
            en={d + 25}
            ideas={[
              "Rutina de mañana en 60 s",
              "3 apps que uso cada día",
              "Mi escritorio por $100",
              "Errores al empezar",
              "Un día conmigo",
              "Antes vs. después",
              "Cómo ahorro 5 h/semana",
              "Libros que me cambiaron",
              "Preguntas y respuestas",
              "Mi primer mes",
            ]}
          />
        ),
      },
      Tarde: {
        etiqueta: "// 05 · EL RESULTADO",
        acentos: { tarde: "rojo", café: "amarillo" },
        widget: ([, b]) => <WReloj antes="4 h" despues="5 min" en={b + 10} />,
      },
      Trabajo: {
        etiqueta: "// 06 · LA VERDAD",
        acentos: { no: "amarillo" },
        widget: ([a]) => (
          <WSello texto={"TU TRABAJO\nSIGUE SIENDO TUYO"} en={a + 30} />
        ),
      },
      Aburrido: {
        etiqueta: "// 06 · LA VERDAD",
        acentos: { aburrido: "rojo", importante: "amarillo" },
        widget: ([a, b]) => (
          <WLista
            titulo="LA IA TE QUITA"
            items={[
              { t: "Lo aburrido", en: a + 20, ok: false },
              { t: "Tiempo para lo importante", en: b + 30, ok: true },
            ]}
          />
        ),
      },
    }}
  />
);

export const InteresCompuesto = () => (
  <VideoSerie
    slug="interes"
    escenas={Object.values(INTERES)}
    gancho="Tu café de $5 vale $220.000 ☕"
    ctaTitulo="Compártelo"
    nota="Ejemplo ilustrativo: $150/mes al 8 % anual constante durante 30 años. No es asesoría financiera."
    slides={{
      Gancho: {
        etiqueta: "// 01 · EL CAFÉ",
        acentos: { café: "amarillo", cinco: "amarillo" },
        widget: () => (
          <WNumero
            titulo="GASTO DIARIO"
            valor="$5"
            sub="≈ $150 al mes"
            golpe={14}
          />
        ),
      },
      Invierte: {
        etiqueta: "// 02 · EL PLAN",
        acentos: { inviertes: "amarillo" },
        widget: () => (
          <WContador
            titulo="APORTE MENSUAL"
            de={0}
            a={150}
            desde={6}
            hasta={45}
            prefijo="$"
          />
        ),
      },
      Tasa: {
        etiqueta: "// 02 · EL PLAN",
        acentos: { ocho: "amarillo" },
        widget: () => (
          <WNumero titulo="RENTABILIDAD ANUAL" valor="8%" golpe={20} />
        ),
      },
      Treinta: {
        etiqueta: "// 03 · EL RESULTADO",
        acentos: {
          doscientos: "amarillo",
          veinte: "amarillo",
          mil: "amarillo",
        },
        widget: () => (
          <WContador
            titulo="EN 30 AÑOS"
            de={0}
            a={223554}
            desde={8}
            hasta={95}
            prefijo="$"
            exponencial
          />
        ),
      },
      Pusiste: {
        etiqueta: "// 03 · EL RESULTADO",
        acentos: { cincuenta: "amarillo", cuatro: "amarillo" },
        widget: () => <WBarras aporte={54000} total={223554} en={40} />,
      },
      Tiempo: {
        etiqueta: "// 04 · EL SECRETO",
        acentos: { tiempo: "amarillo" },
        widget: ([, b]) => (
          <WNumero
            titulo="INTERESES GANADOS"
            valor="+$169k"
            golpe={b + 10}
            sub="sin mover un dedo"
          />
        ),
      },
      Compuesto: {
        etiqueta: "// 04 · EL SECRETO",
        acentos: { compuesto: "amarillo", empiezas: "amarillo" },
        widget: ([, b]) => <WSello texto={"EMPIEZA\nHOY"} en={b + 40} />,
      },
    }}
  />
);
