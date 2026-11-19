"""6x1: a brecha que empurra a sua folga — monta narração, trilha e efeitos e gera motor/cenas/6x1-brecha.tempos.js (marcas + legendas).
Uso: python3 audio/6x1-brecha/tratar_voz.py && python3 audio/6x1-brecha/montar.py → audio/6x1-brecha/mix.wav"""
import json, subprocess, sys
from pathlib import Path
import numpy as np
AQUI = Path(__file__).resolve().parent; RAIZ = AQUI.parent.parent
sys.path.insert(0, str(RAIZ / "motor"))
import som  # noqa
from som import SR, soma  # noqa

VEL = 1.15                 # voz 15% mais rápida (cabe em ~52 s sem soar acelerada)
ENTRADA = 0.4              # a corrente aparece antes da primeira palavra
PAUSA_MAX, PAUSA_FICA = 0.40, 0.22
QUEBRA = 1.0               # depois de "escravidão": a corrente quebra (TUM) + tela preta, antes da explicação
CORRECOES = [(["escala", "cês", "por", "um"], "escala 6x1"), (["sabe", "-se"], "sabe-se"), (["deixar?"], "deixar."),
             (["a", "plenário."], "ao plenário."), (["quiser."], "quiser!"), (["STF,"], "STF"), (["brecha."], "brecha:")]

def ler(f):
    return np.frombuffer(subprocess.run(["ffmpeg", "-loglevel", "error", "-i", str(f), "-af", f"atempo={VEL}", "-ac", "1", "-ar", str(SR),
                                         "-f", "f32le", "-"], capture_output=True, check=True).stdout, np.float32).copy()
voz_src, det = ler(AQUI / "narracao/voz-tratada.flac"), ler(AQUI / "narracao/voz-deteccao.flac")
pal = json.loads((AQUI / "palavras.json").read_text())["1"]
pal = [[w, a / VEL, b / VEL] for w, a, b in pal]                    # tempos no áudio acelerado
q = int(0.01 * SR); en = np.array([np.sqrt(np.mean(det[i:i + q] ** 2)) for i in range(0, len(det) - q, q)])
LIM = np.percentile(en, 95) * 10 ** (-34 / 20)

# trechos com fala (pausas longas viram respiro de 0,32 s); a pausa depois de "escravidão" vira o momento da corrente (QUEBRA)
fala = en > LIM; ini = int(np.argmax(fala)); fim = min(len(fala) - int(np.argmax(fala[::-1])), int((pal[-1][2] + 0.35) * 100))   # sem o respiro final
t_escr = next(b for w, a, b in pal if w.startswith("escravid"))
segs, i0, i = [], max(0, ini - 6), ini
while i < fim:
    if not fala[i]:
        j = i
        while j < fim and not fala[j]: j += 1
        dur = (j - i) * 0.01
        if dur > PAUSA_MAX or abs(i * 0.01 - t_escr) < 0.4:
            fica = QUEBRA if abs(i * 0.01 - t_escr) < 0.4 else PAUSA_FICA
            m = int(min(PAUSA_FICA, dur) / 2 * 100)
            segs.append((i0 * 0.01, (i + m) * 0.01, fica - min(PAUSA_FICA, dur)))   # (ini, fim, silêncio extra depois)
            i0 = j - m
        i = j
    else: i += 1
segs.append((i0 * 0.01, min(len(voz_src) / SR, (fim + 15) * 0.01), 0.0))

