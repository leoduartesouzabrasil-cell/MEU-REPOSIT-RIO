"""Edição do vídeo gravado "Quem paga a conta do ajuste fiscal?" (apresentador falando para a câmera).
1. Cortes secos nas pausas (ritmo de Reels): a fala vem do tempo das palavras (faster-whisper, midia/jaques-wagner/palavras-bruto.json).
2. Voz limpa (perfil de ruído das pausas, como audio/comunismo-03/limpar.py) e colada nos mesmos cortes.
3. Trilha (banda sintetizada, ~22 dB abaixo da voz) + efeitos nos carimbos.
4. Gera motor/cenas/ajuste-fiscal.tempos.js (marcas + legendas no tempo EDITADO) e audio/ajuste-fiscal/cortes.json (para editar.sh).

Uso: python3 audio/ajuste-fiscal/montar.py  →  node motor/render.js ajuste-fiscal saida/ajuste-fiscal-camada.mov --alfa  →  bash audio/ajuste-fiscal/editar.sh
"""
import json
import subprocess
import sys
from pathlib import Path

import numpy as np
import noisereduce as nr

AQUI = Path(__file__).resolve().parent
RAIZ = AQUI.parent.parent
MIDIA = RAIZ / "midia" / "jaques-wagner"
sys.path.insert(0, str(RAIZ / "motor"))
import som  # noqa: E402
from som import SR, soma  # noqa: E402

GAP = 0.30          # pausas maiores que isso são cortadas
ANTES, DEPOIS = 0.07, 0.11
FIM_LOGO = 3.2      # cartão final com as logos
CORRECOES = {"Jacques": "Jaques", "quantia": "contenção", "R": "R$", "$": None, "60": "60", "e@38": "em"}

# ---------------------------------------------------------------- palavras e correções
brutas = json.loads((MIDIA / "palavras-bruto.json").read_text())
pal = []
for p in brutas:
    w, s, e = p["w"], p["s"], p["e"]
    if w == "$":
        continue
    if w == "R":
        w = "R$"
    w = {"Jacques": "Jaques", "quantia": "contenção"}.get(w, w)
    if w == "e" and 38.0 <= s <= 38.2:
        w = "em"
    if w == "a" and 28.3 <= s <= 28.36:     # "medidas para a quantia de despesas" → "medidas para a contenção de despesas"
        pass
    pal.append([w, s, e])
# "R$" + "60" → uma palavra só na legenda
junto = []
for p in pal:
    if junto and junto[-1][0] == "R$" and p[0][0].isdigit():
        junto[-1] = ["R$ " + p[0], junto[-1][1], p[2]]
    else:
        junto.append(p)
pal = junto

# ---------------------------------------------------------------- voz limpa
raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(MIDIA / "bruto.mp4"), "-vn", "-af", "highpass=f=85", "-ac", "1", "-ar", str(SR),
                      "-f", "f32le", "-"], capture_output=True, check=True).stdout
x = np.frombuffer(raw, np.float32).copy()
quietas = [x[int(e * SR):int(s2 * SR)] for (_, _, e), (_, s2, _) in zip(pal, pal[1:]) if s2 - e > 0.35]
ruido = np.concatenate([q[int(0.05 * SR):-int(0.05 * SR)] for q in quietas if len(q) > 0.2 * SR])
x = nr.reduce_noise(y=x, sr=SR, y_noise=ruido, stationary=True, prop_decrease=0.85, n_fft=2048, freq_mask_smooth_hz=300, time_mask_smooth_ms=80)
# ---------------------------------------------------------------- trechos de fala (cortes nas pausas, pelo volume da voz limpa)
q = int(0.01 * SR)
en = 20 * np.log10(np.array([np.sqrt(np.mean(x[i:i + q] ** 2)) for i in range(0, len(x) - q, q)]) + 1e-9)
voz_on = en > np.percentile(en, 95) - 30          # fala: até 30 dB abaixo dos picos
# fecha buracos curtos (consoantes, respiros dentro da palavra)
k = 0
while k < len(voz_on):
    if not voz_on[k]:
        j = k
        while j < len(voz_on) and not voz_on[j]:
            j += 1
        if (j - k) * 0.01 < GAP and k > 0:
            voz_on[k:j] = True
        k = j
    else:
        k += 1
segs, k = [], 0
while k < len(voz_on):
    if voz_on[k]:
        j = k
        while j < len(voz_on) and voz_on[j]:
            j += 1
        if (j - k) * 0.01 > 0.08:
            segs.append([max(0, k * 0.01 - ANTES), j * 0.01 + DEPOIS])
        k = j
    else:
        k += 1
for i in range(1, len(segs)):
    if segs[i][0] < segs[i - 1][1]:
        segs[i][0] = segs[i - 1][1]
segs = [[round(a, 3), round(b, 3)] for a, b in segs if b - a > 0.15]
def mapear(t):
    acc = 0.0
    for a, b in segs:
        if t < a:
            return acc
        if t <= b:
            return acc + t - a
        acc += b - a
    return acc


