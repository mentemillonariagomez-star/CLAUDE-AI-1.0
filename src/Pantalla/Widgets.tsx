import {
  interpolate,
  random,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { AMARILLO, GROTESK, MONO, ROJO } from "./Escritorio";

const CLAMP = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const Tarjeta = ({
  children,
  titulo,
  extra,
}: {
  readonly children: React.ReactNode;
  readonly titulo: string;
  readonly extra?: React.ReactNode;
}) => (
  <div
    style={{
      width: 400,
      borderRadius: 18,
      backgroundColor: "#111113",
      border: "1.5px solid #26262b",
      padding: 22,
      boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
    }}
  >
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        fontFamily: MONO,
        fontSize: 15,
        letterSpacing: 2,
        color: "#8a8a8a",
        marginBottom: 16,
      }}
    >
      <span>{titulo}</span>
      {extra}
    </div>
    {children}
  </div>
);

const Cruz = ({
  en,
  size = 220,
}: {
  readonly en: number;
  readonly size?: number;
}) => {
  const frame = useCurrentFrame();
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      style={{
        position: "absolute",
        opacity: interpolate(frame, [en, en + 2], [0, 1], CLAMP),
        scale: String(interpolate(frame, [en, en + 6], [1.8, 1], CLAMP)),
      }}
    >
      <path
        d="M 18 18 L 82 82 M 82 18 L 18 82"
        stroke={ROJO}
        strokeWidth={12}
        strokeLinecap="round"
      />
    </svg>
  );
};

export const WidgetRec = ({ tachar }: { readonly tachar: number }) => {
  const frame = useCurrentFrame();
  const seg = Math.floor(frame / 30);
  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Tarjeta
        titulo="CÁMARA"
        extra={<span style={{ color: ROJO }}>● REC</span>}
      >
        <div
          style={{
            height: 200,
            borderRadius: 12,
            background: "linear-gradient(135deg, #1b1b1f, #0d0d0f)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <svg width={110} height={80} viewBox="0 0 110 80">
            <rect
              x={4}
              y={14}
              width={70}
              height={56}
              rx={10}
              fill="none"
              stroke="#666"
              strokeWidth={6}
            />
            <path
              d="M 78 32 L 104 18 L 104 66 L 78 52 Z"
              fill="none"
              stroke="#666"
              strokeWidth={6}
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div
          style={{
            marginTop: 14,
            fontFamily: MONO,
            fontSize: 20,
            color: frame >= tachar ? ROJO : "#bbb",
          }}
        >
          {frame >= tachar ? "SIN GRABAR" : `00:00:0${Math.min(seg, 9)}`}
        </div>
      </Tarjeta>
      <Cruz en={tachar} />
    </div>
  );
};

export const WidgetTareas = ({
  marcas,
}: {
  readonly marcas: readonly number[];
}) => {
  const frame = useCurrentFrame();
  const filas = [
    { t: "Editar el video", en: marcas[0] },
    { t: "Hablar a cámara", en: marcas[1] },
    { t: "Grabarme", en: marcas[2] },
  ];
  return (
    <Tarjeta titulo="LO QUE NO QUIERO HACER" extra={<span>3</span>}>
      {filas.map((f) => (
        <div
          key={f.t}
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            gap: 14,
            padding: "14px 4px",
            borderTop: "1px solid #222",
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              border: `2px solid ${frame >= f.en ? ROJO : "#555"}`,
              color: ROJO,
              fontFamily: GROTESK,
              fontWeight: 700,
              fontSize: 22,
              textAlign: "center",
              lineHeight: "24px",
            }}
          >
            {frame >= f.en ? "✕" : ""}
          </div>
          <div
            style={{
              fontFamily: GROTESK,
              fontSize: 28,
              color: frame >= f.en ? "#777" : "#ddd",
            }}
          >
            {f.t}
          </div>
          <div
            style={{
              position: "absolute",
              left: 50,
              right: 10,
              top: "50%",
              height: 4,
              backgroundColor: ROJO,
              transformOrigin: "left",
              scale: `${interpolate(frame, [f.en, f.en + 6], [0, 1], CLAMP)} 1`,
            }}
          />
        </div>
      ))}
    </Tarjeta>
  );
};

