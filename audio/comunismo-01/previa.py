"""Trilha + efeitos da PRÉVIA (sem narração) de "Desmistificando o Comunismo · EP. 1: O que é o comunismo?".
A cena começa na vinheta (música própria: audio/serie-comunismo/vinheta.py, colada em t = 0). Depois, a banda completa:
verso abafado e grave nas fábricas → verso firme em Marx/Engels/Manifesto → paradas em "quem trabalha × quem é dono" →
groove didático na padaria → refrão aberto em "meios de produção × o que é seu" → golpes no próximo episódio → acorde final.
O gancho do Jones Manoel (0–16,3 s) fica numa moldura na cena; o vídeo e o áudio dele entram na montagem (juntar.sh). `trilha(T, N)` devolve (música estéreo, efeitos estéreo).
"""
import sys
from pathlib import Path

import numpy as np

AQUI = Path(__file__).resolve().parent
sys.path.insert(0, str(AQUI.parent.parent / "motor"))
sys.path.insert(0, str(AQUI.parent / "serie-comunismo"))
import som  # noqa: E402
from som import SR, soma  # noqa: E402
from vinheta import vinheta, DUR as DUR_VIN  # noqa: E402

J = 16.3   # o gancho do Jones (o áudio dele entra na montagem: juntar.sh)
T = dict(vin=J + 0.4, fab=J + 3.9, tear=J + 5.4, crianca=J + 6.8, lei=J + 8.2, marx=J + 10.8, engels=J + 11.5, manif=J + 13.0, frase=J + 14.8,
         sel=J + 16.8, classes=J + 19.0, dono=J + 20.0, padaria=J + 21.4, paes=J + 22.2, nenhum=J + 24.8, leva=J + 26.0,
         salario=J + 27.6, lucro=J + 28.4, semdono=J + 29.8, sempadeiro=J + 31.4, indisp=J + 32.8, objetivo=J + 35.0, capital=J + 37.0, supera=J + 39.2, semclasses=J + 40.8,
         meios=J + 44.8, seu=J + 47.4, iphone=J + 49.4, proximo=J + 52.8, logo=J + 56.4, dur=J + 60.0)
E, G, A, C, D, B = 82.41, 98.0, 110.0, 65.41, 73.42, 61.74


