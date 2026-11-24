import { random } from "remotion";
import type { Boca, Ojos, Pose } from "./tipos";

// Escena 2D plana con contornos: el cuarto (noche/día) y el protagonista propio
// (gorro naranja, sudadera verde azulado). Coordenadas del panel: 1080 x 1000.
const L = "#1d1530"; // contorno
const W = 6;

export type EstadoPersonaje = {
  pose: Pose;
  ojos: Ojos;
  boca: Boca;
  ojeras: boolean;
  sudor: boolean;
  brillo: boolean;
  luz: boolean;
  cafes: number;
};

const Edificios = ({ dia }: { readonly dia: boolean }) => (
  <g>
    {Array.from({ length: 11 }).map((_, b) => {
      const x = 200 + b * 64 + random(`ex${b}`) * 10;
      const h = 120 + random(`eh${b}`) * 200;
      const w = 52 + random(`ew${b}`) * 20;
      return (
        <g key={b}>
          <rect
            x={x}
            y={560 - h}
            width={w}
            height={h}
            fill={dia ? "#a9b6d6" : "#251e4d"}
          />
          {Array.from({ length: 12 }).map((_, i) =>
            random(`v${b}-${i}`) > (dia ? 1 : 0.45) ? null : (
              <rect
                key={i}
                x={x + 8 + (i % 3) * 15}
                y={560 - h + 14 + Math.floor(i / 3) * 26}
                width={8}
                height={12}
                fill={random(`c${b}-${i}`) > 0.3 ? "#ffd27a" : "#8fd3ff"}
              />
            ),
          )}
        </g>
      );
    })}
  </g>
);

