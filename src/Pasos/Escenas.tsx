import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { ESCENAS } from "./datos";
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
  Titular,
  useEntrada,
} from "./estilo";

const Luna = () => (
  <>
    <div
      style={{
        position: "absolute",
        top: 120,
        right: 60,
        width: 60,
        height: 60,
        borderRadius: 30,
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
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 180,
        background: "linear-gradient(180deg, transparent, #05070f)",
      }}
    />
  </>
);

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

// 01 · Intro: teléfono con videos que nadie ve.
export const Intro = () => {
  const frame = useCurrentFrame();
  const f = ESCENAS.Intro.frases;
  const rojo = frame >= f[1] + 10;
  return (
    <AbsoluteFill>
      {[0, 1, 2].map((i) => (
        <Tarjeta
          key={i}
          en={f[0] + 6 + i * 6}
          giro={[-10, 8, -4][i]}
          style={{
            left: [70, 720, 90][i],
            top: [560, 600, 960][i],
            padding: 18,
            width: 240,
          }}
        >
          <div
            style={{
              height: 150,
              borderRadius: 18,
              background: "linear-gradient(135deg,#2a3a7a,#0e1430)",
            }}
          />
          <div style={txt(28, { marginTop: 12 })}>Video día {i + 1}</div>
          <div
            style={{
              fontFamily: MONO,
              fontSize: 24,
              color: rojo ? C.rojo : C.gris,
            }}
          >
            👁 0 vistas
          </div>
        </Tarjeta>
      ))}
      <Tarjeta
        en={f[0]}
        style={{
          left: 370,
          top: 520,
          backgroundColor: "transparent",
          boxShadow: "none",
        }}
      >
        <Telefono>
          <Luna />
          <div
            style={{
              position: "absolute",
              bottom: 40,
              left: 24,
              right: 24,
              ...txt(30, { color: "white" }),
            }}
          >
            Mi mejor video 🔥
            <div
              style={{
                fontFamily: MONO,
                fontWeight: 400,
                fontSize: 26,
                marginTop: 8,
                color: rojo ? "#ff6b55" : "#aab",
              }}
            >
              👁{" "}
              {rojo
                ? "0"
                : Math.round(
                    interpolate(frame, [f[0], f[1] + 10], [0, 3], CLAMP),
                  )}{" "}
              vistas
            </div>
          </div>
        </Telefono>
      </Tarjeta>
      {frame >= f[3] ? (
        <Sello en={f[3] + 14} texto="¿EL FORMATO?" x={220} y={1210} size={80} />
      ) : null}
      {frame >= f[2] ? (
        <Tarjeta
          en={f[2]}
          giro={5}
          style={{
            left: 720,
            top: 1000,
            padding: "16px 24px",
            backgroundColor: C.amarillo,
          }}
        >
          <div style={txt(34)}>no es tu culpa</div>
        </Tarjeta>
      ) : null}
    </AbsoluteFill>
  );
};

export const PASOS = [
  ["El gancho", "1 segundo"],
  ["Subtítulos", "grandes"],
  ["El ritmo", "corte cada 2s"],
  ["La barra", "de progreso"],
  ["El guardado", "pídelo"],
  ["El loop", "final = inicio"],
] as const;

export const MiniPaso = ({
  n,
  en,
  check,
}: {
  readonly n: number;
  readonly en: number;
  readonly check?: number;
}) => {
  const frame = useCurrentFrame();
  const s = useEntrada(en, 11);
  const [t, sub] = PASOS[n - 1];
  return (
    <div
      style={{
        width: 450,
        height: 120,
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
        }}
      >
        {n}
      </div>
      <div style={{ flex: 1 }}>
        <div style={txt(38, { fontWeight: 800, letterSpacing: -1 })}>{t}</div>
        <div style={{ fontFamily: MONO, fontSize: 24, color: C.gris }}>
          // {sub}
        </div>
      </div>
      {check !== undefined ? <Check on={frame >= check} size={46} /> : null}
    </div>
  );
};

