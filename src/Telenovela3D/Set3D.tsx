import { useMemo } from "react";
import { random } from "remotion";
import { DoubleSide } from "three";
import type { EscenaCap } from "../Telenovela/tipos";
import { texCielo, texMadera, texRayas, texTexto } from "./texturas";

const Edificios = ({
  z,
  noche,
  n = 14,
  color,
}: {
  readonly z: number;
  readonly noche: boolean;
  readonly n?: number;
  readonly color?: string;
}) => {
  const b = useMemo(
    () =>
      Array.from({ length: n }).map((_, i) => ({
        x: -7 + i * (14 / n) + random(`bx${i}${z}`) * 0.4,
        w: 0.6 + random(`bw${i}${z}`) * 0.5,
        h: 1.5 + random(`bh${i}${z}`) * 4,
      })),
    [n, z],
  );
  return (
    <group>
      {b.map((e, i) => (
        <group key={i}>
          <mesh position={[e.x, e.h / 2, z]}>
            <boxGeometry args={[e.w, e.h, 0.4]} />
            <meshStandardMaterial
              color={color ?? (noche ? "#1a1838" : "#9fb4d8")}
              roughness={0.9}
            />
          </mesh>
          {noche
            ? Array.from({ length: 8 }).map((_, k) =>
                random(`w${i}-${k}${z}`) > 0.55 ? null : (
                  <mesh
                    key={k}
                    position={[
                      e.x - e.w / 3 + (k % 3) * (e.w / 3),
                      0.4 +
                        Math.floor(k / 3) * 0.5 +
                        random(`wy${i}${k}`) * e.h * 0.5,
                      z + 0.21,
                    ]}
                  >
                    <planeGeometry args={[0.1, 0.14]} />
                    <meshBasicMaterial
                      color={random(`wc${i}${k}`) > 0.3 ? "#ffcf6a" : "#9fd0ff"}
                    />
                  </mesh>
                ),
              )
            : null}
        </group>
      ))}
    </group>
  );
};

const Gente = ({
  x0,
  z,
  n,
}: {
  readonly x0: number;
  readonly z: number;
  readonly n: number;
}) => (
  <group>
    {Array.from({ length: n }).map((_, i) => (
      <group
        key={i}
        position={[
          x0 + i * 0.55 + random(`gx${i}`) * 0.2,
          0,
          z - random(`gz${i}`) * 0.6,
        ]}
      >
        <mesh position={[0, 0.7, 0]}>
          <capsuleGeometry args={[0.2, 0.7, 6, 12]} />
          <meshStandardMaterial color="#2a2a38" roughness={0.9} />
        </mesh>
        <mesh position={[0, 1.55, 0]}>
          <sphereGeometry args={[0.28, 20, 16]} />
          <meshStandardMaterial
            color={
              ["#c0392b", "#f1c40f", "#8e44ad", "#27ae60", "#e67e22"][i % 5]
            }
            roughness={0.6}
          />
        </mesh>
      </group>
    ))}
  </group>
);

