"""Trilha + efeitos de "QUEM DISSE ISSO? A BÍBLIA OU O COMUNISMO?" (jogo de adivinhação).
Banda completa (motor/som.py): cartaz de abertura com golpes → groove leve e brincalhão nas rodadas (meia intensidade, a voz manda),
tique-taque na contagem 3-2-1 de cada rodada, golpe na resposta (grave para BÍBLIA, agudo para COMUNISTA, os dois na rodada 7) →
refrão aberto no placar → verso calmo no Engels → golpes no recado final → acorde no logo.
`trilha(T, N)` devolve (música, efeitos) em estéreo. Os tempos vêm do montar.py (marcas r1..r7, q, f, a, ref…).
"""
import sys
from pathlib import Path

import numpy as np

AQUI = Path(__file__).resolve().parent
sys.path.insert(0, str(AQUI.parent.parent / "motor"))
import som  # noqa: E402
from som import SR, soma  # noqa: E402

E, G, A, C, D, B = 82.41, 98.0, 110.0, 65.41, 73.42, 61.74
BIBLIA = {1, 3, 5}          # Tiago, Lucas, Atos (a 6ª está nos dois; 2 = Che, 4 = Marx)
N_RODADAS = 6


def trilha(T, N):
    dur = N / SR
    st = {k: np.zeros(N + SR * 4, np.float32) for k in ("bat", "baixo", "gE", "gD", "solo", "sinte")}
    fx = np.zeros(N + SR * 4, np.float32)
    # abertura (cartaz): golpes no título, verso tenso até a 1ª rodada
    for k, nota in enumerate([E, G]):
        som.banda_golpe(st, 0.4 + k * 0.35, nota, 0.9, anel=0.3 if k == 0 else 0.9)
    som.banda_secao(st, T["desafio"], T["r1"] - T["desafio"], 120, ((E, 8), (G, 4), (A, 4)), "tensao", 0.5, seed=1)
    som.banda_golpe(st, T["vamos"], A, 0.9, anel=0.6)
    # as rodadas: groove leve; na contagem a banda para e fica o relógio
    for k in range(1, N_RODADAS + 1):
        ini, fim_frase, resp = T[f"r{k}"], T[f"f{k}"], T[f"a{k}"]
        prox = T[f"r{k + 1}"] if k < N_RODADAS else T["placar"]
        som.banda_secao(st, ini, fim_frase - ini, 112, ((E, 8), (D, 4), (A, 4)) if k % 2 else ((G, 8), (D, 4), (E, 4)), "pulo", 0.45, seed=10 + k)
        soma(fx, som.relogio(max(resp - fim_frase, 0.3), bpm=120), fim_frase, 0.55)
        if k == N_RODADAS:
            som.banda_golpe(st, resp, E, 1.0, anel=0.6); som.banda_golpe(st, resp + 0.25, A, 1.0, anel=1.2)
        elif k in BIBLIA:
            som.banda_golpe(st, resp, E, 0.95, anel=1.0)
        else:
            som.banda_golpe(st, resp, A, 0.95, anel=1.0)
        som.banda_secao(st, resp + 0.3, prox - resp - 0.3, 112, ((E, 8), (G, 8)), "palm", 0.4, virar=True, seed=20 + k)
    # placar: refrão aberto + tema na guitarra solo
    som.banda_secao(st, T["placar"], T["proxima"] - T["placar"], 128, ((E, 8), (C, 8), (G, 8), (D, 8)), "aberto", 0.75, seed=4)
    soma(st["solo"], som.solo([(329.6, 0.25), (392.0, 0.25), (440.0, 0.25), (493.9, 0.4), (659.3, -1.2)], 0.55), T["placar"] + 0.6)
    # recado: firme, golpes no "lembra"
    som.banda_secao(st, T["proxima"], T["acertou"] - T["proxima"], 124, ((E, 8), (G, 4), (A, 4)), "pulo", 0.65, virar=True, seed=6)
    for k, nota in enumerate([E, G, A]):
        som.banda_golpe(st, T["lembra"] + k * 0.3, nota, 0.9, anel=0.3 if k < 2 else 0.9)
    som.banda_secao(st, T["acertou"], T["logo"] - T["acertou"], 128, ((G, 8), (D, 8)), "aberto", 0.7, seed=7)
    som.banda_golpe(st, T["logo"], E, 1.0, anel=2.8)
    soma(st["sinte"], som.sinte([82.41, 123.5, 164.8, 246.9], dur - T["logo"], 0.35, brilho=1100, ataque=0.4), T["logo"])

    # efeitos
    for k in range(2):
        soma(fx, som.carimbo_sfx(), 0.4 + k * 0.35, 0.8)
    soma(fx, som.carimbo_sfx(), T["desafio"] + 0.2, 0.6)
    for k in range(1, N_RODADAS + 1):
        soma(fx, som.whoosh(), T[f"r{k}"] - 0.35, 0.55)
        soma(fx, som.papel(0.5), T[f"r{k}"] + 0.1, 0.6)
        soma(fx, som.maquina(int((T[f"f{k}"] - T[f"q{k}"]) / 0.09), 0.09), T[f"q{k}"], 0.35)
        soma(fx, som.carimbo_sfx(), T[f"a{k}"], 0.9)
        soma(fx, som.check() if k in BIBLIA or k == N_RODADAS else som.boom(), T[f"a{k}"] + 0.05, 0.4)
        soma(fx, som.carimbo_sfx(), T[f"ref{k}"], 0.55)
    soma(fx, som.carimbo_sfx(), T["lenin6"], 0.6)
    soma(fx, som.whoosh(), T["placar"] - 0.35, 0.7); soma(fx, som.contador(1.0), T["placar"] + 0.4, 0.6)
    soma(fx, som.multidao(2.0, 0.5), T["placar"] + 1.4, 0.3)
    soma(fx, som.whoosh(), T["proxima"] - 0.35, 0.7)
    for k in range(3):
        soma(fx, som.carimbo_sfx(), T["lembra"] + k * 0.3, 0.8)
    soma(fx, som.whoosh(), T["acertou"] - 0.35, 0.7); soma(fx, som.carimbo_sfx(), T["acertou"] + 0.2, 0.8)
    soma(fx, som.whoosh(), T["logo"] - 0.35, 0.6); soma(fx, som.carimbo_sfx(), T["logo"], 0.8)
    soma(fx, som.sino_grave(), T["logo"] - 0.1, 0.9)

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
    f = fx[:N]
    fl, fr = som.reverb(f * 0.4, 1.2, seed=9)
    return (esq, dir_), (f + fl * 0.5, f + fr * 0.5)
