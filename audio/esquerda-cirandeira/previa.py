"""Trilha + efeitos da PRÉVIA (sem narração) de "Esquerda cirandeira".
Ciranda (evocação sintetizada) na abertura e na régua; da direita em diante, flauta no modo frígio (tensa);
um-pá de circo; marcha no "radicalize-se". Os tempos espelham motor/cenas/esquerda-cirandeira.js.
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

T = dict(titulo=0.3, origem=3.6, meme=7.4, hoje=9.4, migalhas=12.0, regua=15.0, p1=15.8, p2=17.1, p3=18.6, p4=19.9,
         p5=21.2, p6=22.5, p7=23.8, p8=25.4, p9=26.9, p10=28.6, p11=30.3, p12=31.9, p13=33.2, p14=34.5, p15=35.9,
         visao=37.6, circo=40.0, plateia=43.0, palhaco=45.0, acabar=48.0, radical=50.4, comente=52.8, logo=55.6, dur=59.0)


def trilha(T, N):
    mus, sfx = np.zeros(N, np.float32), np.zeros(N, np.float32)
    dur = N / SR
    soma(mus, som.drone(T["circo"], 55.0, 0.3), 0, 0.5)
    soma(mus, som.drone(dur - T["radical"], 55.0, 0.7), T["radical"], 1.0)
    # ciranda (abertura e régua): bumbo forte no 1, maracá no contratempo, em roda
    bat = 60 / 92
    t, i = 0.6, 0
    while t < T["circo"] - 0.3:
        soma(mus, som.tambor(1.0 if i % 4 == 0 else 0.45, 70, 34, 1.0), t)
        soma(mus, som.maraca(0.35), t + bat / 2)
        if T["p11"] <= t and i % 4 == 2:
            soma(mus, som.batimento(), t, 0.35)
        t, i = t + bat, i + 1
    # circo: "um-pá" (grave no tempo, estalo no contratempo), acelerando até "chega de ciranda"
    t, i = T["circo"], 0
    while t < T["acabar"]:
        soma(mus, som.tambor(0.8, 55, 30, 0.6), t)
        soma(mus, som.tique(), t + 0.2, 0.7)
        t, i = t + max(0.28, 0.42 - (t - T["circo"]) * 0.015), i + 1
    # radicalizar: marcha de tambores até o fim
    t, i = T["radical"], 0
    while t < dur - 1:
        soma(mus, som.tambor(0.9, 80, 38, 0.9), t)
        if i % 2:
            soma(mus, som.tambor(0.55, 130, 65, 0.4), t + 0.33)
        soma(mus, som.maraca(0.35), t + 0.33)
        t, i = t + 0.66, i + 1
    for t0, g, r in [(T["titulo"] + 0.6, [4, 5, 7, 5, 4, 2], [0.33, 0.33, 0.66, 0.33, 0.33, 1.0]),
                     (T["regua"] + 0.3, [4, 5, 7, 8, 7, 5], [0.33, 0.33, 0.33, 0.33, 0.66, 1.0]),
                     (T["p6"], [7, 8, 7, 5, 4, 5], [0.33, 0.33, 0.33, 0.33, 0.66, 1.0]),
                     (T["p8"] + 0.2, [4, 5, 4, 2, 0], [0.33, 0.33, 0.66, 0.66, 1.2]),
                     (T["radical"] + 0.3, [7, 8, 7, 5, 4], [0.5, 0.5, 0.7, 0.5, 1.8])]:
        soma(mus, som.frase_flauta(g, r, 1.0, 0.5), t0)
    for t0, g, r in [(T["p11"], [3, 2, 1, 0], [0.5, 0.5, 0.5, 1.4]), (T["p14"], [1, 2, 1, 0], [0.4, 0.4, 0.6, 1.6]),
                     (T["circo"] + 0.4, [0, 1, 2, 1, 0, 1, 2, 3], [0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.8])]:
        soma(mus, som.frase_tensa(g, r, 0.5), t0)

    # efeitos
    soma(sfx, som.carimbo_sfx(), T["titulo"], 0.9)
    soma(sfx, amostra("deep-boom-hit"), T["origem"], 0.6)
    soma(sfx, som.carimbo_sfx(), T["origem"], 0.9)
    soma(sfx, som.carimbo_sfx(), T["meme"], 0.6)
    for k, t0 in enumerate([T["hoje"], T["hoje"] + 0.4, T["hoje"] + 0.8]):
        soma(sfx, som.tique(), t0, 0.8)
    for k in range(10):
        soma(sfx, som.tique(), T["migalhas"] + 0.3 + k * 0.1, 0.5)
    for k in range(1, 16):                            # cada foto que entra na régua: whoosh curto + tique
        soma(sfx, amostra("fast-whoosh-chop"), T[f"p{k}"] - 0.1, 0.45)
        soma(sfx, som.tique(), T[f"p{k}"] + 0.35, 0.8)
    soma(sfx, amostra("reverse-boom-whoosh"), T["visao"] - 1.0, 0.4)
    soma(sfx, amostra("crowd-cheering-and-whistling", 2.5, 0.8), T["circo"] + 0.2, 0.35)
    soma(sfx, som.carimbo_sfx(), T["circo"] + 0.2, 0.9)
    soma(sfx, som.carimbo_sfx(), T["palhaco"], 0.9)
    for k in range(12):                               # narizes de palhaço: "fon fon" (tique agudo em cascata)
        soma(sfx, som.tique(), T["palhaco"] + k * 0.05, 0.6)
    soma(sfx, amostra("digital-glitch-transition"), T["acabar"] - 0.05, 0.8)
    soma(sfx, amostra("deep-boom-hit"), T["acabar"], 0.8)
    soma(sfx, som.carimbo_sfx(), T["acabar"], 0.9)
    soma(sfx, amostra("fast-cloth-flap"), T["radical"] + 0.05, 0.7)
    soma(sfx, som.carimbo_sfx(), T["radical"], 0.9)
    soma(sfx, amostra("metal-boom-hit"), T["radical"], 0.6)
    soma(sfx, som.carimbo_sfx(), T["comente"], 0.8)
    for t0 in [T["regua"], T["circo"]]:
        soma(sfx, amostra("fast-whoosh-chop"), t0 - 0.35, 0.75)
    soma(sfx, som.sino_grave(), T["logo"] - 0.1, 0.9)
    return mus, sfx


if __name__ == "__main__":
    mus, sfx = trilha(T, int(T["dur"] * SR))
    mix = mus * 0.5 + sfx * 0.55
    mix = np.where(np.abs(mix) > 0.7, np.sign(mix) * (0.7 + 0.28 * np.tanh((np.abs(mix) - 0.7) / 0.28)), mix).astype(np.float32)
    som.salvar_wav(str(AQUI / "previa.wav"), mix * 1.02, mix * 0.98)
    print("ok", T["dur"])
