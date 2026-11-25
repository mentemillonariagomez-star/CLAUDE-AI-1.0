import { useMemo } from "react";
import { DoubleSide, Vector2 } from "three";
import type { Expr, PoseF, Prop, Quien } from "../Telenovela/tipos";
import { texCoco, texFresa, texPina, texTexto } from "./texturas";

type V3 = [number, number, number];
const PIEL: Record<Quien, string> = {
  coco: "#8a5a3a",
  fresa: "#d9433f",
  pina: "#e2a22d",
};
const ROPA: Record<
  string,
  {
    camisa: string;
    pantalon: string;
    extra?: "delantal" | "traje" | "vestido" | "cadena";
  }
> = {
  coco: { camisa: "#f1ede4", pantalon: "#4e3b2c", extra: "delantal" },
  "coco-traje": { camisa: "#24242e", pantalon: "#1c1c24", extra: "traje" },
  fresa: { camisa: "#f7a1c0", pantalon: "#3b5998" },
  "fresa-dorado": { camisa: "#d9a933", pantalon: "#1a1a1a", extra: "vestido" },
  pina: { camisa: "#17171d", pantalon: "#121217", extra: "cadena" },
  "pina-traje": { camisa: "#17171d", pantalon: "#121217", extra: "cadena" },
};

const M = ({
  c,
  r = 0.6,
  m = 0,
  e,
  ei = 1,
  t,
  op,
}: {
  readonly c: string;
  readonly r?: number;
  readonly m?: number;
  readonly e?: string;
  readonly ei?: number;
  readonly t?: boolean;
  readonly op?: number;
}) => (
  <meshStandardMaterial
    color={c}
    roughness={r}
    metalness={m}
    emissive={e ?? "#000"}
    emissiveIntensity={e ? ei : 0}
    transparent={t}
    opacity={op ?? 1}
  />
);

export const Objeto3D = ({ prop }: { readonly prop: Prop }) => {
  const etiqueta = useMemo(
    () =>
      prop === "cuaderno"
        ? texTexto("RECETA", "#f4e3c2", "#7a3e1d", 512, 160, 96)
        : null,
    [prop],
  );
  switch (prop) {
    case "vaso":
      return (
        <group position={[0, 0.12, 0.05]}>
          <mesh>
            <cylinderGeometry args={[0.075, 0.058, 0.22, 24]} />
            <meshPhysicalMaterial
              color="#ffffff"
              transparent
              opacity={0.3}
              roughness={0.05}
            />
          </mesh>
          <mesh position={[0, -0.02, 0]}>
            <cylinderGeometry args={[0.068, 0.054, 0.16, 24]} />
            <M c="#ff4f86" r={0.3} />
          </mesh>
          <mesh position={[0, 0.07, 0]}>
            <cylinderGeometry args={[0.07, 0.068, 0.03, 24]} />
            <M c="#ffe0ea" />
          </mesh>
          <mesh position={[0.03, 0.15, 0]} rotation={[0, 0, -0.25]}>
            <cylinderGeometry args={[0.008, 0.008, 0.22, 8]} />
            <M c="#2fb5a6" />
          </mesh>
        </group>
      );
    case "cuaderno":
      return (
        <group position={[0, 0.05, 0.06]} rotation={[0.2, 0, -0.1]}>
          <mesh>
            <boxGeometry args={[0.22, 0.29, 0.04]} />
            <M c="#7a3e1d" r={0.8} />
          </mesh>
          <mesh position={[0, 0.04, 0.021]}>
            <planeGeometry args={[0.17, 0.055]} />
            <meshStandardMaterial map={etiqueta ?? undefined} />
          </mesh>
        </group>
      );
    case "maletin":
      return (
        <group position={[0, -0.18, 0.04]}>
          <mesh>
            <boxGeometry args={[0.46, 0.32, 0.11]} />
            <M c="#16161b" r={0.35} m={0.3} />
          </mesh>
          <mesh position={[0, 0.0, 0.056]}>
            <boxGeometry args={[0.46, 0.025, 0.005]} />
            <M c="#d9ad3c" m={0.9} r={0.25} />
          </mesh>
          <mesh position={[0, 0.19, 0]}>
            <torusGeometry args={[0.06, 0.014, 8, 16, Math.PI]} />
            <M c="#16161b" />
          </mesh>
          <mesh position={[-0.1, 0.17, 0.02]} rotation={[0, 0, 0.2]}>
            <boxGeometry args={[0.16, 0.06, 0.01]} />
            <M c="#4caf50" />
          </mesh>
        </group>
      );
    case "nota":
      return (
        <mesh position={[0, 0.06, 0.06]} rotation={[0.3, 0, 0.1]}>
          <planeGeometry args={[0.16, 0.21]} />
          <meshStandardMaterial color="#fffdf3" side={DoubleSide} />
        </mesh>
      );
    default:
      return (
        <group>
          <mesh>
            <boxGeometry args={[0.075, 0.15, 0.014]} />
            <M c="#111" r={0.3} />
          </mesh>
          <mesh position={[0, 0, 0.008]}>
            <planeGeometry args={[0.065, 0.13]} />
            <M c="#2a5bd7" e="#3a6bff" ei={0.8} />
          </mesh>
        </group>
      );
  }
};

