import { Audio } from "@remotion/media";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { Encabezado } from "../Pasos/Encabezado";
import { CLAMP, Fondo, Titular } from "../Pasos/estilo";
import { Personaje } from "../Pasos/Personaje";
import { Pieza, useMomento } from "./Elementos";
import type { DatosVideo, Escena } from "./tipos";

const Salida = ({
  children,
  dur,
}: {
  readonly children: React.ReactNode;
  readonly dur: number;
}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        opacity: interpolate(frame, [dur - 5, dur], [1, 0], CLAMP),
        translate: `${interpolate(frame, [dur - 5, dur], [0, -80], { ...CLAMP, easing: Easing.in(Easing.quad) })}px 0px`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

// Ajusta el tamaño del título para que quepa junto a la insignia del número.
const tamTitulo = (
  texto: string,
  rojo: string | undefined,
  n: number | undefined,
  base = 128,
) => {
  const letras = (texto + " " + (rojo ?? "")).trim().length;
  const ancho = n ? 800 : 940;
  return Math.min(base, Math.floor(ancho / (letras * 0.47)));
};

const EscenaVista = ({
  e,
  pasos,
}: {
  readonly e: Escena;
  readonly pasos: [string, string][];
}) => {
  const m = useMomento(e.frases);
  const t = e.titulo;
  return (
    <AbsoluteFill>
      {t ? (
        <Titular
          etiqueta={t.etiqueta}
          texto={t.texto}
          rojo={t.rojo}
          n={t.n}
          en={m(t.en)}
          size={t.size ?? tamTitulo(t.texto, t.rojo, t.n)}
          top={t.top}
        />
      ) : null}
      {e.elementos.map((el, i) => (
        <Pieza key={i} e={el} frases={e.frases} pasos={pasos} />
      ))}
    </AbsoluteFill>
  );
};

// Formato "explicador por pasos" genérico: todo sale de los datos del video.
export const Explicador = ({
  video,
  conVoz = true,
}: {
  readonly video: DatosVideo;
  readonly conVoz?: boolean;
}) => (
  <AbsoluteFill>
    <Fondo />
    {video.escenas.map((e) => (
      <Sequence key={e.id} name={e.id} from={e.from} durationInFrames={e.dur}>
        <Salida dur={e.dur}>
          <EscenaVista e={e} pasos={video.pasos} />
        </Salida>
      </Sequence>
    ))}
    <Encabezado escenas={video.escenas} frases={video.frases} />
    <Personaje bocas={video.boca} />
    {conVoz ? (
      <Audio
        name="Narración"
        src={staticFile(`explicador/${video.slug}/narracion.wav`)}
      />
    ) : null}
    <Audio
      name="Música y efectos"
      src={staticFile(`explicador/${video.slug}/musica.wav`)}
    />
  </AbsoluteFill>
);
