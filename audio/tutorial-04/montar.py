"""Formação para novos militantes · EP. 4: Ideologia e filosofia dentro do coletivo (horizontal 1920×1080).
Narração numa tomada só, EDITADA: tira o "vamos lá, corta" do começo e a primeira tentativa de "Oxalá tem duas faces / Oxalufã é o..."
(o narrador errou, disse "de novo" e repetiu a frase inteira; fica só a repetição, conferida trecho a trecho), e encurta as pausas.
Redução de ruído com o perfil do próprio ruído da sala (6,6–8,8 s, antes da primeira fala): o fundo cai de −41 para −58 dB
sem mexer na voz (nr 20, sem som metálico); entre as frases fica silêncio de verdade. Banda sintetizada + efeitos, com a voz mandando (identidade 6b).
Gera: audio/tutorial-04/mix.wav e motor/cenas/tutorial-04.tempos.js (marcas e legendas)."""
import json, subprocess, sys
from pathlib import Path
import numpy as np

AQUI = Path(__file__).resolve().parent
RAIZ = AQUI.parent.parent
sys.path.insert(0, str(RAIZ / "motor"))
import som  # noqa: E402
from som import SR, soma  # noqa: E402

O = 0.8                       # a voz entra 0,8 s depois do começo do vídeo
CORTES = [(0.0, 9.0),        # "Vamos lá, vamos lá, corta."
          (57.10, 74.65)]   # 1ª tentativa de "Oxalá tem duas faces. Oxalufã é o..." + "de novo"
PAUSA_MAX = 0.6               # pausas maiores que isso são encurtadas

pal = json.load(open(AQUI / "palavras.json"))
# conferido à mão: a fala certa de "Oxalá tem duas faces. Oxalufã é o velho sábio" está em 74,7–79,2 s
# (o reconhecimento esticou palavras por cima do erro); tempos refeitos pela energia do áudio e por trechos transcritos um a um
i0 = next(i for i, w in enumerate(pal) if w["w"] == "Oxalá" and w["s"] > 66)
i1 = next(i for i, w in enumerate(pal) if w["w"] == "sábio")
pal[i0:i1 + 1] = [dict(w=x, s=a0, e=a1) for x, a0, a1 in [("Oxalá", 74.7, 75.1), ("tem", 75.1, 75.3), ("duas", 75.3, 75.65), ("faces.", 75.65, 76.2),
    ("Oxalufã", 77.0, 77.6), ("é", 78.0, 78.15), ("o", 78.15, 78.25), ("velho", 78.25, 78.6), ("sábio", 78.6, 79.2)]]
for w in pal:   # palavras que o reconhecimento começou antes, por cima de pausas
    if w["w"] == "A" and abs(w["s"] - 28.24) < 0.05: w["s"] = 29.2
    if w["w"] == "E" and abs(w["s"] - 215.62) < 0.05: w["s"] = 216.6
    if w["w"] == "firme." and abs(w["s"] - 39.16) < 0.05: w["e"] = 39.55
    if w["w"] == "paz," and 56 < w["s"] < 57: w["w"] = "paz."
for w in pal:   # o reconhecimento estica o fim de algumas palavras por cima da pausa: limita pela duração razoável da palavra
    w["e"] = round(min(w["e"], w["s"] + 0.11 * len(w["w"]) + 0.35), 3)
W = []
for w in pal:
    t = w["w"].strip()
    if W and (t.startswith("+") or t.startswith("-")): W[-1] = dict(W[-1], w=W[-1]["w"] + t, e=w["e"]); continue
    W.append(dict(w, w=t))
# palavras que o reconhecimento separou
J = []
for w in W:
    if J and (J[-1]["w"], w["w"]) in (("O", "Pá"), ("O", "Shagian"), ("Oxa", "Lufan,")): J[-1] = dict(J[-1], w=J[-1]["w"] + "+" + w["w"], e=w["e"]); continue
    if J and J[-1]["w"] == "O+Pá" and w["w"] == "chorou": J[-1] = dict(J[-1], w="opaxorô", e=w["e"]); continue
    J.append(w)
W = J
W = [w for w in W if not any(a <= w["s"] < b for a, b in CORTES)]
CORR = {"yorubais": "iorubás", "Olorun,": "Olorum,", "Olorun": "Olorum", "O+Shagian": "Oxaguiã", "Lufan,": "Lufã,", "Oxa+Lufan,": "Oxalufã,",
        "Lufan": "Lufã", "Ouvi": "Houve", "FAM.": "Lufã.", "opaxorô": "opaxorô"}
W = [w for i, w in enumerate(W) if not (w["w"] == "do" and i + 1 < len(W) and W[i + 1]["w"] == "FAM.")]
for i, w in enumerate(W):
    t = CORR.get(w["w"], w["w"])
    if t == "coletivo" and i + 1 < len(W) and W[i + 1]["w"] == "FAM.": t = "Coletivo"
    if t == "a" and i + 1 < len(W) and W[i + 1]["w"] == "paz." and i > 0 and W[i - 1]["w"] == "ligado": t = "à"
    if t == "palavras" and i + 1 < len(W) and W[i + 1]["w"].startswith("capitalismo"): t = "palavras:"
    if t == "ativa." and i + 1 < len(W) and W[i + 1]["w"] == "uma": t = "ativa,"
    w["w"] = t