export const WidgetChat = () => {
  const frame = useCurrentFrame();
  const msg = "Hazme un video viral para TikTok";
  const n = Math.floor(interpolate(frame, [6, 34], [0, msg.length], CLAMP));
  return (
    <Tarjeta
      titulo="CHAT · CLAUDE"
      extra={<span style={{ color: AMARILLO }}>● en línea</span>}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 14,
          minHeight: 230,
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
            fontSize: 26,
            padding: "14px 18px",
            borderRadius: "18px 18px 4px 18px",
          }}
        >
          {msg.slice(0, n)}
          <span style={{ opacity: n < msg.length && frame % 10 < 5 ? 1 : 0 }}>
            |
          </span>
        </div>
        {frame > 40 ? (
          <div
            style={{
              alignSelf: "flex-start",
              backgroundColor: "#222226",
              padding: "16px 20px",
              borderRadius: "18px 18px 18px 4px",
              display: "flex",
              gap: 8,
            }}
          >
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 6,
                  backgroundColor: "#bbb",
                  translate: `0px ${Math.sin((frame - i * 4) / 3) * 5}px`,
                }}
              />
            ))}
          </div>
        ) : null}
      </div>
    </Tarjeta>
  );
};

export const WidgetGuion = () => {
  const frame = useCurrentFrame();
  const lineas = [
    "Tenía cero pesos…",
    "Sin dinero. Sin contactos.",
    "Pero tenía una idea.",
    "Hasta que un día…",
    "Todo cambió.",
  ];
  return (
    <Tarjeta titulo="guion.json" extra={<span>44 s</span>}>
      {lineas.map((l, i) => (
        <div
          key={l}
          style={{
            display: "flex",
            gap: 14,
            fontFamily: MONO,
            fontSize: 21,
            padding: "7px 0",
            color:
              i === Math.min(4, Math.floor(frame / 9)) ? AMARILLO : "#bdbdbd",
            opacity: interpolate(frame, [4 + i * 8, 8 + i * 8], [0, 1], CLAMP),
          }}
        >
          <span style={{ color: "#555" }}>
            {String(i + 1).padStart(2, "0")}
          </span>
          {l}
        </div>
      ))}
    </Tarjeta>
  );
};

export const WidgetVoz = () => {
  const frame = useCurrentFrame();
  const barras = 26;
  const cabezal = interpolate(frame, [0, 70], [0, 1], CLAMP);
  return (
    <Tarjeta
      titulo="narracion.wav"
      extra={<span style={{ color: AMARILLO }}>VOZ 6</span>}
    >
      <div
        style={{
          position: "relative",
          height: 190,
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        {new Array(barras).fill(true).map((_, i) => {
          const h =
            20 +
            140 * Math.abs(Math.sin(frame / 3 + i * 0.9) * random(`w${i}`));
          return (
            <div
              key={i}
              style={{
                flex: 1,
                height: h,
                borderRadius: 4,
                backgroundColor: i / barras < cabezal ? AMARILLO : "#3a3a3f",
              }}
            />
          );
        })}
        <div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: `${cabezal * 100}%`,
            width: 3,
            backgroundColor: "white",
          }}
        />
      </div>
    </Tarjeta>
  );
};

