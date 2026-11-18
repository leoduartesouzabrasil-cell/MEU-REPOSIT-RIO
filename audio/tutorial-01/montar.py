"""Série para novos membros · EP. 1: Bem-vindo ao Coletivo Lufã! (horizontal 1920×1080).
Narração (uma tomada, sem cortes) + banda sintetizada + efeitos, com a voz mandando (identidade 6b).
Gera: audio/tutorial-01/mix.wav e motor/cenas/tutorial-01.tempos.js (marcas e legendas)."""
import json, subprocess, sys
from pathlib import Path
import numpy as np

AQUI = Path(__file__).resolve().parent
RAIZ = AQUI.parent.parent
sys.path.insert(0, str(RAIZ / "motor"))
import som  # noqa: E402
from som import SR, soma  # noqa: E402

O = 0.6                     # a voz entra 0,6 s depois do começo do vídeo
pal = json.load(open(AQUI / "palavras.json"))
# correções da transcrição (nomes e palavras que o reconhecimento errou)
CORR = {"Lufan.": "Lufã.", "Lufan": "Lufã", "Lufa.": "Lufã.", "sede": "6", "Leo": "Léo", "Eduardo": "Eduarda", "digne": "digno",
        "lermarques,": "ler Marx,", "leninismo,": "-leninismo,", "-vindos": "-vindos", "Lufan,": "Lufã,"}
P = []
for w in pal:
    t = w["w"].strip(); t = CORR.get(t, t)
    if t.startswith("-") and P and t not in ("-leninismo,",):      # junta "bem" + "-vindos", "transformá" + "-lo"
        P[-1] = (P[-1][0] + t, P[-1][1], w["e"] + O); continue
    if t == "-leninismo,": P[-1] = (P[-1][0] + "-leninismo,", P[-1][1], w["e"] + O); continue
    P.append((t, w["s"] + O, w["e"] + O))

P = [("Coletivo" if w == "coletivo" and i + 1 < len(P) and P[i + 1][0].startswith("Lufã") else w, a, b) for i, (w, a, b) in enumerate(P)]

def em(palavra, depois=0.0):
    """tempo (já com O) da 1ª ocorrência de `palavra` depois de `depois`"""
    for w, s, _ in P:
        if s >= depois and w.lower().strip(".,?!:").startswith(palavra.lower()): return round(s, 3)
    raise SystemExit("não achei: " + palavra)

T = {}
T["abre"] = 0.0
T["funda"] = em("O", 5)                 # O Coletivo Lufã nasceu…
T["data"] = em("6", 5)
T["eleicao"] = em("após")
T["leo"] = em("Léo"); T["duda"] = em("Eduarda")
T["uniao"] = em("união")
T["somos"] = em("Somos")
T["radical1"] = em("esquerda", T["somos"])
T["partido"] = em("Não", T["somos"])
T["trab"] = em("trabalhador", T["somos"])
T["exist"] = em("Existimos")
T["ideias"] = em("disputar"); T["direita"] = em("contraponto"); T["capital"] = em("enfrentar"); T["formar"] = em("formar")
T["base"] = em("A", T["formar"] + 1)
T["marx"] = em("marxismo"); T["lenin"] = T["marx"] + 0.6
T["luta"] = em("luta", T["marx"]); T["transf"] = em("transformá")
T["radical"] = em("Ser", T["transf"])
T["violencia"] = em("violência"); T["apenas"] = em("Apenas"); T["raiz"] = em("raiz", T["apenas"]); T["analg"] = em("analgésicos")
T["popular"] = em("E", T["analg"] + 0.5)
T["quem"] = em("quem", T["popular"]); T["moradia"] = em("moradia"); T["emprego"] = em("emprego"); T["alim"] = em("alimentação")
T["nunca"] = em("nunca", T["popular"]); T["concorda"] = em("concordar")
T["comunica"] = em("Por", T["concorda"])
T["cartazes"] = em("cartazes"); T["videos"] = em("vídeos"); T["artigos"] = em("artigos"); T["jornal"] = em("jornal", T["artigos"]); T["debates"] = em("debates")
T["proximo"] = em("No", T["debates"])
T["chega"] = em("Chega")
T["bv"] = em("Sejam"); T["lufa0"] = em("Coletivo"); T["resist"] = em("resistência"); T["problemas"] = em("problemas")
T["ouvir"] = em("quem", T["debates"]); T["militante"] = em("militante", T["proximo"])
T["logo"] = round(P[-1][2] + 0.9, 3)
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
        if p[0][-1] in ".,?!:" or longa or pausa:
            linhas.append({"t0": round(atual[0][1], 3), "t1": round(p[2], 3), "p": [[w, round(t0, 3)] for w, t0, _ in atual]})
            atual = []
    for a, b in zip(linhas, linhas[1:]):
        a["t1"] = round(min(b["t0"], a["t1"] + 0.8), 3)
    linhas[-1]["t1"] += 0.8
    return linhas

