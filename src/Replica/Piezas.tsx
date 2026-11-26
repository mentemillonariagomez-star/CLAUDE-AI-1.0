// Piezas reutilizables: tarjeta, teléfono, ventana, cursor, sello, post-it, chip, check, confeti.
import type { CSSProperties, ReactNode } from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { azar, borroso, CL, clic, pop, resorte, tramo } from "./anim";
import { C, MONO, SANS, SERIF, SOMBRA, TITULO } from "./estilo";

// Texto con *palabras clave* en serif cursiva roja.
export const Marcado = ({
  texto,
  serif = true,
}: {
  readonly texto: string;
  readonly serif?: boolean;
}) => (
  <>
    {texto.split(/(\*[^*]+\*)/).map((p, i) =>
      p.startsWith("*") ? (
        <span
          key={i}
          style={
            serif
              ? { color: C.rojo, fontFamily: SERIF, fontStyle: "italic", fontWeight: 400 }
              : { color: C.rojo }
          }
        >
          {p.slice(1, -1)}
        </span>
      ) : (
        <span key={i}>{p}</span>
      ),
    )}
  </>
);

export const Tarjeta = ({
  children,
  style,
}: {
  readonly children: ReactNode;
  readonly style?: CSSProperties;
}) => (
  <div
    style={{
      background: C.blanco,
      borderRadius: 26,
      boxShadow: SOMBRA,
      position: "absolute",
      ...style,
    }}
  >
    {children}
  </div>
);

export const Telefono = ({
  children,
  ancho = 360,
  alto = 720,
  style,
}: {
  readonly children: ReactNode;
  readonly ancho?: number;
  readonly alto?: number;
  readonly style?: CSSProperties;
}) => (
  <div
    style={{
      position: "absolute",
      width: ancho,
      height: alto,
      borderRadius: ancho * 0.16,
      background: "linear-gradient(145deg,#2c2c2e,#0c0c0d)",
      padding: 12,
      boxShadow: `${SOMBRA}, inset 0 0 0 2px #444`,
      ...style,
    }}
  >
    <div
      style={{
        width: "100%",
        height: "100%",
        borderRadius: ancho * 0.13,
        overflow: "hidden",
        position: "relative",
        background: "#101014",
      }}
    >
      {children}
      <div
        style={{
          position: "absolute",
          top: 14,
          left: "50%",
          width: ancho * 0.3,
          height: 30,
          marginLeft: -ancho * 0.15,
          borderRadius: 20,
          background: "#000",
        }}
      />
    </div>
  </div>
);

export const Ventana = ({
  children,
  titulo,
  style,
}: {
  readonly children: ReactNode;
  readonly titulo?: string;
  readonly style?: CSSProperties;
}) => (
  <Tarjeta style={{ overflow: "hidden", ...style }}>
    <div
      style={{
        height: 54,
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "0 22px",
        borderBottom: "1px solid #eee",
        background: "#f7f6f4",
      }}
    >
      {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
        <div key={c} style={{ width: 16, height: 16, borderRadius: 8, background: c }} />
      ))}
      {titulo ? (
        <div style={{ marginLeft: 14, fontFamily: SANS, fontWeight: 600, fontSize: 24, color: "#555" }}>
          {titulo}
        </div>
      ) : null}
    </div>
    {children}
  </Tarjeta>
);

export const Cursor = ({
  x,
  y,
  escala = 1,
  opacity = 1,
}: {
  readonly x: number;
  readonly y: number;
  readonly escala?: number;
  readonly opacity?: number;
}) => (
  <svg
    width={52}
    height={62}
    viewBox="0 0 26 31"
    style={{
      position: "absolute",
      left: x,
      top: y,
      scale: String(escala),
      transformOrigin: "0 0",
      opacity,
      filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.3))",
      zIndex: 20,
    }}
  >
    <path d="M2 2 L2 25 L8 19.5 L12 28.5 L16 26.8 L12 18 L20 18 Z" fill="#111" stroke="#fff" strokeWidth={2} strokeLinejoin="round" />
  </svg>
);

// A6: sello de goma con textura gastada.
export const Sello = ({
  texto,
  en,
  x,
  y,
  rot = -8,
  tam = 96,
  color = C.rojo,
}: {
  readonly texto: string;
  readonly en: number;
  readonly x: number;
  readonly y: number;
  readonly rot?: number;
  readonly tam?: number;
  readonly color?: string;
}) => {
  const f = useCurrentFrame();
  if (f < en) return null;
  const t = f - en;
  const escala = interpolate(t, [0, 3], [1.9, 1], CL);
  const temblor = t >= 3 && t < 10 ? Math.sin(t * 2.6) * (10 - t) * 0.6 : 0;
  const ancho = texto.length * tam * 0.52 + tam * 0.9;
  const alto = tam * 1.45;
  return (
    <svg
      width={ancho}
      height={alto}
      style={{
        position: "absolute",
        left: x - ancho / 2,
        top: y - alto / 2,
        rotate: `${rot}deg`,
        scale: String(escala),
        translate: `${temblor}px ${temblor * 0.5}px`,
        opacity: interpolate(t, [0, 2], [0, 1], CL),
        filter: borroso(interpolate(t, [0, 3], [5, 0], CL)),
        zIndex: 15,
        mixBlendMode: "multiply",
      }}
    >
      <g>
        <rect x={7} y={7} width={ancho - 14} height={alto - 14} rx={14} fill={`${color}22`} stroke={color} strokeWidth={9} />
        <text
          x={ancho / 2}
          y={alto / 2 + tam * 0.36}
          textAnchor="middle"
          fontFamily={TITULO}
          fontSize={tam}
          fill={color}
        >
          {texto}
        </text>
        {new Array(Math.round(ancho / 6)).fill(0).map((_, i) => (
          <circle key={i} cx={azar(i + texto.length) * ancho} cy={azar(i * 7 + 3) * alto} r={1 + azar(i * 3 + 1) * 3.2} fill="#ece8e1" />
        ))}
      </g>
    </svg>
  );
};

