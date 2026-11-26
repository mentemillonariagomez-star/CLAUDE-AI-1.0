// Catálogo de widgets (maquetas genéricas) con el lenguaje de animación de la referencia.
// Cada widget recibe sus props del guion y "marcas": fotogramas (relativos a la escena)
// en los que se pronuncian las palabras a las que el guion ancló cada momento.
import { Easing, useCurrentFrame } from "remotion";
import { aparece, borroso, clic, escrito, pop, resorte, ruta, tramo } from "./anim";
import { C, MONO, SANS, SERIF, SOMBRA, TITULO } from "./estilo";
import { Check, Cursor, Marcado, Onda, Tarjeta, Telefono, Ventana } from "./Piezas";

type Props = {
  readonly p: Record<string, unknown>;
  readonly m: Readonly<Record<string, number>>;
};
const marca = (m: Props["m"], k: string, def: number) => m[k] ?? def;
const txt = (v: unknown, def = "") => (typeof v === "string" ? v : def);

// Icono genérico: cuadrado de color con una letra (sin emojis: el render no tiene fuente de emojis).
const Icono = ({ letra, color, tam = 64 }: { readonly letra: string; readonly color: string; readonly tam?: number }) => (
  <div
    style={{
      width: tam,
      height: tam,
      borderRadius: tam * 0.28,
      background: color,
      color: "white",
      fontFamily: SANS,
      fontWeight: 800,
      fontSize: tam * 0.45,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    }}
  >
    {letra}
  </div>
);

// ---------- Gancho: teléfono + polaroids con chincheta (A14) ----------
const Polaroid = ({
  pie,
  valor,
  alto,
  en,
  x,
  y,
  rot,
  desdeX,
}: {
  readonly pie: string;
  readonly valor: string;
  readonly alto: boolean;
  readonly en: number;
  readonly x: number;
  readonly y: number;
  readonly rot: number;
  readonly desdeX: number;
}) => {
  const f = useCurrentFrame();
  const s = resorte(f, en, 150, 14);
  if (f < en) return null;
  const barras = alto ? [0.25, 0.35, 0.5, 0.62, 0.8, 1] : [0.12, 0.1, 0.14, 0.11, 0.13, 0.12];
  return (
    <div
      style={{
        position: "absolute",
        left: desdeX + (x - desdeX) * s,
        top: y,
        width: 300,
        padding: "16px 16px 0",
        background: "#fbfaf7",
        boxShadow: SOMBRA,
        rotate: `${rot * s}deg`,
        opacity: aparece(f, en, 4),
      }}
    >
      <div style={{ height: 270, background: "linear-gradient(160deg,#1c2333,#0d1119)", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 22, left: 22, fontFamily: SANS, fontWeight: 800, fontSize: 40, color: alto ? C.postit : "#8a93a6" }}>
          {valor}
        </div>
        <div style={{ position: "absolute", bottom: 18, left: 22, right: 22, height: 150, display: "flex", alignItems: "flex-end", gap: 12 }}>
          {barras.map((b, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: `${b * 100 * tramo(f, en + 4 + i * 2, en + 14 + i * 2)}%`,
                borderRadius: 6,
                background: alto ? (i === barras.length - 1 ? C.rojo : "#f3c300") : "#4b5568",
              }}
            />
          ))}
        </div>
      </div>
      <div style={{ height: 76, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SERIF, fontStyle: "italic", fontSize: 44, color: C.tinta }}>
        {pie}
      </div>
      <div
        style={{
          position: "absolute",
          top: -14,
          left: "50%",
          marginLeft: -16,
          width: 32,
          height: 32,
          borderRadius: 16,
          background: "radial-gradient(circle at 35% 30%, #ff8a80, #d0281f 60%, #8f120c)",
          boxShadow: "0 5px 8px rgba(0,0,0,0.3)",
        }}
      />
    </div>
  );
};

