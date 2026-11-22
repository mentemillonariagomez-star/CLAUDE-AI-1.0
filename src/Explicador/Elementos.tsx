import { Easing, interpolate, useCurrentFrame } from "remotion";
import {
  ANTON,
  C,
  Check,
  CLAMP,
  MONO,
  SANS,
  Sello,
  Tarjeta,
  Telefono,
  useEntrada,
} from "../Pasos/estilo";
import type { Elemento, En, Lado } from "./tipos";

// Convierte un momento (frase o [frase, extra]) a fotograma relativo a la escena.
export const useMomento = (frases: number[]) => (en: En) =>
  typeof en === "number" ? (frases[en] ?? 0) : (frases[en[0]] ?? 0) + en[1];

const txt = (
  size: number,
  extra?: React.CSSProperties,
): React.CSSProperties => ({
  fontFamily: SANS,
  fontWeight: 700,
  fontSize: size,
  color: C.tinta,
  ...extra,
});

const Fila = ({
  children,
  en,
}: {
  readonly children: React.ReactNode;
  readonly en: number;
}) => {
  const s = useEntrada(en);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 20,
        opacity: s,
        translate: `${(1 - s) * -40}px 0px`,
      }}
    >
      {children}
    </div>
  );
};

const Marca = ({
  tipo,
  on,
}: {
  readonly tipo: "check" | "x" | "nada";
  readonly on: boolean;
}) => {
  if (tipo === "nada") return null;
  if (tipo === "check") return <Check on={on} />;
  return (
    <div
      style={{
        width: 52,
        height: 52,
        borderRadius: 26,
        border: `5px solid ${C.rojo}`,
        color: C.rojo,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: SANS,
        fontWeight: 800,
        fontSize: 30,
        boxSizing: "border-box",
        flexShrink: 0,
        opacity: on ? 1 : 0.25,
      }}
    >
      ✕
    </div>
  );
};

const Luna = () => (
  <>
    <div
      style={{
        position: "absolute",
        top: 110,
        right: 50,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: "#f5e9c8",
        boxShadow: "0 0 40px #f5e9c8",
      }}
    />
    {[
      [40, 90],
      [200, 60],
      [120, 200],
      [250, 240],
      [60, 300],
    ].map(([x, y]) => (
      <div
        key={`${x}-${y}`}
        style={{
          position: "absolute",
          left: x,
          top: y,
          width: 4,
          height: 4,
          borderRadius: 2,
          backgroundColor: "white",
          opacity: 0.7,
        }}
      />
    ))}
  </>
);

export const MiniPaso = ({
  n,
  t,
  sub,
  en,
  check,
}: {
  readonly n: number;
  readonly t: string;
  readonly sub: string;
  readonly en: number;
  readonly check?: number;
}) => {
  const frame = useCurrentFrame();
  const s = useEntrada(en, 11);
  return (
    <div
      style={{
        width: 466,
        height: 118,
        backgroundColor: "white",
        borderRadius: 24,
        boxShadow: "0 16px 30px rgba(60,40,20,0.14)",
        display: "flex",
        alignItems: "center",
        gap: 18,
        padding: "0 20px",
        boxSizing: "border-box",
        scale: String(s),
        opacity: s,
        rotate: `${(1 - s) * (n % 2 ? -12 : 12)}deg`,
      }}
    >
      <div
        style={{
          width: 74,
          height: 74,
          borderRadius: 18,
          backgroundColor: C.tinta,
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: ANTON,
          fontSize: 48,
          fontStyle: "italic",
          flexShrink: 0,
        }}
      >
        {n}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={txt(36, {
            fontWeight: 800,
            letterSpacing: -1,
            whiteSpace: "nowrap",
          })}
        >
          {t}
        </div>
        <div
          style={{
            fontFamily: MONO,
            fontSize: 23,
            color: C.gris,
            whiteSpace: "nowrap",
          }}
        >
          // {sub}
        </div>
      </div>
      {check !== undefined ? <Check on={frame >= check} size={46} /> : null}
    </div>
  );
};

