"""Formação para novos militantes · EP. 3: A Área do Militante e a Organização dos Núcleos (horizontal 1920×1080).
Narração numa tomada só, EDITADA: tira o silêncio do começo, o trecho repetido ("vai pedir que um líder do seu núcleo")
e encurta as pausas longas. Banda sintetizada + efeitos, com a voz mandando (identidade 6b).
Gera: audio/tutorial-03/mix.wav e motor/cenas/tutorial-03.tempos.js (marcas e legendas)."""
import json, subprocess, sys
from pathlib import Path
import numpy as np

AQUI = Path(__file__).resolve().parent
RAIZ = AQUI.parent.parent
sys.path.insert(0, str(RAIZ / "motor"))
import som  # noqa: E402
from som import SR, soma  # noqa: E402

O = 0.8                       # a voz entra 0,8 s depois do começo do vídeo
CORTES = [(163.14, 167.46)]   # "vai pedir que um líder do seu núcleo" (a frase foi dita duas vezes)
PAUSA_MAX = 0.6               # pausas maiores que isso são encurtadas

pal = json.load(open(AQUI / "palavras.json"))
# junta pedaços ("LGBTQIA" + "+,", "bem" + "-vindo")
W = []
for w in pal:
    t = w["w"].strip()
    if W and (t.startswith("+") or t.startswith("-")): W[-1] = dict(W[-1], w=W[-1]["w"] + t, e=w["e"]); continue
    W.append(dict(w, w=t))
W = [w for w in W if not any(a <= w["s"] < b for a, b in CORTES)]
CORR = {"Lufan.": "Lufã.", "terreiros,": "Terreiro,", "postes,": "posts,", "Terminou.": "Terminou?", "Mas": "Mais", "esses": "essas",
        "Quero": "“Quero", "Fazer.": "fazer”.", "Olá": "Olá,", "camarada,": "camarada,"}
for i, w in enumerate(W):
    t = w["w"]
    if t == "esses" and W[i + 1]["w"] != "pessoas": continue
    if t == "a" and W[i + 1]["w"] == "disposição": t = "à"
    elif t == "Assistir" and i > 0 and W[i - 1]["w"] == "em": t = "“Assisti”"
    elif t in ("Concluído,", "Pronto"): t = {"Concluído,": "“Concluído”,", "Pronto": "“Pronto”"}[t]
    else: t = CORR.get(t, t)
    w["w"] = t

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
T["entrar"] = em("Para"); T["menu"] = em("menu", T["entrar"]); T["primeira"] = em("Na", T["entrar"])
T["nucleos_cad"] = em("escolher", T["primeira"]); T["foto"] = em("foto", T["primeira"])
T["topo"] = em("Logo"); T["grupo"] = em("grupo", T["topo"]); T["engaj"] = em("Logo", T["topo"] + 1); T["formacao"] = em("formação", T["engaj"])
T["carteira"] = em("Tem", T["engaj"]); T["avisos"] = em("Mais", T["carteira"]); T["seus"] = em("núcleos", T["avisos"])
T["nucleos"] = em("Os", T["seus"] + 1.5)
for k, p in [("n_marxista", "marxista"), ("n_racial", "racial"), ("n_feminista", "feminista"), ("n_lgbt", "LGBTQIA"), ("n_povos", "originários"),
             ("n_terreiro", "Terreiro"), ("n_cultural", "cultural"), ("n_estudantil", "estudantil")]:
    T[k] = em(p, T["nucleos"])
T["todos"] = em("O", T["n_estudantil"]); T["escolher"] = em("escolher", T["todos"])
T["jornal"] = em("Além"); T["org"] = em("A", T["jornal"] + 1)
T["ident"] = em("Os", T["org"]); T["debater"] = em("debater", T["ident"]); T["criando"] = em("criando", T["ident"]); T["estudar"] = em("estudar", T["ident"])
T["quadro"] = em("Bom", T["ident"]); T["c_afazer"] = em("a", T["quadro"] + 2); T["c_fazendo"] = em("fazendo", T["quadro"]); T["c_pronto"] = em("“Pronto", T["quadro"]) if False else em("pronto", T["quadro"])
T["tarefas"] = em("As", T["quadro"]); T["t_post"] = em("post", T["tarefas"]); T["t_video"] = em("vídeo", T["tarefas"]); T["t_arte"] = em("arte", T["tarefas"]); T["t_pesquisa"] = em("pesquisa", T["tarefas"])
T["lider"] = em("líder", T["tarefas"])
T["viu"] = em("Viu"); T["toque"] = em("Toque", T["viu"]); T["quero"] = em("“Quero", T["viu"]); T["vai_fazendo"] = em("Ela", T["viu"])
T["terminou"] = em("Terminou"); T["concluido"] = em("“Concluído", T["terminou"]); T["pronto"] = em("“Pronto", T["terminou"]); T["aprovar"] = em("aprovar", T["terminou"])
T["xp"] = em("10", T["terminou"])
T["mais"] = em("Na", T["xp"]); T["artigos"] = em("artigos", T["mais"]); T["artes"] = em("artes", T["mais"]); T["convida"] = em("convida", T["mais"])
T["convite"] = em("Inclusive"); T["engaj2"] = em("engajados", T["convite"])
T["fim"] = em("É", T["convite"] + 2); T["assisti"] = em("Toque", T["fim"]); T["bemvindo"] = em("Seja", T["fim"]); T["proximo"] = em("próximo", T["fim"])
T["logo"] = round(P[-1][2] + 1.0, 3)
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
(RAIZ / "motor" / "cenas" / "tutorial-03.tempos.js").write_text(
    "// GERADO por audio/tutorial-03/montar.py — não editar à mão\nwindow.TEMPOS = " +
    json.dumps({"dur": T["dur"], "marcas": T, "legendas": LEG}, ensure_ascii=False) + ";\n")

