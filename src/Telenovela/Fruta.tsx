import type { Expr, PoseF, Prop, Quien } from "./tipos";

// Personajes-fruta propios en 2D con contorno. Coordenadas locales: pies en (0,0), mirando a la derecha.
const L = "#2a1a1a";
const W = 6;
const PIEL: Record<Quien, string> = {
  coco: "#8a5a3a",
  fresa: "#e0433f",
  pina: "#e9ad2f",
};

type Ropa = {
  camisa: string;
  pantalon: string;
  extra?: "delantal" | "traje" | "vestido" | "cadena";
};
const ROPA: Record<string, Ropa> = {
  coco: { camisa: "#f4f1ea", pantalon: "#5b4636", extra: "delantal" },
  "coco-traje": { camisa: "#2c2c3a", pantalon: "#22222c", extra: "traje" },
  fresa: { camisa: "#ff9fc0", pantalon: "#3d5a99" },
  "fresa-dorado": { camisa: "#e8b93a", pantalon: "#1d1d1d", extra: "vestido" },
  pina: { camisa: "#18181f", pantalon: "#121217", extra: "cadena" },
  "pina-traje": { camisa: "#18181f", pantalon: "#121217", extra: "cadena" },
};

const Brazo = ({
  x1,
  y1,
  x2,
  y2,
  manga,
  piel,
}: {
  readonly x1: number;
  readonly y1: number;
  readonly x2: number;
  readonly y2: number;
  readonly manga: string;
  readonly piel: string;
}) => (
  <g strokeLinecap="round">
    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={L} strokeWidth={66} />
    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={manga} strokeWidth={54} />
    <circle cx={x2} cy={y2} r={30} fill={piel} stroke={L} strokeWidth={W} />
  </g>
);

export const Objeto = ({
  prop,
  x,
  y,
}: {
  readonly prop: Prop;
  readonly x: number;
  readonly y: number;
}) => {
  switch (prop) {
    case "vaso":
      return (
        <g transform={`translate(${x} ${y - 40})`}>
          <path
            d="M-38 -90 L38 -90 L30 40 L-30 40 Z"
            fill="#ffd6e4"
            stroke={L}
            strokeWidth={5}
          />
          <path d="M-35 -55 L35 -55 L30 40 L-30 40 Z" fill="#ff5c8a" />
          <ellipse cx={0} cy={-62} rx={36} ry={12} fill="#fff3f7" />
          <line
            x1={12}
            y1={-60}
            x2={34}
            y2={-140}
            stroke="#3fb6a8"
            strokeWidth={9}
            strokeLinecap="round"
          />
          <circle cx={-14} cy={-70} r={9} fill="#e8323f" />
        </g>
      );
    case "cuaderno":
      return (
        <g transform={`translate(${x - 10} ${y - 10}) rotate(-8)`}>
          <rect
            x={-60}
            y={-80}
            width={120}
            height={150}
            rx={8}
            fill="#7a3e1d"
            stroke={L}
            strokeWidth={5}
          />
          <rect x={-44} y={-50} width={88} height={34} rx={4} fill="#f4e3c2" />
          <text
            x={0}
            y={-25}
            textAnchor="middle"
            fontSize={20}
            fontWeight={900}
            fill="#7a3e1d"
          >
            RECETA
          </text>
        </g>
      );
    case "maletin":
      return (
        <g transform={`translate(${x} ${y + 20})`}>
          <path
            d="M-30 -40 Q-30 -64 0 -64 Q30 -64 30 -40"
            fill="none"
            stroke={L}
            strokeWidth={9}
          />
          <rect
            x={-90}
            y={-40}
            width={180}
            height={120}
            rx={12}
            fill="#1a1a1f"
            stroke={L}
            strokeWidth={5}
          />
          <rect x={-90} y={-10} width={180} height={8} fill="#d4a63a" />
          <rect
            x={-16}
            y={-18}
            width={32}
            height={22}
            rx={4}
            fill="#f0c95a"
            stroke={L}
            strokeWidth={3}
          />
          <rect
            x={-70}
            y={-54}
            width={70}
            height={18}
            fill="#4caf50"
            stroke={L}
            strokeWidth={3}
            transform="rotate(-8)"
          />
        </g>
      );
    case "nota":
      return (
        <rect
          x={x - 45}
          y={y - 70}
          width={90}
          height={110}
          fill="white"
          stroke={L}
          strokeWidth={5}
          transform={`rotate(6 ${x} ${y})`}
        />
      );
    case "telefono":
      return (
        <rect
          x={x - 22}
          y={y - 55}
          width={44}
          height={86}
          rx={8}
          fill="#15151b"
          stroke={L}
          strokeWidth={4}
        />
      );
    default:
      return null;
  }
};

