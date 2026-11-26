// Fondo de papel, rótulo (etiqueta + subtítulo karaoke) y título con insignia.
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Easing } from "remotion";
import { borroso, resorte, tramo } from "./anim";
import { C, MONO, SANS, SERIF, TITULO, Z } from "./estilo";
import type { Trozo } from "./tipos";

export const Fondo = () => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(ellipse 120% 80% at 45% 30%, #f1eee8 0%, ${C.fondo} 55%, ${C.fondo2} 100%)`,
    }}
  >
    {/* Trama de puntos (halftone) abajo a la derecha y arriba a la izquierda */}
    <AbsoluteFill
      style={{
        backgroundImage: "radial-gradient(rgba(60,50,40,0.13) 2px, transparent 2.6px)",
        backgroundSize: "14px 14px",
        WebkitMaskImage:
          "radial-gradient(ellipse 55% 45% at 100% 82%, black 0%, transparent 70%), radial-gradient(ellipse 40% 25% at 100% 0%, rgba(0,0,0,0.6) 0%, transparent 70%)",
      }}
    />
    {/* Grano de papel */}
    <AbsoluteFill
      style={{
        opacity: 0.08,
        backgroundImage:
          "repeating-radial-gradient(circle at 17% 32%, rgba(0,0,0,0.5) 0 1px, transparent 1px 7px), repeating-radial-gradient(circle at 71% 63%, rgba(0,0,0,0.4) 0 1px, transparent 1px 11px)",
        backgroundSize: "61px 61px, 89px 89px",
      }}
    />
    {/* Viñeta */}
    <AbsoluteFill style={{ boxShadow: "inset 0 0 220px rgba(70,55,40,0.18)" }} />
  </AbsoluteFill>
);

// A1: etiqueta mono + subtítulo palabra a palabra.
export const Rotulo = ({
  etiqueta,
  trozos,
  dur,
  ultima,
}: {
  readonly etiqueta: string;
  readonly trozos: readonly Trozo[];
  readonly dur: number;
  readonly ultima: boolean;
}) => {
  const f = useCurrentFrame();
  let i = trozos.length - 1;
  while (i > 0 && f < trozos[i].desde) i--;
  const trozo = trozos[i];
  const siguiente = trozos[i + 1]?.desde ?? (ultima ? Infinity : dur);
  const fuera = Number.isFinite(siguiente) ? tramo(f, siguiente - 3, siguiente, 0, 1, Easing.linear) : 0;
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: Z.margen,
          top: Z.etiquetaY,
          fontFamily: MONO,
          fontSize: 30,
          color: C.gris,
          letterSpacing: 0.5,
          opacity: tramo(f, 0, 6),
        }}
      >
        // {etiqueta}
      </div>
      <div
        style={{
          position: "absolute",
          left: Z.margen,
          top: Z.subtituloY,
          width: 1080 - Z.margen * 2,
          fontFamily: SANS,
          fontWeight: 700,
          fontSize: 58,
          lineHeight: 1.12,
          letterSpacing: -0.8,
          color: C.tinta,
          opacity: 1 - fuera,
        }}
      >
        {trozo
          ? trozo.palabras.map((p, j) => {
              const t = tramo(f, p.f - 2, p.f + 6, 0, 1, Easing.out(Easing.quad));
              const color = p.clave ? C.rojo : C.tinta;
              return (
                <span
                  key={j}
                  style={{
                    opacity: 0.15 + 0.85 * t,
                    color: `color-mix(in srgb, ${color} ${Math.round(t * 100)}%, ${p.clave ? "#f2a9a5" : C.grisClaro})`,
                    filter: borroso((1 - t) * 3),
                    display: f < p.f - 2 ? "none" : "inline",
                    ...(p.clave
                      ? { fontFamily: SERIF, fontStyle: "italic", fontWeight: 400, fontSize: 66, letterSpacing: 0 }
                      : {}),
                  }}
                >
                  {p.t}{" "}
                </span>
              );
            })
          : null}
      </div>
    </>
  );
};