// 02 · Hoja de ruta: 6 pasos.
export const Ruta = () => {
  const f = ESCENAS.Ruta.frases;
  return (
    <AbsoluteFill>
      <Titular texto="" rojo="6" en={f[0] + 4} size={150} />
      <div
        style={{
          position: "absolute",
          top: 330,
          left: 160,
          fontFamily: ANTON,
          fontSize: 150,
          lineHeight: 1,
          color: C.tinta,
          opacity: useEntrada(f[0] + 10),
        }}
      >
        PASOS
      </div>
      <div
        style={{
          position: "absolute",
          top: 560,
          left: 60,
          right: 60,
          display: "flex",
          flexWrap: "wrap",
          gap: 28,
        }}
      >
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <MiniPaso key={n} n={n} en={f[1] - 6 + n * 5} />
        ))}
      </div>
    </AbsoluteFill>
  );
};

// Paso 1 · el gancho: barra de 1 segundo y dos posibles inicios.
export const P1 = () => {
  const frame = useCurrentFrame();
  const f = ESCENAS.P1.frases;
  const barra = interpolate(frame, [f[2] + 5, f[2] + 50], [0, 1], {
    ...CLAMP,
    easing: Easing.inOut(Easing.quad),
  });
  return (
    <AbsoluteFill>
      <Titular
        etiqueta="lo primero que ven"
        texto="EL"
        rojo="GANCHO"
        n={1}
        en={f[1]}
      />
      {frame >= f[2] ? (
        <Tarjeta
          en={f[2]}
          style={{
            left: 60,
            top: 560,
            width: 960,
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
            <span>0:00</span>
            <span style={{ color: barra >= 1 ? C.rojo : C.gris }}>0:01</span>
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
                width: `${barra * 100}%`,
                height: "100%",
                backgroundColor: C.rojo,
                borderRadius: 15,
              }}
            />
          </div>
          <div
            style={txt(34, { marginTop: 16, fontWeight: 600, color: C.gris })}
          >
            tiempo para que <b style={{ color: C.tinta }}>no deslicen</b>
          </div>
        </Tarjeta>
      ) : null}
      {frame >= f[2] + 52 ? (
        <Sello
          en={f[2] + 52}
          texto="1 SEGUNDO"
          x={640}
          y={520}
          size={58}
          giro={6}
        />
      ) : null}
      {frame >= f[3] ? (
        <Tarjeta
          en={f[3]}
          style={{
            left: 60,
            top: 860,
            width: 820,
            padding: "26px 30px",
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
            gap: 22,
          }}
        >
          <Fila en={f[3]}>
            <Check on={frame >= f[3] + 18} />
            <div style={txt(38)}>“Tenía $0 en la cuenta”</div>
          </Fila>
          {frame >= f[4] ? (
            <Fila en={f[4]}>
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
                }}
              >
                ✕
              </div>
              <div
                style={{
                  position: "relative",
                  whiteSpace: "nowrap",
                  ...txt(38, { color: "#a39d94" }),
                }}
              >
                “Hola a todos, bienvenidos…”
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    top: "52%",
                    height: 6,
                    backgroundColor: C.rojo,
                    transformOrigin: "left",
                    scale: `${interpolate(frame, [f[4] + 10, f[4] + 16], [0, 1], CLAMP)} 1`,
                  }}
                />
              </div>
            </Fila>
          ) : null}
        </Tarjeta>
      ) : null}
      {frame >= f[4] + 20 ? (
        <Sello
          en={f[4] + 20}
          texto="ABURRIDO"
          x={560}
          y={1100}
          size={52}
          giro={-8}
        />
      ) : null}
    </AbsoluteFill>
  );
};