export const Cuarto = ({
  dia,
  desorden,
}: {
  readonly dia: boolean;
  readonly desorden: boolean;
}) => (
  <g>
    <rect width={1080} height={1000} fill={dia ? "#f2dcc2" : "#3a2d5a"} />
    {/* Ventana */}
    <defs>
      <linearGradient id={`cielo-${dia}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={dia ? "#7cc6f5" : "#141640"} />
        <stop offset="1" stopColor={dia ? "#dff3ff" : "#4a2f78"} />
      </linearGradient>
    </defs>
    <rect x={190} y={70} width={700} height={490} fill={`url(#cielo-${dia})`} />
    {dia ? (
      <>
        <circle cx={780} cy={160} r={46} fill="#ffe27a" />
        <ellipse cx={330} cy={170} rx={70} ry={26} fill="white" opacity={0.9} />
        <ellipse cx={600} cy={130} rx={56} ry={20} fill="white" opacity={0.8} />
      </>
    ) : (
      <circle cx={780} cy={160} r={40} fill="#f4ecd0" />
    )}
    <Edificios dia={dia} />
    <rect
      x={190}
      y={70}
      width={700}
      height={490}
      fill="none"
      stroke={L}
      strokeWidth={14}
    />
    <line x1={540} y1={70} x2={540} y2={560} stroke={L} strokeWidth={10} />
    <line x1={190} y1={300} x2={890} y2={300} stroke={L} strokeWidth={10} />
    {/* Póster y estante */}
    <rect
      x={40}
      y={150}
      width={120}
      height={170}
      rx={8}
      fill={dia ? "#ff8f6b" : "#c04f6a"}
      stroke={L}
      strokeWidth={W}
    />
    <path
      d="M85 205 L125 235 L85 265 Z"
      fill="white"
      stroke={L}
      strokeWidth={4}
    />
    <rect
      x={920}
      y={210}
      width={140}
      height={14}
      fill={dia ? "#b98660" : "#5b3d4f"}
      stroke={L}
      strokeWidth={4}
    />
    <rect
      x={940}
      y={160}
      width={30}
      height={50}
      fill="#ffcf5a"
      stroke={L}
      strokeWidth={4}
    />
    <rect
      x={975}
      y={170}
      width={24}
      height={40}
      fill="#6fd0c0"
      stroke={L}
      strokeWidth={4}
    />
    {desorden ? (
      <>
        {[
          [220, 120, -8, "#ffe57a"],
          [820, 380, 10, "#9fe3b5"],
          [120, 400, 6, "#ffb3c7"],
          [600, 420, -4, "#ffe57a"],
        ].map(([x, y, r, c], i) => (
          <rect
            key={i}
            x={x as number}
            y={y as number}
            width={58}
            height={58}
            fill={c as string}
            transform={`rotate(${r} ${x} ${y})`}
            stroke={L}
            strokeWidth={3}
          />
        ))}
      </>
    ) : null}
  </g>
);

export const Escritorio = ({
  dia,
  desorden,
  cafes,
}: {
  readonly dia: boolean;
  readonly desorden: boolean;
  readonly cafes: number;
}) => (
  <g>
    <rect
      x={-20}
      y={760}
      width={1120}
      height={260}
      fill={dia ? "#b07a52" : "#5b3d4f"}
      stroke={L}
      strokeWidth={W}
    />
    <rect
      x={-20}
      y={760}
      width={1120}
      height={26}
      fill={dia ? "#c98f63" : "#6d4a5f"}
      stroke={L}
      strokeWidth={W}
    />
    {/* Laptop (vista de atrás) */}
    <path
      d="M660 600 L880 600 L870 770 L670 770 Z"
      fill="#c9ccd8"
      stroke={L}
      strokeWidth={W}
      strokeLinejoin="round"
    />
    <path
      d="M752 670 L792 690 L752 710 Z"
      fill="#ff7a1a"
      stroke={L}
      strokeWidth={4}
    />
    <rect
      x={640}
      y={764}
      width={260}
      height={16}
      rx={6}
      fill="#a6a9b8"
      stroke={L}
      strokeWidth={W}
    />
    {/* Planta */}
    <rect
      x={950}
      y={690}
      width={90}
      height={80}
      rx={8}
      fill="#d46a4a"
      stroke={L}
      strokeWidth={W}
    />
    {[-40, -15, 10, 35].map((a, i) => (
      <ellipse
        key={i}
        cx={995 + a}
        cy={640 + Math.abs(a) * 0.6}
        rx={22}
        ry={50}
        fill={i % 2 ? "#3fa05a" : "#2f8a4c"}
        stroke={L}
        strokeWidth={4}
        transform={`rotate(${a} ${995 + a} ${680})`}
      />
    ))}
    {/* Tazas de café */}
    {Array.from({ length: cafes }).map((_, i) => (
      <g key={i} transform={`translate(${60 + i * 62} ${700 - (i % 2) * 6})`}>
        <rect
          x={0}
          y={0}
          width={46}
          height={58}
          rx={6}
          fill="white"
          stroke={L}
          strokeWidth={5}
        />
        <path
          d="M46 14 Q66 14 66 30 Q66 46 46 46"
          fill="none"
          stroke={L}
          strokeWidth={5}
        />
        <rect x={6} y={14} width={34} height={10} fill="#7a4a30" />
      </g>
    ))}
    {desorden ? (
      <>
        <g transform="translate(330 812) rotate(-6)">
          <rect
            width={150}
            height={40}
            fill="#e0a35a"
            stroke={L}
            strokeWidth={5}
          />
          <path
            d="M0 0 L150 0 L130 -70 L-20 -70 Z"
            fill="#f0c07a"
            stroke={L}
            strokeWidth={5}
          />
          <text x={45} y={-25} fontSize={26} fontWeight={800} fill="#c0392b">
            PIZZA
          </text>
        </g>
        {[
          [520, 820, 12],
          [90, 830, -10],
          [560, 860, -4],
        ].map(([x, y, r], i) => (
          <rect
            key={i}
            x={x}
            y={y}
            width={110}
            height={76}
            fill="white"
            stroke={L}
            strokeWidth={4}
            transform={`rotate(${r} ${x} ${y})`}
          />
        ))}
        <circle
          cx={240}
          cy={880}
          r={20}
          fill="#f4f4f4"
          stroke={L}
          strokeWidth={4}
        />
        <circle
          cx={860}
          cy={880}
          r={18}
          fill="#f4f4f4"
          stroke={L}
          strokeWidth={4}
        />
      </>
    ) : null}
  </g>
);

const Cejas = ({ ojos }: { readonly ojos: Ojos }) => {
  const d: Record<Ojos, [number, number]> = {
    normal: [0, 0],
    triste: [14, -6],
    sorprendido: [-22, -22],
    decidido: [-16, 14],
    cansado: [6, 6],
    feliz: [-10, -10],
  };
  const [ext, int] = d[ojos];
  return (
    <g stroke={L} strokeWidth={12} strokeLinecap="round">
      <line x1={335} y1={395 + ext} x2={410} y2={395 + int} />
      <line x1={525} y1={395 + ext} x2={450} y2={395 + int} />
    </g>
  );
};

const Ojo = ({
  cx,
  ojos,
  brillo,
  lado,
}: {
  readonly cx: number;
  readonly ojos: Ojos;
  readonly brillo: boolean;
  readonly lado: number;
}) => {
  const cy = 460;
  if (ojos === "feliz")
    return (
      <path
        d={`M${cx - 30} ${cy + 8} Q${cx} ${cy - 28} ${cx + 30} ${cy + 8}`}
        fill="none"
        stroke={L}
        strokeWidth={9}
        strokeLinecap="round"
      />
    );
  const grande = ojos === "sorprendido";
  const rx = grande ? 46 : 40;
  const ry = grande ? 54 : 46;
  const pr = grande ? 12 : brillo ? 22 : 18;
  // párpado: fracción cubierta desde arriba e inclinación
  const tapa: Record<Ojos, [number, number]> = {
    normal: [0, 0],
    triste: [0.3, -14 * lado],
    sorprendido: [0, 0],
    decidido: [0.38, 16 * lado],
    cansado: [0.5, 0],
    feliz: [0, 0],
  };
  const [frac, incl] = tapa[ojos];
  const top = cy - ry + frac * ry * 2;
  return (
    <g>
      <ellipse
        cx={cx}
        cy={cy}
        rx={rx}
        ry={ry}
        fill="white"
        stroke={L}
        strokeWidth={W}
      />
      {brillo ? <circle cx={cx} cy={cy + 6} r={pr} fill="#ff8a1a" /> : null}
      <circle cx={cx} cy={cy + 6} r={brillo ? 10 : pr} fill={L} />
      <circle cx={cx + 7} cy={cy - 4} r={5} fill="white" />
      {frac > 0 ? (
        <path
          d={`M${cx - rx - 4} ${cy - ry - 6} L${cx + rx + 4} ${cy - ry - 6} L${cx + rx + 4} ${top - incl} L${cx - rx - 4} ${top + incl} Z`}
          fill="#f2c29b"
          stroke={L}
          strokeWidth={W}
          strokeLinejoin="round"
        />
      ) : null}
    </g>
  );
};

const BocaV = ({ boca }: { readonly boca: Boca }) => {
  switch (boca) {
    case "triste":
      return (
        <path
          d="M395 560 Q430 530 465 560"
          fill="none"
          stroke={L}
          strokeWidth={8}
          strokeLinecap="round"
        />
      );
    case "abierta":
      return (
        <g>
          <ellipse
            cx={430}
            cy={550}
            rx={32}
            ry={30}
            fill="#5a1a24"
            stroke={L}
            strokeWidth={W}
          />
          <ellipse cx={430} cy={566} rx={18} ry={10} fill="#e8695a" />
        </g>
      );
    case "sonrisa":
      return (
        <path
          d="M385 530 Q430 535 475 530 Q470 585 430 585 Q390 585 385 530 Z"
          fill="#5a1a24"
          stroke={L}
          strokeWidth={W}
          strokeLinejoin="round"
        />
      );
    case "determinada":
      return (
        <path
          d="M400 548 L462 542"
          stroke={L}
          strokeWidth={9}
          strokeLinecap="round"
        />
      );
    default:
      return (
        <path
          d="M400 545 Q430 552 460 545"
          fill="none"
          stroke={L}
          strokeWidth={8}
          strokeLinecap="round"
        />
      );
  }
};

const Brazo = ({
  x1,
  y1,
  x2,
  y2,
}: {
  readonly x1: number;
  readonly y1: number;
  readonly x2: number;
  readonly y2: number;
}) => (
  <g strokeLinecap="round">
    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={L} strokeWidth={84} />
    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#1f8a78" strokeWidth={70} />
    <circle cx={x2} cy={y2} r={36} fill="#f2c29b" stroke={L} strokeWidth={W} />
  </g>
);

export const Personaje = ({
  e,
  frame,
}: {
  readonly e: EstadoPersonaje;
  readonly frame: number;
}) => {
  const resp = Math.sin(frame / 16) * 4;
  const parpadeo = frame % 90 < 3 && e.ojos !== "feliz";
  const ojos: Ojos = parpadeo ? "cansado" : e.ojos;
  const salto = e.pose === "celebra" ? Math.abs(Math.sin(frame / 5)) * -14 : 0;
  return (
    <g transform={`translate(0 ${resp + salto})`}>
      {/* Cuerpo */}
      <path
        d="M220 1000 L245 650 Q255 585 330 570 L530 570 Q605 585 615 650 L640 1000 Z"
        fill="#1f8a78"
        stroke={L}
        strokeWidth={W}
        strokeLinejoin="round"
      />
      <path
        d="M560 600 Q600 640 610 1000 L640 1000 L615 650 Q605 590 560 575 Z"
        fill="#17705f"
      />
      <path
        d="M340 574 Q430 650 520 574"
        fill="none"
        stroke="#146152"
        strokeWidth={10}
      />
      <path
        d="M402 612 L398 700 M458 612 L462 700"
        stroke="white"
        strokeWidth={8}
        strokeLinecap="round"
      />
      {e.pose === "celebra" ? (
        <>
          <Brazo x1={280} y1={630} x2={170} y2={380} />
          <Brazo x1={580} y1={630} x2={690} y2={380} />
        </>
      ) : null}
      {/* Cabeza */}
      <circle
        cx={282}
        cy={460}
        r={28}
        fill="#f2c29b"
        stroke={L}
        strokeWidth={W}
      />
      <circle
        cx={578}
        cy={460}
        r={28}
        fill="#f2c29b"
        stroke={L}
        strokeWidth={W}
      />
      <circle
        cx={430}
        cy={440}
        r={150}
        fill="#f2c29b"
        stroke={L}
        strokeWidth={W}
      />
      <path d="M560 360 Q600 470 540 560 Q590 520 578 440 Z" fill="#e3ad85" />
      {/* Gorro */}
      <path
        d="M282 380 C282 225 578 225 578 380 Z"
        fill="#ff7a1a"
        stroke={L}
        strokeWidth={W}
        strokeLinejoin="round"
      />
      <rect
        x={268}
        y={346}
        width={324}
        height={60}
        rx={30}
        fill="#e0610a"
        stroke={L}
        strokeWidth={W}
      />
      {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <line
          key={i}
          x1={302 + i * 32}
          y1={356}
          x2={302 + i * 32}
          y2={396}
          stroke="#b84f08"
          strokeWidth={5}
          strokeLinecap="round"
        />
      ))}
      <circle
        cx={430}
        cy={240}
        r={30}
        fill="#ffb066"
        stroke={L}
        strokeWidth={W}
      />
      {/* Cara */}
      {e.ojeras ? (
        <g fill="#8a6bb8" opacity={0.45}>
          <ellipse cx={375} cy={512} rx={36} ry={12} />
          <ellipse cx={485} cy={512} rx={36} ry={12} />
        </g>
      ) : null}
      <Ojo cx={375} ojos={ojos} brillo={e.brillo} lado={1} />
      <Ojo cx={485} ojos={ojos} brillo={e.brillo} lado={-1} />
      <Cejas ojos={e.ojos} />
      <path
        d="M422 488 Q430 505 440 492"
        fill="none"
        stroke={L}
        strokeWidth={6}
        strokeLinecap="round"
      />
      {e.boca === "sonrisa" || e.ojos === "feliz" ? (
        <g fill="#ff8a8a" opacity={0.5}>
          <ellipse cx={335} cy={515} rx={24} ry={14} />
          <ellipse cx={525} cy={515} rx={24} ry={14} />
        </g>
      ) : null}
      <BocaV boca={e.boca} />
      {e.sudor ? (
        <path
          d="M590 370 Q606 400 598 414 Q586 424 578 410 Q574 398 590 370 Z"
          fill="#8fd3ff"
          stroke={L}
          strokeWidth={4}
        />
      ) : null}
      {e.luz ? (
        <ellipse
          cx={470}
          cy={470}
          rx={190}
          ry={170}
          fill="#7fb8ff"
          opacity={0.16}
        />
      ) : null}
    </g>
  );
};

// Manos y teléfono van por delante del escritorio.
export const Manos = ({ e }: { readonly e: EstadoPersonaje }) => {
  if (e.pose === "celebra") return null;
  return (
    <g>
      <Brazo x1={270} y1={660} x2={300} y2={790} />
      {e.pose === "telefono" ? (
        <g>
          <Brazo x1={590} y1={660} x2={610} y2={600} />
          <rect
            x={570}
            y={470}
            width={90}
            height={150}
            rx={16}
            fill="#1b1d2a"
            stroke={L}
            strokeWidth={W}
            transform="rotate(-10 615 545)"
          />
          <rect
            x={580}
            y={482}
            width={70}
            height={124}
            rx={10}
            fill="#5d8bff"
            opacity={0.9}
            transform="rotate(-10 615 545)"
          />
          <circle
            cx={612}
            cy={605}
            r={36}
            fill="#f2c29b"
            stroke={L}
            strokeWidth={W}
          />
        </g>
      ) : (
        <Brazo x1={590} y1={660} x2={560} y2={790} />
      )}
    </g>
  );
};
