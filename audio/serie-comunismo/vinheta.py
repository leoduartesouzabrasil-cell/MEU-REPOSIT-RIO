"""Música própria da vinheta "DESMISTIFICANDO O COMUNISMO · com Léo Duarte" (3,5 s), só para essa vinheta.
Fanfarra de rock (banda completa de motor/som.py): cada carimbo da tela leva um golpe da banda, subindo E → G → A → B,
e no "EP." a guitarra solo toca o tema curto da série (mi–sol–lá–si–mi) sobre o acorde final soando.
Tempos = carimbos de motor/cenas/serie-comunismo-logo.js. `vinheta()` devolve (esq, dir); rodar gera vinheta.wav.
"""
import sys
from pathlib import Path

import numpy as np

AQUI = Path(__file__).resolve().parent
sys.path.insert(0, str(AQUI.parent.parent / "motor"))
import som  # noqa: E402
from som import SR, soma  # noqa: E402

DUR = 3.5
E, G, A, B = 82.41, 98.0, 110.0, 123.47
T = dict(estrela=0.0, foice=0.15, desm=0.35, comun=0.55, leo=0.85, ep=1.2)


def vinheta():
    N = int(DUR * SR) + SR
    st = {k: np.zeros(N, np.float32) for k in ("bat", "baixo", "gE", "gD", "solo", "sinte")}
    fx = np.zeros(N, np.float32)
    # golpes da banda subindo (um por carimbo)
    som.banda_golpe(st, T["estrela"], E, 0.9, anel=0.3)
    soma(st["bat"], som.tom(150, 0.9), T["foice"]); soma(st["bat"], som.tom(110, 0.9), T["foice"] + 0.08)
    som.banda_golpe(st, T["desm"], G, 0.9, anel=0.2)
    som.banda_golpe(st, T["comun"], A, 1.0, anel=0.28)
    soma(st["bat"], som.virada(0.3, 0.8), T["comun"] + 0.3)
    som.banda_golpe(st, T["leo"], B, 0.95, anel=0.32)
    # acorde final soando + tema da série na guitarra solo
    som.banda_golpe(st, T["ep"], E, 1.0, anel=2.1)
    soma(st["bat"], som.crash(0.9, 2.3), T["ep"])
    tema = [(329.6, 0.11), (392.0, 0.11), (440.0, 0.11), (493.9, 0.2), (659.3, -1.3)]
    soma(st["solo"], som.solo(tema, 0.8), T["ep"] + 0.02)
    soma(st["sinte"], som.sinte([164.8, 246.9, 329.6], DUR - T["ep"], 0.35, brilho=1300, ataque=0.25), T["ep"])
    # efeitos: carimbos, subida antes do COMUNISMO, sino no fim
    for k in ("estrela", "desm", "comun", "leo"):
        soma(fx, som.carimbo_sfx(), T[k], 0.8)
    soma(fx, som.boom(), T["estrela"], 0.5); soma(fx, som.boom(), T["comun"], 0.6)
    soma(fx, som.riser(0.5), T["comun"] - 0.5, 0.4)
    soma(fx, som.tique(), T["ep"] + 0.05, 0.8)
    soma(fx, som.sino_grave(), T["ep"] + 0.6, 0.5)

    ganhos = dict(bat=0.85, baixo=0.6, gE=0.45, gD=0.45, solo=0.55, sinte=0.4)
    panos = dict(bat=0.0, baixo=0.0, gE=-0.75, gD=0.75, solo=0.15, sinte=0.0)
    envio = dict(bat=0.12, baixo=0.0, gE=0.15, gD=0.15, solo=0.35, sinte=0.4)
    esq = np.zeros(N, np.float32); dir_ = np.zeros(N, np.float32); rev = np.zeros(N, np.float32)
    for k, x in st.items():
        x = som.fpa(x, 50 if k != "baixo" else 38, 3) * ganhos[k]
        l, r = som.pan(x, panos[k]); esq += l; dir_ += r; rev += x * envio[k]
    rl, rr = som.reverb(rev + fx * 0.3, 1.6)
    esq += rl * 0.55 + fx * 0.7; dir_ += rr * 0.55 + fx * 0.7
    esq, dir_ = esq + som.fpa(esq, 2500) * 0.3, dir_ + som.fpa(dir_, 2500) * 0.3
    n = int(DUR * SR); f = int(0.35 * SR)
    esq, dir_ = esq[:n], dir_[:n]
    esq[-f:] *= np.linspace(1, 0, f); dir_[-f:] *= np.linspace(1, 0, f)          # some no fim da vinheta
    pico = max(np.abs(esq).max(), np.abs(dir_).max())
    lim = lambda x: np.where(np.abs(x) > 0.7, np.sign(x) * (0.7 + 0.29 * np.tanh((np.abs(x) - 0.7) / 0.29)), x).astype(np.float32)
    return lim(esq / pico * 0.9), lim(dir_ / pico * 0.9)


if __name__ == "__main__":
    e, d = vinheta()
    som.salvar_wav(str(AQUI / "vinheta.wav"), e, d)
    print("ok", DUR)
