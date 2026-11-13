"""Trilha + efeitos de "5 curiosidades da China". `trilha(T, N)` devolve (música estéreo, efeitos estéreo).
Gancho em CARTAZ tenso ("na China ser cristão é proibido?") → a banda PARA com disco arranhado ("mentira") → groove leve e irônico
no desmentido → virada e golpe no "5 curiosidades" → groove didático (#1 e #2) → verso de documentário (#3 e #4) →
refrão aberto no #5 (CARTAZ) → golpes no "comenta aqui" → acorde final no logo.
"""
import sys
from pathlib import Path

import numpy as np

AQUI = Path(__file__).resolve().parent
sys.path.insert(0, str(AQUI.parent.parent / "motor"))
import som  # noqa: E402
from som import SR, soma  # noqa: E402

# marcas de exemplo (a montagem usa as do tempo da fala)
T = dict(gancho=0.3, proibido=3.6, corte=4.4, mentira=5.4, cinco=21.0, n1=23.2, n2=37.0, n3=45.0, n4=55.0, ultimo=66.0, n5=67.5,
         carimbo=6.8, alemanha=73.0, comenta=75.5, logo=81.0, dur=84.4)
E, G, A, C, D, B = 82.41, 98.0, 110.0, 65.41, 73.42, 61.74


