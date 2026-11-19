"""Formação para novos militantes · EP. 2: O que é ser um Militante Ativo? (horizontal 1920×1080).
Narração numa tomada só; a edição só tira o silêncio do começo e encurta as pausas longas. Banda sintetizada + efeitos, com a voz mandando (identidade 6b).
Gera: audio/tutorial-02/mix.wav e motor/cenas/tutorial-02.tempos.js (marcas e legendas)."""
import json, subprocess, sys
from pathlib import Path
import numpy as np

AQUI = Path(__file__).resolve().parent
RAIZ = AQUI.parent.parent
sys.path.insert(0, str(RAIZ / "motor"))
import som  # noqa: E402
from som import SR, soma  # noqa: E402

O = 0.8                       # a voz entra 0,8 s depois do começo do vídeo
CORTES = []
PAUSA_MAX = 0.6               # pausas maiores que isso são encurtadas

pal = json.load(open(AQUI / "palavras.json"))
# junta pedaços ("LGBTQIA" + "+,", "bem" + "-vindo")
W = []
for w in pal:
    t = w["w"].strip()
    if W and (t.startswith("+") or t.startswith("-")): W[-1] = dict(W[-1], w=W[-1]["w"] + t, e=w["e"]); continue
    W.append(dict(w, w=t))
W = [w for w in W if not any(a <= w["s"] < b for a, b in CORTES)]
CORR = {"Lufa?": "Lufã?", "aí": "aí,", "pesquisar": "pesquisar,", "reels": "Reels", "escolheram": "escolheu os", "acituarem": "situarem", "segue": "segue,"}
for i, w in enumerate(W):
    t = w["w"]
    if t == "em" and W[i + 1]["w"] == "limites": t = "e"
    w["w"] = CORR.get(t, t)

# ---- edição: segmentos de fala, com as pausas encurtadas; cada palavra ganha o tempo novo
seg, atual = [], [W[0]]
for a, b in zip(W, W[1:]):
    corte = any(a["e"] <= c0 + 0.01 and b["s"] >= c1 - 0.05 for c0, c1 in CORTES)
    if b["s"] - a["e"] > PAUSA_MAX or corte: seg.append((atual, corte)); atual = [b]
    else: atual.append(b)
seg.append((atual, False))
TRECHOS, P, t_novo = [], [], O
for k, (ws, corte_depois) in enumerate(seg):
    ini, fim = max(0.0, ws[0]["s"] - 0.12), ws[-1]["e"] + (0.06 if corte_depois else 0.22)
    desl = t_novo - ini
    TRECHOS.append((ini, fim, t_novo))
    for w in ws: P.append((w["w"], round(w["s"] + desl, 3), round(w["e"] + desl, 3)))
    t_novo += (fim - ini) + (0.04 if corte_depois else 0.32)

def em(palavra, depois=0.0):
    for w, s, _ in P:
        if s >= depois and w.lower().strip(".,?!:“”").startswith(palavra.lower().strip("“”")): return round(s, 3)
    raise SystemExit("não achei: " + palavra)

