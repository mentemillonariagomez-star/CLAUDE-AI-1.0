"""Genera una muestra corta por voz para elegir la voz del canal.

Uso: python muestras.py <carpeta_salida> [modelo]
"""
import sys

from cliente import cliente

TEXTO = "¿Por qué casi todo cuesta nueve con noventa y nueve? Te lo cuento en treinta segundos."
VOCES = {
    "liam": "TX3LPaxmHKxFdv7VOQHJ",
    "brian": "nPczCjzI2devNBz1zQrb",
    "adam": "pNInz6obpgDQGcFmaJgB",
    "will": "bIHbv24MWmeRgasZH58o",
    "laura": "FGY2WhTYpPnrIDTdsKH5",
    "sarah": "EXAVITQu4vr4xnSDxMaL",
}

c = cliente()
modelo = sys.argv[2] if len(sys.argv) > 2 else "eleven_v4"
for nombre, voz in VOCES.items():
    audio = c.text_to_speech.convert(voz, text=TEXTO, model_id=modelo, language_code="es", output_format="mp3_44100_128")
    with open(f"{sys.argv[1]}/voz-elevenlabs-{nombre}.mp3", "wb") as f:
        for trozo in audio:
            f.write(trozo)
    print(nombre, "ok", flush=True)
