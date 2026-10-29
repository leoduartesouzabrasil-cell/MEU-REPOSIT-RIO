"""Sintetiza a trilha de efeitos sonoros do vídeo (sem arquivos externos).

Os tempos seguem as animações de gerar_video.py.
"""
import wave

import numpy as np

SR = 44100
rng = np.random.default_rng(6)


def _t(dur):
    return np.arange(int(SR * dur)) / SR


def _env(n, ataque=0.005, decai=8.0):
    t = np.arange(n) / SR
    a = np.minimum(1, t / ataque)
    return a * np.exp(-decai * t)


def whoosh(dur=0.6):
    n = int(SR * dur)
    ruido = rng.standard_normal(n)
    # passa-baixa cuja frequência de corte sobe e desce: "vuuush"
    t = np.arange(n) / n
    corte = 0.02 + 0.25 * np.sin(np.pi * t) ** 2
    saida = np.zeros(n)
    y = 0.0
    for i in range(n):
        y += corte[i] * (ruido[i] - y)
        saida[i] = y
    return saida * np.sin(np.pi * t) ** 1.5 * 1.6


def impacto():
    t = _t(0.9)
    freq = 110 * np.exp(-3 * t) + 40
    corpo = np.sin(2 * np.pi * np.cumsum(freq) / SR) * np.exp(-4 * t)
    estalo = rng.standard_normal(len(t)) * np.exp(-40 * t) * 0.4
    return (corpo + estalo) * 0.9


def pop(freq=520):
    t = _t(0.15)
    f = freq * (1 + 0.8 * np.exp(-30 * t))
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * _env(len(t), 0.002, 28) * 0.6


def tick(freq=1800):
    t = _t(0.03)
    return np.sin(2 * np.pi * freq * t) * _env(len(t), 0.001, 120) * 0.25


def sino(freq=880, dur=1.2, vol=0.45):
    t = _t(dur)
    onda = (np.sin(2 * np.pi * freq * t) + 0.4 * np.sin(2 * np.pi * freq * 2 * t)
            + 0.15 * np.sin(2 * np.pi * freq * 3.01 * t))
    return onda * _env(len(t), 0.003, 4.5) * vol


def blip():
    t = _t(0.12)
    f = 600 + 900 * t / 0.12
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * _env(len(t), 0.003, 25) * 0.3


def kick():
    t = _t(0.3)
    f = 50 + 90 * np.exp(-25 * t)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-12 * t)


def chimbal():
    t = _t(0.05)
    ruido = np.diff(rng.standard_normal(len(t) + 1))
    return ruido * np.exp(-70 * t) * 0.12


def gerar(caminho, duracao):
    trilha = np.zeros(int(SR * duracao) + SR)

    def add(som, inicio, vol=1.0):
        i = int(inicio * SR)
        trilha[i:i + len(som)] += som[: len(trilha) - i] * vol

    # batida de fundo leve (120 bpm), parando antes do final
    for k in range(int((duracao - 1) * 2)):
        b = k * 0.5
        add(kick(), b, 0.35)
        add(chimbal(), b + 0.25)

    # transições de cena
    for inicio in (0.0, 2.9, 7.9, 12.9, 16.9):
        add(whoosh(), inicio, 0.5)

    # título: impacto quando o "6x1" cresce
    add(impacto(), 0.4)
    add(blip(), 1.2)

    # semana: um pop por dia de trabalho, sino na folga de domingo
    for i in range(6):
        add(pop(480 + i * 25), 3.5 + i * 0.35)
    add(sino(1046.5), 3.5 + 6 * 0.35)
    add(sino(1318.5, vol=0.3), 3.5 + 6 * 0.35 + 0.12)
    add(blip(), 6.2)

    # números: contadores com ticks acelerando e sino ao terminar
    for inicio, alvo_freq in ((8.4, 1500), (9.6, 1900)):
        for k in range(24):
            x = k / 24
            # inverso do ease-out do contador: ticks rápidos no início, lentos no fim
            add(tick(alvo_freq + 600 * x), inicio + 1.2 * (1 - (1 - x) ** (1 / 3)))
        add(sino(784 if inicio < 9 else 988, 0.9, 0.35), inicio + 1.2)
    add(blip(), 11.0)

    # debate: pops subindo de tom para 6x1 > 5x2 > 4x3
    for i, f in enumerate((392, 523, 659)):
        add(pop(f), 14.2 + i * 0.5, 1.2)
    add(blip(), 15.6)

    # final: arpejo alegre e brilho
    for i, f in enumerate((523.3, 659.3, 784.0, 1046.5)):
        add(sino(f, 1.6, 0.35), 17.4 + i * 0.12)
    for k in range(6):
        add(tick(2600 + 300 * k), 18.0 + k * 0.06)

    trilha = trilha[: int(SR * duracao)]
    # fade-out no último meio segundo
    n = int(SR * 0.5)
    trilha[-n:] *= np.linspace(1, 0, n)
    # limitador suave: sobe o volume geral sem deixar o impacto estourar
    trilha = trilha / max(1e-9, np.percentile(np.abs(trilha), 99.5))
    trilha = np.tanh(trilha * 0.9) * 0.95

    pcm = (trilha * 32767).astype(np.int16)
    with wave.open(str(caminho), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())


