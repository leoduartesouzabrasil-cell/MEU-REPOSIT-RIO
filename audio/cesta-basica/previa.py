"""Trilha + efeitos da PRÉVIA (sem narração) de "A sua compra no mercado vai ficar mais cara com o Lula?".
Rock sintetizado (motor/som.py) em três momentos: tenso no gancho, groove na votação, aberto no "aprovado" e na maioria.
Os tempos espelham motor/cenas/cesta-basica.js. Saída: audio/cesta-basica/previa.wav
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

T = dict(titulo=0.3, sera=2.6, votacao=5.0, placar=8.0, sim=8.6, nao=10.4, contra=12.4, esquerda=19.0,
         aprovado=23.0, itens=24.4, taxa=28.6, maioria=32.6, m2027=33.6, precisa=37.0, olho=40.4, lembre=43.0, lembre2=45.4, logo=49.0,
         dur=52.4)


def trilha(T, N):
    mus, sfx = np.zeros(N, np.float32), np.zeros(N, np.float32)
    dur = N / SR
    E, F, G, A, D = 82.41, 87.31, 98.0, 110.0, 73.42
    soma(mus, som.rock(T["votacao"] - 0.3, riff=((E, 6), (F, 2)), intensidade=0.5, meio_tempo=True), 0.2)
    soma(mus, som.rock(T["aprovado"] - T["votacao"], riff=((E, 4), (G, 2), (A, 2)), intensidade=0.7), T["votacao"])
    soma(mus, som.rock(T["logo"] - T["aprovado"] + 0.5, bpm=132, riff=((E, 4), (G, 2), (A, 2), (D, 2), (E, 6)),
                       intensidade=0.95, abafado=False), T["aprovado"])
    for t0 in [T["votacao"], T["aprovado"], T["logo"]]:
        soma(mus, som.prato(0.9), t0, 0.8)
    soma(mus, som.drone(dur, 41.2, 0.2), 0, 0.25)

    soma(sfx, som.carimbo_sfx(), T["titulo"], 0.9)
    soma(sfx, som.contador(1.6, 14), T["titulo"] + 0.6, 0.6)                 # preço subindo
    soma(sfx, som.carimbo_sfx(), T["sera"], 0.9)
    soma(sfx, amostra("deep-boom-hit"), T["sera"], 0.6)
    soma(sfx, som.carimbo_sfx(), T["votacao"] + 0.3, 0.8)
    for k in range(20):                                                       # cadeiras acendendo no plenário
        soma(sfx, som.tique(), T["placar"] + k * 0.08, 0.35)
    soma(sfx, som.contador(1.0, 12), T["sim"], 0.7)
    soma(sfx, som.contador(1.0, 12), T["nao"], 0.7)
    passo = (T["esquerda"] - T["contra"] - 1.0) / 10
    for i in range(10):                                                       # cada um que votou contra: whoosh + carimbo NÃO
        soma(sfx, amostra("fast-whoosh-chop"), T["contra"] + 0.4 + i * passo - 0.05, 0.4)
        soma(sfx, som.negacao(), T["contra"] + 0.65 + i * passo, 0.35)
    for k in range(7):
        soma(sfx, som.check(), T["esquerda"] + 0.5 + k * 0.2, 0.6)
    soma(sfx, amostra("reverse-boom-whoosh"), T["aprovado"] - 2.3, 0.5)
    soma(sfx, som.carimbo_sfx(), T["aprovado"], 1.0)
    soma(sfx, amostra("metal-boom-hit"), T["aprovado"], 0.6)
    soma(sfx, amostra("crowd-cheering-and-whistling", 2.0, 0.6), T["aprovado"] + 0.1, 0.35)
    for k in range(8):
        soma(sfx, som.tique(), T["itens"] + k * 0.4, 0.8)
        soma(sfx, som.check(), T["taxa"] + k * 0.12, 0.4)
    soma(sfx, som.carimbo_sfx(), T["taxa"] + 1.2, 0.9)
    for t0 in [T["votacao"], T["maioria"]]:
        soma(sfx, amostra("fast-whoosh-chop"), t0 - 0.35, 0.75)
    for k in range(20):
        soma(sfx, som.tique(), T["m2027"] + k * 0.09, 0.35)
    soma(sfx, som.carimbo_sfx(), T["precisa"], 0.9)
    soma(sfx, amostra("deep-boom-hit"), T["precisa"], 0.6)
    soma(sfx, amostra("fast-whoosh-chop"), T["lembre"] - 0.35, 0.75)
    for k in range(2):
        soma(sfx, amostra("fast-whoosh-chop"), T["lembre"] + 0.2 + k * 0.3, 0.5)
        soma(sfx, som.negacao(), T["lembre"] + 0.9 + k * 0.3, 0.6)
    soma(sfx, som.carimbo_sfx(), T["lembre2"], 1.0)
    soma(sfx, amostra("deep-boom-hit"), T["lembre2"], 0.7)
    soma(sfx, som.sino_grave(), T["logo"] - 0.1, 0.9)
    return mus, sfx


if __name__ == "__main__":
    mus, sfx = trilha(T, int(T["dur"] * SR))
    mix = mus * 0.28 + sfx * 0.5
    mix = np.where(np.abs(mix) > 0.7, np.sign(mix) * (0.7 + 0.28 * np.tanh((np.abs(mix) - 0.7) / 0.28)), mix).astype(np.float32)
    som.salvar_wav(str(AQUI / "previa.wav"), mix * 1.02, mix * 0.98)
    print("ok", T["dur"])