const LadoCaja = ({
  lado,
  gana,
  marcado,
}: {
  readonly lado: Lado;
  readonly gana: boolean;
  readonly marcado: boolean;
}) => (
  <div
    style={{
      flex: 1,
      borderRadius: 22,
      padding: 24,
      backgroundColor: marcado ? (gana ? "#fff4ef" : "#f1ede7") : "#f7f3ee",
      border: `5px solid ${marcado && gana ? C.rojo : "transparent"}`,
      opacity: marcado && !gana ? 0.55 : 1,
      display: "flex",
      flexDirection: "column",
      gap: 8,
      alignItems: "flex-start",
    }}
  >
    <div style={{ fontFamily: MONO, fontSize: 24, color: C.gris }}>
      {lado.titulo}
    </div>
    {lado.emoji ? (
      <div style={{ fontSize: 80, lineHeight: 1 }}>{lado.emoji}</div>
    ) : null}
    <div
      style={{
        fontFamily: ANTON,
        fontSize: 54,
        lineHeight: 1.05,
        textTransform: "uppercase",
      }}
    >
      {lado.texto}
    </div>
    {marcado ? <Marca tipo={gana ? "check" : "x"} on /> : null}
  </div>
);

export const Pieza = ({
  e,
  frases,
  pasos,
}: {
  readonly e: Elemento;
  readonly frases: number[];
  readonly pasos: [string, string][];
}) => {
  const frame = useCurrentFrame();
  const m = useMomento(frases);
  const w = e.w;
  switch (e.tipo) {
    case "telefono": {
      const en = m(e.en);
      const p = interpolate(frame, [en, en + 90], [0.1, 0.95], CLAMP);
      return (
        <Tarjeta
          en={en}
          giro={e.giro ?? 0}
          style={{
            left: e.x,
            top: e.y,
            backgroundColor: "transparent",
            boxShadow: "none",
          }}
        >
          <Telefono w={w ?? 320} h={e.h ?? 600}>
            {e.barra ? (
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  height: 12,
                  width: `${p * 100}%`,
                  backgroundColor: C.amarillo,
                  zIndex: 6,
                }}
              />
            ) : null}
            <Luna />
            {e.emoji ? (
              <div
                style={{
                  position: "absolute",
                  top: 210,
                  left: 0,
                  right: 0,
                  textAlign: "center",
                  fontSize: 110,
                }}
              >
                {e.emoji}
              </div>
            ) : null}
            {e.texto ? (
              <div
                style={{
                  position: "absolute",
                  top: 330,
                  left: 16,
                  right: 16,
                  textAlign: "center",
                  fontFamily: ANTON,
                  fontSize: 50,
                  lineHeight: 1.1,
                  color: "white",
                  textShadow: "0 4px 10px rgba(0,0,0,0.6)",
                }}
              >
                {e.texto}
              </div>
            ) : null}
            {e.vistas !== undefined ? (
              <div
                style={{
                  position: "absolute",
                  bottom: 34,
                  left: 24,
                  fontFamily: MONO,
                  fontSize: 28,
                  color: "#ff8a75",
                }}
              >
                👁{" "}
                {Math.round(
                  interpolate(frame, [en, en + 40], [0, e.vistas], CLAMP),
                )}{" "}
                vistas
              </div>
            ) : null}
          </Telefono>
        </Tarjeta>
      );
    }
    case "nota":
      return frame < m(e.en) ? null : (
        <Tarjeta
          en={m(e.en)}
          giro={e.giro ?? 5}
          style={{
            left: e.x,
            top: e.y,
            padding: "18px 28px",
            backgroundColor: C.amarillo,
            maxWidth: w,
          }}
        >
          <div style={txt(40, { fontWeight: 800 })}>{e.texto}</div>
        </Tarjeta>
      );
    case "sello":
      return frame < m(e.en) ? null : (
        <Sello
          en={m(e.en)}
          texto={e.texto}
          x={e.x}
          y={e.y}
          giro={e.giro ?? -6}
          size={e.size ?? 62}
          relleno={e.relleno}
        />
      );
    case "pasos": {
      const en = m(e.en);
      const ck = e.check !== undefined ? m(e.check) : undefined;
      return (
        <div
          style={{
            position: "absolute",
            left: e.x,
            top: e.y,
            width: w ?? 960,
            display: "flex",
            flexWrap: "wrap",
            gap: 24,
          }}
        >
          {pasos.map(([t, sub], i) => (
            <MiniPaso
              key={t}
              n={i + 1}
              t={t}
              sub={sub}
              en={en + i * (e.ritmo ?? 5)}
              check={ck !== undefined ? ck + i * 5 : undefined}
            />
          ))}
        </div>
      );
    }
    case "contador": {
      const en = m(e.en);
      const v = Math.round(
        interpolate(frame, [en + 6, m(e.hasta)], [e.desde, e.a], {
          ...CLAMP,
          easing: Easing.out(Easing.cubic),
        }),
      );
      return (
        <Tarjeta
          en={en}
          giro={e.giro ?? 0}
          style={{
            left: e.x,
            top: e.y,
            width: w ?? 960,
            padding: 30,
            boxSizing: "border-box",
            display: "flex",
            alignItems: "center",
            gap: 30,
          }}
        >
          <div style={{ fontSize: 100, lineHeight: 1 }}>{e.emoji}</div>
          <div>
            <div
              style={{
                fontFamily: ANTON,
                fontSize: 100,
                lineHeight: 1,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {v.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
            </div>
            <div style={{ fontFamily: MONO, fontSize: 28, color: C.gris }}>
              {e.etiqueta}
            </div>
          </div>
        </Tarjeta>
      );
    }
    case "lista": {
      const en = m(e.en);
      return frame < en ? null : (
        <Tarjeta
          en={en}
          giro={e.giro ?? 0}
          style={{
            left: e.x,
            top: e.y,
            width: w ?? 760,
            padding: "26px 30px",
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
          {e.titulo ? (
            <div style={{ fontFamily: MONO, fontSize: 26, color: C.gris }}>
              {e.titulo}
            </div>
          ) : null}
          {e.items.map((it) => {
            const t0 = m(it.en);
            if (frame < t0) return null;
            const marca = it.marca ?? "check";
            return (
              <Fila key={it.texto} en={t0}>
                <Marca tipo={marca} on={frame >= t0 + 12} />
                <div
                  style={{
                    position: "relative",
                    whiteSpace: "nowrap",
                    ...txt(40, {
                      color:
                        it.tachar && frame >= t0 + 12 ? "#a39d94" : C.tinta,
                    }),
                  }}
                >
                  {it.texto}
                  {it.tachar ? (
                    <div
                      style={{
                        position: "absolute",
                        left: 0,
                        right: 0,
                        top: "52%",
                        height: 6,
                        backgroundColor: C.rojo,
                        transformOrigin: "left",
                        scale: `${interpolate(frame, [t0 + 12, t0 + 18], [0, 1], CLAMP)} 1`,
                      }}
                    />
                  ) : null}
                </div>
              </Fila>
            );
          })}
        </Tarjeta>
      );
    }
    case "chips":
      return (
        <div
          style={{
            position: "absolute",
            left: e.x,
            top: e.y,
            width: w ?? 960,
            display: "flex",
            flexDirection: e.fila ? "row" : "column",
            flexWrap: "wrap",
            gap: 22,
            alignItems: "flex-start",
          }}
        >
          {e.items.map((it, i) =>
            frame < m(it.en) ? null : (
              <Fila key={it.texto} en={m(it.en)}>
                <div
                  style={{
                    fontFamily: ANTON,
                    fontSize: 66,
                    color: it.rojo ? C.rojo : C.tinta,
                    backgroundColor: "white",
                    padding: "4px 26px",
                    borderRadius: 18,
                    boxShadow: "0 12px 24px rgba(60,40,20,0.12)",
                    rotate: `${[-2, 2, -1, 1.5][i % 4]}deg`,
                  }}
                >
                  {it.texto}
                </div>
              </Fila>
            ),
          )}
        </div>
      );
    case "barra": {
      const en = m(e.en);
      const p = interpolate(frame, [en + 5, m(e.hasta)], [0, 1], {
        ...CLAMP,
        easing: Easing.inOut(Easing.quad),
      });
      return (
        <Tarjeta
          en={en}
          giro={e.giro ?? 0}
          style={{
            left: e.x,
            top: e.y,
            width: w ?? 960,
            padding: 34,
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontFamily: MONO,
              fontSize: 28,
              color: C.gris,
            }}
          >
            <span>{e.izquierda}</span>
            <span style={{ color: p >= 1 ? C.rojo : C.gris }}>{e.derecha}</span>
          </div>
          <div
            style={{
              marginTop: 14,
              height: 30,
              borderRadius: 15,
              backgroundColor: "#eee7dd",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${p * 100}%`,
                height: "100%",
                backgroundColor: C.rojo,
                borderRadius: 15,
              }}
            />
          </div>
          {e.pie ? (
            <div
              style={txt(34, { marginTop: 16, fontWeight: 600, color: C.gris })}
            >
              {e.pie}
            </div>
          ) : null}
        </Tarjeta>
      );
    }
    case "comparacion": {
      const en = m(e.en);
      const marcado = e.marcar !== undefined && frame >= m(e.marcar);
      return frame < en ? null : (
        <Tarjeta
          en={en}
          giro={e.giro ?? 0}
          style={{
            left: e.x,
            top: e.y,
            width: w ?? 960,
            padding: 26,
            boxSizing: "border-box",
            display: "flex",
            gap: 22,
          }}
        >
          <LadoCaja
            lado={e.izquierda}
            gana={e.ganador === "izquierda"}
            marcado={marcado}
          />
          <LadoCaja
            lado={e.derecha}
            gana={e.ganador === "derecha"}
            marcado={marcado}
          />
        </Tarjeta>
      );
    }
    case "calendario": {
      const en = m(e.en);
      const poco = m(e.poco);
      const todo = e.todo !== undefined ? m(e.todo) : Infinity;
      return (
        <Tarjeta
          en={en}
          giro={e.giro ?? 0}
          style={{
            left: e.x,
            top: e.y,
            width: w ?? 620,
            padding: 30,
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              fontFamily: MONO,
              fontSize: 26,
              color: C.gris,
              marginBottom: 16,
            }}
          >
            {e.titulo ?? "PUBLICACIONES · 4 SEMANAS"}
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              gap: 12,
            }}
          >
            {Array.from({ length: 28 }).map((_, i) => {
              const raro = i === 3 || i === 24;
              const on = frame >= todo + i * 1.2 || (raro && frame >= poco);
              return (
                <div
                  key={i}
                  style={{
                    aspectRatio: "1",
                    borderRadius: 12,
                    backgroundColor: on
                      ? frame >= todo
                        ? C.rojo
                        : C.tinta
                      : "#eee7dd",
                    scale: on ? "1" : "0.9",
                  }}
                />
              );
            })}
          </div>
        </Tarjeta>
      );
    }
    case "grafica": {
      const en = m(e.en);
      const max = Math.max(...e.items.map((x) => x.valor));
      const marcado = e.marcar !== undefined && frame >= m(e.marcar);
      return (
        <Tarjeta
          en={en}
          giro={e.giro ?? 0}
          style={{
            left: e.x,
            top: e.y,
            width: w ?? 960,
            height: 470,
            padding: 30,
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ fontFamily: MONO, fontSize: 26, color: C.gris }}>
            {e.titulo ?? "RETENCIÓN POR VIDEO"}
          </div>
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "flex-end",
              gap: 24,
              marginTop: 20,
            }}
          >
            {e.items.map((it, i) => {
              const h = interpolate(
                frame,
                [en + 4 + i * 4, en + 20 + i * 4],
                [0, it.valor / max],
                { ...CLAMP, easing: Easing.out(Easing.cubic) },
              );
              const top = marcado && i === e.destacar;
              return (
                <div
                  key={it.etiqueta}
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 10,
                    height: "100%",
                    justifyContent: "flex-end",
                  }}
                >
                  <div
                    style={{
                      fontFamily: ANTON,
                      fontSize: 40,
                      color: top ? C.rojo : C.gris,
                      opacity: h > 0.05 ? 1 : 0,
                    }}
                  >
                    {it.valor}%
                  </div>
                  <div
                    style={{
                      width: "100%",
                      height: `${h * 70}%`,
                      borderRadius: 14,
                      backgroundColor: top
                        ? C.rojo
                        : marcado
                          ? C.tenue
                          : C.tinta,
                    }}
                  />
                  <div
                    style={{ fontFamily: MONO, fontSize: 24, color: C.gris }}
                  >
                    {it.etiqueta}
                  </div>
                </div>
              );
            })}
          </div>
        </Tarjeta>
      );
    }
    case "grande":
      return frame < m(e.en) ? null : (
        <Tarjeta
          en={m(e.en)}
          giro={e.giro ?? 0}
          style={{
            left: e.x,
            top: e.y,
            width: w,
            padding: "28px 36px",
            boxSizing: "border-box",
          }}
        >
          <div
            style={txt(e.size ?? 60, {
              fontWeight: 800,
              letterSpacing: -1,
              lineHeight: 1.15,
            })}
          >
            {e.texto}
          </div>
          {e.pie ? (
            <div
              style={{
                fontFamily: MONO,
                fontSize: 26,
                color: C.gris,
                marginTop: 10,
              }}
            >
              {e.pie}
            </div>
          ) : null}
        </Tarjeta>
      );
    default:
      return null;
  }
};
