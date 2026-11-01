"""Vídeo de 30s criticando o extremismo de Renan Santos, no estilo "documentário editorial".

Continuação do vídeo da "esquerda cirandeira": lá, a régua política colocou Renan
Santos na seção "direita"; aqui o vídeo retoma a régua, traz o que os comentários
apontaram e corrige o marcador para "extrema direita".

Mesma base de estilo do vídeo da 6x1 (veja ../video_escala_6x1/ESTILO.md): cortes
secos, uma ideia por tela, sans negrito sobre preto, serifa itálica sobre papel,
folha de patente, texto digitado, caixa de seleção azul, rótulos, granulação,
scanlines, vinheta e zoom lento.

Uso: python3 gerar_video_renan.py  (requer Pillow, numpy e ffmpeg)
"""
import math
import subprocess
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

AQUI = Path(__file__).parent
sys.path.insert(0, str(AQUI.parent / "video_escala_6x1"))
import efeitos_sonoros as sfx  # noqa: E402

W, H = 1080, 1920
FPS = 30
DURACAO = 30
SAIDA = AQUI / "renan_santos_extrema_direita.mp4"

SANS = "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"
SERIFA = "/usr/share/fonts/truetype/liberation/LiberationSerif-Italic.ttf"
SERIFA_RETA = "/usr/share/fonts/truetype/liberation/LiberationSerif-Regular.ttf"

TINTA = (22, 22, 22)
BRANCO = (240, 240, 238)
CINZA = (120, 120, 120)
AZUL = (38, 118, 232)
VERMELHO = (200, 40, 40)

rng = np.random.default_rng(2026)
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
    """Papel bege com desenho técnico apagado, como uma folha de patente."""
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
    # régua apagada ao fundo, no lugar do desenho da patente
    for k in range(0, 41):
        x = 120 + k * 21
        alto = 60 if k % 10 == 0 else (40 if k % 5 == 0 else 24)
        d.line([(x, H - 330), (x, H - 330 + alto)], fill=traco, width=2)
    d.text((140, H - 240), "régua política", font=fonte(SERIFA, 70), fill=(110, 98, 80, 60))
    d.text((180, H - 160), "esquerda · direita", font=fonte(SERIFA, 56), fill=(110, 98, 80, 60))
    return img


FUNDOS = {
    "preto": _manchas((14, 14, 15), 2),
    "papel": _manchas((233, 231, 227), 3),
    "planta": fundo_planta(),
}

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
    """Texto que entra com um pequeno "pulo" de escala."""
    p = prog(lt, inicio, 0.16)
    if p <= 0:
        return
    escrever(d, xy, texto, caminho, tamanho * (1.12 - 0.12 * p), cor, p)


def digitar(d, cy, texto, caminho, tamanho, cor, lt, inicio, por_letra):
    """Máquina de escrever com cursor piscando."""
    f = fonte(caminho, tamanho)
    x0 = (W - d.textlength(texto, font=f)) / 2
    n = max(0, min(len(texto), int((lt - inicio) / por_letra) + 1)) if lt >= inicio else 0
    parcial = texto[:n]
    d.text((x0, cy), parcial, font=f, fill=cor + (255,), anchor="lm")
    if int(lt * 3) % 2 == 0 or n < len(texto):
        xc = x0 + d.textlength(parcial, font=f) + 6
        d.line([(xc, cy - tamanho * 0.45), (xc, cy + tamanho * 0.45)], fill=cor + (255,), width=4)
    return x0, x0 + d.textlength(texto, font=f)


