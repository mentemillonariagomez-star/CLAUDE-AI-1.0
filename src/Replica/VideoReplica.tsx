// Motor del replicador: monta un video a partir de los datos generados por scripts/replica/generar.py.
import { Audio } from "@remotion/media";
import { AbsoluteFill, Sequence, staticFile, useCurrentFrame } from "remotion";
import { salida, tramo } from "./anim";
import { Fondo, Rotulo, TituloAnimado } from "./Escenario";
import { Chip, Confeti, Nota, Sello } from "./Piezas";
import { Presentador } from "./Presentador";
import type { DatosVideo, EscenaDatos, Evento } from "./tipos";
import { WIDGETS } from "./Widgets";

const SALIDA = 5;
const num = (v: unknown, d: number) => (typeof v === "number" ? v : d);
const str = (v: unknown, d = "") => (typeof v === "string" ? v : d);

const Escena = ({ e, ultima }: { readonly e: EscenaDatos; readonly ultima: boolean }) => {
  const f = useCurrentFrame();
  const W = WIDGETS[e.widget.tipo];
  const sellos = e.eventos.filter((v) => v.accion === "sello");
  // A6: el escenario se "lava" justo antes de que caiga un sello.
  const lavado = Math.max(0, ...sellos.map((s) => tramo(f, s.f - 6, s.f)));
  const versiones = e.titulo
    ? [
        { f: 0, texto: e.titulo.texto },
        ...e.eventos
          .filter((v) => v.accion === "titulo")
          .map((v) => ({ f: v.f, texto: str(v.texto), gris: Boolean(v.gris) })),
      ].map((v, i, arr) => {
        const tachar = e.eventos.find((t) => t.accion === "tachar" && t.f >= v.f && t.f < (arr[i + 1]?.f ?? Infinity));
        return tachar ? { ...v, tachar: tachar.f } : v;
      })
    : [];
  const fuera = ultima ? {} : salida(f, e.dur);
  const de = (a: string) => e.eventos.filter((v) => v.accion === a);
  return (
    <AbsoluteFill>
      <Rotulo etiqueta={e.etiqueta} trozos={e.trozos} dur={e.dur} ultima={ultima} />
      <AbsoluteFill style={fuera}>
        {e.titulo ? <TituloAnimado versiones={versiones} num={e.titulo.num} sobre={e.titulo.sobre} /> : null}
        <AbsoluteFill style={{ opacity: 1 - 0.5 * lavado, filter: `grayscale(${lavado * 0.8})` }}>
          {W ? <W p={e.widget} m={e.marcas} /> : null}
        </AbsoluteFill>
        {sellos.map((s: Evento, i) => (
          <Sello key={i} texto={str(s.texto, "¡OK!")} en={s.f} x={num(s.x, 540)} y={num(s.y, 960)} rot={num(s.rot, -8)} tam={num(s.tam, 110)} />
        ))}
        {de("nota").map((s, i) => (
          <Nota key={i} texto={str(s.texto)} en={s.f} x={num(s.x, 60)} y={num(s.y, 1060)} rot={num(s.rot, -5)} />
        ))}
        {de("chip").map((s, i) => (
          <Chip key={i} texto={str(s.texto)} sub={str(s.sub) || undefined} en={s.f} x={num(s.x, 64)} y={num(s.y, 1300)} />
        ))}
        {de("confeti").map((s, i) => (
          <Confeti key={i} en={s.f} />
        ))}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const VideoReplica = ({ datos }: { readonly datos: DatosVideo }) => {
  const n = datos.escenas.length;
  return (
    <AbsoluteFill>
      <Fondo />
      {datos.escenas.map((e, i) => (
        <Sequence key={e.id} name={e.id} from={e.from} durationInFrames={e.dur + (i === n - 1 ? 0 : SALIDA)}>
          <Escena e={e} ultima={i === n - 1} />
        </Sequence>
      ))}
      {/* Sombra ambiental del presentador (degradado CSS, sin filtros) */}
      <div style={{ position: "absolute", right: -60, bottom: -60, width: 760, height: 860, background: "radial-gradient(ellipse 50% 50% at 55% 62%, rgba(58,42,16,0.20), transparent 70%)", zIndex: 24 }} />
      <Presentador boca={datos.boca} poses={datos.poses} />
      <Audio src={staticFile(`replica/${datos.slug}/voz.mp3`)} />
      <Audio src={staticFile(`replica/${datos.slug}/musica.wav`)} />
    </AbsoluteFill>
  );
};
