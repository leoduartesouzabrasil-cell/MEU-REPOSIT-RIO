"""Trilha + efeitos da PRÉVIA (sem narração) de "Não foi golpe. Foi o povo.".
Os tempos espelham os de motor/cenas/eleicoes-2026.js. Saída: audio/eleicoes-2026/previa.wav
"""
import sys
from pathlib import Path

import numpy as np

AQUI = Path(__file__).resolve().parent
sys.path.insert(0, str(AQUI.parent.parent / "motor"))
import som  # noqa: E402
from som import SR  # noqa: E402
from trilha import trilha  # noqa: E402

T = dict(turno1=2.2, mapa=6.2, mapaVira=9.4, turno2=12.0, golpe=16.0, contas=18.0, outros=19.5, voltaram=22.5,
         brancos=25.5, total=28.5, divide=30.5, checklist=33.5, ck1=34.3, ck2=36.6, ck3=38.9, ck4=41.2, naoGolpe=43.0,
         soberania=44.5, fogo=45.6, soberano=48.0, povo=50.0, abst=50.8, desde2006=52.6, nordeste=54.0, rua=55.6,
         mundo=58.0, franca=58.3, espanha=60.6, cuba=62.6, cubaLideres=65.2, china=68.4, chinaLider=70.8, organizado=73.8,
         acabou=77.4, mobilizacao=78.8, logo=80.8, dur=84.3)
mus, sfx = trilha(T, int(T["dur"] * SR))
mix = mus * 0.5 + sfx * 0.55
mix = np.where(np.abs(mix) > 0.7, np.sign(mix) * (0.7 + 0.28 * np.tanh((np.abs(mix) - 0.7) / 0.28)), mix).astype(np.float32)
som.salvar_wav(str(AQUI / "previa.wav"), mix * 1.02, mix * 0.98)
print("ok", T["dur"])
