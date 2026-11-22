import {
  Easing,
  interpolate,
  random,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { AMARILLO, GROTESK, MONO, ROJO } from "./Escritorio";
import { Tarjeta } from "./Widgets";

const CLAMP = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const sacudida = (frame: number, en: number) => {
  const t = frame - en;
  if (t < 0 || t > 8) return "0px 0px";
  const k = 1 - t / 8;
  return `${(random(`sx${frame}`) - 0.5) * 24 * k}px ${(random(`sy${frame}`) - 0.5) * 24 * k}px`;
};

export const WidgetSaldo = ({ golpe }: { readonly golpe: number }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ translate: sacudida(frame, golpe) }}>
      <Tarjeta
        titulo="CUENTA · SALDO"
        extra={<span style={{ color: ROJO }}>● EN ROJO</span>}
      >
        <div
          style={{
            fontFamily: GROTESK,
            fontWeight: 700,
            fontSize: 112,
            color: ROJO,
            textShadow: "0 0 40px rgba(255,77,77,0.45)",
            scale: String(
              interpolate(
                frame,
                [golpe, golpe + 3, golpe + 10],
                [1, 1.15, 1],
                CLAMP,
              ),
            ),
          }}
        >
          $0,00
        </div>
        <div
          style={{
            fontFamily: MONO,
            fontSize: 18,
            color: "#777",
            marginTop: 10,
          }}
        >
          Últimos movimientos: —
        </div>
      </Tarjeta>
    </div>
  );
};

export const WidgetIdea = ({
  regla,
  nunca,
}: {
  readonly regla: number;
  readonly nunca: number;
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const luz = spring({ frame, fps, config: { damping: 10 } });
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 22,
        translate: sacudida(frame, nunca),
      }}
    >
      <div
        style={{
          width: 150,
          height: 150,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, #fffbe6 0%, #fde047 45%, #f59e0b 100%)",
          boxShadow: `0 0 ${110 * luz}px #fde047`,
          scale: String(luz),
        }}
      />
      <div
        style={{
          fontFamily: MONO,
          fontWeight: 700,
          fontSize: 22,
          letterSpacing: 4,
          color: AMARILLO,
          opacity: interpolate(frame, [regla, regla + 4], [0, 1], CLAMP),
        }}
      >
        REGLA #1
      </div>
      <div
        style={{
          fontFamily: GROTESK,
          fontWeight: 700,
          fontSize: 42,
          color: "#0a0a0a",
          backgroundColor: AMARILLO,
          padding: "10px 24px",
          borderRadius: 12,
          rotate: "-5deg",
          opacity: interpolate(frame, [nunca, nunca + 2], [0, 1], CLAMP),
          scale: String(
            interpolate(frame, [nunca, nunca + 6], [2, 1], {
              ...CLAMP,
              easing: Easing.out(Easing.cubic),
            }),
          ),
        }}
      >
        NUNCA RENDIRSE
      </div>
    </div>
  );
};

export const WidgetDias = ({ mil }: { readonly mil: number }) => {
  const frame = useCurrentFrame();
  const fin = mil + 12;
  const dia = Math.round(
    interpolate(frame, [4, fin], [1, 1000], {
      ...CLAMP,
      easing: Easing.in(Easing.quad),
    }),
  );
  return (
    <Tarjeta titulo="DÍAS TRABAJANDO" extra={<span>☾ 03:12</span>}>
      <div
        style={{
          fontFamily: GROTESK,
          fontWeight: 700,
          fontSize: 120,
          lineHeight: 1,
          color: dia === 1000 ? AMARILLO : "white",
          fontVariantNumeric: "tabular-nums",
          scale: String(
            interpolate(frame, [fin, fin + 3, fin + 10], [1, 1.12, 1], CLAMP),
          ),
        }}
      >
        {dia.toLocaleString("de-DE")}
      </div>
      <div
        style={{
          marginTop: 20,
          height: 10,
          borderRadius: 5,
          backgroundColor: "#26262b",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: 10,
            width: `${(dia / 1000) * 100}%`,
            backgroundColor: AMARILLO,
          }}
        />
      </div>
    </Tarjeta>
  );
};

export const WidgetFallos = ({
  inicios,
}: {
  readonly inicios: readonly number[];
}) => {
  const frame = useCurrentFrame();
  const objetivos = [1, 1, 10, 50];
  const i = inicios.reduce((acc, x, j) => (frame >= x ? j : acc), 0);
  const previo = i === 0 ? 0 : objetivos[i - 1];
  const n = Math.round(
    interpolate(
      frame,
      [inicios[i], inicios[i] + 12],
      [previo, objetivos[i]],
      CLAMP,
    ),
  );
  return (
    <div style={{ translate: sacudida(frame, inicios[i]) }}>
      <Tarjeta
        titulo="INTENTOS FALLIDOS"
        extra={<span style={{ color: ROJO }}>{n}</span>}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(10, 1fr)",
            gap: 6,
          }}
        >
          {new Array(50).fill(true).map((_, k) => (
            <div
              key={k}
              style={{
                height: 28,
                borderRadius: 5,
                fontFamily: GROTESK,
                fontWeight: 700,
                fontSize: 20,
                lineHeight: "28px",
                textAlign: "center",
                color: ROJO,
                backgroundColor: k < n ? "rgba(255,77,77,0.15)" : "#1a1a1d",
              }}
            >
              {k < n ? "✕" : ""}
            </div>
          ))}
        </div>
      </Tarjeta>
    </div>
  );
};

