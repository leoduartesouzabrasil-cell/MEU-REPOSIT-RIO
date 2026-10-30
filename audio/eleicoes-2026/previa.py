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

T = dict(turno1=2.2, mapa=6.2, mapaVira=9.4, turno2=12.0, golpe=16.0, contas=18.0, outros=19.5, voltaram=22.5,
         brancos=25.5, total=28.5, divide=30.5, checklist=33.5, ck1=34.3, ck2=36.6, ck3=38.9, ck4=41.2, naoGolpe=43.0,
         soberania=44.5, fogo=45.6, soberano=48.0, povo=50.0, abst=50.8, desde2006=52.6, nordeste=54.0, rua=55.6,
         mundo=58.0, franca=58.3, espanha=60.6, cuba=62.6, cubaLideres=65.2, china=68.4, chinaLider=70.8, organizado=73.8,
         acabou=77.4, mobilizacao=78.8, logo=80.8, dur=84.3)
T["dias21"] = T["mapa"] + 2.0          # "21 dias depois…" no mapa
T["historia"] = T["cuba"]
SFX = AQUI.parent / "sfx"              # amostras do Soundza (licença Soundza Standard, uso livre em vídeos)


def amostra(nome, dur=None, fade=0.3):
    """Carrega audio/sfx/soundza-<nome>.wav em mono, cortado em `dur` s com fade de saída."""
    a = som.ler_audio(str(SFX / f"soundza-{nome}.wav"))
    a = (a.mean(axis=0) if a.ndim > 1 and a.shape[0] <= 2 else a).astype(np.float32)
    if dur:
        a = a[:int(dur * SR)].copy()
        f = int(fade * SR); a[-f:] *= np.linspace(1, 0, f)
    return a / (np.abs(a).max() + 1e-9)


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
soma(sfx, som.contador(1.2, 21), T["dias21"], 0.6)
for k in range(27):                                                  # estados entrando no mapa
    soma(sfx, som.tique(), T["mapa"] + 0.1 + k * 0.04, 0.35)
soma(sfx, amostra("reverse-boom-whoosh"), T["mapaVira"] - 2.3, 0.6)
soma(sfx, amostra("deep-boom-hit"), T["mapaVira"], 0.9)
soma(sfx, som.carimbo_sfx(), T["mapaVira"] + 0.3, 0.8)

# soberania: o cartaz pega fogo
soma(sfx, amostra("burning-paper-crackle", 4.0, 0.8), T["fogo"], 1.0)
soma(sfx, amostra("reverse-boom-whoosh"), T["soberano"] - 2.3, 0.5)
soma(sfx, amostra("metal-boom-hit"), T["soberano"], 0.9)
# bandeiras: tecido batendo a cada país + multidão de verdade nas ruas
for k in ["franca", "espanha", "cuba", "china", "organizado"]:
    soma(sfx, amostra("fast-cloth-flap"), T[k] + 0.05, 0.8)
soma(sfx, amostra("crowd-cheering-and-whistling", 2.2, 0.6), T["franca"], 0.45)
soma(sfx, amostra("crowd-cheering-and-whistling", 6.0, 1.5), T["acabou"], 0.6)
# líderes: sobe o sol, entra o recorte com impacto, a seta "risca" até o rosto
for t0, n in [(T["cubaLideres"], 2), (T["chinaLider"], 1)]:
    soma(sfx, amostra("reverse-boom-whoosh"), t0 - 2.0, 0.4)
    soma(sfx, amostra("deep-boom-hit"), t0 + 0.3, 0.8)
    for k in range(n):
        soma(sfx, amostra("fast-whoosh-chop"), t0 + 0.1 + k * 0.8, 0.6)
        soma(sfx, som.carimbo_sfx(), t0 + 0.6 + k * 0.9, 0.6)
soma(sfx, som.carimbo_sfx(), T["organizado"] + 0.5, 0.8)
soma(sfx, som.carimbo_sfx(), T["organizado"] + 1.4, 0.9)
for t0 in [T["turno2"] + 2.6, T["golpe"], T["naoGolpe"], T["acabou"], T["mobilizacao"], T["logo"], T["total"],
           T["soberano"], T["cuba"], T["china"]]:
    soma(sfx, som.carimbo_sfx(), t0, 0.9)
for t0 in [T["golpe"], T["naoGolpe"], T["acabou"], T["logo"]]:
    soma(sfx, amostra("deep-boom-hit"), t0, 0.8)
for t0 in [T["golpe"], T["acabou"]]:
    soma(sfx, som.riser(1.3), t0 - 1.3, 0.7)
soma(sfx, amostra("digital-glitch-transition"), T["golpe"], 0.9)                       # "glitch" do GOLPE?
for t0 in [T["turno1"], T["mapa"], T["turno2"], T["contas"], T["checklist"], T["soberania"], T["povo"], T["mundo"], T["rua"]]:
    soma(sfx, amostra("fast-whoosh-chop"), t0 - 0.35, 0.75)
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
soma(sfx, som.multidao(6.0, 1.3), T["acabou"], 0.6)
soma(sfx, som.sino_grave(), T["logo"] - 0.1, 0.9)

mix = mus * 0.5 + sfx * 0.55
mix = np.where(np.abs(mix) > 0.7, np.sign(mix) * (0.7 + 0.28 * np.tanh((np.abs(mix) - 0.7) / 0.28)), mix).astype(np.float32)
som.salvar_wav(str(AQUI / "previa.wav"), mix * 1.02, mix * 0.98)
print("ok", T["dur"])
