// Biblioteca de widgets reutilizables para la serie de videos en formato portátil.
import { Easing, interpolate, random, useCurrentFrame } from "remotion";
import { AMARILLO, GROTESK, MONO, ROJO } from "../Pantalla/Escritorio";
import { Tarjeta } from "../Pantalla/Widgets";

const CLAMP = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const VERDE = "#4ade80";
const fmt = (n: number, dec = 0) =>
  n.toLocaleString("de-DE", {
    minimumFractionDigits: dec,
    maximumFractionDigits: dec,
  });

const sacudida = (frame: number, en: number) => {
  const t = frame - en;
  if (t < 0 || t > 8) return "0px 0px";
  const k = 1 - t / 8;
  return `${(random(`sx${frame}`) - 0.5) * 22 * k}px ${(random(`sy${frame}`) - 0.5) * 22 * k}px`;
};

const golpeEscala = (frame: number, en: number) =>
  String(interpolate(frame, [en, en + 3, en + 10], [1, 1.14, 1], CLAMP));

export const WNumero = ({
  titulo,
  valor,
  color = AMARILLO,
  golpe = 4,
  sub,
  extra,
}: {
  readonly titulo: string;
  readonly valor: string;
  readonly color?: string;
  readonly golpe?: number;
  readonly sub?: string;
  readonly extra?: string;
}) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ translate: sacudida(frame, golpe) }}>
      <Tarjeta
        titulo={titulo}
        extra={extra ? <span style={{ color }}>{extra}</span> : undefined}
      >
        <div
          style={{
            fontFamily: GROTESK,
            fontWeight: 700,
            fontSize: valor.length > 5 ? 88 : 120,
            lineHeight: 1.05,
            color,
            textShadow: `0 0 40px ${color}66`,
            scale: golpeEscala(frame, golpe),
          }}
        >
          {valor}
        </div>
        {sub ? (
          <div
            style={{
              fontFamily: MONO,
              fontSize: 18,
              color: "#888",
              marginTop: 8,
            }}
          >
            {sub}
          </div>
        ) : null}
      </Tarjeta>
    </div>
  );
};

export const WContador = ({
  titulo,
  de,
  a,
  desde,
  hasta,
  prefijo = "",
  sufijo = "",
  decimales = 0,
  color = AMARILLO,
  exponencial = false,
}: {
  readonly titulo: string;
  readonly de: number;
  readonly a: number;
  readonly desde: number;
  readonly hasta: number;
  readonly prefijo?: string;
  readonly sufijo?: string;
  readonly decimales?: number;
  readonly color?: string;
  readonly exponencial?: boolean;
}) => {
  const frame = useCurrentFrame();
  const v = interpolate(frame, [desde, hasta], [de, a], {
    ...CLAMP,
    easing: exponencial ? Easing.in(Easing.exp) : Easing.out(Easing.quad),
  });
  return (
    <Tarjeta titulo={titulo}>
      <div
        style={{
          fontFamily: GROTESK,
          fontWeight: 700,
          fontSize: 76,
          color: frame >= hasta ? color : "white",
          fontVariantNumeric: "tabular-nums",
          scale: golpeEscala(frame, hasta),
        }}
      >
        {prefijo}
        {fmt(v, decimales)}
        {sufijo}
      </div>
      <div
        style={{
          marginTop: 16,
          height: 10,
          borderRadius: 5,
          backgroundColor: "#26262b",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: 10,
            width: `${((v - de) / (a - de)) * 100}%`,
            backgroundColor: color,
          }}
        />
      </div>
    </Tarjeta>
  );
};

export const WFormula = ({
  base,
  exp,
  resultado,
  decimales,
  desde,
  hasta,
  color = AMARILLO,
}: {
  readonly base: string;
  readonly exp: string;
  readonly resultado: number;
  readonly decimales: number;
  readonly desde: number;
  readonly hasta: number;
  readonly color?: string;
}) => {
  const frame = useCurrentFrame();
  const v = interpolate(frame, [desde, hasta], [1, resultado], {
    ...CLAMP,
    easing: Easing.in(Easing.cubic),
  });
  return (
    <Tarjeta titulo="CALCULADORA" extra={<span style={{ color }}>=</span>}>
      <div
        style={{
          fontFamily: GROTESK,
          fontWeight: 700,
          fontSize: 80,
          color: "white",
        }}
      >
        {base}
        <sup style={{ fontSize: 44, color }}>{exp}</sup>
      </div>
      <div
        style={{
          fontFamily: GROTESK,
          fontWeight: 700,
          fontSize: 64,
          color,
          fontVariantNumeric: "tabular-nums",
          scale: golpeEscala(frame, hasta),
        }}
      >
        = {fmt(v, decimales)}
      </div>
    </Tarjeta>
  );
};

