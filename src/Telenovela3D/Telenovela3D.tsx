import { Audio } from "@remotion/media";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Continuara, MANO, Palabra } from "../Telenovela/Telenovela";
import type {
  Camara,
  DatosCapitulo,
  En,
  EscenaCap,
  EstadoFruta,
  Quien,
} from "../Telenovela/tipos";
import { Fruta3D } from "./Personaje3D";
import { Set3D } from "./Set3D";

const CLAMP = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const QUIENES: Quien[] = ["coco", "fresa", "pina"];
const mom = (frases: number[], en: En) =>
  typeof en === "number" ? (frases[en] ?? 0) : (frases[en[0]] ?? 0) + en[1];
const X = (px: number) => (px - 540) / 300;

// Cámara: convierte el encuadre 2D del guion (x, y, zoom) en una posición 3D con dolly lento.
const CamaraRig = ({
  cam,
  desde,
}: {
  readonly cam: Camara;
  readonly desde: number;
}) => {
  const frame = useCurrentFrame();
  const camera = useThree((s) => s.camera);
  const t = frame - desde;
  const punch = interpolate(t, [0, 10], [1.12, 1], {
    ...CLAMP,
    easing: Easing.out(Easing.cubic),
  });
  const dolly = 1 - Math.min(0.12, t * 0.0011);
  const dist = (7.2 / Math.pow(cam.s, 1.5)) * punch * dolly;
  const tx = X(cam.x);
  const ty = 1.3 + (1150 - cam.y) * 0.0019;
  const deriva = Math.sin(frame / 80) * 0.08 * dist * 0.3;
  camera.position.set(tx + deriva, ty + 0.08 + dist * 0.03, dist);
  camera.lookAt(tx, ty, 0);
  return (
    <>
      <pointLight
        position={[tx - 0.8 * dist * 0.4, ty + 0.6, dist * 0.9]}
        color="#fff1e0"
        intensity={2.2 + dist * 0.35}
        distance={dist * 3}
        decay={1.2}
      />
      <pointLight
        position={[tx + 1.5, ty + 1.2, -1.2]}
        color="#9fb6ff"
        intensity={1.2}
        distance={4}
      />
    </>
  );
};

const Escena3D = ({
  e,
  bocas,
  desde,
}: {
  readonly e: EscenaCap;
  readonly bocas: DatosCapitulo["bocas"];
  readonly desde: number;
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const est: Partial<Record<Quien, EstadoFruta>> = {};
  let cam: Camara = { x: 540, y: 1100, s: 1 };
  let tCam = 0;
  for (const s of e.estados) {
    const t = mom(e.frases, s.en);
    if (frame < t && t > 0) break;
    for (const q of QUIENES) if (s[q]) est[q] = { ...est[q], ...s[q] };
    if (s.cam) {
      cam = s.cam;
      tCam = t;
    }
  }
  const presentes = QUIENES.filter((q) => e.personajes[q]);
  return (
    <AbsoluteFill>
      <ThreeCanvas
        width={width}
        height={height}
        camera={{ fov: 38, near: 0.05, far: 60 }}
        shadows
      >
        <color attach="background" args={["#05050a"]} />
        <fog
          attach="fog"
          args={[e.luz === "dia" ? "#cfe3f5" : "#0a0a18", 7, 22]}
        />
        <CamaraRig cam={cam} desde={tCam} />
        <Set3D e={e} frame={frame} />
        {presentes.map((q) => {
          const p = e.personajes[q]!;
          const s = est[q] ?? {};
          const giro = presentes.length === 1 ? 0.12 : 0.55;
          return (
            <Fruta3D
              key={q}
              quien={q}
              x={X(s.x ?? p.x)}
              rotY={p.mira === "der" ? giro : -giro}
              ropa={p.ropa}
              expr={s.expr ?? "normal"}
              pose={s.pose ?? "normal"}
              prop={s.prop}
              brillo={!!s.brillo}
              boca={bocas[q][desde + frame] ?? 0}
              frame={frame}
            />
          );
        })}
      </ThreeCanvas>
      {(e.notas ?? []).map((n) => {
        const t0 = mom(e.frases, n.en);
        if (frame < t0) return null;
        const s = interpolate(frame - t0, [0, 8], [0, 1], {
          ...CLAMP,
          easing: Easing.out(Easing.back(1.4)),
        });
        return (
          <div
            key={n.texto}
            style={{
              position: "absolute",
              left: 190,
              top: 380,
              width: 700,
              padding: "40px 46px",
              backgroundColor: "#fffdf3",
              boxShadow: "0 30px 60px rgba(0,0,0,0.5)",
              rotate: "-3deg",
              scale: String(s),
              fontFamily: MANO,
              fontSize: 82,
              lineHeight: 1.1,
              color: "#2a2a6a",
            }}
          >
            {n.texto}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// Versión 3D de la telenovela: mismos datos y tiempos que la 2D.
export const Telenovela3D = ({
  datos,
  conVoz = true,
}: {
  readonly datos: DatosCapitulo;
  readonly conVoz?: boolean;
}) => {
  const ult = datos.escenas[datos.escenas.length - 1];
  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      {datos.escenas.map((e) => (
        <Sequence key={e.id} name={e.id} from={e.from} durationInFrames={e.dur}>
          <Escena3D e={e} bocas={datos.bocas} desde={e.from} />
        </Sequence>
      ))}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(circle at 50% 50%, transparent 55%, rgba(0,0,0,0.5) 100%)",
        }}
      />
      <Palabra lineas={datos.lineas} />
      <div
        style={{
          position: "absolute",
          top: 70,
          right: 40,
          fontFamily: "Montserrat, sans-serif",
          fontWeight: 800,
          fontSize: 28,
          color: "rgba(255,255,255,0.75)",
        }}
      >
        {datos.usuario}
      </div>
      {ult.continuara ? (
        <Continuara
          desde={ult.from + ult.dur - 75}
          serie={datos.serie}
          cap={datos.capitulo}
        />
      ) : null}
      {conVoz ? (
        <Audio
          name="Diálogo"
          src={staticFile(`telenovela/${datos.slug}/dialogo.wav`)}
        />
      ) : null}
      <Audio
        name="Música y efectos"
        src={staticFile(`telenovela/${datos.slug}/musica.wav`)}
      />
    </AbsoluteFill>
  );
};