# ---------------------------------------------------------------- voz (editada)
raw = subprocess.run(["ffmpeg", "-loglevel", "error", "-i", str(AQUI / "narracao" / "ep3.m4a"), "-af",
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
for t0, nota in [(0.3, E), (0.9, G), (1.5, A)]: som.banda_golpe(st, t0, nota, 0.85, anel=0.35)
soma(st["sinte"], som.sinte([82.41, 123.5, 164.8], T["entrar"] - 1.5, 0.3, brilho=1000, ataque=0.4), 1.5)
def secao(t0, t1, bpm, acordes, estilo, intens, seed, virar=True):
    som.banda_secao(st, t0, t1 - t0, bpm, acordes, estilo, intens, virar=virar, seed=seed)
secao(T["entrar"], T["topo"], 104, ((E, 8), (C, 8)), "palm", 0.5, 21)
secao(T["topo"], T["nucleos"], 108, ((E, 8), (D, 4), (A, 4)), "palm", 0.52, 22)
som.banda_golpe(st, T["nucleos"], E, 0.9, anel=0.6)
secao(T["nucleos"] + 0.4, T["org"], 112, ((E, 8), (G, 4), (A, 4)), "pulo", 0.58, 23)
som.banda_golpe(st, T["org"], A, 0.95, anel=0.7)
secao(T["org"] + 0.4, T["quadro"], 104, ((C, 8), (G, 8), (A, 8), (E, 8)), "palm", 0.5, 24)
som.banda_golpe(st, T["quadro"], E, 0.9, anel=0.5)
secao(T["quadro"] + 0.4, T["mais"], 112, ((E, 8), (D, 4), (A, 4)), "palm", 0.55, 25)
som.banda_golpe(st, T["xp"], A, 0.95, anel=0.8)
soma(st["bat"], som.virada(0.6, 0.8), T["mais"] - 0.62)
secao(T["mais"], T["fim"], 118, ((E, 8), (C, 8), (G, 8), (D, 8)), "aberto", 0.68, 26)
for t0, nota in [(T["fim"], E), (T["assisti"], G), (T["bemvindo"], A)]: som.banda_golpe(st, t0, nota, 0.9, anel=0.4)
soma(st["sinte"], som.sinte([110.0, 164.8, 220.0], T["logo"] - T["fim"], 0.3, brilho=1100, ataque=0.3), T["fim"])
som.banda_golpe(st, T["logo"], E, 1.0, anel=2.8)
soma(st["sinte"], som.sinte([82.41, 123.5, 164.8, 246.9], T["dur"] - T["logo"], 0.35, brilho=1100, ataque=0.4), T["logo"])
soma(st["solo"], som.solo([(329.6, 0.3), (415.3, 0.3), (493.9, 0.3), (659.3, -1.6)], 0.5), T["bemvindo"] + 0.3)

for k in range(3): soma(fx, som.carimbo_sfx(), 0.3 + k * 0.6, 0.7)
for x in ("entrar", "topo", "nucleos", "org", "ident", "quadro", "viu", "terminou", "mais", "fim", "logo"): soma(fx, som.whoosh(), T[x] - 0.35, 0.5)
for x in ("menu", "grupo", "carteira", "quero", "concluido"): soma(fx, som.tique(), T[x], 0.7)
for x in ("n_marxista", "n_racial", "n_feminista", "n_lgbt", "n_povos", "n_terreiro", "n_cultural", "n_estudantil", "jornal"): soma(fx, som.papel(0.3), T[x], 0.55)
soma(fx, som.carimbo_sfx(), T["todos"] + 0.4, 0.7)
for x in ("t_post", "t_video", "t_arte", "t_pesquisa"): soma(fx, som.tique(), T[x], 0.6)
soma(fx, som.carimbo_sfx(), T["aprovar"], 0.8); soma(fx, som.riser(0.8), T["xp"] - 0.8, 0.3); soma(fx, som.carimbo_sfx(), T["xp"], 0.9)
for x in ("artigos", "artes", "convida"): soma(fx, som.tique(), T[x], 0.6)
for x in ("fim", "assisti", "bemvindo"): soma(fx, som.carimbo_sfx(), x and T[x], 0.8)
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
print("dur", T["dur"], "| marcas", {k: T[k] for k in ("entrar", "topo", "nucleos", "org", "quadro", "viu", "terminou", "mais", "fim", "logo")})
