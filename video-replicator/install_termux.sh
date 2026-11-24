#!/data/data/com.termux/files/usr/bin/bash
# Instalación de VIDEO REPLICATOR AI en Termux (Android).
# Uso:  bash install_termux.sh           (básico: python + ffmpeg + espeak)
#       bash install_termux.sh --opencv  (además intenta numpy y opencv)
#       bash install_termux.sh --whisper (además compila whisper.cpp con el modelo base)
set -e
cd "$(dirname "$0")"

echo "==> Actualizando paquetes"
pkg update -y && pkg upgrade -y

echo "==> Instalando dependencias básicas"
pkg install -y python ffmpeg git espeak

if [[ " $* " == *" --opencv "* ]]; then
  echo "==> Instalando NumPy y OpenCV (opcional)"
  pkg install -y python-numpy || echo "   python-numpy no disponible; se continúa sin él"
  pkg install -y opencv-python || echo "   opencv-python no disponible; se continúa sin OpenCV"
fi

if [[ " $* " == *" --whisper "* ]]; then
  echo "==> Compilando whisper.cpp (puede tardar 10-20 minutos)"
  pkg install -y clang cmake make
  if [ ! -d "$HOME/whisper.cpp" ]; then
    git clone --depth 1 https://github.com/ggml-org/whisper.cpp "$HOME/whisper.cpp"
  fi
  (cd "$HOME/whisper.cpp" && cmake -B build -DCMAKE_BUILD_TYPE=Release && cmake --build build -j"$(nproc)" --config Release)
  (cd "$HOME/whisper.cpp" && sh ./models/download-ggml-model.sh base)
fi

if [ ! -d "$HOME/storage" ]; then
  echo "==> Pidiendo acceso al almacenamiento (acepta el permiso en Android)"
  termux-setup-storage || true
fi

mkdir -p input references templates assets/music assets/fonts output config
python main.py check
echo
echo "Listo. Prueba completa:  python main.py demo --assets"
