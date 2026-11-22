import { useCurrentFrame } from "remotion";
import { BOCA_CHICO, BOCA_ROBOT, LINEAS } from "./datos";

const Mat = ({
  c,
  e,
  ei = 1,
}: {
  readonly c: string;
  readonly e?: string;
  readonly ei?: number;
}) => (
  <meshStandardMaterial
    color={c}
    flatShading
    roughness={0.85}
    emissive={e ?? "#000000"}
    emissiveIntensity={e ? ei : 0}
  />
);

const lineaActual = (frame: number) =>
  [...LINEAS].reverse().find((l) => frame >= l.from - 4);

// Chico low-poly: lentes azules, pelo en puntas, sudadera mostaza.
export const Chico = ({ pos }: { readonly pos: [number, number, number] }) => {
  const frame = useCurrentFrame();
  const boca = BOCA_CHICO[frame] ?? 0;
  const l = lineaActual(frame);
  const avergonzado = l?.texto.startsWith("Doce.") || l?.texto === "Doce.";
  const respira = Math.sin(frame / 18) * 0.012;
  const parpado = frame % 83 < 4 ? 0.1 : 1;
  const cabezaX =
    (avergonzado ? 0.28 : 0) + boca * 0.05 + Math.sin(frame / 40) * 0.02;
  const cabezaY = 0.35 + Math.sin(frame / 55) * 0.05;
  return (
    <group position={pos}>
      {/* Torso */}
      <mesh position={[0, 0.85 + respira, 0]}>
        <boxGeometry args={[0.78, 0.8, 0.46]} />
        <Mat c="#b8913f" />
      </mesh>
      <mesh position={[-0.07, 0.83, 0.235]}>
        <boxGeometry args={[0.025, 0.36, 0.01]} />
        <Mat c="#f1ead8" />
      </mesh>
      <mesh position={[0.07, 0.83, 0.235]}>
        <boxGeometry args={[0.025, 0.36, 0.01]} />
        <Mat c="#f1ead8" />
      </mesh>
      {/* Brazos (apoyados hacia el escritorio) */}
      {[-1, 1].map((s) => (
        <mesh
          key={s}
          position={[s * 0.47, 0.82, 0.18]}
          rotation={[-0.9, 0, s * 0.12]}
        >
          <boxGeometry args={[0.2, 0.62, 0.22]} />
          <Mat c="#a9843a" />
        </mesh>
      ))}
      {/* Cabeza */}
      <group position={[0, 1.55 + respira, 0]} rotation={[cabezaX, cabezaY, 0]}>
        <mesh scale={[1, 1.08, 0.95]}>
          <icosahedronGeometry args={[0.34, 1]} />
          <Mat c="#d9a57f" />
        </mesh>
        {/* Pelo en puntas */}
        {Array.from({ length: 11 }).map((_, i) => {
          const a = (i / 11) * Math.PI * 2;
          return (
            <mesh
              key={i}
              position={[
                Math.cos(a) * 0.2,
                0.25 + (i % 2) * 0.04,
                Math.sin(a) * 0.2 - 0.05,
              ]}
              rotation={[Math.sin(a) * 0.9, 0, -Math.cos(a) * 0.9]}
            >
              <coneGeometry args={[0.13, 0.32, 4]} />
              <Mat c="#22232c" />
            </mesh>
          );
        })}
        <mesh position={[0, 0.2, -0.04]} scale={[1, 0.6, 1]}>
          <icosahedronGeometry args={[0.33, 0]} />
          <Mat c="#22232c" />
        </mesh>
        {/* Lentes */}
        {[-1, 1].map((s) => (
          <group key={s} position={[s * 0.14, 0.02, 0.31]}>
            <mesh>
              <torusGeometry args={[0.1, 0.022, 4, 4]} />
              <Mat c="#5b78c9" />
            </mesh>
            <mesh position={[0, 0, -0.01]} scale={[1, parpado, 1]}>
              <sphereGeometry args={[0.045, 8, 6]} />
              <Mat c="#f4f4f4" />
            </mesh>
            <mesh position={[s * -0.01, 0, 0.03]} scale={[1, parpado, 1]}>
              <sphereGeometry args={[0.024, 6, 5]} />
              <Mat c="#1a2140" />
            </mesh>
          </group>
        ))}
        <mesh position={[0, 0.02, 0.33]}>
          <boxGeometry args={[0.08, 0.02, 0.02]} />
          <Mat c="#5b78c9" />
        </mesh>
        {/* Boca */}
        <mesh position={[0, -0.17, 0.31]} scale={[1, 0.25 + boca * 2.2, 1]}>
          <boxGeometry args={[0.12, 0.03, 0.03]} />
          <Mat c="#4a1d1a" />
        </mesh>
      </group>
    </group>
  );
};

