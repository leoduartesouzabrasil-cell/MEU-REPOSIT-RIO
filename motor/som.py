"""Construtivismo Tropical — síntese de trilha e efeitos sonoros (só numpy + ffmpeg).

Tudo é gerado por código, sem amostras de terceiros: não há problema de direitos autorais.
Taxa padrão 48 kHz; os buffers são mono (np.float32) até a mixagem final em estéreo.
"""
import subprocess
import numpy as np

SR = 48000
_rng = np.random.default_rng(7)


# ---------------------------------------------------------------- utilidades
def segundos(n):
    return np.zeros(int(n * SR), np.float32)


def ruido(dur):
    return _rng.standard_normal(int(dur * SR)).astype(np.float32)


def banda(x, f1, f2):
    """Filtro passa-faixa ideal por FFT (bom para buffers estáticos)."""
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    X[(f < f1) | (f > f2)] = 0
    return np.fft.irfft(X, len(x)).astype(np.float32)


def env(n, a=0.005, d=0.1, s=0.0, r=0.0, total=None):
    """Envelope ataque/decaimento exponencial; n em amostras."""
    t = np.arange(n) / SR
    e = np.where(t < a, t / max(a, 1e-6), np.exp(-(t - a) / max(d, 1e-6)) * (1 - s) + s)
    if r:
        e *= np.clip((n / SR - t) / r, 0, 1)
    return e.astype(np.float32)


def norm(x, pico=0.9):
    m = np.max(np.abs(x)) or 1
    return (x / m * pico).astype(np.float32)


def soma(dest, som, t, ganho=1.0):
    """Mistura `som` em `dest` a partir de t segundos."""
    i = int(t * SR)
    if i >= len(dest) or i + len(som) <= 0:
        return
    j = min(len(dest), i + len(som))
    dest[max(i, 0):j] += som[max(0, -i):j - i] * ganho


def ler_audio(caminho):
    raw = subprocess.run(["ffmpeg", "-loglevel", "error", "-i", caminho, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).copy()


def salvar_wav(caminho, esq, dir=None):
    dir = esq if dir is None else dir
    st = np.stack([esq, dir], 1)
    st = np.clip(st, -1, 1)
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", "-",
                    "-c:a", "pcm_s16le", caminho], input=st.astype(np.float32).tobytes(), check=True)


def envelope_voz(voz, janela=0.08):
    """Envelope suavizado da narração (para o ducking)."""
    n = int(janela * SR)
    k = np.ones(n, np.float32) / n
    e = np.sqrt(np.convolve(voz ** 2, k, "same"))
    e = np.convolve(e, np.ones(int(0.25 * SR), np.float32) / int(0.25 * SR), "same")
    return np.clip(e / (np.percentile(e[e > 1e-4], 90) if np.any(e > 1e-4) else 1), 0, 1)


# ---------------------------------------------------------------- instrumentos (trilha)
def flauta(freq, dur, vel=0.8):
    """Flauta de taquara: seno + harmônico fraco + sopro de ar + vibrato que entra devagar."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    vib = 1 + 0.006 * np.sin(2 * np.pi * 5.2 * t) * np.clip(t / 0.4, 0, 1)
    fase = 2 * np.pi * np.cumsum(freq * vib) / SR
    tom = np.sin(fase) + 0.18 * np.sin(2 * fase) + 0.06 * np.sin(3 * fase)
    ar = banda(ruido(dur), freq * 0.8, freq * 3.5) * 0.35
    e = np.clip(t / 0.09, 0, 1) * np.clip((dur - t) / 0.25, 0, 1)
    e *= 1 - 0.15 * (t / dur)
    return ((tom + ar) * e * vel).astype(np.float32)


def maraca(vel=1.0, dur=0.09):
    """Maracá (chocalho de cabaça com sementes): rajada de ruído agudo com grãos."""
    n = int(dur * SR)
    graos = (_rng.random(n) < 0.25).astype(np.float32) * _rng.standard_normal(n).astype(np.float32)
    x = banda(graos + 0.3 * ruido(dur), 3000, 11000)
    return (x * env(n, 0.004, dur / 3) * vel * 0.5).astype(np.float32)


def tambor(vel=1.0, f0=95, f1=48, dur=0.7):
    """Tambor grave de pele: seno com queda de afinação + estalo."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = f1 + (f0 - f1) * np.exp(-t / 0.05)
    corpo = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.28)
    estalo = banda(ruido(dur), 200, 2500) * np.exp(-t / 0.012) * 0.4
    return ((corpo + estalo) * vel).astype(np.float32)