N0 = int(90 * SR); voz = np.zeros(N0, np.float32); t = ENTRADA; mapa = []
for a, b, extra in segs:
    p = voz_src[int(a * SR):int(b * SR)].copy(); g = min(int(0.01 * SR), len(p) // 2)
    p[:g] *= np.linspace(0, 1, g); p[-g:] *= np.linspace(1, 0, g); soma(voz, p, t)
    mapa.append((a, b, t)); t += (b - a) + max(0.0, extra)
FIM_FALA = t
def T(x):
    for a, b, tt in mapa:
        if x < b: return tt + max(0.0, x - a)
    return mapa[-1][2] + mapa[-1][1] - mapa[-1][0]

def corrigir(ws):
    out, k = [], 0
    while k < len(ws):
        for seq, novo in CORRECOES:
            if [w[0] for w in ws[k:k + len(seq)]] == seq: out.append([novo, ws[k][1], ws[k + len(seq) - 1][2]]); k += len(seq); break
        else: out.append(list(ws[k])); k += 1
    return out
PAL = [[w, round(T(a), 3), round(T(b), 3)] for w, a, b in corrigir(pal)]

def quando(txt, depois=0.0):
    limpa = lambda w: w.lower().replace(",", "").replace(".", "").replace("?", "").replace("!", "").replace(":", "")
    for k in range(len(PAL)):
        corrido = " ".join(limpa(w) for w, _, _ in PAL[k:k + 6])
        if PAL[k][1] >= depois and (corrido + " ").startswith(txt.lower() + " "): return PAL[k][1]
    raise KeyError(txt)
M = {"quebra": round(T(t_escr) + 0.15, 3), "fim6x1": quando("o fim"), "dezembro": quando("dia 16"), "duas": quando("duas folgas por"),
     "stf": quando("só que no stf"), "brecha": quando("uma brecha"), "acordo": quando("com um acordo"), "semana": quando("mesma semana"),
     "mes": quando("e nem no mesmo"), "lutou": quando("a gente lutou"), "empurrar": quando("empurrar"), "sabese": quando("sabe-se"),
     "ouseja": quando("ou seja"), "descansa": quando("e descansa"), "camara": quando("até a câmara"), "julgamento": quando("e o julgamento"),
     "compartilhe": quando("compartilhe"), "folgatoda": quando("folga toda semana")}
M["logo"] = round(FIM_FALA + 0.25, 3); M["dur"] = round(M["logo"] + 2.2, 2)
M = {k: round(v, 3) for k, v in M.items()}
DUR = M["dur"]; N = int(DUR * SR); voz = voz[:N]

def legendas(ps, max_car=26):
    linhas, at = [], []
    for k, p in enumerate(ps):
        at.append(p); txt = " ".join(w for w, _, _ in at); prox = ps[k + 1] if k + 1 < len(ps) else None
        if p[0][-1] in ".,?!:" or prox is None or len(txt) + 1 + len(prox[0]) > max_car or prox[1] - p[2] > 0.6:
            linhas.append({"t0": at[0][1], "t1": prox[1] if prox else p[2] + 0.7, "p": [[w, a] for w, a, _ in at]}); at = []
    return linhas
(RAIZ / "motor/cenas/6x1-brecha.tempos.js").write_text("// GERADO por audio/6x1-brecha/montar.py\n"
    f"window.TEMPOS = {json.dumps({'dur': DUR, 'marcas': M, 'legendas': legendas(PAL)}, ensure_ascii=False)};\n")

# ---------------- trilha (banda completa) e efeitos
E, G, A, C, D = 82.41, 98.0, 110.0, 65.41, 73.42
st = {k: np.zeros(N + SR * 4, np.float32) for k in ("bat", "baixo", "gE", "gD", "solo", "sinte")}
fx = np.zeros(N + SR * 4, np.float32)
soma(st["sinte"], som.sinte([82.41, 87.31, 123.5], M["quebra"], 0.4, brilho=650, ataque=0.5), 0)           # gancho: tensão grave
for k in range(int(M["quebra"] / 0.55)): soma(fx, som.metal(95, 0.5, 0.35), 0.3 + k * 0.55, 0.22)          # a corrente rangendo
soma(fx, som.riser(1.2), M["quebra"] - 1.2, 0.45)
som.banda_golpe(st, M["quebra"], E, 1.0, anel=0.6)                                                            # TUM: a corrente quebra
soma(fx, som.boom(), M["quebra"], 0.9); soma(fx, som.metal(1500, 0.8, 0.9), M["quebra"], 0.5); soma(fx, som.carimbo_sfx(), M["quebra"], 0.8)
volta = M["quebra"] + 0.85
som.banda_secao(st, volta, M["lutou"] - volta, 112, ((E, 8), (C, 4), (D, 4)), "palm", 0.55, virar=True, seed=71)
som.banda_secao(st, M["lutou"], M["camara"] - M["lutou"], 120, ((E, 8), (G, 4), (A, 4)), "tensao", 0.6, virar=True, seed=72)
som.banda_secao(st, M["camara"], DUR - M["camara"], 128, ((E, 8), (C, 8), (G, 8), (D, 8)), "aberto", 0.72, seed=73)
for k in ("brecha", "empurrar", "folgatoda"): som.banda_golpe(st, M[k], E, 1.0, anel=0.6)
som.banda_golpe(st, M["logo"], E, 1.0, anel=2.0)
for k in ("dezembro", "stf", "acordo", "camara", "julgamento"): soma(fx, som.whoosh(0.4), M[k] - 0.2, 0.5); soma(fx, som.tique(), M[k] + 0.1, 0.8)
for k in ("brecha", "empurrar", "folgatoda", "logo"): soma(fx, som.carimbo_sfx(), M[k], 0.9)
soma(fx, som.whoosh(0.6), M["semana"] + 0.2, 0.6); soma(fx, som.whoosh(0.6), M["mes"] + 0.3, 0.6)
soma(fx, som.relogio(2.0, 120), M["sabese"] - 0.5, 0.35)
soma(fx, som.riser(0.8), M["compartilhe"] - 0.8, 0.4)

esq = np.zeros(N, np.float32); dir_ = np.zeros(N, np.float32); rev = np.zeros(N, np.float32)
ganhos = dict(bat=0.85, baixo=0.6, gE=0.42, gD=0.42, solo=0.5, sinte=0.45); panos = dict(bat=0.0, baixo=0.0, gE=-0.75, gD=0.75, solo=0.2, sinte=0.0)
for k, x in st.items():
    x = som.fpa(x[:N], 50 if k != "baixo" else 38, 3) * ganhos[k]; l, r = som.pan(x, panos[k]); esq += l; dir_ += r; rev += x * 0.15
rl, rr = som.reverb(rev, 1.6); esq += rl * 0.5; dir_ += rr * 0.5
esq, dir_ = som.comprimir(esq, 0.3, 2.5), som.comprimir(dir_, 0.3, 2.5)
# tela preta logo depois da quebra: a banda some 0,6 s (só o eco do estrondo)
tt = np.arange(N) / SR; buraco = np.clip((tt - (M["quebra"] + 0.25)) / 0.05, 0, 1) * np.clip((volta - tt) / 0.05, 0, 1)
esq *= 1 - buraco; dir_ *= 1 - buraco
fx = fx[:N]
e = som.envelope_voz(voz); fala_m = e > 0.3
rms = lambda s: float(np.sqrt(np.mean(s[fala_m] ** 2))) or 1e-9
REF = 0.16
voz_mix = voz * (REF / rms(voz))
g_mus = REF * 10 ** (-22 / 20) / rms((esq + dir_) / 2 * (1 - 0.7 * e))                 # trilha 22 dB abaixo da voz
g_fx = REF * 10 ** (-20 / 20) / max(rms(fx * (1 - 0.75 * e)), 1e-9)                  # efeitos 20 dB abaixo
le, ld = esq * (1 - 0.7 * e) * g_mus, dir_ * (1 - 0.7 * e) * g_mus
ef = np.clip(fx * (1 - 0.75 * e) * g_fx, -0.6, 0.6)
lim = lambda s: np.where(np.abs(s) > 0.7, np.sign(s) * (0.7 + 0.28 * np.tanh((np.abs(s) - 0.7) / 0.28)), s).astype(np.float32)
som.salvar_wav(str(AQUI / "mix.wav"), lim(voz_mix + le + ef), lim(voz_mix + ld + ef))
print(f"{DUR:.2f}s"); print(json.dumps(M))
print(" / ".join(" ".join(w for w, _ in l["p"]) for l in legendas(PAL)))
