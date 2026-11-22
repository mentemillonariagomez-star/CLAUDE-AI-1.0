// Curvas de Remotion reproducidas con exactitud para GSAP (traducción de src/DeNadaATodo).
// Todas son funciones puras del progreso del tween: el resultado depende solo del tiempo.
(function () {
  // Easing.bezier(x1, y1, x2, y2), igual que el de Remotion (bezier-easing).
  function bezier(x1, y1, x2, y2) {
    const A = (a, b) => 1 - 3 * b + 3 * a;
    const B = (a, b) => 3 * b - 6 * a;
    const C = (a) => 3 * a;
    const calc = (t, a, b) => ((A(a, b) * t + B(a, b)) * t + C(a)) * t;
    const slope = (t, a, b) => 3 * A(a, b) * t * t + 2 * B(a, b) * t + C(a);
    const tForX = (x) => {
      let t = x;
      for (let i = 0; i < 8; i++) {
        const s = slope(t, x1, x2);
        if (Math.abs(s) < 1e-7) break;
        t -= (calc(t, x1, x2) - x) / s;
      }
      if (t < 0 || t > 1 || Math.abs(calc(t, x1, x2) - x) > 1e-7) {
        let lo = 0;
        let hi = 1;
        t = x;
        for (let i = 0; i < 60; i++) {
          const cx = calc(t, x1, x2);
          if (Math.abs(cx - x) < 1e-9) break;
          if (cx < x) lo = t;
          else hi = t;
          t = (lo + hi) / 2;
        }
      }
      return t;
    };
    return (x) => (x <= 0 ? 0 : x >= 1 ? 1 : calc(tForX(x), y1, y2));
  }

  // Easing.spring({ damping: 12 }) de Remotion, muestreado con la propia función de Remotion
  // en 121 puntos (cada 1/4 de fotograma del resorte de 30 fotogramas).
  const SPRING_12 = [
    0, 0.002931, 0.011357, 0.024739, 0.042559, 0.064318, 0.089539, 0.117769, 0.148576, 0.181553,
    0.216316, 0.252505, 0.289785, 0.327842, 0.366389, 0.405158, 0.443906, 0.482412, 0.520474,
    0.557913, 0.594568, 0.630296, 0.664976, 0.698498, 0.730775, 0.761729, 0.7913, 0.819441,
    0.846117, 0.871304, 0.894989, 0.91717, 0.937853, 0.957051, 0.974787, 0.991088, 1.005987,
    1.019524, 1.031743, 1.042689, 1.052413, 1.060969, 1.06841, 1.074793, 1.080175, 1.084615,
    1.088171, 1.090901, 1.092863, 1.094114, 1.09471, 1.094707, 1.094157, 1.093112, 1.091623,
    1.089738, 1.087503, 1.084962, 1.082157, 1.079127, 1.075911, 1.072543, 1.069056, 1.065482,
    1.061848, 1.05818, 1.054504, 1.050841, 1.04721, 1.043631, 1.040119, 1.036688, 1.033351,
    1.030119, 1.027001, 1.024005, 1.021137, 1.018403, 1.015806, 1.01335, 1.011035, 1.008863,
    1.006833, 1.004945, 1.003196, 1.001585, 1.000108, 0.998762, 0.997543, 0.996447, 0.99547,
    0.994605, 0.993849, 0.993195, 0.992639, 0.992176, 0.991798, 0.991502, 0.991281, 0.99113,
    0.991044, 0.991017, 0.991044, 0.991121, 0.991242, 0.991403, 0.991599, 0.991826, 0.99208,
    0.992357, 0.992654, 0.992966, 0.993292, 0.993627, 0.993969, 0.994315, 0.994663, 0.995011,
    0.995357, 0.995699, 1,
  ];
  function spring12(t) {
    if (t <= 0) return 0;
    if (t >= 1) return 1;
    const x = t * (SPRING_12.length - 1);
    const i = Math.floor(x);
    return SPRING_12[i] + (SPRING_12[i + 1] - SPRING_12[i]) * (x - i);
  }

  // interpolate(..., { output: "perceptual-scale" }): la escala avanza por área (s²), no en línea
  // recta. Devuelve un ease para tweens de GSAP que van de s0 a s1.
  function perceptual(s0, s1, ease) {
    const e = ease || ((t) => t);
    const area = (s) => Math.sign(s) * s * s;
    const a0 = area(s0);
    const a1 = area(s1);
    return (t) => {
      const a = a0 + (a1 - a0) * e(t);
      const s = Math.sign(a) * Math.sqrt(Math.abs(a));
      return (s - s0) / (s1 - s0);
    };
  }

  // toLocaleString("de-DE") para enteros: 1000000 -> "1.000.000".
  const formatDE = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  window.R2HF = { bezier, spring12, perceptual, formatDE };
})();