export const WidgetCodigo = () => {
  const frame = useCurrentFrame();
  const lineas: [string, string][] = [
    ["#c084fc", "<Escena"],
    ["#93c5fd", '  titulo="Lo tenía todo"'],
    ["#93c5fd", "  animacion={zoom}"],
    ["#c084fc", "/>"],
  ];
  const listos = Math.floor(interpolate(frame, [20, 66], [0, 6], CLAMP));
  return (
    <Tarjeta titulo="Escenas.tsx" extra={<span>REMOTION</span>}>
      {lineas.map(([c, t], i) => (
        <div
          key={i}
          style={{
            fontFamily: MONO,
            fontSize: 22,
            color: c,
            padding: "4px 0",
            opacity: interpolate(frame, [3 + i * 5, 6 + i * 5], [0, 1], CLAMP),
          }}
        >
          {t}
        </div>
      ))}
      <div style={{ display: "flex", gap: 8, marginTop: 18 }}>
        {new Array(6).fill(true).map((_, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: 70,
              borderRadius: 6,
              backgroundColor: i < listos ? AMARILLO : "#222",
              border: "1px solid #333",
            }}
          />
        ))}
      </div>
    </Tarjeta>
  );
};

export const WidgetCeros = ({
  inicios,
}: {
  readonly inicios: readonly number[];
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const items = ["CÁMARAS", "MICRÓFONOS", "HORAS EDITANDO"];
  return (
    <div
      style={{ display: "flex", flexDirection: "column", gap: 18, width: 400 }}
    >
      {items.map((t, i) => (
        <div
          key={t}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 22,
            padding: "10px 20px",
            borderRadius: 16,
            backgroundColor: "#111113",
            border: "1.5px solid #26262b",
            opacity: interpolate(
              frame,
              [inicios[i], inicios[i] + 3],
              [0, 1],
              CLAMP,
            ),
          }}
        >
          <div
            style={{
              fontFamily: GROTESK,
              fontWeight: 700,
              fontSize: 92,
              lineHeight: 1,
              color: AMARILLO,
              scale: String(
                spring({
                  frame: frame - inicios[i],
                  fps,
                  config: { damping: 9 },
                }),
              ),
            }}
          >
            0
          </div>
          <div
            style={{
              fontFamily: MONO,
              fontSize: 20,
              letterSpacing: 2,
              color: "#cfcfcf",
            }}
          >
            {t}
          </div>
        </div>
      ))}
    </div>
  );
};

export const WidgetGiro = ({ badge }: { readonly badge: number }) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        gap: 20,
      }}
    >
      <div
        style={{
          width: 210,
          height: 380,
          borderRadius: 34,
          border: "6px solid #2b2b30",
          backgroundColor: "#060608",
          overflow: "hidden",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            height: 5,
            width: `${interpolate(frame, [0, 90], [55, 85], CLAMP)}%`,
            backgroundColor: AMARILLO,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 40,
            left: 14,
            right: 14,
            fontFamily: GROTESK,
            fontSize: 14,
            color: "white",
            textAlign: "center",
          }}
        >
          Claude me hizo un canal de TikTok
        </div>
        <div
          style={{
            position: "absolute",
            top: 120,
            left: 18,
            right: 18,
            height: 110,
            borderRadius: 8,
            border: "2px solid #333",
            backgroundColor: "#0d0d0d",
          }}
        >
          <div
            style={{
              margin: 10,
              height: 8,
              width: 60,
              backgroundColor: "#666",
              borderRadius: 4,
            }}
          />
          <div
            style={{
              marginLeft: 10,
              height: 12,
              width: 90,
              backgroundColor: "white",
              borderRadius: 4,
            }}
          />
        </div>
        <div
          style={{
            position: "absolute",
            top: 236,
            left: 8,
            right: 8,
            height: 50,
            backgroundColor: "#141416",
          }}
        />
      </div>
      <div
        style={{
          fontFamily: GROTESK,
          fontWeight: 700,
          fontSize: 30,
          color: "#111",
          backgroundColor: AMARILLO,
          padding: "10px 16px",
          borderRadius: 12,
          rotate: "-6deg",
          opacity: interpolate(frame, [badge, badge + 3], [0, 1], CLAMP),
          scale: String(
            interpolate(frame, [badge, badge + 6], [1.8, 1], CLAMP),
          ),
        }}
      >
        100% hecho
        <br />
        con Claude
      </div>
    </div>
  );
};