def selecao(d, caixa, p, cor=AZUL, fundo=None):
    """Caixa de seleção com alças, como numa ferramenta de design.

    `fundo` é usado ao desenhar direto num cartão opaco: a cor translúcida é
    misturada à mão, já que ali o ImageDraw não faz a mistura.
    """
    if p <= 0:
        return
    x0, y0, x1, y1 = caixa
    x1 = x0 + (x1 - x0) * p
    if fundo is None:
        preenche = cor + (50,)
    else:
        preenche = tuple(int(f + (c - f) * 0.2) for f, c in zip(fundo, cor)) + (255,)
    d.rectangle([x0, y0, x1, y1], fill=preenche, outline=cor + (255,), width=4)
    for hx in (x0, (x0 + x1) / 2, x1):
        for hy in (y0, (y0 + y1) / 2, y1):
            if hx == (x0 + x1) / 2 and hy == (y0 + y1) / 2:
                continue
            d.rectangle([hx - 9, hy - 9, hx + 9, hy + 9], fill=(255, 255, 255, 255),
                        outline=cor + (255,), width=3)


def rotulo(d, xy, texto, tamanho, p, cor=AZUL):
    """Etiqueta de interface: retângulo colorido, borda branca, texto branco."""
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


# --- a régua do vídeo da "esquerda cirandeira"

SECOES = [("extrema", "esquerda"), ("", "esquerda"), ("", "centro"),
          ("", "direita"), ("extrema", "direita")]
CORES_SECAO = [(150, 30, 34), (214, 96, 90), (170, 168, 160), (96, 140, 214), (28, 52, 140)]
REGUA_W, REGUA_H = 1000, 560
R_X0, R_X1 = 40, 960
SEG = (R_X1 - R_X0) / 5
X_DIREITA = R_X0 + SEG * 3.5
X_EXTREMA = R_X0 + SEG * 4.5


def regua(marcador_x, destaque=None, risco_antigo=0.0, p_sel=0.0, cor_sel=AZUL):
    """Recorte de papel com a régua política e o marcador "Renan Santos"."""
    card = Image.new("RGBA", (REGUA_W, REGUA_H), (250, 249, 246, 255))
    d = ImageDraw.Draw(card, "RGBA")
    d.rectangle([0, 0, REGUA_W - 1, REGUA_H - 1], outline=(205, 200, 190), width=3)
    topo, base = 250, 330
    for i, cor in enumerate(CORES_SECAO):
        x0 = R_X0 + i * SEG
        d.rectangle([x0, topo, x0 + SEG, base], fill=cor)
    d.rectangle([R_X0, topo, R_X1, base], outline=TINTA, width=3)
    # milímetros, como numa régua de verdade
    for k in range(0, 101):
        x = R_X0 + k * (R_X1 - R_X0) / 100
        alto = 34 if k % 10 == 0 else (22 if k % 5 == 0 else 12)
        d.line([(x, base), (x, base + alto)], fill=TINTA, width=2)
    # a seleção vem antes dos nomes: num RGBA o ImageDraw não mistura, só sobrescreve
    if p_sel > 0 and destaque is not None:
        x0 = R_X0 + destaque * SEG
        selecao(d, (x0 + 4, 388, x0 + SEG - 4, 498), p_sel, cor_sel, fundo=(250, 249, 246))
    for i, (linha1, linha2) in enumerate(SECOES):
        cx = R_X0 + (i + 0.5) * SEG
        cor = (VERMELHO if cor_sel == VERMELHO else AZUL) if destaque == i and p_sel > 0 else TINTA
        escrever(d, (cx, 418), linha1, SERIFA, 36, cor)
        escrever(d, (cx, 462), linha2, SERIFA, 40, cor)
    # marca antiga riscada
    if risco_antigo > 0:
        x = X_DIREITA
        d.line([(x - 50, 175), (x - 50 + 100 * risco_antigo, 175 + 60 * risco_antigo)],
               fill=VERMELHO, width=8)
        d.line([(x + 50, 175), (x + 50 - 100 * risco_antigo, 175 + 60 * risco_antigo)],
               fill=VERMELHO, width=8)
    # marcador: etiqueta com o nome e um triângulo apontando para a régua
    if marcador_x is not None:
        f = fonte(SANS, 38)
        texto = "RENAN SANTOS"
        w = d.textlength(texto, font=f)
        cx = min(max(marcador_x, w / 2 + 40), REGUA_W - w / 2 - 30)
        d.rectangle([cx - w / 2 - 20, 70, cx + w / 2 + 20, 140], fill=TINTA)
        d.text((cx, 105), texto, font=f, fill=BRANCO, anchor="mm")
        d.line([(cx, 140), (marcador_x, 228)], fill=TINTA, width=4)
        d.polygon([(marcador_x - 18, 222), (marcador_x + 18, 222), (marcador_x, 250)], fill=TINTA)
    return card


