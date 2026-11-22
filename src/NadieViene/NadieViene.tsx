import {
  AbsoluteFill,
  Easing,
  interpolate,
  Sequence,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { CLAMP, MONTSERRAT, temblor } from "../Viral/util";

// Video vertical de tipografía cinética: "Nadie viene a salvarte".
// Escenas en fotogramas (30 fps).
const ESCENAS = {
  Gancho: { from: 0, dur: 80 },
  Nadie: { from: 80, dur: 100 },
  EresTu: { from: 180, dur: 90 },
  UnPorCiento: { from: 270, dur: 130 },
  Duele: { from: 400, dur: 90 },
  Final: { from: 490, dur: 110 },
} as const;

export const DURACION_NADIE_VIENE = 600;

const ORO = "#FFE11A";
const ROJO = "#ef4444";

const Camara = ({
  children,
  fondo,
  sacudidas = [],
}: {
  readonly children: React.ReactNode;
  readonly fondo: string;
  readonly sacudidas?: readonly number[];
}) => {
  const frame = useCurrentFrame();
  const t =
    sacudidas.map((s) => temblor(frame, s)).find((x) => x !== "0px 0px") ??
    "0px 0px";
  return (
    <AbsoluteFill style={{ background: fondo, overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          scale: String(
            interpolate(frame, [0, 8], [1.15, 1], {
              ...CLAMP,
              easing: Easing.out(Easing.cubic),
            }),
          ),
          translate: t,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: 30,
          padding: "0 70px",
          textAlign: "center",
        }}
      >
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Destello = ({
  en,
  color = "white",
}: {
  readonly en: number;
  readonly color?: string;
}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        backgroundColor: color,
        opacity: interpolate(frame, [en, en + 1, en + 8], [0, 0.8, 0], CLAMP),
      }}
    />
  );
};

// Palabra que "golpea" la pantalla: entra grande y se asienta.
const Golpe = ({
  en,
  children,
  size = 170,
  color = "white",
  glow,
}: {
  readonly en: number;
  readonly children: React.ReactNode;
  readonly size?: number;
  readonly color?: string;
  readonly glow?: string;
}) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        fontFamily: MONTSERRAT,
        fontWeight: 900,
        fontSize: size,
        lineHeight: 1,
        color,
        textTransform: "uppercase",
        opacity: interpolate(frame, [en, en + 2], [0, 1], CLAMP),
        scale: String(
          interpolate(frame, [en, en + 6], [2.2, 1], {
            ...CLAMP,
            easing: Easing.out(Easing.back(1.4)),
          }),
        ),
        textShadow: glow ? `0 0 70px ${glow}` : undefined,
      }}
    >
      {children}
    </div>
  );
};

const Linea = ({
  en,
  children,
  size = 90,
  color = "#d4d4d4",
  weight = 800,
}: {
  readonly en: number;
  readonly children: React.ReactNode;
  readonly size?: number;
  readonly color?: string;
  readonly weight?: number;
}) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        fontFamily: MONTSERRAT,
        fontWeight: weight,
        fontSize: size,
        lineHeight: 1.15,
        color,
        opacity: interpolate(frame, [en, en + 5], [0, 1], CLAMP),
        translate: `0px ${interpolate(frame, [en, en + 8], [60, 0], {
          ...CLAMP,
          easing: Easing.out(Easing.cubic),
        })}px`,
      }}
    >
      {children}
    </div>
  );
};

const Gancho = () => (
  <Camara
    fondo="radial-gradient(circle at 50% 45%, #2a0707 0%, #050505 70%)"
    sacudidas={[4, 24, 44]}
  >
    <Golpe en={4}>Nadie</Golpe>
    <Golpe en={24} size={130} color="#bdbdbd">
      viene a
    </Golpe>
    <Golpe en={44} size={165} color={ROJO} glow="rgba(239,68,68,0.6)">
      salvarte
    </Golpe>
    <Destello en={44} color={ROJO} />
  </Camara>
);

const Tachado = ({
  en,
  children,
}: {
  readonly en: number;
  readonly children: string;
}) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ position: "relative" }}>
      <Linea en={en} size={110} weight={900}>
        {children}
      </Linea>
      <div
        style={{
          position: "absolute",
          left: -20,
          right: -20,
          top: "52%",
          height: 16,
          borderRadius: 8,
          backgroundColor: ROJO,
          rotate: "-4deg",
          transformOrigin: "left center",
          scale: `${interpolate(frame, [en + 12, en + 18], [0, 1], CLAMP)} 1`,
        }}
      />
    </div>
  );
};

const Nadie = () => (
  <Camara fondo="#0b0b0b" sacudidas={[16, 46, 76]}>
    <Tachado en={4}>Ni tu jefe.</Tachado>
    <Tachado en={34}>Ni el gobierno.</Tachado>
    <Tachado en={64}>Ni la suerte.</Tachado>
  </Camara>
);

