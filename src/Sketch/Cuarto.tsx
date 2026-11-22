import { useMemo } from "react";
import { random } from "remotion";

const Edificios = () => {
  const ventanas = useMemo(() => {
    const v: { x: number; y: number; z: number; c: string }[] = [];
    for (let b = 0; b < 16; b++) {
      const bx = -9 + b * 1.2 + random(`bx${b}`) * 0.5;
      const alto = 2 + random(`h${b}`) * 6;
      const bz = -10 - random(`z${b}`) * 6;
      for (let i = 0; i < 26; i++) {
        if (random(`w${b}-${i}`) > 0.55) continue;
        v.push({
          x: bx + (random(`wx${b}-${i}`) - 0.5) * 0.8,
          y: -1 + random(`wy${b}-${i}`) * alto,
          z: bz + 0.31,
          c: random(`wc${b}-${i}`) > 0.3 ? "#ffcf7a" : "#9fd0ff",
        });
      }
    }
    return v;
  }, []);
  return (
    <group>
      {Array.from({ length: 16 }).map((_, b) => {
        const alto = 2 + random(`h${b}`) * 6;
        return (
          <mesh
            key={b}
            position={[
              -9 + b * 1.2 + random(`bx${b}`) * 0.5,
              -1 + alto / 2,
              -10 - random(`z${b}`) * 6,
            ]}
          >
            <boxGeometry args={[1, alto, 0.6]} />
            <meshStandardMaterial color="#0c1230" flatShading />
          </mesh>
        );
      })}
      {ventanas.map((w, i) => (
        <mesh key={i} position={[w.x, w.y, w.z]}>
          <planeGeometry args={[0.1, 0.13]} />
          <meshBasicMaterial color={w.c} />
        </mesh>
      ))}
      <mesh position={[4, 7, -20]}>
        <sphereGeometry args={[0.7, 12, 10]} />
        <meshBasicMaterial color="#f6f0d8" />
      </mesh>
      <mesh position={[0, 6, -24]}>
        <planeGeometry args={[60, 30]} />
        <meshBasicMaterial color="#0a1a4a" />
      </mesh>
    </group>
  );
};

// Cuarto de noche: ventana grande, escritorio, monitor y lámpara.
export const Cuarto = () => (
  <group>
    <ambientLight color="#4a68c0" intensity={0.9} />
    <hemisphereLight args={["#6f8fff", "#2a1a14", 0.6]} />
    <pointLight
      position={[0.3, 1.8, 2.2]}
      color="#9db4ff"
      intensity={3}
      distance={6}
      decay={2}
    />
    <directionalLight position={[2, 5, -6]} color="#7fa0ff" intensity={1.4} />
    <pointLight
      position={[-1.6, 2.2, 0.8]}
      color="#ffb070"
      intensity={2.2}
      distance={5}
      decay={2}
    />
    <pointLight
      position={[0, 1.5, -0.6]}
      color="#7fb3ff"
      intensity={1.2}
      distance={2.5}
      decay={2}
    />
    <Edificios />
    {/* Pared con ventana: cuatro paneles alrededor del hueco */}
    {(
      [
        [0, 4.1, 6, 1.6],
        [0, -0.2, 6, 1.4],
        [-2.6, 2, 0.8, 3],
        [2.6, 2, 0.8, 3],
      ] as const
    ).map(([x, y, w, h], i) => (
      <mesh key={i} position={[x, y, -2]}>
        <boxGeometry args={[w, h, 0.2]} />
        <meshStandardMaterial color="#1b1d2c" flatShading />
      </mesh>
    ))}
    {[-0.7, 0.7].map((x) => (
      <mesh key={x} position={[x, 2, -2]}>
        <boxGeometry args={[0.07, 3, 0.12]} />
        <meshStandardMaterial color="#141522" />
      </mesh>
    ))}
    <mesh position={[0, 2.25, -2]}>
      <boxGeometry args={[4.4, 0.07, 0.12]} />
      <meshStandardMaterial color="#141522" />
    </mesh>
    {/* Piso */}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.9, 0]}>
      <planeGeometry args={[12, 12]} />
      <meshStandardMaterial color="#20212e" />
    </mesh>
    {/* Escritorio */}
    <mesh position={[0, 0.62, -0.4]}>
      <boxGeometry args={[3.2, 0.08, 1.3]} />
      <meshStandardMaterial color="#3a2c26" flatShading />
    </mesh>
    {/* Monitor */}
    <mesh position={[-0.15, 1.12, -0.85]}>
      <boxGeometry args={[1, 0.62, 0.05]} />
      <meshStandardMaterial color="#111" />
    </mesh>
    <mesh position={[-0.15, 1.12, -0.82]}>
      <planeGeometry args={[0.92, 0.54]} />
      <meshStandardMaterial
        color="#1c2440"
        emissive="#3a4f8f"
        emissiveIntensity={1.3}
      />
    </mesh>
    {[0.15, 0.05, -0.05, -0.15].map((y, i) => (
      <mesh key={y} position={[-0.3 + (i % 2) * 0.25, 1.12 + y, -0.815]}>
        <planeGeometry args={[i % 2 ? 0.35 : 0.5, 0.04]} />
        <meshBasicMaterial color={i === 2 ? "#f2a36b" : "#9fb3e6"} />
      </mesh>
    ))}
    <mesh position={[-0.15, 0.75, -0.85]}>
      <boxGeometry args={[0.08, 0.22, 0.08]} />
      <meshStandardMaterial color="#111" />
    </mesh>
    <mesh position={[-0.15, 0.68, -0.35]}>
      <boxGeometry args={[0.7, 0.03, 0.22]} />
      <meshStandardMaterial color="#2a2a33" />
    </mesh>
    {/* Lámpara */}
    <mesh position={[-1.3, 0.95, -0.7]} rotation={[0, 0, 0.5]}>
      <coneGeometry args={[0.16, 0.22, 6, 1, true]} />
      <meshStandardMaterial
        color="#c98a4b"
        emissive="#ffb070"
        emissiveIntensity={0.6}
        side={2}
      />
    </mesh>
    <mesh position={[-1.3, 0.78, -0.7]}>
      <cylinderGeometry args={[0.02, 0.02, 0.32, 5]} />
      <meshStandardMaterial color="#333" />
    </mesh>
  </group>
);