def drone(dur, base=55.0, brilho=0.3):
    """Pedal grave (bordão) com batimento lento, base da trilha."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    x = (np.sin(2 * np.pi * base * t) + 0.6 * np.sin(2 * np.pi * base * 1.5 * t + 1)
         + 0.35 * np.sin(2 * np.pi * (base * 2 + 0.3) * t) + brilho * 0.2 * np.sin(2 * np.pi * base * 3.01 * t))
    x *= 0.75 + 0.25 * np.sin(2 * np.pi * 0.07 * t)
    return (x * 0.22).astype(np.float32)


def grilos(dur):
    """Ambiente de mata: grilos (seno agudo pulsado) em volume baixo."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    pulsos = (np.sin(2 * np.pi * 28 * t) > 0.6) * (np.sin(2 * np.pi * 0.6 * t) > -0.2)
    return (np.sin(2 * np.pi * 4700 * t) * pulsos * 0.025).astype(np.float32)


def passaro(dur=0.25, f0=2600, f1=3800):
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = f0 + (f1 - f0) * np.sin(np.pi * t / dur) ** 2
    return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / dur) * 0.08).astype(np.float32)


# escala pentatônica menor em Lá (A C D E G), 2 oitavas
PENTA = [220.0, 261.6, 293.7, 329.6, 392.0, 440.0, 523.3, 587.3, 659.3]


def frase_flauta(graus, ritmo, oitava=1.0, vel=0.7):
    """Sequência de notas da flauta. graus = índices em PENTA; ritmo = durações (s)."""
    partes = [flauta(PENTA[g] * oitava, d * 1.15, vel) for g, d in zip(graus, ritmo)]
    total = sum(ritmo) + 0.4
    out = segundos(total)
    t = 0
    for p, d in zip(partes, ritmo):
        soma(out, p, t)
        t += d
    return out


# ---------------------------------------------------------------- efeitos
def carimbo_sfx():
    """Impacto do carimbo: baque grave + tapa de papel."""
    x = tambor(1.0, 120, 40, 0.8)
    papel = banda(ruido(0.12), 800, 6000) * env(int(0.12 * SR), 0.001, 0.03)
    soma(x, papel * 0.6, 0)
    return norm(x, 0.9)


def maquina(n_teclas, intervalo=0.06):
    """Máquina de escrever: cliques secos."""
    out = segundos(n_teclas * intervalo + 0.1)
    for i in range(n_teclas):
        d = 0.025
        c = banda(ruido(d), 1500, 9000) * env(int(d * SR), 0.0005, 0.004)
        c += np.sin(2 * np.pi * 180 * np.arange(int(d * SR)) / SR) * env(int(d * SR), 0.0005, 0.008) * 0.4
        soma(out, c * (0.7 + 0.3 * _rng.random()), i * intervalo * (0.85 + 0.3 * _rng.random()))
    return out * 0.5


def whoosh(dur=0.45):
    """Corte diagonal: sopro que sobe e desce (três faixas de ruído cruzadas)."""
    n = int(dur * SR)
    t = np.arange(n) / SR / dur
    r = ruido(dur)
    b1, b2, b3 = banda(r, 300, 900), banda(r, 900, 2500), banda(r, 2500, 7000)
    x = b1 * np.clip(1 - 2 * t, 0, 1) + b2 * np.sin(np.pi * t) + b3 * np.clip(2 * t - 1, 0, 1)
    return norm(x * np.sin(np.pi * t) ** 2, 0.5)


def gota():
    """Gota d'água: 'ploc' de seno com afinação subindo."""
    dur = 0.18
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = 600 + 1400 * (t / dur) ** 0.6
    return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.05) * 0.5).astype(np.float32)


def estatica(dur=0.6):
    """Chiado de rádio/gravação."""
    n = int(dur * SR)
    x = banda(ruido(dur), 1200, 7000) * (0.6 + 0.4 * (_rng.random(n) > 0.5))
    return (x * env(n, 0.02, dur, 0.6, 0.15) * 0.12).astype(np.float32)


def tique():
    """Clique de contador / etiqueta surgindo."""
    d = 0.03
    n = int(d * SR)
    return (np.sin(2 * np.pi * 1800 * np.arange(n) / SR) * env(n, 0.0005, 0.008) * 0.35).astype(np.float32)


