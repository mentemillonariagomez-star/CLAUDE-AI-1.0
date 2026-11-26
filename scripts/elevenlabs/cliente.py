"""Cliente de ElevenLabs para los scripts de narración.

La clave se lee de ELEVENLABS_API_KEY. Si no está en el entorno, se carga de
.env.local en la raíz del proyecto (archivo ignorado por git). En la nube de
Claude Code el proxy añade la clave a cada petición a api.elevenlabs.io, así que
basta con un valor de marcador.
"""
import os
from pathlib import Path

from elevenlabs import ElevenLabs

RAIZ = Path(__file__).resolve().parents[2]


def _cargar_env_local() -> None:
    env = RAIZ / ".env.local"
    if "ELEVENLABS_API_KEY" in os.environ or not env.exists():
        return
    for linea in env.read_text().splitlines():
        nombre, _, valor = linea.partition("=")
        if nombre.strip() == "ELEVENLABS_API_KEY" and valor.strip():
            os.environ["ELEVENLABS_API_KEY"] = valor.strip().strip('"')


def cliente() -> ElevenLabs:
    _cargar_env_local()
    # En la nube de Claude Code la clave real la pone el proxy.
    os.environ.setdefault("ELEVENLABS_API_KEY", "proxy-injected")
    return ElevenLabs()
