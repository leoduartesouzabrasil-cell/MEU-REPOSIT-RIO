# prévia do enquadramento: janela quadrada (cx, cy, lado) em fração da ALTURA da foto, recortada em círculo
import sys, json
from PIL import Image, ImageDraw, ImageFont
P = json.loads(open(sys.argv[1]).read())
F = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 16)
s = Image.new('RGB', (5 * 250, 3 * 280), (237, 224, 196)); d = ImageDraw.Draw(s)
for k, (nome, f, (cx, cy, lado)) in enumerate(P):
    im = Image.open(f).convert('RGB'); w, h = im.size; L = lado * h
    box = (cx * w - L / 2, cy * h - L / 2, cx * w + L / 2, cy * h + L / 2)
    c = im.crop(tuple(int(v) for v in box)).resize((236, 236))
    m = Image.new('L', (236, 236), 0); ImageDraw.Draw(m).ellipse((0, 0, 235, 235), fill=255)
    x, y = (k % 5) * 250 + 7, (k // 5) * 280 + 5
    s.paste(c, (x, y), m); d.text((x, y + 240), f"{nome} ", font=F, fill=(28, 23, 20))
s.save(sys.argv[2])
