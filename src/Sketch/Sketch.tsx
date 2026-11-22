import { loadFont } from "@remotion/google-fonts/Montserrat";
import { Audio } from "@remotion/media";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Vector3 } from "three";
import { Cuarto } from "./Cuarto";
import { LINEAS } from "./datos";
import { Chico, Robot } from "./Personajes3D";

const { fontFamily } = loadFont("normal", {
  weights: ["600", "800"],
  subsets: ["latin"],
});
const CLAMP = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const CABEZA_CHICO: V = [-0.95, 1.42, 0.35];
const CABEZA_ROBOT: V = [0.75, 1.64, -0.2];
type V = [number, number, number];

// Planos de cámara: [posición, hacia dónde mira, campo de visión]
const PLANOS: Record<string, [V, V, number]> = {
  general: [[0.15, 1.75, 4.3], [-0.1, 1.2, -0.3], 52],
  chico: [[0.65, 1.6, 2.4], [-0.95, 1.3, 0.35], 56],
  chico_cerca: [[0.15, 1.52, 1.75], CABEZA_CHICO, 46],
  telefono: [[0.15, 1.52, 1.75], CABEZA_CHICO, 46],
  robot: [[-0.6, 1.65, 1.95], [0.75, 1.42, -0.2], 56],
  robot_cerca: [[-0.35, 1.7, 1.25], CABEZA_ROBOT, 46],
  robot_camara: [[0.75, 1.62, 2.1], [0.75, 1.5, -0.2], 52],
};

const lineaEn = (frame: number) => {
  let i = 0;
  LINEAS.forEach((l, j) => {
    if (frame >= l.from - 6) i = j;
  });
  return i;
};

const Camara = () => {
  const frame = useCurrentFrame();
  const camera = useThree((s) => s.camera);
  const i = lineaEn(frame);
  const l = LINEAS[i];
  const inicio = i === 0 ? 0 : l.from - 6;
  const fin = LINEAS[i + 1] ? LINEAS[i + 1].from - 6 : l.from + l.dur + 40;
  const [pos, mira, fov] = PLANOS[l.plano] ?? PLANOS.general;
  const p = new Vector3(...pos);
  const m = new Vector3(...mira);
  // Acercamiento lento durante el plano, y un "zoom golpe" en la sorpresa.
  const avance = interpolate(frame, [inicio, fin], [0, 0.08], CLAMP);
  const golpe =
    l.texto === "¿Doce mil?"
      ? interpolate(frame, [inicio, inicio + 5], [0, 0.25], {
          ...CLAMP,
          easing: Easing.out(Easing.cubic),
        })
      : 0;
  p.lerp(m, avance + golpe);
  const t = frame / 30;
  p.x += Math.sin(t * 0.9) * 0.015;
  p.y += Math.sin(t * 1.3) * 0.01;
  camera.position.copy(p);
  if ("fov" in camera) {
    camera.fov = fov;
    camera.updateProjectionMatrix();
  }
  camera.lookAt(m);
  return null;
};

const Subtitulo = () => {
  const frame = useCurrentFrame();
  const l = LINEAS.find(
    (x) => frame >= x.from - 2 && frame < x.from + x.dur + 8,
  );
  if (!l) return null;
  return (
    <div
      style={{
        position: "absolute",
        top: 330,
        left: 90,
        right: 90,
        textAlign: "center",
        fontFamily,
        fontWeight: 600,
        fontSize: 46,
        lineHeight: 1.25,
        color: "white",
        textShadow: "0 2px 8px rgba(0,0,0,0.9), 0 0 2px black",
        opacity: interpolate(frame, [l.from - 2, l.from + 2], [0, 1], CLAMP),
      }}
    >
      {l.texto}
    </div>
  );
};

// Inserto: el teléfono con las 12 vistas.
const Telefono = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const l = LINEAS.find((x) => x.plano === "telefono");
  if (!l) return null;
  const desde = l.from - 6;
  const hasta = l.from + l.dur + 26;
  if (frame < desde || frame > hasta + 8) return null;
  const s = spring({ frame: frame - desde, fps, config: { damping: 14 } });
  const sale = interpolate(frame, [hasta, hasta + 8], [0, 1], CLAMP);
  const vistas = Math.round(
    interpolate(frame, [desde + 4, l.from + 10], [0, 12], CLAMP),
  );
  return (
    <AbsoluteFill
      style={{ backgroundColor: `rgba(5,8,20,${0.55 * s * (1 - sale)})` }}
    >
      <div
        style={{
          position: "absolute",
          left: 240,
          top: 700,
          width: 600,
          height: 1060,
          borderRadius: 70,
          backgroundColor: "#0d0f16",
          border: "14px solid #2a2d38",
          boxSizing: "border-box",
          overflow: "hidden",
          translate: `0px ${(1 - s) * 900 + sale * 1200}px`,
          rotate: `${(1 - s) * 8}deg`,
          fontFamily,
          color: "white",
        }}
      >
        <div
          style={{
            height: 600,
            background: "linear-gradient(160deg,#3b2a6e,#101426)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 140,
          }}
        >
          🎬
        </div>
        <div style={{ padding: "30px 40px" }}>
          <div style={{ fontWeight: 800, fontSize: 44 }}>Mi primer video</div>
          <div
            style={{
              fontWeight: 800,
              fontSize: 92,
              marginTop: 10,
              color: "#ff5a5a",
            }}
          >
            👁 {vistas}
          </div>
          <div
            style={{
              fontWeight: 600,
              fontSize: 32,
              color: "#9aa",
              marginTop: 6,
            }}
          >
            visualizaciones
          </div>
          <div
            style={{
              marginTop: 28,
              backgroundColor: "#1b1e2a",
              borderRadius: 24,
              padding: "18px 24px",
              fontSize: 32,
              opacity: interpolate(
                frame,
                [l.from + 14, l.from + 20],
                [0, 1],
                CLAMP,
              ),
            }}
          >
            <b>mamá</b>: qué orgullo mijo ❤️
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Sketch en 3D low-poly: un chico y su robot, de noche, frente a la ciudad.
export const Sketch = () => {
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: "#05070f" }}>
      <ThreeCanvas
        width={width}
        height={height}
        camera={{ fov: 45, near: 0.05, far: 100 }}
      >
        <color attach="background" args={["#0a1a4a"]} />
        <fog attach="fog" args={["#0a1640", 8, 30]} />
        <Camara />
        <Cuarto />
        <group rotation={[0, 0.35, 0]} position={[-0.95, -0.13, 0.35]}>
          <Chico pos={[0, 0, 0]} />
        </group>
        <Robot pos={[0.75, 0.66, -0.2]} />
      </ThreeCanvas>
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(circle at 50% 45%, transparent 55%, rgba(0,0,0,0.55) 100%)",
        }}
      />
      <Telefono />
      <Subtitulo />
      <Audio name="Diálogo" src={staticFile("sketch/dialogo.wav")} />
      <Audio
        name="Ambiente"
        src={staticFile("sketch/ambiente.wav")}
        volume={0.6}
      />
    </AbsoluteFill>
  );
};