// Brazo de dos segmentos: rotación del hombro y del codo.
const Brazo = ({
  lado,
  hombro,
  codo,
  manga,
  piel,
  objeto,
}: {
  readonly lado: number;
  readonly hombro: V3;
  readonly codo: V3;
  readonly manga: string;
  readonly piel: string;
  readonly objeto?: React.ReactNode;
}) => (
  <group position={[lado * 0.34, 1.38, 0]} rotation={hombro}>
    <mesh position={[0, -0.18, 0]}>
      <capsuleGeometry args={[0.075, 0.24, 8, 16]} />
      <M c={manga} r={0.8} />
    </mesh>
    <group position={[0, -0.38, 0]} rotation={codo}>
      <mesh position={[0, -0.16, 0]}>
        <capsuleGeometry args={[0.066, 0.22, 8, 16]} />
        <M c={manga} r={0.8} />
      </mesh>
      <mesh position={[0, -0.36, 0]}>
        <sphereGeometry args={[0.078, 20, 16]} />
        <M c={piel} r={0.55} />
      </mesh>
      {objeto ? <group position={[0, -0.4, 0]}>{objeto}</group> : null}
    </group>
  </group>
);

const POSES: Record<PoseF, { a: [V3, V3]; b: [V3, V3] }> = {
  normal: {
    a: [
      [0, 0, -0.12],
      [-0.15, 0, 0],
    ],
    b: [
      [0, 0, 0.12],
      [-0.15, 0, 0],
    ],
  },
  cruzados: {
    a: [
      [-0.55, 0, -0.35],
      [-1.45, 0, 1.05],
    ],
    b: [
      [-0.5, 0, 0.35],
      [-1.45, 0, -1.05],
    ],
  },
  sostiene: {
    a: [
      [0, 0, -0.12],
      [-0.15, 0, 0],
    ],
    b: [
      [-0.35, 0, 0.12],
      [-1.35, 0, 0],
    ],
  },
  celebra: {
    a: [
      [0, 0, -2.6],
      [0, 0, -0.25],
    ],
    b: [
      [0, 0, 2.6],
      [0, 0, 0.25],
    ],
  },
  llamada: {
    a: [
      [-0.3, 0, -0.1],
      [-1.2, 0, 0],
    ],
    b: [
      [0, 0, 2.2],
      [0, 0, 1.75],
    ],
  },
  cabeza: {
    a: [
      [0, 0, -0.12],
      [-0.15, 0, 0],
    ],
    b: [
      [-0.2, 0, 2.45],
      [0, 0, 1.55],
    ],
  },
};

