"""Vídeo de 20s sobre a escala 6x1 na estética de cartaz soviético / construtivista.

Paleta vermelho, mostarda, creme e preto; tipografia condensada em caixa alta;
composições diagonais, raios de sol girando, bandeira tremulando, estrelas,
punho erguido, carimbos e textura de papel impresso. Trilha de marcha.

Uso: python3 gerar_video_cartaz.py  (requer Pillow, numpy e ffmpeg)
"""
import math
import subprocess
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont

import efeitos_sonoros as sfx

W, H = 1080, 1920
FPS = 30
DURACAO = 20
AQUI = Path(__file__).parent
SAIDA = AQUI / "escala_6x1_cartaz.mp4"

CONDENSADA = str(AQUI / "fontes" / "BebasNeue-Regular.ttf")
BLOCO = str(AQUI / "fontes" / "RussoOne-Regular.ttf")

VERMELHO = (204, 34, 32)
VERMELHO_ESC = (160, 22, 22)
MOSTARDA = (234, 180, 38)
MOSTARDA_ESC = (214, 150, 26)
CREME = (238, 226, 198)
PRETO = (30, 25, 22)

rng = np.random.default_rng(1917)
_fontes = {}


def fonte(caminho, tamanho):
    chave = (caminho, int(tamanho))
    if chave not in _fontes:
        _fontes[chave] = ImageFont.truetype(caminho, int(tamanho))
    return _fontes[chave]


def ease(x):
    x = max(0.0, min(1.0, x))
    return 1 - (1 - x) ** 3


def back(x):
    """Ease com leve passada do ponto, para carimbos e entradas."""
    x = max(0.0, min(1.0, x))
    return max(0.0, 1 + 2.7 * (x - 1) ** 3 + 1.7 * (x - 1) ** 2)


def prog(lt, inicio, dur=0.2):
    return ease((lt - inicio) / dur)


# ---------------------------------------------------------------- textura de impressão

def _papel():
    """Fibra e manchas de papel impresso; somada a todo quadro."""
    baixa = rng.standard_normal((40, 23)).astype(np.float32)
    baixa = np.asarray(Image.fromarray(((baixa + 3) * 40).clip(0, 255).astype(np.uint8))
                       .resize((W, H), Image.BICUBIC), np.float32) / 40 - 3
    return (baixa * 3.5)[..., None]


PAPEL = _papel()
_yy, _xx = np.mgrid[0:H, 0:W].astype(np.float32)
_dist = np.sqrt(((_xx - W / 2) / (W / 2)) ** 2 + ((_yy - H / 2) / (H / 2)) ** 2)
VINHETA = (1 - 0.28 * np.clip(_dist - 0.5, 0, 1) ** 1.4)[..., None].astype(np.float32)
GRAOS = [rng.normal(0, 13, (H, W, 1)).astype(np.float32) for _ in range(6)]
del _yy, _xx, _dist


# ---------------------------------------------------------------- elementos

def texto(c, xy, conteudo, caminho, tamanho, cor, angulo=0.0, alpha=1.0, escala=1.0):
    """Texto centrado em xy, opcionalmente girado (composições diagonais)."""
    if alpha <= 0 or escala <= 0:
        return
    f = fonte(caminho, tamanho * escala)
    x0, y0, x1, y1 = f.getbbox(conteudo)
    img = Image.new("RGBA", (x1 - x0 + 20, y1 - y0 + 20), (0, 0, 0, 0))
    ImageDraw.Draw(img).text((10 - x0, 10 - y0), conteudo, font=f, fill=cor + (int(255 * alpha),))
    if angulo:
        img = img.rotate(angulo, Image.BICUBIC, expand=True)
    c.alpha_composite(img, (int(xy[0] - img.width / 2), int(xy[1] - img.height / 2)))


def carimbar(c, xy, conteudo, caminho, tamanho, cor, lt, inicio, angulo=0.0):
    """Texto que cai do tamanho 1,8x para 1x, como um carimbo."""
    x = (lt - inicio) / 0.18
    if x <= 0:
        return
    escala = 1 + 0.8 * (1 - ease(x))
    texto(c, xy, conteudo, caminho, tamanho, cor, angulo, min(1, x * 1.5), escala)


