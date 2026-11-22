import { Composition, Folder } from "remotion";
import { HelloWorld } from "./HelloWorld";
import { DeNadaATodo } from "./DeNadaATodo/DeNadaATodo";
import { Escena } from "./MiPrimerVideo/Escena";
import { ViralDeNadaATodo } from "./Viral/Viral";
import { MiPrimerVideo } from "./MiPrimerVideo/MiPrimerVideo";
import { Logo } from "./HelloWorld/Logo";
import { Title } from "./HelloWorld/Title";

// Each <Composition> is an entry in the sidebar!

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="ViralDeNadaATodo"
        component={ViralDeNadaATodo}
        durationInFrames={1331}
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