const Cocina = ({ luz }: { readonly luz: EscenaCap["luz"] }) => {
  const dia = luz === "dia";
  const pared = dia ? "#e9cfa6" : luz === "oscuro" ? "#2a1f28" : "#5a3d4c";
  return (
    <group>
      <mesh position={[0, 3, -2.2]}>
        <planeGeometry args={[14, 8]} />
        <meshStandardMaterial color={pared} roughness={0.95} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 1]}>
        <planeGeometry args={[14, 8]} />
        <meshStandardMaterial map={texMadera()} roughness={0.7} />
      </mesh>
      {/* Ventana */}
      <mesh position={[0, 2.7, -2.19]}>
        <planeGeometry args={[2.4, 2.2]} />
        <meshBasicMaterial
          map={texCielo(
            dia ? "#6fbff0" : "#0c1238",
            dia ? "#d7f0ff" : "#3a2a6a",
          )}
        />
      </mesh>
      <group position={[0, 1.6, -2.18]} scale={0.35}>
        <Edificios z={0} noche={!dia} n={9} />
      </group>
      <mesh position={[0.7, 3.4, -2.17]}>
        <circleGeometry args={[0.2, 24]} />
        <meshBasicMaterial color={dia ? "#ffe27a" : "#f4efd2"} />
      </mesh>
      {[
        [0, 3.8, 2.5, 0.12],
        [0, 1.6, 2.5, 0.12],
        [-1.2, 2.7, 0.12, 2.3],
        [1.2, 2.7, 0.12, 2.3],
        [0, 2.7, 0.08, 2.2],
      ].map(([x, y, w, h], i) => (
        <mesh key={i} position={[x, y, -2.15]}>
          <boxGeometry args={[w, h, 0.1]} />
          <meshStandardMaterial color="#3a2a22" roughness={0.6} />
        </mesh>
      ))}
      {/* Repisas con frascos */}
      {[2.1, 2.8].map((y) => (
        <group key={y}>
          <mesh position={[-2.4, y, -2]}>
            <boxGeometry args={[1.4, 0.06, 0.35]} />
            <meshStandardMaterial color="#6b4630" />
          </mesh>
          {[0, 1, 2, 3].map((i) => (
            <mesh key={i} position={[-2.9 + i * 0.32, y + 0.15, -1.95]}>
              <cylinderGeometry args={[0.09, 0.09, 0.25, 16]} />
              <meshPhysicalMaterial
                color={["#ff9fc0", "#ffd24a", "#8fd38f", "#ffb36b"][i]}
                roughness={0.15}
                transmission={0.2}
              />
            </mesh>
          ))}
        </group>
      ))}
      {/* Mesada con licuadora */}
      <mesh position={[2.6, 0.5, -1.3]}>
        <boxGeometry args={[1.6, 1, 0.8]} />
        <meshStandardMaterial color="#7a5238" roughness={0.6} />
      </mesh>
      <mesh position={[2.3, 1.22, -1.3]}>
        <cylinderGeometry args={[0.16, 0.12, 0.42, 20]} />
        <meshPhysicalMaterial
          color="#d9ecff"
          transparent
          opacity={0.5}
          roughness={0.05}
        />
      </mesh>
      <mesh position={[2.3, 1.04, -1.3]}>
        <cylinderGeometry args={[0.14, 0.11, 0.2, 20]} />
        <meshStandardMaterial color="#ff4f86" />
      </mesh>
      {/* Lámpara colgante */}
      <mesh position={[0, 4.2, -0.6]}>
        <cylinderGeometry args={[0.01, 0.01, 1.2, 6]} />
        <meshStandardMaterial color="#222" />
      </mesh>
      <mesh position={[0, 3.55, -0.6]}>
        <coneGeometry args={[0.35, 0.3, 24, 1, true]} />
        <meshStandardMaterial
          color="#c98a4b"
          side={DoubleSide}
          emissive="#ffb067"
          emissiveIntensity={luz === "oscuro" ? 0.05 : 0.5}
        />
      </mesh>
      <pointLight
        position={[0, 3.3, -0.4]}
        color="#ffc27a"
        intensity={luz === "oscuro" ? 0.5 : dia ? 3 : 9}
        distance={9}
        decay={1.6}
        castShadow
      />
      <ambientLight
        color={dia ? "#fff1dd" : "#6a5a9a"}
        intensity={dia ? 1.1 : luz === "oscuro" ? 0.15 : 0.45}
      />
      {dia ? (
        <directionalLight
          position={[1, 4, 3]}
          color="#fff4e0"
          intensity={1.8}
        />
      ) : null}
      {luz === "oscuro" ? (
        <pointLight
          position={[0.3, 1.9, 0.8]}
          color="#6f8dff"
          intensity={3}
          distance={3}
        />
      ) : null}
      <directionalLight
        position={[-3, 3, 4]}
        color={dia ? "#cfe3ff" : "#8a9cff"}
        intensity={dia ? 0.6 : 0.5}
      />
    </group>
  );
};

