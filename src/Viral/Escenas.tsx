import {
  AbsoluteFill,
  Easing,
  interpolate,
  random,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { ESCENAS } from "./datos";
import { CLAMP, MONTSERRAT, temblor } from "./util";

// Zoom de entrada en cada corte (el "punch-in" típico de TikTok).
const Camara = ({
  children,
  sacudidas = [],
  fondo,
}: {
  readonly children: React.ReactNode;
  readonly sacudidas?: readonly number[];
  readonly fondo: string;
}) => {
  const frame = useCurrentFrame();
  const desplazamiento =
    sacudidas.map((s) => temblor(frame, s)).find((t) => t !== "0px 0px") ??
    "0px 0px";
  return (
    <AbsoluteFill style={{ background: fondo, overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          scale: String(
            interpolate(frame, [0, 8], [1.18, 1], {
              ...CLAMP,
              easing: Easing.out(Easing.cubic),
            }),
          ),
          translate: desplazamiento,
        }}
      >
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Destello = ({
  en,
  color = "white",
  dur = 8,
}: {
  readonly en: number;
  readonly color?: string;
  readonly dur?: number;
}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        backgroundColor: color,
        opacity: interpolate(
          frame,
          [en, en + 1, en + dur],
          [0, 0.85, 0],
          CLAMP,
        ),
      }}
    />
  );
};

const Zona = ({
  children,
  gap = 40,
}: {
  readonly children: React.ReactNode;
  readonly gap?: number;
}) => (
  <div
    style={{
      position: "absolute",
      top: 220,
      left: 0,
      right: 0,
      height: 900,
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      gap,
    }}
  >
    {children}
  </div>
);

// Tarjeta del banco con saldo $0,00 (se reutiliza en el gancho y en el loop final).
const TarjetaSaldo = ({ golpe }: { readonly golpe: number }) => {
  const frame = useCurrentFrame();
  const glitch = frame - golpe >= 0 && frame - golpe < 8;
  const dx = glitch ? (random(`g${frame}`) - 0.5) * 30 : 0;
  return (
    <div
      style={{
        width: 900,
        padding: "60px 50px",
        borderRadius: 48,
        backgroundColor: "#141414",
        border: "3px solid #2a2a2a",
        boxShadow: "0 30px 80px rgba(220,38,38,0.25)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 10,
      }}
    >
      <div
        style={{
          fontFamily: MONTSERRAT,
          fontWeight: 500,
          fontSize: 44,
          color: "#8a8a8a",
        }}
      >
        Saldo disponible
      </div>
      <div
        style={{
          fontFamily: MONTSERRAT,
          fontWeight: 900,
          fontSize: 230,
          color: "#ef4444",
          fontVariantNumeric: "tabular-nums",
          textShadow: glitch
            ? `${dx}px 0 #22d3ee, ${-dx}px 0 #f0f`
            : "0 0 60px rgba(239,68,68,0.45)",
          scale: String(
            interpolate(
              frame,
              [golpe, golpe + 3, golpe + 10],
              [1, 1.2, 1],
              CLAMP,
            ),
          ),
        }}
      >
        $0,00
      </div>
    </div>
  );
};

export const Gancho = () => {
  const [, cero] = ESCENAS.Gancho.frases;
  return (
    <Camara
      fondo="radial-gradient(circle at 50% 40%, #2a0707 0%, #050505 70%)"
      sacudidas={[0, cero]}
    >
      <Zona>
        <TarjetaSaldo golpe={cero} />
      </Zona>
      <Destello en={cero} color="#dc2626" />
    </Camara>
  );
};

export const SinNada = () => {
  const frame = useCurrentFrame();
  const f = ESCENAS.SinNada.frases;
  const items = ["DINERO", "CONTACTOS", "APOYO"];
  return (
    <Camara fondo="#0b0b0b" sacudidas={f.map((x) => x + 8)}>
      <Zona gap={50}>
        {items.map((t, i) => (
          <div
            key={t}
            style={{
              position: "relative",
              fontFamily: MONTSERRAT,
              fontWeight: 900,
              fontSize: 130,
              color: "#d4d4d4",
              opacity: interpolate(frame, [f[i], f[i] + 3], [0, 1], CLAMP),
              translate: `${interpolate(frame, [f[i], f[i] + 6], [-120, 0], { ...CLAMP, easing: Easing.out(Easing.cubic) })}px 0px`,
            }}
          >
            {t}
            <div
              style={{
                position: "absolute",
                left: -20,
                right: -20,
                top: "50%",
                height: 18,
                borderRadius: 9,
                backgroundColor: "#ef4444",
                rotate: "-4deg",
                transformOrigin: "left center",
                scale: `${interpolate(frame, [f[i] + 8, f[i] + 14], [0, 1], CLAMP)} 1`,
              }}
            />
          </div>
        ))}
      </Zona>
    </Camara>
  );
};