def comentario(texto, largura=820):
    """Cartão de comentário: avatar, linha cinza no lugar do nome e o texto."""
    card = Image.new("RGBA", (largura, 170), (0, 0, 0, 0))
    d = ImageDraw.Draw(card)
    d.rounded_rectangle([0, 0, largura - 1, 169], 26, fill=(250, 249, 246, 255))
    d.ellipse([28, 30, 108, 110], fill=(190, 186, 178))
    d.ellipse([52, 44, 84, 76], fill=(225, 222, 215))
    d.rounded_rectangle([132, 36, 132 + 180, 54], 9, fill=(200, 196, 188))
    d.text((132, 108), texto, font=fonte(SANS, 44), fill=TINTA, anchor="lm")
    return card


COMENTARIOS = [comentario(t) for t in ("isso é extrema direita", "a régua tá errada aí",
                                       "direita? tá mais pra lá")]


def ficha(ano, linhas, grifo=None, p=0.0):
    """Recorte de papel tipo ficha de arquivo, com o ano em destaque.

    grifo = (linha, trecho): o trecho é sublinhado em vermelho conforme p vai de 0 a 1.
    """
    card = Image.new("RGBA", (900, 560), (250, 249, 246, 255))
    d = ImageDraw.Draw(card)
    d.rectangle([0, 0, 899, 559], outline=(205, 200, 190), width=3)
    for y in range(150, 560, 62):
        d.line([(40, y), (860, y)], fill=(214, 224, 236), width=2)
    d.line([(110, 0), (110, 559)], fill=(232, 170, 170), width=2)
    d.text((140, 82), ano, font=fonte(SANS, 72), fill=TINTA, anchor="lm")
    for i, linha in enumerate(linhas):
        d.text((140, 205 + i * 62), linha, font=fonte(SERIFA, 50), fill=TINTA, anchor="lm")
    if grifo and p > 0:
        i, trecho = grifo
        f = fonte(SERIFA, 50)
        xa = 140 + d.textlength(linhas[i][:linhas[i].index(trecho)], font=f)
        xb = xa + d.textlength(trecho, font=f)
        y = 205 + i * 62 + 24
        d.line([(xa - 4, y + 3), (xa - 4 + (xb - xa + 8) * p, y - 2)], fill=VERMELHO, width=7)
    return card


TEXTO_2017 = ["MBL faz campanha contra", "a exposição Queermuseu,",
              "que acaba fechada", "em Porto Alegre."]
TEXTO_2018 = ["Facebook remove rede de", "páginas e perfis ligados",
              "ao MBL, citando contas", "falsas e desinformação."]


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
    escrever(d, (w / 2, h / 2 - 40), "a mesma", SERIFA, 84, BRANCO)
    escrever(d, (w / 2, h / 2 + 60), "régua", SERIFA, 92, BRANCO)
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


@plano(0.0, 1.4, "preto", [(0, "impacto", 0.5)])
def p_lembra(d, c, lt):
    surgir(d, (W / 2, 900), "LEMBRA", SANS, 76, BRANCO, lt, 0.05)
    surgir(d, (W / 2, 1010), "DA RÉGUA?", SANS, 92, BRANCO, lt, 0.45)


