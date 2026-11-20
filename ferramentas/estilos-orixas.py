import sys, math, cv2, numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
R = '/home/user/serie-comunismo'; OUT = R + '/midia/tutorial-04/estilos'; F = '/mnt/skills/examples/canvas-fonts/'
F = '/mnt/skills/examples/canvas-design/canvas-fonts/'
W, H = 1920, 1080
rng = np.random.default_rng(11)
base = Image.open(R + '/saida/orixas.png').convert('RGBA')
def recorte(box):
    c = np.array(base.crop(box)); m = (c[:, :, 3] > 10).astype(np.uint8)
    n, lab, st, _ = cv2.connectedComponentsWithStats(m, 8)
    for i in range(1, n):
        if st[i, cv2.CC_STAT_AREA] < 400: c[lab == i, 3] = 0   # tira pontinhos soltos
    c = Image.fromarray(c); return c.crop(c.getbbox())
FIGS = [recorte((0, 0, 1400, 2000)), recorte((1400, 0, 2800, 2000))]
def escala(im, alt):
    return im.resize((int(im.width * alt / im.height), alt), Image.LANCZOS)
def arr(im): return np.array(im).astype(np.float32)
def fonte(nome, tam): return ImageFont.truetype(F + nome, tam)
def rotulo(img, txt1, txt2, cor, fonte1, fonte2, cor2=None):
    d = ImageDraw.Draw(img)
    f1 = fonte(fonte1, 34); f2 = fonte(fonte2, 18)
    d.text((W // 2, 48), txt1, font=f1, fill=cor, anchor='mm')
    d.text((W // 2, H - 34), txt2, font=f2, fill=cor2 or cor, anchor='mm')
    for x, nome in [(470, 'OXALUFÃ'), (1450, 'OXAGUIÃ')]:
        d.text((x, H - 80), nome, font=fonte(fonte1, 30), fill=cor, anchor='mm')
def colar(fundo, fig, cx, base_y):
    fundo.alpha_composite(fig, (int(cx - fig.width / 2), int(base_y - fig.height)))
def papel(cor, forca=0.05, sig=1.0):
    a = np.ones((H, W, 3), np.float32) * np.array(cor, np.float32)
    n = cv2.GaussianBlur(rng.normal(0, 1, (H, W)).astype(np.float32), (0, 0), sig)
    f = cv2.GaussianBlur(rng.normal(0, 1, (H, W)).astype(np.float32), (0, 0), 18)
    a *= (1 + forca * n + forca * 1.2 * f)[:, :, None]
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)).convert('RGBA')
def figs(alt):
    return [escala(FIGS[0], alt), escala(FIGS[1], int(alt * 0.98))]
def lum(im):
    a = arr(im); return 0.299 * a[:, :, 0] + 0.587 * a[:, :, 1] + 0.114 * a[:, :, 2], a[:, :, 3]
def rgba(rgb, alpha): return Image.fromarray(np.dstack([np.clip(rgb, 0, 255), alpha]).astype(np.uint8))

# ---------------- 1. Xilogravura de cordel
def xilo(fig):
    g, a = lum(fig); h, w = g.shape
    yy, xx = np.mgrid[0:h, 0:w]
    lin1 = ((xx + yy) % 7) < 3; lin2 = ((xx - yy) % 7) < 3; hor = (yy % 6) < 2
    ink = np.zeros((h, w), bool)
    ink |= g < 95                                   # chapado preto (pele, contornos)
    ink |= (g >= 95) & (g < 175) & lin1             # meio-tom: hachura
    ink |= (g >= 175) & (g < 225) & lin1 & lin2     # luz baixa: hachura cruzada fina
    ink &= ~(((g < 95) & hor & ((xx // 3) % 9 == 0)))  # goiva: tira finas na pele
    ed = cv2.Canny(g.astype(np.uint8), 40, 120) > 0; ed = cv2.dilate(ed.astype(np.uint8), np.ones((2, 2))) > 0
    ink |= ed
    sil = cv2.dilate((a > 40).astype(np.uint8), cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (9, 9))) > 0
    contorno = sil & ~(cv2.erode((a > 40).astype(np.uint8), np.ones((3, 3))) > 0)
    rgb = np.ones((h, w, 3)) * np.array([238, 228, 205]); rgb[ink | contorno] = (24, 20, 18)
    return rgba(rgb, np.where(sil, 255, 0))
def op_xilo():
    bg = papel((238, 228, 205), 0.06); d = ImageDraw.Draw(bg)
    for k in range(48):   # sol entalhado
        ang = math.pi + k * math.pi / 47; x2 = 960 + math.cos(ang) * 1400; y2 = 1000 + math.sin(ang) * 1400
        if k % 2 == 0: d.polygon([(960, 1000), (x2, y2), (960 + math.cos(ang + 0.03) * 1400, 1000 + math.sin(ang + 0.03) * 1400)], fill=(24, 20, 18, 255))
    d.rectangle((0, 900, W, H), fill=(238, 228, 205, 255))
    for x in range(0, W, 26): d.polygon([(x, 900), (x + 13, 880), (x + 26, 900)], fill=(24, 20, 18, 255))
    for x in range(0, W, 26): d.polygon([(x, 0), (x + 13, 22), (x + 26, 0)], fill=(24, 20, 18, 255)); d.polygon([(x, H), (x + 13, H - 22), (x + 26, H)], fill=(24, 20, 18, 255))
    d.rectangle((560, 22, 1360, 78), fill=(238, 228, 205, 255))
    a, b = figs(840); colar(bg, xilo(a), 470, 930); colar(bg, xilo(b), 1450, 930)
    d = ImageDraw.Draw(bg); d.rectangle((300, H - 104, 640, H - 56), fill=(238, 228, 205, 255)); d.rectangle((1280, H - 104, 1620, H - 56), fill=(238, 228, 205, 255))
    rotulo(bg, 'XILOGRAVURA DE CORDEL', 'opção 1', (24, 20, 18), 'EricaOne-Regular.ttf', 'IBMPlexMono-Regular.ttf')
    return bg

# ---------------- 2. Cartaz construtivista tropical
PAL = np.array([[251, 249, 244], [214, 209, 198], [160, 168, 178], [90, 54, 34], [28, 23, 20], [46, 127, 184], [142, 197, 234], [122, 75, 48]], np.float32)
def construt(fig, ponto=(200, 32, 30)):
    a = arr(fig); rgb = a[:, :, :3]; al = a[:, :, 3]
    d = ((rgb[:, :, None, :] - PAL[None, None]) ** 2).sum(-1); q = PAL[d.argmin(-1)]
    g = 0.299 * rgb[:, :, 0] + 0.587 * rgb[:, :, 1] + 0.114 * rgb[:, :, 2]
    h, w = g.shape; yy, xx = np.mgrid[0:h, 0:w]
    cel = 9; cx = (xx % cel) - cel / 2; cy = (yy % cel) - cel / 2
    raio = np.clip((235 - g) / 90, 0, 1) * cel * 0.45
    dots = (cx ** 2 + cy ** 2 < raio ** 2) & (g > 150) & (g < 235)
    q[dots] = ponto
    return rgba(q, np.where(al > 40, 255, 0))
def op_construt():
    bg = papel((200, 32, 30), 0.03); d = ImageDraw.Draw(bg)
    for k in range(26):
        ang = math.pi + k * math.pi / 25
        if k % 2: d.polygon([(960, 1150), (960 + math.cos(ang) * 1700, 1150 + math.sin(ang) * 1700), (960 + math.cos(ang + 0.06) * 1700, 1150 + math.sin(ang + 0.06) * 1700)], fill=(222, 70, 55, 255))
    d.ellipse((560, 750, 1360, 1550), fill=(235, 181, 42, 255))
    d.polygon([(0, 960), (W, 860), (W, H), (0, H)], fill=(28, 23, 20, 255))
    a, b = figs(860); colar(bg, construt(a), 470, 960); colar(bg, construt(b, (31, 58, 95)), 1450, 950)
    rotulo(bg, 'CARTAZ CONSTRUTIVISTA TROPICAL', 'opção 2', (237, 224, 196), 'BigShoulders-Bold.ttf', 'IBMPlexMono-Regular.ttf')
    return bg

# ---------------- 3. Aquarela
def aquarela(fig):
    a = arr(fig); rgb = a[:, :, :3].astype(np.uint8); al = a[:, :, 3]
    s = cv2.bilateralFilter(rgb, 15, 60, 15)
    s = cv2.pyrMeanShiftFiltering(s, 8, 24).astype(np.float32)
    m = (al > 40).astype(np.uint8)
    borda = (m - cv2.erode(m, np.ones((15, 15)))).astype(np.float32)
    borda = cv2.GaussianBlur(borda, (0, 0), 4)
    s *= (1 - 0.18 * borda[:, :, None])
    gran = cv2.GaussianBlur(rng.normal(0, 1, al.shape).astype(np.float32), (0, 0), 1.5)
    s *= (1 + 0.05 * gran[:, :, None])
    g = cv2.cvtColor(rgb, cv2.COLOR_RGB2GRAY); ed = cv2.Canny(g, 50, 140)
    ed = cv2.GaussianBlur(ed.astype(np.float32), (0, 0), 0.8) / 255
    s = s * (1 - 0.45 * ed[:, :, None]) + np.array([90, 60, 40]) * 0.45 * ed[:, :, None]
    am = cv2.GaussianBlur(m.astype(np.float32) * 255, (0, 0), 1.2)
    return rgba(s, am * 0.96)
def op_aquarela():
    bg = papel((246, 240, 228), 0.04)
    camada = np.zeros((H, W, 4), np.float32)
    for cor, n, y0, y1 in [((140, 190, 225), 9, 0, 520), ((235, 205, 140), 7, 380, 760), ((150, 175, 140), 6, 760, 1080)]:
        for i in range(n):
            x = rng.uniform(0, W); y = rng.uniform(y0, y1); r = rng.uniform(160, 380)
            blob = np.zeros((H, W), np.float32); cv2.circle(blob, (int(x), int(y)), int(r), 1, -1)
            blob = cv2.GaussianBlur(blob, (0, 0), r * 0.35) * rng.uniform(0.25, 0.45)
            camada[:, :, :3] = camada[:, :, :3] * (1 - blob[:, :, None]) + np.array(cor) * blob[:, :, None]
            camada[:, :, 3] = np.maximum(camada[:, :, 3], blob * 255)
    bga = arr(bg); al = camada[:, :, 3:4] / 255
    bga[:, :, :3] = bga[:, :, :3] * (1 - al) + camada[:, :, :3] / np.maximum(al, 1e-3) * al * 0.95 + bga[:, :, :3] * al * 0.05
    bg = Image.fromarray(np.clip(bga, 0, 255).astype(np.uint8))
    a, b = figs(850); colar(bg, aquarela(a), 470, 960); colar(bg, aquarela(b), 1450, 955)
    rotulo(bg, 'Aquarela de Terreiro', 'opção 3', (70, 60, 52), 'Italiana-Regular.ttf', 'IBMPlexMono-Regular.ttf')
    return bg

# ---------------- 4. Vitral
def voronoi(n, seed=3):
    r = np.random.default_rng(seed); pts = np.full((H, W), 255, np.uint8)
    P = np.c_[r.uniform(0, W, n), r.uniform(0, H, n)].astype(int)
    for x, y in P: pts[min(y, H - 1), min(x, W - 1)] = 0
    _, lab = cv2.distanceTransformWithLabels(pts, cv2.DIST_L2, 5, labelType=cv2.DIST_LABEL_PIXEL)
    return lab, P
def vitral(fig):
    a = arr(fig); rgb = a[:, :, :3].astype(np.uint8); al = a[:, :, 3]
    s = cv2.pyrMeanShiftFiltering(rgb, 14, 40)
    hsv = cv2.cvtColor(s, cv2.COLOR_RGB2HSV).astype(np.float32); hsv[:, :, 1] = np.clip(hsv[:, :, 1] * 1.5, 0, 255); hsv[:, :, 2] = np.clip(hsv[:, :, 2] * 1.05 + 8, 0, 255)
    s = cv2.cvtColor(hsv.astype(np.uint8), cv2.COLOR_HSV2RGB).astype(np.float32)
    g = cv2.cvtColor(s.astype(np.uint8), cv2.COLOR_RGB2GRAY); ed = cv2.Canny(g, 30, 90)
    ed = cv2.dilate(ed, np.ones((3, 3))) > 0
    m = (al > 40).astype(np.uint8); sil = cv2.dilate(m, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (11, 11)))
    s[ed] = (30, 28, 32); s[(sil > 0) & (m == 0)] = (30, 28, 32)
    return rgba(s, np.where(sil > 0, 255, 0))
def op_vitral():
    lab, P = voronoi(340); cores = np.random.default_rng(5)
    yy, xx = np.mgrid[0:H, 0:W]; dist = np.hypot(xx - 960, yy - 1020)
    pal_q = np.array([[235, 181, 42], [244, 205, 90], [214, 120, 40]]); pal_f = np.array([[31, 58, 95], [46, 127, 184], [90, 150, 200], [20, 40, 70]])
    lut = {}
    rgb = np.zeros((H, W, 3), np.float32)
    ids = np.unique(lab)
    for i in ids:
        x, y = P[i - 1] if i - 1 < len(P) else (0, 0)
        perto = np.hypot(x - 960, y - 1020) < 420
        c = (pal_q if perto else pal_f)[cores.integers(0, 3)] * cores.uniform(0.85, 1.1)
        lut[i] = c
    look = np.zeros((lab.max() + 1, 3), np.float32)
    for i, c in lut.items(): look[i] = c
    rgb = look[lab]
    ed = cv2.Canny(lab.astype(np.uint16).astype(np.uint8), 1, 1) > 0
    ed = cv2.dilate(ed.astype(np.uint8), np.ones((4, 4))) > 0; rgb[ed] = (30, 28, 32)
    vid = cv2.GaussianBlur(rng.normal(0, 1, (H, W)).astype(np.float32), (0, 0), 3)
    rgb *= (1 + 0.08 * vid)[:, :, None]
    bg = Image.fromarray(np.dstack([np.clip(rgb, 0, 255), np.full((H, W), 255)]).astype(np.uint8))
    a, b = figs(860); colar(bg, vitral(a), 470, 965); colar(bg, vitral(b), 1450, 960)
    d = ImageDraw.Draw(bg); d.rectangle((0, 0, W, 90), fill=(30, 28, 32, 255)); d.rectangle((0, H - 120, W, H), fill=(30, 28, 32, 255))
    rotulo(bg, 'VITRAL', 'opção 4', (235, 225, 200), 'Gloock-Regular.ttf', 'IBMPlexMono-Regular.ttf')
    return bg

# ---------------- 5. Papel recortado
def recortado(fig, k=7):
    a = arr(fig); rgb = a[:, :, :3]; al = a[:, :, 3]; m = al > 40
    Z = rgb[m].astype(np.float32); crit = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 20, 1.0)
    _, lb, cen = cv2.kmeans(Z, k, None, crit, 3, cv2.KMEANS_PP_CENTERS)
    q = np.zeros_like(rgb); q[m] = cen[lb.ravel()]
    q = cv2.medianBlur(q.astype(np.uint8), 5).astype(np.float32)
    sil = Image.fromarray(np.where(m, 255, 0).astype(np.uint8))
    out = Image.new('RGBA', fig.size, (0, 0, 0, 0))
    sombra = Image.new('RGBA', fig.size, (28, 23, 20, 0)); sombra.putalpha(sil.filter(ImageFilter.GaussianBlur(7)).point(lambda v: int(v * 0.55)))
    out.alpha_composite(sombra, (0, 0))
    papelz = rgba(q, np.where(m, 255, 0)); out.alpha_composite(papelz, (0, 0))
    g = cv2.cvtColor(q.astype(np.uint8), cv2.COLOR_RGB2GRAY); ed = cv2.Canny(g, 10, 30) > 0
    sh = np.zeros((*g.shape, 4), np.uint8); sh[ed] = (28, 23, 20, 90)
    out.alpha_composite(Image.fromarray(sh), (0, 0))
    return out
def op_recortado():
    bg = papel((237, 224, 196), 0.03)
    camadas = [((235, 181, 42), lambda d: d.ellipse((610, 160, 1310, 860))), ((200, 32, 30), lambda d: d.polygon([(0, 760), (420, 600), (900, 720), (1400, 560), (W, 700), (W, H), (0, H)])),
               ((138, 20, 17), lambda d: d.polygon([(0, 880), (500, 790), (1100, 870), (1600, 780), (W, 850), (W, H), (0, H)])), ((31, 58, 95), lambda d: d.polygon([(0, 980), (700, 930), (1300, 990), (W, 940), (W, H), (0, H)]))]
    for cor, fn in camadas:
        m = Image.new('L', (W, H), 0); fn(ImageDraw.Draw(m))
        s = Image.new('RGBA', (W, H), (28, 23, 20, 0)); s.putalpha(m.filter(ImageFilter.GaussianBlur(9)).point(lambda v: int(v * 0.5)))
        bg.alpha_composite(s, (8, 10)); c = Image.new('RGBA', (W, H), cor + (0,)); c.putalpha(m); bg.alpha_composite(c)
    a, b = figs(840); colar(bg, recortado(a), 470, 960); colar(bg, recortado(b), 1450, 955)
    rotulo(bg, 'PAPEL RECORTADO', 'opção 5', (28, 23, 20), 'Boldonse-Regular.ttf', 'IBMPlexMono-Regular.ttf', (237, 224, 196))
    return bg

# ---------------- 6. Bico de pena (pontilhismo sépia)
def pena(fig):
    g, a = lum(fig); h, w = g.shape; m = a > 40
    out = np.ones((h, w, 3)) * np.array([244, 236, 218])
    prob = np.clip((235 - g) / 235, 0, 1) ** 1.3 * 0.55
    dots = (rng.uniform(0, 1, (h, w)) < prob) & m
    out[dots] = (70, 45, 28)
    ed = cv2.Canny(g.astype(np.uint8), 40, 110) > 0; out[ed & m] = (60, 38, 22)
    contorno = (cv2.dilate(m.astype(np.uint8), np.ones((5, 5))) > 0) & ~(cv2.erode(m.astype(np.uint8), np.ones((3, 3))) > 0); out[contorno] = (60, 38, 22)
    return rgba(out, np.where(cv2.dilate(m.astype(np.uint8), np.ones((5, 5))) > 0, 255, 0))
def op_pena():
    bg = papel((244, 236, 218), 0.04)
    a2 = arr(bg); yy, xx = np.mgrid[0:H, 0:W]; dist = np.hypot(xx - 960, yy - 1150)
    prob = np.clip(1 - np.abs(dist - 700) / 260, 0, 1) * 0.12 * (yy < 1000)
    dots = rng.uniform(0, 1, (H, W)) < prob; a2[dots, :3] = (110, 75, 45)
    bg = Image.fromarray(a2.astype(np.uint8))
    d = ImageDraw.Draw(bg); d.rectangle((60, 60, W - 60, H - 60), outline=(70, 45, 28, 255), width=2); d.rectangle((72, 72, W - 72, H - 72), outline=(70, 45, 28, 255), width=1)
    a, b = figs(840); colar(bg, pena(a), 470, 955); colar(bg, pena(b), 1450, 950)
    rotulo(bg, 'Bico de Pena', 'opção 6', (70, 45, 28), 'LibreBaskerville-Regular.ttf', 'IBMPlexMono-Regular.ttf')
    return bg

# ---------------- 7. Pintura popular (tinta grossa)
def pincelada(fig):
    a = arr(fig); rgb = a[:, :, :3].astype(np.uint8); al = a[:, :, 3]
    s = cv2.pyrMeanShiftFiltering(rgb, 6, 30)
    s = cv2.stylization(s, sigma_s=30, sigma_r=0.3).astype(np.float32)
    hsv = cv2.cvtColor(s.astype(np.uint8), cv2.COLOR_RGB2HSV).astype(np.float32); hsv[:, :, 1] = np.clip(hsv[:, :, 1] * 1.4, 0, 255)
    s = cv2.cvtColor(hsv.astype(np.uint8), cv2.COLOR_HSV2RGB).astype(np.float32)
    h, w = al.shape; n = rng.normal(0, 1, (h, w)).astype(np.float32)
    k = np.zeros((15, 15), np.float32); cv2.line(k, (0, 3), (14, 11), 1, 1); k /= k.sum()
    tr = cv2.filter2D(n, -1, k); s *= (1 + 0.09 * tr[:, :, None])
    return rgba(s, np.where(al > 40, 255, 0))
def op_pintura():
    yy, xx = np.mgrid[0:H, 0:W]
    ceu = np.dstack([90 + 60 * yy / H, 150 + 50 * yy / H, 215 - 20 * yy / H]).astype(np.float32)
    chao = np.array([196, 70, 38], np.float32)
    rgb = np.where((yy > 780 + 40 * np.sin(xx / 180))[:, :, None], chao * (0.9 + 0.1 * np.sin(xx / 40))[:, :, None], ceu)
    verde = (yy > 700 + 30 * np.sin(xx / 120)) & (yy < 800 + 40 * np.sin(xx / 180)); rgb[verde] = (60, 140, 80)
    n = rng.normal(0, 1, (H, W)).astype(np.float32); k = np.zeros((21, 21), np.float32); cv2.line(k, (0, 8), (20, 12), 1, 2); k /= k.sum()
    rgb *= (1 + 0.12 * cv2.filter2D(n, -1, k))[:, :, None]
    bg = Image.fromarray(np.dstack([np.clip(rgb, 0, 255), np.full((H, W), 255)]).astype(np.uint8))
    d = ImageDraw.Draw(bg)
    for i in range(40):   # flores
        x = rng.uniform(40, W - 40); y = rng.uniform(820, 1040); c = [(250, 250, 245), (240, 190, 60), (230, 120, 150)][i % 3]
        for k2 in range(5): a2 = k2 * 1.256; d.ellipse((x + math.cos(a2) * 9 - 7, y + math.sin(a2) * 9 - 7, x + math.cos(a2) * 9 + 7, y + math.sin(a2) * 9 + 7), fill=c + (255,))
        d.ellipse((x - 4, y - 4, x + 4, y + 4), fill=(235, 181, 42, 255))
    a, b = figs(860); colar(bg, pincelada(a), 470, 965); colar(bg, pincelada(b), 1450, 960)
    rotulo(bg, 'PINTURA POPULAR', 'opção 7', (250, 246, 236), 'YoungSerif-Regular.ttf', 'IBMPlexMono-Regular.ttf')
    return bg

opc = [('1-xilogravura-cordel', op_xilo), ('2-cartaz-construtivista', op_construt), ('3-aquarela', op_aquarela), ('4-vitral', op_vitral),
       ('5-papel-recortado', op_recortado), ('6-bico-de-pena', op_pena), ('7-pintura-popular', op_pintura)]
so = sys.argv[1:] 
for nome, fn in opc:
    if so and not any(nome.startswith(x) for x in so): continue
    im = fn().convert('RGB'); im.save(f'{OUT}/{nome}.png'); print('ok', nome, flush=True)