T = {"abre": 0.0}
T["dif"] = em("Os"); T["ativamente"] = em("ativamente", T["dif"]); T["fora"] = em("acompanhar", T["dif"]); T["apoia"] = em("Quem", T["dif"]); T["nao_ativo"] = em("membro", T["apoia"])
T["funcoes"] = em("Um", T["apoia"]); T["f_criador"] = em("criador", T["funcoes"]); T["f_redator"] = em("redator", T["funcoes"]); T["f_artigos"] = em("pesquisar", T["funcoes"])
T["f_formacao"] = em("formação", T["funcoes"]); T["f_agitador"] = em("agitador", T["funcoes"]); T["resp"] = em("E", T["f_agitador"]); T["acomp"] = em("acompanhado", T["resp"])
T["comp"] = em("Ser", T["resp"]); T["c_colaborar"] = em("colaborar", T["comp"]); T["c_cadastro"] = em("manter", T["comp"]); T["c_respeito"] = em("respeito", T["comp"]); T["c_valem"] = em("valem", T["comp"])
T["atencao"] = em("Mas", T["comp"]); T["desligado"] = em("desligado", T["atencao"]); T["presenca"] = em("Militância", T["atencao"])
T["cuidado"] = em("da", T["presenca"]); T["bemestar"] = em("bem-estar", T["cuidado"]); T["equilibrar"] = em("equilibrar", T["cuidado"]); T["vida"] = em("vida", T["equilibrar"]); T["limites"] = em("limites", T["equilibrar"])
T["conduta"] = em("Também", T["limites"]); T["odio"] = em("ódio", T["conduta"]); T["fake"] = em("fake", T["conduta"]); T["aja"] = em("Aja", T["conduta"])
T["sozinho"] = em("Mas", T["aja"]); T["cadastro"] = em("Quando", T["sozinho"]); T["base"] = em("base", T["cadastro"]); T["n_criando"] = em("criando", T["base"]); T["n_pesquisando"] = em("pesquisando", T["base"])
T["n_estudando"] = em("estudando", T["base"]); T["n_conhecendo"] = em("conhecendo", T["base"])
T["lider"] = em("E", T["n_conhecendo"]); T["diretoria"] = em("diretoria", T["lider"]); T["situar"] = em("situarem", T["lider"]); T["constancia"] = em("constância", T["lider"]); T["saudavel"] = em("saudável", T["lider"])
T["ajuda"] = em("Se", T["saudavel"]); T["pedir"] = em("pedir", T["ajuda"]); T["junto"] = em("A", T["pedir"])
T["proximo"] = round(P[-1][2] + 1.0, 3)
T["logo"] = round(T["proximo"] + 4.2, 3)
T["dur"] = round(T["logo"] + 5.5, 3)

def legendas(ps, max_car=44):
    linhas, atual = [], []
    for i, p in enumerate(ps):
        atual.append(p)
        texto = " ".join(w for w, _, _ in atual)
        prox = ps[i + 1] if i + 1 < len(ps) else None
        pausa = prox is None or prox[1] - p[2] > 0.45
        cabe = len(texto) + 1 + len(prox[0]) if prox else 0
        longa = prox is not None and cabe > max_car and not (prox[0][-1] in ".,?!:" and cabe <= max_car + 9)
        if p[0][-1] in ".,?!:”" or longa or pausa:
            linhas.append({"t0": round(atual[0][1], 3), "t1": round(p[2], 3), "p": [[w, round(t0, 3)] for w, t0, _ in atual]})
            atual = []
    for a, b in zip(linhas, linhas[1:]):
        a["t1"] = round(min(b["t0"], a["t1"] + 0.8), 3)
    linhas[-1]["t1"] += 0.8
    return linhas

LEG = legendas(P)
(RAIZ / "motor" / "cenas" / "tutorial-02.tempos.js").write_text(
    "// GERADO por audio/tutorial-02/montar.py — não editar à mão\nwindow.TEMPOS = " +
    json.dumps({"dur": T["dur"], "marcas": T, "legendas": LEG}, ensure_ascii=False) + ";\n")

