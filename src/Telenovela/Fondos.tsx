import { random } from "remotion";
import type { EscenaCap } from "./tipos";

const L = "#2a1a1a";

const Ciudad = ({
  y,
  noche,
  n = 12,
  color,
}: {
  readonly y: number;
  readonly noche: boolean;
  readonly n?: number;
  readonly color?: string;
}) => (
  <g>
    {Array.from({ length: n }).map((_, b) => {
      const w = 70 + random(`cw${b}${y}`) * 60;
      const x = -40 + b * (1160 / n);
      const h = 160 + random(`ch${b}${y}`) * 380;
      return (
        <g key={b}>
          <rect
            x={x}
            y={y - h}
            width={w}
            height={h}
            fill={color ?? (noche ? "#1d1a3a" : "#9db3d6")}
          />
          {noche
            ? Array.from({ length: 10 }).map((_, i) =>
                random(`cv${b}-${i}${y}`) > 0.5 ? null : (
                  <rect
                    key={i}
                    x={x + 10 + (i % 3) * 20}
                    y={y - h + 16 + Math.floor(i / 3) * 34}
                    width={10}
                    height={16}
                    fill="#ffcf6a"
                  />
                ),
              )
            : null}
        </g>
      );
    })}
  </g>
);

const Gente = ({
  x0,
  n,
  escala = 1,
}: {
  readonly x0: number;
  readonly n: number;
  readonly escala?: number;
}) => (
  <g opacity={0.55}>
    {Array.from({ length: n }).map((_, i) => {
      const x = x0 + i * 70 * escala;
      const c = ["#c0392b", "#f1c40f", "#8e44ad", "#27ae60", "#e67e22"][i % 5];
      return (
        <g
          key={i}
          transform={`translate(${x} ${1530 - (i % 2) * 10}) scale(${escala})`}
        >
          <rect
            x={-26}
            y={-120}
            width={52}
            height={130}
            rx={20}
            fill="#2c2c3a"
          />
          <circle cx={0} cy={-150} r={36} fill={c} />
        </g>
      );
    })}
  </g>
);