def batimento():
    """Batida de coração (tensão): dois tambores abafados."""
    x = segundos(0.6)
    soma(x, banda(tambor(0.8, 70, 40, 0.3), 30, 300), 0)
    soma(x, banda(tambor(0.55, 70, 40, 0.3), 30, 300), 0.22)
    return x


def sino_grave():
    """Nota de fecho: sino grave longo."""
    dur = 3.5
    t = np.arange(int(dur * SR)) / SR
    x = sum(a * np.sin(2 * np.pi * f * t) * np.exp(-t / d) for f, a, d in
            [(110, 1, 1.6), (220.7, 0.5, 1.0), (331, 0.3, 0.7), (523, 0.15, 0.4)])
    return (x * 0.25).astype(np.float32)


# ---------------------------------------------------------------- modo TENSO
# frígio de Lá, registro grave (a 2ª menor dá o desconforto): A Bb C D E F G A Bb
FRIGIO = [110.0, 116.5, 130.8, 146.8, 164.8, 174.6, 196.0, 220.0, 233.1]


def frase_tensa(graus, ritmo, vel=0.6):
    """Flauta grave em escala frígia, notas longas com leve queda de afinação no fim."""
    out = segundos(sum(ritmo) + 0.6)
    t = 0
    for g, d in zip(graus, ritmo):
        n = flauta(FRIGIO[g] * 2, d * 1.2, vel)
        soma(out, n, t)
        t += d
    return out


def drone_tenso(dur, base=41.2):
    """Bordão com segunda menor (dissonância) e tremolo lento: inquietação contínua."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    x = (np.sin(2 * np.pi * base * t) + 0.5 * np.sin(2 * np.pi * base * 2 * t)
         + 0.28 * np.sin(2 * np.pi * base * 2 * 16 / 15 * t)          # 2ª menor
         + 0.15 * np.sin(2 * np.pi * base * 3 * 1.0595 * t))
    x *= 0.7 + 0.3 * np.sin(2 * np.pi * 0.23 * t) ** 2
    return (x * 0.24).astype(np.float32)


def vento(dur):
    """Vento grave e oco (substitui pássaros e grilos)."""
    x = banda(ruido(dur), 120, 700)
    t = np.arange(len(x)) / SR
    return (x * (0.5 + 0.5 * np.sin(2 * np.pi * 0.11 * t + 1) ** 2) * 0.05).astype(np.float32)


def riser(dur=1.4):
    """Subida de tensão antes do impacto: ruído e tom crescendo, corte seco."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    k = (t / dur) ** 2.2
    r = ruido(dur)
    x = banda(r, 400, 3000) * k * 0.5 + banda(r, 3000, 9000) * k ** 2 * 0.4
    f = 80 + 400 * k
    x += np.sin(2 * np.pi * np.cumsum(f) / SR) * k * 0.4
    return norm(x.astype(np.float32), 0.5)


def boom():
    """Impacto grave (sub) com cauda longa."""
    dur = 2.2
    t = np.arange(int(dur * SR)) / SR
    f = 30 + 70 * np.exp(-t / 0.08)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.7)
    x += banda(ruido(dur), 40, 400) * np.exp(-t / 0.15) * 0.5
    return norm(x.astype(np.float32), 0.95)


def chocalho(dur=0.6, vel=0.6):
    """Maracá em tremolo rápido e irregular (soa como cascavel): alerta."""
    out = segundos(dur + 0.1)
    t = 0.0
    while t < dur:
        soma(out, maraca(vel * (0.5 + 0.5 * _rng.random()), 0.05), t)
        t += 0.028 + 0.02 * _rng.random()
    return out * np.linspace(1, 0.3, len(out)).astype(np.float32)


# ---------------------------------------------------------------- percussão de terreiro e efeitos de impacto
def atabaque(f0=200.0, vel=1.0, tapa=False):
    """Atabaque (rum ~150 Hz, rumpi ~220 Hz, lê ~300 Hz): couro com leve queda de afinação; tapa = som seco."""
    dur = 0.12 if tapa else 0.45
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = f0 * (1 + 0.15 * np.exp(-t / 0.02))
    corpo = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / (0.03 if tapa else 0.16))
    corpo += 0.35 * np.sin(2 * np.pi * np.cumsum(f * 1.59) / SR) * np.exp(-t / 0.06)
    estalo = banda(ruido(dur), 900, 6000) * np.exp(-t / (0.02 if tapa else 0.008)) * (1.2 if tapa else 0.4)
    return ((corpo + estalo) * vel * 0.6).astype(np.float32)