LEG = legendas(P)
(RAIZ / "motor" / "cenas" / "tutorial-01.tempos.js").write_text(
    "// GERADO por audio/tutorial-01/montar.py — não editar à mão\nwindow.TEMPOS = " +
    json.dumps({"dur": T["dur"], "marcas": T, "legendas": LEG}, ensure_ascii=False) + ";\n")

# ---------------------------------------------------------------- voz
raw = subprocess.run(["ffmpeg", "-loglevel", "error", "-i", str(AQUI / "narracao" / "ep1.aac"), "-af",
                      "highpass=f=80,afftdn=nr=6:nf=-50,equalizer=f=3500:t=q:w=1.4:g=1.5,acompressor=threshold=-22dB:ratio=2.5:attack=8:release=160:makeup=1.5",
                      "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
v0 = np.frombuffer(raw, np.float32).copy()
N = int(T["dur"] * SR)
voz = np.zeros(N, np.float32); soma(voz, v0, O)

# ---------------------------------------------------------------- trilha: banda completa (identidade 6a)
E, G, A, C, D = 82.41, 98.0, 110.0, 65.41, 73.42
st = {k: np.zeros(N + SR * 4, np.float32) for k in ("bat", "baixo", "gE", "gD", "solo", "sinte")}
fx = np.zeros(N + SR * 4, np.float32)
# abertura (CARTAZ): golpes nos carimbos e acorde
for t0, nota in [(0.35, E), (0.95, G), (1.6, A)]: som.banda_golpe(st, t0, nota, 0.85, anel=0.35)
soma(st["sinte"], som.sinte([82.41, 123.5, 164.8], T["funda"] - 1.6, 0.3, brilho=1000, ataque=0.4), 1.6)
# fundação (ARQUIVO): verso abafado
som.banda_secao(st, T["funda"], T["somos"] - T["funda"], 104, ((E, 8), (C, 8)), "palm", 0.5, virar=True, seed=11)
soma(st["sinte"], som.sinte([82.41, 98.0, 123.5], T["somos"] - T["funda"], 0.25, brilho=800, ataque=1.0), T["funda"])
som.banda_golpe(st, T["data"] + 0.2, A, 0.7, anel=0.4)
# marxista e de esquerda radical (CARTAZ)
som.banda_golpe(st, T["somos"], E, 1.0, anel=0.9)
som.banda_secao(st, T["somos"] + 0.4, T["exist"] - T["somos"] - 0.4, 112, ((E, 8), (G, 4), (A, 4)), "palm", 0.62, virar=True, seed=12)
som.banda_golpe(st, T["radical1"], G, 0.9, anel=0.5)
# por que existimos: groove didático
som.banda_secao(st, T["exist"], T["base"] - T["exist"], 118, ((E, 8), (D, 4), (A, 4)), "pulo", 0.62, virar=True, seed=13)
som.banda_golpe(st, T["formar"], E, 0.9, anel=0.7)
# marxismo-leninismo (ARQUIVO firme)
som.banda_secao(st, T["base"], T["radical"] - T["base"], 108, ((E, 8), (C, 4), (D, 4)), "palm", 0.55, seed=14)
soma(st["sinte"], som.sinte([82.41, 123.5, 164.8], T["radical"] - T["base"], 0.25, brilho=900, ataque=0.8), T["base"])
som.banda_golpe(st, T["luta"], E, 0.85, anel=0.6)
# esquerda radical = raiz (CARTAZ → explicação)
som.banda_golpe(st, T["radical"], E, 1.0, anel=0.6)
som.banda_secao(st, T["radical"] + 0.5, T["popular"] - T["radical"] - 0.5, 112, ((E, 8), (G, 4), (D, 4)), "palm", 0.55, seed=15)
som.banda_golpe(st, T["raiz"], A, 0.95, anel=0.9)
# comunismo popular
som.banda_secao(st, T["popular"], T["comunica"] - T["popular"], 108, ((C, 8), (G, 8), (A, 8), (E, 8)), "palm", 0.5, seed=16)
soma(st["sinte"], som.sinte([110.0, 138.6, 164.8, 220.0], T["comunica"] - T["concorda"], 0.3, brilho=1300, ataque=0.6), T["concorda"])
soma(st["solo"], som.solo([(329.6, 0.3), (415.3, 0.3), (493.9, 0.3), (659.3, -1.6)], 0.5), T["concorda"] + 0.4)
# comunicação popular: refrão aberto
soma(st["bat"], som.virada(0.6, 0.8), T["comunica"] - 0.62)
som.banda_secao(st, T["comunica"], T["proximo"] - T["comunica"], 124, ((E, 8), (C, 8), (G, 8), (D, 8)), "aberto", 0.75, seed=17)
# próximo episódio e fim
for t0, nota in [(T["proximo"] + 0.1, E), (T["proximo"] + 0.5, G), (T["proximo"] + 0.9, A)]: som.banda_golpe(st, t0, nota, 0.9, anel=0.3)
soma(st["sinte"], som.sinte([110.0, 164.8, 220.0], T["logo"] - T["proximo"] - 1.0, 0.3, brilho=1100, ataque=0.3), T["proximo"] + 1.0)
som.banda_golpe(st, T["chega"], E, 1.0, anel=0.6)
som.banda_golpe(st, T["logo"], E, 1.0, anel=2.8)
soma(st["sinte"], som.sinte([82.41, 123.5, 164.8, 246.9], T["dur"] - T["logo"], 0.35, brilho=1100, ataque=0.4), T["logo"])

# efeitos
for k in range(3): soma(fx, som.carimbo_sfx(), 0.35 + k * 0.62, 0.7)
for x in ("funda", "somos", "exist", "base", "radical", "popular", "comunica", "proximo", "logo"): soma(fx, som.whoosh(), T[x] - 0.35, 0.55)
soma(fx, som.maquina(40, 0.04), T["data"], 0.4)
for x in ("leo", "duda"): soma(fx, som.papel(0.4), T[x], 0.7); soma(fx, som.tique(), T[x] + 0.35, 0.6)
soma(fx, som.carimbo_sfx(), T["uniao"], 0.6)
soma(fx, som.carimbo_sfx(), T["somos"] + 0.1, 0.9); soma(fx, som.carimbo_sfx(), T["radical1"], 0.8)
soma(fx, som.carimbo_sfx(), T["partido"] + 0.3, 0.7); soma(fx, som.tique(), T["trab"], 0.7)
for x in ("ideias", "direita", "capital", "formar"): soma(fx, som.maquina(16, 0.035), T[x], 0.35); soma(fx, som.tique(), T[x] + 0.6, 0.5)
soma(fx, som.carimbo_sfx(), T["formar"], 0.8)
for x in ("marx", "lenin"): soma(fx, som.papel(0.4), T[x], 0.7)
soma(fx, som.papel(0.6), T["luta"] - 0.3, 0.8); soma(fx, som.rabisco(0.45, 0.8), T["luta"] + 0.4, 0.5)
soma(fx, som.carimbo_sfx(), T["radical"] + 0.1, 0.9); soma(fx, som.negacao(), T["violencia"], 0.35)
soma(fx, som.riser(0.9), T["raiz"] - 0.8, 0.35); soma(fx, som.carimbo_sfx(), T["raiz"], 0.9); soma(fx, som.boom(), T["raiz"], 0.4)
soma(fx, som.negacao(), T["analg"], 0.3)
for x in ("moradia", "emprego", "alim"): soma(fx, som.tique(), T[x], 0.6)
soma(fx, som.carimbo_sfx(), T["nunca"] + 0.3, 0.7)
for x in ("cartazes", "videos", "artigos", "jornal", "debates"): soma(fx, som.tique(), T[x], 0.7)
for k in range(3): soma(fx, som.carimbo_sfx(), T["proximo"] + 0.1 + k * 0.4, 0.8)
soma(fx, som.carimbo_sfx(), T["chega"], 0.9)
soma(fx, som.carimbo_sfx(), T["logo"], 0.8); soma(fx, som.sino_grave(), T["logo"] - 0.1, 0.9)

# mixagem da banda (mesma do EP. 1 da série)
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
print("dur", T["dur"], "| marcas", {k: T[k] for k in ("funda", "somos", "exist", "base", "radical", "popular", "comunica", "proximo", "logo")})
