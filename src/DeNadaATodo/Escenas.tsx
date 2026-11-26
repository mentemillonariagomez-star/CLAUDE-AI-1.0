import {
  AbsoluteFill,
  Easing,
  Interactive,
  interpolate,
  random,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import "./fuentes";

// 1. No tenía nada.
export const EscenaNada = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#060606",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Interactive.Div
        name="No tenía nada"
        style={{
          fontFamily: "Playfair Display",
          fontWeight: 400,
          fontSize: 170,
          color: "#d4d4d4",
          opacity: interpolate(frame, [0.4 * fps, 2 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          scale: interpolate(frame, [0, durationInFrames], [1.08, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            output: "perceptual-scale",
          }),
        }}
      >
        No tenía nada.
      </Interactive.Div>
    </AbsoluteFill>
  );
};

// 2. Ni dinero. Ni contactos. Ni un plan.
export const EscenaNi = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0a0a0a",
        justifyContent: "center",
        alignItems: "center",
        gap: 24,
      }}
    >
      <Interactive.Div
        name="Ni dinero"
        style={{
          fontFamily: "Playfair Display",
          fontStyle: "italic",
          fontSize: 120,
          color: "#a3a3a3",
          opacity: interpolate(frame, [0.2 * fps, 0.9 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          translate: interpolate(
            frame,
            [0.2 * fps, 1 * fps],
            ["0px 40px", "0px 0px"],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            },
          ),
        }}
      >
        Ni dinero.
      </Interactive.Div>
      <Interactive.Div
        name="Ni contactos"
        style={{
          fontFamily: "Playfair Display",
          fontStyle: "italic",
          fontSize: 120,
          color: "#a3a3a3",
          opacity: interpolate(frame, [1.4 * fps, 2.1 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          translate: interpolate(
            frame,
            [1.4 * fps, 2.2 * fps],
            ["0px 40px", "0px 0px"],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            },
          ),
        }}
      >
        Ni contactos.
      </Interactive.Div>
      <Interactive.Div
        name="Ni un plan"
        style={{
          fontFamily: "Playfair Display",
          fontStyle: "italic",
          fontSize: 120,
          color: "#a3a3a3",
          opacity: interpolate(frame, [2.6 * fps, 3.3 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          translate: interpolate(
            frame,
            [2.6 * fps, 3.4 * fps],
            ["0px 40px", "0px 0px"],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            },
          ),
        }}
      >
        Ni un plan.
      </Interactive.Div>
    </AbsoluteFill>
  );
};

// 3. Solo tenía una idea.
export const EscenaIdea = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0a0a0a",
        justifyContent: "center",
        alignItems: "center",
        gap: 70,
      }}
    >
      <Interactive.Div
        name="Luz de la idea"
        style={{
          width: 280,
          height: 280,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, #fff7d6 0%, #fde68a 18%, rgba(253,230,138,0.25) 45%, rgba(253,230,138,0) 70%)",
          scale: interpolate(frame, [0, 1.2 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.spring({ damping: 12 }),
            output: "perceptual-scale",
          }),
        }}
      />
      <Interactive.Div
        name="Solo tenía una idea"
        style={{
          fontFamily: "Playfair Display",
          fontWeight: 400,
          fontSize: 130,
          color: "#fef3c7",
          opacity: interpolate(frame, [1 * fps, 2 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        Solo tenía una idea.
      </Interactive.Div>
    </AbsoluteFill>
  );
};

// 4. Y la decisión de no rendirse.
export const EscenaDecision = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0f0d09",
        justifyContent: "center",
        alignItems: "center",
        gap: 10,
      }}
    >
      <Interactive.Div
        name="Y la decisión"
        style={{
          fontFamily: "Inter",
          fontWeight: 300,
          fontSize: 64,
          letterSpacing: 8,
          textTransform: "uppercase",
          color: "#a8a29e",
          opacity: interpolate(frame, [0.2 * fps, 1 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        Y la decisión
      </Interactive.Div>
      <Interactive.Div
        name="De no rendirse"
        style={{
          fontFamily: "Playfair Display",
          fontWeight: 900,
          fontSize: 170,
          color: "#fde68a",
          opacity: interpolate(frame, [0.9 * fps, 1.6 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          scale: interpolate(frame, [0.9 * fps, 1.8 * fps], [1.25, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
            output: "perceptual-scale",
          }),
        }}
      >
        de no rendirse.
      </Interactive.Div>
    </AbsoluteFill>
  );
};

// 5. Trabajó cuando nadie miraba. Día 1 → Día 1.000
export const EscenaDias = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const dia = Math.round(
    interpolate(frame, [0.6 * fps, 5 * fps], [1, 1000], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.in(Easing.quad),
    }),
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#110f0b",
        justifyContent: "center",
        alignItems: "center",
        gap: 40,
      }}
    >
      <Interactive.Div
        name="Trabajó cuando nadie miraba"
        style={{
          fontFamily: "Playfair Display",
          fontStyle: "italic",
          fontSize: 84,
          color: "#d6d3d1",
          opacity: interpolate(frame, [0, 0.8 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        Trabajó cuando nadie miraba.
      </Interactive.Div>
      {/* Contador calculado por fotograma (no editable en Studio) */}
      <div
        style={{
          fontFamily: "Inter",
          fontWeight: 500,
          fontSize: 220,
          color: "#fbbf24",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        Día {dia.toLocaleString("de-DE")}
      </div>
      <div
        style={{
          width: 900,
          height: 10,
          borderRadius: 5,
          backgroundColor: "#292524",
          overflow: "hidden",
        }}
      >
        <Interactive.Div
          name="Barra de progreso"
          style={{
            width: 900,
            height: 10,
            backgroundColor: "#fbbf24",
            transformOrigin: "left center",
            scale: interpolate(frame, [0.6 * fps, 5 * fps], ["0 1", "1 1"], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.in(Easing.quad),
            }),
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

// 6. Falló. Una y otra vez.
export const EscenaFallo = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#170b0b",
        justifyContent: "center",
        alignItems: "center",
        gap: 60,
      }}
    >
      <Interactive.Div
        name="Falló. Una y otra vez."
        style={{
          fontFamily: "Playfair Display",
          fontWeight: 700,
          fontSize: 140,
          color: "#f5f5f4",
          opacity: interpolate(frame, [0, 0.6 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        Falló. Una y otra vez.
      </Interactive.Div>
      {/* Fila de intentos fallidos generada en bucle (no editable individualmente) */}
      <div style={{ display: "flex", gap: 48 }}>
        {new Array(7).fill(true).map((_, i) => {
          const inicio = 0.8 * fps + i * 0.35 * fps;
          return (
            <div
              key={i}
              style={{
                fontFamily: "Inter",
                fontWeight: 500,
                fontSize: 110,
                color: "#ef4444",
                opacity: interpolate(frame, [inicio, inicio + 4], [0, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                }),
                scale: String(
                  interpolate(frame, [inicio, inicio + 8], [1.8, 1], {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                    easing: Easing.out(Easing.back(2)),
                  }),
                ),
              }}
            >
              ✕
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// 7. Pero cada caída le enseñó algo.
export const EscenaCaida = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#110f0b",
        justifyContent: "center",
        alignItems: "center",
        gap: 10,
      }}
    >
      <Interactive.Div
        name="Pero cada caída"
        style={{
          fontFamily: "Playfair Display",
          fontWeight: 400,
          fontSize: 130,
          color: "#e7e5e4",
          opacity: interpolate(frame, [0.1 * fps, 0.9 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        Pero cada caída
      </Interactive.Div>
      <Interactive.Div
        name="Le enseñó algo"
        style={{
          fontFamily: "Playfair Display",
          fontStyle: "italic",
          fontSize: 130,
          color: "#fbbf24",
          opacity: interpolate(frame, [1.2 * fps, 2 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          translate: interpolate(
            frame,
            [1.2 * fps, 2.1 * fps],
            ["0px 50px", "0px 0px"],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            },
          ),
        }}
      >
        le enseñó algo.
      </Interactive.Div>
    </AbsoluteFill>
  );
};

// 8. Hasta que un día… (gráfica que sube y contador de dinero)
export const EscenaSubida = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const dinero = Math.round(
    interpolate(frame, [1 * fps, 5.5 * fps], [0, 1000000], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.in(Easing.cubic),
    }),
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#14100a",
        justifyContent: "center",
        alignItems: "center",
        gap: 30,
      }}
    >
      <Interactive.Div
        name="Hasta que un día"
        style={{
          fontFamily: "Playfair Display",
          fontStyle: "italic",
          fontSize: 80,
          color: "#d6d3d1",
          opacity: interpolate(frame, [0, 0.7 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        Hasta que un día…
      </Interactive.Div>
      {/* Contador calculado por fotograma (no editable en Studio) */}
      <div
        style={{
          fontFamily: "Inter",
          fontWeight: 500,
          fontSize: 150,
          color: "#fcd34d",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        ${dinero.toLocaleString("de-DE")}
      </div>
      <Interactive.Svg width={1400} height={420} viewBox="0 0 1400 600">
        <Interactive.Path
          name="Gráfica de crecimiento"
          d="M 0 580 L 150 540 L 280 560 L 420 490 L 540 515 L 680 400 L 800 430 L 940 290 L 1060 320 L 1220 130 L 1400 10"
          fill="none"
          stroke="#fbbf24"
          strokeWidth={10}
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={interpolate(frame, [1 * fps, 5.5 * fps], [1, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.in(Easing.cubic),
          })}
        />
      </Interactive.Svg>
    </AbsoluteFill>
  );
};

// Partículas doradas que suben (generadas, no editables individualmente)
const Particulas = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  return (
    <AbsoluteFill>
      {new Array(60).fill(true).map((_, i) => {
        const x = random(`x${i}`) * width;
        const velocidad = 1.5 + random(`v${i}`) * 3;
        const tamano = 3 + random(`t${i}`) * 9;
        const y =
          height +
          50 -
          ((frame * velocidad + random(`y${i}`) * height) % (height + 100));
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: tamano,
              height: tamano,
              borderRadius: "50%",
              backgroundColor: "#fde68a",
              opacity: 0.25 + random(`o${i}`) * 0.6,
              boxShadow: "0 0 12px #fbbf24",
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

// 9. Lo tenía todo.
export const EscenaTodo = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  return (
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(circle at 50% 50%, #5a3f06 0%, #1c1303 55%, #080501 100%)",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Particulas />
      <Interactive.Div
        name="Lo tenía todo"
        style={{
          fontFamily: "Playfair Display",
          fontWeight: 900,
          fontSize: 230,
          color: "transparent",
          backgroundImage:
            "linear-gradient(180deg, #fff7d6 0%, #fcd34d 45%, #b45309 100%)",
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          filter: "drop-shadow(0 0 40px rgba(251,191,36,0.45))",
          opacity: interpolate(frame, [0.2 * fps, 1.2 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          scale: interpolate(frame, [0, durationInFrames], [0.9, 1.05], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            output: "perceptual-scale",
          }),
        }}
      >
        Lo tenía todo.
      </Interactive.Div>
    </AbsoluteFill>
  );
};

// 10. Cierre
export const EscenaCierre = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#070604",
        justifyContent: "center",
        alignItems: "center",
        gap: 40,
      }}
    >
      <Interactive.Div
        name="Todo empezó con nada"
        style={{
          fontFamily: "Playfair Display",
          fontWeight: 400,
          fontSize: 120,
          color: "#e7e5e4",
          opacity: interpolate(frame, [0.2 * fps, 1 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        Todo empezó con nada.
      </Interactive.Div>
      <Interactive.Div
        name="Tu historia empieza hoy"
        style={{
          fontFamily: "Inter",
          fontWeight: 300,
          fontSize: 56,
          letterSpacing: 10,
          textTransform: "uppercase",
          color: "#fbbf24",
          opacity: interpolate(frame, [1.4 * fps, 2.2 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        Tu historia empieza hoy
      </Interactive.Div>
    </AbsoluteFill>
  );
};
