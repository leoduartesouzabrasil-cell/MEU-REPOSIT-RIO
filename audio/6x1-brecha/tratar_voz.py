"""Voz do Léo (narração do vídeo 6x1-brecha): redução de ruído FORTE porém suavizada (sem som metalizado), graves preservados.
Mesma receita de audio/fim-6x1-dino/tratar_voz.py (v7): perfil do ruído tirado da pausa mais quieta da própria gravação (9,05–9,75 s).
Uso: python3 audio/6x1-brecha/tratar_voz.py → narracao/voz-tratada.flac (mesmo tempo da original)"""
import subprocess
from pathlib import Path
import numpy as np, noisereduce as nr
AQUI = Path(__file__).resolve().parent; SR = 48000
raw = subprocess.run(["ffmpeg", "-loglevel", "error", "-i", str(AQUI / "narracao/original.m4a"), "-ac", "1", "-ar", str(SR),
                      "-af", "highpass=f=55:poles=2", "-f", "f32le", "-"], capture_output=True, check=True).stdout
x = np.frombuffer(raw, np.float32).copy()
y = nr.reduce_noise(y=x, sr=SR, y_noise=x[int(9.05 * SR):int(9.75 * SR)], stationary=True, prop_decrease=0.97, n_fft=4096,
                    freq_mask_smooth_hz=1000, time_mask_smooth_ms=200)
CADEIA = ("bass=g=3:f=120:w=0.7,equalizer=f=300:t=q:w=1.2:g=-1.5,equalizer=f=3200:t=q:w=1.4:g=1.2,equalizer=f=9500:t=h:w=0.7:g=0.8,deesser=i=0.25,"
          "acompressor=threshold=-21dB:ratio=2.2:attack=15:release=160:makeup=2,"
          "agate=threshold=0.04:ratio=3:range=0.05:attack=6:release=220,alimiter=limit=0.92,loudnorm=I=-16:TP=-1.5:LRA=7")
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "-", "-af", CADEIA, "-ar", str(SR),
                str(AQUI / "narracao/voz-tratada.flac")], input=y.astype(np.float32).tobytes(), check=True)
# para achar pausas e vales sem a compressão: só a redução de ruído
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "-", "-ar", str(SR),
                str(AQUI / "narracao/voz-deteccao.flac")], input=y.astype(np.float32).tobytes(), check=True)
print("ok")