const Ojos = ({
  expr,
  parpado,
  brillo,
  quien,
}: {
  readonly expr: Expr;
  readonly parpado: boolean;
  readonly brillo: boolean;
  readonly quien: Quien;
}) => {
  const cy = -1010;
  const ojos = [-55, 65];
  const grande = expr === "sorprendido";
  const rx = grande ? 40 : 34;
  const ry = grande ? 50 : 42;
  // tapa: fracción del ojo cubierta e inclinación (positivo = baja hacia el centro)
  const tapas: Partial<Record<Expr, [number, number]>> = {
    orgullo: [0.45, 0],
    tierno: [0.3, -6],
    malvado: [0.45, 16],
    enojado: [0.35, 20],
    triste: [0.3, -16],
    llorando: [0.35, -16],
    astuto: [0.5, 10],
    decidido: [0.4, 14],
    ambicion: [0.2, 6],
  };
  const [frac, incl] = parpado ? [0.92, 0] : (tapas[expr] ?? [0, 0]);
  const piel = PIEL[quien];
  return (
    <g>
      {ojos.map((cx, i) => {
        const lado = i === 0 ? 1 : -1;
        const top = cy - ry + frac * ry * 2;
        return (
          <g key={cx}>
            <ellipse
              cx={cx}
              cy={cy}
              rx={rx}
              ry={ry}
              fill="white"
              stroke={L}
              strokeWidth={W}
            />
            {expr === "ambicion" ? (
              <text
                x={cx + 6}
                y={cy + 18}
                textAnchor="middle"
                fontSize={50}
                fontWeight={900}
                fill="#2e9e4f"
                stroke={L}
                strokeWidth={2}
              >
                $
              </text>
            ) : (
              <>
                {brillo ? (
                  <circle
                    cx={cx + 6}
                    cy={cy + 4}
                    r={22}
                    fill={quien === "coco" ? "#ffb21a" : "#7cff5a"}
                    opacity={0.9}
                  />
                ) : null}
                <circle cx={cx + 6} cy={cy + 4} r={grande ? 11 : 16} fill={L} />
                <circle cx={cx + 12} cy={cy - 6} r={5} fill="white" />
              </>
            )}
            {frac > 0 ? (
              <path
                d={`M${cx - rx - 4} ${cy - ry - 8} L${cx + rx + 4} ${cy - ry - 8} L${cx + rx + 4} ${top - incl * lado} L${cx - rx - 4} ${top + incl * lado} Z`}
                fill={piel}
                stroke={L}
                strokeWidth={W}
                strokeLinejoin="round"
              />
            ) : null}
            {quien === "fresa" && frac < 0.5 ? (
              <g stroke={L} strokeWidth={5} strokeLinecap="round">
                <line
                  x1={cx - rx + 4}
                  y1={cy - ry + 10}
                  x2={cx - rx - 12}
                  y2={cy - ry - 4}
                />
                <line
                  x1={cx + rx - 4}
                  y1={cy - ry + 10}
                  x2={cx + rx + 12}
                  y2={cy - ry - 4}
                />
              </g>
            ) : null}
          </g>
        );
      })}
    </g>
  );
};