def deslizar(c, xy, conteudo, caminho, tamanho, cor, lt, inicio, angulo=0.0, de=(-900, 0)):
    p = back((lt - inicio) / 0.3)
    if lt < inicio:
        return
    x = xy[0] + de[0] * (1 - p)
    y = xy[1] + de[1] * (1 - p)
    texto(c, (x, y), conteudo, caminho, tamanho, cor, angulo)


def raios(d, centro, cor, giro, n=18, raio=2600):
    cx, cy = centro
    for k in range(n):
        a0 = math.radians(giro + k * 360 / n)
        a1 = a0 + math.radians(360 / n / 2)
        d.polygon([(cx, cy), (cx + raio * math.cos(a0), cy + raio * math.sin(a0)),
                   (cx + raio * math.cos(a1), cy + raio * math.sin(a1))], fill=cor)


def estrela(d, centro, r, cor, giro=-90.0):
    cx, cy = centro
    pts = []
    for k in range(10):
        rr = r if k % 2 == 0 else r * 0.4
        a = math.radians(giro + k * 36)
        pts.append((cx + rr * math.cos(a), cy + rr * math.sin(a)))
    d.polygon(pts, fill=cor)


def faixa(d, y, altura, angulo, cor, p=1.0, de_esquerda=True):
    """Faixa diagonal que atravessa a tela, entrando pela lateral."""
    t = math.tan(math.radians(angulo))
    largura = W + 400
    x0 = -200 if de_esquerda else W + 200 - largura * p
    x1 = x0 + largura * p if de_esquerda else W + 200
    pts = [(x0, y - (x0 - W / 2) * t - altura / 2), (x1, y - (x1 - W / 2) * t - altura / 2),
           (x1, y - (x1 - W / 2) * t + altura / 2), (x0, y - (x0 - W / 2) * t + altura / 2)]
    d.polygon(pts, fill=cor)


def retangulo_girado(d, cx, cy, w, h, ang, cor):
    a = math.radians(ang)
    ca, sa = math.cos(a), math.sin(a)
    pts = [(cx + dx * ca - dy * sa, cy + dx * sa + dy * ca)
           for dx, dy in ((-w / 2, -h / 2), (w / 2, -h / 2), (w / 2, h / 2), (-w / 2, h / 2))]
    d.polygon(pts, fill=cor)


def _foice_martelo(cor, lado=400):
    """Emblema em camada RGBA: lâmina em crescente aberta para cima/esquerda e martelo cruzado."""
    k = lado / 400
    lamina = Image.new("L", (lado, lado), 0)
    m = ImageDraw.Draw(lamina)
    m.ellipse([(210 - 135) * k, (190 - 135) * k, (210 + 135) * k, (190 + 135) * k], fill=255)
    m.ellipse([(186 - 116) * k, (166 - 116) * k, (186 + 116) * k, (166 + 116) * k], fill=0)
    m.pieslice([(210 - 200) * k, (190 - 200) * k, (210 + 200) * k, (190 + 200) * k], 160, 262, fill=0)
    img = Image.new("RGBA", (lado, lado), (0, 0, 0, 0))
    img.paste(cor + (255,), (0, 0), lamina)
    d = ImageDraw.Draw(img)
    a = math.radians(160)
    hx, hy = 210 * k + 125 * k * math.cos(a), 190 * k + 125 * k * math.sin(a)
    retangulo_girado(d, hx - 38 * k, hy + 38 * k, 30 * k, 110 * k, 45, cor)
    retangulo_girado(d, 228 * k, 248 * k, 28 * k, 250 * k, -45, cor)
    retangulo_girado(d, 135 * k, 155 * k, 58 * k, 130 * k, 45, cor)
    return img


EMBLEMA = _foice_martelo(MOSTARDA, 260)


