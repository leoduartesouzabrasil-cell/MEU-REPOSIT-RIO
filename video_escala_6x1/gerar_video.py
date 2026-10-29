"""Gera um vídeo vertical de 20 segundos explicando a escala 6x1.

Uso: python3 gerar_video.py  (requer Pillow e ffmpeg)
"""
import math
import subprocess
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

W, H = 1080, 1920
FPS = 30
DURACAO = 20
SAIDA = Path(__file__).with_name("escala_6x1.mp4")

FONTE_BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
FONTE = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"

FUNDO_TOPO = (18, 24, 48)
FUNDO_BASE = (52, 22, 66)
BRANCO = (255, 255, 255)
CINZA = (190, 196, 215)
VERMELHO = (235, 72, 72)
VERDE = (56, 196, 120)
AMARELO = (255, 200, 60)

_fontes = {}


def fonte(tamanho, bold=True):
    chave = (tamanho, bold)
    if chave not in _fontes:
        _fontes[chave] = ImageFont.truetype(FONTE_BOLD if bold else FONTE, tamanho)
    return _fontes[chave]


def ease(x):
    x = max(0.0, min(1.0, x))
    return 1 - (1 - x) ** 3


def progresso(t, inicio, dur=0.6):
    return ease((t - inicio) / dur)


def fundo():
    img = Image.new("RGB", (W, H))
    d = ImageDraw.Draw(img)
    for y in range(H):
        k = y / H
        cor = tuple(int(a + (b - a) * k) for a, b in zip(FUNDO_TOPO, FUNDO_BASE))
        d.line([(0, y), (W, y)], fill=cor)
    return img


FUNDO = fundo()


def texto(camada, y, conteudo, tamanho, cor=BRANCO, alpha=1.0, bold=True, dy=0):
    if alpha <= 0:
        return
    d = ImageDraw.Draw(camada)
    f = fonte(tamanho, bold)
    for i, linha in enumerate(conteudo.split("\n")):
        largura = d.textlength(linha, font=f)
        d.text(((W - largura) / 2, y + dy + i * tamanho * 1.25), linha, font=f,
               fill=cor + (int(255 * alpha),))


def janela(t, inicio, fim, fade=0.4):
    """Opacidade de uma cena entre inicio e fim, com fade de entrada e saída."""
    if t < inicio or t > fim:
        return 0.0
    return min(1.0, (t - inicio) / fade, (fim - t) / fade)


def cena_titulo(c, t):
    a = janela(t, 0, 3.2)
    p = progresso(t, 0.1, 0.8)
    texto(c, 640, "ESCALA", 110, CINZA, a * p, dy=(1 - p) * 60)
    escala = 0.6 + 0.4 * progresso(t, 0.4, 0.7)
    texto(c, 780, "6x1", int(320 * escala), AMARELO, a * progresso(t, 0.4))
    texto(c, 1240, "Você sabe o que é?", 64, BRANCO, a * progresso(t, 1.2), bold=False)


def cena_semana(c, t):
    a = janela(t, 3, 8.2)
    if a <= 0:
        return
    texto(c, 330, "Uma semana na 6x1", 72, BRANCO, a * progresso(t, 3.1))
    d = ImageDraw.Draw(c)
    dias = ["SEG", "TER", "QUA", "QUI", "SEX", "SÁB", "DOM"]
    lado, gap = 300, 40
    x0 = (W - (3 * lado + 2 * gap)) / 2
    for i, dia in enumerate(dias):
        p = progresso(t, 3.5 + i * 0.35, 0.4)
        if p <= 0:
            continue
        linha, col = divmod(i, 3)
        x = x0 + col * (lado + gap)
        if i == 6:
            x = (W - lado) / 2
        y = 560 + linha * (lado + gap)
        folga = i == 6
        cor = VERDE if folga else VERMELHO
        s = lado * (0.7 + 0.3 * p)
        cx, cy = x + lado / 2, y + lado / 2
        d.rounded_rectangle([cx - s / 2, cy - s / 2, cx + s / 2, cy + s / 2], 36,
                            fill=cor + (int(235 * a * p),))
        f = fonte(64)
        w = d.textlength(dia, font=f)
        d.text((cx - w / 2, cy - 70), dia, font=f, fill=BRANCO + (int(255 * a * p),))
        rotulo = "FOLGA" if folga else "TRABALHO"
        f2 = fonte(38)
        w2 = d.textlength(rotulo, font=f2)
        d.text((cx - w2 / 2, cy + 20), rotulo, font=f2, fill=BRANCO + (int(255 * a * p),))
    texto(c, 1620, "6 dias de trabalho\n1 dia de descanso", 60, CINZA,
          a * progresso(t, 6.2), bold=False)