export const Idea = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const [, regla, nunca] = ESCENAS.Idea.frases;
  const enciende = spring({ frame, fps, config: { damping: 10 } });
  return (
    <Camara
      fondo="radial-gradient(circle at 50% 38%, #2b2205 0%, #070707 65%)"
      sacudidas={[nunca]}
    >
      <Zona gap={60}>
        <div style={{ position: "relative", width: 420, height: 420 }}>
          {new Array(12).fill(true).map((_, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                left: 205,
                top: 0,
                width: 10,
                height: 70,
                borderRadius: 5,
                backgroundColor: "#fde047",
                transformOrigin: "5px 210px",
                rotate: `${i * 30 + frame * 0.6}deg`,
                opacity: enciende,
              }}
            />
          ))}
          <div
            style={{
              position: "absolute",
              left: 110,
              top: 110,
              width: 200,
              height: 200,
              borderRadius: "50%",
              background:
                "radial-gradient(circle, #fffbe6 0%, #fde047 45%, #f59e0b 100%)",
              boxShadow: `0 0 ${120 * enciende}px #fde047`,
              scale: String(enciende),
            }}
          />
        </div>
        <div
          style={{
            fontFamily: MONTSERRAT,
            fontWeight: 900,
            fontSize: 60,
            letterSpacing: 6,
            color: "#fde047",
            opacity: interpolate(frame, [regla, regla + 5], [0, 1], CLAMP),
          }}
        >
          REGLA #1
        </div>
        <div
          style={{
            fontFamily: MONTSERRAT,
            fontWeight: 900,
            fontSize: 100,
            color: "#0a0a0a",
            backgroundColor: "#fde047",
            padding: "18px 40px",
            borderRadius: 20,
            rotate: "-5deg",
            opacity: interpolate(frame, [nunca, nunca + 2], [0, 1], CLAMP),
            scale: String(
              interpolate(frame, [nunca, nunca + 6], [2.2, 1], {
                ...CLAMP,
                easing: Easing.out(Easing.cubic),
              }),
            ),
          }}
        >
          NUNCA RENDIRSE
        </div>
      </Zona>
    </Camara>
  );
};

export const Noches = () => {
  const frame = useCurrentFrame();
  const { width } = useVideoConfig();
  const [, , mil] = ESCENAS.Noches.frases;
  const dia = Math.round(
    interpolate(frame, [4, mil + 10], [1, 1000], {
      ...CLAMP,
      easing: Easing.in(Easing.quad),
    }),
  );
  return (
    <Camara
      fondo="linear-gradient(180deg, #020617 0%, #0f172a 100%)"
      sacudidas={[mil + 10]}
    >
      {new Array(70).fill(true).map((_, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: random(`sx${i}`) * width,
            top: random(`sy${i}`) * 1100,
            width: 4 + random(`ss${i}`) * 4,
            height: 4 + random(`ss${i}`) * 4,
            borderRadius: "50%",
            backgroundColor: "white",
            opacity: 0.3 + 0.5 * Math.abs(Math.sin(frame / 12 + i)),
          }}
        />
      ))}
      <Zona gap={30}>
        <div
          style={{
            width: 220,
            height: 220,
            borderRadius: "50%",
            boxShadow: "-40px 20px 0 0 #e2e8f0",
            translate: "40px 0px",
            marginBottom: 40,
          }}
        />
        <div
          style={{
            fontFamily: MONTSERRAT,
            fontWeight: 800,
            fontSize: 70,
            color: "#94a3b8",
            letterSpacing: 8,
          }}
        >
          DÍA
        </div>
        <div
          style={{
            fontFamily: MONTSERRAT,
            fontWeight: 900,
            fontSize: 260,
            lineHeight: 1,
            color: dia === 1000 ? "#FFE11A" : "white",
            fontVariantNumeric: "tabular-nums",
            scale: String(
              interpolate(
                frame,
                [mil + 10, mil + 14, mil + 22],
                [1, 1.2, 1],
                CLAMP,
              ),
            ),
          }}
        >
          {dia.toLocaleString("de-DE")}
        </div>
      </Zona>
    </Camara>
  );
};