export const Fondo = ({
  e,
  frame,
}: {
  readonly e: EscenaCap;
  readonly frame: number;
}) => {
  const noche = e.luz !== "dia";
  switch (e.fondo) {
    case "cocina":
      return (
        <g>
          <rect
            width={1080}
            height={1920}
            fill={
              e.luz === "dia"
                ? "#efd6b0"
                : e.luz === "oscuro"
                  ? "#1f1822"
                  : "#4a3242"
            }
          />
          <rect
            x={300}
            y={360}
            width={480}
            height={520}
            fill={noche ? "#141b3f" : "#9fd6f5"}
          />
          {noche ? (
            <circle cx={680} cy={460} r={44} fill="#f6efcf" />
          ) : (
            <circle cx={680} cy={460} r={50} fill="#ffe27a" />
          )}
          <Ciudad y={880} noche={noche} n={8} />
          <rect
            x={300}
            y={360}
            width={480}
            height={520}
            fill="none"
            stroke={L}
            strokeWidth={16}
          />
          <line
            x1={540}
            y1={360}
            x2={540}
            y2={880}
            stroke={L}
            strokeWidth={10}
          />
          {/* Repisas con frascos y fruta */}
          {[560, 760].map((y) => (
            <g key={y}>
              <rect
                x={20}
                y={y}
                width={230}
                height={16}
                fill="#6b4630"
                stroke={L}
                strokeWidth={4}
              />
              {[0, 1, 2].map((i) => (
                <rect
                  key={i}
                  x={40 + i * 70}
                  y={y - 70}
                  width={46}
                  height={70}
                  rx={8}
                  fill={["#ff9fc0", "#ffd24a", "#8fd38f"][i]}
                  stroke={L}
                  strokeWidth={4}
                />
              ))}
            </g>
          ))}
          <rect
            x={840}
            y={1380}
            width={240}
            height={400}
            fill="#7a5238"
            stroke={L}
            strokeWidth={6}
          />
          <rect
            x={880}
            y={1250}
            width={90}
            height={130}
            rx={10}
            fill="#d8e6f0"
            stroke={L}
            strokeWidth={5}
          />
          <rect
            x={0}
            y={1780}
            width={1080}
            height={140}
            fill={noche ? "#2a1d26" : "#c69b70"}
          />
          {Array.from({ length: 9 }).map((_, i) => (
            <line
              key={i}
              x1={i * 130}
              y1={1780}
              x2={i * 130 - 60}
              y2={1920}
              stroke={L}
              strokeWidth={3}
              opacity={0.4}
            />
          ))}
          <path d="M540 0 L540 200" stroke={L} strokeWidth={6} />
          <path
            d="M470 200 L610 200 L580 260 L500 260 Z"
            fill="#c98a4b"
            stroke={L}
            strokeWidth={5}
          />
          <ellipse
            cx={540}
            cy={330}
            rx={260}
            ry={120}
            fill="#ffcf7a"
            opacity={e.luz === "oscuro" ? 0.04 : 0.18}
          />
        </g>
      );
    case "calle": {
      const cerrado = e.letrero === "CERRADO";
      return (
        <g>
          <rect
            width={1080}
            height={1920}
            fill={noche ? "#14183a" : "#8fd0f5"}
          />
          {noche ? (
            <circle cx={860} cy={260} r={50} fill="#f4efd2" />
          ) : (
            <circle cx={860} cy={260} r={70} fill="#ffe27a" />
          )}
          <Ciudad y={1250} noche={noche} n={10} />
          {/* Puesto */}
          <rect
            x={110}
            y={700}
            width={860}
            height={720}
            fill={noche ? "#3a2a30" : "#f3e2c4"}
            stroke={L}
            strokeWidth={8}
          />
          {Array.from({ length: 8 }).map((_, i) => (
            <path
              key={i}
              d={`M${110 + i * 107.5} 600 L${217.5 + i * 107.5} 600 L${217.5 + i * 107.5} ${cerrado ? 1100 : 720} L${110 + i * 107.5} ${cerrado ? 1100 : 720} Z`}
              fill={i % 2 ? "#ffffff" : cerrado ? "#7a2a2a" : "#ff5c8a"}
              stroke={L}
              strokeWidth={5}
              opacity={noche && !cerrado ? 0.8 : 1}
            />
          ))}
          <rect
            x={250}
            y={430}
            width={580}
            height={150}
            rx={16}
            fill={cerrado ? "#5a1a1a" : "#2f9e6b"}
            stroke={L}
            strokeWidth={8}
          />
          <text
            x={540}
            y={530}
            textAnchor="middle"
            fontSize={78}
            fontWeight={900}
            fill="white"
            fontFamily="Montserrat, sans-serif"
          >
            {e.letrero ?? ""}
          </text>
          <rect
            x={110}
            y={1300}
            width={860}
            height={140}
            fill={noche ? "#4a3238" : "#c98a5a"}
            stroke={L}
            strokeWidth={8}
          />
          {!cerrado
            ? [0, 1, 2, 3, 4].map((i) => (
                <g key={i} transform={`translate(${210 + i * 160} 1260)`}>
                  <path
                    d="M-26 -60 L26 -60 L20 30 L-20 30 Z"
                    fill="#ff5c8a"
                    stroke={L}
                    strokeWidth={4}
                  />
                </g>
              ))
            : null}
          {e.fila ? <Gente x0={1010} n={4} escala={0.9} /> : null}
          <rect
            x={0}
            y={1720}
            width={1080}
            height={200}
            fill={noche ? "#22222e" : "#9a9aa6"}
          />
          <rect
            x={0}
            y={1720}
            width={1080}
            height={14}
            fill={noche ? "#33334a" : "#bcbcc6"}
          />
        </g>
      );
    }
    case "lujo":
      return (
        <g>
          <rect width={1080} height={1920} fill="#0f2a20" />
          {Array.from({ length: 7 }).map((_, i) => (
            <rect
              key={i}
              x={i * 170 - 20}
              y={0}
              width={10}
              height={1780}
              fill="#d4a63a"
              opacity={0.5}
            />
          ))}
          {[220, 860].map((x) => (
            <g key={x}>
              <line
                x1={x}
                y1={0}
                x2={x}
                y2={150}
                stroke="#d4a63a"
                strokeWidth={5}
              />
              <ellipse
                cx={x}
                cy={190}
                rx={90}
                ry={44}
                fill="#ffe7a0"
                stroke="#d4a63a"
                strokeWidth={6}
              />
              <ellipse
                cx={x}
                cy={240}
                rx={220}
                ry={90}
                fill="#ffe7a0"
                opacity={0.15}
              />
            </g>
          ))}
          <rect
            x={160}
            y={380}
            width={760}
            height={170}
            rx={20}
            fill="#0a1a14"
            stroke="#ffd24a"
            strokeWidth={10}
          />
          <text
            x={540}
            y={500}
            textAnchor="middle"
            fontSize={84}
            fontWeight={900}
            fill="#ffd24a"
            fontFamily="Montserrat, sans-serif"
            style={{ filter: "drop-shadow(0 0 18px #ffd24a)" }}
          >
            {e.letrero ?? ""} 👑
          </text>
          <Gente x0={60} n={15} escala={1.1} />
          <rect x={0} y={1780} width={1080} height={140} fill="#1c1410" />
          {Array.from({ length: 40 }).map((_, i) => {
            const x = random(`cf${i}`) * 1080;
            const y =
              (random(`cy${i}`) * 1900 + frame * (3 + random(`cv${i}`) * 4)) %
              1900;
            return (
              <rect
                key={i}
                x={x}
                y={y}
                width={12}
                height={20}
                fill={["#ffd24a", "#ff5c8a", "#ffffff"][i % 3]}
                transform={`rotate(${frame * 6 + i * 20} ${x} ${y})`}
              />
            );
          })}
        </g>
      );
    case "lluvia":
      return (
        <g>
          <rect width={1080} height={1920} fill="#0d1230" />
          <Ciudad y={1300} noche n={9} color="#141a40" />
          <rect
            x={560}
            y={560}
            width={460}
            height={620}
            fill="#ffcf6a"
            stroke={L}
            strokeWidth={14}
          />
          <text
            x={790}
            y={640}
            textAnchor="middle"
            fontSize={44}
            fontWeight={900}
            fill="#5a3a00"
            fontFamily="Montserrat, sans-serif"
          >
            BATIDOS PIÑA 👑
          </text>
          {[650, 760, 880].map((x, i) => (
            <g key={x} opacity={0.75}>
              <rect
                x={x - 30}
                y={980 - (i % 2) * 20}
                width={60}
                height={200}
                rx={20}
                fill="#7a4a10"
              />
              <circle cx={x} cy={940 - (i % 2) * 20} r={42} fill="#a5650f" />
            </g>
          ))}
          <rect x={0} y={1740} width={1080} height={180} fill="#151a33" />
          <ellipse
            cx={790}
            cy={1800}
            rx={260}
            ry={30}
            fill="#ffcf6a"
            opacity={0.2}
          />
          {Array.from({ length: 90 }).map((_, i) => {
            const x = ((random(`lx${i}`) * 1180 + frame * 4) % 1180) - 50;
            const y = (random(`ly${i}`) * 1920 + frame * 48) % 1920;
            return (
              <line
                key={i}
                x1={x}
                y1={y}
                x2={x - 10}
                y2={y + 60}
                stroke="#9fc6ff"
                strokeWidth={3}
                opacity={0.5}
              />
            );
          })}
        </g>
      );
    default:
      return (
        <g>
          <rect width={1080} height={1920} fill="#07060c" />
          <Ciudad y={1500} noche n={9} color="#100e1c" />
          <path
            d="M440 0 L640 0 L980 1780 L100 1780 Z"
            fill="#ffe9b0"
            opacity={0.22}
          />
          <ellipse
            cx={540}
            cy={1780}
            rx={420}
            ry={60}
            fill="#ffe9b0"
            opacity={0.35}
          />
          <rect x={0} y={1780} width={1080} height={140} fill="#0e0c14" />
        </g>
      );
  }
};