@plano(1.4, 3.0, "papel", [(0, "corte", 0.8), (0.3, "blip", 0.6), (0.6, "blip", 0.6)])
def p_cirandeira(d, c, lt):
    surgir(d, (W / 2, 860), "aquela do vídeo da", SERIFA, 64, TINTA, lt, 0)
    surgir(d, (W / 2, 990), "esquerda", SERIFA, 104, TINTA, lt, 0.3)
    surgir(d, (W / 2, 1110), "cirandeira", SERIFA, 104, TINTA, lt, 0.6)


@plano(3.0, 5.6, "papel", [(0, "corte", 0.6), (0, "whoosh", 0.3), (0.9, "pop", 0.8),
                           (1.4, "blip", 0.7)])
def p_regua_antes(d, c, lt):
    surgir(d, (W / 2, 560), "lá, ele ficou aqui:", SERIFA, 64, TINTA, lt, 0)
    p = prog(lt, 0, 0.3)
    m = prog(lt, 0.5, 0.4)
    marcador = R_X0 + (X_DIREITA - R_X0) * m if lt >= 0.5 else None
    card = regua(marcador, destaque=3 if lt >= 1.4 else None, p_sel=prog(lt, 1.4, 0.25))
    colar_com_sombra(c, card, (W / 2, H / 2 + 40 + (1 - p) * 80), angulo=-2, alpha=p)
    surgir(d, (W / 2, 1360), "na direita.", SERIFA, 64, TINTA, lt, 1.4)


@plano(5.6, 7.6, "preto", [(0, "corte", 0.8)] + [(t, "pop", 0.7) for t in (0.3, 0.75, 1.2)])
def p_comentarios(d, c, lt):
    surgir(d, (W / 2, 560), "mas nos comentários...", SERIFA, 66, BRANCO, lt, 0)
    for i, (card, t0) in enumerate(zip(COMENTARIOS, (0.3, 0.75, 1.2))):
        p = prog(lt, t0, 0.18)
        if p > 0:
            colar_com_sombra(c, card, (W / 2 + (i - 1) * 30, 800 + i * 220 + (1 - p) * 40),
                             angulo=(-1.5, 1.0, -0.5)[i], alpha=p)


@plano(7.6, 9.0, "preto", [(0, "corte", 0.8), (0.45, "impacto", 0.6)])
def p_razao(d, c, lt):
    surgir(d, (W / 2, 880), "E VOCÊS", SANS, 64, BRANCO, lt, 0)
    surgir(d, (W / 2, 1000), "TINHAM RAZÃO.", SANS, 104, BRANCO, lt, 0.45)


@plano(9.0, 10.6, "planta", [(0, "corte", 0.8)] + sons_digitando(0.1, "QUEM É RENAN SANTOS?", 0.05))
def p_quem(d, c, lt):
    digitar(d, H / 2, "QUEM É RENAN SANTOS?", SANS, 66, TINTA, lt, 0.1, 0.05)


@plano(10.6, 12.2, "papel", [(0, "corte", 0.6)] + [(t, "blip", 0.6) for t in (0.0, 0.3, 0.7, 1.0)])
def p_mbl(d, c, lt):
    surgir(d, (W / 2, 780), "cofundador do", SERIFA, 62, TINTA, lt, 0)
    rotulo(d, (W / 2, 900), "MBL", 84, prog(lt, 0.3, 0.15))
    surgir(d, (W / 2, 1060), "e líder do partido", SERIFA, 62, TINTA, lt, 0.7)
    rotulo(d, (W / 2, 1180), "MISSÃO", 84, prog(lt, 1.0, 0.15))


@plano(12.2, 14.2, "papel", [(0, "corte", 0.6), (0, "whoosh", 0.3), (0.9, "risco", 1.0)])
def p_ficha_2017(d, c, lt):
    surgir(d, (W / 2, 560), "o histórico", SERIFA, 64, TINTA, lt, 0)
    p = prog(lt, 0, 0.3)
    card = ficha("2017", TEXTO_2017, (1, "Queermuseu"), prog(lt, 0.9, 0.3))
    colar_com_sombra(c, card, (W / 2, H / 2 + 40 + (1 - p) * 80), angulo=2, alpha=p)