export const Fracasos = () => {
  const frame = useCurrentFrame();
  const f = ESCENAS.Fracasos.frases;
  const conteos = [1, 1, 10, 50];
  const actual = f.reduce((acc, x, i) => (frame >= x ? i : acc), 0);
  const posiciones = [
    [0, 0, -8],
    [-200, -230, 12],
    [210, -180, -15],
    [-150, 230, 20],
  ];
  return (
    <Camara
      fondo="radial-gradient(circle at 50% 45%, #3b0707 0%, #0a0202 70%)"
      sacudidas={f.map((x) => x)}
    >
      <Zona>
        <div
          style={{
            fontFamily: MONTSERRAT,
            fontWeight: 800,
            fontSize: 64,
            letterSpacing: 6,
            color: "#fca5a5",
          }}
        >
          INTENTOS FALLIDOS
        </div>
        <div
          style={{
            fontFamily: MONTSERRAT,
            fontWeight: 900,
            fontSize: 220,
            lineHeight: 1,
            color: "white",
            scale: String(
              interpolate(
                frame,
                [f[actual], f[actual] + 3, f[actual] + 9],
                [1, 1.25, 1],
                CLAMP,
              ),
            ),
          }}
        >
          {conteos[actual]}
        </div>
        <div style={{ position: "relative", width: 700, height: 520 }}>
          {f.map((x, i) => (
            <svg
              key={i}
              width={300}
              height={300}
              viewBox="0 0 100 100"
              style={{
                position: "absolute",
                left: 200 + posiciones[i][0],
                top: 110 + posiciones[i][1] * 0.6,
                rotate: `${posiciones[i][2]}deg`,
                opacity: interpolate(frame, [x, x + 1], [0, 0.95], CLAMP),
                scale: String(
                  interpolate(frame, [x, x + 5], [2.5, 1], {
                    ...CLAMP,
                    easing: Easing.out(Easing.cubic),
                  }),
                ),
              }}
            >
              <path
                d="M 15 15 L 85 85 M 85 15 L 15 85"
                stroke="#ef4444"
                strokeWidth={16}
                strokeLinecap="round"
              />
            </svg>
          ))}
        </div>
      </Zona>
      {f.map((x) => (
        <Destello key={x} en={x} color="#ef4444" dur={6} />
      ))}
    </Camara>
  );
};

export const Levantarse = () => {
  const frame = useCurrentFrame();
  const escalones = 6;
  const paso = 18;
  const subidos = Math.min(
    escalones - 1,
    Math.floor(Math.max(0, frame - 8) / paso),
  );
  const saltoT = (Math.max(0, frame - 8) % paso) / paso;
  return (
    <Camara fondo="linear-gradient(180deg, #0a0a0a 0%, #1c1404 100%)">
      <Zona>
        <div style={{ position: "relative", width: 900, height: 760 }}>
          {new Array(escalones).fill(true).map((_, i) => (
            <div key={i}>
              <div
                style={{
                  position: "absolute",
                  left: i * 150,
                  bottom: 0,
                  width: 140,
                  height: 110 + i * 110,
                  borderRadius: "16px 16px 0 0",
                  background: `linear-gradient(180deg, hsl(${40 + i * 3}, 90%, ${30 + i * 7}%) 0%, #1c1404 100%)`,
                  scale: `1 ${interpolate(frame, [i * paso, i * paso + 8], [0, 1], { ...CLAMP, easing: Easing.out(Easing.cubic) })}`,
                  transformOrigin: "bottom",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  left: i * 150 + 20,
                  bottom: 130 + i * 110,
                  fontFamily: MONTSERRAT,
                  fontWeight: 900,
                  fontSize: 44,
                  color: "#fde047",
                  opacity: interpolate(
                    frame,
                    [i * paso + 10, i * paso + 14, i * paso + 40],
                    [0, 1, 0],
                    CLAMP,
                  ),
                  translate: `0px ${interpolate(frame, [i * paso + 10, i * paso + 40], [0, -60], CLAMP)}px`,
                }}
              >
                +1%
              </div>
            </div>
          ))}
          <div
            style={{
              position: "absolute",
              left:
                subidos * 150 +
                40 +
                saltoT * (subidos < escalones - 1 ? 150 : 0),
              bottom:
                110 +
                subidos * 110 +
                Math.sin(saltoT * Math.PI) * 90 +
                saltoT * (subidos < escalones - 1 ? 110 : 0),
              width: 60,
              height: 60,
              borderRadius: "50%",
              backgroundColor: "white",
              boxShadow: "0 0 30px rgba(255,255,255,0.7)",
            }}
          />
        </div>
      </Zona>
    </Camara>
  );
};

