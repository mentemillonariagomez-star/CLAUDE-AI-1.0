// A16: presentador ORIGINAL (no copia la mascota de la referencia), con volumen tipo arcilla,
// poses, parpadeo y boca sincronizada con la envolvente de la voz.
import { interpolate, spring, useCurrentFrame } from "remotion";
import { CL } from "./anim";
import { TITULO } from "./estilo";

type Pose = { brazo: number; antebrazo: number; dedo: number; cabeza: number };
const POSES: Record<string, Pose> = {
  apunta: { brazo: 198, antebrazo: 222, dedo: 1, cabeza: -5 },
  arriba: { brazo: 165, antebrazo: 268, dedo: 1, cabeza: -2 },
  explica: { brazo: 150, antebrazo: 192, dedo: 0, cabeza: 3 },
  alto: { brazo: 215, antebrazo: 250, dedo: 1, cabeza: -7 },
};

const rad = (g: number) => (g * Math.PI) / 180;

export const Presentador = ({
  boca,
  poses,
}: {
  readonly boca: readonly number[];
  readonly poses: readonly { readonly f: number; readonly pose: string }[];
}) => {
  const f = useCurrentFrame();
  // Mezcla entre la pose anterior y la actual con resorte (sin saltos bruscos).
  let k = 0;
  while (k + 1 < poses.length && f >= poses[k + 1].f) k++;
  const actual = POSES[poses[k]?.pose ?? "apunta"] ?? POSES.apunta;
  const previa = POSES[poses[k - 1]?.pose ?? poses[k]?.pose ?? "apunta"] ?? actual;
  const m = k > 0 ? spring({ frame: f - poses[k].f, fps: 30, config: { damping: 14, stiffness: 120 } }) : 1;
  const mezcla = (c: keyof Pose) => previa[c] + (actual[c] - previa[c]) * m;

  const vaiven = Math.sin(f / 19) * 2.2;
  const brazo = mezcla("brazo") + vaiven;
  const antebrazo = mezcla("antebrazo") + Math.sin(f / 13) * 3;
  const dedo = mezcla("dedo");
  const abre = Math.min(1, (boca[f] ?? 0) * 1.15);
  const parpadeo = [37, 120, 170, 260, 330, 410].some((p) => (f % 430) - p >= 0 && (f % 430) - p < 4);
  const respira = 1 + Math.sin(f / 24) * 0.008;
  const inclina = mezcla("cabeza") + Math.sin(f / 31) * 2 + (abre - 0.3) * 2;

  // Brazo en dos segmentos desde el hombro.
  const hombro = { x: 300, y: 560 };
  const L1 = 175;
  const L2 = 150;
  const codo = { x: hombro.x + L1 * Math.cos(rad(brazo)), y: hombro.y + L1 * Math.sin(rad(brazo)) };
  const mano = { x: codo.x + L2 * Math.cos(rad(antebrazo)), y: codo.y + L2 * Math.sin(rad(antebrazo)) };
  const dir = rad(antebrazo);

  return (
    <svg
      width={1000}
      height={1000}
      viewBox="-360 -240 1000 1000"
      style={{ position: "absolute", right: -40, bottom: -30, zIndex: 25 }}
    >

      <g style={{ transformOrigin: "400px 760px", scale: `1 ${respira}` }}>
        {/* Torso */}
        <path d="M 170 760 C 170 610 230 520 330 500 L 470 500 C 570 520 640 600 650 760 Z" fill="#f3c300" />
        <path d="M 200 760 C 205 640 250 560 330 530 C 300 600 290 680 300 760 Z" fill="#ffe36b" opacity={0.55} />
        <path d="M 560 760 C 560 650 540 580 470 530 C 560 545 630 620 650 760 Z" fill="#b98a00" opacity={0.45} />
        {/* Capucha detrás del cuello */}
        <path d="M 300 505 C 330 470 480 470 505 505 C 480 540 330 540 300 505 Z" fill="#c99a00" />
        {/* Cordones y cremallera */}
        <path d="M 360 520 L 352 620" stroke="#1d1d1f" strokeWidth={7} strokeLinecap="round" />
        <path d="M 440 520 L 448 625" stroke="#1d1d1f" strokeWidth={7} strokeLinecap="round" />
        <circle cx={352} cy={626} r={8} fill="#1d1d1f" />
        <circle cx={448} cy={631} r={8} fill="#1d1d1f" />
        <path d="M 400 535 L 400 760" stroke="#b88a00" strokeWidth={4} />
        {/* Logo zerx en el pecho */}
        <text x={505} y={640} fontFamily={TITULO} fontSize={34} fill="#1d1d1f" opacity={0.85}>
          zx
        </text>

        {/* Cuello */}
        <path d="M 365 500 L 365 450 L 435 450 L 435 500 Z" fill="#c47e52" />

        {/* Cabeza */}
        <g style={{ transformOrigin: "400px 460px", rotate: `${inclina}deg` }}>
          {/* Orejas */}
          <ellipse cx={298} cy={345} rx={22} ry={32} fill="#d98d5f" />
          <ellipse cx={502} cy={345} rx={22} ry={32} fill="#d98d5f" />
          {/* Cara */}
          <rect x={300} y={215} width={200} height={240} rx={92} fill="#e5a173" />
          <ellipse cx={370} cy={290} rx={55} ry={60} fill="#f7c9a2" opacity={0.55} />
          <path d="M 470 240 C 505 300 505 390 455 445 C 490 440 500 400 500 330 C 500 280 490 255 470 240 Z" fill="#b8693f" opacity={0.35} />
          {/* Pelo */}
          <path
            d="M 292 300 C 280 210 330 165 400 168 C 470 160 525 200 512 300 C 500 262 480 245 455 240 C 450 258 420 262 395 248 C 380 262 350 262 335 246 C 318 258 305 275 292 300 Z"
            fill="#2e1d12"
          />
          <path d="M 340 190 C 370 172 420 170 450 182" stroke="#7a5236" strokeWidth={6} fill="none" strokeLinecap="round" opacity={0.6} />
          {/* Cejas */}
          <path d={`M 330 ${300 - abre * 6} q 25 -14 50 -2`} stroke="#2a1a10" strokeWidth={11} fill="none" strokeLinecap="round" />
          <path d={`M 420 ${298 - abre * 6} q 25 -12 50 2`} stroke="#2a1a10" strokeWidth={11} fill="none" strokeLinecap="round" />
          {/* Ojos */}
          {[355, 445].map((cx) => (
            <g key={cx}>
              <ellipse cx={cx} cy={335} rx={22} ry={parpadeo ? 2 : 24} fill="white" />
              {!parpadeo ? (
                <>
                  <circle cx={cx - 8} cy={331} r={12} fill="#1d130c" />
                  <circle cx={cx - 12} cy={326} r={4} fill="white" />
                </>
              ) : null}
            </g>
          ))}
          {/* Nariz */}
          <path d="M 392 350 q -10 26 4 32 q 8 3 14 -2" stroke="#b5683f" strokeWidth={6} fill="none" strokeLinecap="round" />
          {/* Mejillas */}
          <ellipse cx={330} cy={385} rx={20} ry={11} fill="#e8846a" opacity={0.35} />
          <ellipse cx={470} cy={385} rx={20} ry={11} fill="#e8846a" opacity={0.35} />
          {/* Boca sincronizada */}
          <g>
            <ellipse cx={398} cy={413} rx={28 - abre * 6} ry={4 + abre * 20} fill="#5c1d1a" />
            {abre > 0.25 ? <rect x={380} y={408 - abre * 18} width={36} height={8} rx={4} fill="white" /> : null}
            {abre > 0.35 ? <ellipse cx={398} cy={418 + abre * 8} rx={13} ry={5 + abre * 4} fill="#d3605a" /> : null}
          </g>
        </g>

        {/* Brazo que señala */}
        <g>
          <line x1={hombro.x} y1={hombro.y} x2={codo.x} y2={codo.y} stroke="#f2c200" strokeWidth={92} strokeLinecap="round" />
          <line x1={codo.x} y1={codo.y} x2={mano.x} y2={mano.y} stroke="#f0bf00" strokeWidth={80} strokeLinecap="round" />
          <circle cx={mano.x + 26 * Math.cos(dir)} cy={mano.y + 26 * Math.sin(dir)} r={42} fill="#e5a173" />
          {/* Pulgar */}
          <ellipse
            cx={mano.x + 40 * Math.cos(dir) + 22 * Math.cos(dir - 1.4)}
            cy={mano.y + 40 * Math.sin(dir) + 22 * Math.sin(dir - 1.4)}
            rx={14}
            ry={22}
            fill="#e9a374"
            transform={`rotate(${antebrazo} ${mano.x + 40 * Math.cos(dir) + 22 * Math.cos(dir - 1.4)} ${mano.y + 40 * Math.sin(dir) + 22 * Math.sin(dir - 1.4)})`}
          />
          {/* Índice (se recoge en la pose "explica") */}
          <line
            x1={mano.x + 50 * Math.cos(dir)}
            y1={mano.y + 50 * Math.sin(dir)}
            x2={mano.x + (50 + interpolate(dedo, [0, 1], [10, 62], CL)) * Math.cos(dir)}
            y2={mano.y + (50 + interpolate(dedo, [0, 1], [10, 62], CL)) * Math.sin(dir)}
            stroke="#eaa678"
            strokeWidth={26}
            strokeLinecap="round"
          />
        </g>
      </g>
    </svg>
  );
};