// Paso 2 · subtítulos: teléfono silenciado con subtítulos tipo karaoke.
export const P2 = () => {
  const frame = useCurrentFrame();
  const f = ESCENAS.P2.frases;
  const palabras = ["NADIE", "TE", "LO", "EXPLICA"];
  const activa = Math.floor((frame - f[2]) / 9) % palabras.length;
  const vuela = interpolate(frame, [f[4] + 4, f[4] + 16], [0, 1], {
    ...CLAMP,
    easing: Easing.in(Easing.cubic),
  });
  return (
    <AbsoluteFill>
      <Titular
        etiqueta="que se lean solos"
        texto="SUBTÍTULOS"
        rojo="GRANDES"
        n={2}
        en={f[1]}
        size={96}
      />
      {frame >= f[2] ? (
        <Tarjeta
          en={f[2]}
          style={{
            left: 80,
            top: 540,
            backgroundColor: "transparent",
            boxShadow: "none",
          }}
        >
          <div
            style={{
              translate: `0px ${-vuela * 900}px`,
              rotate: `${vuela * -12}deg`,
              opacity: 1 - vuela,
            }}
          >
            <Telefono w={330} h={600}>
              <Luna />
              <div
                style={{
                  position: "absolute",
                  top: 60,
                  right: 22,
                  fontSize: 40,
                }}
              >
                🔇
              </div>
              <div
                style={{
                  position: "absolute",
                  top: 300,
                  left: 10,
                  right: 10,
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: "center",
                  gap: "0 14px",
                }}
              >
                {palabras.map((p, i) => (
                  <span
                    key={p}
                    style={{
                      fontFamily: ANTON,
                      fontSize: 56,
                      color: i === activa ? C.amarillo : "white",
                      textShadow: "0 4px 10px rgba(0,0,0,0.6)",
                    }}
                  >
                    {p}
                  </span>
                ))}
              </div>
            </Telefono>
          </div>
        </Tarjeta>
      ) : null}
      {frame >= f[2] + 20 ? (
        <Tarjeta
          en={f[2] + 20}
          style={{
            left: 470,
            top: 600,
            width: 540,
            padding: 30,
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
          <div style={{ fontFamily: MONO, fontSize: 26, color: C.gris }}>
            CÓMO VEN TU VIDEO
          </div>
          <Fila en={f[2] + 26}>
            <Check on={frame >= f[2] + 40} />
            <div style={{ fontFamily: ANTON, fontSize: 52 }}>SIN SONIDO</div>
          </Fila>
          <Fila en={f[2] + 34}>
            <Check on={frame >= f[3] + 10} />
            <div style={{ fontFamily: ANTON, fontSize: 52 }}>LEYENDO</div>
          </Fila>
        </Tarjeta>
      ) : null}
      {frame >= f[4] + 8 ? (
        <Sello
          en={f[4] + 8}
          texto="SE VAN ↑"
          x={540}
          y={960}
          size={78}
          giro={-6}
          relleno
        />
      ) : null}
    </AbsoluteFill>
  );
};

// Paso 3 · el ritmo: línea de tiempo cortada cada 2 s y tres efectos.
export const P3 = () => {
  const frame = useCurrentFrame();
  const f = ESCENAS.P3.frases;
  const cortes = Math.floor(
    interpolate(frame, [f[1] + 10, f[1] + 55], [0, 6], CLAMP),
  );
  const colores = [
    "#2a3a7a",
    "#e2462c",
    "#1f8a78",
    "#ff7a1a",
    "#6d4bd1",
    "#2a3a7a",
  ];
  const efecto = frame >= f[4] ? 2 : frame >= f[3] ? 1 : frame >= f[2] ? 0 : -1;
  const ultimo = [f[2], f[3], f[4]][efecto] ?? 0;
  const t = frame - ultimo;
  const zoom = efecto === 0 ? interpolate(t, [0, 8], [1.25, 1], CLAMP) : 1;
  const golpe = efecto === 2 && t < 10 ? Math.sin(t * 2.5) * (10 - t) * 2 : 0;
  return (
    <AbsoluteFill>
      <Titular
        etiqueta="el ritmo"
        texto="CORTA CADA"
        rojo="2 SEG"
        n={3}
        en={f[1]}
        size={118}
      />
      {frame >= f[1] ? (
        <Tarjeta
          en={f[1] + 4}
          style={{
            left: 60,
            top: 560,
            width: 960,
            padding: 30,
            boxSizing: "border-box",
          }}
        >
          <div style={{ display: "flex", gap: 8, height: 100 }}>
            {colores.map((c, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  borderRadius: 12,
                  backgroundColor: c,
                  opacity: i < cortes ? 1 : 0.15,
                  scale: i < cortes ? "1" : "0.9",
                }}
              />
            ))}
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 12,
              fontFamily: MONO,
              fontSize: 24,
              color: C.gris,
            }}
          >
            {[0, 2, 4, 6, 8, 10, 12].map((s) => (
              <span key={s}>{s}s</span>
            ))}
          </div>
        </Tarjeta>
      ) : null}
      {frame >= f[2] ? (
        <Tarjeta
          en={f[2]}
          style={{
            left: 80,
            top: 840,
            backgroundColor: "transparent",
            boxShadow: "none",
          }}
        >
          <div style={{ scale: String(zoom), translate: `${golpe}px 0px` }}>
            <Telefono
              w={260}
              h={440}
              fondo={
                efecto === 1
                  ? "linear-gradient(180deg,#e2462c,#7a1a0c)"
                  : undefined
              }
            >
              {efecto !== 1 ? <Luna /> : null}
            </Telefono>
          </div>
        </Tarjeta>
      ) : null}
      <div
        style={{
          position: "absolute",
          left: 400,
          top: 860,
          display: "flex",
          flexDirection: "column",
          gap: 22,
        }}
      >
        {["ZOOM", "CAMBIO", "GOLPE"].map((e, i) =>
          frame >= [f[2], f[3], f[4]][i] ? (
            <Fila key={e} en={[f[2], f[3], f[4]][i]}>
              <div
                style={{
                  fontFamily: ANTON,
                  fontSize: 70,
                  color: efecto === i ? C.rojo : C.tinta,
                  backgroundColor: "white",
                  padding: "4px 26px",
                  borderRadius: 18,
                  boxShadow: "0 12px 24px rgba(60,40,20,0.12)",
                }}
              >
                {e}
              </div>
            </Fila>
          ) : null,
        )}
      </div>
      {frame >= f[5] + 20 ? (
        <Sello
          en={f[5] + 20}
          texto="SIN DESCANSO"
          x={480}
          y={1225}
          size={62}
          giro={-5}
        />
      ) : null}
    </AbsoluteFill>
  );
};