const Gancho = ({ p, m }: Props) => {
  const f = useCurrentFrame();
  const izq = (p.izq ?? {}) as Record<string, string>;
  const der = (p.der ?? {}) as Record<string, string>;
  const chipEn = marca(m, "chip", 30);
  const s = resorte(f, chipEn, 200, 12);
  return (
    <>
      <Polaroid pie={izq.pie ?? "antes"} valor={izq.valor ?? ""} alto={false} en={marca(m, "izq", 10)} x={52} y={560} rot={-5} desdeX={300} />
      <Polaroid pie={der.pie ?? "después"} valor={der.valor ?? ""} alto en={marca(m, "der", 16)} x={728} y={600} rot={4} desdeX={450} />
      <Telefono ancho={380} alto={770} style={{ left: 350, top: 380, ...pop(f, 0) }}>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,#141b2d 0%,#0a0d16 100%)" }} />
        <div style={{ position: "absolute", top: 90, left: 32, fontFamily: SANS, fontWeight: 600, fontSize: 24, color: "#8a93a6" }}>
          {txt(p.app, "Tu cuenta")}
        </div>
        <div style={{ position: "absolute", top: 126, left: 32, fontFamily: SANS, fontWeight: 800, fontSize: 62, color: "white", letterSpacing: -1 }}>
          {txt(p.saldo, "0,00 $")}
        </div>
        <svg width={316} height={120} style={{ position: "absolute", top: 230, left: 24 }}>
          <path
            d="M 0 95 C 40 96 70 92 100 94 S 160 96 200 92 S 270 90 316 88"
            fill="none"
            stroke={C.rojo}
            strokeWidth={5}
            strokeDasharray={340}
            strokeDashoffset={340 * (1 - tramo(f, 4, 30))}
          />
        </svg>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ position: "absolute", top: 400 + i * 82, left: 28, right: 90, height: 60, borderRadius: 16, background: "rgba(255,255,255,0.07)", opacity: aparece(f, 6 + i * 4) }} />
        ))}
        {["♥", "●", "➤"].map((g, i) => (
          <div key={g} style={{ position: "absolute", right: 22, top: 420 + i * 78, width: 46, height: 46, borderRadius: 23, background: "rgba(255,255,255,0.92)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, color: "#111", opacity: aparece(f, 8 + i * 3) }}>
            {g}
          </div>
        ))}
      </Telefono>
      {f >= chipEn ? (
        <div
          style={{
            position: "absolute",
            left: 560,
            top: 356,
            padding: "12px 22px 12px 14px",
            borderRadius: 40,
            background: "white",
            boxShadow: SOMBRA,
            display: "flex",
            alignItems: "center",
            gap: 12,
            fontFamily: SANS,
            fontWeight: 800,
            fontSize: 30,
            color: C.tinta,
            scale: String(s),
            rotate: "3deg",
          }}
        >
          <Icono letra="z" color={C.rojo} tam={40} />
          <span>
            <Marcado texto={txt(p.chip, "hecho con *zerx.ai*")} />
          </span>
        </div>
      ) : null}
    </>
  );
};