def contador(t, inicio, alvo, dur=1.2):
    return int(round(alvo * ease((t - inicio) / dur)))


def cena_numeros(c, t):
    a = janela(t, 8, 13.2)
    if a <= 0:
        return
    texto(c, 380, "Na prática:", 72, BRANCO, a * progresso(t, 8.1))
    texto(c, 560, f"até {contador(t, 8.4, 44)}h", 170, AMARELO, a * progresso(t, 8.4))
    texto(c, 780, "de trabalho por semana", 54, CINZA, a * progresso(t, 8.6), bold=False)
    texto(c, 960, f"~{contador(t, 9.6, 52)}", 170, VERDE, a * progresso(t, 9.6))
    texto(c, 1180, "folgas semanais por ano", 54, CINZA, a * progresso(t, 9.8), bold=False)
    texto(c, 1420, "Pouco tempo para família,\nestudo, saúde e lazer.", 58, BRANCO,
          a * progresso(t, 11), bold=False)


def cena_debate(c, t):
    a = janela(t, 13, 17.2)
    if a <= 0:
        return
    texto(c, 520, "EM DEBATE", 110, AMARELO, a * progresso(t, 13.1))
    texto(c, 720, "Propostas no Congresso\nquerem reduzir a jornada", 60, BRANCO,
          a * progresso(t, 13.5), bold=False)
    d = ImageDraw.Draw(c)
    opcoes = [("6x1", VERMELHO), ("5x2", AMARELO), ("4x3", VERDE)]
    for i, (rotulo, cor) in enumerate(opcoes):
        p = progresso(t, 14.2 + i * 0.5, 0.5)
        if p <= 0:
            continue
        cx, cy = 230 + i * 310, 1180
        r = 120 * (0.6 + 0.4 * p)
        d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=cor + (int(235 * a * p),))
        f = fonte(72)
        w = d.textlength(rotulo, font=f)
        d.text((cx - w / 2, cy - 44), rotulo, font=f, fill=BRANCO + (int(255 * a * p),))
        if i < 2:
            pa = progresso(t, 14.5 + i * 0.5, 0.4)
            d.text((cx + 125, cy - 40), "›", font=fonte(80), fill=CINZA + (int(255 * a * pa),))
    texto(c, 1440, "Menos dias de trabalho,\nmais qualidade de vida?", 56, CINZA,
          a * progresso(t, 15.6), bold=False)


def cena_final(c, t):
    a = janela(t, 17, 20.5)
    if a <= 0:
        return
    texto(c, 760, "E você,", 100, BRANCO, a * progresso(t, 17.1))
    texto(c, 900, "o que acha?", 100, AMARELO, a * progresso(t, 17.4))
    pulso = 1 + 0.04 * math.sin((t - 18) * 6) if t > 18 else 1
    texto(c, 1140, "Comente e compartilhe!", int(58 * pulso), CINZA,
          a * progresso(t, 18), bold=False)


def barra(c, t):
    d = ImageDraw.Draw(c)
    d.rectangle([0, H - 14, W * t / DURACAO, H], fill=AMARELO + (220,))


def quadro(t):
    camada = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    for cena in (cena_titulo, cena_semana, cena_numeros, cena_debate, cena_final):
        cena(camada, t)
    barra(camada, t)
    img = FUNDO.copy()
    img.paste(camada, (0, 0), camada)
    return img


def main():
    ffmpeg = subprocess.Popen(
        ["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24",
         "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-", "-c:v", "libx264",
         "-pix_fmt", "yuv420p", "-crf", "20", "-movflags", "+faststart", str(SAIDA)],
        stdin=subprocess.PIPE,
    )
    for n in range(FPS * DURACAO):
        ffmpeg.stdin.write(quadro(n / FPS).tobytes())
    ffmpeg.stdin.close()
    ffmpeg.wait()
    print(f"Vídeo salvo em {SAIDA}")


if __name__ == "__main__":
    main()