type Version = {
  readonly f: number;
  readonly texto: string;
  readonly gris?: boolean;
  readonly tachar?: number;
};

const Letras = ({ v, sale }: { readonly v: Version; readonly sale: number }) => {
  const f = useCurrentFrame();
  const t = tramo(f, v.f + (v.f === 0 ? 3 : 0), v.f + (v.f === 0 ? 9 : 6), 0, 1, Easing.out(Easing.cubic));
  const s = Number.isFinite(sale) ? tramo(f, sale - 3, sale, 0, 1, Easing.in(Easing.quad)) : 0;
  const tach = v.tachar !== undefined ? tramo(f, v.tachar, v.tachar + 7) : 0;
  const largo = v.texto.replace(/\*/g, "").length;
  const tam = Math.min(132, 760 / (largo * 0.5));
  const gris = v.gris || tach > 0;
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        bottom: 0,
        whiteSpace: "nowrap",
        fontFamily: TITULO,
        fontSize: tam,
        lineHeight: 1,
        letterSpacing: `${(1 - t) * 0.35 + s * 0.3}em`,
        opacity: t * (1 - s),
        filter: borroso((1 - t) * 12 + s * 10),
        color: gris ? C.gris : C.tinta,
        transformOrigin: "left bottom",
      }}
    >
      {v.texto.split(/(\*[^*]+\*)/).map((p, i) =>
        p.startsWith("*") ? (
          <span key={i} style={{ color: gris ? "#b9b3ab" : C.rojo }}>
            {p.slice(1, -1)}
          </span>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
      {tach > 0 ? (
        <div
          style={{
            position: "absolute",
            left: -6,
            top: "50%",
            height: 10,
            width: `calc(${tach * 100}% + 12px)`,
            background: C.rojo,
            borderRadius: 5,
          }}
        />
      ) : null}
    </div>
  );
};

// A2–A4: título condensado con cambios, tachado e insignia.
export const TituloAnimado = ({
  versiones,
  num,
  sobre,
}: {
  readonly versiones: readonly Version[];
  readonly num?: number;
  readonly sobre?: string;
}) => {
  const f = useCurrentFrame();
  const visibles = versiones.filter((v, i) => {
    const sale = versiones[i + 1]?.f ?? Infinity;
    return f >= v.f && f < sale;
  });
  const s = resorte(f, 2, 220, 11);
  return (
    <>
      {sobre ? (
        <div
          style={{
            position: "absolute",
            left: Z.margen,
            top: Z.tituloY,
            fontFamily: MONO,
            fontSize: 25,
            color: C.gris,
            opacity: tramo(f, 0, 6),
          }}
        >
          // {sobre}
        </div>
      ) : null}
      <div style={{ position: "absolute", left: Z.margen, top: Z.tituloY + 40, width: 820, height: 140 }}>
        {versiones.map((v, i) =>
          visibles.includes(v) || (versiones[i + 1] && f >= versiones[i + 1].f - 3 && f < versiones[i + 1].f) ? (
            <Letras key={i} v={v} sale={versiones[i + 1]?.f ?? Infinity} />
          ) : null,
        )}
      </div>
      {num !== undefined ? (
        <div
          style={{
            position: "absolute",
            right: Z.margen,
            top: Z.tituloY + 56,
            width: 104,
            height: 108,
            borderRadius: 20,
            background: "linear-gradient(160deg,#2a2a2a,#0d0d0d)",
            boxShadow: "0 6px 0 #000, 0 14px 22px rgba(0,0,0,0.28)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: TITULO,
            fontSize: 78,
            color: "white",
            scale: String(s),
            rotate: `${(1 - s) * -20}deg`,
          }}
        >
          {num}
        </div>
      ) : null}
    </>
  );
};