def bandeira(d, c, mastro_x, topo, largura, altura, lt, cor=VERMELHO, simbolo=True):
    """Bandeira tremulando em faixas verticais, com sombreado pela inclinação da onda."""
    n = 48
    def borda(x, base):
        k = x / largura
        return base + math.sin(k * 5.5 - lt * 7) * 46 * k + k * 60

    d.rectangle([mastro_x - 14, topo - 30, mastro_x + 4, H], fill=(120, 78, 40))
    for i in range(n):
        xa, xb = largura * i / n, largura * (i + 1) / n + 1
        inclinacao = math.cos((xa / largura) * 5.5 - lt * 7)
        luz = 0.82 + 0.18 * inclinacao
        tom = tuple(int(v * luz) for v in cor)
        d.polygon([(mastro_x + xa, borda(xa, topo)), (mastro_x + xb, borda(xb, topo)),
                   (mastro_x + xb, borda(xb, topo + altura)), (mastro_x + xa, borda(xa, topo + altura))],
                  fill=tom)
    if simbolo:
        sx = mastro_x + largura * 0.26
        sy = borda(largura * 0.26, topo)
        estrela(d, (sx + 20, sy + 70), 38, MOSTARDA)
        c.alpha_composite(EMBLEMA, (int(sx - 130), int(sy + 130)))


def punho(d, cx, base_y, s, cor=PRETO, luz=CREME):
    """Punho erguido geométrico, no traço chapado do construtivismo."""
    topo = base_y - 560 * s
    d.polygon([(cx - 95 * s, H + 40), (cx + 95 * s, H + 40), (cx + 110 * s, topo + 250 * s),
               (cx - 110 * s, topo + 250 * s)], fill=cor)
    d.rounded_rectangle([cx - 170 * s, topo, cx + 160 * s, topo + 280 * s], int(40 * s), fill=cor)
    for k in range(1, 4):
        x = cx - 170 * s + k * 82 * s
        d.line([(x, topo + 12 * s), (x, topo + 120 * s)], fill=luz, width=int(9 * s))
    d.line([(cx - 160 * s, topo + 130 * s), (cx + 150 * s, topo + 130 * s)], fill=luz, width=int(9 * s))
    d.rounded_rectangle([cx - 190 * s, topo + 140 * s, cx + 40 * s, topo + 225 * s], int(36 * s),
                        fill=cor, outline=luz, width=int(9 * s))


def fabrica(d, base_y, lt, cor=PRETO):
    for i, (x, h) in enumerate(((120, 380), (300, 460), (820, 420), (960, 340))):
        d.rectangle([x - 35, base_y - h, x + 35, base_y], fill=cor)
        for k in range(4):
            fase = (lt * 0.6 + k * 0.25 + i * 0.13) % 1
            r = 30 + 70 * fase
            cy = base_y - h - 40 - 260 * fase
            cxf = x + 50 * fase + 20 * math.sin(fase * 6)
            d.ellipse([cxf - r, cy - r, cxf + r, cy + r], fill=cor + (int(170 * (1 - fase)),))
    pts = [(0, base_y)]
    for k in range(7):
        x = k * 160
        pts += [(x, base_y - 160), (x + 160, base_y - 240), (x + 160, base_y - 160)]
    pts += [(W, base_y - 160), (W, H), (0, H)]
    d.polygon(pts, fill=cor)


def relogio(d, centro, r, lt, cor=PRETO, fundo=CREME):
    cx, cy = centro
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=fundo, outline=cor, width=22)
    for k in range(12):
        a = math.radians(k * 30)
        d.line([(cx + (r - 50) * math.cos(a), cy + (r - 50) * math.sin(a)),
                (cx + (r - 22) * math.cos(a), cy + (r - 22) * math.sin(a))], fill=cor, width=12)
    for comp, vel, larg in ((0.5, 40, 22), (0.78, 480, 12)):
        a = math.radians(lt * vel - 90)
        d.line([(cx, cy), (cx + r * comp * math.cos(a), cy + r * comp * math.sin(a))], fill=cor, width=larg)
    d.ellipse([cx - 22, cy - 22, cx + 22, cy + 22], fill=VERMELHO)


# ---------------------------------------------------------------- planos

PLANOS = []


def plano(inicio, fim, cor_fundo, sons=()):
    def registrar(func):
        PLANOS.append((inicio, fim, cor_fundo, func, list(sons)))
        return func
    return registrar


def metal(freq, vol=1.0):
    return lambda: sfx.metais(freq), vol


@plano(0.0, 1.4, VERMELHO, [(0.05, *metal(196)), (0.5, "carimbo", 0.9)])
def p_trabalhador(d, c, lt):
    raios(d, (W / 2, 820), VERMELHO_ESC, lt * 12)
    p = back(lt / 0.45)
    estrela(d, (W / 2, 820), 330 * p, MOSTARDA, -90 + 40 * (1 - p))
    carimbar(c, (W / 2, 1330), "TRABALHADOR,", CONDENSADA, 210, CREME, lt, 0.5)


