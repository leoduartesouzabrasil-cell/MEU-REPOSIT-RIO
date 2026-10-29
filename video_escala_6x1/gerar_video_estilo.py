"""Vídeo de 20s sobre a escala 6x1 no estilo "documentário editorial".

Base de estilo extraída do vídeo de referência (veja ESTILO.md): cortes secos a
cada ~1,5s, uma ideia por tela, sans negrito sobre preto, serifa itálica sobre
papel, folha de patente ao fundo, texto digitado com cursor, caixa de seleção
azul, rótulos de interface, granulação, scanlines e vinheta.

Uso: python3 gerar_video_estilo.py  (requer Pillow, numpy e ffmpeg)
"""
import math
import subprocess
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

import efeitos_sonoros as sfx

W, H = 1080, 1920
FPS = 30
DURACAO = 20
SAIDA = Path(__file__).with_name("escala_6x1_estilo_documentario.mp4")

SANS = "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"
SERIFA = "/usr/share/fonts/truetype/liberation/LiberationSerif-Italic.ttf"

TINTA = (22, 22, 22)
BRANCO = (240, 240, 238)
AZUL = (38, 118, 232)
VERMELHO = (200, 40, 40)
VERDE = (40, 150, 90)

rng = np.random.default_rng(61)
_fontes = {}


def fonte(caminho, tamanho):
    chave = (caminho, int(tamanho))
    if chave not in _fontes:
        _fontes[chave] = ImageFont.truetype(caminho, int(tamanho))
    return _fontes[chave]


def ease(x):
    x = max(0.0, min(1.0, x))
    return 1 - (1 - x) ** 3


def prog(lt, inicio, dur=0.2):
    return ease((lt - inicio) / dur)


# ---------------------------------------------------------------- fundos

def _manchas(base, forca):
    """Cor base com manchas suaves e fibra fina, como papel envelhecido."""
    baixa = rng.standard_normal((48, 27))
    baixa = np.asarray(Image.fromarray(((baixa + 3) * 40).clip(0, 255).astype(np.uint8))
                       .resize((W, H), Image.BICUBIC), np.float32) / 40 - 3
    fina = rng.standard_normal((H, W)) * 0.5
    arr = np.array(base, np.float32)[None, None, :] + ((baixa + fina) * forca)[..., None]
    return Image.fromarray(arr.clip(0, 255).astype(np.uint8))