@plano(14.2, 16.2, "papel", [(0, "corte", 0.6), (0, "whoosh", 0.3), (0.9, "risco", 1.0)])
def p_ficha_2018(d, c, lt):
    surgir(d, (W / 2, 560), "fala por si:", SERIFA, 64, TINTA, lt, 0)
    p = prog(lt, 0, 0.3)
    card = ficha("2018", TEXTO_2018, (3, "desinformação"), prog(lt, 0.9, 0.3))
    colar_com_sombra(c, card, (W / 2, H / 2 + 40 + (1 - p) * 80), angulo=-2, alpha=p)


@plano(16.2, 18.0, "planta", [(0, "corte", 0.8)] + [(t, "blip", 0.8) for t in (0.2, 0.45, 0.7)]
       + [(1.0, "impacto", 0.4)])
def p_guerra(d, c, lt):
    surgir(d, (W / 2, 640), "no discurso, a política vira", SERIFA, 58, TINTA, lt, 0)
    rotulo(d, (W / 2 - 150, 860), "GUERRA", 76, prog(lt, 0.2, 0.15), cor=VERMELHO)
    rotulo(d, (W / 2 + 120, 1010), "INIMIGOS", 76, prog(lt, 0.45, 0.15), cor=VERMELHO)
    rotulo(d, (W / 2 - 60, 1160), "MÃO DE FERRO", 76, prog(lt, 0.7, 0.15), cor=VERMELHO)
    surgir(d, (W / 2, 1380), "e quem discorda vira alvo.", SERIFA, 58, TINTA, lt, 1.0)


@plano(18.0, 19.6, "preto", [(0, "corte", 0.8), (0.45, "impacto", 0.6)])
def p_nao_moderada(d, c, lt):
    surgir(d, (W / 2, 880), "ISSO NÃO É", SANS, 64, BRANCO, lt, 0)
    surgir(d, (W / 2, 1000), "DIREITA MODERADA.", SANS, 92, BRANCO, lt, 0.45)


@plano(19.6, 22.6, "papel", [(0, "corte", 0.6), (0.35, "risco", 1.2), (0.9, "whoosh", 0.4),
                             (1.5, "impacto", 0.5), (1.6, lambda: sfx.sino(440, 1.2, 0.35), 1.0)])
def p_regua_corrigida(d, c, lt):
    surgir(d, (W / 2, 560), "régua corrigida:", SERIFA, 64, TINTA, lt, 0)
    m = prog(lt, 0.9, 0.55)
    marcador = X_DIREITA + (X_EXTREMA - X_DIREITA) * m
    destaque = 4 if lt >= 1.5 else 3
    card = regua(marcador, destaque=destaque, risco_antigo=prog(lt, 0.35, 0.3),
                 p_sel=prog(lt, 1.5, 0.25) if lt >= 1.5 else 1.0,
                 cor_sel=VERMELHO if lt >= 1.5 else AZUL)
    colar_com_sombra(c, card, (W / 2, H / 2 + 40), angulo=-2)
    surgir(d, (W / 2, 1360), "extrema direita.", SERIFA, 72, VERMELHO, lt, 1.5)


@plano(22.6, 24.2, "papel", [(0, "corte", 0.8), (0.35, "blip", 0.6), (0.8, "blip", 0.6)])
def p_terno(d, c, lt):
    surgir(d, (W / 2, 840), "trocar o grito", SERIFA, 76, TINTA, lt, 0)
    surgir(d, (W / 2, 960), "pelo terno", SERIFA, 76, TINTA, lt, 0.35)
    surgir(d, (W / 2, 1100), "e pelo partido novo", SERIFA, 62, CINZA, lt, 0.8)


