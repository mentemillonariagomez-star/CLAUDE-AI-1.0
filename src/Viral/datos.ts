// Generado a partir de la narración: tiempos en fotogramas (30 fps) y subtítulos en ms.
export const DURACION_TOTAL = 1333;

export const ESCENAS = {
  Gancho: {
    from: 0,
    dur: 94,
    frases: [2, 69],
  },
  SinNada: {
    from: 94,
    dur: 138,
    frases: [4, 39, 79],
  },
  Idea: {
    from: 232,
    dur: 144,
    frases: [5, 56, 102],
  },
  Noches: {
    from: 376,
    dur: 146,
    frases: [5, 46, 101],
  },
  Fracasos: {
    from: 522,
    dur: 142,
    frases: [4, 31, 62, 98],
  },
  Levantarse: {
    from: 664,
    dur: 127,
    frases: [4, 51],
  },
  HastaQue: {
    from: 791,
    dur: 63,
    frases: [4],
  },
  TodoCambio: {
    from: 854,
    dur: 87,
    frases: [11, 44],
  },
  Mensaje: {
    from: 941,
    dur: 197,
    frases: [4, 60, 142],
  },
  Guardar: {
    from: 1138,
    dur: 96,
    frases: [4],
  },
  Loop: {
    from: 1234,
    dur: 99,
    frases: [4, 56],
  },
} as const;

// Texto de cada frase con el fotograma (relativo a la escena) de cada palabra.
export const ESCENAS_TEXTO = {
  Gancho: {
    from: 0,
    dur: 94,
    frases: [
      {
        texto: "Tenía cero pesos en la cuenta.",
        palabras: [2, 12, 22, 33, 39, 45],
      },
      {
        texto: "Cero.",
        palabras: [69],
      },
    ],
  },
  SinNada: {
    from: 94,
    dur: 138,
    frases: [
      {
        texto: "Sin dinero.",
        palabras: [4, 13],
      },
      {
        texto: "Sin contactos.",
        palabras: [39, 48],
      },
      {
        texto: "Sin nadie que creyera en él.",
        palabras: [79, 87, 97, 104, 117, 123],
      },
    ],
  },
  Idea: {
    from: 232,
    dur: 144,
    frases: [
      {
        texto: "Pero tenía una idea.",
        palabras: [5, 15, 26, 35],
      },
      {
        texto: "Y una sola regla:",
        palabras: [56, 61, 70, 80],
      },
      {
        texto: "nunca rendirse.",
        palabras: [102, 115],
      },
    ],
  },
  Noches: {
    from: 376,
    dur: 146,
    frases: [
      {
        texto: "Trabajó de noche,",
        palabras: [5, 20, 27],
      },
      {
        texto: "mientras todos dormían.",
        palabras: [46, 63, 75],
      },
      {
        texto: "Mil días seguidos.",
        palabras: [101, 110, 120],
      },
    ],
  },
  Fracasos: {
    from: 522,
    dur: 142,
    frases: [
      {
        texto: "Falló.",
        palabras: [4],
      },
      {
        texto: "Una vez.",
        palabras: [31, 41],
      },
      {
        texto: "Diez veces.",
        palabras: [62, 73],
      },
      {
        texto: "Cincuenta veces.",
        palabras: [98, 119],
      },
    ],
  },
  Levantarse: {
    from: 664,
    dur: 127,
    frases: [
      {
        texto: "Y cada vez que caía,",
        palabras: [4, 9, 19, 28, 36],
      },
      {
        texto: "se levantaba sabiendo un poco más.",
        palabras: [51, 58, 76, 93, 100, 110],
      },
    ],
  },
  HastaQue: {
    from: 791,
    dur: 63,
    frases: [
      {
        texto: "Hasta que un día.",
        palabras: [4, 14, 21, 27],
      },
    ],
  },
  TodoCambio: {
    from: 854,
    dur: 87,
    frases: [
      {
        texto: "Todo cambió.",
        palabras: [11, 20],
      },
      {
        texto: "Hoy lo tiene todo.",
        palabras: [44, 52, 58, 69],
      },
    ],
  },
  Mensaje: {
    from: 941,
    dur: 197,
    frases: [
      {
        texto: "Y quiere que sepas algo:",
        palabras: [4, 9, 21, 29, 40],
      },
      {
        texto: "no necesitas tenerlo todo para empezar.",
        palabras: [60, 66, 83, 97, 107, 116],
      },
      {
        texto: "Solo necesitas empezar.",
        palabras: [142, 152, 172],
      },
    ],
  },
  Guardar: {
    from: 1138,
    dur: 96,
    frases: [
      {
        texto: "Guarda este video para el día que quieras rendirte.",
        palabras: [4, 15, 24, 33, 42, 47, 54, 61, 73],
      },
    ],
  },
  Loop: {
    from: 1234,
    dur: 99,
    frases: [
      {
        texto: "Porque él también empezó,",
        palabras: [4, 17, 23, 37],
      },
      {
        texto: "sin nada.",
        palabras: [56, 65],
      },
    ],
  },
} as const;