export const HastaQue = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return (
    <Camara fondo="#000">
      <Zona>
        <div
          style={{
            width: 240,
            height: 240,
            borderRadius: "50%",
            border: "10px solid white",
            opacity: 0.3 + 0.7 * Math.abs(Math.sin(frame / 4)),
            scale: String(
              interpolate(frame, [0, durationInFrames], [0.4, 2.2], {
                ...CLAMP,
                easing: Easing.in(Easing.cubic),
              }),
            ),
          }}
        />
      </Zona>
      <AbsoluteFill
        style={{
          backgroundColor: "white",
          opacity: interpolate(
            frame,
            [durationInFrames - 10, durationInFrames],
            [0, 1],
            CLAMP,
          ),
        }}
      />
    </Camara>
  );
};

export const TodoCambio = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const [, hoy] = ESCENAS.TodoCambio.frases;
  const dinero = Math.round(
    interpolate(frame, [6, hoy + 6], [0, 1000000], {
      ...CLAMP,
      easing: Easing.out(Easing.quad),
    }),
  );
  return (
    <Camara
      fondo="radial-gradient(circle at 50% 40%, #a16207 0%, #3b2504 45%, #0a0601 85%)"
      sacudidas={[0, hoy]}
    >
      {new Array(80).fill(true).map((_, i) => {
        const ang = random(`a${i}`) * Math.PI * 2;
        const vel = 15 + random(`v${i}`) * 35;
        const d = vel * frame - 0.25 * frame * frame * random(`g${i}`);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 540 + Math.cos(ang) * d,
              top: 670 + Math.sin(ang) * d + 0.6 * frame * frame * 0.3,
              width: 14 + random(`t${i}`) * 18,
              height: 14 + random(`t${i}`) * 18,
              borderRadius: i % 3 === 0 ? 4 : "50%",
              backgroundColor: i % 2 ? "#fde047" : "#fbbf24",
              rotate: `${frame * 12 * random(`r${i}`)}deg`,
              boxShadow: "0 0 14px #fbbf24",
            }}
          />
        );
      })}
      <Zona gap={20}>
        <div
          style={{
            fontFamily: MONTSERRAT,
            fontWeight: 900,
            fontSize: 150,
            color: "#FFE11A",
            fontVariantNumeric: "tabular-nums",
            textShadow: "0 0 60px rgba(250,204,21,0.8), 0 10px 0 #7c2d12",
            scale: String(spring({ frame, fps, config: { damping: 9 } })),
          }}
        >
          ${dinero.toLocaleString("de-DE")}
        </div>
        <svg width={760} height={360} viewBox="0 0 760 360">
          <path
            d="M 20 330 L 160 290 L 260 310 L 380 220 L 470 240 L 600 110 L 740 20"
            fill="none"
            stroke="#4ade80"
            strokeWidth={18}
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={interpolate(frame, [4, hoy], [1, 0], CLAMP)}
          />
          <path
            d="M 690 20 L 740 20 L 740 70"
            fill="none"
            stroke="#4ade80"
            strokeWidth={18}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={interpolate(frame, [hoy - 2, hoy], [0, 1], CLAMP)}
          />
        </svg>
      </Zona>
      <Destello en={0} dur={12} />
    </Camara>
  );
};