# ---- edição: segmentos de fala, com as pausas encurtadas; cada palavra ganha o tempo novo
seg, atual = [], [W[0]]
for a, b in zip(W, W[1:]):
    corte = False   # os dois cortes caem entre frases: fica a pausa normal
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
for k, p, d in [("ceu", "céu", 0), ("olorum", "Olorum", 0), ("desceu", "desceu", 0), ("galinha", "galinha", 0), ("cinco", "cinco", 0), ("caiu", "caiu", 0),
                ("ciscou", "ciscou", 0), ("firme", "firme", 0), ("modelou", "modelou", 0), ("nana", "Nanã", 0), ("sopro", "sopro", 0), ("pai", "pai", 0),
                ("branco", "branco", 0)]:
    T[k] = em(p, d)
T["faces"] = em("Oxalá", T["branco"] + 1); T["lufa_face"] = em("Oxalufã", T["faces"]); T["opaxoro"] = em("opaxorô", T["faces"]); T["guia"] = em("Oxaguiã", T["faces"])
T["espada"] = em("espada", T["guia"]); T["luta1"] = em("luta", T["espada"])
T["nome"] = em("É", T["luta1"]); T["lufan"] = em("Lufã", T["nome"]); T["filosofia"] = em("filosofia", T["nome"]); T["religiosa"] = em("religiosa", T["nome"])
T["africanos"] = em("africanos", T["nome"]); T["mercadoria"] = em("mercadoria", T["nome"]); T["indigenas"] = em("indígenas", T["nome"]); T["terreiro"] = em("terreiro", T["nome"])
T["vulneraveis"] = em("vulneráveis", T["nome"]); T["sonhar"] = em("sonhar", T["nome"]); T["poder"] = em("poder", T["nome"])
T["tres"] = em("Mas", T["poder"]); T["p_cap"] = em("capitalismo", T["tres"]); T["p_soc"] = em("socialismo", T["tres"]); T["p_com"] = em("comunismo", T["tres"])
T["no_cap"] = em("No", T["tres"]); T["donos"] = em("donos", T["no_cap"]); T["salario"] = em("salário", T["no_cap"]); T["lucro"] = em("lucro", T["no_cap"]); T["merc2"] = em("mercadoria", T["no_cap"])
T["soc"] = em("O", T["merc2"]); T["meios"] = em("meios", T["soc"]); T["riqueza"] = em("riqueza", T["soc"])
T["com"] = em("E", T["riqueza"]); T["sem_classe"] = em("sem", T["com"]); T["exploracao"] = em("exploração", T["com"]); T["cada"] = em("cada", T["com"])
T["popular"] = em("Aqui", T["cada"]); T["vuln"] = em("vulnerabilidade", T["popular"]); T["marx"] = em("Marx", T["popular"]); T["milhoes"] = em("8", T["popular"])
T["conceito"] = em("E", T["milhoes"]); T["moradia"] = em("moradia", T["conceito"]); T["comida"] = em("comida", T["conceito"]); T["educacao"] = em("educação", T["conceito"])
T["trabalho"] = em("trabalho", T["conceito"]); T["casa"] = em("casa", T["conceito"]); T["repressao"] = em("repressão", T["conceito"]); T["lazer"] = em("lazer", T["conceito"])
T["sonhos"] = em("E", T["lazer"]); T["originarios"] = em("originários", T["sonhos"])
T["purismo"] = em("Por", T["originarios"]); T["afasta"] = em("afasta", T["purismo"]); T["identificadas"] = em("identificadas", T["purismo"])
T["pretos"] = em("pretos", T["purismo"]); T["pobres"] = em("pobres", T["pretos"]); T["fascismo"] = em("fascismo", T["pretos"]); T["mulher"] = em("mulher", T["fascismo"])
T["sozinhas"] = em("sozinhas", T["mulher"]); T["violencia"] = em("violência", T["mulher"])
T["lgbt"] = em("São", T["violencia"]); T["trans"] = em("trans", T["lgbt"]); T["revolucionario"] = em("revolucionário", T["lgbt"])
T["basta"] = em("Mas", T["revolucionario"]); T["ativa"] = em("ativa", T["basta"]); T["sistema"] = em("sistema", T["basta"])
T["paz"] = em("essa", T["sistema"] - 1.5); T["igualdade"] = em("igualdade", T["paz"]); T["capital_centro"] = em("capital", T["igualdade"])
T["ceu2"] = em("céu", T["paz"]); T["lutas"] = em("lutas", T["paz"]); T["oxaguia2"] = em("Oxaguiã", T["paz"]); T["nao_violencia"] = em("violência", T["oxaguia2"])
T["formar"] = em("formar", T["oxaguia2"]); T["alcancado"] = em("alcançado", T["formar"]); T["salvacao"] = em("salvação", T["formar"])
T["esperanca"] = em("E", T["salvacao"]); T["luz"] = em("luz", T["esperanca"]); T["houve"] = em("Houve", T["esperanca"])
T["fim"] = em("Paz", T["houve"]); T["caminho"] = em("caminho", T["fim"]); T["parabens"] = em("parabéns", T["fim"]); T["pazentre"] = em("Paz", T["parabens"])
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
(RAIZ / "motor" / "cenas" / "tutorial-04.tempos.js").write_text(
    "// GERADO por audio/tutorial-04/montar.py — não editar à mão\nwindow.TEMPOS = " +
    json.dumps({"dur": T["dur"], "marcas": T, "legendas": LEG}, ensure_ascii=False) + ";\n")