// Rasgos de la cara colocados sobre la superficie (radio R al frente).
const Cara = ({
  quien,
  expr,
  boca,
  parpado,
  brillo,
  frame,
  R,
}: {
  readonly quien: Quien;
  readonly expr: Expr;
  readonly boca: number;
  readonly parpado: boolean;
  readonly brillo: boolean;
  readonly frame: number;
  readonly R: number;
}) => {
  const z = (x: number, y: number) =>
    Math.sqrt(Math.max(0.0001, R * R - x * x - y * y));
  const piel = PIEL[quien];
  const tapas: Partial<Record<Expr, [number, number]>> = {
    normal: [0.32, 0],
    feliz: [0.3, 0],
    orgullo: [0.5, 0],
    tierno: [0.42, -0.15],
    sorprendido: [0.18, 0],
    ambicion: [0.36, 0.15],
    malvado: [0.52, 0.32],
    enojado: [0.48, 0.4],
    triste: [0.42, -0.35],
    llorando: [0.46, -0.35],
    astuto: [0.55, 0.2],
    decidido: [0.5, 0.3],
  };
  const [frac, incl] = parpado ? [1, 0] : (tapas[expr] ?? [0.32, 0]);
  const cejas: Record<Expr, [number, number]> = {
    normal: [0, 0],
    feliz: [0.02, 0],
    orgullo: [0, -0.1],
    tierno: [0.02, -0.25],
    sorprendido: [0.06, 0],
    ambicion: [0.01, 0.2],
    malvado: [-0.01, 0.4],
    enojado: [-0.02, 0.55],
    triste: [0.02, -0.45],
    llorando: [0.02, -0.45],
    astuto: [0.03, 0.3],
    decidido: [-0.01, 0.4],
  };
  const [alza, giro] = cejas[expr];
  const grande = expr === "sorprendido" ? 1.12 : 1;
  const iris =
    quien === "pina" ? "#3a2510" : quien === "fresa" ? "#4a2a1a" : "#2e1c10";
  const brilla = brillo || expr === "ambicion";
  const colorBrillo =
    expr === "ambicion" ? "#3dff6a" : quien === "coco" ? "#ffb21a" : "#7cff5a";
  const my = -0.15;
  const habla = boca > 0.08;
  return (
    <group>
      {[-1, 1].map((s) => {
        const ex = s * 0.125,
          ey = 0.04;
        return (
          <group key={s} position={[ex, ey, z(ex, ey) - 0.045]} scale={grande}>
            <mesh>
              <sphereGeometry args={[0.088, 32, 24]} />
              <M c="#fbfbf7" r={0.25} />
            </mesh>
            <mesh position={[s * -0.008, -0.004, 0.06]}>
              <sphereGeometry args={[0.048, 24, 16]} />
              <M
                c={brilla ? colorBrillo : iris}
                r={0.3}
                e={brilla ? colorBrillo : undefined}
                ei={1.6}
              />
            </mesh>
            <mesh position={[s * -0.008, -0.004, 0.082]}>
              <sphereGeometry args={[0.029, 20, 14]} />
              <M c="#0b0b0b" r={0.15} />
            </mesh>
            <mesh position={[0.018, 0.022, 0.093]}>
              <sphereGeometry args={[0.012, 12, 8]} />
              <M c="#ffffff" e="#ffffff" ei={0.6} />
            </mesh>
            <mesh rotation={[0.15, 0, s * incl]}>
              <sphereGeometry
                args={[0.094, 32, 16, 0, Math.PI * 2, 0, Math.PI * frac]}
              />
              <M c={piel} r={0.6} />
            </mesh>
            {quien === "fresa" && frac < 0.9 ? (
              <mesh
                position={[s * 0.075, 0.06, 0.03]}
                rotation={[0, 0, s * -0.9]}
              >
                <capsuleGeometry args={[0.008, 0.05, 4, 8]} />
                <M c="#140a0a" />
              </mesh>
            ) : null}
            {expr === "llorando" ? (
              <mesh
                position={[
                  s * 0.02,
                  -0.1 - ((frame + (s > 0 ? 10 : 0)) % 36) * 0.006,
                  0.07,
                ]}
              >
                <sphereGeometry args={[0.018, 12, 10]} />
                <meshPhysicalMaterial
                  color="#9fd8ff"
                  transparent
                  opacity={0.85}
                  roughness={0.05}
                />
              </mesh>
            ) : null}
          </group>
        );
      })}
      {/* Cejas */}
      {[-1, 1].map((s) => {
        const bx = s * 0.13,
          by = 0.16 + alza;
        return (
          <mesh
            key={s}
            position={[bx, by, z(bx, by) + 0.005]}
            rotation={[0, 0, Math.PI / 2 + s * giro]}
          >
            <capsuleGeometry args={[0.02, 0.1, 6, 12]} />
            <M c={quien === "coco" ? "#2a1608" : "#1a0e0e"} r={0.9} />
          </mesh>
        );
      })}
      {/* Mejillas */}
      {expr === "feliz" || expr === "tierno" || quien === "fresa"
        ? [-1, 1].map((s) => (
            <mesh
              key={s}
              position={[s * 0.2, -0.07, z(0.2, -0.07) - 0.01]}
              scale={[1, 0.6, 0.3]}
            >
              <sphereGeometry args={[0.055, 16, 12]} />
              <M c="#ff6f8f" t op={0.45} />
            </mesh>
          ))
        : null}
      {/* Boca */}
      <group position={[0.01, my, z(0.01, my) - 0.01]}>
        {habla ? (
          <>
            <mesh scale={[1, 0.18 + boca * 0.85, 0.45]}>
              <sphereGeometry args={[0.085, 24, 16]} />
              <M c="#3a0c12" r={0.7} />
            </mesh>
            <mesh
              position={[0, -0.03 * boca, 0.01]}
              scale={[0.6, 0.1 + boca * 0.3, 0.4]}
            >
              <sphereGeometry args={[0.07, 16, 12]} />
              <M c="#e8606a" />
            </mesh>
          </>
        ) : expr === "feliz" ? (
          <mesh rotation={[0, 0, 0]}>
            <circleGeometry args={[0.085, 24, Math.PI, Math.PI]} />
            <M c="#3a0c12" />
          </mesh>
        ) : expr === "sorprendido" ? (
          <mesh scale={[0.55, 0.7, 0.4]}>
            <sphereGeometry args={[0.07, 20, 14]} />
            <M c="#3a0c12" />
          </mesh>
        ) : expr === "decidido" ? (
          <mesh rotation={[0, 0, Math.PI / 2 + 0.06]}>
            <capsuleGeometry args={[0.012, 0.09, 4, 8]} />
            <M c="#2a0a0a" />
          </mesh>
        ) : (
          <mesh
            position={[
              expr === "malvado" || expr === "astuto" || expr === "ambicion"
                ? 0.02
                : 0,
              expr === "triste" || expr === "llorando" || expr === "enojado"
                ? -0.04
                : 0.02,
              0,
            ]}
            rotation={[
              0,
              0,
              expr === "triste" || expr === "llorando" || expr === "enojado"
                ? Math.PI / 2 - 0.9
                : expr === "malvado" || expr === "astuto" || expr === "ambicion"
                  ? -Math.PI / 2 - 0.9 + 0.35
                  : -Math.PI / 2 - 0.9,
            ]}
          >
            <torusGeometry args={[0.07, 0.013, 8, 24, 1.8]} />
            <M c="#2a0a0a" />
          </mesh>
        )}
      </group>
      {brilla && quien === "coco" ? (
        <pointLight
          position={[0, 0.05, 0.3]}
          color={colorBrillo}
          intensity={0.6}
          distance={0.8}
        />
      ) : null}
    </group>
  );
};