@plano(24.2, 25.8, "planta", [(0, "corte", 0.6)] + sons_digitando(0.05, "NÃO MUDA O LUGAR", 0.045)
       + [(1.0, "blip", 0.8)])
def p_lugar(d, c, lt):
    f = fonte(SANS, 66)
    x0 = (W - d.textlength("NÃO MUDA O LUGAR", font=f)) / 2
    selecao(d, (x0 + d.textlength("NÃO MUDA O ", font=f) - 18, H / 2 - 120 - 56,
                x0 + d.textlength("NÃO MUDA O LUGAR", font=f) + 18, H / 2 - 120 + 56),
            prog(lt, 1.0, 0.25))
    digitar(d, H / 2 - 120, "NÃO MUDA O LUGAR", SANS, 66, TINTA, lt, 0.05, 0.045)
    surgir(d, (W / 2, H / 2 + 20), "na régua.", SERIFA, 76, TINTA, lt, 0.85)


@plano(25.8, 28.2, "papel", [(0, "corte", 0.6), (0.05, "impacto", 0.35), (0.8, "blip", 0.6),
                             (1.3, "blip", 0.6)])
def p_moldura(d, c, lt):
    p = prog(lt, 0, 0.35)
    colar_com_sombra(c, MOLDURA, (W / 2, 860), angulo=1.5, escala=0.85 + 0.15 * p, alpha=p)
    surgir(d, (W / 2, 1360), "que mede a esquerda cirandeira", SERIFA, 56, TINTA, lt, 0.8)
    surgir(d, (W / 2, 1450), "mede a direita também.", SERIFA, 56, TINTA, lt, 1.3)


@plano(28.2, 30.0, "preto", [(0, "corte", 0.8), (0.4, "impacto", 0.6),
                             (0.4, lambda: sfx.sino(659.3, 1.4, 0.3), 1.0)])
def p_final(d, c, lt):
    surgir(d, (W / 2, 900), "E VOCÊ,", SANS, 80, BRANCO, lt, 0)
    surgir(d, (W / 2, 1020), "ONDE COLOCARIA?", SANS, 96, BRANCO, lt, 0.4)


# ---------------------------------------------------------------- som

def cama_tensa(duracao):
    """Drone grave em tom menor com pulsação lenta, como batimento (sem o relógio da 6x1)."""
    t = np.arange(int(sfx.SR * duracao)) / sfx.SR
    lento = 0.6 + 0.4 * np.sin(2 * np.pi * t / 6)
    som = (np.sin(2 * np.pi * 49 * t) + 0.5 * np.sin(2 * np.pi * 58.3 * t)
           + 0.3 * np.sin(2 * np.pi * 73.4 * t) + 0.12 * np.sin(2 * np.pi * 98.2 * t)) * lento * 0.17
    som *= np.minimum(1, t / 1.0)
    for k in range(int(duracao / 0.85)):
        for atraso, vol in ((0.0, 0.55), (0.22, 0.35)):
            batida = sfx.kick() * vol
            i = int((k * 0.85 + atraso) * sfx.SR)
            som[i:i + len(batida)] += batida[: max(0, len(som) - i)]
    return som


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
    if len(sys.argv) > 1 and sys.argv[1] == "--previa":
        # salva um quadro de cada plano para conferir o layout sem renderizar tudo
        for inicio, fim, _, func, _ in PLANOS:
            n = int((inicio + (fim - inicio) * 0.85) * FPS)
            Image.fromarray(quadro(n)).save(Path(sys.argv[2]) / f"previa_{func.__name__}.png")
        return
    audio = SAIDA.with_suffix(".wav")
    eventos = [(inicio + t, som, vol) for inicio, _, _, _, sons in PLANOS for t, som, vol in sons]
    sfx.mixar(audio, DURACAO, eventos, fundo=cama_tensa)
    ffmpeg = subprocess.Popen(
        ["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24",
         "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-", "-i", str(audio),
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