// ---------- Rejilla de pasos (A17) ----------
type Item = { readonly t: string; readonly s?: string };
const Pasos = ({ p, m }: Props) => {
  const f = useCurrentFrame();
  const items = (p.items ?? []) as Item[];
  const repaso = Boolean(p.repaso);
  const tt = tramo(f, 0, 7, 0, 1, Easing.out(Easing.cubic));
  return (
    <>
      <div
        style={{
          position: "absolute",
          top: 500,
          width: 1080,
          textAlign: "center",
          fontFamily: TITULO,
          fontSize: 150,
          lineHeight: 1,
          color: C.tinta,
          letterSpacing: `${(1 - tt) * 0.4}em`,
          opacity: tt,
          filter: borroso((1 - tt) * 12),
        }}
      >
        <Marcado texto={txt(p.titulo, "5 *PASOS*")} serif={false} />
      </div>
      {items.map((it, i) => {
        const ultimo = i === items.length - 1 && items.length % 2 === 1;
        const en = marca(m, `i${i}`, repaso ? i * 2 : 8 + i * 5);
        const x = ultimo ? 290 : i % 2 === 0 ? 64 : 566;
        const y = 700 + Math.floor(i / 2) * 134;
        if (f < en) return null;
        const destaca = ultimo && Boolean(p.destacar ?? true);
        return (
          <Tarjeta
            key={i}
            style={{
              left: x,
              top: y,
              width: ultimo ? 500 : 450,
              height: 110,
              borderRadius: 20,
              display: "flex",
              alignItems: "center",
              gap: 20,
              padding: "0 22px",
              border: destaca ? `4px solid ${C.rojo}` : "4px solid transparent",
              ...pop(f, en),
            }}
          >
            <div
              style={{
                width: 60,
                height: 62,
                borderRadius: 12,
                background: destaca ? C.rojo : C.tinta,
                color: "white",
                fontFamily: TITULO,
                fontSize: 44,
                fontStyle: "italic",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {i + 1}
            </div>
            <div>
              <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 33, color: destaca ? C.rojo : C.tinta, letterSpacing: -0.5 }}>
                {it.t}
              </div>
              {it.s ? <div style={{ fontFamily: MONO, fontSize: 20, color: C.gris }}>// {it.s}</div> : null}
            </div>
            {repaso ? (
              <Check en={marca(m, `c${i}`, 12 + i * 6)} tam={50} style={{ position: "absolute", right: -14, top: -14 }} />
            ) : null}
          </Tarjeta>
        );
      })}
    </>
  );
};

// ---------- Lista de movimientos con fugas resaltadas ----------
type Fila = { readonly icono?: string; readonly color?: string; readonly t: string; readonly s?: string; readonly v: string; readonly fuga?: boolean };
const Lista = ({ p, m }: Props) => {
  const f = useCurrentFrame();
  const filas = (p.filas ?? []) as Fila[];
  const res = marca(m, "resaltar", 45);
  const fugas = filas.map((r, i) => (r.fuga ? i : -1)).filter((i) => i >= 0);
  const filaY = (i: number) => 640 + 74 + 20 + i * 104 + 42;
  const puntos = [
    { en: res - 16, x: 980, y: 1260 },
    ...fugas.map((i, k) => ({ en: res + k * 8, x: 840, y: filaY(i) })),
  ];
  const cur = ruta(f, puntos);
  return (
    <>
      <Ventana titulo={txt(p.app, "Tu banco · Movimientos")} style={{ left: 64, top: 640, width: 952, ...pop(f, 0) }}>
        <div style={{ padding: "20px 24px" }}>
          {filas.map((r, i) => {
            const en = marca(m, `f${i}`, 5 + i * 4);
            const k = fugas.indexOf(i);
            const marcada = r.fuga && f >= res + k * 8;
            const tm = marcada ? tramo(f, res + k * 8, res + k * 8 + 5) : 0;
            return (
              <div
                key={i}
                style={{
                  height: 92,
                  marginBottom: 12,
                  borderRadius: 18,
                  display: "flex",
                  alignItems: "center",
                  gap: 20,
                  padding: "0 18px",
                  background: `rgba(224,50,44,${0.1 * tm})`,
                  outline: tm > 0 ? `3px solid rgba(224,50,44,${tm})` : "none",
                  ...(f < en ? { opacity: 0 } : pop(f, en)),
                }}
              >
                <Icono letra={r.icono ?? r.t[0]} color={r.color ?? "#64748b"} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 32, color: C.tinta }}>{r.t}</div>
                  {r.s ? <div style={{ fontFamily: MONO, fontSize: 20, color: C.gris }}>{r.s}</div> : null}
                </div>
                {marcada ? (
                  <div style={{ fontFamily: TITULO, fontSize: 26, color: "white", background: C.rojo, padding: "4px 12px", borderRadius: 8, scale: String(resorte(f, res + k * 8 + 2)) }}>
                    FUGA
                  </div>
                ) : null}
                <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 32, color: marcada ? C.rojo : C.tinta, minWidth: 150, textAlign: "right" }}>
                  {r.v}
                </div>
              </div>
            );
          })}
        </div>
      </Ventana>
      {f >= res - 16 ? <Cursor x={cur.x} y={cur.y} escala={fugas.reduce((e, _, k) => Math.min(e, clic(f, res + k * 8)), 1)} opacity={aparece(f, res - 16, 4)} /> : null}
    </>
  );
};

