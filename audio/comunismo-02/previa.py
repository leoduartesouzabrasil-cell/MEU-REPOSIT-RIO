"""Trilha + efeitos da PRÉVIA (sem narração) de "Desmistificando o Comunismo · EP. 2: O que é o socialismo?".
Mesma linguagem do EP. 1: gancho CARTAZ com golpes da banda → vinheta (música própria, audio/serie-comunismo/vinheta.py) →
verso firme na escada (subida no degrau do socialismo) e em Lênin → groove didático na padaria → refrão aberto no último degrau
(o comunismo) com a guitarra solo → golpes no próximo episódio → acorde final. `trilha(T, N)` devolve (música, efeitos) em estéreo.
"""
import sys
from pathlib import Path

import numpy as np

AQUI = Path(__file__).resolve().parent
sys.path.insert(0, str(AQUI.parent.parent / "motor"))
sys.path.insert(0, str(AQUI.parent / "serie-comunismo"))
import som  # noqa: E402
from som import SR, soma  # noqa: E402
from vinheta import vinheta  # noqa: E402

T = dict(nenhum=0.3, urss=2.4, sel=4.8, vin=6.6, escada=10.1, sobe=13.0, lenin=15.6,
         padaria=21.0, todos=22.0, bairro=24.0, trabalho=26.6, topo=29.4, fartura=31.2, marx=32.6, paises=36.0,
         proximo=39.6, logo=43.2, dur=46.8)
E, G, A, C, D, B = 82.41, 98.0, 110.0, 65.41, 73.42, 61.74