DUR_FALA = sum(b - a for a, b in segs)
PAL = [[w, round(mapear(s), 3), round(mapear(e), 3)] for w, s, e in pal]
# zoom alternado a cada corte, para o "pulo" de câmera
zoom, z, cortes = [], 1.0, []
for i, (a, b) in enumerate(segs):
    if i:                                          # a cada corte, a câmera "pula" (1,0 ↔ 1,12)
        z = 1.12 if z == 1.0 else 1.0
    cortes.append({"a": a, "b": b, "zoom": z})

partes = []
for a, b in segs:
    p = x[int(a * SR):int(b * SR)].copy()
    f = min(int(0.008 * SR), len(p) // 2)
    p[:f] *= np.linspace(0, 1, f); p[-f:] *= np.linspace(1, 0, f)
    partes.append(p)
fala = np.concatenate(partes).astype(np.float32)
tmp = AQUI / "_fala.wav"
som.salvar_wav(str(tmp), fala, fala)
fala2 = subprocess.run(["ffmpeg", "-v", "error", "-i", str(tmp), "-af",
                        "lowpass=f=13000,equalizer=f=3500:t=q:w=1:g=2,acompressor=threshold=-20dB:ratio=2.5:attack=8:release=120",
                        "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
fala = np.frombuffer(fala2, np.float32).copy()
tmp.unlink()


# ---------------------------------------------------------------- marcas (tempo editado)
def frase(texto, depois=0.0, fim=False):
    limpa = lambda w: w.lower().strip(".,?!:")
    for i in range(len(PAL)):
        if PAL[i][1] < depois:
            continue
        junto, j = "", i
        while j < len(PAL) and len(junto) < len(texto):
            junto = (junto + " " + " ".join(limpa(y) for y in PAL[j][0].split())).strip()
            j += 1
        if junto == texto.lower() or junto.startswith(texto.lower() + " "):
            return PAL[j - 1][2] if fim else PAL[i][1]
    raise KeyError(texto)


M = {}
M["quem"] = frase("quem paga")
M["camaradas"] = frase("camaradas")
M["pacote"] = frase("um pacote")
M["bi60"] = frase("r$ 60")
M["ano2027"] = frase("2027")
M["wagner"] = frase("senador jaques")
M["superavit"] = frase("superávit")
M["despesas"] = frase("contenção de despesas")
M["arrecadacao"] = frase("aumentar a arrecadação")
M["atencao"] = frase("mas sabe")
M["enquanto"] = frase("enquanto")
M["escolas"] = frase("escolas")
M["hospitais"] = frase("hospitais")
M["estruturas"] = frase("estruturas")
M["saude"] = frase("profissionais da saúde")
M["professores"] = frase("professores")
M["pergunta"] = frase("por que a conta")
M["costas"] = frase("nas costas")
M["taxar"] = frase("por que não começamos")
M["fortunas"] = frase("grandes fortunas")
M["herancas"] = frase("grandes heranças")
M["dividendos"] = frase("lucros e dividendos")
M["bilhoes"] = frase("acumula bilhões")
M["prejud"] = frase("porque as pessoas")
M["saude2"] = frase("a saúde que")
M["educacao"] = frase("a educação")
M["pressao"] = frase("então a classe")
M["redes"] = frase("pressão nas redes")
M["segue"] = frase("se você está gostando")
M["compart"] = frase("compartilhe")
M["logo"] = round(DUR_FALA + 0.4, 3)
M["dur"] = round(M["logo"] + FIM_LOGO, 2)
M = {k: round(v, 3) for k, v in M.items()}
DUR = M["dur"]
N = int(DUR * SR)


def legendas(palavras, max_car=28):
    linhas, atual = [], []
    for i, p in enumerate(palavras):
        atual.append(p)
        texto = " ".join(w for w, _, _ in atual)
        prox = palavras[i + 1] if i + 1 < len(palavras) else None
        pausa = prox is None or prox[1] - p[2] > 0.45
        cabe = len(texto) + 1 + len(prox[0]) if prox else 0
        longa = prox is not None and cabe > max_car and not (prox[0][-1] in ".,?!:" and cabe <= max_car + 9)
        if (p[0][-1] in ".?!:" or (p[0][-1] == "," and len(texto) >= 12)) or longa or pausa:
            linhas.append({"t0": atual[0][1], "t1": p[2], "p": [[w, t0] for w, t0, _ in atual]})
            atual = []
    for a, b in zip(linhas, linhas[1:]):
        a["t1"] = round(min(b["t0"], a["t1"] + 0.6), 3)
    linhas[-1]["t1"] += 0.6
    return linhas


(RAIZ / "motor" / "cenas" / "ajuste-fiscal.tempos.js").write_text(
    "// GERADO por audio/ajuste-fiscal/montar.py — não editar à mão\n"
    f"window.TEMPOS = {json.dumps({'dur': DUR, 'marcas': M, 'legendas': legendas(PAL)}, ensure_ascii=False)};\n")
(AQUI / "cortes.json").write_text(json.dumps({"cortes": cortes, "dur": DUR, "logo": M["logo"]}, indent=1))

# ---------------------------------------------------------------- trilha + efeitos
E, G, A, C, D = 82.41, 98.0, 110.0, 65.41, 73.42
st = {k: np.zeros(N + SR * 4, np.float32) for k in ("bat", "baixo", "gE", "gD", "solo", "sinte")}
fx = np.zeros(N + SR * 4, np.float32)
som.banda_golpe(st, 0.05, E, 0.9, anel=0.5)
som.banda_secao(st, 0.2, M["atencao"] - 0.2, 116, ((E, 8), (G, 4), (A, 4)), "palm", 0.5, virar=True, seed=11)
som.banda_secao(st, M["atencao"], M["pergunta"] - M["atencao"], 120, ((A, 8), (G, 4), (E, 4)), "tensao", 0.5, virar=True, seed=12)
som.banda_secao(st, M["pergunta"], M["prejud"] - M["pergunta"], 124, ((E, 8), (C, 4), (D, 4)), "pulo", 0.62, virar=True, seed=13)
som.banda_secao(st, M["prejud"], M["logo"] - M["prejud"], 128, ((E, 8), (C, 8), (G, 8), (D, 8)), "aberto", 0.6, seed=14)
for k in ("bi60", "wagner", "costas", "fortunas", "herancas", "dividendos", "redes"):
    som.banda_golpe(st, M[k], E if k != "wagner" else A, 0.8, anel=0.5)
som.banda_golpe(st, M["logo"], E, 1.0, anel=2.6)
soma(st["sinte"], som.sinte([82.41, 123.5, 164.8, 246.9], FIM_LOGO, 0.35, brilho=1100, ataque=0.3), M["logo"])
soma(fx, som.whoosh(), 0.0, 0.5)
for k in ("bi60", "costas", "fortunas", "herancas", "dividendos", "redes", "logo"):
    soma(fx, som.carimbo_sfx(), M[k], 0.8)
for k in ("camaradas", "wagner", "superavit", "escolas", "hospitais", "estruturas", "saude", "professores", "saude2", "educacao", "compart"):
    soma(fx, som.tique(), M[k], 0.6)
soma(fx, som.papel(0.5), M["camaradas"] + 0.1, 0.6)
soma(fx, som.whoosh(0.4), M["wagner"] - 0.2, 0.5)
soma(fx, som.boom(), M["costas"] + 0.2, 0.4)

esq = np.zeros(N, np.float32); dir_ = np.zeros(N, np.float32); rev = np.zeros(N, np.float32)
ganhos = dict(bat=0.85, baixo=0.6, gE=0.42, gD=0.42, solo=0.5, sinte=0.45)
panos = dict(bat=0.0, baixo=0.0, gE=-0.75, gD=0.75, solo=0.2, sinte=0.0)
envio = dict(bat=0.12, baixo=0.0, gE=0.15, gD=0.15, solo=0.35, sinte=0.4)
for k, y in st.items():
    y = som.fpa(y[:N], 50 if k != "baixo" else 38, 3) * ganhos[k]
    l, r = som.pan(y, panos[k]); esq += l; dir_ += r; rev += y * envio[k]
rl, rr = som.reverb(rev, 1.9)
mus_e, mus_d = som.comprimir(esq + rl * 0.55, 0.3, 2.5), som.comprimir(dir_ + rr * 0.55, 0.3, 2.5)
f = fx[:N]; fl, fr = som.reverb(f * 0.4, 1.2, seed=9)
sfx_e, sfx_d = f + fl * 0.5, f + fr * 0.5

voz = np.zeros(N, np.float32); voz[:len(fala)] = fala[:N]
e = som.envelope_voz(voz)
falando = e > 0.3
rms = lambda y: float(np.sqrt(np.mean(y[falando] ** 2))) or 1e-9
REF = 0.2
voz_mix = voz * (REF / rms(voz))
g_mus = REF * 10 ** (-22 / 20) / rms((mus_e + mus_d) / 2 * (1 - 0.7 * e))
g_sfx = REF * 10 ** (-20 / 20) / max(rms((sfx_e + sfx_d) / 2 * (1 - 0.75 * e)), 1e-9)
le, ld = mus_e * (1 - 0.7 * e) * g_mus, mus_d * (1 - 0.7 * e) * g_mus
fe = np.clip(sfx_e * (1 - 0.75 * e) * g_sfx, -0.6, 0.6); fd = np.clip(sfx_d * (1 - 0.75 * e) * g_sfx, -0.6, 0.6)


def limitar(y, teto=0.7):
    a = np.abs(y)
    return np.where(a > teto, np.sign(y) * (teto + 0.28 * np.tanh((a - teto) / 0.28)), y).astype(np.float32)


som.salvar_wav(str(AQUI / "mix.wav"), limitar(voz_mix + le + fe), limitar(voz_mix + ld + fd))
print(f"{DUR:.2f}s (fala {DUR_FALA:.1f} s de {pal[-1][2]:.1f} s gravados; {len(segs)} trechos)")
print(json.dumps(M))