# ---------------------------------------------------------------- voz (editada)
raw = subprocess.run(["ffmpeg", "-loglevel", "error", "-i", str(AQUI / "narracao" / "ep2.aac"), "-af",
                      "highpass=f=80,afftdn=nr=8:nf=-48,equalizer=f=3500:t=q:w=1.4:g=1.5,acompressor=threshold=-22dB:ratio=2.5:attack=8:release=160:makeup=1.5",
                      "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
v0 = np.frombuffer(raw, np.float32).copy()
N = int(T["dur"] * SR)
voz = np.zeros(N, np.float32)
F = int(0.012 * SR)
for ini, fim, novo in TRECHOS:
    x = v0[int(ini * SR):int(fim * SR)].copy()
    x[:F] *= np.linspace(0, 1, F); x[-F:] *= np.linspace(1, 0, F)
    soma(voz, x, novo)

# ---------------------------------------------------------------- trilha: banda completa (identidade 6a)
E, G, A, C, D = 82.41, 98.0, 110.0, 65.41, 73.42
st = {k: np.zeros(N + SR * 4, np.float32) for k in ("bat", "baixo", "gE", "gD", "solo", "sinte")}
fx = np.zeros(N + SR * 4, np.float32)
def secao(t0, t1, bpm, acordes, estilo, intens, seed, virar=True):
    som.banda_secao(st, t0, t1 - t0, bpm, acordes, estilo, intens, virar=virar, seed=seed)
for t0, nota in [(0.3, E), (0.9, G), (1.5, A)]: som.banda_golpe(st, t0, nota, 0.85, anel=0.35)
soma(st["sinte"], som.sinte([82.41, 123.5, 164.8], T["dif"] - 1.5, 0.3, brilho=1000, ataque=0.4), 1.5)
secao(T["dif"], T["funcoes"], 104, ((E, 8), (C, 8)), "palm", 0.5, 31)
secao(T["funcoes"], T["comp"], 112, ((E, 8), (G, 4), (A, 4)), "pulo", 0.58, 32)
secao(T["comp"], T["atencao"], 104, ((C, 8), (G, 8), (A, 8), (E, 8)), "palm", 0.5, 33)
som.banda_golpe(st, T["presenca"], E, 1.0, anel=0.8)
secao(T["atencao"] + 0.4, T["cuidado"], 108, ((E, 8), (D, 8)), "palm", 0.55, 34)
soma(st["sinte"], som.sinte([110.0, 138.6, 164.8, 220.0], T["conduta"] - T["cuidado"], 0.28, brilho=1100, ataque=1.0), T["cuidado"])
secao(T["cuidado"], T["conduta"], 96, ((A, 8), (G, 8)), "palm", 0.4, 35)
som.banda_golpe(st, T["conduta"], E, 0.9, anel=0.5)
secao(T["conduta"] + 0.4, T["sozinho"], 110, ((E, 8), (C, 4), (D, 4)), "palm", 0.55, 36)
soma(st["bat"], som.virada(0.6, 0.8), T["sozinho"] - 0.62)
secao(T["sozinho"], T["ajuda"], 116, ((E, 8), (C, 8), (G, 8), (D, 8)), "aberto", 0.62, 37)
for t0, nota in [(T["ajuda"], E), (T["pedir"], G), (T["junto"], A)]: som.banda_golpe(st, t0, nota, 0.9, anel=0.4)
soma(st["solo"], som.solo([(329.6, 0.3), (415.3, 0.3), (493.9, 0.3), (659.3, -1.6)], 0.5), T["junto"] + 0.3)
for t0, nota in [(T["proximo"] + 0.1, E), (T["proximo"] + 0.5, G), (T["proximo"] + 0.9, A)]: som.banda_golpe(st, t0, nota, 0.9, anel=0.3)
soma(st["sinte"], som.sinte([110.0, 164.8, 220.0], T["logo"] - T["proximo"], 0.3, brilho=1100, ataque=0.3), T["proximo"])
som.banda_golpe(st, T["logo"], E, 1.0, anel=2.8)
soma(st["sinte"], som.sinte([82.41, 123.5, 164.8, 246.9], T["dur"] - T["logo"], 0.35, brilho=1100, ataque=0.4), T["logo"])

for k in range(3): soma(fx, som.carimbo_sfx(), 0.3 + k * 0.6, 0.7)
for x in ("dif", "funcoes", "comp", "atencao", "cuidado", "conduta", "sozinho", "lider", "ajuda", "proximo", "logo"): soma(fx, som.whoosh(), T[x] - 0.35, 0.5)
for x in ("f_criador", "f_redator", "f_artigos", "f_formacao", "f_agitador"): soma(fx, som.tique(), T[x], 0.7)
for x in ("c_colaborar", "c_cadastro", "c_respeito"): soma(fx, som.maquina(14, 0.035), T[x], 0.35); soma(fx, som.tique(), T[x] + 0.6, 0.5)
soma(fx, som.carimbo_sfx(), T["c_valem"], 0.7); soma(fx, som.carimbo_sfx(), T["presenca"], 0.9); soma(fx, som.negacao(), T["desligado"], 0.3)
for x in ("odio", "fake"): soma(fx, som.carimbo_sfx(), x and T[x], 0.8)
soma(fx, som.carimbo_sfx(), T["base"], 0.7)
for x in ("n_criando", "n_pesquisando", "n_estudando", "n_conhecendo", "situar", "constancia"): soma(fx, som.tique(), T[x], 0.6)
for x in ("ajuda", "pedir", "junto"): soma(fx, som.carimbo_sfx(), T[x], 0.8)
for k in range(3): soma(fx, som.carimbo_sfx(), T["proximo"] + 0.1 + k * 0.4, 0.8)
soma(fx, som.carimbo_sfx(), T["logo"], 0.8); soma(fx, som.sino_grave(), T["logo"] - 0.1, 0.9)

esq = np.zeros(N, np.float32); dir_ = np.zeros(N, np.float32); rev = np.zeros(N, np.float32)
ganhos = dict(bat=0.85, baixo=0.6, gE=0.42, gD=0.42, solo=0.5, sinte=0.45)
panos = dict(bat=0.0, baixo=0.0, gE=-0.75, gD=0.75, solo=0.2, sinte=0.0)
envio = dict(bat=0.12, baixo=0.0, gE=0.15, gD=0.15, solo=0.35, sinte=0.4)
for k, x in st.items():
    x = som.fpa(x[:N], 50 if k != "baixo" else 38, 3) * ganhos[k]
    l, r = som.pan(x, panos[k]); esq += l; dir_ += r; rev += x * envio[k]
rl, rr = som.reverb(rev, 1.9)
esq += rl * 0.55; dir_ += rr * 0.55
esq, dir_ = som.comprimir(esq, 0.3, 2.5), som.comprimir(dir_, 0.3, 2.5)
f = fx[:N]; fl, fr = som.reverb(f * 0.4, 1.2, seed=9); fe, fd = f + fl * 0.5, f + fr * 0.5

# ---------------------------------------------------------------- a voz manda: leito ~17 dB abaixo na fala, ~8 dB nas pausas
rms = lambda x: float(np.sqrt(np.mean(x ** 2)) + 1e-9)
fala = np.abs(voz) > 0
envv = som.envelope_voz(voz, 0.08) if hasattr(som, "envelope_voz") else np.abs(voz)
envv = envv / (envv.max() + 1e-9)
alvo_voz = 0.16
voz = voz * (alvo_voz / rms(voz[np.abs(voz) > 0.01]))
leito = np.stack([esq, dir_]); leito /= rms(leito)
duck = np.clip(envv * 3, 0, 1)
g = (alvo_voz * 10 ** (-8 / 20)) * (1 - duck) + (alvo_voz * 10 ** (-17 / 20)) * duck
efx = np.stack([fe, fd]); efx /= max(rms(efx), 1e-9)
efx_g = (alvo_voz * 10 ** (-12 / 20)) * (1 - duck) + (alvo_voz * 10 ** (-20 / 20)) * duck
def limitar(x, teto=0.7):
    a = np.abs(x); return np.where(a > teto, np.sign(x) * (teto + 0.28 * np.tanh((a - teto) / 0.28)), x).astype(np.float32)
saida_e = limitar(voz + leito[0] * g + efx[0] * efx_g)
saida_d = limitar(voz + leito[1] * g + efx[1] * efx_g)
som.salvar_wav(str(AQUI / "mix.wav"), saida_e, saida_d)
print("dur", T["dur"], "| marcas", {k: T[k] for k in ("dif", "funcoes", "comp", "atencao", "cuidado", "conduta", "sozinho", "lider", "ajuda", "proximo", "logo")})
