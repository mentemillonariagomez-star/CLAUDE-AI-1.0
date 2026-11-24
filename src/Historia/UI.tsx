import {
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { ElementoUI, En } from "./tipos";

export const FUENTE = "Inter, Montserrat, system-ui, sans-serif";
const CLAMP = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const SOMBRA = "0 18px 40px rgba(10,5,30,0.45)";

export const useMomento = (frases: number[]) => (en: En) =>
  typeof en === "number" ? (frases[en] ?? 0) : (frases[en[0]] ?? 0) + en[1];

const usePop = (en: number) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - en, fps, config: { damping: 11, mass: 0.6 } });
};

const Pop = ({
  en,
  x,
  y,
  w,
  children,
  giro = 0,
}: {
  readonly en: number;
  readonly x: number;
  readonly y: number;
  readonly w?: number;
  readonly children: React.ReactNode;
  readonly giro?: number;
}) => {
  const frame = useCurrentFrame();
  const s = usePop(en);
  if (frame < en) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        scale: String(0.6 + 0.4 * s),
        opacity: Math.min(1, s * 2),
        rotate: `${giro + (1 - s) * -6}deg`,
        transformOrigin: "50% 50%",
      }}
    >
      {children}
    </div>
  );
};

const Tarjeta = ({
  children,
  style,
}: {
  readonly children: React.ReactNode;
  readonly style?: React.CSSProperties;
}) => (
  <div
    style={{
      backgroundColor: "white",
      borderRadius: 28,
      boxShadow: SOMBRA,
      border: "5px solid #1d1530",
      padding: "22px 26px",
      fontFamily: FUENTE,
      color: "#1d1530",
      ...style,
    }}
  >
    {children}
  </div>
);

const miles = (n: number) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