@plano(1.4, 2.8, MOSTARDA, [(0, "caixa", 0.7), (0.1, "whoosh", 0.5), (0.45, "carimbo", 0.7)])
def p_seis_dias(d, c, lt):
    faixa(d, 900, 330, 8, VERMELHO, prog(lt, 0, 0.3))
    deslizar(c, (W / 2, 890), "SEIS DIAS", CONDENSADA, 300, CREME, lt, 0.1, angulo=8)
    carimbar(c, (W / 2 + 60, 1150), "DE TRABALHO", BLOCO, 86, PRETO, lt, 0.45, angulo=8)


@plano(2.8, 4.3, CREME, [(0, "caixa", 0.7), (0.05, "whoosh", 0.4), (0.6, *metal(220)),
                         (0.9, "carimbo", 0.7)])
def p_um_dia(d, c, lt):
    raios(d, (W / 2, 1900), MOSTARDA, -lt * 8, n=14)
    p = back((lt - 0.05) / 0.5)
    punho(d, W / 2, 1900 + (1 - p) * 900, 1.25)
    carimbar(c, (W / 2, 420), "E UM DIA", CONDENSADA, 230, VERMELHO, lt, 0.6)
    carimbar(c, (W / 2, 600), "DE DESCANSO?", BLOCO, 92, PRETO, lt, 0.9)


@plano(4.3, 5.9, PRETO, [(0, "caixa", 0.7), (0.65, "impacto", 0.8), (0.65, *metal(174.6))])
def p_escala(d, c, lt):
    bandeira(d, c, 140, 230, 900, 640, lt)
    deslizar(c, (W / 2, 1180), "ISSO É A ESCALA", CONDENSADA, 150, CREME, lt, 0.1, de=(0, 500))
    carimbar(c, (W / 2, 1480), "6x1", BLOCO, 330, MOSTARDA, lt, 0.65, angulo=-6)


@plano(5.9, 7.6, MOSTARDA, [(0, "caixa", 0.7)] + [(0.2 + i * 0.13, "carimbo", 0.55) for i in range(6)]
       + [(1.05, lambda: sfx.sino(1046.5, 1.0, 0.45), 1.0)])
def p_semana(d, c, lt):
    texto(c, (W / 2, 360), "6 POR 1", CONDENSADA, 220, PRETO, alpha=prog(lt, 0, 0.15))
    dias = ["SEG", "TER", "QUA", "QUI", "SEX", "SÁB", "DOM"]
    for i, dia in enumerate(dias):
        x = 95 + i * 148
        folga = i == 6
        inicio = 1.05 if folga else 0.2 + i * 0.13
        p = back((lt - inicio) / 0.22)
        if lt < inicio:
            continue
        altura = (620 if not folga else 300) * p
        cor = CREME if folga else VERMELHO
        d.rectangle([x - 62, 1450 - altura, x + 62, 1450], fill=cor)
        texto(c, (x, 1510), dia, CONDENSADA, 70, PRETO)
        if folga:
            estrela(d, (x, 1450 - altura - 70), 55 * p, VERMELHO)
    d.rectangle([0, 1450, W, 1462], fill=PRETO)


@plano(7.6, 9.2, VERMELHO, [(0, "caixa", 0.7)]
       + [(0.8 * (1 - (1 - k / 18) ** (1 / 3)), "tick", 0.9) for k in range(18)]
       + [(0.8, "carimbo", 0.9), (0.8, *metal(196))])
def p_horas(d, c, lt):
    raios(d, (W / 2, 860), VERMELHO_ESC, -lt * 10)
    n = int(round(44 * ease(lt / 0.8)))
    texto(c, (W / 2, 860), f"{n}H", CONDENSADA, 640, CREME)
    faixa(d, 1330, 170, -6, PRETO, prog(lt, 0.6, 0.25), de_esquerda=False)
    if lt > 0.75:
        texto(c, (W / 2, 1330), "POR SEMANA", BLOCO, 100, MOSTARDA, angulo=-6)