// Paso 4 · la barra de progreso.
export const P4 = () => {
  const frame = useCurrentFrame();
  const f = ESCENAS.P4.frases;
  const p = interpolate(
    frame,
    [f[1], f[2] + 20, f[3] + 30],
    [0.1, 0.85, 1],
    CLAMP,
  );
  return (
    <AbsoluteFill>
      <Titular
        etiqueta="arriba del video"
        texto="BARRA DE"
        rojo="PROGRESO"
        n={4}
        en={f[1]}
        size={100}
      />
      {frame >= f[1] ? (
        <Tarjeta
          en={f[1] + 4}
          style={{
            left: 90,
            top: 560,
            backgroundColor: "transparent",
            boxShadow: "none",
          }}
        >
          <Telefono w={330} h={620}>
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                height: 12,
                width: `${p * 100}%`,
                backgroundColor: C.amarillo,
              }}
            />
            <Luna />
            <div
              style={{
                position: "absolute",
                top: 260,
                left: 0,
                right: 0,
                textAlign: "center",
                fontFamily: ANTON,
                fontSize: 60,
                color: "white",
              }}
            >
              {Math.round(p * 100)}%
            </div>
          </Telefono>
        </Tarjeta>
      ) : null}
      {frame >= f[2] ? (
        <Tarjeta
          en={f[2]}
          giro={4}
          style={{
            left: 520,
            top: 640,
            padding: "22px 30px",
            backgroundColor: C.amarillo,
          }}
        >
          <div style={txt(44, { fontWeight: 800 })}>“ya falta poco…”</div>
        </Tarjeta>
      ) : null}
      {frame >= f[3] ? (
        <Tarjeta
          en={f[3]}
          style={{
            left: 500,
            top: 820,
            width: 500,
            padding: 30,
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
            gap: 18,
          }}
        >
          <div style={{ fontFamily: MONO, fontSize: 26, color: C.gris }}>
            EL QUE MIRA
          </div>
          {["empieza", "sigue", "termina"].map((x, i) => (
            <Fila key={x} en={f[3] + i * 6}>
              <Check on={frame >= f[3] + 8 + i * 10} size={46} />
              <div
                style={{
                  fontFamily: ANTON,
                  fontSize: 48,
                  textTransform: "uppercase",
                }}
              >
                {x}
              </div>
            </Fila>
          ))}
        </Tarjeta>
      ) : null}
      {frame >= f[3] + 42 ? (
        <Sello
          en={f[3] + 42}
          texto="HASTA EL FINAL"
          x={430}
          y={1235}
          size={58}
          giro={-6}
          relleno
        />
      ) : null}
    </AbsoluteFill>
  );
};