export const PiezaUI = ({
  e,
  frases,
}: {
  readonly e: ElementoUI;
  readonly frases: number[];
}) => {
  const frame = useCurrentFrame();
  const m = useMomento(frases);
  switch (e.tipo) {
    case "tel_vistas": {
      const en = m(e.en);
      const v = Math.round(
        interpolate(frame, [en + 4, en + 24], [0, e.vistas], CLAMP),
      );
      const c = e.comentario;
      return (
        <Pop en={en} x={e.x} y={e.y} w={e.w} giro={4}>
          <div
            style={{
              borderRadius: 48,
              backgroundColor: "#141622",
              border: "6px solid #1d1530",
              padding: 12,
              boxShadow: SOMBRA,
            }}
          >
            <div
              style={{
                borderRadius: 36,
                overflow: "hidden",
                backgroundColor: "#1f2440",
                fontFamily: FUENTE,
                color: "white",
              }}
            >
              <div
                style={{
                  height: 300,
                  background: "linear-gradient(160deg,#ff7a1a,#7a2fb8)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 110,
                }}
              >
                🎬
              </div>
              <div style={{ padding: "18px 22px 26px" }}>
                <div
                  style={{
                    fontWeight: 800,
                    fontSize: 30,
                    overflowWrap: "anywhere",
                  }}
                >
                  {e.titulo ?? "Mi último video"}
                </div>
                <div
                  style={{
                    fontWeight: 900,
                    fontSize: e.vistas >= 100000 ? 50 : 76,
                    color: "#ff5d5d",
                    lineHeight: 1.1,
                  }}
                >
                  👁 {miles(v)}
                </div>
                <div style={{ fontSize: 26, color: "#aab" }}>vistas</div>
              </div>
            </div>
          </div>
          {c && frame >= m(c.en) ? (
            <Pop en={m(c.en)} x={-330} y={560} w={420} giro={-4}>
              <Tarjeta style={{ padding: "16px 20px", fontSize: 30 }}>
                <b>{c.autor}</b>: {c.texto}
              </Tarjeta>
            </Pop>
          ) : null}
        </Pop>
      );
    }
    case "calendario": {
      const en = m(e.en);
      const tacha = e.tachar !== undefined && frame >= m(e.tachar) + 6;
      return (
        <div
          style={{
            position: "absolute",
            left: e.x,
            top: e.y,
            width: e.w,
            display: "flex",
            flexWrap: "wrap",
            gap: 18,
            justifyContent: "center",
          }}
        >
          {e.vistas.map((v, i) => {
            const s = rebote(frame, en + i * 3);
            return (
              <div
                key={i}
                style={{
                  width: 200,
                  height: 170,
                  borderRadius: 20,
                  border: "5px solid #1d1530",
                  backgroundColor: "white",
                  boxShadow: SOMBRA,
                  scale: String(s),
                  opacity: s,
                  overflow: "hidden",
                  position: "relative",
                  fontFamily: FUENTE,
                }}
              >
                <div
                  style={{
                    height: 100,
                    background: `linear-gradient(135deg, ${["#7a2fb8", "#2a6fdb", "#e0610a", "#1f8a78"][i % 4]}, #1d1530)`,
                  }}
                />
                <div
                  style={{
                    padding: "6px 12px",
                    fontWeight: 800,
                    fontSize: 30,
                    color: "#d23",
                  }}
                >
                  👁 {v}
                </div>
                {tacha ? (
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 120,
                      color: "#e33",
                      fontWeight: 900,
                      textShadow: "0 0 6px white",
                    }}
                  >
                    ✕
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      );
    }
    case "chat": {
      const en = m(e.en);
      const escrito =
        e.escribir === undefined
          ? e.pregunta.length
          : Math.floor(
              interpolate(
                frame,
                [m(e.escribir), m(e.escribir) + 34],
                [0, e.pregunta.length],
                CLAMP,
              ),
            );
      return (
        <Pop en={en} x={e.x} y={e.y} w={e.w}>
          <Tarjeta style={{ padding: 0, overflow: "hidden" }}>
            <div
              style={{
                backgroundColor: "#f1ecff",
                padding: "14px 24px",
                display: "flex",
                alignItems: "center",
                gap: 12,
                fontSize: 30,
                fontWeight: 800,
                borderBottom: "4px solid #1d1530",
              }}
            >
              <span style={{ fontSize: 34 }}>✨</span> Asistente de IA
            </div>
            <div
              style={{
                padding: 24,
                display: "flex",
                flexDirection: "column",
                gap: 16,
                minHeight: 120,
              }}
            >
              <div
                style={{
                  alignSelf: "flex-end",
                  backgroundColor: "#1d1530",
                  color: "white",
                  borderRadius: 22,
                  padding: "14px 22px",
                  fontSize: 34,
                  fontWeight: 700,
                  maxWidth: "85%",
                }}
              >
                {e.pregunta.slice(0, escrito) || " "}
                {escrito < e.pregunta.length && frame % 16 < 8 ? "|" : ""}
              </div>
              {e.respuestas.map((r) =>
                frame >= m(r.en) ? (
                  <div
                    key={r.texto}
                    style={{
                      alignSelf: "flex-start",
                      backgroundColor: "#ffe3d3",
                      border: "4px solid #1d1530",
                      borderRadius: 22,
                      padding: "12px 20px",
                      fontSize: 34,
                      fontWeight: 800,
                      scale: String(0.7 + 0.3 * rebote(frame, m(r.en))),
                    }}
                  >
                    {r.texto}
                  </div>
                ) : null,
              )}
            </div>
          </Tarjeta>
        </Pop>
      );
    }
    case "texto_grande": {
      const en = m(e.en);
      if (frame < en) return null;
      const t = frame - en;
      return (
        <div
          style={{
            position: "absolute",
            left: e.x,
            top: e.y,
            width: e.w,
            textAlign: "center",
            fontFamily: FUENTE,
            fontWeight: 900,
            fontSize: 96,
            color: e.color ?? "#ffd84a",
            WebkitTextStroke: "14px #1d1530",
            paintOrder: "stroke fill",
            rotate: "-4deg",
            scale: String(interpolate(t, [0, 4, 8], [2, 0.9, 1], CLAMP)),
            textShadow: "0 8px 0 #1d1530",
          }}
        >
          {e.texto}
        </div>
      );
    }
    case "tarjetas":
      return (
        <div
          style={{
            position: "absolute",
            left: e.x,
            top: e.y,
            width: e.w,
            display: "flex",
            flexDirection: "column",
            gap: 22,
          }}
        >
          {e.items.map((it, i) => (
            <div key={it.titulo} style={{ position: "relative", height: 150 }}>
              <Pop en={m(it.en)} x={0} y={0} w={e.w} giro={i % 2 ? 2 : -2}>
                <Tarjeta
                  style={{ display: "flex", alignItems: "center", gap: 20 }}
                >
                  <div style={{ fontSize: 70 }}>{it.emoji}</div>
                  <div>
                    <div style={{ fontSize: 42, fontWeight: 900 }}>
                      {it.titulo}
                    </div>
                    <div
                      style={{
                        fontSize: 30,
                        fontWeight: 700,
                        color: "#1f8a78",
                      }}
                    >
                      {it.sub}
                    </div>
                  </div>
                </Tarjeta>
              </Pop>
            </div>
          ))}
        </div>
      );
    case "reloj": {
      const en = m(e.en);
      const min = Math.round(
        interpolate(frame, [en, m(e.hasta_en)], [e.desde, e.hasta], {
          ...CLAMP,
          easing: Easing.in(Easing.quad),
        }),
      );
      return (
        <Pop en={en} x={e.x} y={e.y} w={e.w} giro={3}>
          <Tarjeta
            style={{
              textAlign: "center",
              backgroundColor: "#1d1530",
              color: "#ff6b6b",
            }}
          >
            <div style={{ fontSize: 30, color: "#bbb", fontWeight: 700 }}>
              ⏰ sin dormir
            </div>
            <div
              style={{
                fontSize: 96,
                fontWeight: 900,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {Math.floor(min / 60)}:{String(min % 60).padStart(2, "0")}
              <span style={{ fontSize: 40 }}> AM</span>
            </div>
          </Tarjeta>
        </Pop>
      );
    }
    case "subir": {
      const en = m(e.en);
      const p = interpolate(frame, [en + 14, en + 50], [0, 100], CLAMP);
      const apagado = frame >= m(e.apagar) + 8;
      return (
        <Pop en={en} x={e.x} y={e.y} w={e.w}>
          <Tarjeta>
            <div style={{ fontSize: 36, fontWeight: 900 }}>
              📤 Video nuevo · versión 2.0
            </div>
            <div
              style={{
                marginTop: 16,
                height: 34,
                borderRadius: 17,
                backgroundColor: "#eee",
                border: "4px solid #1d1530",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${p}%`,
                  height: "100%",
                  backgroundColor: "#ff7a1a",
                }}
              />
            </div>
            <div
              style={{
                marginTop: 14,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontSize: 30,
                fontWeight: 800,
              }}
            >
              <span>
                {p >= 100 ? "¡Publicado! ✅" : `Subiendo… ${Math.round(p)}%`}
              </span>
              <span
                style={{
                  backgroundColor: p >= 100 ? "#1f8a78" : "#ff2d55",
                  color: "white",
                  borderRadius: 16,
                  padding: "8px 22px",
                }}
              >
                Publicar
              </span>
            </div>
          </Tarjeta>
          {apagado ? (
            <Pop en={m(e.apagar) + 8} x={260} y={250} w={260}>
              <Tarjeta
                style={{
                  textAlign: "center",
                  backgroundColor: "#111",
                  color: "white",
                  fontSize: 34,
                  fontWeight: 900,
                }}
              >
                <div style={{ fontSize: 80 }}>📴</div>apagado
              </Tarjeta>
            </Pop>
          ) : null}
        </Pop>
      );
    }
    case "notis": {
      const en = m(e.en);
      const fin = m(e.fin);
      const n = Math.max(
        0,
        Math.floor(interpolate(frame, [en, fin], [0, 5], CLAMP)),
      );
      const cuenta = Math.round(
        interpolate(frame, [en, m(e.mil), fin], [0, 100, 1000], CLAMP),
      );
      const textos = [
        "❤️ le gustó tu video",
        "💬 comentó: ¡brutal!",
        "➕ empezó a seguirte",
        "🔁 compartió tu video",
        "❤️ le gustó tu video",
        "➕ empezó a seguirte",
        "💬 ¡parte 2 ya!",
      ];
      return (
        <div style={{ position: "absolute", left: e.x, top: e.y, width: e.w }}>
          <div
            style={{
              fontFamily: FUENTE,
              fontWeight: 900,
              fontSize: 44,
              color: "white",
              backgroundColor: "#ff2d55",
              border: "5px solid #1d1530",
              borderRadius: 40,
              padding: "6px 26px",
              display: "inline-block",
              boxShadow: SOMBRA,
              marginBottom: 14,
            }}
          >
            🔔 {miles(cuenta)}
            {cuenta >= 1000 ? "+" : ""}
          </div>
          {textos.slice(0, n).map((t, i) => (
            <div
              key={i}
              style={{
                marginBottom: 10,
                scale: String(
                  0.6 + 0.4 * rebote(frame, en + i * ((fin - en) / 5)),
                ),
              }}
            >
              <Tarjeta
                style={{
                  padding: "12px 18px",
                  fontSize: 28,
                  fontWeight: 700,
                  borderRadius: 20,
                }}
              >
                <b>@usuario{(i * 37) % 97}</b> {t}
              </Tarjeta>
            </div>
          ))}
        </div>
      );
    }
    case "llamada": {
      const en = m(e.en);
      const vib = frame < m(e.texto_en) ? Math.sin(frame * 2.2) * 6 : 0;
      return (
        <Pop en={en} x={e.x} y={e.y} w={e.w}>
          <div style={{ translate: `${vib}px 0px` }}>
            <Tarjeta
              style={{
                backgroundColor: "#1d1530",
                color: "white",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 90 }}>👩</div>
              <div style={{ fontSize: 44, fontWeight: 900 }}>{e.nombre}</div>
              <div style={{ fontSize: 28, color: "#aab" }}>
                {frame < m(e.texto_en)
                  ? "llamando…"
                  : "en llamada · 0:0" +
                    Math.min(9, Math.floor((frame - m(e.texto_en)) / 30))}
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: 40,
                  marginTop: 16,
                }}
              >
                <span
                  style={{
                    width: 70,
                    height: 70,
                    borderRadius: 35,
                    backgroundColor: "#ff3b30",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 34,
                  }}
                >
                  📞
                </span>
                <span
                  style={{
                    width: 70,
                    height: 70,
                    borderRadius: 35,
                    backgroundColor: "#34c759",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 34,
                  }}
                >
                  📞
                </span>
              </div>
            </Tarjeta>
          </div>
          {frame >= m(e.texto_en) ? (
            <Pop en={m(e.texto_en)} x={-560} y={60} w={520} giro={-3}>
              <Tarjeta style={{ fontSize: 34, fontWeight: 800 }}>
                {e.texto}
              </Tarjeta>
            </Pop>
          ) : null}
        </Pop>
      );
    }
    case "dm":
      return (
        <Pop en={m(e.en)} x={e.x} y={e.y} w={e.w}>
          <Tarjeta
            style={{ display: "flex", gap: 20, alignItems: "flex-start" }}
          >
            <div
              style={{
                width: 90,
                height: 90,
                borderRadius: 45,
                background: "linear-gradient(135deg,#ffd84a,#ff7a1a)",
                border: "5px solid #1d1530",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 46,
                flexShrink: 0,
              }}
            >
              💼
            </div>
            <div>
              <div style={{ fontSize: 34, fontWeight: 900 }}>
                {e.de} <span style={{ color: "#2a8cff" }}>✔</span>{" "}
                <span style={{ fontSize: 24, color: "#888", fontWeight: 600 }}>
                  · ahora
                </span>
              </div>
              <div style={{ fontSize: 40, fontWeight: 800, marginTop: 6 }}>
                {e.texto}
              </div>
            </div>
          </Tarjeta>
        </Pop>
      );
    case "cuenta": {
      const en = m(e.en);
      const v = Math.round(
        interpolate(frame, [en, m(e.hasta_en)], [e.desde, e.a], CLAMP),
      );
      const hh = Math.floor(v / 3600);
      const mm = Math.floor((v % 3600) / 60);
      const ss = v % 60;
      const urgente = e.desde <= 3 * 3600;
      return (
        <Pop en={en} x={e.x} y={e.y} w={e.w} giro={-3}>
          <Tarjeta
            style={{
              textAlign: "center",
              backgroundColor: urgente ? "#ff3b30" : "#1d1530",
              color: "white",
            }}
          >
            <div style={{ fontSize: 30, fontWeight: 800, opacity: 0.85 }}>
              {e.titulo ?? "⏳ entrega en"}
            </div>
            <div
              style={{
                fontSize: 88,
                fontWeight: 900,
                fontVariantNumeric: "tabular-nums",
                letterSpacing: 2,
              }}
            >
              {String(hh).padStart(2, "0")}:{String(mm).padStart(2, "0")}:
              {String(ss).padStart(2, "0")}
            </div>
          </Tarjeta>
        </Pop>
      );
    }
    case "exportar": {
      const en = m(e.en);
      const falla = m(e.falla);
      const p = interpolate(frame, [en + 4, falla], [62, 99], CLAMP);
      const roto = frame >= falla && !e.exito;
      const listo = frame >= falla && !!e.exito;
      const glitch = roto && frame - falla < 10 ? ((frame * 37) % 11) - 5 : 0;
      return (
        <Pop en={en} x={e.x} y={e.y} w={e.w}>
          <div style={{ translate: `${glitch * 3}px 0px` }}>
            <Tarjeta
              style={{
                backgroundColor: roto ? "#0b0b10" : "white",
                color: roto ? "#ff4d4d" : "#1d1530",
              }}
            >
              {listo ? (
                <div style={{ textAlign: "center", color: "#1f8a78" }}>
                  <div style={{ fontSize: 70 }}>✅</div>
                  <div style={{ fontSize: 40, fontWeight: 900 }}>
                    Exportado al 100%
                  </div>
                  <div style={{ fontSize: 26, color: "#888", marginTop: 6 }}>
                    video_marca_FINAL_v2.mp4 · 48 MB
                  </div>
                </div>
              ) : roto ? (
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 70 }}>⚠️</div>
                  <div style={{ fontSize: 38, fontWeight: 900 }}>
                    Error: proyecto no encontrado
                  </div>
                  <div style={{ fontSize: 26, color: "#999", marginTop: 6 }}>
                    video_marca_FINAL.mp4 · 0 KB
                  </div>
                </div>
              ) : (
                <>
                  <div style={{ fontSize: 36, fontWeight: 900 }}>
                    🎬 Exportando video_marca_FINAL…
                  </div>
                  <div
                    style={{
                      marginTop: 16,
                      height: 34,
                      borderRadius: 17,
                      backgroundColor: "#eee",
                      border: "4px solid #1d1530",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${p}%`,
                        height: "100%",
                        backgroundColor: "#1f8a78",
                      }}
                    />
                  </div>
                  <div style={{ marginTop: 10, fontSize: 30, fontWeight: 800 }}>
                    {Math.floor(p)}%
                  </div>
                </>
              )}
            </Tarjeta>
          </div>
        </Pop>
      );
    }
    case "burbuja":
      return (
        <Pop en={m(e.en)} x={e.x} y={e.y} w={e.w} giro={-2}>
          <Tarjeta
            style={{
              display: "flex",
              gap: 18,
              alignItems: "center",
              borderRadius: 36,
            }}
          >
            <div style={{ fontSize: 70, flexShrink: 0 }}>{e.emoji}</div>
            <div>
              <div style={{ fontSize: 28, fontWeight: 800, color: "#888" }}>
                {e.autor}
              </div>
              <div style={{ fontSize: 40, fontWeight: 900 }}>{e.texto}</div>
            </div>
          </Tarjeta>
        </Pop>
      );
    default:
      return null;
  }
};

// Resorte calculado sin hooks (para usar dentro de listas).
function rebote(frame: number, en: number) {
  const t = frame - en;
  if (t <= 0) return 0;
  return interpolate(t, [0, 5, 9], [0, 1.08, 1], {
    ...CLAMP,
    easing: Easing.out(Easing.quad),
  });
}
