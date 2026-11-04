"""Trilha + efeitos da PRÉVIA (sem narração) de "Política é da sua conta! · EP. 1: Você já vive a política".
Mesmo padrão do audio/comunismo-01/previa.py: banda completa de motor/som.py, vinheta com música própria
(audio/serie-comunismo/vinheta.py, mesmos tempos de carimbo da L.vinhetaPolitica), golpes da banda em cada carimbo e efeitos
sintetizados (relógio no ponto, contador no preço, papel nos prints, máquina de escrever nas fichas, urna, multidão).
Gancho calmo no ônibus → vinheta → groove didático (pulo) nas decisões → refrão aberto no cartaz amarelo → verso abafado na escola
e nas prioridades → verso firme na eleição → groove na participação → golpes no "e no seu dia?" e no próximo episódio → acorde final.
`trilha(T, N)` devolve (música estéreo, efeitos estéreo); rodar gera previa.wav.
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

# mesmos tempos de motor/cenas/politica-01.js
T = dict(gancho=0, atraso=2.0, bolso=3.4, onde=5.0, vin=7.0,
         onibus=10.5, viagens=11.9, preco=13.2, print=14.6, sel=16.6, prefeitura=18.0,
         politica=21.5, decide=22.2, regras=23.2, recursos=24.2,
         escola=27.5, planejar=29.2, financiar=29.9, realizar=30.6, metas=32.4, metasSel=34.2,
         prior=37.0, primeiro=39.6, interesses=41.4, ouvido=43.4,
         eleicao=46.0, naoAcaba=47.6, camara=50.2, continuam=52.0,
         lai=55.0, laiSel=57.4, passos=59.2,
         perguntas=63.0, p1=63.6, p2=65.0, p3=66.4,
         dia=69.0, conta=71.0, proximo=73.5, logo=77.5, dur=81.5)
E, G, A, C, D, B = 82.41, 98.0, 110.0, 65.41, 73.42, 61.74


def trilha(T, N):
    dur = N / SR
    st = {k: np.zeros(N + SR * 4, np.float32) for k in ("bat", "baixo", "gE", "gD", "solo", "sinte")}
    fx = np.zeros(N + SR * 4, np.float32)
    # gancho: fundo grave e baixo, guitarra abafada entrando; golpe no "onde entra a política?"
    soma(st["sinte"], som.sinte([82.41, 123.5, 164.8], T["vin"] - 0.2, 0.18, brilho=700, ataque=1.2), 0)
    som.banda_secao(st, 1.2, T["vin"] - 1.6, 100, ((E, 8), (C, 8)), "palm", 0.35, seed=11)
    som.banda_golpe(st, T["onde"], E, 0.9, anel=1.2)
    # o ônibus e suas decisões: groove didático; golpe no "quem decidiu: a prefeitura"
    som.banda_secao(st, T["onibus"], T["politica"] - T["onibus"], 120, ((E, 8), (D, 4), (A, 4)), "pulo", 0.62, virar=True, seed=12)
    som.banda_golpe(st, T["sel"], A, 0.7, anel=0.4)
    som.banda_golpe(st, T["prefeitura"], E, 0.95, anel=0.8)
    soma(st["bat"], som.virada(0.6, 0.8), T["politica"] - 0.62)
    # cartaz amarelo: refrão aberto curto, um golpe por pergunta
    som.banda_secao(st, T["politica"], T["escola"] - T["politica"], 128, ((E, 8), (C, 8)), "aberto", 0.75, seed=13)
    for t0, n in ((T["decide"], E), (T["regras"], G), (T["recursos"], A)):
        som.banda_golpe(st, t0, n, 0.95, anel=0.35)
    # a escola: verso abafado e contido; golpe na meta não atingida
    som.banda_secao(st, T["escola"], T["prior"] - T["escola"], 108, ((E, 8), (G, 4), (A, 4)), "palm", 0.5, virar=True, seed=14)
    soma(st["sinte"], som.sinte([82.41, 98.0, 123.5], T["prior"] - T["escola"], 0.22, brilho=800, ataque=1.0), T["escola"])
    som.banda_golpe(st, T["metasSel"] + 0.4, C, 0.85, anel=0.7)
    # prioridades e interesses: tensão leve; golpe no "o que vem primeiro?" e no "quem está sendo ouvido?"
    som.banda_secao(st, T["prior"], T["eleicao"] - T["prior"], 112, ((E, 8), (C, 4), (D, 4)), "tensao", 0.5, seed=15)
    som.banda_golpe(st, T["primeiro"], E, 0.9, anel=0.6)
    som.banda_golpe(st, T["ouvido"], G, 0.95, anel=0.9)
    soma(st["bat"], som.virada(0.6, 0.8), T["eleicao"] - 0.62)
    # eleição e depois do voto: verso firme
    som.banda_secao(st, T["eleicao"], T["lai"] - T["eleicao"], 116, ((E, 8), (G, 4), (A, 4)), "palm", 0.62, virar=True, seed=16)
    som.banda_golpe(st, T["naoAcaba"], E, 1.0, anel=0.8)
    som.banda_golpe(st, T["continuam"], A, 0.95, anel=0.9)
    # participar e as três perguntas: groove didático, acorde abrindo
    som.banda_secao(st, T["lai"], T["dia"] - T["lai"], 124, ((E, 8), (D, 4), (A, 4)), "pulo", 0.66, virar=True, seed=17)
    soma(st["sinte"], som.sinte([110.0, 138.6, 164.8, 220.0], T["dia"] - T["passos"], 0.28, brilho=1200, ataque=0.6), T["passos"])
    som.banda_golpe(st, T["laiSel"], G, 0.8, anel=0.4)
    soma(st["bat"], som.virada(0.6, 0.9), T["dia"] - 0.62)
    # e no seu dia? / política é da sua conta: refrão aberto com solo (tema da série)
    som.banda_secao(st, T["dia"], T["proximo"] - T["dia"], 128, ((E, 8), (C, 8), (G, 8)), "aberto", 0.82, seed=18)
    som.banda_golpe(st, T["dia"] + 0.3, E, 1.0, anel=0.6)
    som.banda_golpe(st, T["conta"] + 0.25, A, 1.0, anel=0.9)
    soma(st["solo"], som.solo([(329.6, 0.11), (392.0, 0.11), (440.0, 0.11), (493.9, 0.2), (659.3, -1.3)], 0.65), T["conta"] + 0.4)
    # próximo episódio: golpes em cada carimbo
    for t0, nota in [(T["proximo"] + 0.1, E), (T["proximo"] + 0.4, G), (T["proximo"] + 0.6, A)]:
        som.banda_golpe(st, t0, nota, 0.9, anel=0.25)
    soma(st["sinte"], som.sinte([110.0, 164.8, 220.0], T["logo"] - T["proximo"] - 0.8, 0.3, brilho=1100, ataque=0.3), T["proximo"] + 0.8)
    # logo: acorde final
    som.banda_golpe(st, T["logo"], E, 1.0, anel=2.8)
    soma(st["sinte"], som.sinte([82.41, 123.5, 164.8, 246.9], dur - T["logo"], 0.35, brilho=1100, ataque=0.4), T["logo"])

    # efeitos
    soma(fx, som.relogio(T["onde"] - 0.4, 60), 0.3, 0.35)                            # o relógio no ponto
    soma(fx, som.tique(), T["atraso"], 0.8); soma(fx, som.negacao(), T["atraso"] + 0.05, 0.25)
    soma(fx, som.metal(1200, 0.5, 0.5), T["bolso"], 0.35)                             # moedas
    soma(fx, som.carimbo_sfx(), T["onde"], 1.0); soma(fx, som.boom(), T["onde"], 0.4)
    soma(fx, som.whoosh(), T["onibus"] - 0.35, 0.6)
    soma(fx, som.rabisco(1.3, 0.6), T["onibus"] + 0.6, 0.5)                          # o trajeto sendo traçado
    soma(fx, som.tique(), T["viagens"], 0.7); soma(fx, som.tique(), T["preco"], 0.7)
    soma(fx, som.contador(1.0, 14), T["preco"] + 0.2, 0.35)
    soma(fx, som.whoosh(0.5), T["print"] - 0.1, 0.5); soma(fx, som.papel(0.6), T["print"], 0.9)
    soma(fx, som.rabisco(0.45, 0.8), T["sel"], 0.6)
    soma(fx, som.carimbo_sfx(), T["prefeitura"], 1.0); soma(fx, som.boom(), T["prefeitura"], 0.4)
    soma(fx, som.whoosh(), T["politica"] - 0.35, 0.7)
    for t0 in (T["politica"] + 0.1, T["politica"] + 0.3, T["decide"], T["regras"], T["recursos"]):
        soma(fx, som.carimbo_sfx(), t0, 0.85)
    soma(fx, som.whoosh(), T["escola"] - 0.35, 0.6); soma(fx, som.papel(0.4), T["escola"], 0.6)
    for t0 in (T["planejar"], T["financiar"], T["realizar"]):
        soma(fx, som.tique(), t0, 0.7)
    soma(fx, som.whoosh(0.5), T["metas"] - 0.1, 0.5); soma(fx, som.papel(0.6), T["metas"], 0.9)
    soma(fx, som.rabisco(0.45, 0.8), T["metasSel"], 0.6); soma(fx, som.carimbo_sfx(), T["metasSel"] + 0.4, 0.8)
    soma(fx, som.whoosh(), T["prior"] - 0.35, 0.6)
    soma(fx, som.metal(300, 0.9, 0.4), T["prior"] + 0.5, 0.3)                        # a balança rangendo
    soma(fx, som.carimbo_sfx(), T["primeiro"], 1.0)
    soma(fx, som.multidao(1.8, 0.5), T["interesses"] + 0.2, 0.3)
    soma(fx, som.carimbo_sfx(), T["ouvido"], 1.0); soma(fx, som.boom(), T["ouvido"], 0.4)
    soma(fx, som.whoosh(), T["eleicao"] - 0.35, 0.6); soma(fx, som.urna_eletronica(), T["eleicao"] + 0.6, 0.6)
    soma(fx, som.carimbo_sfx(), T["naoAcaba"], 1.0)
    soma(fx, som.whoosh(0.5), T["camara"] - 0.1, 0.5)
    for k in range(3):
        soma(fx, som.tique(), T["camara"] + 0.8 + k * 0.4, 0.6)
    soma(fx, som.carimbo_sfx(), T["continuam"], 1.0); soma(fx, som.boom(), T["continuam"], 0.4)
    soma(fx, som.whoosh(), T["lai"] - 0.35, 0.6); soma(fx, som.papel(0.5), T["lai"], 0.8)
    soma(fx, som.maquina(55, 0.03), T["lai"] + 0.4, 0.45)
    soma(fx, som.rabisco(0.45, 0.8), T["laiSel"], 0.6)
    for k in range(3):
        soma(fx, som.check(), T["passos"] + k * 0.6, 0.5)
    soma(fx, som.whoosh(), T["perguntas"] - 0.35, 0.6)
    for t0 in (T["p1"], T["p2"], T["p3"]):
        soma(fx, som.papel(0.3), t0, 0.5); soma(fx, som.maquina(16, 0.035), t0 + 0.2, 0.45)
    soma(fx, som.rabisco(0.4, 0.7), T["p2"] + 0.9, 0.5)
    soma(fx, som.riser(0.9), T["dia"] - 0.9, 0.4); soma(fx, som.whoosh(), T["dia"] - 0.35, 0.7)
    soma(fx, som.carimbo_sfx(), T["dia"] + 0.3, 1.0); soma(fx, som.boom(), T["dia"] + 0.3, 0.5)
    soma(fx, som.carimbo_sfx(), T["conta"], 0.9); soma(fx, som.carimbo_sfx(), T["conta"] + 0.25, 1.0)
    soma(fx, som.multidao(2.0, 0.6), T["conta"] + 0.4, 0.3)
    soma(fx, som.whoosh(), T["proximo"] - 0.35, 0.7)
    for k in range(3):
        soma(fx, som.carimbo_sfx(), T["proximo"] + 0.1 + k * 0.25, 0.8)
    soma(fx, som.whoosh(), T["logo"] - 0.35, 0.6); soma(fx, som.carimbo_sfx(), T["logo"], 0.8)
    soma(fx, som.sino_grave(), T["logo"] - 0.1, 0.9)

    # mixagem (mesma do comunismo-01) + vinheta colada
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
    g = np.sqrt(np.mean(esq[int(T["onibus"] * SR):int(T["politica"] * SR)] ** 2)) / max(np.sqrt(np.mean(ve ** 2)), 1e-9) * 1.4
    # a banda some durante a vinheta (que tem música própria)
    a, b = int((T["vin"] - 0.15) * SR), int((T["onibus"] - 0.1) * SR)
    rampa = np.ones(N, np.float32); rampa[a:b] = 0.0
    rampa[max(0, a - 2400):a] = np.linspace(1, 0, min(2400, a)); rampa[b:b + 2400] = np.linspace(0, 1, len(rampa[b:b + 2400]))
    esq *= rampa; dir_ *= rampa
    soma(esq, ve * g, T["vin"]); soma(dir_, vd * g, T["vin"])
    f = fx[:N]
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