// Paso 5 · el guardado pesa más que un like.
export const P5 = () => {
  const frame = useCurrentFrame();
  const f = ESCENAS.P5.frases;
  const n = Math.round(
    interpolate(frame, [f[1] + 10, f[2] + 20], [0, 1284], {
      ...CLAMP,
      easing: Easing.out(Easing.cubic),
    }),
  );
  const inclina = interpolate(frame, [f[3] + 20, f[3] + 35], [0, -12], {
    ...CLAMP,
    easing: Easing.out(Easing.back(2)),
  });
  return (
    <AbsoluteFill>
      <Titular
        etiqueta="al final del video"
        texto="PIDE EL"
        rojo="GUARDADO"
        n={5}
        en={f[1]}
        size={118}
      />
      {frame >= f[1] ? (
        <Tarjeta
          en={f[1] + 4}
          style={{
            left: 60,
            top: 560,
            width: 960,
            padding: 30,
            boxSizing: "border-box",
            display: "flex",
            alignItems: "center",
            gap: 30,
          }}
        >
          <div style={{ fontSize: 110 }}>🔖</div>
          <div>
            <div
              style={{
                fontFamily: ANTON,
                fontSize: 96,
                lineHeight: 1,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
            </div>
            <div style={{ fontFamily: MONO, fontSize: 28, color: C.gris }}>
              guardados
            </div>
          </div>
        </Tarjeta>
      ) : null}
      {frame >= f[3] ? (
        <Tarjeta
          en={f[3]}
          style={{
            left: 60,
            top: 840,
            width: 600,
            height: 330,
            padding: 30,
            boxSizing: "border-box",
          }}
        >
          <div style={{ fontFamily: MONO, fontSize: 26, color: C.gris }}>
            PARA EL ALGORITMO
          </div>
          <div
            style={{
              position: "absolute",
              left: 60,
              right: 60,
              top: 190,
              rotate: `${inclina}deg`,
              transformOrigin: "50% 50%",
            }}
          >
            <div
              style={{ height: 10, backgroundColor: C.tinta, borderRadius: 5 }}
            />
            <div
              style={{ position: "absolute", left: 0, top: -90, ...txt(60) }}
            >
              ❤️
            </div>
            <div
              style={{
                position: "absolute",
                right: 0,
                top: -110,
                fontSize: 90,
              }}
            >
              🔖
            </div>
          </div>
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: 200,
              marginLeft: -30,
              width: 0,
              height: 0,
              borderLeft: "30px solid transparent",
              borderRight: "30px solid transparent",
              borderBottom: `70px solid ${C.tinta}`,
            }}
          />
        </Tarjeta>
      ) : null}
      {frame >= f[3] + 38 ? (
        <Sello
          en={f[3] + 38}
          texto="PESA MÁS"
          x={380}
          y={1090}
          size={70}
          giro={-7}
        />
      ) : null}
    </AbsoluteFill>
  );
};

