import { loadFont as loadGrotesk } from "@remotion/google-fonts/SpaceGrotesk";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";
import { AbsoluteFill, random, useCurrentFrame } from "remotion";

export const { fontFamily: GROTESK } = loadGrotesk("normal", {
  weights: ["500", "700"],
  subsets: ["latin"],
});
export const { fontFamily: MONO } = loadMono("normal", {
  weights: ["400", "700"],
  subsets: ["latin"],
});

export const AMARILLO = "#FFE11A";
export const ROJO = "#ff4d4d";
export const MARCA = "zerx.ai";

// Habitación de noche: ventana con luces de ciudad desenfocadas.
export const Fondo = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        background:
          "linear-gradient(180deg, #05070d 0%, #090b12 45%, #030303 100%)",
      }}
    >
      {new Array(90).fill(true).map((_, i) => {
        const x = random(`bx${i}`) * 1080;
        const y = 40 + random(`by${i}`) * 520;
        const s = 3 + random(`bs${i}`) * 9;
        const calida = random(`bc${i}`) > 0.35;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: s,
              height: s,
              borderRadius: "50%",
              backgroundColor: calida ? "#ffb35c" : "#9ec5ff",
              filter: `blur(${1 + random(`bb${i}`) * 3}px)`,
              opacity:
                (0.25 + random(`bo${i}`) * 0.5) *
                (0.75 +
                  0.25 * Math.sin(frame / (8 + random(`bt${i}`) * 20) + i)),
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

// Portátil: pantalla (children) + teclado con brillo de la pantalla.
export const Portatil = ({
  children,
  brillo,
}: {
  readonly children: React.ReactNode;
  readonly brillo: string;
}) => {
  return (
    <>
      {/* Reflejo de la pantalla sobre la mesa */}
      <div
        style={{
          position: "absolute",
          left: -100,
          right: -100,
          top: 1050,
          height: 700,
          background: `radial-gradient(ellipse at 50% 20%, ${brillo} 0%, rgba(0,0,0,0) 60%)`,
          opacity: 0.35,
        }}
      />
      {/* Teclado */}
      <div
        style={{
          position: "absolute",
          left: -40,
          width: 1160,
          top: 1166,
          height: 330,
          clipPath: "polygon(8% 0, 92% 0, 100% 100%, 0 100%)",
          background: "linear-gradient(180deg, #1a1a1c 0%, #0c0c0d 100%)",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: "14%",
            right: "14%",
            top: 40,
            display: "grid",
            gridTemplateColumns: "repeat(14, 1fr)",
            gap: 9,
          }}
        >
          {new Array(56).fill(true).map((_, i) => (
            <div
              key={i}
              style={{
                height: 34,
                borderRadius: 6,
                backgroundColor: "#141416",
                boxShadow:
                  "inset 0 -2px 0 #000, 0 0 6px rgba(255,255,255,0.05)",
              }}
            />
          ))}
        </div>
      </div>
      {/* Pantalla */}
      <div
        style={{
          position: "absolute",
          left: 50,
          top: 520,
          width: 980,
          height: 646,
          borderRadius: "26px 26px 6px 6px",
          backgroundColor: "#0b0b0c",
          border: "2px solid #26262a",
          padding: 18,
          boxShadow: `0 0 120px ${brillo}33`,
        }}
      >
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            borderRadius: 10,
            overflow: "hidden",
            backgroundColor: "#060606",
          }}
        >
          {children}
        </div>
      </div>
    </>
  );
};