@plano(9.2, 10.9, CREME, [(0, "caixa", 0.7)] + [(t, "whoosh", 0.35) for t in (0.15, 0.4, 0.65)]
       + [(1.0, "carimbo", 0.6)])
def p_rotina(d, c, lt):
    fabrica(d, 1920, lt)
    relogio(d, (W / 2, 1220), 260, lt)
    for i, (palavra, y) in enumerate((("TRABALHO", 320), ("TRAJETO", 520), ("CASA", 720))):
        p = prog(lt, 0.15 + i * 0.25, 0.25)
        faixa(d, y, 150, 6, VERMELHO, p, de_esquerda=i % 2 == 0)
        if p > 0.6:
            texto(c, (W / 2, y), palavra, CONDENSADA, 160, CREME, angulo=6)
    carimbar(c, (W / 2, 1640), "E O RESTO?", BLOCO, 84, CREME, lt, 1.0, angulo=6)


@plano(10.9, 12.6, PRETO, [(0, "caixa", 0.7)] + [(t, "caixa", 0.45) for t in (0.15, 0.35, 0.55, 0.75)]
       + [(1.05, "carimbo", 1.0), (1.05, *metal(155.6))])
def p_adiados(d, c, lt):
    for i, palavra in enumerate(("FAMÍLIA", "ESTUDO", "SAÚDE", "LAZER")):
        deslizar(c, (W / 2 - 120 + i * 80, 560 + i * 230), palavra, CONDENSADA, 230, MOSTARDA,
                 lt, 0.15 + i * 0.2, angulo=12, de=(-1100, 0))
    p = (lt - 1.05) / 0.18
    if p > 0:
        escala = 1 + 0.8 * (1 - ease(p))
        caixa_txt = "ADIADOS"
        f = fonte(BLOCO, 150 * escala)
        larg = f.getlength(caixa_txt)
        selo = Image.new("RGBA", (int(larg + 80), int(240 * escala)), (0, 0, 0, 0))
        ds = ImageDraw.Draw(selo)
        ds.rectangle([6, 6, selo.width - 6, selo.height - 6], outline=VERMELHO + (255,), width=int(14 * escala))
        ds.text((selo.width / 2, selo.height / 2), caixa_txt, font=f, fill=VERMELHO + (255,), anchor="mm")
        selo = selo.rotate(-14, Image.BICUBIC, expand=True)
        c.alpha_composite(selo, (int(W / 2 - selo.width / 2), int(960 - selo.height / 2)))


@plano(12.6, 14.6, MOSTARDA, [(0, "caixa", 0.7), (0.1, "whoosh", 0.4)]
       + [(t, "carimbo", 0.6) for t in (0.5, 0.8, 1.1)] + [(1.4, "risco", 1.4), (1.4, *metal(233))])
def p_debate(d, c, lt):
    bandeira(d, c, 100, 150, 960, 520, lt, simbolo=False)
    deslizar(c, (W / 2 + 50, 340), "EM DEBATE", CONDENSADA, 200, CREME, lt, 0.05, de=(1000, 0))
    deslizar(c, (W / 2 + 50, 500), "NO CONGRESSO", BLOCO, 84, MOSTARDA, lt, 0.2, de=(1000, 0))
    for i, (rotulo, cor) in enumerate((("6x1", PRETO), ("5x2", VERMELHO), ("4x3", VERMELHO))):
        x = 200 + i * 340
        if lt < 0.5 + i * 0.3:
            continue
        p = back((lt - 0.5 - i * 0.3) / 0.2)
        r = 135 * p
        d.ellipse([x - r, 1180 - r, x + r, 1180 + r], fill=cor)
        texto(c, (x, 1180), rotulo, BLOCO, 100 * max(0.01, p), CREME if i else MOSTARDA)
    q = prog(lt, 1.4, 0.2)
    if q > 0:
        d.line([(80, 1060), (80 + 240 * q, 1060 + 240 * q)], fill=VERMELHO, width=26)
        d.line([(320, 1060), (320 - 240 * q, 1060 + 240 * q)], fill=VERMELHO, width=26)
    if lt > 1.5:
        texto(c, (W / 2, 1520), "MENOS DIAS, MAIS VIDA", CONDENSADA, 120, PRETO, alpha=prog(lt, 1.5, 0.2))