export type Palabra = { text: string; startMs: number; endMs: number };

export const SUBTITULOS: Palabra[][] = [
  [
    { text: "Tenía", startMs: 50, endMs: 416 },
    { text: "cero", startMs: 416, endMs: 729 },
    { text: "pesos", startMs: 729, endMs: 1094 },
  ],
  [
    { text: "en", startMs: 1094, endMs: 1303 },
    { text: "la", startMs: 1303, endMs: 1512 },
    { text: "cuenta.", startMs: 1512, endMs: 1982 },
  ],
  [{ text: "Cero.", startMs: 2302, endMs: 2841 }],
  [
    { text: "Sin", startMs: 3283, endMs: 3577 },
    { text: "dinero.", startMs: 3577, endMs: 4105 },
  ],
  [
    { text: "Sin", startMs: 4425, endMs: 4730 },
    { text: "contactos.", startMs: 4730, endMs: 5463 },
  ],
  [
    { text: "Sin", startMs: 5783, endMs: 6027 },
    { text: "nadie", startMs: 6027, endMs: 6367 },
    { text: "que", startMs: 6367, endMs: 6611 },
  ],
  [
    { text: "creyera", startMs: 6611, endMs: 7049 },
    { text: "en", startMs: 7049, endMs: 7244 },
    { text: "él.", startMs: 7244, endMs: 7487 },
  ],
  [
    { text: "Pero", startMs: 7883, endMs: 8220 },
    { text: "tenía", startMs: 8220, endMs: 8612 },
    { text: "una", startMs: 8612, endMs: 8893 },
    { text: "idea.", startMs: 8893, endMs: 9285 },
  ],
  [
    { text: "Y", startMs: 9605, endMs: 9773 },
    { text: "una", startMs: 9773, endMs: 10053 },
    { text: "sola", startMs: 10053, endMs: 10389 },
    { text: "regla:", startMs: 10389, endMs: 10837 },
  ],
  [
    { text: "nunca", startMs: 11137, endMs: 11581 },
    { text: "rendirse.", startMs: 11581, endMs: 12280 },
  ],
  [
    { text: "Trabajó", startMs: 12683, endMs: 13213 },
    { text: "de", startMs: 13213, endMs: 13448 },
    { text: "noche,", startMs: 13448, endMs: 13919 },
  ],
  [
    { text: "mientras", startMs: 14059, endMs: 14625 },
    { text: "todos", startMs: 14625, endMs: 15020 },
    { text: "dormían.", startMs: 15020, endMs: 15586 },
  ],
  [
    { text: "Mil", startMs: 15906, endMs: 16191 },
    { text: "días", startMs: 16191, endMs: 16534 },
    { text: "seguidos.", startMs: 16534, endMs: 17162 },
  ],
  [{ text: "Falló.", startMs: 17550, endMs: 18124 }],
  [
    { text: "Una", startMs: 18444, endMs: 18760 },
    { text: "vez.", startMs: 18760, endMs: 19139 },
  ],
  [
    { text: "Diez", startMs: 19459, endMs: 19842 },
    { text: "veces.", startMs: 19842, endMs: 20353 },
  ],
  [
    { text: "Cincuenta", startMs: 20673, endMs: 21365 },
    { text: "veces.", startMs: 21365, endMs: 21868 },
  ],
  [
    { text: "Y", startMs: 22283, endMs: 22448 },
    { text: "cada", startMs: 22448, endMs: 22777 },
    { text: "vez", startMs: 22777, endMs: 23051 },
  ],
  [
    { text: "que", startMs: 23051, endMs: 23325 },
    { text: "caía,", startMs: 23325, endMs: 23708 },
  ],
  [
    { text: "se", startMs: 23848, endMs: 24070 },
    { text: "levantaba", startMs: 24070, endMs: 24679 },
    { text: "sabiendo", startMs: 24679, endMs: 25233 },
  ],
  [
    { text: "un", startMs: 25233, endMs: 25454 },
    { text: "poco", startMs: 25454, endMs: 25786 },
    { text: "más.", startMs: 25786, endMs: 26119 },
  ],
  [
    { text: "Hasta", startMs: 26517, endMs: 26847 },
    { text: "que", startMs: 26847, endMs: 27083 },
    { text: "un", startMs: 27083, endMs: 27272 },
    { text: "día.", startMs: 27272, endMs: 27555 },
  ],
  [
    { text: "Todo", startMs: 28817, endMs: 29141 },
    { text: "cambió.", startMs: 29141, endMs: 29629 },
  ],
  [
    { text: "Hoy", startMs: 29949, endMs: 30200 },
    { text: "lo", startMs: 30200, endMs: 30400 },
    { text: "tiene", startMs: 30400, endMs: 30751 },
    { text: "todo.", startMs: 30751, endMs: 31103 },
  ],
  [
    { text: "Y", startMs: 31517, endMs: 31671 },
    { text: "quiere", startMs: 31671, endMs: 32081 },
    { text: "que", startMs: 32081, endMs: 32338 },
  ],
  [
    { text: "sepas", startMs: 32338, endMs: 32697 },
    { text: "algo:", startMs: 32697, endMs: 33057 },
  ],
  [
    { text: "no", startMs: 33357, endMs: 33566 },
    { text: "necesitas", startMs: 33566, endMs: 34142 },
    { text: "tenerlo", startMs: 34142, endMs: 34614 },
  ],
  [
    { text: "todo", startMs: 34614, endMs: 34928 },
    { text: "para", startMs: 34928, endMs: 35243 },
    { text: "empezar.", startMs: 35243, endMs: 35766 },
  ],
  [
    { text: "Solo", startMs: 36086, endMs: 36445 },
    { text: "necesitas", startMs: 36445, endMs: 37101 },
    { text: "empezar.", startMs: 37101, endMs: 37698 },
  ],
  [
    { text: "Guarda", startMs: 38083, endMs: 38449 },
    { text: "este", startMs: 38449, endMs: 38724 },
    { text: "video", startMs: 38724, endMs: 39044 },
  ],
  [
    { text: "para", startMs: 39044, endMs: 39318 },
    { text: "el", startMs: 39318, endMs: 39501 },
    { text: "día", startMs: 39501, endMs: 39730 },
  ],
  [
    { text: "que", startMs: 39730, endMs: 39959 },
    { text: "quieras", startMs: 39959, endMs: 40370 },
    { text: "rendirte.", startMs: 40370, endMs: 40874 },
  ],
  [
    { text: "Porque", startMs: 41283, endMs: 41702 },
    { text: "él", startMs: 41702, endMs: 41911 },
    { text: "también", startMs: 41911, endMs: 42382 },
    { text: "empezó,", startMs: 42382, endMs: 42853 },
  ],
  [
    { text: "sin", startMs: 42993, endMs: 43305 },
    { text: "nada.", startMs: 43305, endMs: 43742 },
  ],
];