// ---------- Formulario: cursor → nueva cuenta → escribir nombre → crear ----------
const Formulario = ({ p, m }: Props) => {
  const f = useCurrentFrame();
  const cl = marca(m, "clic", 14);
  const esc = marca(m, "escribe", cl + 12);
  const texto = txt(p.texto, "Mis 1.000 $");
  const crear = marca(m, "crear", esc + Math.ceil((texto.length / 22) * 30) + 10);
  const cur = ruta(f, [
    { en: cl - 14, x: 900, y: 1250 },
    { en: cl, x: 250, y: 922 },
    { en: crear - 10, x: 250, y: 922 },
    { en: crear, x: 760, y: 1086 },
  ]);
  const modal = f >= cl + 3 && f < crear + 6;
  const salida = tramo(f, crear + 2, crear + 6);
  const caret = Math.floor(f / 8) % 2 === 0;
  return (
    <>
      <Ventana titulo={txt(p.app, "Tu banco · Cuentas")} style={{ left: 64, top: 640, width: 952, height: 600, ...pop(f, 0) }}>
        <div style={{ padding: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20, padding: 18, borderRadius: 18, background: "#f6f5f2" }}>
            <Icono letra="$" color="#64748b" />
            <div style={{ flex: 1, fontFamily: SANS, fontWeight: 700, fontSize: 32 }}>{txt(p.principal, "Cuenta principal")}</div>
            <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 32 }}>{txt(p.saldo, "1.240,00 $")}</div>
          </div>
          <div
            style={{
              marginTop: 30,
              width: 330,
              height: 74,
              borderRadius: 16,
              border: `3px solid ${C.rojo}`,
              color: C.rojo,
              fontFamily: SANS,
              fontWeight: 800,
              fontSize: 30,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: f >= cl && f < cl + 6 ? C.rojoSuave : "white",
            }}
          >
            {txt(p.boton, "+ Nueva cuenta")}
          </div>
          {f >= crear + 4 ? (
            <div
              style={{
                marginTop: 30,
                display: "flex",
                alignItems: "center",
                gap: 20,
                padding: 18,
                borderRadius: 18,
                border: `3px solid ${C.rojo}`,
                background: "#fff6f5",
                ...pop(f, crear + 4),
              }}
            >
              <Icono letra="★" color={C.rojo} />
              <div style={{ flex: 1, fontFamily: SANS, fontWeight: 800, fontSize: 32 }}>{texto}</div>
              <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 32, color: C.rojo }}>{txt(p.inicial, "0,00 $")}</div>
            </div>
          ) : null}
        </div>
      </Ventana>
      <Onda en={cl} x={250} y={922} />
      <Onda en={crear} x={760} y={1086} />
      {modal ? (
        <Tarjeta style={{ left: 190, top: 760, width: 700, height: 400, padding: 36, zIndex: 10, ...pop(f, cl + 3), opacity: 1 - salida, scale: String(1 - 0.08 * salida) }}>
          <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 40 }}>{txt(p.modal, "Nueva cuenta")}</div>
          <div style={{ fontFamily: MONO, fontSize: 22, color: C.gris, marginTop: 22 }}>{txt(p.campo, "Nombre")}</div>
          <div style={{ marginTop: 10, height: 84, borderRadius: 14, border: "3px solid #2f6fe4", display: "flex", alignItems: "center", padding: "0 20px", fontFamily: SANS, fontWeight: 700, fontSize: 36 }}>
            {f < esc ? <span style={{ color: "#bbb" }}>{txt(p.placeholder, "Ponle un nombre…")}</span> : escrito(f, esc, texto)}
            {f >= esc && caret ? <span style={{ width: 3, height: 40, background: C.tinta, marginLeft: 3 }} /> : null}
          </div>
          <div style={{ position: "absolute", right: 40, bottom: 40, width: 180, height: 64, borderRadius: 14, background: C.rojo, color: "white", fontFamily: SANS, fontWeight: 800, fontSize: 28, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {txt(p.crear, "Crear")}
          </div>
        </Tarjeta>
      ) : null}
      {f >= cl - 14 && f < crear + 20 ? (
        <Cursor x={cur.x} y={cur.y} escala={Math.min(clic(f, cl), clic(f, crear))} opacity={aparece(f, cl - 14, 4) * (1 - tramo(f, crear + 12, crear + 20))} />
      ) : null}
    </>
  );
};