export const WidgetEscalones = () => {
  const frame = useCurrentFrame();
  return (
    <Tarjeta
      titulo="LO QUE APRENDIÓ"
      extra={<span style={{ color: AMARILLO }}>+1% / caída</span>}
    >
      <div
        style={{
          height: 230,
          display: "flex",
          alignItems: "flex-end",
          gap: 10,
        }}
      >
        {new Array(7).fill(true).map((_, i) => (
          <div
            key={i}
            style={{ flex: 1, position: "relative", height: 40 + i * 30 }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: "8px 8px 2px 2px",
                background: `linear-gradient(180deg, ${AMARILLO} 0%, #6b5a05 100%)`,
                transformOrigin: "bottom",
                scale: `1 ${interpolate(frame, [4 + i * 9, 12 + i * 9], [0, 1], { ...CLAMP, easing: Easing.out(Easing.cubic) })}`,
              }}
            />
          </div>
        ))}
      </div>
    </Tarjeta>
  );
};

export const WidgetCarga = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const p = Math.floor(
    interpolate(frame, [0, durationInFrames - 6], [0, 99], {
      ...CLAMP,
      easing: Easing.out(Easing.quad),
    }),
  );
  return (
    <Tarjeta
      titulo="CARGANDO…"
      extra={
        <span style={{ opacity: frame % 12 < 6 ? 1 : 0.3, color: AMARILLO }}>
          ●
        </span>
      }
    >
      <div
        style={{
          fontFamily: GROTESK,
          fontWeight: 700,
          fontSize: 110,
          color: "white",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {p}%
      </div>
      <div
        style={{
          marginTop: 12,
          height: 14,
          borderRadius: 7,
          backgroundColor: "#26262b",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: 14,
            width: `${p}%`,
            backgroundColor: AMARILLO,
            boxShadow: `0 0 20px ${AMARILLO}`,
          }}
        />
      </div>
    </Tarjeta>
  );
};

export const WidgetMillon = ({ hoy }: { readonly hoy: number }) => {
  const frame = useCurrentFrame();
  const dinero = Math.round(
    interpolate(frame, [2, hoy + 6], [0, 1000000], {
      ...CLAMP,
      easing: Easing.out(Easing.quad),
    }),
  );
  return (
    <div style={{ translate: sacudida(frame, 0) }}>
      <Tarjeta
        titulo="CUENTA · SALDO"
        extra={<span style={{ color: "#4ade80" }}>▲ +∞%</span>}
      >
        <div
          style={{
            fontFamily: GROTESK,
            fontWeight: 700,
            fontSize: 58,
            color: AMARILLO,
            fontVariantNumeric: "tabular-nums",
            textShadow: "0 0 40px rgba(255,225,26,0.5)",
          }}
        >
          ${dinero.toLocaleString("de-DE")}
        </div>
        <svg
          width={356}
          height={150}
          viewBox="0 0 356 150"
          style={{ marginTop: 10 }}
        >
          <path
            d="M 6 140 L 70 120 L 110 128 L 160 95 L 200 104 L 250 60 L 290 70 L 350 10"
            fill="none"
            stroke="#4ade80"
            strokeWidth={8}
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={interpolate(frame, [2, hoy + 6], [1, 0], CLAMP)}
          />
        </svg>
      </Tarjeta>
    </div>
  );
};

export const WidgetMensaje = ({
  tachar,
  check,
}: {
  readonly tachar: number;
  readonly check: number;
}) => {
  const frame = useCurrentFrame();
  const filas = [
    { t: "Tenerlo todo", en: tachar, ok: false },
    { t: "Empezar", en: check, ok: true },
  ];
  return (
    <Tarjeta titulo="LO QUE NECESITAS" extra={<span>1</span>}>
      {filas.map((f) => (
        <div
          key={f.t}
          style={{
            position: "relative",
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
              borderRadius: 10,
              border: `2px solid ${frame >= f.en ? (f.ok ? AMARILLO : ROJO) : "#555"}`,
              backgroundColor: frame >= f.en && f.ok ? AMARILLO : "transparent",
              color: f.ok ? "#0a0a0a" : ROJO,
              fontFamily: GROTESK,
              fontWeight: 700,
              fontSize: 26,
              textAlign: "center",
              lineHeight: "32px",
            }}
          >
            {frame >= f.en ? (f.ok ? "✓" : "✕") : ""}
          </div>
          <div
            style={{
              fontFamily: GROTESK,
              fontWeight: 700,
              fontSize: 40,
              color: frame >= f.en ? (f.ok ? AMARILLO : "#666") : "#ddd",
              textDecoration:
                frame >= f.en && !f.ok ? "line-through" : undefined,
              textDecorationColor: ROJO,
            }}
          >
            {f.t}
          </div>
        </div>
      ))}
    </Tarjeta>
  );
};
