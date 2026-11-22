import { Composition, Folder, Still } from "remotion";
import { TrucoAncla, TrucoPrecio999, TrucoSenuelo } from "./Serie/Trucos";
import { HelloWorld } from "./HelloWorld";
import { DeNadaATodo } from "./DeNadaATodo/DeNadaATodo";
import { Escena } from "./MiPrimerVideo/Escena";
import { ClaudeCanal } from "./Pantalla/Pantalla";
import { ZerxDeNadaATodo } from "./Pantalla/DeNadaZerx";
import {
  IAAhorraTiempo,
  InteresCompuesto,
  Regla1Porciento,
} from "./Serie/Videos";
import { Perfil } from "./Perfil/Perfil";
import { ViralDeNadaATodo } from "./Viral/Viral";
import { MiPrimerVideo } from "./MiPrimerVideo/MiPrimerVideo";
import { Pasos } from "./Pasos/Pasos";
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
      <Folder name="Trucos-tiendas">
        <Composition
          id="TrucoPrecio999"
          component={TrucoPrecio999}
          durationInFrames={1002}
          fps={30}
          width={1080}
          height={1920}
        />
        <Composition
          id="TrucoSenuelo"
          component={TrucoSenuelo}
          durationInFrames={1048}
          fps={30}
          width={1080}
          height={1920}
        />
        <Composition
          id="TrucoAncla"
          component={TrucoAncla}
          durationInFrames={823}
          fps={30}
          width={1080}
          height={1920}
        />
      </Folder>
      <Folder name="Serie-zerx">
        <Composition
          id="Regla1Porciento"
          component={Regla1Porciento}
          durationInFrames={876}
          fps={30}
          width={1080}
          height={1920}
        />
        <Composition
          id="IAAhorraTiempo"
          component={IAAhorraTiempo}
          durationInFrames={1014}
          fps={30}
          width={1080}
          height={1920}
        />
        <Composition
          id="InteresCompuesto"
          component={InteresCompuesto}
          durationInFrames={860}
          fps={30}
          width={1080}
          height={1920}
        />
      </Folder>
      <Composition
        id="ZerxDeNadaATodo"
        component={ZerxDeNadaATodo}
        durationInFrames={1333}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="ClaudeCanal"
        component={ClaudeCanal}
        durationInFrames={878}
        fps={30}
        width={1080}
        height={1920}
      />
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
