"""Vídeo-base (sem textos): abertura dividida (Rick em cima, print do Léo embaixo) + os cortes do Léo (edl.json), 1080×1920, 30 fps.
Saída: saida/fim-6x1-dino-base.mp4. Uso: python3 audio/fim-6x1-dino/base.py"""
import json, subprocess
from pathlib import Path
AQUI = Path(__file__).resolve().parent; RAIZ = AQUI.parent.parent
M = RAIZ / "midia/fim-6x1-dino"; TMP = RAIZ / "saida/.fim6x1"; TMP.mkdir(parents=True, exist_ok=True)
e = json.loads((AQUI / "edl.json").read_text())
enc = ["-c:v", "libx264", "-preset", "veryfast", "-crf", "17", "-pix_fmt", "yuv420p", "-r", "30", "-an"]
# abertura: Rick (rosto, sem a manchete gravada no vídeo dele) em cima; print do Léo embaixo, com zoom lento
a = e["abert"]
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-ss", str(e["rick"][0]), "-t", str(a), "-i", str(M / "rick-azevedo.mp4"),
    "-loop", "1", "-t", str(a), "-i", str(M / "leo-print.jpg"), "-filter_complex",
    "[0:v]crop=630:560:45:418,scale=1080:960,setsar=1,fps=30[r];"
    f"[1:v]scale=1080:-2,crop=1080:960:0:527,scale=2160:1920,zoompan=z='1+0.05*on/({a}*30)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=1080x960:fps=30,setsar=1[l];"
    "[r][l]vstack=inputs=2[v]", "-map", "[v]", *enc, "-t", str(a), str(TMP / "p000.mp4")], check=True)
lista = [TMP / "p000.mp4"]
for k, c in enumerate(e["cortes"], 1):
    z = c["zoom"]
    vf = (f"scale=1080:1920,crop=iw/{z}:ih/{z}:(iw-iw/{z})/2:(ih-ih/{z})*0.42,scale=1080:1920,setsar=1,"
          f"setpts=PTS/{e['vel']},fps=30")
    out = TMP / f"p{k:03d}.mp4"
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-ss", str(c["ini"]), "-t", str(c["fim"] - c["ini"]), "-i", str(M / "leo-bruto.mov"),
                    "-vf", vf, *enc, "-t", str(c["dur"]), str(out)], check=True)
    lista.append(out)
# a última imagem do Léo segura até o fim (card final)
fim = e["dur"] - (e["cortes"][-1]["t"] + e["cortes"][-1]["dur"])
(TMP / "lista.txt").write_text("".join(f"file '{p}'\n" for p in lista))
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", str(TMP / "lista.txt"),
                "-vf", f"tpad=stop_mode=clone:stop_duration={fim + 0.1}", *enc, "-t", str(e["dur"]), str(RAIZ / "saida/fim-6x1-dino-base.mp4")], check=True)
print("ok", e["dur"])
