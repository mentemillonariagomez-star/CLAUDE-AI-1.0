import { Composition, Folder, Still } from "remotion";
import { HelloWorld } from "./HelloWorld";
import { DeNadaATodo } from "./DeNadaATodo/DeNadaATodo";
import { Escena } from "./MiPrimerVideo/Escena";
import { Perfil } from "./Perfil/Perfil";
import { ViralDeNadaATodo } from "./Viral/Viral";
import { MiPrimerVideo } from "./MiPrimerVideo/MiPrimerVideo";
import { Pasos } from "./Pasos/Pasos";
import { Historia } from "./Historia/Historia";
import { HISTORIA as POV1 } from "./Historia/videos/pov1";
import { HISTORIA as POV2 } from "./Historia/videos/pov2";
import { HISTORIA as POV3 } from "./Historia/videos/pov3";
import { HISTORIA as POV4 } from "./Historia/videos/pov4";
import { HISTORIA as POV5 } from "./Historia/videos/pov5";
import { HISTORIA as POV6 } from "./Historia/videos/pov6";
import { HISTORIA as POV7 } from "./Historia/videos/pov7";
import { HISTORIA as POV8 } from "./Historia/videos/pov8";
import { HISTORIA as POV9 } from "./Historia/videos/pov9";
import { Explicador } from "./Explicador/Explicador";
import { VIDEO as ERRORES } from "./Explicador/videos/errores";
import { VIDEO as SEGUIDORES } from "./Explicador/videos/seguidores";
import { VIDEO as GUION } from "./Explicador/videos/guion";
import { VIDEO as V_IA } from "./Explicador/videos/ia";
import { VIDEO as V_PORTADAS } from "./Explicador/videos/portadas";
import { VIDEO as V_SUBTITULOS } from "./Explicador/videos/subtitulos";
import { VIDEO as V_GANCHOS } from "./Explicador/videos/ganchos";
import { VIDEO as V_PUBLICAR } from "./Explicador/videos/publicar";
import { Sketch } from "./Sketch/Sketch";
import { DURACION_TOTAL as DURACION_SKETCH } from "./Sketch/datos";
import { calcularDuracion, Comparacion } from "./Comparacion/Comparacion";
import { CONFIG as CONFIG_COMPARACION } from "./Comparacion/config";
import { DURACION_TOTAL as DURACION_PASOS } from "./Pasos/datos";
import { DURACION_NADIE_VIENE, NadieViene } from "./NadieViene/NadieViene";
import { Logo } from "./HelloWorld/Logo";
import { Title } from "./HelloWorld/Title";

// Each <Composition> is an entry in the sidebar!

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Folder name="Perfil-TikTok">
        <Still
          id="PerfilNegroOro"
          component={Perfil}
          width={1080}
          height={1080}
          defaultProps={{
            fondo:
              "radial-gradient(circle at 50% 45%, #2a1d03 0%, #050505 70%)",
            anillo: "#fbbf24",
            flecha: "#FFE11A",
            brillo: "#f59e0b",
          }}
        />
        <Still
          id="PerfilAmarillo"
          component={Perfil}
          width={1080}
          height={1080}
          defaultProps={{
            fondo:
              "radial-gradient(circle at 50% 40%, #fff27a 0%, #FFE11A 45%, #f5b800 100%)",
            anillo: "#0a0a0a",
            flecha: "#0a0a0a",
            brillo: "#ffffff",
          }}
        />
        <Still
          id="PerfilNeon"
          component={Perfil}
          width={1080}
          height={1080}
          defaultProps={{
            fondo:
              "linear-gradient(135deg, #4c1d95 0%, #1e1b4b 50%, #020617 100%)",
            anillo: "#fbbf24",
            flecha: "#22d3ee",
            brillo: "#a855f7",
          }}
        />
      </Folder>
      <Folder name="Historias">
        {[POV1, POV2, POV3, POV4, POV5, POV6, POV7, POV8, POV9].map((h) => (
          <Composition
            key={h.slug}
            id={`Historia-${h.slug}`}
            component={Historia}
            defaultProps={{ datos: h }}
            durationInFrames={h.total}
            fps={30}
            width={1080}
            height={1920}
          />
        ))}
      </Folder>
      <Folder name="Explicadores">
        {[
          ERRORES,
          SEGUIDORES,
          GUION,
          V_IA,
          V_PORTADAS,
          V_SUBTITULOS,
          V_GANCHOS,
          V_PUBLICAR,
        ].map((v) => (
          <Composition
            key={v.slug}
            id={`Explicador-${v.slug}`}
            component={Explicador}
            defaultProps={{ video: v }}
            durationInFrames={v.total}
            fps={30}
            width={1080}
            height={1920}
          />
        ))}
      </Folder>
      <Composition
        id="Sketch3D"
        component={Sketch}
        durationInFrames={DURACION_SKETCH}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="Comparacion"
        component={Comparacion}
        defaultProps={CONFIG_COMPARACION}
        calculateMetadata={calcularDuracion}
        durationInFrames={300}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="Pasos"
        component={Pasos}
        durationInFrames={DURACION_PASOS}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="NadieViene"
        component={NadieViene}
        durationInFrames={DURACION_NADIE_VIENE}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="ViralDeNadaATodo"
        component={ViralDeNadaATodo}
        durationInFrames={1333}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="DeNadaATodo"
        component={DeNadaATodo}
        durationInFrames={1380}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="MiPrimerVideo"
        component={MiPrimerVideo}
        durationInFrames={230}
        fps={30}
        width={1920}
        height={1080}
      />
      <Folder name="Escenas">
        <Composition
          id="Escena"
          component={Escena}
          durationInFrames={90}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={{
            titulo: "Hola, Remotion",
            subtitulo: "Mi primer video hecho con código",
            acento: "#38bdf8",
            style: {
              backgroundColor: "#0f172a",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            },
          }}
        />
      </Folder>
      <Folder name="Elements">
        <Composition
          id="Logo"
          component={Logo}
          durationInFrames={150}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={{
            logoColor1: "#91EAE4",
            logoColor2: "#86A8E7",
          }}
        />
        <Composition
          id="Title"
          component={Title}
          durationInFrames={115}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={{
            titleText: "Welcome to Remotion",
            titleColor: "#000000",
          }}
        />
      </Folder>
      <Composition
        // You can take the "id" to render a video:
        // bunx remotion render HelloWorld
        id="HelloWorld"
        component={HelloWorld}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        // You can override these props for each render:
        // https://www.remotion.dev/docs/parametrized-rendering
        defaultProps={{
          titleText: "Welcome to Remotion",
          titleColor: "#000000",
        }}
      />
    </>
  );
};