def trilha(T, N):
    dur = N / SR
    st = {k: np.zeros(N + SR * 4, np.float32) for k in ("bat", "baixo", "gE", "gD", "solo", "sinte")}
    fx = np.zeros(N + SR * 4, np.float32)
    # gancho: golpes nos carimbos, verso tenso sob o nome da URSS, golpe no "SOCIALISTAS"
    for k, nota in enumerate([E, G, A]):
        som.banda_golpe(st, T["nenhum"] + k * 0.3, nota, 0.9, anel=0.25 if k < 2 else 0.9)
    som.banda_secao(st, T["urss"], T["vin"] - T["urss"] - 0.3, 120, ((E, 8), (E, 4), (G, 4)), "tensao", 0.55, seed=1)
    som.banda_golpe(st, T["sel"], E, 1.0, anel=1.0)
    # escada e Lênin: verso firme; golpe na subida
    som.banda_secao(st, T["escada"], T["padaria"] - T["escada"], 112, ((E, 8), (G, 4), (A, 4)), "palm", 0.6, virar=True, seed=2)
    som.banda_golpe(st, T["sobe"] + 1.0, A, 0.9, anel=0.8)
    soma(st["sinte"], som.sinte([82.41, 123.5, 164.8], T["padaria"] - T["lenin"], 0.25, brilho=900, ataque=0.8), T["lenin"])
    # padaria: groove didático
    som.banda_secao(st, T["padaria"], T["topo"] - T["padaria"], 124, ((E, 8), (D, 4), (A, 4)), "pulo", 0.68, virar=True, seed=3)
    som.banda_golpe(st, T["todos"] + 0.2, G, 0.85, anel=0.5)
    som.banda_golpe(st, T["trabalho"] + 0.8, E, 0.9, anel=0.6)
    # o último degrau: refrão aberto + tema na guitarra solo
    som.banda_secao(st, T["topo"], T["proximo"] - T["topo"], 128, ((E, 8), (C, 8), (G, 8), (D, 8)), "aberto", 0.8, seed=4)
    soma(st["solo"], som.solo([(329.6, 0.25), (392.0, 0.25), (440.0, 0.25), (493.9, 0.4), (659.3, -1.4)], 0.6), T["topo"] + 0.9)
    som.banda_golpe(st, T["paises"] + 1.6, E, 0.95, anel=0.7)
    for t0, nota in [(T["proximo"] + 0.1, E), (T["proximo"] + 0.4, G), (T["proximo"] + 0.6, A)]:
        som.banda_golpe(st, t0, nota, 0.9, anel=0.25)
    soma(st["sinte"], som.sinte([110.0, 164.8, 220.0], T["logo"] - T["proximo"] - 0.8, 0.3, brilho=1100, ataque=0.3), T["proximo"] + 0.8)
    som.banda_golpe(st, T["logo"], E, 1.0, anel=2.8)
    soma(st["sinte"], som.sinte([82.41, 123.5, 164.8, 246.9], dur - T["logo"], 0.35, brilho=1100, ataque=0.4), T["logo"])

    # efeitos
    for k in range(3):
        soma(fx, som.carimbo_sfx(), T["nenhum"] + k * 0.3, 0.8)
    soma(fx, som.whoosh(), T["urss"] - 0.1, 0.5); soma(fx, som.papel(0.5), T["urss"], 0.7)
    soma(fx, som.maquina(40, 0.035), T["urss"] + 0.4, 0.5)
    soma(fx, som.rabisco(0.5, 0.8), T["sel"], 0.7); soma(fx, som.boom(), T["sel"], 0.5)
    soma(fx, som.whoosh(), T["escada"] - 0.35, 0.6)
    for k in range(3):
        soma(fx, som.estaca(0.7), T["escada"] + 0.2 + k * 0.3, 0.45)
    soma(fx, som.passos(3, 0.25, 0.5), T["sobe"], 0.6); soma(fx, som.carimbo_sfx(), T["sobe"] + 1.0, 0.7)
    soma(fx, som.whoosh(0.5), T["lenin"] - 0.1, 0.5); soma(fx, som.papel(0.5), T["lenin"] + 0.8, 0.7)
    soma(fx, som.maquina(60, 0.03), T["lenin"] + 1.2, 0.45); soma(fx, som.rabisco(0.4, 0.7), T["lenin"] + 2.8, 0.6)
    soma(fx, som.whoosh(), T["padaria"] - 0.35, 0.6)
    soma(fx, som.whoosh(0.4), T["todos"], 0.5); soma(fx, som.carimbo_sfx(), T["todos"] + 0.2, 0.7)
    for k in range(9):
        soma(fx, som.tique(), T["bairro"] + k * 0.18 + 0.7, 0.5)
    for k in range(3):
        soma(fx, som.metal(1200, 0.4, 0.4), T["trabalho"] + k * 0.2 + 0.5, 0.3)
    soma(fx, som.carimbo_sfx(), T["trabalho"] + 0.8, 0.9)
    soma(fx, som.whoosh(), T["topo"] - 0.35, 0.6); soma(fx, som.passos(3, 0.25, 0.5), T["topo"] + 0.2, 0.6)
    soma(fx, som.riser(0.8), T["topo"] + 0.2, 0.4); soma(fx, som.multidao(2.0, 0.5), T["fartura"], 0.3)
    soma(fx, som.papel(0.5), T["marx"], 0.7)
    for k in range(3):
        soma(fx, som.tique(), T["paises"] + 0.4 + k * 0.3, 0.8)
    soma(fx, som.carimbo_sfx(), T["paises"] + 1.6, 0.9)
    soma(fx, som.whoosh(), T["proximo"] - 0.35, 0.7)
    for k in range(3):
        soma(fx, som.carimbo_sfx(), T["proximo"] + 0.1 + k * 0.25, 0.8)
    soma(fx, som.whoosh(), T["logo"] - 0.35, 0.6); soma(fx, som.carimbo_sfx(), T["logo"], 0.8)
    soma(fx, som.sino_grave(), T["logo"] - 0.1, 0.9)

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
    ve, vd = vinheta()
    g = np.sqrt(np.mean(esq[int(T["escada"] * SR):int(T["padaria"] * SR)] ** 2)) / max(np.sqrt(np.mean(ve ** 2)), 1e-9) * 1.4
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
