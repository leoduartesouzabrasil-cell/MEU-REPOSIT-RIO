"""Corta a narração (gravação 58, já tratada) deixando só a fala: silêncios e respiros saem, pausas viram respiros curtos
de acordo com a pontuação. Edita sempre em vales de energia, com micro-crossfade (nunca no meio de palavra).
Saída: audio/voz.wav (48 kHz) e audio/palavras.json (palavras no tempo novo, já corrigidas)."""
import json, subprocess, numpy as np, soundfile as sf
from pathlib import Path
AQUI = Path(__file__).resolve().parent; REPO = AQUI.parents[2]; SRC = REPO / "audio/6x1-brecha"
SR, VEL = 48000, 1.12
PAUSA = {",": 0.13, ":": 0.16, ".": 0.24, "?": 0.26, "!": 0.24, "": 0.07}   # respiro que fica, conforme a pontuação
QUEBRA = 1.30          # depois de "escravidão": a corrente quebra e a tela fica preta (preenchido pelo som)
CORRECOES = [(["escala", "cês", "por", "um"], "escala 6x1"), (["sabe", "-se"], "sabe-se"), (["deixar?"], "deixar."),
             (["a", "plenário."], "ao plenário."), (["quiser."], "quiser!"), (["STF,"], "STF"), (["brecha."], "brecha:")]
def ler(f):
    return np.frombuffer(subprocess.run(["ffmpeg", "-loglevel", "error", "-i", str(f), "-af", f"atempo={VEL}", "-ac", "1", "-ar", str(SR),
                         "-f", "f32le", "-"], capture_output=True, check=True).stdout, np.float32).copy()
voz, det = ler(SRC / "narracao/voz-tratada.flac"), ler(SRC / "narracao/voz-deteccao.flac")
pal = [[w, a / VEL, b / VEL] for w, a, b in json.loads((SRC / "palavras.json").read_text())["1"]]
# corrige a transcrição antes (as marcas e a legenda usam o texto certo)
out, k = [], 0
while k < len(pal):
    for seq, novo in CORRECOES:
        if [w[0] for w in pal[k:k + len(seq)]] == seq: out.append([novo, pal[k][1], pal[k + len(seq) - 1][2]]); k += len(seq); break
    else: out.append(list(pal[k])); k += 1
pal = out
H = int(0.005 * SR); en = np.array([np.sqrt(np.mean(det[i:i + H] ** 2)) for i in range(0, len(det) - H, H)])   # 5 ms
db = 20 * np.log10(en + 1e-9); ref = np.percentile(db, 95); fala = db > ref - 38
# fronteiras reais de cada palavra pela energia (Whisper erra ~50 ms): início = primeiro quadro com fala perto de a; fim = último perto de b
def borda_fim(b):
    i = int(b / 0.005); j = i
    while j < len(fala) - 1 and fala[j] and j - i < 40: j += 1          # estica se a palavra continua soando
    return j * 0.005
def borda_ini(a):
    i = int(a / 0.005); j = i
    while j > 0 and fala[j - 1] and i - j < 40: j -= 1
    return j * 0.005
def vale(a, b):  # ponto de menor energia entre a e b
    i0, i1 = int(a / 0.005), max(int(a / 0.005) + 1, int(b / 0.005)); return (i0 + int(np.argmin(en[i0:i1]))) * 0.005
GUARDA = 0.035
trechos, cur0 = [], max(0, borda_ini(pal[0][1]) - 0.06)
for k in range(len(pal) - 1):
    w, a, b = pal[k]; a2 = pal[k + 1][1]
    fim_w, ini_p = borda_fim(b), borda_ini(a2)
    gap = ini_p - fim_w
    pont = w[-1] if w[-1] in ",.:?!" else ""
    alvo = QUEBRA if w.startswith("escravid") else PAUSA[pont]
    if gap > alvo + 0.06:                                    # silêncio sobrando: corta
        c1, c2 = fim_w + GUARDA, ini_p - GUARDA
        trechos.append((cur0, c1, max(0.0, alvo - 2 * GUARDA)))   # (ini, fim, silêncio inserido depois)
        cur0 = c2
trechos.append((cur0, borda_fim(pal[-1][2]) + 0.12, 0.0))
XF = int(0.012 * SR); ENTRADA = 0.6
dst = np.zeros(int(90 * SR), np.float32); t = ENTRADA; mapa = []
for a, b, sil in trechos:
    p = voz[int(a * SR):int(b * SR)].copy(); p[:XF] *= np.linspace(0, 1, XF) ** 0.5; p[-XF:] *= np.linspace(1, 0, XF) ** 0.5
    i = int(t * SR); dst[i:i + len(p)] += p; mapa.append((a, b, t)); t += (b - a) + sil - 0.012
FIM = t; dst = dst[:int((FIM + 0.3) * SR)]
def T(x):
    for a, b, tt in mapa:
        if x < b: return tt + max(0.0, x - a)
    a, b, tt = mapa[-1]; return tt + b - a
P = [[w, round(T(a), 3), round(T(b), 3)] for w, a, b in pal]
sf.write(AQUI / "voz.wav", dst, SR, subtype="FLOAT")
(AQUI / "palavras.json").write_text(json.dumps({"fim_fala": round(FIM, 3), "palavras": P}, ensure_ascii=False))
print(f"original {len(voz)/SR:.2f}s → {FIM:.2f}s · {len(trechos)} trechos")