const Cejas = ({ expr }: { readonly expr: Expr }) => {
  const d: Record<Expr, [number, number, number?]> = {
    normal: [0, 0],
    feliz: [-8, -8],
    orgullo: [0, 4],
    tierno: [-4, -10],
    sorprendido: [-26, -26],
    ambicion: [-6, 6],
    malvado: [-10, 18],
    enojado: [-6, 24],
    triste: [10, -14],
    llorando: [10, -16],
    astuto: [-24, 8, 1],
    decidido: [-6, 18],
  };
  const [ext, int, asim] = d[expr];
  const y = -1070;
  return (
    <g stroke={L} strokeWidth={12} strokeLinecap="round">
      <line x1={-95} y1={y + ext} x2={-25} y2={y + int} />
      <line x1={110} y1={y + (asim ? int - 30 : ext)} x2={40} y2={y + int} />
    </g>
  );
};

const BocaF = ({
  expr,
  abre,
  quien,
}: {
  readonly expr: Expr;
  readonly abre: number;
  readonly quien: Quien;
}) => {
  const color = quien === "fresa" ? "#7a0f22" : "#4a1414";
  const y = -905;
  if (abre > 0.08) {
    return (
      <g>
        <ellipse
          cx={8}
          cy={y}
          rx={26 + abre * 8}
          ry={6 + abre * 28}
          fill={color}
          stroke={L}
          strokeWidth={W}
        />
        <ellipse
          cx={8}
          cy={y + abre * 18}
          rx={14}
          ry={abre * 9}
          fill="#e86a6a"
        />
      </g>
    );
  }
  switch (expr) {
    case "feliz":
      return (
        <path
          d={`M-35 ${y - 12} Q8 ${y - 8} 52 ${y - 12} Q48 ${y + 40} 8 ${y + 40} Q-32 ${y + 40} -35 ${y - 12} Z`}
          fill={color}
          stroke={L}
          strokeWidth={W}
          strokeLinejoin="round"
        />
      );
    case "sorprendido":
      return (
        <ellipse
          cx={8}
          cy={y}
          rx={22}
          ry={28}
          fill={color}
          stroke={L}
          strokeWidth={W}
        />
      );
    case "triste":
    case "llorando":
      return (
        <path
          d={`M-25 ${y + 14} Q8 ${y - 18} 42 ${y + 14}`}
          fill="none"
          stroke={L}
          strokeWidth={8}
          strokeLinecap="round"
        />
      );
    case "enojado":
      return (
        <path
          d={`M-25 ${y + 8} Q8 ${y - 10} 42 ${y + 8}`}
          fill="none"
          stroke={L}
          strokeWidth={9}
          strokeLinecap="round"
        />
      );
    case "malvado":
    case "astuto":
    case "ambicion":
      return (
        <path
          d={`M-20 ${y + 2} Q20 ${y + 16} 52 ${y - 16}`}
          fill="none"
          stroke={L}
          strokeWidth={8}
          strokeLinecap="round"
        />
      );
    case "decidido":
      return (
        <path
          d={`M-18 ${y + 4} L38 ${y}`}
          stroke={L}
          strokeWidth={9}
          strokeLinecap="round"
        />
      );
    default:
      return (
        <path
          d={`M-22 ${y - 4} Q8 ${y + 16} 40 ${y - 4}`}
          fill="none"
          stroke={L}
          strokeWidth={8}
          strokeLinecap="round"
        />
      );
  }
};

