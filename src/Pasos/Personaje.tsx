import { interpolate, useCurrentFrame } from "remotion";
import { BOCA } from "./datos";

// Personaje propio: gorro naranja, sudadera verde azulado. Señala hacia arriba
// y mueve la boca según el volumen de la narración.
export const Personaje = () => {
  const frame = useCurrentFrame();
  const boca = BOCA[frame] ?? 0;
  const respira = Math.sin(frame / 14) * 6;
  const brazo = Math.sin(frame / 9) * 3 + (boca > 0.3 ? -2 : 0);
  const parpado = frame % 97 < 4 ? 0.12 : 1;
  const ceja = boca * 8;
  return (
    <svg
      viewBox="0 0 520 620"
      style={{
        position: "absolute",
        right: -40,
        bottom: -30,
        width: 560,
        translate: `0px ${respira}px`,
      }}
    >
      {/* Cuerpo */}
      <path
        d="M60 620 C70 520 110 455 190 440 L350 440 C430 455 480 520 500 620 Z"
        fill="#1f8a78"
      />
      <path
        d="M350 440 C430 455 480 520 500 620 L420 620 C420 540 390 480 340 445 Z"
        fill="#17705f"
      />
      <path
        d="M230 448 L230 540 M300 448 L302 540"
        stroke="#f4efe6"
        strokeWidth={9}
        strokeLinecap="round"
      />
      {/* Brazo que señala */}
      <g transform={`rotate(${brazo} 170 470)`}>
        <path
          d="M175 470 C120 430 80 360 70 270"
          stroke="#1f8a78"
          strokeWidth={78}
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M60 300 C58 280 60 270 70 262"
          stroke="#17705f"
          strokeWidth={10}
          fill="none"
        />
        <circle cx={70} cy={225} r={44} fill="#e7a87a" />
        <rect x={56} y={120} width={30} height={100} rx={15} fill="#e7a87a" />
        <path
          d="M40 225 C40 205 60 200 80 205"
          stroke="#c98a5e"
          strokeWidth={6}
          fill="none"
        />
      </g>
      {/* Cuello y cabeza */}
      <rect x={235} y={400} width={60} height={60} rx={20} fill="#d4946a" />
      <ellipse cx={142} cy={315} rx={22} ry={30} fill="#d9996e" />
      <ellipse cx={265} cy={300} rx={125} ry={130} fill="#e7a87a" />
      <path
        d="M330 190 C390 230 400 320 370 380 C350 410 320 425 290 430 C350 390 370 300 330 190 Z"
        fill="#d9996e"
      />
      {/* Gorro */}
      <path
        d="M138 268 C130 150 200 110 268 110 C340 110 400 150 392 268 Z"
        fill="#ff7a1a"
      />
      <rect x={128} y={238} width={274} height={52} rx={26} fill="#e0610a" />
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <line
          key={i}
          x1={160 + i * 30}
          y1={246}
          x2={160 + i * 30}
          y2={282}
          stroke="#c9550a"
          strokeWidth={5}
          strokeLinecap="round"
        />
      ))}
      <circle cx={268} cy={100} r={30} fill="#ffb066" />
      {/* Cara */}
      <path
        d={`M195 ${322 - ceja} Q220 ${310 - ceja} 245 ${322 - ceja}`}
        stroke="#5b3a26"
        strokeWidth={9}
        strokeLinecap="round"
        fill="none"
      />
      <path
        d={`M285 ${322 - ceja} Q310 ${310 - ceja} 335 ${322 - ceja}`}
        stroke="#5b3a26"
        strokeWidth={9}
        strokeLinecap="round"
        fill="none"
      />
      <ellipse cx={222} cy={350} rx={13} ry={17 * parpado} fill="#231a15" />
      <ellipse cx={310} cy={350} rx={13} ry={17 * parpado} fill="#231a15" />
      <circle cx={226} cy={344} r={4} fill="white" opacity={parpado} />
      <circle cx={314} cy={344} r={4} fill="white" opacity={parpado} />
      <ellipse
        cx={190}
        cy={385}
        rx={20}
        ry={12}
        fill="#f08a7a"
        opacity={0.55}
      />
      <ellipse
        cx={345}
        cy={385}
        rx={20}
        ry={12}
        fill="#f08a7a"
        opacity={0.55}
      />
      <ellipse
        cx={268}
        cy={395}
        rx={interpolate(boca, [0, 1], [20, 28])}
        ry={interpolate(boca, [0, 1], [4, 26])}
        fill="#6a2418"
      />
      <ellipse
        cx={268}
        cy={395 + interpolate(boca, [0, 1], [2, 14])}
        rx={14}
        ry={interpolate(boca, [0, 1], [0, 9])}
        fill="#e8695a"
      />
    </svg>
  );
};