export const WCurva = ({
  titulo,
  sube = true,
  color = AMARILLO,
  desde = 2,
  hasta,
  etiqueta,
}: {
  readonly titulo: string;
  readonly sube?: boolean;
  readonly color?: string;
  readonly desde?: number;
  readonly hasta: number;
  readonly etiqueta: string;
}) => {
  const frame = useCurrentFrame();
  // Curva exponencial (o su inversa) dibujada con puntos.
  const pts = new Array(40).fill(true).map((_, i) => {
    const x = i / 39;
    const y = sube ? (Math.pow(37.8, x) - 1) / 36.8 : Math.pow(0.0255, x);
    return `${10 + x * 340},${190 - y * 170}`;
  });
  return (
    <Tarjeta titulo={titulo} extra={<span style={{ color }}>{etiqueta}</span>}>
      <svg width={356} height={200} viewBox="0 0 356 200">
        <line
          x1={10}
          y1={190}
          x2={350}
          y2={190}
          stroke="#333"
          strokeWidth={2}
        />
        <polyline
          points={pts.join(" ")}
          fill="none"
          stroke={color}
          strokeWidth={8}
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={interpolate(frame, [desde, hasta], [1, 0], CLAMP)}
        />
      </svg>
      <div
        style={{
          fontFamily: GROTESK,
          fontWeight: 700,
          fontSize: 58,
          color,
          opacity: interpolate(frame, [hasta - 2, hasta + 3], [0, 1], CLAMP),
          scale: golpeEscala(frame, hasta),
        }}
      >
        {etiqueta}
      </div>
    </Tarjeta>
  );
};

export const WLista = ({
  titulo,
  items,
}: {
  readonly titulo: string;
  readonly items: readonly { t: string; en: number; ok: boolean }[];
}) => {
  const frame = useCurrentFrame();
  return (
    <Tarjeta titulo={titulo} extra={<span>{items.length}</span>}>
      {items.map((f) => {
        const hecho = frame >= f.en;
        return (
          <div
            key={f.t}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              padding: "18px 4px",
              borderTop: "1px solid #222",
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                flexShrink: 0,
                borderRadius: 10,
                border: `2px solid ${hecho ? (f.ok ? AMARILLO : ROJO) : "#555"}`,
                backgroundColor: hecho && f.ok ? AMARILLO : "transparent",
                color: f.ok ? "#0a0a0a" : ROJO,
                fontFamily: GROTESK,
                fontWeight: 700,
                fontSize: 26,
                textAlign: "center",
                lineHeight: "32px",
                scale: golpeEscala(frame, f.en),
              }}
            >
              {hecho ? (f.ok ? "✓" : "✕") : ""}
            </div>
            <div
              style={{
                fontFamily: GROTESK,
                fontWeight: 700,
                fontSize: 36,
                color: hecho ? (f.ok ? AMARILLO : "#666") : "#ddd",
                textDecoration: hecho && !f.ok ? "line-through" : undefined,
                textDecorationColor: ROJO,
              }}
            >
              {f.t}
            </div>
          </div>
        );
      })}
    </Tarjeta>
  );
};

