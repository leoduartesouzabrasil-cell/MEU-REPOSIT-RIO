"""Limpa a narração do EP. 3: tira o ronco/chiado de fundo com um perfil do ruído tirado dos trechos mais quietos.
Uso: python3 audio/comunismo-03/limpar.py  (lê narracao/original.m4a, grava narracao/limpa.wav)"""
import subprocess, numpy as np, soundfile as sf, noisereduce as nr
from pathlib import Path
D = Path(__file__).parent / "narracao"
SR = 48000
x = np.frombuffer(subprocess.run(["ffmpeg", "-v", "error", "-i", str(D / "original.m4a"), "-af", "highpass=f=85",
                                  "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True).stdout, np.float32).copy()
# perfil do ruído: os 8% de janelas de 100 ms mais quietas (pausas entre frases)
w = SR // 10; n = len(x) // w
db = 20 * np.log10(np.sqrt((x[:n * w].reshape(n, w) ** 2).mean(1)) + 1e-9)
quietas = np.sort(np.argsort(db)[: max(10, n * 8 // 100)])
ruido = np.concatenate([x[i * w:(i + 1) * w] for i in quietas])
y = nr.reduce_noise(y=x, sr=SR, y_noise=ruido, stationary=True, prop_decrease=0.9, n_fft=2048, freq_mask_smooth_hz=300, time_mask_smooth_ms=80)
sf.write(D / "limpa-bruta.wav", y, SR)
# acabamento: tira o resto de chiado agudo, um leve corpo na voz e nivela o volume
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(D / "limpa-bruta.wav"), "-af",
                "afftdn=nr=8:nf=-50:tn=1,lowpass=f=13000,equalizer=f=3500:t=q:w=1:g=2,acompressor=threshold=-20dB:ratio=2.5:attack=8:release=120,loudnorm=I=-16:TP=-1.5:LRA=9",
                "-ar", str(SR), str(D / "limpa.wav")], check=True)
(D / "limpa-bruta.wav").unlink()
print("ok:", D / "limpa.wav")
