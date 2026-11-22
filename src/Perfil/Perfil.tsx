import { AbsoluteFill } from "remotion";

type Props = {
  readonly fondo: string;
  readonly anillo: string;
  readonly flecha: string;
  readonly brillo: string;
};

// Logo "de cero a todo": un cero del que sale una flecha hacia arriba.
// Todo el contenido cabe dentro del círculo central (TikTok recorta el perfil en círculo).
export const Perfil = ({ fondo, anillo, flecha, brillo }: Props) => {
  return (
    <AbsoluteFill
      style={{
        background: fondo,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <svg width={1080} height={1080} viewBox="0 0 1080 1080">
        <defs>
          <radialGradient id="halo">
            <stop offset="0%" stopColor={brillo} stopOpacity={0.55} />
            <stop offset="100%" stopColor={brillo} stopOpacity={0} />
          </radialGradient>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="18" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {/* Halo */}
        <circle cx={540} cy={560} r={420} fill="url(#halo)" />
        {/* El cero, abierto arriba a la derecha para que salga la flecha */}
        <ellipse
          cx={540}
          cy={590}
          rx={190}
          ry={250}
          fill="none"
          stroke={anillo}
          strokeWidth={74}
          strokeDasharray="1090 305"
          strokeDashoffset={0}
          strokeLinecap="round"
          transform="rotate(-8 540 590)"
        />
        {/* Flecha que rompe el cero hacia arriba */}
        <path
          d="M 470 760 L 560 560 L 640 640 L 790 330"
          fill="none"
          stroke={flecha}
          strokeWidth={70}
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#glow)"
        />
        <path
          d="M 690 300 L 830 250 L 840 400 Z"
          fill={flecha}
          stroke={flecha}
          strokeWidth={24}
          strokeLinejoin="round"
        />
        {/* Destellos */}
        <path
          d="M 300 300 l 14 36 l 36 14 l -36 14 l -14 36 l -14 -36 l -36 -14 l 36 -14 Z"
          fill={flecha}
        />
        <path
          d="M 800 760 l 10 26 l 26 10 l -26 10 l -10 26 l -10 -26 l -26 -10 l 26 -10 Z"
          fill={flecha}
          opacity={0.8}
        />
      </svg>
    </AbsoluteFill>
  );
};