const Calle = ({
  luz,
  letrero,
  fila,
}: {
  readonly luz: EscenaCap["luz"];
  readonly letrero?: string;
  readonly fila?: boolean;
}) => {
  const noche = luz !== "dia";
  const cerrado = letrero === "CERRADO";
  const cartel = texTexto(
    letrero ?? "",
    cerrado ? "#5a1a1a" : "#2f9e6b",
    "#ffffff",
    1024,
    256,
    112,
  );
  return (
    <group>
      <mesh position={[0, 6, -12]}>
        <planeGeometry args={[40, 16]} />
        <meshBasicMaterial
          map={texCielo(
            noche ? "#0b0e2e" : "#5fb3ea",
            noche ? "#2a2156" : "#cfeaff",
          )}
        />
      </mesh>
      <Edificios z={-9} noche={noche} />
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[30, 20]} />
        <meshStandardMaterial
          color={noche ? "#26262f" : "#a7a7b0"}
          roughness={0.85}
        />
      </mesh>
      {/* Puesto */}
      <group position={[0, 0, -1.6]}>
        <mesh position={[0, 1.3, -0.4]}>
          <boxGeometry args={[3.6, 2.6, 0.2]} />
          <meshStandardMaterial
            color={noche ? "#3d2c33" : "#f3e2c4"}
            roughness={0.9}
          />
        </mesh>
        <mesh position={[0, 0.55, 0.15]}>
          <boxGeometry args={[3.6, 1.1, 0.7]} />
          <meshStandardMaterial
            color={noche ? "#4a3238" : "#c98a5a"}
            roughness={0.7}
          />
        </mesh>
        <mesh
          position={[0, 2.75, 0.45]}
          rotation={[cerrado ? 0.2 : 0.75, 0, 0]}
        >
          <planeGeometry args={[3.8, cerrado ? 1.8 : 1.2]} />
          <meshStandardMaterial
            map={texRayas(cerrado ? "#7a2a2a" : "#ff5c8a", "#ffffff")}
            side={DoubleSide}
          />
        </mesh>
        <mesh position={[0, 3.55, -0.2]}>
          <boxGeometry args={[2.2, 0.55, 0.12]} />
          <meshStandardMaterial
            map={cartel}
            emissive={noche ? "#ffffff" : "#000"}
            emissiveMap={noche ? cartel : undefined}
            emissiveIntensity={noche ? 0.35 : 0}
          />
        </mesh>
        {!cerrado
          ? [0, 1, 2, 3, 4].map((i) => (
              <mesh key={i} position={[-1.2 + i * 0.6, 1.2, 0.2]}>
                <cylinderGeometry args={[0.07, 0.055, 0.2, 16]} />
                <meshStandardMaterial color="#ff4f86" />
              </mesh>
            ))
          : null}
      </group>
      {fila ? <Gente x0={2.3} z={-1.2} n={4} /> : null}
      <hemisphereLight
        args={[
          noche ? "#5a6aff" : "#ffffff",
          noche ? "#1a1420" : "#a08060",
          noche ? 0.5 : 1.0,
        ]}
      />
      <directionalLight
        position={[3, 6, 4]}
        color={noche ? "#9fb0ff" : "#fff2d8"}
        intensity={noche ? 0.6 : 2.2}
        castShadow
      />
      {noche ? (
        <pointLight
          position={[0, 3.2, 0.6]}
          color="#ffcf8a"
          intensity={4}
          distance={6}
        />
      ) : null}
    </group>
  );
};

const Lujo = ({
  letrero,
  frame,
}: {
  readonly letrero?: string;
  readonly frame: number;
}) => {
  const cartel = texTexto(
    `${letrero ?? ""}`,
    "#0a1a14",
    "#ffd24a",
    1024,
    256,
    112,
  );
  const confeti = useMemo(
    () =>
      Array.from({ length: 70 }).map((_, i) => ({
        x: (random(`kx${i}`) - 0.5) * 6,
        y: random(`ky${i}`) * 5,
        z: random(`kz${i}`) * 3 - 1.5,
        c: ["#ffd24a", "#ff5c8a", "#ffffff"][i % 3],
        v: 0.01 + random(`kv${i}`) * 0.015,
      })),
    [],
  );
  return (
    <group>
      <mesh position={[0, 3, -3]}>
        <planeGeometry args={[16, 8]} />
        <meshStandardMaterial color="#0f2a20" roughness={0.6} />
      </mesh>
      {[-3, -1.5, 1.5, 3].map((x) => (
        <mesh key={x} position={[x, 2, -2.8]}>
          <cylinderGeometry args={[0.12, 0.14, 4, 24]} />
          <meshStandardMaterial
            color="#d4a63a"
            metalness={0.9}
            roughness={0.25}
          />
        </mesh>
      ))}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[20, 12]} />
        <meshStandardMaterial
          color="#1a120e"
          roughness={0.25}
          metalness={0.4}
        />
      </mesh>
      <mesh position={[0, 3.4, -2.9]}>
        <boxGeometry args={[3.4, 0.8, 0.1]} />
        <meshStandardMaterial
          map={cartel}
          emissiveMap={cartel}
          emissive="#ffffff"
          emissiveIntensity={0.9}
        />
      </mesh>
      {[-1.6, 1.6].map((x) => (
        <group key={x} position={[x, 4.3, -0.8]}>
          <mesh>
            <sphereGeometry args={[0.28, 24, 16]} />
            <meshStandardMaterial
              color="#fff2c0"
              emissive="#ffe08a"
              emissiveIntensity={1.4}
            />
          </mesh>
          <pointLight color="#ffd98a" intensity={6} distance={7} decay={1.6} />
        </group>
      ))}
      <Gente x0={-3} z={-2.2} n={11} />
      {confeti.map((k, i) => (
        <mesh
          key={i}
          position={[k.x, (((k.y - frame * k.v) % 5) + 5) % 5, k.z]}
          rotation={[frame * 0.1 + i, frame * 0.07, i]}
        >
          <planeGeometry args={[0.05, 0.08]} />
          <meshBasicMaterial color={k.c} side={DoubleSide} />
        </mesh>
      ))}
      <ambientLight color="#7aa08a" intensity={0.35} />
      <spotLight
        position={[0, 5, 3]}
        angle={0.7}
        penumbra={0.6}
        intensity={20}
        color="#fff1cf"
        distance={14}
        decay={1.4}
      />
    </group>
  );
};

