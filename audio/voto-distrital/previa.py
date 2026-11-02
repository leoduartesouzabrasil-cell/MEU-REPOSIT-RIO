"""Trilha + efeitos da PRÉVIA (sem narração) de "Voto distrital: seu voto no lixo".
Rock trabalhado, com a banda completa de motor/som.py: bateria com viradas, baixo, duas guitarras (esq./dir.),
guitarra solo com melodia, sintetizador de fundo e reverb. O arranjo segue o vídeo:
  noite (sinte grave, relógio, grilos; golpes da banda em cada carimbo) → verso abafado no print e no contexto →
  paradas no "como isso funcionaria na prática?" → groove didático (contratempo) na maquete → "trombone triste" da
  guitarra no lixo → tensão em semicolcheias no mapa e no curral → meio-tempo pesado em quem fica de fora →
  verso contido no distritão → refrão aberto com o solo no cartaz final → acorde final e sino no logo.
Os tempos espelham motor/cenas/voto-distrital.js. `trilha(T, N)` devolve (música em estéreo, efeitos em estéreo).
Saída: audio/voto-distrital/previa.wav
"""
import sys
from pathlib import Path

import numpy as np

AQUI = Path(__file__).resolve().parent
sys.path.insert(0, str(AQUI.parent.parent / "motor"))
import som  # noqa: E402
from som import SR, soma  # noqa: E402

T = dict(n1=0.3, n2=1.2, n3=2.1, n4=2.9, cedula=3.2, print=4.6, sel=6.0, ctx=8.4, motta=8.7, c1=10.2, c2=11.0, c3=11.8, c4=12.6,
         metade=13.6, pratica=15.8, cidade=18.2, distrito=20.4, desce=21.4, maria=23.0, joao=24.4, chuva=25.8, conta=27.2,
         vence=28.0, lixo=29.2, lixoTxt=30.6, mapa=32.0, risca=32.7, novo=34.2, curral=35.6, perde=37.6, bancada=41.0, sim=44.4,
         distritao=49.2, rej1=50.4, rej2=51.2, reforma=53.0, jogada=54.6, nao=56.0, logo=58.2, dur=61.8)

E, G, A, C, D, B = 82.41, 98.0, 110.0, 65.41, 73.42, 61.74       # notas das guitarras (power chords)


