"""Trilha + efeitos da PRÉVIA (sem narração) de "Esquerda cirandeira".
Ciranda (evocação sintetizada): bumbo marcando o 1º tempo, maracá no contratempo e flauta pentatônica, em roda.
Quando a roda passa do centro, a flauta vira o modo frígio (tenso). Os tempos espelham motor/cenas/esquerda-cirandeira.js.
Saída: audio/esquerda-cirandeira/previa.wav
"""
import sys
from pathlib import Path

import numpy as np

AQUI = Path(__file__).resolve().parent
sys.path.insert(0, str(AQUI.parent.parent / "motor"))
sys.path.insert(0, str(AQUI.parent / "eleicoes-2026"))
import som  # noqa: E402
from som import SR, soma  # noqa: E402
from trilha import amostra  # noqa: E402  (amostras do Soundza em audio/sfx)

T = dict(titulo=0.3, origem=3.6, meme=7.6, hoje=9.6, roda=13.6, p1=14.4, p2=15.6, p3=17.2, p4=18.4, p5=19.8, p6=21.0,
         p7=22.4, p8=24.2, p9=26.0, p10=27.8, p11=29.8, p12=31.4, p13=32.6, p14=33.8, p15=35.4, gira=37.2,
         mercado=40.0, m1=40.8, m2=42.2, m3=43.6, m4=45.0, migalhas=46.6, fecho=50.0, praia=50.4, ponta=53.4,
         logo=56.6, dur=60.0)


def trilha(T, N):
    mus, sfx = np.zeros(N, np.float32), np.zeros(N, np.float32)
    dur = N / SR
    soma(mus, som.drone(T["mercado"], 55.0, 0.3), 0, 0.5)
    soma(mus, som.drone_tenso(T["fecho"] - T["mercado"] + 0.5, 41.2), T["mercado"], 0.7)
    soma(mus, som.drone(dur - T["fecho"], 55.0, 0.4), T["fecho"], 0.6)
    bat = 60 / 92                                     # ciranda: andamento de roda, bumbo forte no 1
    t, i = 0.6, 0
    while t < dur - 1:
        tenso = T["p11"] <= t < T["fecho"]
        if not (T["mercado"] <= t < T["fecho"]) or i % 2 == 0:
            soma(mus, som.tambor(1.0 if i % 4 == 0 else 0.45, 70, 34, 1.0), t)
        soma(mus, som.maraca(0.35), t + bat / 2)
        if tenso and i % 4 == 2:
            soma(mus, som.batimento(), t, 0.4)
        t += bat
        i += 1
    # frases de flauta em roda (pentatônica); a partir da direita, frígio desconfiado
    frases = [(T["titulo"] + 0.6, [4, 5, 7, 5, 4, 2], [0.33, 0.33, 0.66, 0.33, 0.33, 1.0]),
              (T["roda"] + 0.3, [4, 5, 7, 8, 7, 5], [0.33, 0.33, 0.33, 0.33, 0.66, 1.0]),
              (T["p6"], [7, 8, 7, 5, 4, 5], [0.33, 0.33, 0.33, 0.33, 0.66, 1.0]),
              (T["p8"] + 0.2, [4, 5, 4, 2, 0], [0.33, 0.33, 0.66, 0.66, 1.2])]
    for t0, g, r in frases:
        soma(mus, som.frase_flauta(g, r, 1.0, 0.5), t0)
    for t0, g, r in [(T["p11"], [3, 2, 1, 0], [0.5, 0.5, 0.5, 1.4]), (T["p14"], [1, 2, 1, 0], [0.4, 0.4, 0.6, 1.6]),
                     (T["mercado"] + 0.5, [5, 4, 3, 1, 0], [0.5, 0.5, 0.5, 0.5, 1.8])]:
        soma(mus, som.frase_tensa(g, r, 0.5), t0)
    soma(mus, som.frase_flauta([4, 5, 7, 5, 4], [0.33, 0.33, 0.66, 0.33, 1.4], 1.0, 0.5), T["praia"] + 0.3)

    # efeitos
    soma(sfx, som.carimbo_sfx(), T["titulo"], 0.9)
    soma(sfx, amostra("deep-boom-hit"), T["origem"], 0.6)
    soma(sfx, som.carimbo_sfx(), T["origem"], 0.9)
    soma(sfx, som.carimbo_sfx(), T["meme"], 0.6)
    soma(sfx, som.maquina(16, 0.04), T["hoje"], 0.6)
    for k in range(1, 16):                            # cada um que entra na roda: whoosh curto + tique
        soma(sfx, amostra("fast-whoosh-chop"), T[f"p{k}"] - 0.1, 0.45)
        soma(sfx, som.tique(), T[f"p{k}"] + 0.35, 0.8)
    soma(sfx, amostra("reverse-boom-whoosh"), T["gira"] - 2.3, 0.5)
    soma(sfx, amostra("metal-boom-hit"), T["gira"], 0.6)
    for k in range(1, 5):
        soma(sfx, som.carimbo_sfx(), T[f"m{k}"], 0.8)
    for k in range(9):                                # migalhas caindo no prato
        soma(sfx, som.tique(), T["migalhas"] + 0.3 + k * 0.12, 0.5)
    for t0 in [T["roda"], T["mercado"], T["fecho"]]:
        soma(sfx, amostra("fast-whoosh-chop"), t0 - 0.35, 0.75)
    soma(sfx, som.carimbo_sfx(), T["praia"], 0.8)
    soma(sfx, som.carimbo_sfx(), T["ponta"], 0.9)
    soma(sfx, amostra("deep-boom-hit"), T["ponta"], 0.6)
    soma(sfx, som.sino_grave(), T["logo"] - 0.1, 0.9)
    return mus, sfx


if __name__ == "__main__":
    mus, sfx = trilha(T, int(T["dur"] * SR))
    mix = mus * 0.5 + sfx * 0.55
    mix = np.where(np.abs(mix) > 0.7, np.sign(mix) * (0.7 + 0.28 * np.tanh((np.abs(mix) - 0.7) / 0.28)), mix).astype(np.float32)
    som.salvar_wav(str(AQUI / "previa.wav"), mix * 1.02, mix * 0.98)
    print("ok", T["dur"])