// Paso 6 · el loop: el final conecta con el inicio.
export const P6 = () => {
  const frame = useCurrentFrame();
  const f = ESCENAS.P6.frases;
  const giro = interpolate(frame, [f[1], f[2] + 60], [0, 720], {
    ...CLAMP,
    easing: Easing.inOut(Easing.quad),
  });
  const vueltas = Math.min(2, Math.floor(giro / 360) + (frame >= f[2] ? 1 : 0));
  return (
    <AbsoluteFill>
      <Titular
        etiqueta="final = inicio"
        texto="EL"
        rojo="LOOP"
        n={6}
        en={f[1] - 8}
      />
      {frame >= f[1] ? (
        <Tarjeta
          en={f[1]}
          style={{
            left: 60,
            top: 560,
            width: 620,
            height: 620,
            padding: 30,
            boxSizing: "border-box",
          }}
        >
          <svg
            viewBox="0 0 400 400"
            style={{
              position: "absolute",
              left: 60,
              top: 60,
              width: 500,
              height: 500,
              rotate: `${giro}deg`,
            }}
          >
            <circle
              cx={200}
              cy={200}
              r={150}
              fill="none"
              stroke="#eee7dd"
              strokeWidth={34}
            />
            <path
              d="M200 50 A150 150 0 1 1 64 136"
              fill="none"
              stroke={C.rojo}
              strokeWidth={34}
              strokeLinecap="round"
            />
            <path d="M40 120 L64 170 L105 128 Z" fill={C.rojo} />
          </svg>
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 255,
              textAlign: "center",
              fontFamily: ANTON,
              fontSize: 62,
              lineHeight: 1.1,
            }}
          >
            FINAL
            <div style={{ fontSize: 40, color: C.gris }}>↓</div>
            INICIO
          </div>
        </Tarjeta>
      ) : null}
      {frame >= f[2] ? (
        <Tarjeta
          en={f[2]}
          giro={6}
          style={{
            left: 700,
            top: 640,
            padding: "20px 30px",
            textAlign: "center",
          }}
        >
          <div style={{ fontFamily: MONO, fontSize: 26, color: C.gris }}>
            VISTAS
          </div>
          <div
            style={{
              fontFamily: ANTON,
              fontSize: 130,
              lineHeight: 1,
              color: C.rojo,
            }}
          >
            x{vueltas}
          </div>
        </Tarjeta>
      ) : null}
      {frame >= f[2] + 40 ? (
        <Sello
          en={f[2] + 40}
          texto="NI SE DAN CUENTA"
          x={180}
          y={1140}
          size={56}
          giro={-5}
        />
      ) : null}
    </AbsoluteFill>
  );
};

// Resumen y llamado a la acción.
export const Resumen = () => {
  const frame = useCurrentFrame();
  const f = ESCENAS.Resumen.frases;
  return (
    <AbsoluteFill>
      <Titular texto="6 PASOS," rojo="1 VIDEO" en={f[0]} size={128} top={420} />
      <div
        style={{
          position: "absolute",
          top: 580,
          left: 60,
          right: 60,
          display: "flex",
          flexWrap: "wrap",
          gap: 24,
        }}
      >
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <MiniPaso key={n} n={n} en={f[0] + n * 3} check={f[1] + n * 4} />
        ))}
      </div>
      {frame >= f[2] ? (
        <Tarjeta
          en={f[2]}
          style={{
            left: 60,
            top: 980,
            padding: "26px 34px",
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          <div style={txt(46, { fontWeight: 800 })}>🔖 Guárdalo</div>
          <div style={txt(46, { fontWeight: 800 })}>➕ Sígueme</div>
        </Tarjeta>
      ) : null}
      {frame >= f[2] + 30 ? (
        <Sello
          en={f[2] + 30}
          texto="PARTE 2 →"
          x={420}
          y={1030}
          size={74}
          giro={-6}
          relleno
        />
      ) : null}
    </AbsoluteFill>
  );
};