export const WChat = ({
  pregunta,
  respuesta,
  desde = 4,
  responde,
}: {
  readonly pregunta: string;
  readonly respuesta: string;
  readonly desde?: number;
  readonly responde: number;
}) => {
  const frame = useCurrentFrame();
  const n = Math.floor(
    interpolate(
      frame,
      [desde, desde + pregunta.length * 0.7],
      [0, pregunta.length],
      CLAMP,
    ),
  );
  const m = Math.floor(
    interpolate(
      frame,
      [responde, responde + respuesta.length * 0.5],
      [0, respuesta.length],
      CLAMP,
    ),
  );
  return (
    <Tarjeta
      titulo="CHAT · IA"
      extra={<span style={{ color: AMARILLO }}>● en línea</span>}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
          minHeight: 250,
        }}
      >
        <div
          style={{
            alignSelf: "flex-end",
            maxWidth: 320,
            backgroundColor: AMARILLO,
            color: "#111",
            fontFamily: GROTESK,
            fontWeight: 500,
            fontSize: 22,
            padding: "12px 16px",
            borderRadius: "16px 16px 4px 16px",
          }}
        >
          {pregunta.slice(0, n)}
        </div>
        {frame >= responde ? (
          <div
            style={{
              alignSelf: "flex-start",
              maxWidth: 330,
              backgroundColor: "#222226",
              color: "#e5e5e5",
              fontFamily: GROTESK,
              fontSize: 21,
              padding: "12px 16px",
              borderRadius: "16px 16px 16px 4px",
            }}
          >
            {respuesta.slice(0, m)}
            <span
              style={{ opacity: m < respuesta.length && frame % 8 < 4 ? 1 : 0 }}
            >
              ▍
            </span>
          </div>
        ) : null}
      </div>
    </Tarjeta>
  );
};

export const WDoc = ({
  en,
  bullets,
}: {
  readonly en: number;
  readonly bullets: readonly string[];
}) => {
  const frame = useCurrentFrame();
  const resumido = frame >= en;
  return (
    <Tarjeta
      titulo={resumido ? "RESUMEN.md" : "informe.pdf"}
      extra={
        <span style={{ color: resumido ? AMARILLO : "#888" }}>
          {resumido ? "3 puntos" : "48 págs."}
        </span>
      }
    >
      {!resumido ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 9,
            scale: `1 ${interpolate(frame, [en - 6, en], [1, 0.2], CLAMP)}`,
            transformOrigin: "top",
          }}
        >
          {new Array(12).fill(true).map((_, i) => (
            <div
              key={i}
              style={{
                height: 10,
                borderRadius: 5,
                backgroundColor: "#2e2e33",
                width: `${60 + random(`d${i}`) * 40}%`,
              }}
            />
          ))}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {bullets.map((b, i) => (
            <div
              key={b}
              style={{
                display: "flex",
                gap: 12,
                fontFamily: GROTESK,
                fontSize: 26,
                color: "#e5e5e5",
                opacity: interpolate(
                  frame,
                  [en + i * 5, en + i * 5 + 4],
                  [0, 1],
                  CLAMP,
                ),
              }}
            >
              <span style={{ color: AMARILLO }}>●</span>
              {b}
            </div>
          ))}
        </div>
      )}
    </Tarjeta>
  );
};

export const WIdeas = ({
  ideas,
  mejor,
  en,
}: {
  readonly ideas: readonly string[];
  readonly mejor: number;
  readonly en: number;
}) => {
  const frame = useCurrentFrame();
  return (
    <Tarjeta
      titulo="10 IDEAS"
      extra={
        <span style={{ color: AMARILLO }}>
          {frame >= en ? "★ elegida" : "generando…"}
        </span>
      }
    >
      {ideas.map((t, i) => {
        const elegida = frame >= en && i === mejor;
        return (
          <div
            key={t}
            style={{
              display: "flex",
              gap: 10,
              fontFamily: MONO,
              fontSize: 17,
              padding: "3px 8px",
              borderRadius: 6,
              color: elegida ? "#0a0a0a" : frame >= en ? "#555" : "#cfcfcf",
              backgroundColor: elegida ? AMARILLO : "transparent",
              opacity: interpolate(
                frame,
                [3 + i * 2, 5 + i * 2],
                [0, 1],
                CLAMP,
              ),
              scale: elegida ? golpeEscala(frame, en) : "1",
            }}
          >
            <span>{String(i + 1).padStart(2, "0")}</span>
            {t}
          </div>
        );
      })}
    </Tarjeta>
  );
};