const Cabeza = ({ quien }: { readonly quien: Quien }) => {
  if (quien === "coco") {
    return (
      <g>
        <circle
          cx={0}
          cy={-1000}
          r={190}
          fill="#7b4b2a"
          stroke={L}
          strokeWidth={W}
        />
        {Array.from({ length: 34 }).map((_, i) => {
          const a = (i / 34) * Math.PI * 2;
          const r1 = 120 + (i % 3) * 20;
          return (
            <line
              key={i}
              x1={Math.cos(a) * r1}
              y1={-1000 + Math.sin(a) * r1}
              x2={Math.cos(a) * (r1 + 34)}
              y2={-1000 + Math.sin(a) * (r1 + 34)}
              stroke="#5a3418"
              strokeWidth={5}
              strokeLinecap="round"
            />
          );
        })}
        <path
          d="M-30 -1185 Q-10 -1250 10 -1190 M5 -1188 Q40 -1255 45 -1180"
          fill="none"
          stroke="#5a3418"
          strokeWidth={9}
          strokeLinecap="round"
        />
        <ellipse
          cx={10}
          cy={-960}
          rx={150}
          ry={135}
          fill="#94603a"
          opacity={0.6}
        />
      </g>
    );
  }
  if (quien === "fresa") {
    return (
      <g>
        <path
          d="M-196 -1090 Q-240 -900 -185 -780 Q-120 -740 -60 -800 L60 -800 Q120 -740 185 -780 Q240 -900 196 -1090 Z"
          fill="#2a1a22"
          stroke={L}
          strokeWidth={W}
        />
        <path
          d="M0 -800 C-170 -820 -215 -990 -195 -1080 C-175 -1170 -60 -1205 0 -1195 C60 -1205 175 -1170 195 -1080 C215 -990 170 -820 0 -800 Z"
          fill="#e8323f"
          stroke={L}
          strokeWidth={W}
        />
        {Array.from({ length: 22 }).map((_, i) => (
          <ellipse
            key={i}
            cx={-140 + (i % 6) * 56 + (Math.floor(i / 6) % 2) * 28}
            cy={-1130 + Math.floor(i / 6) * 70}
            rx={6}
            ry={9}
            fill="#ffd84a"
            opacity={
              Math.abs(-140 + (i % 6) * 56) > 120 && Math.floor(i / 6) > 2
                ? 0
                : 0.95
            }
          />
        ))}
        {[-90, -45, 0, 45, 90].map((a, i) => (
          <path
            key={i}
            d="M0 -1185 L-26 -1260 L0 -1300 L26 -1260 Z"
            fill={i % 2 ? "#2f9e4c" : "#3fbf5e"}
            stroke={L}
            strokeWidth={4}
            transform={`rotate(${a * 0.7} 0 -1185)`}
          />
        ))}
      </g>
    );
  }
  return (
    <g>
      {[-50, -25, 0, 25, 50].map((a, i) => (
        <path
          key={i}
          d="M-22 -1180 L0 -1440 L22 -1180 Z"
          fill={i % 2 ? "#2f8a44" : "#3faa55"}
          stroke={L}
          strokeWidth={4}
          transform={`rotate(${a} 0 -1180)`}
        />
      ))}
      <defs>
        <clipPath id="clip-pina">
          <ellipse cx={0} cy={-1000} rx={170} ry={205} />
        </clipPath>
      </defs>
      <ellipse
        cx={0}
        cy={-1000}
        rx={170}
        ry={205}
        fill="#f2b632"
        stroke={L}
        strokeWidth={W}
      />
      <g clipPath="url(#clip-pina)" stroke="#c98a12" strokeWidth={5}>
        {Array.from({ length: 12 }).map((_, i) => (
          <g key={i}>
            <line
              x1={-300 + i * 55}
              y1={-1250}
              x2={-300 + i * 55 + 400}
              y2={-750}
            />
            <line
              x1={300 - i * 55}
              y1={-1250}
              x2={300 - i * 55 - 400}
              y2={-750}
            />
          </g>
        ))}
      </g>
      <ellipse
        cx={0}
        cy={-1000}
        rx={170}
        ry={205}
        fill="none"
        stroke={L}
        strokeWidth={W}
      />
    </g>
  );
};

