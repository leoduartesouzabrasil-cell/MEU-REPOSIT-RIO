"""Trilha + efeitos da PRÉVIA (sem narração) de "Uma nova via" (Lula × Jones Manoel).
Os tempos espelham os de motor/cenas/jones-manoel-2030.js. Saída: audio/jones-manoel-2030/previa.wav
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

T = dict(lula=0.3, jones=2.3, concilia=4.6, comunista=10.2, virada=15.6, vencemos=16.2, naoBasta=19.6, novaVia=21.6,
         diferencas=25.6, d1=26.0, d2=29.6, d3=34.6, d4=39.6, d5=43.0, mais=46.6, votos=52.4, eterno=56.0,
         jones2030=58.2, organize=60.6, logo=64.0, dur=67.4)


def trilha(T, N):
    mus, sfx = np.zeros(N, np.float32), np.zeros(N, np.float32)
    # trilha: ARQUIVO calmo (bordão + maracá) até a virada; silêncio tenso no "não basta"; marcha crescendo da nova via ao fim
    soma(mus, som.drone(T["virada"] + 1, 55.0, 0.3), 0, 0.7)
    soma(mus, som.drone_tenso(T["novaVia"] - T["naoBasta"] + 0.5, 41.2), T["naoBasta"], 0.7)
    soma(mus, som.drone(T["dur"] - T["novaVia"], 55.0, 0.7), T["novaVia"], 1.0)
    bat = 60 / 88
    t, i = 0.0, 0
    while t < T["dur"] - 1:
        if t < T["virada"]:
            soma(mus, som.maraca(0.25), t + bat / 2)
            if i % 4 == 0:
                soma(mus, som.tambor(0.4, 90, 45, 0.6), t)
        elif t < T["naoBasta"]:
            soma(mus, som.tambor(0.9, 80, 38, 0.9), t)
            soma(mus, som.maraca(0.35), t + bat / 2)
        elif t < T["novaVia"]:
            soma(mus, som.batimento(), t, 0.6)
        else:
            forte = 1.0 if t > T["votos"] else 0.75
            soma(mus, som.tambor(0.9 * forte, 80, 38, 0.9), t)
            if i % 2:
                soma(mus, som.tambor(0.55 * forte, 130, 65, 0.4), t + bat / 2)
            soma(mus, som.maraca(0.35 * forte), t + bat / 2)
        t += bat
        i += 1
    for t0, graus, ritmo in [(T["novaVia"] + 0.3, [5, 6, 7, 8], [0.5, 0.5, 0.5, 1.6]),
                             (T["organize"] + 0.1, [7, 8, 7, 5, 4], [0.5, 0.5, 0.7, 0.5, 1.8])]:
        soma(mus, som.frase_flauta(graus, ritmo, 1.0, 0.5), t0)

    # efeitos
    for k in ["lula", "jones"]:
        soma(sfx, amostra("fast-whoosh-chop"), T[k] - 0.1, 0.8)
        soma(sfx, som.carimbo_sfx(), T[k] + 0.45, 0.6)
    for k in ["concilia", "comunista"]:
        soma(sfx, som.carimbo_sfx(), T[k] + 0.3, 0.9)
        soma(sfx, som.maquina(14, 0.04), T[k] + 1.2, 0.6)
    soma(sfx, amostra("reverse-boom-whoosh"), T["virada"] - 2.3, 0.5)
    soma(sfx, som.urna_eletronica(), T["virada"] + 0.2, 0.9)
    soma(sfx, amostra("crowd-cheering-and-whistling", 3.0, 0.8), T["vencemos"], 0.6)
    soma(sfx, amostra("digital-glitch-transition"), T["naoBasta"] - 0.05, 0.9)
    soma(sfx, amostra("reverse-boom-whoosh"), T["novaVia"] - 2.3, 0.5)
    soma(sfx, som.riser(1.2), T["jones2030"] - 1.2, 0.6)
    for t0 in [T["vencemos"], T["naoBasta"], T["novaVia"], T["jones2030"], T["organize"], T["logo"]]:
        soma(sfx, som.carimbo_sfx(), t0, 0.9)
        soma(sfx, amostra("deep-boom-hit"), t0, 0.7)
    for t0 in [T["concilia"], T["virada"], T["diferencas"], T["votos"]]:
        soma(sfx, amostra("fast-whoosh-chop"), t0 - 0.35, 0.75)
    for k in range(5):                                               # etiquetas do "o que mais Jones defende"
        soma(sfx, som.carimbo_sfx(), T.get(f"m{k + 1}", T["mais"] + 0.4 + k * 0.9) + 0.05, 0.5)
    soma(sfx, amostra("fast-whoosh-chop"), T["mais"] - 0.35, 0.75)
    for k in ["d1", "d2", "d3", "d4", "d5"]:
        soma(sfx, som.whoosh(0.3), T[k], 0.6)
        soma(sfx, som.tique(), T[k] + 0.5, 0.9)
        n = k[1]
        soma(sfx, som.negacao(), T.get("g" + n, T[k] + 0.5) + 0.5, 0.5)    # ✗ do governo
        soma(sfx, som.check(), T.get("j" + n, T[k] + 1.5) + 0.5, 1.0)      # ✓ do Jones
    soma(sfx, som.contador(1.2, 10), T.get("g1", T["d1"] + 0.5), 0.6)
    soma(sfx, som.contador(1.4, 16), T["votos"] + 0.2, 0.8)
    soma(sfx, amostra("fast-cloth-flap"), T["jones2030"] + 0.05, 0.6)
    soma(sfx, som.carimbo_sfx(), T.get("comente", T["logo"]), 0.8)
    soma(sfx, som.sino_grave(), T["logo"] - 0.1, 0.9)
    return mus, sfx


if __name__ == "__main__":
    mus, sfx = trilha(T, int(T["dur"] * SR))
    mix = mus * 0.5 + sfx * 0.55
    mix = np.where(np.abs(mix) > 0.7, np.sign(mix) * (0.7 + 0.28 * np.tanh((np.abs(mix) - 0.7) / 0.28)), mix).astype(np.float32)
    som.salvar_wav(str(AQUI / "previa.wav"), mix * 1.02, mix * 0.98)
    print("ok", T["dur"])
