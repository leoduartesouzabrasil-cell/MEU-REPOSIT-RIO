"""Monta o vídeo final de "Quem paga a conta do ajuste fiscal?":
vídeo gravado (girado para 1080×1920) com os cortes nas pausas e zoom alternado (cortes.json, do montar.py)
+ grão leve + a CAMADA transparente com as artes (saida/ajuste-fiscal-camada.mov) + o áudio (mix.wav, volume fixo em -14 LUFS).
Uso: python3 audio/ajuste-fiscal/editar.py [saida/ajuste-fiscal-FINAL.mp4]
"""
import json, re, subprocess, sys
from pathlib import Path
AQUI = Path(__file__).resolve().parent; RAIZ = AQUI.parent.parent
C = json.loads((AQUI / "cortes.json").read_text())
SAIDA = sys.argv[1] if len(sys.argv) > 1 else str(RAIZ / "saida" / "ajuste-fiscal-FINAL.mp4")
BRUTO, CAMADA, MIX = RAIZ / "midia/jaques-wagner/bruto.mp4", RAIZ / "saida/ajuste-fiscal-camada.mov", AQUI / "mix.wav"
f, labels = [], []
for i, c in enumerate(C["cortes"]):
    z = c["zoom"]; W, H = int(1080 * z) // 2 * 2, int(1920 * z) // 2 * 2
    # zoom puxa um pouco para cima (o rosto fica no alto do quadro)
    f.append(f"[0:v]trim={c['a']}:{c['b']},setpts=PTS-STARTPTS,fps=30,scale={W}:{H},crop=1080:1920:{(W - 1080) // 2}:{int((H - 1920) * 0.3)},setsar=1[s{i}]")
    labels.append(f"[s{i}]")
f.append("".join(labels) + f"concat=n={len(labels)}:v=1:a=0,tpad=stop_mode=clone:stop_duration={C['dur']},trim=0:{C['dur']},noise=alls=6:allf=t,format=yuv420p[base]")
f.append("[1:v]format=rgba[cam];[base][cam]overlay=0:0:format=auto,format=yuv420p[v]")
# volume final fixo (-14 LUFS) — sem loudnorm dinâmico
saida = subprocess.run(["ffmpeg", "-hide_banner", "-i", str(MIX), "-af", "ebur128", "-f", "null", "-"], capture_output=True, text=True).stderr
I = float(re.findall(r"I:\s+(-?[\d.]+) LUFS", saida)[-1]); G = -14 - I
f.append(f"[2:a]volume={G:.2f}dB,alimiter=limit=0.89:level=false[a]")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(BRUTO), "-i", str(CAMADA), "-i", str(MIX), "-filter_complex", ";".join(f),
                "-map", "[v]", "-map", "[a]", "-t", str(C["dur"]), "-c:v", "libx264", "-crf", "21", "-preset", "medium",
                "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-movflags", "+faststart", SAIDA], check=True)
print("ok →", SAIDA)
