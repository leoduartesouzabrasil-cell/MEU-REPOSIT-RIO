"""Trilha + efeitos da PRÉVIA (sem narração) de "Renan Santos: da direita para a extrema-direita".
Mesmo rock sintetizado da "Esquerda cirandeira" (motor/som.py): groove na régua, riff frígio sombrio no dossiê, corte seco e
guitarra aberta no cartaz, trítono torto na ciranda; no retrato final a banda para e fica só o grave. Os tempos espelham motor/cenas/renan-santos.js.
Saída: audio/renan-santos/previa.wav
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

T = dict(titulo=0.3, pan=0.5, c1=4.0, c2=4.8, c3=5.6, razao=7.4, dossie=9.6, mbl=10.6, missao=11.4, votos=12.2,
         f1=14.2, f2=18.0, f3=21.8, f4=26.0, cartaz=30.6, extrema=32.2, corrige=34.6, risco=35.2, pula=35.9,
         corrigida=38.0, volta=38.9, soraya=39.5, visao=40.6, ciranda=43.0, cresce=45.0, terno=47.0, mesmo=48.8, quadro=51.0, engane=52.6, amigo=53.6, logo=55.8,
         dur=59.0)


def trilha(T, N):
    mus, sfx = np.zeros(N, np.float32), np.zeros(N, np.float32)
    dur = N / SR
    E, F, G, A, D, Bb = 82.41, 87.31, 98.0, 110.0, 73.42, 116.54
    # a régua volta: o groove da esquerda cirandeira; para seco no "vocês tinham razão"
    soma(mus, som.rock(T["razao"] - 0.1, bpm=140, riff=((E, 4), (E, 4), (G, 2), (A, 2), (D, 4)), intensidade=0.75), 0, 0.9)
    # dossiê: riff frígio (E–F), abafado, sombrio
    soma(mus, som.rock(T["cartaz"] - T["dossie"] - 0.2, riff=((E, 6), (F, 2)), intensidade=0.7), T["dossie"])
    # cartaz e régua corrigida: guitarra aberta
    soma(mus, som.rock(T["ciranda"] - T["cartaz"], bpm=132, riff=((E, 4), (G, 2), (A, 2), (D, 2), (E, 6)),
                       intensidade=0.95, abafado=False), T["cartaz"])
    # ciranda × extrema-direita: meio-tempo com trítono, torto
    soma(mus, som.rock(T["quadro"] - T["ciranda"], bpm=112, riff=((E, 4), (Bb, 4)), intensidade=0.7, meio_tempo=True), T["ciranda"])
    # retrato na moldura: a banda para; um acorde aberto soa e some, e o prato marca "ele não é seu amigo"
    soma(mus, som.rock(1.6, bpm=132, riff=((E, 8),), intensidade=0.8, abafado=False), T["quadro"], 0.7)
    for t0 in [T["dossie"], T["cartaz"], T["quadro"], T["amigo"], T["logo"]]:
        soma(mus, som.prato(0.9), t0, 0.8)
    soma(mus, som.drone(dur, 41.2, 0.2), 0, 0.25)

    # efeitos
    soma(sfx, som.carimbo_sfx(), T["titulo"], 0.7)
    soma(sfx, amostra("fast-whoosh-chop"), T["pan"], 0.6)
    for k in range(10):                                   # a régua passando pelas fotos
        soma(sfx, som.tique(), T["pan"] + 0.3 + k * 0.22, 0.5)
    for t0 in [T["c1"], T["c2"], T["c3"]]:                # os comentários pipocando
        soma(sfx, som.tique(), t0, 0.9)
        soma(sfx, som.carimbo_sfx(), t0, 0.35)
    soma(sfx, amostra("digital-glitch-transition"), T["razao"] - 0.05, 0.7)
    soma(sfx, amostra("deep-boom-hit"), T["razao"], 0.8)
    soma(sfx, som.carimbo_sfx(), T["razao"], 0.9)
    for t0 in [T["mbl"], T["missao"], T["votos"]]:
        soma(sfx, som.tique(), t0, 0.8)
    for k in ["f1", "f2", "f3", "f4"]:                    # cada ficha: whoosh, datilografia e a seleção
        soma(sfx, amostra("fast-whoosh-chop"), T[k] - 0.1, 0.5)
        for q in range(14):
            soma(sfx, som.tique(), T[k] + 0.3 + q * 0.05, 0.35)
        soma(sfx, som.carimbo_sfx(), T[k] + 2.0, 0.5)
    soma(sfx, amostra("fast-whoosh-chop"), T["cartaz"] - 0.35, 0.75)
    soma(sfx, som.carimbo_sfx(), T["cartaz"] + 0.1, 0.9)
    soma(sfx, amostra("metal-boom-hit"), T["extrema"], 0.7)
    soma(sfx, som.carimbo_sfx(), T["extrema"] + 0.15, 0.9)
    soma(sfx, amostra("fast-whoosh-chop"), T["corrige"] - 0.35, 0.7)
    soma(sfx, som.carimbo_sfx(), T["risco"], 0.6)
    soma(sfx, som.riser(1.6), T["pula"] - 0.2, 0.5)
    soma(sfx, amostra("deep-boom-hit"), T["pula"] + 1.8, 0.8)
    soma(sfx, som.carimbo_sfx(), T["corrigida"], 0.8)
    soma(sfx, amostra("fast-whoosh-chop"), T["volta"], 0.5)
    soma(sfx, som.tique(), T["soraya"] + 0.35, 0.8)
    soma(sfx, amostra("reverse-boom-whoosh"), T["visao"] - 1.0, 0.4)
    soma(sfx, amostra("fast-whoosh-chop"), T["ciranda"] - 0.35, 0.7)
    soma(sfx, som.riser(2.0), T["cresce"], 0.4)
    soma(sfx, amostra("fast-cloth-flap"), T["terno"], 0.6)
    soma(sfx, amostra("deep-boom-hit"), T["mesmo"], 0.8)
    soma(sfx, som.carimbo_sfx(), T["mesmo"], 0.9)
    soma(sfx, amostra("fast-whoosh-chop"), T["quadro"] - 0.35, 0.7)
    soma(sfx, som.carimbo_sfx(), T["quadro"] + 0.1, 0.6)
    for k in range(3):                                    # "não se engane," palavra por palavra
        soma(sfx, som.tique(), T["engane"] + k * 0.15, 0.6)
    soma(sfx, amostra("deep-boom-hit"), T["amigo"], 0.9)
    soma(sfx, som.carimbo_sfx(), T["amigo"], 0.9)
    soma(sfx, amostra("fast-whoosh-chop"), T["logo"] - 0.35, 0.6)
    soma(sfx, som.carimbo_sfx(), T["logo"], 0.8)
    soma(sfx, som.sino_grave(), T["logo"] - 0.1, 0.9)
    return mus, sfx


if __name__ == "__main__":
    mus, sfx = trilha(T, int(T["dur"] * SR))
    mix = mus * 0.28 + sfx * 0.5
    mix = np.where(np.abs(mix) > 0.7, np.sign(mix) * (0.7 + 0.28 * np.tanh((np.abs(mix) - 0.7) / 0.28)), mix).astype(np.float32)
    som.salvar_wav(str(AQUI / "previa.wav"), mix * 1.02, mix * 0.98)
    print("ok", T["dur"])