export const Fruta = ({
  quien,
  x,
  mira,
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
  readonly mira: "izq" | "der";
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
  const resp = Math.sin(frame / 18 + x) * 5;
  const habla = boca > 0.08 ? Math.sin(frame / 3) * 3 : 0;
  const parpado = (frame + Math.round(x)) % 110 < 4;
  const manga =
    r.extra === "traje" || r.extra === "cadena"
      ? r.camisa
      : r.extra === "vestido"
        ? piel
        : r.camisa;
  const hombros = { a: [-150, -760], b: [150, -760] };
  let manoA: [number, number] = [-175, -430];
  let manoB: [number, number] = [175, -430];
  if (pose === "celebra") {
    manoA = [-240, -1060];
    manoB = [240, -1060];
  }
  if (pose === "sostiene") manoB = [200, -580];
  if (pose === "llamada") {
    manoB = [175, -960];
    manoA = [-170, -520];
  }
  if (pose === "cabeza") manoB = [165, -1090];
  const propEn: [number, number] | null = prop
    ? pose === "llamada"
      ? manoA
      : manoB
    : null;
  return (
    <g transform={`translate(${x} 1780) scale(${mira === "izq" ? -1 : 1} 1)`}>
      <ellipse cx={0} cy={0} rx={190} ry={26} fill="black" opacity={0.25} />
      <g transform={`translate(0 ${resp * 0.3})`}>
        {/* Piernas */}
        {r.extra === "vestido" ? (
          <g>
            <rect
              x={-62}
              y={-300}
              width={44}
              height={290}
              fill={piel}
              stroke={L}
              strokeWidth={W}
            />
            <rect
              x={18}
              y={-300}
              width={44}
              height={290}
              fill={piel}
              stroke={L}
              strokeWidth={W}
            />
          </g>
        ) : (
          <g>
            <rect
              x={-80}
              y={-390}
              width={70}
              height={380}
              rx={20}
              fill={r.pantalon}
              stroke={L}
              strokeWidth={W}
            />
            <rect
              x={10}
              y={-390}
              width={70}
              height={380}
              rx={20}
              fill={r.pantalon}
              stroke={L}
              strokeWidth={W}
            />
          </g>
        )}
        <ellipse
          cx={-48}
          cy={-8}
          rx={58}
          ry={24}
          fill="#1a1414"
          stroke={L}
          strokeWidth={W}
        />
        <ellipse
          cx={52}
          cy={-8}
          rx={58}
          ry={24}
          fill="#1a1414"
          stroke={L}
          strokeWidth={W}
        />
      </g>
      <g transform={`translate(0 ${resp})`}>
        {/* Torso */}
        {r.extra === "vestido" ? (
          <path
            d="M-120 -790 L120 -790 Q170 -700 150 -560 L230 -280 L-230 -280 L-150 -560 Q-170 -700 -120 -790 Z"
            fill={r.camisa}
            stroke={L}
            strokeWidth={W}
            strokeLinejoin="round"
          />
        ) : (
          <path
            d="M-150 -360 L-165 -700 Q-160 -785 -80 -795 L80 -795 Q160 -785 165 -700 L150 -360 Z"
            fill={r.camisa}
            stroke={L}
            strokeWidth={W}
            strokeLinejoin="round"
          />
        )}
        {r.extra === "delantal" ? (
          <g>
            <path
              d="M-100 -680 L100 -680 L120 -330 L-120 -330 Z"
              fill="#2f9e6b"
              stroke={L}
              strokeWidth={W}
            />
            <path
              d="M-70 -680 L-90 -790 M70 -680 L90 -790"
              stroke="#2f9e6b"
              strokeWidth={14}
            />
            <rect
              x={-40}
              y={-560}
              width={80}
              height={56}
              rx={8}
              fill="#27845a"
              stroke={L}
              strokeWidth={4}
            />
          </g>
        ) : null}
        {r.extra === "traje" || r.extra === "cadena" ? (
          <g>
            <path
              d="M-40 -795 L0 -640 L40 -795 Z"
              fill={r.extra === "cadena" ? "white" : "#2a2a33"}
              stroke={L}
              strokeWidth={4}
            />
            <path
              d="M-40 -795 L-10 -560 L-70 -700 Z M40 -795 L10 -560 L70 -700 Z"
              fill="#26262e"
              stroke={L}
              strokeWidth={4}
            />
            {r.extra === "cadena" ? (
              <path
                d="M-70 -790 Q0 -600 70 -790"
                fill="none"
                stroke="#ffd24a"
                strokeWidth={12}
              />
            ) : null}
            {r.extra === "cadena" ? (
              <circle
                cx={0}
                cy={-640}
                r={22}
                fill="#ffd24a"
                stroke={L}
                strokeWidth={4}
              />
            ) : null}
          </g>
        ) : null}
        {r.extra === "vestido" ? (
          <path
            d="M-90 -790 Q0 -700 90 -790"
            fill="none"
            stroke="#fff3b0"
            strokeWidth={6}
          />
        ) : null}
        <rect
          x={-36}
          y={-840}
          width={72}
          height={60}
          fill={piel}
          stroke={L}
          strokeWidth={W}
        />
        {/* Brazos (el de atrás primero) */}
        {pose === "cruzados" ? (
          <g>
            <Brazo
              x1={hombros.a[0]}
              y1={hombros.a[1]}
              x2={-70}
              y2={-590}
              manga={manga}
              piel={piel}
            />
            <Brazo
              x1={hombros.b[0]}
              y1={hombros.b[1]}
              x2={70}
              y2={-600}
              manga={manga}
              piel={piel}
            />
            <line
              x1={-80}
              y1={-600}
              x2={80}
              y2={-590}
              stroke={L}
              strokeWidth={66}
              strokeLinecap="round"
            />
            <line
              x1={-80}
              y1={-600}
              x2={80}
              y2={-590}
              stroke={manga}
              strokeWidth={54}
              strokeLinecap="round"
            />
          </g>
        ) : (
          <>
            <Brazo
              x1={hombros.a[0]}
              y1={hombros.a[1]}
              x2={manoA[0]}
              y2={manoA[1]}
              manga={manga}
              piel={piel}
            />
            {pose !== "llamada" && pose !== "cabeza" ? (
              <Brazo
                x1={hombros.b[0]}
                y1={hombros.b[1]}
                x2={manoB[0]}
                y2={manoB[1]}
                manga={manga}
                piel={piel}
              />
            ) : null}
          </>
        )}
        <g transform={`translate(0 ${habla})`}>
          <Cabeza quien={quien} />
          <Cejas expr={expr} />
          <Ojos expr={expr} parpado={parpado} brillo={brillo} quien={quien} />
          {expr === "tierno" ||
          expr === "feliz" ||
          (quien === "fresa" && expr !== "llorando") ? (
            <g fill="#ff7f9a" opacity={0.45}>
              <ellipse cx={-95} cy={-945} rx={28} ry={14} />
              <ellipse cx={115} cy={-945} rx={28} ry={14} />
            </g>
          ) : null}
          <BocaF expr={expr} abre={boca} quien={quien} />
          {expr === "llorando" ? (
            <g fill="#8fd3ff" stroke={L} strokeWidth={3} opacity={0.95}>
              <path
                d={`M-55 -965 Q-60 ${-900 + (frame % 30) * 2} -50 ${-860 + (frame % 30) * 3} Q-40 -900 -55 -965 Z`}
              />
              <path
                d={`M65 -965 Q60 ${-900 + ((frame + 12) % 30) * 2} 70 ${-860 + ((frame + 12) % 30) * 3} Q80 -900 65 -965 Z`}
              />
            </g>
          ) : null}
        </g>
        {pose === "llamada" || pose === "cabeza" ? (
          <Brazo
            x1={hombros.b[0]}
            y1={hombros.b[1]}
            x2={manoB[0]}
            y2={manoB[1]}
            manga={manga}
            piel={piel}
          />
        ) : null}
        {pose === "llamada" ? (
          <Objeto prop="telefono" x={manoB[0] - 10} y={manoB[1] + 10} />
        ) : null}
        {propEn && prop ? (
          <Objeto prop={prop} x={propEn[0]} y={propEn[1]} />
        ) : null}
      </g>
    </g>
  );
};
