"""Monta o vídeo final de "Quem paga a conta do ajuste fiscal?":
vídeo gravado (girado para 1080×1920) com os cortes nas pausas e zoom alternado (cortes.json, do montar.py)
+ grão leve + a CAMADA transparente com as artes (saida/ajuste-fiscal-camada.mov) + o áudio (mix.wav, volume fixo em -14 LUFS).
Os trechos são cortados um a um (cortar todos num filtro só estoura a memória) e juntados pelo concat.
Uso: python3 audio/ajuste-fiscal/editar.py [saida/ajuste-fiscal-FINAL.mp4]
"""
import json, re, shutil, subprocess, sys, tempfile
from pathlib import Path
AQUI = Path(__file__).resolve().parent; RAIZ = AQUI.parent.parent
C = json.loads((AQUI / "cortes.json").read_text())
# sem o cartão final das logos (pedido do autor): o vídeo termina logo depois da última fala, antes do corte diagonal
FIM = round(C["logo"] - 0.45, 2)
SAIDA = sys.argv[1] if len(sys.argv) > 1 else str(RAIZ / "saida" / "ajuste-fiscal-FINAL.mp4")
BRUTO, CAMADA, MIX = RAIZ / "midia/jaques-wagner/bruto.mp4", RAIZ / "saida/ajuste-fiscal-camada.mov", AQUI / "mix.wav"
tmp = Path(tempfile.mkdtemp(dir=RAIZ / "saida", prefix=".af-"))
lista = []
for i, c in enumerate(C["cortes"]):
    z = c["zoom"]; W, H = int(1080 * z) // 2 * 2, int(1920 * z) // 2 * 2
    arq = tmp / f"t{i:02d}.mp4"
    # zoom puxa um pouco para cima (o rosto fica no alto do quadro); -ss antes do -i = busca rápida e exata (recodifica)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", str(c["a"]), "-to", str(c["b"]), "-i", str(BRUTO), "-an",
                    "-vf", f"fps=30,scale={W}:{H},crop=1080:1920:{(W - 1080) // 2}:{int((H - 1920) * 0.3)},setsar=1,format=yuv420p",
                    "-c:v", "libx264", "-crf", "16", "-preset", "veryfast", str(arq)], check=True)
    lista.append(f"file '{arq}'")
(tmp / "lista.txt").write_text("\n".join(lista))
base = tmp / "base.mp4"
subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", str(tmp / "lista.txt"), "-c", "copy", str(base)], check=True)
saida = subprocess.run(["ffmpeg", "-hide_banner", "-i", str(MIX), "-af", "ebur128", "-f", "null", "-"], capture_output=True, text=True).stderr
I = float(re.findall(r"I:\s+(-?[\d.]+) LUFS", saida)[-1]); G = -14 - I     # volume final fixo (-14 LUFS), sem loudnorm dinâmico
f = (f"[0:v]tpad=stop_mode=clone:stop_duration={C['dur']},trim=0:{C['dur']},setpts=PTS-STARTPTS,noise=alls=6:allf=t,format=yuv420p[b];"
     f"[1:v]format=rgba[cam];[b][cam]overlay=0:0:format=auto,format=yuv420p[v];[2:a]volume={G:.2f}dB,alimiter=limit=0.89:level=false,afade=t=out:st={FIM - 0.35}:d=0.35[a]")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(base), "-i", str(CAMADA), "-i", str(MIX), "-filter_complex", f,
                "-map", "[v]", "-map", "[a]", "-t", str(FIM), "-c:v", "libx264", "-crf", "21", "-preset", "medium",
                "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-movflags", "+faststart", SAIDA], check=True)
shutil.rmtree(tmp)
print("ok →", SAIDA)
