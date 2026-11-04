"""Trilha + efeitos da PRÉVIA (sem narração) de "Desmistificando o Comunismo · EP. 2: O que é o socialismo?" (roteiro v2).
Mesma linguagem do EP. 1: fundo baixo sob o gancho do Jones (o áudio dele entra no juntar.sh) → vinheta (música própria,
audio/serie-comunismo/vinheta.py) → golpes no CARTAZ → verso calmo na origem da palavra → verso firme em Marx e Engels →
groove didático na escada → refrão aberto no último degrau com a guitarra solo → golpes no próximo episódio → acorde final.
`trilha(T, N)` devolve (música, efeitos) em estéreo.
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

J = 14.35  # fim do gancho do Jones
J0 = J + 0.4
T = dict(vin=J0, nenhum=J0 + 3.7, urss=J0 + 5.8, sel=J0 + 8.2,
         origem=J0 + 10.3, franca=J0 + 12.0, utopicos=J0 + 14.0, utopico=J0 + 17.0, plano=J0 + 19.5,
         cientifico=J0 + 22.9, engels=J0 + 23.5, cient=J0 + 26.2, luta=J0 + 28.6, e88=J0 + 32.4, sel88=J0 + 37.4,
         escada=J0 + 41.9, sobe=J0 + 44.0, selo1=J0 + 45.4, selo2=J0 + 47.2, selo3=J0 + 49.2,
         topo=J0 + 52.5, fartura=J0 + 54.0, marx=J0 + 54.8, paises=J0 + 58.2, proximo=J0 + 62.6, logo=J0 + 66.4, dur=J0 + 70.0)
E, G, A, C, D, B = 82.41, 98.0, 110.0, 65.41, 73.42, 61.74


def trilha(T, N):
    dur = N / SR
    st = {k: np.zeros(N + SR * 4, np.float32) for k in ("bat", "baixo", "gE", "gD", "solo", "sinte")}
    fx = np.zeros(N + SR * 4, np.float32)
    # sob o Jones: só um fundo baixo de sinte
    soma(st["sinte"], som.sinte([82.41, 123.5, 164.8], T["vin"] - 0.2, 0.12, brilho=600, ataque=1.5), 0)
    # CARTAZ: golpes nos carimbos, verso tenso sob o nome da URSS, golpe no "SOCIALISTAS"
    for k, nota in enumerate([E, G, A]):
        som.banda_golpe(st, T["nenhum"] + k * 0.3, nota, 0.9, anel=0.25 if k < 2 else 0.9)
    som.banda_secao(st, T["urss"], T["origem"] - T["urss"], 120, ((E, 8), (E, 4), (G, 4)), "tensao", 0.55, seed=1)
    som.banda_golpe(st, T["sel"], E, 1.0, anel=1.0)
    # a origem da palavra e os utópicos: verso calmo
    som.banda_secao(st, T["origem"], T["cientifico"] - T["origem"], 104, ((A, 8), (G, 4), (E, 4)), "palm", 0.45, virar=True, seed=2)
    som.banda_golpe(st, T["utopico"], A, 0.85, anel=0.6)
    soma(st["sinte"], som.sinte([110.0, 164.8, 220.0], T["cientifico"] - T["utopicos"], 0.2, brilho=800, ataque=0.8), T["utopicos"])
    # Marx e Engels: verso firme
    som.banda_secao(st, T["cientifico"], T["escada"] - T["cientifico"], 116, ((E, 8), (G, 4), (A, 4)), "palm", 0.62, virar=True, seed=3)
    som.banda_golpe(st, T["cient"], E, 0.95, anel=0.7)
    som.banda_golpe(st, T["luta"], G, 0.9, anel=0.6)
    som.banda_golpe(st, T["sel88"] + 0.4, A, 0.85, anel=0.6)
    # a escada: groove didático, golpe em cada selo
    som.banda_secao(st, T["escada"], T["topo"] - T["escada"], 124, ((E, 8), (D, 4), (A, 4)), "pulo", 0.68, virar=True, seed=4)
    som.banda_golpe(st, T["sobe"] + 1.0, A, 0.9, anel=0.6)
    for k, nota in enumerate([E, G, A]):
        som.banda_golpe(st, T[f"selo{k + 1}"], nota, 0.8, anel=0.4)
    # o último degrau: refrão aberto + tema na guitarra solo
    som.banda_secao(st, T["topo"], T["proximo"] - T["topo"], 128, ((E, 8), (C, 8), (G, 8), (D, 8)), "aberto", 0.8, seed=5)
    soma(st["solo"], som.solo([(329.6, 0.25), (392.0, 0.25), (440.0, 0.25), (493.9, 0.4), (659.3, -1.4)], 0.6), T["topo"] + 0.9)
    som.banda_golpe(st, T["paises"] + 1.9, E, 0.95, anel=0.7)
    for t0, nota in [(T["proximo"] + 0.1, E), (T["proximo"] + 0.4, G), (T["proximo"] + 0.6, A)]:
        som.banda_golpe(st, t0, nota, 0.9, anel=0.25)
    soma(st["sinte"], som.sinte([110.0, 164.8, 220.0], T["logo"] - T["proximo"] - 0.8, 0.3, brilho=1100, ataque=0.3), T["proximo"] + 0.8)
    som.banda_golpe(st, T["logo"], E, 1.0, anel=2.8)
    soma(st["sinte"], som.sinte([82.41, 123.5, 164.8, 246.9], dur - T["logo"], 0.35, brilho=1100, ataque=0.4), T["logo"])

    # efeitos
    soma(fx, som.whoosh(), T["nenhum"] - 0.35, 0.6)
    for k in range(3):
        soma(fx, som.carimbo_sfx(), T["nenhum"] + k * 0.3, 0.8)
    soma(fx, som.whoosh(), T["urss"] - 0.1, 0.5); soma(fx, som.papel(0.5), T["urss"], 0.7)
    soma(fx, som.maquina(40, 0.035), T["urss"] + 0.4, 0.5)
    soma(fx, som.rabisco(0.5, 0.8), T["sel"], 0.7); soma(fx, som.boom(), T["sel"], 0.5)
    soma(fx, som.whoosh(), T["origem"] - 0.35, 0.6); soma(fx, som.papel(0.5), T["origem"], 0.7)
    soma(fx, som.maquina(50, 0.03), T["origem"] + 0.3, 0.45); soma(fx, som.maquina(50, 0.03), T["franca"], 0.45)
    soma(fx, som.rabisco(0.4, 0.7), T["franca"] + 1.4, 0.6)
    soma(fx, som.whoosh(0.5), T["utopicos"] - 0.1, 0.5)
    for k in range(3):
        soma(fx, som.tique(), T["utopicos"] + 0.6 + k * 0.6, 0.6)
    soma(fx, som.carimbo_sfx(), T["utopico"], 0.8); soma(fx, som.carimbo_sfx(), T["plano"], 0.7)
    soma(fx, som.whoosh(), T["cientifico"] - 0.35, 0.6)
    soma(fx, som.tique(), T["cientifico"] + 0.5, 0.6); soma(fx, som.tique(), T["engels"] + 0.3, 0.6)
    soma(fx, som.carimbo_sfx(), T["cient"], 0.9); soma(fx, som.carimbo_sfx(), T["luta"], 0.9)
    soma(fx, som.papel(0.5), T["e88"] + 0.3, 0.7); soma(fx, som.maquina(80, 0.03), T["e88"] + 0.7, 0.45)
    soma(fx, som.rabisco(0.8, 0.7), T["sel88"], 0.6)
    soma(fx, som.whoosh(), T["escada"] - 0.35, 0.6)
    for k in range(3):
        soma(fx, som.estaca(0.7), T["escada"] + 0.2 + k * 0.3, 0.45)
    soma(fx, som.passos(3, 0.25, 0.5), T["sobe"], 0.6)
    for k in range(3):
        soma(fx, som.carimbo_sfx(), T[f"selo{k + 1}"], 0.75)
    soma(fx, som.whoosh(), T["topo"] - 0.35, 0.6); soma(fx, som.passos(3, 0.25, 0.5), T["topo"] + 0.2, 0.6)
    soma(fx, som.riser(0.8), T["topo"] + 0.2, 0.4); soma(fx, som.multidao(2.0, 0.5), T["fartura"], 0.3)
    soma(fx, som.papel(0.5), T["marx"], 0.7)
    for k in range(4):
        soma(fx, som.tique(), T["paises"] + 0.4 + k * 0.3, 0.8)
    soma(fx, som.carimbo_sfx(), T["paises"] + 1.9, 0.9)
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
    g = np.sqrt(np.mean(esq[int(T["escada"] * SR):int(T["topo"] * SR)] ** 2)) / max(np.sqrt(np.mean(ve ** 2)), 1e-9) * 1.4
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
