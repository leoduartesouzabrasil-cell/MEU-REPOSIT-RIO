"""Trilha + efeitos da PRÉVIA (sem narração) de "Esquerda cirandeira".
Rock sintetizado (motor/som.py: guitarra distorcida em power chord + bateria): meio-tempo na abertura,
groove na régua, riff frígio na direita, trítono torto no circo, corte seco e guitarra aberta no "radicalize-se". Os tempos espelham motor/cenas/esquerda-cirandeira.js.
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
    """Rock sintetizado (guitarra distorcida em power chord + bateria), crescendo do começo ao "radicalize-se"."""
    mus, sfx = np.zeros(N, np.float32), np.zeros(N, np.float32)
    dur = N / SR
    E, F, G, A, D, Bb = 82.41, 87.31, 98.0, 110.0, 73.42, 116.54
    # abertura: meio-tempo, guitarra abafada (palm mute), entra devagar
    soma(mus, som.rock(T["regua"] - 0.5, riff=((E, 8), (E, 4), (G, 2), (A, 2)), intensidade=0.55, meio_tempo=True), 0.4)
    # régua (esquerda → centro): groove cheio, palhetada abafada com acentos
    soma(mus, som.rock(T["p11"] - T["regua"], riff=((E, 4), (E, 4), (G, 2), (A, 2), (D, 4)), intensidade=0.8), T["regua"])
    # direita e extrema-direita: riff frígio (E–F), mais sombrio
    soma(mus, som.rock(T["circo"] - T["p11"] - 0.3, riff=((E, 6), (F, 2)), intensidade=0.85), T["p11"])
    # circo: meio-tempo com trítono (E–B♭), torto, acelerando a tensão
    soma(mus, som.rock(T["acabar"] - T["circo"], bpm=112, riff=((E, 4), (Bb, 4)), intensidade=0.7, meio_tempo=True), T["circo"])
    # "chega de ciranda": corte seco; "radicalize-se": guitarra aberta, sem abafar, a toda
    soma(mus, som.rock(T["logo"] - T["radical"] + 1.0, bpm=132, riff=((E, 4), (G, 2), (A, 2), (D, 2), (E, 6)),
                       intensidade=1.0, abafado=False), T["radical"])
    for t0 in [T["regua"], T["radical"], T["logo"]]:
        soma(mus, som.prato(0.9), t0, 0.8)
    soma(mus, som.drone(dur, 41.2, 0.2), 0, 0.25)                                     # chão grave por baixo

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
    mix = mus * 0.28 + sfx * 0.5
    mix = np.where(np.abs(mix) > 0.7, np.sign(mix) * (0.7 + 0.28 * np.tanh((np.abs(mix) - 0.7) / 0.28)), mix).astype(np.float32)
    som.salvar_wav(str(AQUI / "previa.wav"), mix * 1.02, mix * 0.98)
    print("ok", T["dur"])
