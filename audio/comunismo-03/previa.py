"""Trilha + efeitos de "Desmistificando o Comunismo · EP. 3: O que é mais-valia?". Modelo: audio/comunismo-02/previa.py.
Fundo baixo sob o gancho (o áudio do vídeo entra no juntar.sh) → vinheta (música própria) → golpes na régua de 8 horas (CARTAZ) →
groove leve na hamburgueria → caixa registradora e impressora no cupom → golpe forte no carimbo MAIS-VALIA → verso firme no "por quê" →
verso sério nos números do Brasil → calmo em Marx (1849) → refrão aberto na pergunta final → acorde no logo.
`trilha(T, N)` devolve (música, efeitos) em estéreo. GANCHO = duração do vídeo de abertura (s).
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

GANCHO = 40.85   # trecho do vídeo do Jones (0–40,85 s, até "Foi assim!"): igual na cena (comunismo-03.js) e no juntar.sh
E, G, A, C, D, B = 82.41, 98.0, 110.0, 65.41, 73.42, 61.74


def trilha(T, N):
    dur = N / SR
    st = {k: np.zeros(N + SR * 4, np.float32) for k in ("bat", "baixo", "gE", "gD", "solo", "sinte")}
    fx = np.zeros(N + SR * 4, np.float32)
    # sob o gancho: só um fundo baixo de sinte
    soma(st["sinte"], som.sinte([82.41, 123.5, 164.8], T["vin"] - 0.2, 0.12, brilho=600, ataque=1.5), 0)
    # #1 CARTAZ: a régua de 8 horas
    som.banda_golpe(st, T["oito"] + 0.1, E, 0.9, anel=0.4)
    som.banda_secao(st, T["oito"] + 0.6, T["lanche"] - T["oito"] - 0.6, 120, ((E, 8), (G, 4), (A, 4)), "tensao", 0.55, seed=1)
    som.banda_golpe(st, T["menos"], E, 1.0, anel=1.0)
    # #2 a hamburgueria: groove leve, depois o cupom
    som.banda_secao(st, T["lanche"], T["mv"] - T["lanche"], 112, ((A, 8), (G, 4), (E, 4)), "palm", 0.5, virar=True, seed=2)
    som.banda_golpe(st, T["mil"], A, 0.8, anel=0.4)
    som.banda_golpe(st, T["novo"], E, 0.85, anel=0.6)
    som.banda_golpe(st, T["hora"], G, 0.8, anel=0.4)
    som.banda_golpe(st, T["lucro"], A, 0.9, anel=0.6)
    # CARTAZ: MAIS-VALIA
    for k, nota in enumerate([E, G, A]):
        som.banda_golpe(st, T["mvc"] + k * 0.25, nota, 1.0, anel=0.25 if k < 2 else 1.2)
    # #3 por quê: verso firme
    som.banda_secao(st, T["porque"], T["brasil"] - T["porque"], 116, ((E, 8), (G, 4), (A, 4)), "palm", 0.62, virar=True, seed=3)
    som.banda_golpe(st, T["forca"], E, 0.9, anel=0.6)
    som.banda_golpe(st, T["seutrab"], G, 0.95, anel=0.8)
    # #4 o Brasil: verso sério; Marx 1849: calmo
    som.banda_secao(st, T["brasil"], T["m1849"] - T["brasil"], 120, ((E, 8), (C, 4), (D, 4)), "tensao", 0.58, virar=True, seed=4)
    som.banda_golpe(st, T["media"] + 0.6, E, 0.85, anel=0.5)
    som.banda_golpe(st, T["minimo2"] + 0.6, E, 0.95, anel=0.7)
    soma(st["sinte"], som.sinte([110.0, 164.8, 220.0], T["final"] - T["m1849"], 0.25, brilho=800, ataque=0.8), T["m1849"])
    som.banda_secao(st, T["m1849"], T["final"] - T["m1849"], 100, ((A, 8), (G, 4), (E, 4)), "palm", 0.4, seed=5)
    # a pergunta final: refrão aberto + tema na guitarra solo
    som.banda_secao(st, T["final"], T["logo"] - T["final"], 128, ((E, 8), (C, 8), (G, 8), (D, 8)), "aberto", 0.75, seed=6)
    soma(st["solo"], som.solo([(329.6, 0.25), (392.0, 0.25), (440.0, 0.25), (493.9, 0.4), (659.3, -1.4)], 0.6), T["final"] + 0.6)
    som.banda_golpe(st, T["quantas"], E, 0.95, anel=0.7)
    som.banda_golpe(st, T["logo"], E, 1.0, anel=2.8)
    soma(st["sinte"], som.sinte([82.41, 123.5, 164.8, 246.9], dur - T["logo"], 0.35, brilho=1100, ataque=0.4), T["logo"])

    # efeitos
    soma(fx, som.whoosh(), T["oito"] - 0.35, 0.6)
    for k in range(8):
        soma(fx, som.tique(), T["oito"] + 0.3 + k * 0.12, 0.5)
    soma(fx, som.carimbo_sfx(), T["menos"], 0.9)
    soma(fx, som.whoosh(), T["lanche"] - 0.35, 0.6)
    for k in range(3):
        soma(fx, som.tique(), T["lanche"] + 0.8 + k * 0.5, 0.5)
    soma(fx, som.carimbo_sfx(), T["preco"] + 0.3, 0.6)
    for k in range(6):
        soma(fx, som.tique(), T["monta"] + 0.1 + k * 0.1, 0.45)
    soma(fx, som.carimbo_sfx(), T["mil"] + 0.2, 0.7)
    soma(fx, som.whoosh(0.5), T["cupom"] - 0.2, 0.5)
    for k in ("cupom", "luz", "novo", "cem", "outras", "aluguel", "impostos", "juros", "marca", "lucro"):
        soma(fx, som.maquina(30, 0.03), T[k] + 0.05, 0.45)
    soma(fx, som.rabisco(0.5, 0.7), T["novo"] + 0.6, 0.6)
    soma(fx, som.carimbo_sfx(), T["hora"] + 0.4, 0.7)
    soma(fx, som.rabisco(0.6, 0.8), T["lucro"] + 0.3, 0.7)
    soma(fx, som.whoosh(), T["mv"] - 0.35, 0.7)
    for k in range(3):
        soma(fx, som.carimbo_sfx(), T["mvc"] + k * 0.25, 0.9)
    soma(fx, som.boom(), T["mvc"] + 0.5, 0.5); soma(fx, som.carimbo_sfx(), T["npago"], 0.8)
    soma(fx, som.whoosh(), T["porque"] - 0.35, 0.6); soma(fx, som.papel(0.5), T["porque"] + 0.1, 0.7)
    soma(fx, som.maquina(40, 0.03), T["porque"] + 0.5, 0.45)
    soma(fx, som.rabisco(0.5, 0.8), T["forca"] + 0.2, 0.7)
    for k in ("comida", "aluguel2", "transporte"):
        soma(fx, som.tique(), T[k], 0.7)
    soma(fx, som.estaca(0.7), T["preco2"] + 0.6, 0.4)
    soma(fx, som.carimbo_sfx(), T["seutrab"], 0.9)
    soma(fx, som.whoosh(), T["brasil"] - 0.35, 0.6); soma(fx, som.papel(0.5), T["brasil"], 0.6)
    for k in ("media", "minimo2"):
        for j in range(8):
            soma(fx, som.tique(), T[k] + 0.2 + j * 0.09, 0.4)
    soma(fx, som.whoosh(), T["m1849"] - 0.35, 0.6); soma(fx, som.papel(0.5), T["m1849"], 0.7)
    soma(fx, som.maquina(90, 0.03), T["m1849"] + 0.4, 0.45); soma(fx, som.rabisco(0.6, 0.7), T["vida"], 0.6)
    soma(fx, som.whoosh(), T["final"] - 0.35, 0.7)
    for k in range(3):
        soma(fx, som.carimbo_sfx(), T["quantas"] + k * 0.3, 0.8)
    soma(fx, som.riser(0.8), T["final"] + 0.1, 0.4)
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
    ve, vd = vinheta()
    g = np.sqrt(np.mean(esq[int(T["porque"] * SR):int(T["brasil"] * SR)] ** 2)) / max(np.sqrt(np.mean(ve ** 2)), 1e-9) * 1.4
    soma(esq, ve * g, T["vin"]); soma(dir_, vd * g, T["vin"])
    f = fx[:N]
    fl, fr = som.reverb(f * 0.4, 1.2, seed=9)
    return (esq, dir_), (f + fl * 0.5, f + fr * 0.5)