const Cabeza = ({ quien }: { readonly quien: Quien }) => {
  const perfil = useMemo(
    () =>
      [
        [0, -0.42],
        [0.12, -0.37],
        [0.25, -0.24],
        [0.34, -0.04],
        [0.37, 0.1],
        [0.35, 0.24],
        [0.26, 0.35],
        [0.12, 0.41],
        [0, 0.42],
      ].map(([x, y]) => new Vector2(x, y)),
    [],
  );
  if (quien === "coco") {
    return (
      <group>
        <mesh>
          <sphereGeometry args={[0.36, 64, 48]} />
          <meshStandardMaterial
            map={texCoco()}
            bumpMap={texCoco()}
            bumpScale={4}
            roughness={0.95}
          />
        </mesh>
        {[-0.08, 0, 0.07].map((x, i) => (
          <mesh key={i} position={[x, 0.37, 0]} rotation={[0, 0, -x * 4]}>
            <cylinderGeometry args={[0.012, 0.004, 0.12, 6]} />
            <M c="#4a2a12" />
          </mesh>
        ))}
      </group>
    );
  }
  if (quien === "fresa") {
    return (
      <group>
        <mesh position={[0, 0.05, -0.09]} scale={[1.08, 1.02, 0.95]}>
          <sphereGeometry args={[0.37, 40, 32]} />
          <M c="#24151c" r={0.55} />
        </mesh>
        <mesh position={[0, -0.42, -0.16]} scale={[1.05, 1, 0.55]}>
          <capsuleGeometry args={[0.3, 0.42, 8, 24]} />
          <M c="#24151c" r={0.55} />
        </mesh>
        <mesh>
          <latheGeometry args={[perfil, 64]} />
          <meshStandardMaterial
            map={texFresa()}
            bumpMap={texFresa()}
            bumpScale={2}
            roughness={0.45}
          />
        </mesh>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <mesh
            key={i}
            position={[
              Math.cos((i / 6) * Math.PI * 2) * 0.1,
              0.43,
              Math.sin((i / 6) * Math.PI * 2) * 0.1,
            ]}
            rotation={[
              Math.sin((i / 6) * Math.PI * 2) * 1.1,
              0,
              -Math.cos((i / 6) * Math.PI * 2) * 1.1,
            ]}
            scale={[1.6, 1, 0.35]}
          >
            <coneGeometry args={[0.06, 0.24, 12]} />
            <M c={i % 2 ? "#2f9e4c" : "#3fbf5e"} r={0.6} />
          </mesh>
        ))}
      </group>
    );
  }
  return (
    <group>
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <mesh
          key={i}
          position={[0, 0.4, 0]}
          rotation={[Math.sin(i) * 0.25, (i / 7) * Math.PI * 2, (i - 3) * 0.17]}
        >
          <group position={[0, 0.25, 0]}>
            <mesh scale={[1.8, 1, 0.3]}>
              <coneGeometry args={[0.05, 0.55, 10]} />
              <M c={i % 2 ? "#2f8a44" : "#3faa55"} r={0.5} />
            </mesh>
          </group>
        </mesh>
      ))}
      <mesh scale={[0.34, 0.42, 0.34]}>
        <sphereGeometry args={[1, 64, 48]} />
        <meshStandardMaterial
          map={texPina()}
          bumpMap={texPina()}
          bumpScale={5}
          roughness={0.6}
        />
      </mesh>
    </group>
  );
};