def trilha(T, N):
    dur = N / SR
    st = {k: np.zeros(N + SR * 4, np.float32) for k in ("bat", "baixo", "gE", "gD", "solo", "sinte")}
    fx = np.zeros(N + SR * 4, np.float32)
    # gancho do Jones: só um fundo grave e baixo (a fala dele manda)
    soma(st["sinte"], som.sinte([82.41, 123.5, 164.8], T["vin"] - 0.2, 0.12, brilho=600, ataque=1.5), 0)
    # fábricas: verso abafado, lento, com sinte grave (a dureza do trabalho)
    som.banda_secao(st, T["fab"], T["marx"] - T["fab"], 100, ((E, 8), (C, 8)), "palm", 0.5, virar=True, seed=1)
    soma(st["sinte"], som.sinte([82.41, 98.0, 123.5], T["marx"] - T["fab"], 0.3, brilho=800, ataque=1.0), T["fab"])
    som.banda_golpe(st, T["lei"], A, 0.8, anel=0.5)
    # Marx, Engels e o Manifesto: verso firme; golpe na "luta de classes"
    som.banda_secao(st, T["marx"], T["classes"] - T["marx"], 112, ((E, 8), (G, 4), (A, 4)), "palm", 0.62, virar=True, seed=2)
    som.banda_golpe(st, T["sel"], E, 0.95, anel=0.8)
    # quem trabalha × quem é dono: paradas
    som.banda_golpe(st, T["classes"] + 0.1, E, 0.85, anel=0.3)
    som.banda_golpe(st, T["dono"] + 0.3, C, 0.9, anel=0.9)
    soma(st["bat"], som.virada(0.6, 0.8), T["padaria"] - 0.62)
    # a padaria: groove didático (contratempo)
    som.banda_secao(st, T["padaria"], T["meios"] - T["padaria"], 124, ((E, 8), (D, 4), (A, 4)), "pulo", 0.68, virar=True, seed=3)
    som.banda_golpe(st, T["lucro"], E, 0.9, anel=0.6)
    # "sem o dono, funciona; sem o padeiro, não sai um pão": a banda para no sem padeiro e volta no "quem trabalha"
    som.banda_golpe(st, T["semdono"] + 0.3, G, 0.8, anel=0.4)
    som.banda_golpe(st, T["indisp"], E, 1.0, anel=1.0)
    # o que é o comunismo: verso contido com sinte (a imagem de época), tensão no capitalismo, golpe no "superar",
    # e o acorde maior abrindo na "sociedade sem classes"
    som.banda_secao(st, T["objetivo"], T["supera"] - T["objetivo"], 112, ((E, 8), (C, 4), (D, 4)), "palm", 0.55, seed=5)
    soma(st["sinte"], som.sinte([82.41, 123.5, 164.8], T["supera"] - T["objetivo"], 0.25, brilho=900, ataque=0.8), T["objetivo"])
    som.banda_golpe(st, T["supera"], E, 1.0, anel=1.2)
    soma(st["sinte"], som.sinte([110.0, 138.6, 164.8, 220.0], T["meios"] - T["semclasses"], 0.35, brilho=1300, ataque=0.6), T["semclasses"])
    soma(st["solo"], som.solo([(329.6, 0.3), (415.3, 0.3), (493.9, 0.3), (659.3, -1.6)], 0.55), T["semclasses"] + 0.6)
    som.banda_golpe(st, T["semclasses"] + 0.6, A, 0.85, anel=1.4)
    soma(st["bat"], som.virada(0.6, 0.8), T["meios"] - 0.62)
    # meios de produção × o que é seu: refrão aberto; golpe no "comunista pode ter iPhone, sim"
    som.banda_secao(st, T["meios"], T["proximo"] - T["meios"], 128, ((E, 8), (C, 8), (G, 8), (D, 8)), "aberto", 0.8, seed=4)
    som.banda_golpe(st, T["iphone"], E, 1.0, anel=0.7)
    col = 60 / 128 / 2
    soma(st["solo"], som.solo([(493.9, 2 * col), (440.0, col), (392.0, col), (440.0, 2 * col), (329.6, -4 * col)], 0.6), T["iphone"] + 0.6)
    # próximo episódio: golpes em cada carimbo
    for t0, nota in [(T["proximo"] + 0.1, E), (T["proximo"] + 0.4, G), (T["proximo"] + 0.6, A)]:
        som.banda_golpe(st, t0, nota, 0.9, anel=0.25)
    soma(st["sinte"], som.sinte([110.0, 164.8, 220.0], T["logo"] - T["proximo"] - 0.8, 0.3, brilho=1100, ataque=0.3), T["proximo"] + 0.8)
    # logo: acorde final
    som.banda_golpe(st, T["logo"], E, 1.0, anel=2.8)
    soma(st["sinte"], som.sinte([82.41, 123.5, 164.8, 246.9], dur - T["logo"], 0.35, brilho=1100, ataque=0.4), T["logo"])

    # efeitos
    soma(fx, som.whoosh(), T["fab"] - 0.35, 0.6)
    soma(fx, som.whoosh(0.4), T["tear"] - 0.1, 0.5); soma(fx, som.whoosh(0.4), T["crianca"] - 0.1, 0.5)
    for k in range(int((T["marx"] - T["fab"]) / 0.55)):                    # a máquina da fábrica batendo
        soma(fx, som.metal(110 + 20 * (k % 2), 0.4, 0.4), T["fab"] + 0.2 + k * 0.55, 0.18)
    soma(fx, som.passos(10, 0.3, 0.4), T["fab"] + 0.4, 0.4)
    soma(fx, som.tique(), T["crianca"], 0.8)
    soma(fx, som.papel(0.5), T["lei"], 0.8); soma(fx, som.carimbo_sfx(), T["lei"], 0.7)
    soma(fx, som.maquina(60, 0.03), T["lei"] + 0.4, 0.45)
    soma(fx, som.whoosh(), T["marx"] - 0.35, 0.6)
    for t0 in (T["marx"], T["engels"]):
        soma(fx, som.papel(0.4), t0, 0.7); soma(fx, som.tique(), t0 + 0.35, 0.7)
    soma(fx, som.whoosh(0.4), T["manif"] - 0.1, 0.5); soma(fx, som.papel(0.6), T["manif"], 0.9)
    soma(fx, som.maquina(50, 0.035), T["frase"], 0.5)
    soma(fx, som.rabisco(0.45, 0.8), T["sel"], 0.6); soma(fx, som.carimbo_sfx(), T["sel"], 0.6)
    soma(fx, som.whoosh(), T["classes"] - 0.35, 0.6); soma(fx, som.carimbo_sfx(), T["dono"] + 0.3, 0.9)
    soma(fx, som.whoosh(), T["padaria"] - 0.35, 0.6)
    soma(fx, som.contador(2.4, 30), T["paes"], 0.4)
    soma(fx, som.carimbo_sfx(), T["nenhum"], 0.8); soma(fx, som.negacao(), T["nenhum"] + 0.05, 0.3)
    soma(fx, som.passos(3, 0.25, 0.5), T["leva"] - 0.3, 0.6); soma(fx, som.whoosh(0.6), T["leva"], 0.5)
    soma(fx, som.metal(1200, 0.5, 0.5), T["salario"] + 0.6, 0.35)          # a moedinha
    soma(fx, som.carimbo_sfx(), T["lucro"], 0.9); soma(fx, som.boom(), T["lucro"], 0.4)
    soma(fx, som.passos(3, 0.2, 0.5), T["semdono"], 0.5); soma(fx, som.carimbo_sfx(), T["semdono"] + 0.3, 0.7)
    soma(fx, som.passos(3, 0.2, 0.5), T["sempadeiro"], 0.5); soma(fx, som.negacao(), T["sempadeiro"] + 0.3, 0.45)
    soma(fx, som.carimbo_sfx(), T["sempadeiro"] + 0.3, 0.7); soma(fx, som.carimbo_sfx(), T["indisp"], 1.0); soma(fx, som.boom(), T["indisp"], 0.5)
    soma(fx, som.whoosh(), T["objetivo"] - 0.35, 0.6); soma(fx, som.papel(0.5), T["objetivo"], 0.7)
    soma(fx, som.whoosh(0.5), T["capital"], 0.5); soma(fx, som.tique(), T["capital"] + 0.35, 0.8)
    soma(fx, som.carimbo_sfx(), T["supera"], 1.0); soma(fx, som.boom(), T["supera"], 0.5)
    soma(fx, som.riser(0.9), T["semclasses"] - 0.3, 0.4); soma(fx, som.carimbo_sfx(), T["semclasses"] + 0.6, 0.9)
    soma(fx, som.multidao(2.5, 0.6), T["semclasses"] + 0.8, 0.35)
    soma(fx, som.whoosh(), T["meios"] - 0.35, 0.6)
    for t0 in (T["meios"], T["seu"]):
        for k in range(4):
            soma(fx, som.tique(), t0 + 0.4 + k * 0.2, 0.6)
        soma(fx, som.carimbo_sfx(), t0 + 1.4, 0.6)
    soma(fx, som.carimbo_sfx(), T["iphone"], 1.0); soma(fx, som.boom(), T["iphone"], 0.6)
    soma(fx, som.whoosh(), T["proximo"] - 0.35, 0.7)
    for k in range(3):
        soma(fx, som.carimbo_sfx(), T["proximo"] + 0.1 + k * 0.25, 0.8)
    soma(fx, som.whoosh(), T["logo"] - 0.35, 0.6); soma(fx, som.carimbo_sfx(), T["logo"], 0.8)
    soma(fx, som.sino_grave(), T["logo"] - 0.1, 0.9)

    # mixagem (mesma da banda completa) + vinheta colada no começo
    N4 = N
    esq = np.zeros(N4, np.float32); dir_ = np.zeros(N4, np.float32); rev = np.zeros(N4, np.float32)
    ganhos = dict(bat=0.85, baixo=0.6, gE=0.42, gD=0.42, solo=0.5, sinte=0.45)
    panos = dict(bat=0.0, baixo=0.0, gE=-0.75, gD=0.75, solo=0.2, sinte=0.0)
    envio = dict(bat=0.12, baixo=0.0, gE=0.15, gD=0.15, solo=0.35, sinte=0.4)
    for k, x in st.items():
        x = som.fpa(x[:N4], 50 if k != "baixo" else 38, 3) * ganhos[k]
        l, r = som.pan(x, panos[k]); esq += l; dir_ += r; rev += x * envio[k]
    rl, rr = som.reverb(rev, 1.9)
    esq += rl * 0.55; dir_ += rr * 0.55
    esq, dir_ = som.comprimir(esq, 0.3, 2.5), som.comprimir(dir_, 0.3, 2.5)
    esq, dir_ = esq + som.fpa(esq, 2500) * 0.35, dir_ + som.fpa(dir_, 2500) * 0.35
    ve, vd = vinheta()                                                         # já mixada e normalizada
    g = np.sqrt(np.mean(esq[int(T["fab"] * SR):int(T["marx"] * SR)] ** 2)) / max(np.sqrt(np.mean(ve ** 2)), 1e-9) * 1.4
    soma(esq, ve * g, T["vin"]); soma(dir_, vd * g, T["vin"])
    f = fx[:N4]
    fl, fr = som.reverb(f * 0.4, 1.2, seed=9)
    return (esq, dir_), (f + fl * 0.5, f + fr * 0.5)


if __name__ == "__main__":
    N = int(T["dur"] * SR)
    (me, md), (fe, fd) = trilha(T, N)
    ge, gd = me * 0.5 + fe * 0.42, md * 0.5 + fd * 0.42
    pico = max(np.abs(ge).max(), np.abs(gd).max())
    ge, gd = ge / pico * 0.89, gd / pico * 0.89
    lim = lambda x: np.where(np.abs(x) > 0.7, np.sign(x) * (0.7 + 0.29 * np.tanh((np.abs(x) - 0.7) / 0.29)), x).astype(np.float32)
    som.salvar_wav(str(AQUI / "previa.wav"), lim(ge), lim(gd))
    print("ok", T["dur"])