def trilha(T, N):
    dur = N / SR
    st = {k: np.zeros(N + SR * 4, np.float32) for k in ("bat", "baixo", "gE", "gD", "solo", "sinte")}
    fx = np.zeros(N + SR * 4, np.float32)
    # gancho: tensão (sinte grave + verso abafado), golpe no "proibido?" e a banda some no corte
    soma(st["sinte"], som.sinte([82.41, 87.31, 123.5], T["corte"] - T["gancho"], 0.35, brilho=700, ataque=0.4), T["gancho"])
    som.banda_secao(st, T["gancho"] + 0.4, T["proibido"] - T["gancho"] - 0.4, 96, ((E, 8), (E, 8)), "tensao", 0.5, seed=11)
    som.banda_golpe(st, T["proibido"], E, 1.0, anel=0.5)
    # "pegadinha do malandro, mentira": groove leve e irônico no desmentido
    som.banda_secao(st, T["mentira"], T["cinco"] - T["mentira"], 118, ((A, 8), (D, 4), (E, 4)), "pulo", 0.5, virar=True, seed=12)
    soma(st["bat"], som.virada(0.6, 0.8), T["cinco"] - 0.62)
    som.banda_golpe(st, T["cinco"], E, 1.0, anel=1.0)
    # #1 e #2: groove didático (pobreza, trem-bala)
    som.banda_secao(st, T["n1"], T["n3"] - T["n1"], 124, ((E, 8), (D, 4), (A, 4)), "pulo", 0.62, virar=True, seed=13)
    # #3 e #4: verso de documentário (1949, expectativa de vida, florestas) com sinte que abre no "hoje"
    som.banda_secao(st, T["n3"], T["ultimo"] - T["n3"], 112, ((E, 8), (C, 4), (D, 4)), "palm", 0.55, virar=True, seed=14)
    soma(st["sinte"], som.sinte([110.0, 138.6, 164.8, 220.0], T["ultimo"] - T["n4"], 0.3, brilho=1300, ataque=0.8), T["n4"])
    # "e por último…": a banda segura, sobe e explode no #5 (CARTAZ)
    soma(st["sinte"], som.sinte([82.41, 123.5, 164.8], T["n5"] - T["ultimo"], 0.3, brilho=900, ataque=0.3), T["ultimo"])
    soma(st["bat"], som.virada(0.6, 0.9), T["n5"] - 0.62)
    som.banda_secao(st, T["n5"], T["comenta"] - T["n5"], 128, ((E, 8), (C, 8), (G, 8), (D, 8)), "aberto", 0.8, seed=15)
    som.banda_golpe(st, T["n5"], E, 1.0, anel=0.8)
    som.banda_golpe(st, T["alemanha"], E, 1.0, anel=0.7)
    col = 60 / 128 / 2
    soma(st["solo"], som.solo([(493.9, 2 * col), (440.0, col), (392.0, col), (440.0, 2 * col), (329.6, -4 * col)], 0.6), T["alemanha"] + 0.6)
    # "comenta aqui": groove leve até o logo
    som.banda_secao(st, T["comenta"], T["logo"] - T["comenta"], 118, ((A, 8), (D, 4), (E, 4)), "pulo", 0.5, seed=16)
    som.banda_golpe(st, T["logo"], E, 1.0, anel=2.8)
    soma(st["sinte"], som.sinte([82.41, 123.5, 164.8, 246.9], dur - T["logo"], 0.35, brilho=1100, ataque=0.4), T["logo"])

    # efeitos
    soma(fx, som.riser(1.2), T["proibido"] - 1.2, 0.35)
    soma(fx, som.carimbo_sfx(), T["proibido"], 0.8); soma(fx, som.boom(), T["proibido"], 0.4)
    soma(fx, som.arranhao(0.7), T["corte"], 1.0)                                  # o disco arranha: corte seco
    soma(fx, som.boing(), T["mentira"], 0.9)                                      # o Sérgio Mallandro pula na tela
    soma(fx, som.whoosh(0.3), T["carimbo"] - 0.2, 0.5)                            # e sai correndo pro canto
    soma(fx, som.carimbo_sfx(), T["carimbo"], 1.0); soma(fx, som.negacao(), T["carimbo"] + 0.05, 0.35)   # carimbo "MENTIRA"
    soma(fx, som.contador(1.2, 16), T["mentira"] + 3.2, 0.35)                     # 40.000.000+
    soma(fx, som.maquina(40, 0.035), T["mentira"] + 8.0, 0.4)                     # a ficha datilografada das religiões
    soma(fx, som.riser(0.9), T["cinco"] - 0.9, 0.35); soma(fx, som.carimbo_sfx(), T["cinco"], 1.0); soma(fx, som.boom(), T["cinco"], 0.5)
    for k in ("n1", "n2", "n3", "n4"):
        soma(fx, som.whoosh(), T[k] - 0.35, 0.6); soma(fx, som.carimbo_sfx(), T[k] + 0.1, 0.8)
    soma(fx, som.contador(1.6, 24), T["n1"] + 1.6, 0.35)                          # 800 milhões
    soma(fx, som.whoosh(0.8), T["n2"] + 1.5, 0.45)                                # o trem passando
    soma(fx, som.relogio(2.0, 120), T["n3"] + 2.0, 0.3)                           # a régua de idade andando
    soma(fx, som.contador(1.2, 16), T["n4"] + 2.0, 0.3)                           # 8% → 25%
    soma(fx, som.riser(1.4), T["n5"] - 1.4, 0.4)
    soma(fx, som.carimbo_sfx(), T["n5"], 1.0); soma(fx, som.boom(), T["n5"], 0.6)
    soma(fx, som.contador(1.6, 24), T["n5"] + 1.0, 0.35)                          # 100.000.000
    soma(fx, som.carimbo_sfx(), T["alemanha"], 0.8); soma(fx, som.multidao(2.0, 0.6), T["alemanha"] + 0.3, 0.3)
    soma(fx, som.whoosh(), T["comenta"] - 0.35, 0.6)
    for k in range(5):                                                            # os 5 selos do resumo
        soma(fx, som.tique(), T["comenta"] + 0.5 + k * 0.25, 0.7)
    soma(fx, som.whoosh(), T["logo"] - 0.35, 0.6); soma(fx, som.carimbo_sfx(), T["logo"], 0.8)
    soma(fx, som.sino_grave(), T["logo"] - 0.1, 0.9)

    # mixagem da banda completa
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
    esq, dir_ = esq + som.fpa(esq, 2500) * 0.35, dir_ + som.fpa(dir_, 2500) * 0.35
    # o corte seco: a banda some entre o "proibido?" (depois do golpe) e o "mentira"
    t = np.arange(N) / SR
    corte = np.clip((t - T["corte"]) / 0.05, 0, 1) * np.clip((T["mentira"] - t) / 0.05, 0, 1)
    esq *= 1 - corte; dir_ *= 1 - corte
    f = fx[:N]
    fl, fr = som.reverb(f * 0.4, 1.2, seed=9)
    return (esq, dir_), (f + fl * 0.5, f + fr * 0.5)


if __name__ == "__main__":
    N = int(T["dur"] * SR)
    (me, md), (fe, fd) = trilha(T, N)
    ge, gd = me * 0.5 + fe * 0.42, md * 0.5 + fd * 0.42
    pico = max(np.abs(ge).max(), np.abs(gd).max())
    som.salvar_wav(str(AQUI / "previa.wav"), (ge / pico * 0.89).astype(np.float32), (gd / pico * 0.89).astype(np.float32))
    print("ok", T["dur"])