def trilha(T, N):
    dur = N / SR
    st = {k: np.zeros(N + SR * 4, np.float32) for k in ("bat", "baixo", "gE", "gD", "solo", "sinte")}
    fx = np.zeros(N + SR * 4, np.float32)

    # ---------------- A. noite: sinte grave, golpes da banda em cada carimbo, subida e o "NO LIXO!" com a banda inteira
    soma(st["sinte"], som.sinte([82.41, 123.5, 164.8, 196.0], T["n4"] + 0.2, 0.5, brilho=900, ataque=0.3), 0)
    for t0, nota in [(T["n1"], E), (T["n2"], G), (T["n3"], A)]:
        soma(st["bat"], som.tom(70, 0.9), t0); soma(st["bat"], som.bumbo(0.9), t0)
        soma(st["gE"], som.guitarra(nota, 0.35, abafada=True, vel=0.8), t0); soma(st["gD"], som.guitarra(nota * 1.002, 0.35, abafada=True, vel=0.8), t0 + 0.01)
        soma(st["baixo"], som.baixo(nota / 2, 0.5, 0.9), t0)
    soma(fx, som.riser(T["n4"] - T["n3"] + 0.1), T["n3"] + 0.05, 0.55)
    som.banda_golpe(st, T["n4"], E, 1.0, anel=1.4)
    # ---------------- B/C. print e contexto: verso abafado (deixa espaço para a voz), virada no fim
    som.banda_secao(st, T["print"], T["pratica"] - T["print"], 116, ((E, 8), (C, 8), (G, 8), (D, 8)), "palm", 0.62, virar=True, seed=2)
    soma(st["sinte"], som.sinte([164.8, 196.0, 246.9], T["pratica"] - T["print"], 0.18, brilho=900, ataque=1.5), T["print"])
    # ---------------- D. "como isso funcionaria na prática?": três paradas e a subida para a maquete
    for k, nota in enumerate([E, G, A]):
        som.banda_golpe(st, T["pratica"] + 0.1 + k * 0.25, nota, 0.9, anel=0.22 if k < 2 else 1.2)
    soma(st["bat"], som.virada(1.0, 0.8), T["cidade"] - 1.05)
    # ---------------- E. maquete: groove didático no contratempo (mixolídio, mais leve) até o lixo
    som.banda_secao(st, T["cidade"], T["vence"] - T["cidade"], 124, ((E, 8), (D, 4), (A, 4)), "pulo", 0.72, seed=3)
    # o eleito: golpe + fanfarra irônica
    som.banda_golpe(st, T["vence"], E, 0.95, anel=1.0)
    soma(fx, som.fanfarra_ironica(0.7), T["vence"] + 0.15, 0.7)
    # o lixo: a guitarra solo faz o "trombone triste" descendo, o baixo desce junto
    soma(st["solo"], som.solo([(246.9, 0.32), (233.1, 0.32), (220.0, 0.32), (207.7, -1.3)], 0.8, brilho=2600), T["lixo"] + 0.1)
    for k, f in enumerate([61.74, 58.27, 55.0, 51.91]):
        soma(st["baixo"], som.baixo(f, 0.3 if k < 3 else 1.3, 0.8), T["lixo"] + 0.1 + k * 0.32)
    soma(st["sinte"], som.sinte([103.8, 155.6, 207.7], T["mapa"] - T["lixo"] - 1.4, 0.25, brilho=800, ataque=0.3), T["lixo"] + 1.4)
    soma(st["bat"], som.virada(0.5, 0.7), T["mapa"] - 0.5)
    # ---------------- F. mapa e curral: tensão em semicolcheias (frígio), golpe no CURRAL
    som.banda_secao(st, T["mapa"], T["curral"] + 1.0 - T["mapa"], 124, ((E, 8), (E, 4), (G, 4)), "tensao", 0.75, virar=True, seed=4)
    som.banda_golpe(st, T["curral"] + 1.0, E, 1.0, anel=1.0)
    # ---------------- G. quem fica de fora: meio-tempo pesado
    som.banda_secao(st, T["curral"] + 1.6, T["bancada"] - T["curral"] - 1.6, 124, ((E, 8), (C, 8)), "meio", 0.8, seed=5)
    # ---------------- G2. a Câmara hoje (verso contido) e a simulação (tensão), golpes no PL e no "o mesmo voto, menos vagas"
    som.banda_secao(st, T["bancada"], T["sim"] - T["bancada"], 124, ((E, 8), (G, 4), (D, 4)), "palm", 0.55, seed=8)
    som.banda_golpe(st, T["bancada"] + 1.8, E, 0.85, anel=0.6)
    som.banda_secao(st, T["sim"], T["distritao"] - T["sim"], 124, ((E, 8), (E, 4), (G, 4)), "tensao", 0.6, virar=True, seed=9)
    som.banda_golpe(st, T["sim"] + 3.4, E, 0.95, anel=0.8)
    # ---------------- H. distritão: verso contido + golpes nos carimbos REJEITADO
    som.banda_secao(st, T["distritao"], T["reforma"] - T["distritao"], 124, ((E, 8), (G, 4), (A, 4)), "palm", 0.55, virar=True, seed=6)
    for t0 in (T["rej1"], T["rej2"]):
        som.banda_golpe(st, t0, A, 0.8, anel=0.5)
    soma(fx, som.riser(1.2), T["reforma"] - 1.2, 0.5)
    # ---------------- I. cartaz final: refrão aberto com o solo (melodia-tema), golpes no "É JOGADA." e no "NÃO AO VOTO DISTRITAL."
    som.banda_secao(st, T["reforma"], T["logo"] - T["reforma"], 132, ((E, 8), (C, 8), (G, 8), (D, 8)), "aberto", 0.9, seed=7)
    col = 60 / 132 / 2
    tema = [(493.9, 2 * col), (440.0, col), (392.0, col), (440.0, 2 * col), (329.6, 2 * col), (0, 2 * col),
            (392.0, 2 * col), (440.0, col), (493.9, col), (587.3, 3 * col), (493.9, -3 * col), (0, 2 * col),
            (659.3, 3 * col), (587.3, col), (493.9, 2 * col), (440.0, 2 * col), (392.0, 4 * col), (329.6, -6 * col)]
    soma(st["solo"], som.solo(tema, 0.75), T["reforma"] + 0.05)
    som.banda_golpe(st, T["jogada"], E, 0.9, anel=0.6); som.banda_golpe(st, T["nao"], G, 0.9, anel=0.6)
    # ---------------- J. logo: acorde final soando, sinte e sino
    som.banda_golpe(st, T["logo"], E, 1.0, anel=3.0)
    soma(st["sinte"], som.sinte([82.41, 123.5, 164.8, 246.9], dur - T["logo"], 0.35, brilho=1100, ataque=0.4), T["logo"])

    # ================= efeitos
    soma(fx, som.grilos(T["print"]), 0, 0.5)
    soma(fx, som.relogio(T["print"] - 0.2, bpm=120), 0, 0.5)
    for t0 in (T["n1"], T["n2"], T["n3"], T["n4"]):
        soma(fx, som.carimbo_sfx(), t0, 0.8)
    soma(fx, som.boom(), T["n4"], 0.7)
    soma(fx, som.papel(0.5, 0.8), T["cedula"] - 0.1, 0.8)                     # a cédula voando
    soma(fx, som.metal(260, 1.0, 0.8), T["cedula"] + 0.25, 0.6)               # tampa da lixeira
    soma(fx, som.metal(180, 1.4, 1.0), T["cedula"] + 0.55, 0.8)               # cédula batendo no fundo
    soma(fx, som.whoosh(), T["print"] - 0.35, 0.6); soma(fx, som.papel(0.6), T["print"] + 0.05, 0.9)
    soma(fx, som.rabisco(0.45, 0.8), T["sel"], 0.7)                            # seleção no "ainda neste ano"
    soma(fx, som.carimbo_sfx(), T["sel"] + 0.6, 0.6)
    soma(fx, som.whoosh(), T["ctx"] - 0.35, 0.6); soma(fx, som.papel(0.5), T["ctx"], 0.8)
    soma(fx, som.whoosh(0.4), T["motta"] - 0.1, 0.6); soma(fx, som.carimbo_sfx(), T["motta"] + 0.4, 0.6)   # a foto do Motta
    soma(fx, som.whoosh(0.35), T["c1"] - 0.5, 0.5); soma(fx, som.papel(0.5), T["c1"] - 0.4, 0.7)
    for t0, n in [(T["c1"], 20), (T["c2"], 22), (T["c3"], 24), (T["c3"] + 0.5, 20), (T["c4"], 32)]:
        soma(fx, som.maquina(n, 0.03), t0, 0.55)
    soma(fx, som.whoosh(0.35), T["metade"], 0.6); soma(fx, som.tique(), T["metade"] + 1.0, 0.9)
    soma(fx, som.whoosh(), T["pratica"] - 0.35, 0.7)
    for k in range(3):
        soma(fx, som.carimbo_sfx(), T["pratica"] + 0.1 + k * 0.25, 0.7)
    # maquete
    soma(fx, som.whoosh(0.9), T["cidade"] - 0.4, 0.7)
    soma(fx, som.multidao(T["mapa"] - T["cidade"], 0.25), T["cidade"], 0.35)  # cidade ao fundo
    for k in range(3):
        soma(fx, som.tique(), T["cidade"] + 1.2 + k * 0.25, 0.8)
    soma(fx, som.carimbo_sfx(), T["distrito"], 0.6)
    soma(fx, som.reverse(som.whoosh(1.0)) if hasattr(som, "reverse") else som.whoosh(1.0), T["desce"] - 0.2, 0.7)
    for k in range(3):
        soma(fx, som.tique(), T["desce"] + 0.8 + k * 0.25, 0.7)
    for t0 in (T["maria"], T["joao"]):
        soma(fx, som.passos(4, 0.3, 0.5), t0 - 1.2, 0.6)
        soma(fx, som.papel(0.3, 0.7), t0, 0.6)
        soma(fx, som.urna_eletronica(), t0 + 0.4, 0.55)                       # o "confirma" da urna
        soma(fx, som.bloco_madeira(780), t0 + 1.6, 0.7)
    for i, tot in enumerate((6, 6, 8)):                                         # cubos empilhando (cada um = 5%)
        for k in range(1, tot + 1):
            t0 = T["chuva"] + k / tot * (T["conta"] - T["chuva"]) - 0.02 + 0.33
            soma(fx, som.bloco_madeira(700 + 140 * i + 25 * k, 0.8), t0, 0.45)
    soma(fx, som.contador(T["conta"] - T["chuva"], 20), T["chuva"], 0.35)
    soma(fx, som.multidao(1.6, 0.7), T["vence"], 0.5)
    soma(fx, som.metal(240, 0.8, 0.6), T["lixo"] - 0.2, 0.45)                 # tampa abre
    for k in range(12):                                                         # 12 cubos caindo na lixeira
        soma(fx, som.metal(150 + 37 * (k % 5), 0.5, 0.5 + 0.04 * k), T["lixo"] + k * 0.08 + 0.62, 0.32)
    soma(fx, som.carimbo_sfx(), T["lixoTxt"], 0.8); soma(fx, som.boom(), T["lixoTxt"], 0.5)
    soma(fx, som.whoosh(0.9), T["mapa"] - 0.1, 0.6)
    soma(fx, som.rabisco(0.5, 0.8), T["risca"], 0.8)
    soma(fx, som.rabisco(T["novo"] - T["risca"] - 0.5, 0.9), T["risca"] + 0.5, 0.8)
    for k in range(4):
        soma(fx, som.tique(), T["novo"] - 0.4 + k * 0.17, 0.6)
    soma(fx, som.carimbo_sfx(), T["novo"], 0.7)
    for k in range(14):                                                         # mourões cravando em onda (~1 s)
        soma(fx, som.estaca(0.6 + 0.03 * k), T["curral"] + 0.1 + k * 0.065, 0.35)
    soma(fx, som.carimbo_sfx(), T["curral"] + 1.0, 0.9); soma(fx, som.boom(), T["curral"] + 1.0, 0.6)
    for k in range(4):
        soma(fx, som.passos(2, 0.25, 0.4), T["perde"] + 0.3 + k * 0.35, 0.5)
        soma(fx, som.tique(), T["perde"] + 0.6 + k * 0.35, 0.7)
    soma(fx, som.carimbo_sfx(), T["perde"] + 2.2, 0.7)
    soma(fx, som.whoosh(), T["bancada"] - 0.35, 0.6)
    soma(fx, som.contador(1.4, 26), T["bancada"] + 0.2, 0.45)                 # as 513 cadeiras surgindo
    soma(fx, som.carimbo_sfx(), T["bancada"] + 1.8, 0.9); soma(fx, som.tique(), T["bancada"] + 2.0, 0.8); soma(fx, som.tique(), T["bancada"] + 2.6, 0.8)
    soma(fx, som.whoosh(), T["sim"] - 0.1, 0.6)
    for k in range(4):
        soma(fx, som.tique(), T["sim"] + 0.5 + k * 0.15, 0.7)
    soma(fx, som.contador(1.0, 10), T["sim"] + 0.9, 0.4); soma(fx, som.check(), T["sim"] + 1.9, 0.6)
    soma(fx, som.contador(1.0, 10), T["sim"] + 1.4, 0.4); soma(fx, som.negacao(), T["sim"] + 2.4, 0.4)
    soma(fx, som.carimbo_sfx(), T["sim"] + 3.4, 0.9); soma(fx, som.boom(), T["sim"] + 3.4, 0.5)
    soma(fx, som.whoosh(), T["distritao"] - 0.35, 0.6); soma(fx, som.papel(0.5), T["distritao"], 0.8)
    soma(fx, som.maquina(28, 0.022), T["distritao"] + 0.5, 0.5); soma(fx, som.maquina(26, 0.022), T["distritao"] + 0.9, 0.5)
    for t0 in (T["rej1"], T["rej2"]):
        soma(fx, som.carimbo_sfx(), t0, 1.0); soma(fx, som.negacao(), t0 + 0.05, 0.35)
    soma(fx, som.whoosh(), T["reforma"] - 0.35, 0.7)
    for t0 in (T["reforma"] + 0.1, T["reforma"] + 0.3, T["jogada"] + 0.15, T["nao"]):
        soma(fx, som.carimbo_sfx(), t0, 0.8)
    soma(fx, som.boom(), T["jogada"], 0.6)
    soma(fx, som.whoosh(), T["logo"] - 0.35, 0.6); soma(fx, som.carimbo_sfx(), T["logo"], 0.8)
    soma(fx, som.sino_grave(), T["logo"] - 0.1, 0.9)

    # ================= mixagem: panorâmica, reverb, compressão
    N4 = N
    mix = {k: v[:N4] for k, v in st.items()}
    esq = np.zeros(N4, np.float32); dir_ = np.zeros(N4, np.float32)
    ganhos = dict(bat=0.85, baixo=0.6, gE=0.42, gD=0.42, solo=0.5, sinte=0.45)
    panos = dict(bat=0.0, baixo=0.0, gE=-0.75, gD=0.75, solo=0.2, sinte=0.0)
    envio = dict(bat=0.12, baixo=0.0, gE=0.15, gD=0.15, solo=0.35, sinte=0.4)
    rev = np.zeros(N4, np.float32)
    for k, x in mix.items():
        x = som.fpa(x, 50 if k != "baixo" else 38, 3) * ganhos[k]
        l, r = som.pan(x, panos[k]); esq += l; dir_ += r; rev += x * envio[k]
    rl, rr = som.reverb(rev, 1.9)
    esq += rl * 0.55; dir_ += rr * 0.55
    esq, dir_ = som.comprimir(esq, 0.3, 2.5), som.comprimir(dir_, 0.3, 2.5)
    # brilho: leve realce acima de 2,5 kHz (as guitarras sintetizadas saem escuras)
    esq, dir_ = esq + som.fpa(esq, 2500) * 0.35, dir_ + som.fpa(dir_, 2500) * 0.35
    f = fx[:N4]
    fl, fr = som.reverb(f * 0.4, 1.2, seed=9)
    sfx_e, sfx_d = f + fl * 0.5, f + fr * 0.5
    return (esq, dir_), (sfx_e, sfx_d)


if __name__ == "__main__":
    N = int(T["dur"] * SR)
    (me, md), (fe, fd) = trilha(T, N)
    ge, gd = me * 0.5 + fe * 0.42, md * 0.5 + fd * 0.42
    pico = max(np.abs(ge).max(), np.abs(gd).max())
    ge, gd = ge / pico * 0.89, gd / pico * 0.89
    lim = lambda x: np.where(np.abs(x) > 0.7, np.sign(x) * (0.7 + 0.29 * np.tanh((np.abs(x) - 0.7) / 0.29)), x).astype(np.float32)
    som.salvar_wav(str(AQUI / "previa.wav"), lim(ge), lim(gd))
    print("ok", T["dur"])