const EresTu = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - 38, fps, config: { damping: 9 } });
  return (
    <Camara
      fondo="radial-gradient(circle at 50% 55%, #3a2e00 0%, #050505 70%)"
      sacudidas={[38]}
    >
      <Linea en={4}>El único que puede</Linea>
      <Linea en={14}>cambiar tu vida</Linea>
      <div
        style={{
          fontFamily: MONTSERRAT,
          fontWeight: 900,
          fontSize: 210,
          whiteSpace: "nowrap",
          color: ORO,
          marginTop: 30,
          scale: String(s),
          textShadow: "0 0 90px rgba(255,225,26,0.55)",
        }}
      >
        ERES TÚ
      </div>
      <Destello en={38} color={ORO} />
    </Camara>
  );
};

const UnPorCiento = () => {
  const frame = useCurrentFrame();
  const dia = Math.round(
    interpolate(frame, [40, 105], [1, 365], {
      ...CLAMP,
      easing: Easing.in(Easing.quad),
    }),
  );
  const valor = Math.pow(1.01, dia);
  const llego = dia === 365;
  return (
    <Camara fondo="#0b0b0b" sacudidas={[106]}>
      <Linea en={4}>Mejora solo</Linea>
      <Golpe en={14} size={220} color={ORO}>
        1%
      </Golpe>
      <Linea en={26}>cada día</Linea>
      <div
        style={{
          marginTop: 50,
          opacity: interpolate(frame, [36, 42], [0, 1], CLAMP),
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div
          style={{
            fontFamily: MONTSERRAT,
            fontWeight: 500,
            fontSize: 56,
            color: "#8a8a8a",
          }}
        >
          Día {dia}
        </div>
        <div
          style={{
            fontFamily: MONTSERRAT,
            fontWeight: 900,
            fontSize: llego ? 210 : 170,
            color: llego ? ORO : "white",
            fontVariantNumeric: "tabular-nums",
            textShadow: llego ? "0 0 80px rgba(255,225,26,0.6)" : undefined,
          }}
        >
          {valor.toFixed(1)}x
        </div>
        <Linea en={110} size={60} color="#bdbdbd" weight={500}>
          mejor que hoy
        </Linea>
      </div>
      <Destello en={106} color={ORO} />
    </Camara>
  );
};

const Duele = () => {
  const frame = useCurrentFrame();
  const cambio = frame >= 45;
  return (
    <Camara fondo={cambio ? "#050505" : "#1a0505"} sacudidas={[45]}>
      <Linea en={4} size={130} weight={900} color={cambio ? "#555" : ROJO}>
        Hoy duele.
      </Linea>
      <Linea en={45} size={130} weight={900} color={ORO}>
        Mañana
      </Linea>
      <Linea en={52} size={130} weight={900} color={ORO}>
        te hace fuerte.
      </Linea>
      <Destello en={45} />
    </Camara>
  );
};

const Final = () => {
  const frame = useCurrentFrame();
  const pulso = 1 + Math.sin(frame / 5) * 0.03;
  return (
    <Camara
      fondo="radial-gradient(circle at 50% 45%, #3a2e00 0%, #050505 75%)"
      sacudidas={[4]}
    >
      <div
        style={{
          scale: String(pulso),
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 10,
        }}
      >
        <Golpe en={4} size={170} color={ORO} glow="rgba(255,225,26,0.6)">
          Empieza
        </Golpe>
        <Golpe en={14} size={240} glow="rgba(255,255,255,0.4)">
          hoy
        </Golpe>
      </div>
      <div
        style={{
          marginTop: 120,
          display: "flex",
          flexDirection: "column",
          gap: 24,
          alignItems: "center",
        }}
      >
        <Linea en={40} size={64} color="white">
          🔖 Guarda este video
        </Linea>
        <Linea en={55} size={64} color="white">
          ➕ Sígueme para más
        </Linea>
      </div>
      <Destello en={4} color={ORO} />
    </Camara>
  );
};

const BarraProgreso = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        height: 12,
        width: `${(frame / durationInFrames) * 100}%`,
        backgroundColor: ORO,
      }}
    />
  );
};

export const NadieViene = () => (
  <AbsoluteFill style={{ backgroundColor: "black" }}>
    <Sequence
      name="Gancho"
      from={ESCENAS.Gancho.from}
      durationInFrames={ESCENAS.Gancho.dur}
    >
      <Gancho />
    </Sequence>
    <Sequence
      name="Nadie"
      from={ESCENAS.Nadie.from}
      durationInFrames={ESCENAS.Nadie.dur}
    >
      <Nadie />
    </Sequence>
    <Sequence
      name="Eres tú"
      from={ESCENAS.EresTu.from}
      durationInFrames={ESCENAS.EresTu.dur}
    >
      <EresTu />
    </Sequence>
    <Sequence
      name="1%"
      from={ESCENAS.UnPorCiento.from}
      durationInFrames={ESCENAS.UnPorCiento.dur}
    >
      <UnPorCiento />
    </Sequence>
    <Sequence
      name="Duele"
      from={ESCENAS.Duele.from}
      durationInFrames={ESCENAS.Duele.dur}
    >
      <Duele />
    </Sequence>
    <Sequence
      name="Final"
      from={ESCENAS.Final.from}
      durationInFrames={ESCENAS.Final.dur}
    >
      <Final />
    </Sequence>
    <BarraProgreso />
  </AbsoluteFill>
);