// ---------- Panel oscuro con barras de progreso (A10) ----------
type FilaP = { readonly t: string; readonly icono?: string; readonly dur?: number };
const Progreso = ({ p, m }: Props) => {
  const f = useCurrentFrame();
  const filas = (p.filas ?? []) as FilaP[];
  const spin = (f * 12) % 360;
  return (
    <div
      style={{
        position: "absolute",
        left: 64,
        top: 650,
        width: 952,
        borderRadius: 30,
        padding: "30px 34px 14px",
        background: "linear-gradient(170deg,#2a2a2d,#161618)",
        boxShadow: "0 26px 50px rgba(0,0,0,0.35)",
        ...pop(f, 0),
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16, fontFamily: SANS, fontWeight: 600, fontSize: 30, color: "#e5e5e5", marginBottom: 20 }}>
        <svg width={30} height={30} viewBox="0 0 30 30" style={{ rotate: `${spin}deg` }}>
          <circle cx={15} cy={15} r={11} fill="none" stroke={C.rojo} strokeWidth={5} strokeDasharray="50 30" strokeLinecap="round" />
        </svg>
        {txt(p.cabecera, "Programando…")}
      </div>
      {filas.map((r, i) => {
        const en = marca(m, `f${i}`, 8 + i * 9);
        const dur = r.dur ?? 34 + i * 8;
        const v = tramo(f, en, en + dur, 0, 1, Easing.inOut(Easing.quad));
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 22, height: 96, borderRadius: 18, padding: "0 18px", marginBottom: 14, background: "rgba(255,255,255,0.05)", opacity: 0.35 + 0.65 * aparece(f, en - 6), ...(f < 4 + i * 4 ? { opacity: 0 } : {}) }}>
            <Icono letra={r.icono ?? r.t[0]} color="#3a3a3e" tam={52} />
            <div style={{ width: 330, fontFamily: SANS, fontWeight: 700, fontSize: 32, color: "white" }}>{r.t}</div>
            <div style={{ flex: 1, height: 14, borderRadius: 7, background: "rgba(255,255,255,0.12)", overflow: "hidden" }}>
              <div style={{ width: `${v * 100}%`, height: "100%", borderRadius: 7, background: `linear-gradient(90deg,#ff7a6e,${C.rojo})` }} />
            </div>
            <div style={{ width: 50 }}>{v >= 1 ? <Check en={en + dur} tam={48} /> : null}</div>
          </div>
        );
      })}
    </div>
  );
};