export const Mensaje = () => {
  const frame = useCurrentFrame();
  const [a, b, c] = ESCENAS.Mensaje.frases;
  const fase = frame >= c ? 2 : frame >= b ? 1 : 0;
  const inicio = [a, b, c][fase];
  return (
    <Camara
      fondo="radial-gradient(circle at 50% 40%, #1f2937 0%, #030712 75%)"
      sacudidas={[c]}
    >
      <Zona>
        {fase === 0 ? (
          <div
            style={{
              fontFamily: MONTSERRAT,
              fontWeight: 900,
              fontSize: 130,
              color: "white",
              textAlign: "center",
              opacity: interpolate(frame, [inicio, inicio + 4], [0, 1], CLAMP),
            }}
          >
            ESCUCHA
            <br />
            ESTO
          </div>
        ) : null}
        {fase === 1 ? (
          <div
            style={{
              fontFamily: MONTSERRAT,
              fontWeight: 900,
              fontSize: 110,
              lineHeight: 1.15,
              color: "white",
              textAlign: "center",
              padding: "0 70px",
              scale: String(
                interpolate(frame, [inicio, inicio + 6], [1.2, 1], CLAMP),
              ),
            }}
          >
            NO NECESITAS
            <br />
            TENERLO{" "}
            <span style={{ position: "relative", color: "#9ca3af" }}>
              TODO
              <span
                style={{
                  position: "absolute",
                  left: -10,
                  right: -10,
                  top: "52%",
                  height: 14,
                  backgroundColor: "#ef4444",
                  transformOrigin: "left",
                  scale: `${interpolate(frame, [inicio + 25, inicio + 32], [0, 1], CLAMP)} 1`,
                }}
              />
            </span>
          </div>
        ) : null}
        {fase === 2 ? (
          <div
            style={{
              fontFamily: MONTSERRAT,
              fontWeight: 900,
              fontSize: 150,
              lineHeight: 1.05,
              textAlign: "center",
              color: "white",
              scale: String(
                interpolate(frame, [inicio, inicio + 6], [2, 1], {
                  ...CLAMP,
                  easing: Easing.out(Easing.cubic),
                }),
              ),
            }}
          >
            SOLO
            <br />
            <span
              style={{
                color: "#0a0a0a",
                backgroundColor: "#FFE11A",
                padding: "0 24px",
                borderRadius: 16,
              }}
            >
              EMPIEZA.
            </span>
          </div>
        ) : null}
      </Zona>
    </Camara>
  );
};

export const Guardar = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame, fps, config: { damping: 8 } });
  return (
    <Camara fondo="radial-gradient(circle at 50% 40%, #1e1b4b 0%, #030712 75%)">
      <Zona gap={50}>
        <svg
          width={300}
          height={360}
          viewBox="0 0 100 120"
          style={{ scale: String(pop * (1 + 0.06 * Math.sin(frame / 4))) }}
        >
          <path
            d="M 15 8 Q 15 2 21 2 L 79 2 Q 85 2 85 8 L 85 115 L 50 88 L 15 115 Z"
            fill="#FFE11A"
          />
        </svg>
        <div
          style={{
            fontFamily: MONTSERRAT,
            fontWeight: 900,
            fontSize: 110,
            color: "white",
            textAlign: "center",
            lineHeight: 1.1,
          }}
        >
          GUÁRDALO
        </div>
      </Zona>
      {/* Flecha hacia el botón de guardar de TikTok (columna derecha) */}
      <div
        style={{
          position: "absolute",
          top: 1420,
          right: 150,
          fontFamily: MONTSERRAT,
          fontWeight: 900,
          fontSize: 230,
          color: "#FFE11A",
          WebkitTextStroke: "10px black",
          paintOrder: "stroke fill",
          translate: `${Math.sin(frame / 3) * 25}px 0px`,
          opacity: interpolate(frame, [6, 10], [0, 1], CLAMP),
        }}
      >
        →
      </div>
    </Camara>
  );
};

export const Loop = () => {
  const frame = useCurrentFrame();
  const [, sinNada] = ESCENAS.Loop.frases;
  return (
    <Camara fondo="radial-gradient(circle at 50% 40%, #2a0707 0%, #050505 70%)">
      <Zona gap={50}>
        <div
          style={{
            fontFamily: MONTSERRAT,
            fontWeight: 800,
            fontSize: 72,
            color: "#a3a3a3",
            opacity: interpolate(
              frame,
              [4, 10, sinNada - 4, sinNada],
              [0, 1, 1, 0],
              CLAMP,
            ),
          }}
        >
          ÉL TAMBIÉN EMPEZÓ…
        </div>
        <div
          style={{
            opacity: interpolate(frame, [sinNada, sinNada + 6], [0, 1], CLAMP),
          }}
        >
          <TarjetaSaldo golpe={sinNada} />
        </div>
      </Zona>
    </Camara>
  );
};