// Robot propio: cabeza-pantalla con ojos de luz, antena con bombilla y luz en el pecho.
export const Robot = ({ pos }: { readonly pos: [number, number, number] }) => {
  const frame = useCurrentFrame();
  const boca = BOCA_ROBOT[frame] ?? 0;
  const l = lineaActual(frame);
  const sorpresa = l?.texto === "¿Doce mil?";
  const aCamara = l?.plano === "robot_camara";
  const parpado = frame % 71 < 4 ? 0.12 : 1;
  const ojoAlto = (sorpresa ? 1.5 : aCamara ? 0.45 : 1) * parpado;
  const giro = aCamara ? 0 : -0.75 + Math.sin(frame / 37) * 0.04;
  const salto = Math.abs(Math.sin(frame / 9)) * 0.015 * (boca > 0.1 ? 1 : 0);
  const brillo = 1.2 + Math.sin(frame / 6) * 0.25;
  return (
    <group position={pos} rotation={[0, giro, 0]}>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 0.1, 0.12, 0]}>
          <boxGeometry args={[0.12, 0.24, 0.14]} />
          <Mat c="#7a4335" />
        </mesh>
      ))}
      <group position={[0, salto, 0]}>
        <mesh position={[0, 0.48, 0]}>
          <boxGeometry args={[0.42, 0.46, 0.3]} />
          <Mat c="#d9775a" />
        </mesh>
        <mesh position={[0, 0.5, 0.152]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.09, 0.09, 0.01, 8]} />
          <Mat c="#ffc08a" e="#ff9a50" ei={brillo} />
        </mesh>
        {[-1, 1].map((s) => (
          <mesh
            key={s}
            position={[s * 0.27, 0.48, 0]}
            rotation={[0, 0, s * 0.15]}
          >
            <boxGeometry args={[0.1, 0.36, 0.12]} />
            <Mat c="#c9c9d2" />
          </mesh>
        ))}
        {/* Cabeza-pantalla */}
        <group position={[0, 0.98, 0]} rotation={[sorpresa ? -0.12 : 0, 0, 0]}>
          <mesh>
            <boxGeometry args={[0.6, 0.48, 0.42]} />
            <Mat c="#d6d6de" />
          </mesh>
          <mesh position={[0, 0, 0.212]}>
            <planeGeometry args={[0.5, 0.38]} />
            <meshStandardMaterial color="#0b0d14" roughness={0.3} />
          </mesh>
          {[-1, 1].map((s) => (
            <mesh
              key={s}
              position={[s * 0.11, 0.05, 0.215]}
              scale={[1, ojoAlto, 1]}
            >
              <planeGeometry args={[0.085, 0.11]} />
              <meshStandardMaterial
                color="white"
                emissive="#e8f2ff"
                emissiveIntensity={2.2}
              />
            </mesh>
          ))}
          <mesh position={[0, -0.1, 0.215]} scale={[1, 0.25 + boca * 3, 1]}>
            <planeGeometry args={[0.13, 0.025]} />
            <meshStandardMaterial
              color="white"
              emissive="#e8f2ff"
              emissiveIntensity={2}
            />
          </mesh>
          <mesh position={[0.31, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.1, 0.1, 0.05, 6]} />
            <Mat c="#a9a9b4" />
          </mesh>
          <mesh position={[0, 0.36, 0]}>
            <cylinderGeometry args={[0.012, 0.012, 0.25, 5]} />
            <Mat c="#888" />
          </mesh>
          <mesh position={[0, 0.5, 0]}>
            <sphereGeometry args={[0.045, 8, 6]} />
            <meshStandardMaterial
              color="#ffd9a0"
              emissive="#ffb35c"
              emissiveIntensity={3}
            />
          </mesh>
          <pointLight
            position={[0, 0.5, 0.05]}
            color="#ffb35c"
            intensity={brillo * 0.6}
            distance={2.2}
            decay={2}
          />
        </group>
      </group>
    </group>
  );
};