// ---------- Caja de texto que se escribe + contador grande ----------
const Escribir = ({ p, m }: Props) => {
  const f = useCurrentFrame();
  const esc = marca(m, "escribe", 10);
  const texto = txt(p.texto);
  const reloj = marca(m, "reloj", esc + 40);
  const c = (p.contador ?? {}) as { desde?: number; hasta?: number; etiqueta?: string; formato?: string };
  const desde = c.desde ?? 48;
  const hasta = c.hasta ?? 0;
  const v = Math.round(desde + (hasta - desde) * tramo(f, reloj, reloj + 55, 0, 1, Easing.inOut(Easing.quad)));
  const caret = Math.floor(f / 8) % 2 === 0;
  const prev = Math.round(desde + (hasta - desde) * tramo(f - 1, reloj, reloj + 55, 0, 1, Easing.inOut(Easing.quad)));
  return (
    <>
      <Tarjeta style={{ left: 64, top: 660, width: 952, height: 230, padding: 34, ...pop(f, 0) }}>
        <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 40, color: f < esc ? "#aaa" : C.tinta }}>
          {f < esc ? txt(p.placeholder, "Escribe aquí…") : escrito(f, esc, texto, 18)}
          {caret ? <span style={{ display: "inline-block", width: 3, height: 44, background: C.tinta, marginLeft: 3, verticalAlign: "middle" }} /> : null}
        </div>
        <div style={{ position: "absolute", right: 26, bottom: 26, width: 56, height: 56, borderRadius: 14, background: C.rojo, color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, fontFamily: SANS, fontWeight: 800 }}>
          ↑
        </div>
      </Tarjeta>
      {f >= reloj - 4 ? (
        <div style={{ position: "absolute", left: 100, top: 960, textAlign: "center", ...pop(f, reloj - 4) }}>
          <div style={{ fontFamily: TITULO, fontSize: 170, lineHeight: 1, color: C.tinta, translate: `0 ${v !== prev ? -6 : 0}px` }}>
            {c.formato === "reloj" ? `${String(v).padStart(2, "0")}:00` : v}
          </div>
          <div style={{ fontFamily: TITULO, fontSize: 44, color: C.rojo, letterSpacing: 1 }}>{c.etiqueta ?? "HORAS"}</div>
        </div>
      ) : null}
    </>
  );
};

// ---------- Contador rodante + barras por mes (A11) ----------
const Digitos = ({ valor, tam }: { readonly valor: number; readonly tam: number }) => {
  const entero = Math.floor(valor);
  const n = String(Math.max(1, entero)).length;
  const cols = [];
  for (let k = n - 1; k >= 0; k--) {
    const base = Math.pow(10, k);
    const resto = valor % base;
    const pos = (Math.floor(valor / base) % 10) + (k === 0 ? Math.max(0, (valor % 1) * 3 - 2) : Math.max(0, Math.min(1, resto - (base - 1))));
    cols.push(
      <div key={k} style={{ height: tam, overflow: "hidden", display: "inline-block" }}>
        <div style={{ translate: `0 ${-pos * tam}px` }}>
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((d, i) => (
            <div key={i} style={{ height: tam, lineHeight: `${tam}px` }}>
              {d}
            </div>
          ))}
        </div>
      </div>,
    );
    if (k === 3) cols.push(<span key={`p${k}`}>.</span>);
  }
  return <>{cols}</>;
};

const Contador = ({ p, m }: Props) => {
  const f = useCurrentFrame();
  const ini = marca(m, "inicio", 6);
  const fin = marca(m, "fin", ini + 70);
  const objetivo = typeof p.valor === "number" ? p.valor : 1000;
  const t = tramo(f, ini, fin, 0, 1, Easing.inOut(Easing.cubic));
  const meses = 12;
  return (
    <Tarjeta style={{ left: 64, top: 650, width: 952, height: 560, padding: 40, ...pop(f, 0) }}>
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <Icono letra="★" color={C.rojo} tam={56} />
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 36 }}>{txt(p.cuenta, "Mis 1.000 $")}</div>
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginTop: 20, fontFamily: TITULO, fontSize: 150, lineHeight: 1, color: C.tinta }}>
        <Digitos valor={objetivo * t} tam={150} />
        <span style={{ fontSize: 90, color: C.rojo }}>{txt(p.sufijo, "$")}</span>
      </div>
      <div style={{ height: 18, borderRadius: 9, background: "#eee", marginTop: 18, overflow: "hidden" }}>
        <div style={{ width: `${t * 100}%`, height: "100%", background: `linear-gradient(90deg,#ff7a6e,${C.rojo})` }} />
      </div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 14, height: 170, marginTop: 28 }}>
        {new Array(meses).fill(0).map((_, i) => {
          const h = tramo(t, i / meses, (i + 1) / meses, 0, 1, Easing.linear);
          return <div key={i} style={{ flex: 1, height: `${((i + 1) / meses) * 100 * h}%`, borderRadius: 6, background: i === meses - 1 ? C.rojo : C.tinta, opacity: 0.85 }} />;
        })}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontFamily: MONO, fontSize: 20, color: C.gris, marginTop: 8 }}>
        <span>{txt(p.desde, "mes 1")}</span>
        <span>{txt(p.hasta, "mes 12")}</span>
      </div>
      {f >= fin ? (
        <div style={{ position: "absolute", right: 36, top: 36, display: "flex", alignItems: "center", gap: 10, padding: "10px 20px", borderRadius: 30, background: C.rojo, color: "white", fontFamily: SANS, fontWeight: 800, fontSize: 28, scale: String(resorte(f, fin)) }}>
          ✓ {txt(p.meta, "meta cumplida")}
        </div>
      ) : null}
    </Tarjeta>
  );
};

