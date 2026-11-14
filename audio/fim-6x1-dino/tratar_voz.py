"""Voz do Léo (v3, sem som metalizado): redução de ruído LEVE e suavizada + EQ e compressão de locução.
A v1/v2 (noisereduce 92% + arnndn + afftdn) apagava pedaços da voz e deixava o som "metalizado" (ruído musical).
Uso: python3 audio/fim-6x1-dino/tratar_voz.py  →  voz-tratada.flac (mesmo tempo do bruto; os cortes não mudam)"""
import subprocess
from pathlib import Path
import numpy as np, noisereduce as nr
AQUI = Path(__file__).resolve().parent; RAIZ = AQUI.parent.parent; SR = 48000
raw = subprocess.run(["ffmpeg", "-loglevel", "error", "-i", str(RAIZ / "midia/fim-6x1-dino/leo-bruto.mov"), "-map", "0:a:0", "-ac", "1", "-ar", str(SR),
                      "-af", "highpass=f=75:poles=2", "-f", "f32le", "-"], capture_output=True, check=True).stdout
x = np.frombuffer(raw, np.float32).copy()
ruido = x[int(63.05 * SR):int(63.65 * SR)]                       # pausa só com o ruído do quarto
y = nr.reduce_noise(y=x, sr=SR, y_noise=ruido, stationary=True, prop_decrease=0.8, n_fft=4096,
                    freq_mask_smooth_hz=600, time_mask_smooth_ms=120)
CADEIA = ("equalizer=f=150:t=q:w=1:g=1,equalizer=f=320:t=q:w=1.3:g=-2.5,equalizer=f=3200:t=q:w=1.4:g=1.8,"
          "equalizer=f=9500:t=h:w=0.7:g=1.2,deesser=i=0.3,"
          "acompressor=threshold=-21dB:ratio=2.5:attack=12:release=140:makeup=2,"
          "agate=threshold=0.03:ratio=2:range=0.2:attack=8:release=250,alimiter=limit=0.92,loudnorm=I=-16:TP=-1.5:LRA=7")
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "-", "-af", CADEIA, "-ar", str(SR), str(AQUI / "voz-tratada.flac")],
               input=y.astype(np.float32).tobytes(), check=True)
print("ok")