// A7: post-it.
export const Nota = ({
  texto,
  en,
  x,
  y,
  rot = -5,
}: {
  readonly texto: string;
  readonly en: number;
  readonly x: number;
  readonly y: number;
  readonly rot?: number;
}) => {
  const f = useCurrentFrame();
  if (f < en - 1) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: 300,
        padding: "34px 22px 28px",
        background: `linear-gradient(170deg,#fbe35a,${C.postit})`,
        boxShadow: "0 18px 30px rgba(60,40,0,0.25)",
        rotate: `${rot + (1 - resorte(f, en)) * -12}deg`,
        fontFamily: TITULO,
        fontSize: 52,
        lineHeight: 1,
        textAlign: "center",
        color: C.tinta,
        zIndex: 14,
        ...pop(f, en),
      }}
    >
      <div style={{ width: 60, height: 40, margin: "0 auto 12px", borderRadius: 10, background: C.rojo, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 0, height: 0, borderLeft: "16px solid white", borderTop: "10px solid transparent", borderBottom: "10px solid transparent" }} />
      </div>
      {texto}
    </div>
  );
};

// Chip de anotación (abajo a la izquierda).
export const Chip = ({
  texto,
  sub,
  en,
  x = 64,
  y = 1300,
}: {
  readonly texto: string;
  readonly sub?: string;
  readonly en: number;
  readonly x?: number;
  readonly y?: number;
}) => {
  const f = useCurrentFrame();
  if (f < en - 1) return null;
  return (
    <Tarjeta style={{ left: x, top: y, padding: "20px 28px", borderRadius: 18, zIndex: 12, ...pop(f, en) }}>
      <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 32, color: C.tinta }}>{texto}</div>
      {sub ? (
        <div style={{ fontFamily: MONO, fontSize: 22, color: C.gris, marginTop: 6 }}>→ {sub}</div>
      ) : null}
    </Tarjeta>
  );
};

export const Check = ({
  en,
  tam = 44,
  style,
}: {
  readonly en: number;
  readonly tam?: number;
  readonly style?: CSSProperties;
}) => {
  const f = useCurrentFrame();
  const s = resorte(f, en, 260, 10);
  if (f < en) return null;
  return (
    <svg width={tam} height={tam} viewBox="0 0 44 44" style={{ scale: String(s), flexShrink: 0, ...style }}>
      <circle cx={22} cy={22} r={21} fill={C.rojo} />
      <path
        d="M12 22.5 L19 29.5 L32 15.5"
        fill="none"
        stroke="white"
        strokeWidth={5}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={32}
        strokeDashoffset={32 * (1 - tramo(f, en + 2, en + 8))}
      />
    </svg>
  );
};

// A13: confeti.
export const Confeti = ({ en }: { readonly en: number }) => {
  const f = useCurrentFrame();
  const t = f - en;
  if (t < 0 || t > 70) return null;
  const colores = [C.rojo, C.postit, C.azul, "#22c55e", "#a855f7", C.tinta];
  return (
    <AbsoluteFill style={{ zIndex: 30, pointerEvents: "none" }}>
      {new Array(70).fill(0).map((_, i) => {
        const x0 = 540 + (azar(i) - 0.5) * 300;
        const vx = (azar(i + 1) - 0.5) * 34;
        const vy = -18 - azar(i + 2) * 22;
        const x = x0 + vx * t;
        const y = 820 + vy * t + 0.9 * t * t;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: 14,
              height: 22,
              background: colores[i % colores.length],
              rotate: `${t * (8 + azar(i + 3) * 20)}deg`,
              opacity: interpolate(t, [50, 70], [1, 0], CL),
              borderRadius: 3,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

// Pulsación de clic (onda) en un punto.
export const Onda = ({ en, x, y }: { readonly en: number; readonly x: number; readonly y: number }) => {
  const f = useCurrentFrame();
  const t = f - en;
  if (t < 0 || t > 12) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: x - 30,
        top: y - 30,
        width: 60,
        height: 60,
        borderRadius: 30,
        border: `4px solid ${C.rojo}`,
        scale: String(0.4 + t / 10),
        opacity: 1 - t / 12,
        zIndex: 19,
      }}
    />
  );
};

export { clic };
