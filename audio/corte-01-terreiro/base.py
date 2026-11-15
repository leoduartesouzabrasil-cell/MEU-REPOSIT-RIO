"""Vídeo-base do corte: fundo preto 1080×1920 com o painel de cima (quem fala) já recortado e posicionado (x 24, y 64, 1032×1076).
A janela da chamada fica em x 656–1263 (607×1080); o recorte é centrado no rosto e corta a faixa de baixo (nome escrito pela chamada).
Saída: saida/corte-01-terreiro-base.mp4. Os cantos arredondados, o painel de baixo, a logo, as tarjas e a legenda vêm do overlay."""
import json, subprocess
from pathlib import Path
AQUI = Path(__file__).resolve().parent; RAIZ = AQUI.parent.parent
FONTE = RAIZ / "midia/cortes/fonte.mp4"; TMP = RAIZ / "saida/.corte01"; TMP.mkdir(parents=True, exist_ok=True)
e = json.loads((AQUI / "edl.json").read_text())
PW, PH = 1032, 1076
ROSTO = {"leo": 0.47, "luiz": 0.42}          # altura do rosto na janela (fração) para centrar o recorte
JX, JW, JH = 656, 607, 1080 - 60
lista = []
for k, c in enumerate(e["cortes"]):
    cw = JW; ch = round(cw * PH / PW)
    cy = max(0, min(JH - ch, round(1080 * ROSTO[c["quem"]] - ch / 2)))
    vf = (f"crop={cw}:{ch}:{JX}:{cy},scale={PW}:{PH}:flags=lanczos,eq=contrast=1.05:saturation=1.08,unsharp=5:5:0.6,"
          f"pad=1080:1920:24:64:black,setsar=1,fps=30")
    out = TMP / f"p{k:03d}.mp4"
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-ss", str(c["ini"]), "-t", str(c["fim"] - c["ini"]), "-i", str(FONTE), "-vf", vf,
                    "-an", "-c:v", "libx264", "-preset", "veryfast", "-crf", "17", "-pix_fmt", "yuv420p", str(out)], check=True)
    lista.append(out)
(TMP / "lista.txt").write_text("".join(f"file '{p}'\n" for p in lista))
fim = e["dur"] - (e["cortes"][-1]["t"] + e["cortes"][-1]["dur"])
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", str(TMP / "lista.txt"),
                "-vf", f"tpad=stop_mode=clone:stop_duration={fim + 0.1}", "-c:v", "libx264", "-preset", "veryfast", "-crf", "17", "-pix_fmt", "yuv420p",
                "-t", str(e["dur"]), str(RAIZ / "saida/corte-01-terreiro-base.mp4")], check=True)
print("ok", e["dur"])