def fundo_planta():
    """Papel bege com um desenho técnico apagado, como uma folha de patente."""
    img = _manchas((228, 218, 196), 4)
    d = ImageDraw.Draw(img, "RGBA")
    traco = (120, 108, 88, 70)
    f = fonte(SERIFA, 34)
    for _ in range(14):
        x, y = rng.integers(40, W - 300), rng.integers(80, H - 300)
        w, h = rng.integers(120, 320), rng.integers(80, 280)
        d.rectangle([x, y, x + w, y + h], outline=traco, width=3)
        if rng.random() < 0.5:
            for k in range(0, w + h, 18):
                d.line([(x + max(0, k - h), y + min(k, h)), (x + min(k, w), y + max(0, k - w))],
                       fill=(120, 108, 88, 40), width=2)
        lx, ly = x + w + rng.integers(20, 80), y + rng.integers(-40, 40)
        d.line([(x + w, y + h // 2), (lx, ly)], fill=traco, width=2)
        d.text((lx + 6, ly - 20), str(rng.integers(10, 99)), font=f, fill=traco)
    for _ in range(5):
        cx, cy, r = rng.integers(100, W - 100), rng.integers(200, H - 200), rng.integers(30, 90)
        d.ellipse([cx - r, cy - r, cx + r, cy + r], outline=traco, width=3)
    d.text((140, H - 260), "Escala 6x1", font=fonte(SERIFA, 70), fill=(110, 98, 80, 60))
    d.text((180, H - 180), "jornada de trabalho", font=fonte(SERIFA, 56), fill=(110, 98, 80, 60))
    return img


FUNDOS = {
    "preto": _manchas((14, 14, 15), 2),
    "papel": _manchas((233, 231, 227), 3),
    "planta": fundo_planta(),
}

# vinheta + scanlines horizontais, multiplicadas em todo quadro
_yy, _xx = np.mgrid[0:H, 0:W].astype(np.float32)
_dist = np.sqrt(((_xx - W / 2) / (W / 2)) ** 2 + ((_yy - H / 2) / (H / 2)) ** 2)
VINHETA = (1 - 0.32 * np.clip(_dist - 0.45, 0, 1) ** 1.5)
VINHETA *= np.where(_yy % 4 < 2, 1.0, 0.965)
VINHETA = VINHETA[..., None].astype(np.float32)
GRAOS = [rng.normal(0, 9, (H, W, 1)).astype(np.float32) for _ in range(6)]
del _yy, _xx, _dist


# ---------------------------------------------------------------- elementos

def escrever(d, xy, texto, caminho, tamanho, cor, alpha=1.0, ancora="mm"):
    if alpha <= 0:
        return
    d.text(xy, texto, font=fonte(caminho, tamanho), fill=cor + (int(255 * alpha),), anchor=ancora)


def surgir(d, xy, texto, caminho, tamanho, cor, lt, inicio):
    """Texto que entra com um pequeno "pulo" de escala, como nos cortes da referência."""
    p = prog(lt, inicio, 0.16)
    if p <= 0:
        return
    escrever(d, xy, texto, caminho, tamanho * (1.12 - 0.12 * p), cor, p)


def digitar(d, cy, texto, caminho, tamanho, cor, lt, inicio, por_letra):
    """Máquina de escrever: o texto cresce a partir de uma margem fixa, com cursor."""
    f = fonte(caminho, tamanho)
    x0 = (W - d.textlength(texto, font=f)) / 2
    n = max(0, min(len(texto), int((lt - inicio) / por_letra) + 1)) if lt >= inicio else 0
    parcial = texto[:n]
    d.text((x0, cy), parcial, font=f, fill=cor + (255,), anchor="lm")
    if int(lt * 3) % 2 == 0 or n < len(texto):
        xc = x0 + d.textlength(parcial, font=f) + 6
        d.line([(xc, cy - tamanho * 0.45), (xc, cy + tamanho * 0.45)], fill=cor + (255,), width=4)
    return x0, x0 + d.textlength(texto, font=f)


def selecao(d, caixa, p):
    """Caixa de seleção azul com alças, como numa ferramenta de design."""
    if p <= 0:
        return
    x0, y0, x1, y1 = caixa
    x1 = x0 + (x1 - x0) * p
    d.rectangle([x0, y0, x1, y1], fill=(90, 150, 255, 70), outline=AZUL + (255,), width=4)
    for hx in (x0, (x0 + x1) / 2, x1):
        for hy in (y0, (y0 + y1) / 2, y1):
            if hx == (x0 + x1) / 2 and hy == (y0 + y1) / 2:
                continue
            d.rectangle([hx - 9, hy - 9, hx + 9, hy + 9], fill=(255, 255, 255, 255),
                        outline=AZUL + (255,), width=3)


def rotulo(d, xy, texto, tamanho, p, cor=AZUL):
    """Etiqueta de interface: retângulo azul, borda branca, texto branco."""
    if p <= 0:
        return None
    f = fonte(SANS, tamanho)
    w = d.textlength(texto, font=f)
    cx, cy = xy[0], xy[1] + (1 - p) * 20
    caixa = [cx - w / 2 - 26, cy - tamanho * 0.75, cx + w / 2 + 26, cy + tamanho * 0.75]
    a = int(255 * p)
    d.rectangle(caixa, fill=cor + (a,), outline=(255, 255, 255, a), width=4)
    d.text((cx, cy), texto, font=f, fill=(255, 255, 255, a), anchor="mm")
    return caixa


def colar_com_sombra(camada, img, centro, angulo=0.0, escala=1.0, alpha=1.0):
    if escala != 1.0:
        img = img.resize((int(img.width * escala), int(img.height * escala)), Image.BICUBIC)
    if angulo:
        img = img.rotate(angulo, Image.BICUBIC, expand=True)
    if alpha < 1:
        img.putalpha(img.getchannel("A").point(lambda v: int(v * alpha)))
    sombra = Image.new("RGBA", img.size, (0, 0, 0, 0))
    sombra.putalpha(img.getchannel("A").point(lambda v: int(v * 0.45)))
    sombra = sombra.filter(ImageFilter.GaussianBlur(14))
    x, y = int(centro[0] - img.width / 2), int(centro[1] - img.height / 2)
    camada.alpha_composite(sombra, (x + 14, y + 18))
    camada.alpha_composite(img, (x, y))


def calendario(lt):
    """Recorte de papel com a semana: X vermelho nos 6 dias, círculo verde no domingo."""
    card = Image.new("RGBA", (960, 400), (250, 249, 246, 255))
    d = ImageDraw.Draw(card)
    d.rectangle([0, 0, 959, 399], outline=(205, 200, 190), width=3)
    dias = ["seg", "ter", "qua", "qui", "sex", "sáb", "dom"]
    for i, dia in enumerate(dias):
        cx = 80 + i * 133
        d.text((cx, 90), dia, font=fonte(SERIFA, 46), fill=TINTA, anchor="mm")
        d.rectangle([cx - 50, 160, cx + 50, 260], outline=(60, 60, 60), width=3)
        if i < 6:
            p = prog(lt, 0.35 + i * 0.14, 0.12)
            if p > 0:
                a = min(1, p * 2)
                d.line([(cx - 40, 170), (cx - 40 + 80 * a, 170 + 80 * a)], fill=VERMELHO, width=9)
                if p > 0.5:
                    b = (p - 0.5) * 2
                    d.line([(cx + 40, 170), (cx + 40 - 80 * b, 170 + 80 * b)], fill=VERMELHO, width=9)
        else:
            p = prog(lt, 1.25, 0.3)
            if p > 0:
                d.arc([cx - 62, 148, cx + 62, 272], -90, -90 + 360 * p, fill=VERDE, width=9)
        legenda = "folga" if i == 6 else "trab."
        if i == 6 and lt >= 1.35 or i < 6 and lt >= 0.45 + i * 0.14:
            d.text((cx, 320), legenda, font=fonte(SERIFA, 38),
                   fill=VERDE if i == 6 else (120, 120, 120), anchor="mm")
    return card


def moldura_dourada():
    w, h, borda = 620, 780, 64
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    for k in range(borda):
        x = k / borda
        brilho = 0.55 + 0.45 * math.sin(math.pi * x) ** 0.7 * (1 if x < 0.5 else 0.8)
        cor = tuple(int(c * brilho) for c in (222, 178, 82))
        d.rectangle([k, k, w - 1 - k, h - 1 - k], outline=cor)
    for k in (10, borda - 12):
        d.rectangle([k, k, w - 1 - k, h - 1 - k], outline=(110, 78, 28), width=3)
    d.rectangle([borda, borda, w - borda, h - borda], fill=(34, 31, 28))
    d.rectangle([borda, borda, w - borda, h - borda], outline=(20, 16, 10), width=6)
    escrever(d, (w / 2, h / 2 - 40), "tempo", SERIFA, 92, BRANCO)
    escrever(d, (w / 2, h / 2 + 60), "livre", SERIFA, 92, BRANCO)
    return img


MOLDURA = moldura_dourada()


# ---------------------------------------------------------------- planos

PLANOS = []


def plano(inicio, fim, fundo, sons=()):
    def registrar(func):
        PLANOS.append((inicio, fim, fundo, func, list(sons)))
        return func
    return registrar


def sons_digitando(inicio, texto, por_letra):
    return [(inicio + i * por_letra, "tecla", 1.0) for i, ch in enumerate(texto) if ch != " "]


@plano(0.0, 1.3, "preto", [(0, "impacto", 0.5)])
def p_todo_mundo(d, c, lt):
    surgir(d, (W / 2, H / 2), "TODO MUNDO", SANS, 76, BRANCO, lt, 0.05)


@plano(1.3, 2.6, "papel", [(0, "corte", 0.8), (0.35, "blip", 0.6)])
def p_conhece(d, c, lt):
    surgir(d, (W / 2 - 150, H / 2), "conhece", SERIFA, 76, TINTA, lt, 0)
    surgir(d, (W / 2 + 150, H / 2), "alguém", SERIFA, 76, TINTA, lt, 0.35)


@plano(2.6, 4.0, "papel", [(0, "corte", 0.8)] + [(t, "blip", 0.5) for t in (0.25, 0.5, 0.8)])
def p_seis_dias(d, c, lt):
    surgir(d, (330, 820), "que", SERIFA, 64, TINTA, lt, 0)
    surgir(d, (690, 820), "trabalha", SERIFA, 64, TINTA, lt, 0.25)
    surgir(d, (W / 2, 960), "seis dias", SERIFA, 104, TINTA, lt, 0.5)
    surgir(d, (W / 2, 1090), "por semana", SERIFA, 64, TINTA, lt, 0.8)


@plano(4.0, 5.4, "planta", [(0, "corte", 0.8)] + sons_digitando(0.1, "E FOLGA SÓ", 0.07))
def p_folga_so(d, c, lt):
    digitar(d, H / 2, "E FOLGA SÓ", SANS, 66, TINTA, lt, 0.1, 0.07)


@plano(5.4, 6.8, "planta", [(0, "corte", 0.6)] + sons_digitando(0.05, "UM DIA.", 0.06)
       + [(0.55, "blip", 0.8)])
def p_um_dia(d, c, lt):
    f = fonte(SANS, 136)
    x0 = (W - d.textlength("UM DIA.", font=f)) / 2
    selecao(d, (x0 - 24, H / 2 - 92, x0 + d.textlength("UM DIA", font=f) + 24, H / 2 + 92),
            prog(lt, 0.55, 0.25))
    digitar(d, H / 2, "UM DIA.", SANS, 136, TINTA, lt, 0.05, 0.06)


@plano(6.8, 8.3, "preto", [(0, "corte", 0.8), (0.45, "impacto", 0.6)])
def p_escala(d, c, lt):
    surgir(d, (W / 2, 860), "ISSO É A", SANS, 58, BRANCO, lt, 0)
    surgir(d, (W / 2, 990), "ESCALA 6x1.", SANS, 124, BRANCO, lt, 0.45)


@plano(8.3, 10.1, "papel", [(0, "corte", 0.6), (0, "whoosh", 0.3)]
       + [(0.35 + i * 0.14, "risco", 1.0) for i in range(6)]
       + [(1.25, lambda: sfx.sino(1046.5, 1.2, 0.45), 1.0)])
def p_calendario(d, c, lt):
    surgir(d, (W / 2, 640), "seis por um", SERIFA, 64, TINTA, lt, 0)
    p = prog(lt, 0, 0.3)
    colar_com_sombra(c, calendario(lt), (W / 2, H / 2 + 40 + (1 - p) * 80), angulo=-3, alpha=p)


@plano(10.1, 11.5, "papel", [(0, "corte", 0.8)]
       + [(0.8 * (1 - (1 - k / 20) ** (1 / 3)), "tick", 0.8) for k in range(20)]
       + [(0.8, lambda: sfx.sino(784, 0.9, 0.35), 1.0)])
def p_horas(d, c, lt):
    n = int(round(44 * ease(lt / 0.8)))
    escrever(d, (W / 2, 900), f"{n}", SERIFA, 330, TINTA)
    surgir(d, (W / 2, 1150), "horas por semana", SERIFA, 62, TINTA, lt, 0.5)


@plano(11.5, 13.1, "preto", [(0, "corte", 0.8)] + [(t, "blip", 0.7) for t in (0.1, 0.4, 0.7)]
       + [(1.0, lambda: sfx.sino(523.3, 1.0, 0.3), 1.0)])
def p_rotina(d, c, lt):
    cx, cy = W / 2, 950
    for k in range(6):
        r = 110 + k * 90 + (lt * 60) % 90
        a = int(120 * (1 - r / 700))
        if a > 0:
            d.ellipse([cx - r, cy - r, cx + r, cy + r], outline=(150, 150, 150, a), width=3)
    for i, (texto, x, y) in enumerate((("Trabalho", 450, 860), ("Trajeto", 560, 960),
                                       ("Casa", 660, 1060))):
        rotulo(d, (x, y), texto, 50, prog(lt, 0.1 + i * 0.3, 0.15))
    surgir(d, (W / 2, 1330), "e o descanso?", SERIFA, 74, BRANCO, lt, 1.0)


@plano(13.1, 14.7, "papel", [(0, "corte", 0.8)] + [(t, "blip", 0.5) for t in (0.2, 0.4, 0.6)]
       + [(0.95, "risco", 0.8)])
def p_depois(d, c, lt):
    apaga = 1 - 0.6 * prog(lt, 0.9, 0.25)
    cinza = tuple(int(TINTA[i] + (180 - TINTA[i]) * (1 - apaga)) for i in range(3))
    for texto, x, y, t0 in (("família", 360, 800, 0), ("estudo", 720, 890, 0.2),
                            ("saúde", 430, 990, 0.4), ("lazer", 710, 1080, 0.6)):
        surgir(d, (x, y), texto, SERIFA, 74, cinza, lt, t0)
    surgir(d, (W / 2, 1270), "ficam para depois.", SERIFA, 70, TINTA, lt, 0.95)


@plano(14.7, 16.5, "planta", [(0, "corte", 0.8)] + [(t, "blip", 0.8) for t in (0.2, 0.45, 0.7)]
       + [(0.95, "risco", 1.2)])
def p_debate(d, c, lt):
    surgir(d, (W / 2, 660), "em debate no Congresso", SERIFA, 62, TINTA, lt, 0)
    caixa = rotulo(d, (W / 2, 860), "6x1", 84, prog(lt, 0.2, 0.15))
    rotulo(d, (W / 2, 1030), "5x2", 84, prog(lt, 0.45, 0.15))
    rotulo(d, (W / 2, 1200), "4x3", 84, prog(lt, 0.7, 0.15), cor=VERDE)
    p = prog(lt, 0.95, 0.2)
    if caixa and p > 0:
        x0, x1 = caixa[0] - 30, caixa[2] + 30
        d.line([(x0, 880), (x0 + (x1 - x0) * p, 840)], fill=VERMELHO + (255,), width=12)


@plano(16.5, 18.3, "papel", [(0, "corte", 0.6), (0.05, "impacto", 0.35), (0.7, "blip", 0.6)])
def p_moldura(d, c, lt):
    p = prog(lt, 0, 0.35)
    colar_com_sombra(c, MOLDURA, (W / 2, 880), angulo=1.5, escala=0.85 + 0.15 * p, alpha=p)
    surgir(d, (W / 2, 1400), "também é direito.", SERIFA, 66, TINTA, lt, 0.7)


@plano(18.3, 20.0, "preto", [(0, "corte", 0.8), (0.4, "impacto", 0.6),
                             (0.4, lambda: sfx.sino(659.3, 1.4, 0.3), 1.0)])
def p_final(d, c, lt):
    surgir(d, (W / 2, 900), "E VOCÊ,", SANS, 80, BRANCO, lt, 0)
    surgir(d, (W / 2, 1020), "O QUE ACHA?", SANS, 100, BRANCO, lt, 0.4)


# ---------------------------------------------------------------- render

def quadro(n):
    t = n / FPS
    for inicio, fim, fundo, func, _ in PLANOS:
        if inicio <= t < fim:
            break
    lt, dur = t - inicio, fim - inicio
    camada = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    func(ImageDraw.Draw(camada, "RGBA"), camada, lt)
    img = FUNDOS[fundo].copy()
    img.paste(camada, (0, 0), camada)

    # zoom lento dentro do plano + leve tremida de película
    z = 1.01 + 0.04 * lt / dur
    cw, ch = W / z, H / z
    dx, dy = rng.uniform(-2, 2), rng.uniform(-2, 2)
    x0, y0 = (W - cw) / 2 + dx, (H - ch) / 2 + dy
    img = img.resize((W, H), Image.BILINEAR, box=(x0, y0, x0 + cw, y0 + ch))

    arr = np.asarray(img, np.float32) * VINHETA + GRAOS[n % len(GRAOS)]
    if t > DURACAO - 0.4:
        arr *= (DURACAO - t) / 0.4
    return arr.clip(0, 255).astype(np.uint8)


def main():
    audio = SAIDA.with_suffix(".wav")
    eventos = [(inicio + t, som, vol) for inicio, _, _, _, sons in PLANOS for t, som, vol in sons]
    sfx.mixar(audio, DURACAO, eventos)
    ffmpeg = subprocess.Popen(
        ["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24",
         "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-", "-i", str(audio),
         # a granulação muda a cada quadro; sem teto de bitrate o arquivo passa de 200 MB
         "-c:v", "libx264", "-pix_fmt", "yuv420p", "-tune", "grain",
         "-b:v", "6M", "-maxrate", "8M", "-bufsize", "16M",
         "-c:a", "aac", "-ac", "2", "-ar", "48000", "-b:a", "192k", "-shortest",
         "-movflags", "+faststart", str(SAIDA)],
        stdin=subprocess.PIPE,
    )
    for n in range(FPS * DURACAO):
        ffmpeg.stdin.write(quadro(n).tobytes())
    ffmpeg.stdin.close()
    ffmpeg.wait()
    audio.unlink()
    print(f"Vídeo salvo em {SAIDA}")


if __name__ == "__main__":
    main()