# ---------------------------------------------------------------- voz (editada)
raw = subprocess.run(["ffmpeg", "-loglevel", "error", "-i", str(AQUI / "narracao" / "ep4.m4a"), "-af",
                      "highpass=f=80,asendcmd=c='6.6 afftdn sn start; 8.8 afftdn sn stop',afftdn=nr=20:nf=-40,equalizer=f=3500:t=q:w=1.4:g=1.5,acompressor=threshold=-22dB:ratio=2.5:attack=8:release=160:makeup=1.5",
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
# a criação: só sintetizador (manto de cordas), sem bateria; depois a banda entra no "nome"
soma(st["sinte"], som.sinte([110.0, 164.8, 220.0, 277.2], T["faces"] - 0.2, 0.32, brilho=900, ataque=2.5), 0.2)
soma(st["sinte"], som.sinte([98.0, 146.8, 196.0, 246.9], T["nome"] - T["faces"], 0.3, brilho=1000, ataque=1.0), T["faces"])
for x in ("olorum", "firme", "sopro"): som.banda_golpe(st, T[x], A, 0.45, anel=1.2)
som.banda_golpe(st, T["lufa_face"], G, 0.55, anel=1.0); som.banda_golpe(st, T["guia"], E, 0.85, anel=0.8)
secao(T["nome"], T["tres"], 100, ((E, 8), (C, 8)), "palm", 0.45, 41)
secao(T["tres"], T["popular"], 108, ((E, 8), (G, 4), (A, 4)), "palm", 0.52, 42)
for x in ("p_cap", "p_soc", "p_com"): som.banda_golpe(st, T[x], E, 0.8, anel=0.4)
secao(T["popular"], T["purismo"], 104, ((C, 8), (G, 8), (A, 8), (E, 8)), "palm", 0.48, 43)
secao(T["purismo"], T["basta"], 112, ((E, 8), (D, 4), (A, 4)), "pulo", 0.55, 44)
som.banda_golpe(st, T["revolucionario"], E, 1.0, anel=0.8)
soma(st["bat"], som.virada(0.6, 0.8), T["basta"] - 0.62)
secao(T["basta"], T["esperanca"], 118, ((E, 8), (C, 8), (G, 8), (D, 8)), "aberto", 0.62, 45)
soma(st["sinte"], som.sinte([110.0, 138.6, 164.8, 220.0], T["fim"] - T["esperanca"], 0.3, brilho=1300, ataque=0.8), T["esperanca"])
soma(st["solo"], som.solo([(329.6, 0.3), (415.3, 0.3), (493.9, 0.3), (659.3, -1.6)], 0.5), T["luz"])
secao(T["fim"], T["logo"], 120, ((E, 8), (G, 8)), "aberto", 0.7, 46)
for x in ("caminho", "parabens", "pazentre"): som.banda_golpe(st, T[x], E, 0.95, anel=0.5)
som.banda_golpe(st, T["logo"], E, 1.0, anel=2.8)
soma(st["sinte"], som.sinte([82.41, 123.5, 164.8, 246.9], T["dur"] - T["logo"], 0.35, brilho=1100, ataque=0.4), T["logo"])

for x in ("faces", "nome", "tres", "popular", "purismo", "lgbt", "basta", "paz", "esperanca", "fim", "logo"): soma(fx, som.whoosh(), T[x] - 0.35, 0.45)
soma(fx, som.sino_grave(), T["olorum"], 0.5); soma(fx, som.papel(0.5), T["caiu"], 0.4); soma(fx, som.sino_grave(), T["sopro"], 0.4)
for x in ("p_cap", "p_soc", "p_com", "milhoes", "afasta", "trans", "revolucionario"): soma(fx, som.carimbo_sfx(), T[x], 0.7)
for x in ("moradia", "comida", "educacao", "trabalho", "casa", "repressao", "lazer", "pretos", "pobres", "mulher", "sozinhas"): soma(fx, som.tique(), T[x], 0.55)
for x in ("formar", "alcancado"): soma(fx, som.tique(), T[x], 0.6)
for x in ("caminho", "parabens", "pazentre"): soma(fx, som.carimbo_sfx(), T[x], 0.8)
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
print("dur", T["dur"], "| marcas", {k: T[k] for k in ("faces", "nome", "tres", "popular", "purismo", "lgbt", "basta", "paz", "esperanca", "fim", "logo")})
