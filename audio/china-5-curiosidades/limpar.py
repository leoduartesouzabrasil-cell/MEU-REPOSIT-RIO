"""Limpa a narração gravada com ruído (zumbido grave ~97 Hz + chiado de fundo).
1) filtro passa-alta 70 Hz e notch no zumbido; 2) redução espectral com o PERFIL do ruído tirado de uma pausa da própria gravação
(noisereduce); 3) RNN (arnndn) leve; 4) EQ de voz (-3 dB 250 Hz, +2,5 dB 3,2 kHz), de-esser; 5) expansor que fecha nas pausas,
compressão leve e -16 LUFS. Mede a voz × o ruído das pausas antes e depois.
Uso: python3 limpar.py entrada saida.wav inicio_pausa fim_pausa
"""
import subprocess, sys
from pathlib import Path
import numpy as np, noisereduce as nr

SR = 48000
AQUI = Path(__file__).resolve().parent

def ler(f, af=None):
    cmd = ["ffmpeg", "-loglevel", "error", "-i", str(f)] + (["-af", af] if af else []) + ["-ac", "1", "-ar", str(SR), "-f", "f32le", "-"]
    return np.frombuffer(subprocess.run(cmd, capture_output=True, check=True).stdout, np.float32).copy()

def snr(x, pa, pb):
    q = int(0.02 * SR); en = np.array([np.sqrt(np.mean(x[i:i + q] ** 2)) for i in range(0, len(x) - q, q)])
    voz = np.percentile(en, 90); ruido = np.sqrt(np.mean(x[int(pa * SR):int(pb * SR)] ** 2))
    return 20 * np.log10(voz / max(ruido, 1e-9))

ent, sai, pa, pb = sys.argv[1], sys.argv[2], float(sys.argv[3]), float(sys.argv[4])
x = ler(ent, "highpass=f=70:poles=2,highpass=f=70:poles=2,"
             "equalizer=f=97.5:t=q:w=8:g=-18,equalizer=f=195:t=q:w=8:g=-10,equalizer=f=82.5:t=q:w=8:g=-8")
antes = snr(ler(ent), pa, pb)
y = nr.reduce_noise(y=x, sr=SR, y_noise=x[int(pa * SR):int(pb * SR)], stationary=True, prop_decrease=0.92, n_fft=2048)
y = nr.reduce_noise(y=y, sr=SR, stationary=False, prop_decrease=0.5, n_fft=2048)   # sobra variável, de leve
tmp = AQUI / "_tmp.wav"
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "-", str(tmp)], input=y.astype(np.float32).tobytes(), check=True)
CH = (f"arnndn=m={AQUI / 'sh.rnnn'}:mix=0.6,"
      "equalizer=f=250:t=q:w=1.2:g=-3,equalizer=f=3200:t=q:w=1.5:g=2.5,equalizer=f=9000:t=h:w=0.7:g=1,deesser=i=0.35,"
      "agate=threshold=0.02:ratio=3:range=0.1:attack=5:release=180:knee=4,"
      "acompressor=threshold=-20dB:ratio=2.5:attack=10:release=150:makeup=2,alimiter=limit=0.89")
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(tmp), "-af", CH, str(tmp.with_name("_tmp2.wav"))], check=True)
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(tmp.with_name("_tmp2.wav")), "-af", "loudnorm=I=-16:TP=-1.5:LRA=9", "-ar", str(SR), sai], check=True)
depois = snr(ler(sai), pa, pb)
tmp.unlink(); tmp.with_name("_tmp2.wav").unlink()
print(f"{Path(ent).name}: voz acima do ruído {antes:.1f} dB → {depois:.1f} dB")