def toque_caboclo(dur, bpm=104):
    """Toque de atabaques para a linha de caboclo (padrão em colcheias: lê constante, rumpi em tresillo, rum dobrando)."""
    out = segundos(dur + 1)
    col = 60 / bpm / 2
    le = [1, 2, 1, 2, 1, 2, 1, 2]          # 1 aberto, 2 tapa
    rumpi = [1, 0, 0, 1, 0, 0, 1, 0]
    rum = [1, 0, 0, 0, 0, 1, 0, 0]
    i, t = 0, 0.0
    while t < dur:
        k = i % 8
        sw = 0.012 if k % 2 else 0.0         # leve suingue
        if le[k]:
            soma(out, atabaque(310, 0.5 if le[k] == 1 else 0.45, le[k] == 2), t + sw)
        if rumpi[k]:
            soma(out, atabaque(225, 0.75), t + sw)
        if rum[k] or (i % 32 >= 28 and k % 2 == 0):  # virada do rum no fim de cada 4 compassos
            soma(out, atabaque(150, 1.0), t + sw)
        t += col
        i += 1
    return out


def tiro(distancia=1.0):
    """Disparo: estampido seco + corpo grave + cauda de eco. distancia > 1 = mais longe (mais abafado)."""
    dur = 1.8
    n = int(dur * SR)
    t = np.arange(n) / SR
    r = ruido(dur)
    estampido = r * np.exp(-t / 0.006) * (1 / distancia)
    medio = banda(r, 180, 2500) * np.exp(-t / 0.05)
    grave = np.sin(2 * np.pi * np.cumsum(55 + 60 * np.exp(-t / 0.03)) / SR) * np.exp(-t / 0.09)
    eco = banda(ruido(dur), 150, 1200) * np.exp(-t / 0.55) * 0.22
    for atraso, g in [(0.18, 0.35), (0.41, 0.2)]:              # reflexões
        d = int(atraso * SR)
        eco[d:] += medio[:n - d] * g
    return norm(estampido + medio + grave * 0.9 + eco, 0.95)


def urna_eletronica():
    """Bipes de confirmação de urna (sequência curta de tons agudos)."""
    out = segundos(1.0)
    for k, f in enumerate([1650, 1650, 1850, 1650, 1850, 2050, 1850]):
        n = int(0.06 * SR)
        tt = np.arange(n) / SR
        b = np.sign(np.sin(2 * np.pi * f * tt)) * 0.25 + np.sin(2 * np.pi * f * tt) * 0.3
        soma(out, (b * np.minimum(1, (0.06 - tt) / 0.01)).astype(np.float32), k * 0.085)
    return out * 0.6


def negacao():
    """Buzina grave de 'errado' (dois tons descendo)."""
    out = segundos(0.8)
    for k, f in enumerate([180, 135]):
        n = int(0.3 * SR)
        tt = np.arange(n) / SR
        x = np.sign(np.sin(2 * np.pi * f * tt)) * 0.4 * np.exp(-tt / 0.4)
        soma(out, banda(x.astype(np.float32), 80, 2500), k * 0.28)
    return out


# ---------------------------------------------------------------- multidão e vitória
def multidao(dur=3.0, intensidade=1.0):
    """Multidão/gritaria distante: ruído vocal filtrado com ondas de entusiasmo."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    x = banda(ruido(dur), 300, 2600) * 0.6 + banda(ruido(dur), 900, 4000) * 0.3
    onda = 0.55 + 0.45 * np.sin(2 * np.pi * 0.6 * t + 1) ** 2
    env_ = np.clip(t / 0.6, 0, 1) * np.clip((dur - t) / 0.8, 0, 1)
    return (x * onda * env_ * 0.35 * intensidade).astype(np.float32)


def check():
    """Confirmação positiva (dois tons subindo) para itens de lista."""
    out = segundos(0.35)
    for k, f in enumerate([880, 1320]):
        n = int(0.12 * SR)
        tt = np.arange(n) / SR
        soma(out, (np.sin(2 * np.pi * f * tt) * np.exp(-tt / 0.06) * 0.4).astype(np.float32), k * 0.08)
    return out


def contador(dur=1.2, passos=14):
    """Números rolando (tiques acelerando) — para contadores na tela."""
    out = segundos(dur + 0.1)
    for k in range(passos):
        soma(out, tique(), dur * (k / passos) ** 0.8)
    return out
