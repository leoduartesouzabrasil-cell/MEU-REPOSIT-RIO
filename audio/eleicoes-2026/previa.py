"""Trilha + efeitos da PRÉVIA (sem narração) de "Não foi golpe. Foi o povo.".
Os tempos espelham os de motor/cenas/eleicoes-2026.js. Saída: audio/eleicoes-2026/previa.wav
"""
import sys
from pathlib import Path

import numpy as np

AQUI = Path(__file__).resolve().parent
sys.path.insert(0, str(AQUI.parent.parent / "motor"))
import som  # noqa: E402
from som import SR, soma  # noqa: E402

T = dict(turno1=2.5, dias21=7.0, turno2=8.5, golpe=13.0, contas=15.0, outros=16.5, voltaram=20.5, brancos=24.5,
         total=28.0, divide=30.0, checklist=33.0, ck1=34.0, ck2=36.8, ck3=39.6, ck4=42.2, naoGolpe=44.0, povo=46.0,
         abst=46.8, desde2006=48.6, nordeste=50.0, rua=51.6, mundo=54.5, franca=55.0, espanha=56.6, historia=58.2,
         cuba=58.8, china=59.6, acabou=61.2, mobilizacao=62.6, logo=64.2, dur=67.5)
N = int(T["dur"] * SR)
mus, sfx = np.zeros(N, np.float32), np.zeros(N, np.float32)

# trilha: suspense (bordão + coração) até "não foi golpe"; depois marcha de tambores crescendo até o fim
soma(mus, som.drone(T["naoGolpe"] + 1, 55.0, 0.3), 0, 0.8)
soma(mus, som.drone_tenso(T["contas"] - T["turno2"] + 1, 41.2), T["turno2"], 0.6)
soma(mus, som.drone(T["dur"] - T["naoGolpe"], 55.0, 0.7), T["naoGolpe"], 1.0)
bat = 60 / 84
t, i = 0.0, 0
while t < T["dur"] - 1:
    if t < T["naoGolpe"]:
        if t > T["dias21"]:
            soma(mus, som.batimento(), t, 0.7 if T["golpe"] <= t < T["contas"] else 0.45)
        soma(mus, som.maraca(0.25), t + bat / 2)
    else:
        forte = 1.0 if t > T["acabou"] else 0.75
        soma(mus, som.tambor(0.9 * forte, 80, 38, 0.9), t)
        if i % 2:
            soma(mus, som.tambor(0.55 * forte, 130, 65, 0.4), t + bat / 2)
        soma(mus, som.maraca(0.35 * forte), t + bat / 2)
    t += bat
    i += 1
for t0, graus, ritmo in [(T["povo"] + 0.2, [5, 6, 7, 8], [0.5, 0.5, 0.5, 1.6]), (T["acabou"] + 0.1, [7, 8, 7, 5, 4], [0.5, 0.5, 0.7, 0.5, 1.8])]:
    soma(mus, som.frase_flauta(graus, ritmo, 1.0, 0.5), t0)

# efeitos
soma(sfx, som.maquina(12, 0.05), 0.1, 0.8)
soma(sfx, som.urna_eletronica(), 1.3, 1.0)
for t0 in [T["turno1"] + 0.3, T["turno2"] + 0.2]:
    soma(sfx, som.contador(1.6, 18), t0, 0.8)
soma(sfx, som.contador(1.2, 21), T["dias21"], 0.9)
for t0 in [T["turno2"] + 2.6, T["golpe"], T["naoGolpe"], T["acabou"], T["mobilizacao"], T["logo"], T["total"],
           T["cuba"], T["china"]]:
    soma(sfx, som.carimbo_sfx(), t0, 0.9)
for t0 in [T["golpe"], T["naoGolpe"], T["acabou"], T["logo"]]:
    soma(sfx, som.boom(), t0, 0.8)
for t0 in [T["golpe"], T["acabou"]]:
    soma(sfx, som.riser(1.3), t0 - 1.3, 0.7)
soma(sfx, som.estatica(0.6) * 6, T["golpe"], 0.8)                       # "glitch" do GOLPE?
for t0 in [T["turno1"], T["dias21"], T["turno2"], T["contas"], T["checklist"], T["povo"], T["mundo"], T["rua"]]:
    soma(sfx, som.whoosh(), t0 - 0.35, 0.8)
for t0 in [T["outros"], T["voltaram"], T["brancos"]]:
    soma(sfx, som.whoosh(0.3), t0, 0.7)
    soma(sfx, som.tique(), t0 + 0.4, 1.0)
soma(sfx, som.contador(1.0, 12), T["divide"], 0.8)
for k in ["ck1", "ck2", "ck3", "ck4"]:
    soma(sfx, som.check(), T[k], 1.0)
    soma(sfx, som.maquina(10, 0.04), T[k] + 0.1, 0.5)
soma(sfx, som.contador(1.4, 16), T["abst"], 0.8)
for k in range(3):
    soma(sfx, som.tique(), T["nordeste"] + k * 0.3, 1.0)
soma(sfx, som.multidao(3.0, 1.0), T["rua"], 1.0)
soma(sfx, som.multidao(6.0, 1.3), T["acabou"], 1.0)
for t0 in [T["franca"], T["espanha"]]:
    soma(sfx, som.tique(), t0, 1.0)
soma(sfx, som.sino_grave(), T["logo"] - 0.1, 0.9)

mix = mus * 0.5 + sfx * 0.55
mix = np.where(np.abs(mix) > 0.7, np.sign(mix) * (0.7 + 0.28 * np.tanh((np.abs(mix) - 0.7) / 0.28)), mix).astype(np.float32)
som.salvar_wav(str(AQUI / "previa.wav"), mix * 1.02, mix * 0.98)
print("ok", T["dur"])