// ---------- Perfil (CTA): bio resaltada + seguir + guardar ----------
const PerfilCta = ({ p, m }: Props) => {
  const f = useCurrentFrame();
  const bio = marca(m, "bio", 10);
  const seg = marca(m, "seguir", 30);
  const cur = ruta(f, [
    { en: seg - 14, x: 960, y: 1300 },
    { en: seg, x: 860, y: 745 },
  ]);
  const siguiendo = f >= seg + 2;
  const miniaturas = (p.miniaturas ?? []) as string[];
  return (
    <>
      <Tarjeta style={{ left: 64, top: 640, width: 952, padding: 36, ...pop(f, 0) }}>
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <div style={{ width: 150, height: 150, borderRadius: 75, overflow: "hidden", position: "relative", flexShrink: 0, boxShadow: `0 0 0 5px ${C.postit}` }}>
            <div style={{ width: "100%", height: "100%", background: "#0a0a0a", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: TITULO, fontSize: 70, color: C.postit }}>
              zx
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 40 }}>{txt(p.nombre, "zerx.ai")}</div>
            <div style={{ fontFamily: MONO, fontSize: 24, color: C.gris }}>{txt(p.usuario, "@zerx.ai0")}</div>
          </div>
          <div
            style={{
              width: 230,
              height: 76,
              borderRadius: 16,
              background: siguiendo ? "#e9e7e3" : C.rojo,
              color: siguiendo ? C.tinta : "white",
              fontFamily: SANS,
              fontWeight: 800,
              fontSize: 30,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              scale: String(clic(f, seg)),
            }}
          >
            {siguiendo ? "Siguiendo ✓" : txt(p.boton, "Seguir")}
          </div>
        </div>
        <div style={{ marginTop: 28, position: "relative", display: "inline-block", fontFamily: SANS, fontWeight: 700, fontSize: 34, padding: "8px 14px", borderRadius: 10 }}>
          <div style={{ position: "absolute", inset: 0, borderRadius: 10, background: C.rojo, scale: `${tramo(f, bio, bio + 6)} 1`, transformOrigin: "left center" }} />
          <span style={{ position: "relative", color: f >= bio + 3 ? "white" : C.tinta }}>{txt(p.bio, "Dinero, hábitos e IA")}</span>
        </div>
        <div style={{ display: "flex", gap: 14, marginTop: 28 }}>
          {miniaturas.map((t, i) => (
            <div key={i} style={{ flex: 1, height: 230, borderRadius: 16, background: ["linear-gradient(160deg,#1c2333,#0d1119)", "linear-gradient(160deg,#2a1d03,#0a0a0a)", "linear-gradient(160deg,#3b0d0b,#120606)"][i % 3], padding: 16, display: "flex", alignItems: "flex-end", fontFamily: TITULO, fontSize: 34, lineHeight: 1.05, color: "white", ...pop(f, 6 + i * 4) }}>
              {t}
            </div>
          ))}
        </div>
      </Tarjeta>
      <Onda en={seg} x={866} y={752} />
      {f >= seg - 14 ? <Cursor x={cur.x} y={cur.y} escala={clic(f, seg)} opacity={aparece(f, seg - 14, 4)} /> : null}
    </>
  );
};

export const WIDGETS: Record<string, (props: Props) => React.ReactNode> = {
  gancho: Gancho,
  pasos: Pasos,
  lista: Lista,
  formulario: Formulario,
  progreso: Progreso,
  escribir: Escribir,
  contador: Contador,
  perfil: PerfilCta,
};