const Lluvia = ({ frame }: { readonly frame: number }) => {
  const gotas = useMemo(
    () =>
      Array.from({ length: 160 }).map((_, i) => ({
        x: (random(`lx${i}`) - 0.5) * 6,
        y: random(`ly${i}`) * 5,
        z: random(`lz${i}`) * 4 - 1,
      })),
    [],
  );
  const cartel = texTexto("BATIDOS PIÑA", "#ffcf6a", "#5a3a00", 1024, 200, 110);
  return (
    <group>
      <mesh position={[0, 4, -6]}>
        <planeGeometry args={[20, 10]} />
        <meshBasicMaterial map={texCielo("#05081e", "#1a1f48")} />
      </mesh>
      <Edificios z={-5} noche n={10} color="#11163a" />
      <mesh position={[1.6, 2, -2]}>
        <boxGeometry args={[3, 4, 0.2]} />
        <meshStandardMaterial color="#1c1a2e" />
      </mesh>
      <mesh position={[1.6, 1.9, -1.89]}>
        <planeGeometry args={[2.2, 2.2]} />
        <meshStandardMaterial
          color="#ffcf6a"
          emissive="#ffb347"
          emissiveIntensity={1.2}
        />
      </mesh>
      <mesh position={[1.6, 3.4, -1.88]}>
        <planeGeometry args={[2.4, 0.45]} />
        <meshStandardMaterial
          map={cartel}
          emissiveMap={cartel}
          emissive="#ffffff"
          emissiveIntensity={0.8}
        />
      </mesh>
      {[1.0, 1.6, 2.2].map((x, i) => (
        <group key={x} position={[x, 0.9 + (i % 2) * 0.05, -1.87]}>
          <mesh position={[0, 0.5, 0]}>
            <capsuleGeometry args={[0.18, 0.5, 6, 12]} />
            <meshBasicMaterial color="#6a3c08" />
          </mesh>
          <mesh position={[0, 1.15, 0]}>
            <sphereGeometry args={[0.24, 16, 12]} />
            <meshBasicMaterial color="#8a5210" />
          </mesh>
        </group>
      ))}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[20, 12]} />
        <meshStandardMaterial
          color="#10142a"
          roughness={0.08}
          metalness={0.7}
        />
      </mesh>
      <pointLight
        position={[1.6, 2, -1.2]}
        color="#ffb347"
        intensity={5}
        distance={6}
      />
      <ambientLight color="#3a4aa0" intensity={0.35} />
      <directionalLight position={[-2, 4, 3]} color="#7f9cff" intensity={0.7} />
      {gotas.map((g, i) => (
        <mesh
          key={i}
          position={[g.x, (((g.y - frame * 0.18) % 5) + 5) % 5, g.z]}
        >
          <boxGeometry args={[0.006, 0.18, 0.006]} />
          <meshBasicMaterial color="#9fc6ff" transparent opacity={0.6} />
        </mesh>
      ))}
    </group>
  );
};

const Final = () => (
  <group>
    <mesh position={[0, 4, -5]}>
      <planeGeometry args={[20, 10]} />
      <meshBasicMaterial color="#05050a" />
    </mesh>
    <Edificios z={-4.5} noche n={10} color="#0c0b16" />
    <mesh rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[20, 12]} />
      <meshStandardMaterial color="#0e0c14" roughness={0.3} metalness={0.5} />
    </mesh>
    <spotLight
      position={[0, 6, 1.2]}
      angle={0.32}
      penumbra={0.5}
      intensity={60}
      color="#ffe9b0"
      distance={12}
      decay={1.2}
      castShadow
    />
    <ambientLight color="#2a2440" intensity={0.25} />
    <pointLight
      position={[-2, 2, 2]}
      color="#7f6cff"
      intensity={1.2}
      distance={6}
    />
  </group>
);

export const Set3D = ({
  e,
  frame,
}: {
  readonly e: EscenaCap;
  readonly frame: number;
}) => {
  switch (e.fondo) {
    case "cocina":
      return <Cocina luz={e.luz} />;
    case "calle":
      return <Calle luz={e.luz} letrero={e.letrero} fila={e.fila} />;
    case "lujo":
      return <Lujo letrero={e.letrero} frame={frame} />;
    case "lluvia":
      return <Lluvia frame={frame} />;
    default:
      return <Final />;
  }
};