export const WReloj = ({
  antes,
  despues,
  en,
}: {
  readonly antes: string;
  readonly despues: string;
  readonly en: number;
}) => {
  const frame = useCurrentFrame();
  return (
    <Tarjeta
      titulo="TIEMPO"
      extra={
        <span style={{ color: frame >= en ? VERDE : ROJO }}>
          {frame >= en ? "▼ ahorro" : "● perdido"}
        </span>
      }
    >
      <div
        style={{
          position: "relative",
          fontFamily: GROTESK,
          fontWeight: 700,
          fontSize: 96,
          color: frame >= en ? "#555" : ROJO,
        }}
      >
        {antes}
        <div
          style={{
            position: "absolute",
            left: -6,
            right: "35%",
            top: "52%",
            height: 10,
            backgroundColor: ROJO,
            transformOrigin: "left",
            scale: `${interpolate(frame, [en, en + 6], [0, 1], CLAMP)} 1`,
          }}
        />
      </div>
      <div
        style={{
          fontFamily: GROTESK,
          fontWeight: 700,
          fontSize: 96,
          color: AMARILLO,
          opacity: interpolate(frame, [en + 4, en + 8], [0, 1], CLAMP),
          scale: golpeEscala(frame, en + 4),
        }}
      >
        {despues}
      </div>
    </Tarjeta>
  );
};

export const WCalendario = ({
  titulo = "AÑO · 365 DÍAS",
  en = 6,
}: {
  readonly titulo?: string;
  readonly en?: number;
}) => {
  const frame = useCurrentFrame();
  return (
    <Tarjeta
      titulo={titulo}
      extra={<span style={{ color: AMARILLO }}>DÍA 1</span>}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(21, 1fr)",
          gap: 4,
        }}
      >
        {new Array(357).fill(true).map((_, i) => (
          <div
            key={i}
            style={{
              height: 11,
              borderRadius: 3,
              backgroundColor: i === 0 && frame >= en ? AMARILLO : "#222226",
              boxShadow:
                i === 0 && frame >= en
                  ? `0 0 ${10 + 6 * Math.sin(frame / 3)}px ${AMARILLO}`
                  : undefined,
            }}
          />
        ))}
      </div>
    </Tarjeta>
  );
};

export const WBarras = ({
  aporte,
  total,
  en,
}: {
  readonly aporte: number;
  readonly total: number;
  readonly en: number;
}) => {
  const frame = useCurrentFrame();
  const h = (v: number) => (v / total) * 230;
  const crece = interpolate(frame, [2, en], [0, 1], {
    ...CLAMP,
    easing: Easing.out(Easing.cubic),
  });
  return (
    <Tarjeta titulo="TÚ VS. EL TIEMPO">
      <div
        style={{
          height: 290,
          display: "flex",
          alignItems: "flex-end",
          gap: 40,
          padding: "0 20px",
        }}
      >
        {[
          { v: aporte, c: "#9ca3af", t: "Pusiste" },
          { v: total, c: AMARILLO, t: "Tienes" },
        ].map((b) => (
          <div
            key={b.t}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
            }}
          >
            <div
              style={{
                fontFamily: GROTESK,
                fontWeight: 700,
                fontSize: 30,
                color: b.c,
              }}
            >
              ${fmt(Math.round(b.v / 1000))}k
            </div>
            <div
              style={{
                width: "100%",
                height: h(b.v) * crece,
                borderRadius: "10px 10px 2px 2px",
                backgroundColor: b.c,
              }}
            />
            <div style={{ fontFamily: MONO, fontSize: 18, color: "#aaa" }}>
              {b.t}
            </div>
          </div>
        ))}
      </div>
    </Tarjeta>
  );
};

export const WSello = ({
  texto,
  en,
}: {
  readonly texto: string;
  readonly en: number;
}) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        fontFamily: GROTESK,
        fontWeight: 700,
        fontSize: 56,
        lineHeight: 1.05,
        textAlign: "center",
        color: "#0a0a0a",
        backgroundColor: AMARILLO,
        padding: "22px 30px",
        borderRadius: 16,
        rotate: "-5deg",
        boxShadow: `0 0 60px ${AMARILLO}55`,
        opacity: interpolate(frame, [en, en + 2], [0, 1], CLAMP),
        scale: String(
          interpolate(frame, [en, en + 7], [2.2, 1], {
            ...CLAMP,
            easing: Easing.out(Easing.cubic),
          }),
        ),
        translate: sacudida(frame, en + 6),
        whiteSpace: "pre-line",
      }}
    >
      {texto}
    </div>
  );
};
