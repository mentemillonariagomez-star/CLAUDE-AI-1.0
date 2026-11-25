import { CanvasTexture, RepeatWrapping, SRGBColorSpace } from "three";
import { random } from "remotion";

const cache = new Map<string, CanvasTexture>();

const lienzo = (
  w: number,
  h: number,
  dibujar: (c: CanvasRenderingContext2D) => void,
  clave: string,
  repetir = 1,
) => {
  const hit = cache.get(clave);
  if (hit) return hit;
  const cv = document.createElement("canvas");
  cv.width = w;
  cv.height = h;
  const c = cv.getContext("2d") as CanvasRenderingContext2D;
  dibujar(c);
  const t = new CanvasTexture(cv);
  t.colorSpace = SRGBColorSpace;
  t.wrapS = t.wrapT = RepeatWrapping;
  t.repeat.set(repetir, repetir);
  cache.set(clave, t);
  return t;
};

// Fibra de coco: base marrón con muchas hebras cortas.
export const texCoco = () =>
  lienzo(
    512,
    512,
    (c) => {
      c.fillStyle = "#8a5530";
      c.fillRect(0, 0, 512, 512);
      for (let i = 0; i < 2600; i++) {
        const x = random(`cx${i}`) * 512,
          y = random(`cy${i}`) * 512,
          a = random(`ca${i}`) * Math.PI,
          l = 6 + random(`cl${i}`) * 14;
        c.strokeStyle =
          random(`cc${i}`) > 0.5
            ? "rgba(40,20,8,0.55)"
            : "rgba(160,110,70,0.45)";
        c.lineWidth = 1.5;
        c.beginPath();
        c.moveTo(x, y);
        c.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l);
        c.stroke();
      }
    },
    "coco",
  );

// Piel de fresa: rojo con semillas amarillas.
export const texFresa = () =>
  lienzo(
    512,
    512,
    (c) => {
      const g = c.createLinearGradient(0, 0, 0, 512);
      g.addColorStop(0, "#f0444f");
      g.addColorStop(1, "#c81f2e");
      c.fillStyle = g;
      c.fillRect(0, 0, 512, 512);
      for (let r = 0; r < 14; r++)
        for (let k = 0; k < 18; k++) {
          const x = k * 29 + (r % 2) * 14,
            y = r * 38 + 12;
          c.fillStyle = "#ffe066";
          c.beginPath();
          c.ellipse(x, y, 4, 7, 0, 0, Math.PI * 2);
          c.fill();
          c.fillStyle = "rgba(120,0,10,0.35)";
          c.beginPath();
          c.ellipse(x, y + 3, 6, 4, 0, 0, Math.PI * 2);
          c.fill();
        }
    },
    "fresa",
  );

// Cáscara de piña: rombos con borde oscuro.
export const texPina = () =>
  lienzo(
    512,
    512,
    (c) => {
      c.fillStyle = "#e9a92a";
      c.fillRect(0, 0, 512, 512);
      c.strokeStyle = "#8a5a10";
      c.lineWidth = 6;
      for (let i = -10; i < 20; i++) {
        c.beginPath();
        c.moveTo(i * 48, 0);
        c.lineTo(i * 48 + 512, 512);
        c.stroke();
        c.beginPath();
        c.moveTo(i * 48, 512);
        c.lineTo(i * 48 + 512, 0);
        c.stroke();
      }
      for (let i = 0; i < 120; i++) {
        c.fillStyle = "rgba(255,230,140,0.5)";
        c.beginPath();
        c.arc(
          random(`px${i}`) * 512,
          random(`py${i}`) * 512,
          3,
          0,
          Math.PI * 2,
        );
        c.fill();
      }
    },
    "pina",
  );

export const texTexto = (
  texto: string,
  fondo: string,
  color: string,
  w = 1024,
  h = 256,
  tam = 150,
) =>
  lienzo(
    w,
    h,
    (c) => {
      c.fillStyle = fondo;
      c.fillRect(0, 0, w, h);
      c.fillStyle = color;
      c.font = `900 ${tam}px Montserrat, Arial, sans-serif`;
      c.textAlign = "center";
      c.textBaseline = "middle";
      c.fillText(texto, w / 2, h / 2 + 6);
    },
    `t-${texto}-${fondo}-${color}`,
  );

export const texRayas = (a: string, b: string) =>
  lienzo(
    512,
    64,
    (c) => {
      for (let i = 0; i < 8; i++) {
        c.fillStyle = i % 2 ? b : a;
        c.fillRect(i * 64, 0, 64, 64);
      }
    },
    `r-${a}-${b}`,
  );

export const texCielo = (arriba: string, abajo: string) =>
  lienzo(
    16,
    256,
    (c) => {
      const g = c.createLinearGradient(0, 0, 0, 256);
      g.addColorStop(0, arriba);
      g.addColorStop(1, abajo);
      c.fillStyle = g;
      c.fillRect(0, 0, 16, 256);
    },
    `s-${arriba}-${abajo}`,
  );

export const texMadera = () =>
  lienzo(
    512,
    512,
    (c) => {
      c.fillStyle = "#7a5236";
      c.fillRect(0, 0, 512, 512);
      for (let i = 0; i < 8; i++) {
        c.fillStyle = i % 2 ? "#6d4830" : "#82583a";
        c.fillRect(0, i * 64, 512, 62);
      }
      for (let i = 0; i < 300; i++) {
        c.strokeStyle = "rgba(40,20,10,0.2)";
        c.beginPath();
        const y = random(`my${i}`) * 512;
        c.moveTo(0, y);
        c.bezierCurveTo(170, y + 6, 340, y - 6, 512, y);
        c.stroke();
      }
    },
    "madera",
    3,
  );
