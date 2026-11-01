"""Transforma uma foto recortada (PNG com fundo transparente) em ilustração de cartaz soviético.

Uso: python3 motor/ilustrar.py <recorte.png> <saida.png> [--luz direita|esquerda] [--estatua] [--corte x0,y0,x1,y1]
Requer: pip install opencv-python-headless numpy pillow

Etapas (ver identidade/IDENTIDADE.md, seção "Capas"):
1. pintura: suaviza a foto preservando bordas (vira pinceladas largas);
2. paleta de cartaz: tons chapados de cinza quente (como o casaco do Lênin), pele em ocre,
   vermelhos e amarelos da foto levados ao vermelho/amarelo da identidade;
3. contorno de tinta nas linhas fortes e em volta da silhueta;
4. luz vermelha lateral (contraluz da bandeira), como no cartaz de referência ref-04.
"""
import sys

import cv2
import numpy as np

TINTA = np.array([28, 23, 20]) / 255
VERMELHO = np.array([200, 32, 30]) / 255
VERM_ESC = np.array([138, 20, 17]) / 255
AMARELO = np.array([235, 181, 42]) / 255
OCRE = np.array([176, 118, 40]) / 255
# rampa de cinzas quentes (sombra → luz), estilo guache dos cartaz soviéticos
RAMPA = np.array([[28, 23, 20], [62, 50, 43], [101, 86, 74], [146, 128, 108], [196, 178, 150], [237, 224, 196]]) / 255
# pele: rampa ocre/terracota
PELE = np.array([[40, 24, 18], [92, 52, 34], [146, 90, 58], [196, 140, 98], [232, 196, 156]]) / 255


def rampa(lum, cores, suave=0.08):
    """Quantiza a luminância nos degraus da rampa, com transição curta entre eles."""
    n = len(cores)
    x = np.clip(lum, 0, 1) * (n - 1)
    i = np.floor(x).astype(int).clip(0, n - 2)
    f = x - i
    f = np.clip((f - 0.5) / suave + 0.5, 0, 1)            # degrau quase chapado
    return cores[i] * (1 - f[..., None]) + cores[i + 1] * f[..., None]


def ilustrar(caminho, saida, luz="direita", estatua=False, corte=None):
    rgba = cv2.imread(caminho, cv2.IMREAD_UNCHANGED)
    if corte:                                                 # recorte "x0,y0,x1,y1" em fração da imagem
        x0, y0, x1, y1 = corte
        h, w = rgba.shape[:2]
        rgba = rgba[int(y0 * h):int(y1 * h), int(x0 * w):int(x1 * w)]
    rgba = cv2.resize(rgba, None, fx=2, fy=2, interpolation=cv2.INTER_CUBIC)
    alfa = rgba[..., 3].astype(np.float32) / 255
    bgr = rgba[..., :3]

    # 1. pintura (estátuas envernizadas: mediana antes, para apagar os reflexos de brilho)
    pint = cv2.medianBlur(bgr, 9) if estatua else bgr
    for _ in range(5 if estatua else 3):
        pint = cv2.bilateralFilter(pint, 11, 40, 9)
    pint = cv2.stylization(pint, sigma_s=40, sigma_r=0.35)
    rgb = cv2.cvtColor(pint, cv2.COLOR_BGR2RGB).astype(np.float32) / 255
    hsv = cv2.cvtColor(pint, cv2.COLOR_BGR2HSV).astype(np.float32)
    mat, sat, val = hsv[..., 0] * 2, hsv[..., 1] / 255, hsv[..., 2] / 255
    lum = (0.3 * rgb[..., 0] + 0.59 * rgb[..., 1] + 0.11 * rgb[..., 2])
    if estatua:                                               # contraste esticado pela própria figura
        lo, hi = np.percentile(lum[alfa > 0.5], [4, 97])
        lum = np.clip((lum - lo) / max(hi - lo, 1e-3), 0, 1) ** 0.75
    else:
        lum = np.clip((lum - 0.08) / 0.85, 0, 1) ** 0.9       # mais contraste, como guache

    # 2. paleta de cartaz
    out = rampa(lum, RAMPA)
    pele = (sat > 0.18) & (sat < 0.65) & ((mat < 35) | (mat > 340)) & (val > 0.25)
    if estatua:                       # gesso pintado: o marrom escuro também é pele
        pele = (sat > 0.12) & ((mat < 40) | (mat > 340)) & (val > 0.06) & ~((sat > 0.45) & ((mat < 14) | (mat > 335)) & (val > 0.35))
    vermelho = (sat > 0.45) & ((mat < 14) | (mat > 335)) & (val > 0.25)
    amarelo = (sat > 0.45) & (mat >= 35) & (mat < 65) & (val > 0.35)
    out[pele] = rampa(lum, PELE)[pele]
    out[vermelho] = np.where(lum[vermelho, None] > 0.35, VERMELHO, VERM_ESC)
    out[amarelo] = np.where(lum[amarelo, None] > 0.5, AMARELO, OCRE)

    # 3. contorno de tinta: bordas fortes da imagem pintada
    cinza = cv2.cvtColor(pint, cv2.COLOR_BGR2GRAY)
    bordas = cv2.Canny(cv2.GaussianBlur(cinza, (5, 5), 0), *((80, 170) if estatua else (40, 110)))
    bordas = cv2.dilate(bordas, np.ones((2, 2), np.uint8)).astype(np.float32) / 255
    bordas = cv2.GaussianBlur(bordas, (3, 3), 0) * 0.85
    out = out * (1 - bordas[..., None]) + TINTA * bordas[..., None]

    # 4. luz vermelha lateral: faixa junto à borda da silhueta do lado da luz
    k = 34
    deslocado = np.roll(alfa, -k if luz == "direita" else k, axis=1)
    borda_luz = np.clip(alfa - deslocado, 0, 1)
    borda_luz = cv2.GaussianBlur(borda_luz, (0, 0), 9) * alfa
    borda_luz = np.clip(borda_luz * 2.2, 0, 1) * np.clip(lum * 1.4, 0.35, 1)
    out = out * (1 - borda_luz[..., None]) + VERMELHO * borda_luz[..., None]

    # contorno escuro em volta da silhueta
    a8 = (alfa > 0.5).astype(np.uint8)
    contorno = cv2.dilate(a8, np.ones((9, 9), np.uint8)).astype(np.float32)
    contorno = cv2.GaussianBlur(contorno, (3, 3), 0)
    final = out * alfa[..., None] + TINTA * (1 - alfa[..., None])
    alfa_final = np.maximum(alfa, contorno)

    # textura de pincel/papel
    ruido = cv2.GaussianBlur(np.random.default_rng(3).standard_normal(alfa.shape).astype(np.float32), (0, 0), 1.2)
    final = np.clip(final * (1 + 0.05 * ruido[..., None]), 0, 1)

    img = np.dstack([final, alfa_final]) * 255
    cv2.imwrite(saida, cv2.cvtColor(img.astype(np.uint8), cv2.COLOR_RGBA2BGRA))
    print(saida, img.shape[1], "x", img.shape[0])


if __name__ == "__main__":
    a = sys.argv[1:]
    corte = tuple(map(float, a[a.index("--corte") + 1].split(","))) if "--corte" in a else None
    ilustrar(a[0], a[1], a[a.index("--luz") + 1] if "--luz" in a else "direita", "--estatua" in a, corte)