export const Fruta3D = ({
  quien,
  x,
  rotY,
  ropa,
  expr,
  pose,
  prop,
  brillo,
  boca,
  frame,
}: {
  readonly quien: Quien;
  readonly x: number;
  readonly rotY: number;
  readonly ropa?: string;
  readonly expr: Expr;
  readonly pose: PoseF;
  readonly prop?: Prop;
  readonly brillo: boolean;
  readonly boca: number;
  readonly frame: number;
}) => {
  const r = ROPA[ropa ? `${quien}-${ropa}` : quien] ?? ROPA[quien];
  const piel = PIEL[quien];
  const resp = Math.sin(frame / 20 + x * 3) * 0.008;
  const parpado = (frame + Math.round(x * 50)) % 115 < 4;
  const habla = boca > 0.08;
  const cabezaRot: V3 = [
    habla ? Math.sin(frame / 6) * 0.03 : 0,
    Math.sin(frame / 50 + x) * 0.05,
    habla ? Math.sin(frame / 9) * 0.02 : 0,
  ];
  const P = POSES[pose];
  const manga = r.extra === "vestido" ? piel : r.camisa;
  const objetoB =
    prop && pose !== "llamada" ? (
      <Objeto3D prop={prop} />
    ) : pose === "llamada" ? (
      <Objeto3D prop="telefono" />
    ) : undefined;
  const objetoA =
    prop && pose === "llamada" ? <Objeto3D prop={prop} /> : undefined;
  const R = quien === "pina" ? 0.34 : 0.36;
  return (
    <group position={[x, 0, 0]} rotation={[0, rotY, 0]}>
      <mesh position={[0, 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.42, 32]} />
        <meshBasicMaterial color="black" transparent opacity={0.3} />
      </mesh>
      {/* Piernas y zapatos */}
      {[-1, 1].map((s) => (
        <group key={s}>
          <mesh position={[s * 0.13, 0.43, 0]}>
            <capsuleGeometry
              args={[r.extra === "vestido" ? 0.07 : 0.1, 0.56, 8, 16]}
            />
            <M c={r.extra === "vestido" ? piel : r.pantalon} r={0.85} />
          </mesh>
          <mesh position={[s * 0.13, 0.06, 0.05]} scale={[1, 0.6, 1.5]}>
            <sphereGeometry args={[0.11, 20, 14]} />
            <M c="#141014" r={0.4} />
          </mesh>
        </group>
      ))}
      <group position={[0, resp, 0]}>
        {/* Torso */}
        <mesh position={[0, 1.1, 0]} scale={[1.12, 1, 0.78]}>
          <capsuleGeometry args={[0.26, 0.42, 12, 32]} />
          <M c={r.camisa} r={0.75} m={r.extra === "vestido" ? 0.6 : 0} />
        </mesh>
        {r.extra === "vestido" ? (
          <mesh position={[0, 0.72, 0]}>
            <cylinderGeometry args={[0.27, 0.5, 0.62, 40, 1, true]} />
            <meshStandardMaterial
              color="#d9a933"
              metalness={0.65}
              roughness={0.3}
              side={DoubleSide}
            />
          </mesh>
        ) : null}
        {r.extra === "delantal" ? (
          <group>
            <mesh position={[0, 0.97, 0.205]} rotation={[-0.06, 0, 0]}>
              <boxGeometry args={[0.44, 0.62, 0.02]} />
              <M c="#2f9e6b" r={0.8} />
            </mesh>
            {[-1, 1].map((s) => (
              <mesh
                key={s}
                position={[s * 0.14, 1.36, 0.17]}
                rotation={[0.3, 0, s * 0.15]}
              >
                <boxGeometry args={[0.04, 0.24, 0.02]} />
                <M c="#2f9e6b" />
              </mesh>
            ))}
            <mesh position={[0, 0.92, 0.218]}>
              <boxGeometry args={[0.16, 0.1, 0.02]} />
              <M c="#27845a" />
            </mesh>
          </group>
        ) : null}
        {r.extra === "traje" || r.extra === "cadena" ? (
          <group>
            <mesh position={[0, 1.28, 0.2]} rotation={[-0.15, 0, Math.PI]}>
              <coneGeometry args={[0.09, 0.32, 3]} />
              <M c={r.extra === "cadena" ? "#f4f4f4" : "#3a3a48"} />
            </mesh>
            {r.extra === "cadena" ? (
              <mesh position={[0, 1.27, 0.16]} rotation={[1.25, 0, 0]}>
                <torusGeometry args={[0.15, 0.014, 10, 40]} />
                <M c="#ffcf40" m={1} r={0.2} />
              </mesh>
            ) : null}
            {r.extra === "cadena" ? (
              <mesh position={[0, 1.14, 0.22]}>
                <sphereGeometry args={[0.035, 16, 12]} />
                <M c="#ffcf40" m={1} r={0.2} />
              </mesh>
            ) : null}
          </group>
        ) : null}
        <mesh position={[0, 1.5, 0]}>
          <cylinderGeometry args={[0.08, 0.09, 0.16, 20]} />
          <M c={piel} />
        </mesh>
        <Brazo
          lado={-1}
          hombro={P.a[0]}
          codo={P.a[1]}
          manga={manga}
          piel={piel}
          objeto={objetoA}
        />
        <Brazo
          lado={1}
          hombro={P.b[0]}
          codo={P.b[1]}
          manga={manga}
          piel={piel}
          objeto={objetoB}
        />
        <group position={[0, 1.9, 0]} rotation={cabezaRot}>
          <Cabeza quien={quien} />
          <Cara
            quien={quien}
            expr={expr}
            boca={boca}
            parpado={parpado}
            brillo={brillo}
            frame={frame}
            R={R}
          />
        </group>
      </group>
    </group>
  );
};