# --- sons extras do estilo "documentário editorial" (gerar_video_estilo.py) ---


def tecla():
    t = _t(0.04)
    ruido = np.diff(rng.standard_normal(len(t) + 1))
    clique = np.sin(2 * np.pi * rng.uniform(2200, 3200) * t)
    return (ruido * 0.5 + clique * 0.3) * np.exp(-110 * t) * 0.35


def risco(dur=0.18):
    """Caneta riscando o papel."""
    n = int(SR * dur)
    t = np.arange(n) / SR
    ruido = np.diff(rng.standard_normal(n + 1))
    aspereza = 0.6 + 0.4 * np.sin(2 * np.pi * 55 * t)
    return ruido * aspereza * np.sin(np.pi * t / dur) * 0.3


def corte():
    """Estalo curto de corte seco, com um grave por baixo."""
    t = _t(0.12)
    ruido = rng.standard_normal(len(t)) * np.exp(-60 * t) * 0.3
    grave = np.sin(2 * np.pi * (70 + 60 * np.exp(-40 * t)) * t) * np.exp(-25 * t) * 0.6
    return ruido + grave


def drone(duracao):
    """Cama sonora grave e tensa, com relógio tiquetaqueando."""
    t = _t(duracao)
    lento = 0.6 + 0.4 * np.sin(2 * np.pi * t / 7)
    som = (np.sin(2 * np.pi * 55 * t) + 0.5 * np.sin(2 * np.pi * 82.4 * t)
           + 0.25 * np.sin(2 * np.pi * 110.3 * t)) * lento * 0.18
    entrada = np.minimum(1, t / 1.0)
    som *= entrada
    for k in range(int(duracao * 2)):
        som_tick = tick(1200 if k % 2 == 0 else 900) * 0.6
        i = int(k * 0.5 * SR)
        som[i:i + len(som_tick)] += som_tick[: len(som) - i]
    return som


SONS = {
    "corte": corte, "tecla": tecla, "risco": risco, "pop": pop, "blip": blip,
    "tick": tick, "sino": sino, "impacto": impacto, "whoosh": whoosh,
}


def mixar(caminho, duracao, eventos):
    """eventos: lista de (tempo, som, volume); som é um nome de SONS ou uma função."""
    trilha = np.zeros(int(SR * duracao) + SR)

    def add(som, inicio, vol=1.0):
        i = int(inicio * SR)
        trilha[i:i + len(som)] += som[: len(trilha) - i] * vol

    add(drone(duracao), 0)
    for inicio, som, vol in eventos:
        add(som() if callable(som) else SONS[som](), inicio, vol)

    trilha = trilha[: int(SR * duracao)]
    n = int(SR * 0.6)
    trilha[-n:] *= np.linspace(1, 0, n)
    trilha = trilha / max(1e-9, np.percentile(np.abs(trilha), 99.5))
    trilha = np.tanh(trilha * 0.9) * 0.95

    pcm = (trilha * 32767).astype(np.int16)
    with wave.open(str(caminho), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())
