import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { SUBTITULOS } from "./datos";
import { CLAMP, MONTSERRAT } from "./util";

// Subtítulos estilo TikTok: 1 a 3 palabras por página, palabra activa en amarillo.
export const Subtitulos = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ms = (frame / fps) * 1000;

  const pagina = SUBTITULOS.find(
    (p, i) =>
      ms >= p[0].startMs &&
      ms <
        Math.max(
          p[p.length - 1].endMs + 250,
          (SUBTITULOS[i + 1]?.[0].startMs ?? Infinity) - 1,
        ) &&
      ms < (SUBTITULOS[i + 1]?.[0].startMs ?? Infinity),
  );
  if (!pagina) return null;

  const inicioPagina = (pagina[0].startMs / 1000) * fps;

  return (
    <div
      style={{
        position: "absolute",
        top: 1160,
        left: 60,
        right: 60,
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        alignItems: "center",
        gap: "8px 34px",
        scale: String(
          interpolate(
            frame,
            [inicioPagina, inicioPagina + 5],
            [0.75, 1],
            CLAMP,
          ),
        ),
      }}
    >
      {pagina.map((p, i) => {
        const siguiente = pagina[i + 1]?.startMs ?? p.endMs + 400;
        const activa = ms >= p.startMs && ms < siguiente;
        const inicio = (p.startMs / 1000) * fps;
        return (
          <span
            key={p.startMs}
            style={{
              fontFamily: MONTSERRAT,
              fontWeight: 900,
              fontSize: 104,
              lineHeight: 1.1,
              textTransform: "uppercase",
              color: activa ? "#FFE11A" : "white",
              WebkitTextStroke: "14px black",
              paintOrder: "stroke fill",
              textShadow: "0 8px 0 rgba(0,0,0,0.6)",
              scale: String(
                activa
                  ? interpolate(
                      frame,
                      [inicio, inicio + 3, inicio + 7],
                      [1, 1.15, 1.08],
                      CLAMP,
                    )
                  : 1,
              ),
            }}
          >
            {p.text}
          </span>
        );
      })}
    </div>
  );
};