@plano(14.6, 16.6, VERMELHO, [(0, "caixa", 0.7), (0.05, *metal(196)), (0.6, *metal(261.6)),
                              (0.9, "carimbo", 1.0)])
def p_direito(d, c, lt):
    raios(d, (W / 2, 1150), VERMELHO_ESC, lt * 14)
    p = back(lt / 0.5)
    punho(d, W / 2, 1920 + (1 - p) * 900, 1.35, cor=PRETO, luz=VERMELHO)
    deslizar(c, (W / 2, 330), "TEMPO LIVRE", CONDENSADA, 250, MOSTARDA, lt, 0.3, angulo=-5, de=(-1000, 0))
    carimbar(c, (W / 2, 560), "É DIREITO!", BLOCO, 130, CREME, lt, 0.9, angulo=-5)


@plano(16.6, 18.3, CREME, [(0, "caixa", 0.7), (0.15, "carimbo", 0.6), (0.55, "carimbo", 0.6)])
def p_vida(d, c, lt):
    faixa(d, 760, 280, -8, VERMELHO, prog(lt, 0, 0.25))
    faixa(d, 1100, 220, -8, PRETO, prog(lt, 0.4, 0.25), de_esquerda=False)
    for i, x in enumerate((180, 540, 900)):
        estrela(d, (x, 1420), 70 * back((lt - 0.8 - i * 0.12) / 0.2) if lt > 0.8 + i * 0.12 else 0,
                VERMELHO)
    if lt > 0.15:
        texto(c, (W / 2, 760), "POR UMA VIDA", CONDENSADA, 220, CREME, angulo=-8)
    if lt > 0.55:
        texto(c, (W / 2, 1100), "ALÉM DO TRABALHO", BLOCO, 96, MOSTARDA, angulo=-8)


@plano(18.3, 20.0, VERMELHO, [(0, "caixa", 0.8), (0.1, *metal(196)), (0.5, "impacto", 0.8),
                              (0.5, *metal(261.6)), (0.5, lambda: sfx.sino(784, 1.4, 0.4), 1.0)])
def p_final(d, c, lt):
    raios(d, (W / 2, 960), VERMELHO_ESC, lt * 16)
    for k, (x, y) in enumerate(((160, 300), (920, 380), (190, 1650), (900, 1580))):
        estrela(d, (x, y), 60 * prog(lt, 0.6 + k * 0.08, 0.2), MOSTARDA, -90 + lt * 30)
    carimbar(c, (W / 2, 820), "E VOCÊ,", CONDENSADA, 260, CREME, lt, 0.1)
    carimbar(c, (W / 2, 1080), "O QUE ACHA?", CONDENSADA, 230, MOSTARDA, lt, 0.5)


# ---------------------------------------------------------------- render

def quadro(n):
    t = n / FPS
    for inicio, fim, cor_fundo, func, _ in PLANOS:
        if inicio <= t < fim:
            break
    lt, dur = t - inicio, fim - inicio
    img = Image.new("RGBA", (W, H), cor_fundo + (255,))
    func(ImageDraw.Draw(img, "RGBA"), img, lt)
    img = img.convert("RGB")

    # zoom lento e leve tremida, como câmera sobre cartaz impresso
    z = 1.01 + 0.035 * lt / dur
    cw, ch = W / z, H / z
    x0 = (W - cw) / 2 + rng.uniform(-2, 2)
    y0 = (H - ch) / 2 + rng.uniform(-2, 2)
    img = img.resize((W, H), Image.BILINEAR, box=(x0, y0, x0 + cw, y0 + ch))

    arr = np.asarray(img, np.float32)
    # registro de impressão desalinhado: canal vermelho deslocado 3px
    arr[:, 3:, 0] = arr[:, :-3, 0]
    arr = arr * VINHETA + PAPEL + GRAOS[n % len(GRAOS)]
    if t > DURACAO - 0.4:
        arr *= (DURACAO - t) / 0.4
    return arr.clip(0, 255).astype(np.uint8)


def main():
    audio = SAIDA.with_suffix(".wav")
    eventos = [(inicio + t, som, vol) for inicio, _, _, _, sons in PLANOS for t, som, vol in sons]
    sfx.mixar(audio, DURACAO, eventos, fundo=sfx.marcha)
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
