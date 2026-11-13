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


def arranhao(dur=0.7):
    """Disco arranhado + parada de disco (o corte seco do "mentira"): ruído com a afinação indo e voltando, e um tom
    caindo como um toca-discos freando."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    # duas puxadas de scratch (vai e volta) na primeira metade
    fc = 900 + 700 * np.sin(2 * np.pi * 5.5 * t) * (t < dur * 0.45)
    r = ruido(dur)
    ras = np.zeros(n, np.float32)
    for f0 in (500, 1200, 2600):
        ras += banda(r, f0 * 0.7, f0 * 1.4) * (0.5 + 0.5 * np.sin(2 * np.pi * np.cumsum(fc) / SR * 0.01))
    ras *= (t < dur * 0.45) * np.abs(np.sin(2 * np.pi * 5.5 * t))
    # a parada: tom grave descendo de 260 a 30 Hz
    f = 260 * (1 - np.clip((t - dur * 0.35) / (dur * 0.65), 0, 1)) ** 2 + 30
    freio = np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * (t > dur * 0.35) * np.exp(-(t - dur * 0.35) / 0.25)
    x = ras * 0.6 + banda(freio.astype(np.float32), 40, 3000) * 0.5
    return norm(x * env(n, 0.002, dur, 1.0, 0.05), 0.8)


def boing(dur=0.6):
    """Mola de desenho animado (a entrada cômica do "Pegadinha do malandro"): tom que sobe com vibrato largo e decai."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = 180 + 260 * (1 - np.exp(-t / 0.05)) + 70 * np.sin(2 * np.pi * 14 * t) * np.exp(-t / 0.35)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) + 0.3 * np.sin(4 * np.pi * np.cumsum(f) / SR)
    return norm((x * np.exp(-t / 0.22) * env(n, 0.003, dur, 1.0, 0.05)).astype(np.float32), 0.8)


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


# ======================================================================
# Rock (sintetizado): guitarra distorcida em power chord + bateria
# ======================================================================
_cache_rock = {}


def _passa_baixa(x, fc):
    """Passa-baixa de 1 polo (suaviza o chiado da distorção)."""
    a = np.exp(-2 * np.pi * fc / SR)
    y = np.empty_like(x)
    acc = 0.0
    # recursão vetorizada por blocos seria mais rápida; os buffers aqui são curtos
    for i in range(len(x)):
        acc = (1 - a) * x[i] + a * acc
        y[i] = acc
    return y


def guitarra(nota, dur=0.25, abafada=False, vel=1.0):
    """Power chord distorcido (fundamental + quinta + oitava). nota em Hz. abafada = palm mute (curto, escuro)."""
    chave = (round(nota, 2), round(dur, 3), abafada)
    if chave not in _cache_rock:
        n = int((dur + (0.05 if abafada else 0.35)) * SR)
        t = np.arange(n) / SR
        x = np.zeros(n, np.float32)
        for mult, g in [(1.0, 1.0), (1.4983, 0.8), (2.0, 0.55)]:
            for det in (-0.004, 0.004):                                   # dois "captadores" levemente desafinados
                f = nota * mult * (1 + det)
                x += g * (2 * ((t * f) % 1.0) - 1).astype(np.float32)        # dente de serra
        e = env(n, a=0.004, d=0.09 if abafada else 0.9, s=0.0 if abafada else 0.25,
                r=0.05, total=None)
        e[int(dur * SR):] *= np.exp(-np.arange(n - int(dur * SR)) / SR / (0.02 if abafada else 0.12))
        x = np.tanh(x * e * (5.0 if abafada else 7.0))                      # distorção
        x = _passa_baixa(x, 1800 if abafada else 3200)
        _cache_rock[chave] = norm(x, 0.8)
    return _cache_rock[chave] * vel


def bumbo(vel=1.0):
    n = int(0.35 * SR); t = np.arange(n) / SR
    f = 45 + 75 * np.exp(-t * 28)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9)
    clique = ruido(0.35)[:n] * np.exp(-t * 300) * 0.3
    return norm((x + clique).astype(np.float32), 0.95 * vel)


def caixa(vel=1.0):
    n = int(0.25 * SR); t = np.arange(n) / SR
    corpo = np.sin(2 * np.pi * 185 * t) * np.exp(-t * 25)
    esteira = banda(ruido(0.25)[:n], 1500, 9000) * np.exp(-t * 16)
    return norm((0.5 * corpo + esteira).astype(np.float32), 0.85 * vel)


def chimbal(vel=1.0, aberto=False):
    d = 0.3 if aberto else 0.06
    n = int(d * SR); t = np.arange(n) / SR
    x = banda(ruido(d)[:n], 7000, 16000) * np.exp(-t * (12 if aberto else 70))
    return norm(x.astype(np.float32), 0.5 * vel)


def prato(vel=1.0, dur=2.0):
    n = int(dur * SR); t = np.arange(n) / SR
    x = banda(ruido(dur)[:n], 3000, 16000) * np.exp(-t * 2.2)
    return norm(x.astype(np.float32), 0.7 * vel)


def rock(dur, bpm=124, riff=((82.41, 4), (82.41, 4), (98.0, 2), (110.0, 2), (73.42, 4)), intensidade=1.0,
         abafado=True, bateria=True, meio_tempo=False):
    """Groove de rock: colcheias de guitarra no riff (nota, colcheias) + bateria (bumbo 1 e 3, caixa 2 e 4, chimbal)."""
    out = segundos(dur + 1.0)
    col = 60 / bpm / 2
    seq = [n for n, k in riff for _ in range(k)]
    i, t = 0, 0.0
    while t < dur:
        nota = seq[i % len(seq)]
        forte = i % 8 in (0, 3, 6)                                           # acentos sincopados
        soma(out, guitarra(nota, col * (2 if forte and not abafado else 1), abafada=abafado and not forte,
                           vel=0.9 * intensidade if forte else 0.6 * intensidade), t)
        if bateria:
            soma(out, chimbal(0.8 * intensidade), t)
            passo = i % 8
            if passo in ((0,) if meio_tempo else (0, 4)):
                soma(out, bumbo(intensidade), t)
            if passo in ((4,) if meio_tempo else (2, 6)):
                soma(out, caixa(intensidade), t)
            if passo == 7 and not meio_tempo:
                soma(out, bumbo(0.6 * intensidade), t)
        t += col
        i += 1
    return out[:int(dur * SR)]


# ======================================================================
# BANDA COMPLETA (rock trabalhado): filtros suaves por FFT, reverb, panorâmica, baixo, guitarra solo com
# glissando e vibrato, sintetizador de fundo, tons, crash e ride, viradas e um arranjador por seções.
# Tudo sintetizado aqui (sem amostras). Usado a partir do vídeo do voto distrital (audio/voto-distrital/previa.py).
# ======================================================================
def fpb(x, fc, ordem=2):
    """Passa-baixa suave (resposta 1/sqrt(1+(f/fc)^2n), fase zero) por FFT."""
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR)
    return np.fft.irfft(X / np.sqrt(1 + (f / fc) ** (2 * ordem)), len(x)).astype(np.float32)


def fpa(x, fc, ordem=2):
    """Passa-alta suave por FFT."""
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR) + 1e-9
    return np.fft.irfft(X / np.sqrt(1 + (fc / f) ** (2 * ordem)), len(x)).astype(np.float32)


def convolver(x, ir):
    n = len(x) + len(ir) - 1; m = 1 << (n - 1).bit_length()
    return np.fft.irfft(np.fft.rfft(x, m) * np.fft.rfft(ir, m), m)[:len(x)].astype(np.float32)


def reverb(x, dur=1.8, brilho=4500, pre=0.018, seed=3):
    """Reverb de sala (resposta ao impulso sintética, diferente em cada lado). Devolve (esq, dir) só do sinal molhado."""
    r = np.random.default_rng(seed); n = int(dur * SR); t = np.arange(n) / SR
    saidas = []
    for lado in range(2):
        ir = r.standard_normal(n).astype(np.float32) * np.exp(-t * 6.9 / dur)
        ir = fpb(ir, brilho * (1 - 0.15 * lado)); ir[:int(pre * SR)] = 0
        ir /= np.sqrt(np.sum(ir ** 2)) + 1e-9
        saidas.append(convolver(x, ir) * 0.5)
    return saidas[0], saidas[1]


def pan(x, p):
    """Panorâmica de potência constante: p -1 (esq) .. +1 (dir)."""
    a = (p + 1) * np.pi / 4
    return x * np.cos(a), x * np.sin(a)


def comprimir(x, limiar=0.35, razao=3.0, janela=0.03):
    """Compressor simples de barramento (envelope RMS suavizado)."""
    k = int(janela * SR); e = np.sqrt(np.convolve(x ** 2, np.ones(k, np.float32) / k, "same")) + 1e-9
    g = np.where(e > limiar, (limiar + (e - limiar) / razao) / e, 1.0)
    g = np.convolve(g, np.ones(k, np.float32) / k, "same")
    return (x * g).astype(np.float32)


def baixo(nota, dur, vel=1.0, abafado=False):
    """Baixo elétrico sintetizado: dente de serra + sub senoidal, passa-baixa com envelope, leve saturação."""
    n = int((dur + 0.08) * SR); t = np.arange(n) / SR
    x = 0.55 * (2 * ((t * nota) % 1.0) - 1) + 0.8 * np.sin(2 * np.pi * nota * t)
    x = fpb(x.astype(np.float32), 900 if not abafado else 500)
    e = env(n, a=0.004, d=0.18 if abafado else 0.6, s=0.0 if abafado else 0.55)
    e[int(dur * SR):] *= np.exp(-np.arange(n - int(dur * SR)) / SR / 0.02)
    return norm(np.tanh(x * e * 2.2).astype(np.float32), 0.85 * vel)


def solo(notas, vel=0.8, brilho=3800):
    """Guitarra solo: notas = [(freq, dur), ...] com glissando curto entre elas, vibrato que entra devagar e distorção.
    freq 0 = pausa. Use dur negativa no glissando longo (bend)."""
    total = sum(abs(d) for _, d in notas) + 0.6
    n = int(total * SR); f = np.zeros(n, np.float32); amp = np.zeros(n, np.float32)
    i0, ant = 0, None
    for fr, d in notas:
        k = int(abs(d) * SR); tt = np.arange(k) / SR
        if fr:
            g = 0.035 if d > 0 else abs(d) * 0.8
            alvo = np.full(k, fr, np.float32)
            if ant:
                alvo = np.where(tt < g, ant * (fr / ant) ** (tt / g), fr).astype(np.float32)
            vib = 1 + 0.012 * np.clip((tt - 0.18) / 0.25, 0, 1) * np.sin(2 * np.pi * 5.6 * tt)
            f[i0:i0 + k] = alvo * vib
            amp[i0:i0 + k] = np.minimum(1, tt / 0.01) * (0.75 + 0.25 * np.exp(-tt / 0.3))
            ant = fr
        i0 += k
    f[i0:] = ant or 0; amp[i0:] = 0
    amp = np.convolve(amp, np.ones(240, np.float32) / 240, "same")
    fase = np.cumsum(f) / SR
    x = (2 * (fase % 1.0) - 1) * 0.6 + np.sign(np.sin(2 * np.pi * fase)) * 0.3 + np.sin(2 * np.pi * 2 * fase) * 0.2
    x = np.tanh(x * amp * 6.0)
    return norm(fpb(fpa(x.astype(np.float32), 180), brilho), 0.8 * vel)


def sinte(freqs, dur, vel=0.5, brilho=1400, ataque=0.6):
    """Sintetizador de fundo (pad): dentes de serra desafinados, ataque lento, passa-baixa."""
    n = int((dur + 0.8) * SR); t = np.arange(n) / SR; x = np.zeros(n, np.float32)
    for fr in freqs:
        for det in (-0.006, 0.0, 0.007):
            x += (2 * ((t * fr * (1 + det) + det * 7) % 1.0) - 1).astype(np.float32)
    e = np.clip(t / ataque, 0, 1) * np.clip((dur + 0.8 - t) / 0.8, 0, 1)
    return norm(fpb(x * e, brilho), vel)


def tom(f0=120.0, vel=1.0):
    n = int(0.6 * SR); t = np.arange(n) / SR
    fr = f0 * (1 + 0.5 * np.exp(-t * 30))
    x = np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.exp(-t * 7) + banda(ruido(0.6)[:n], 200, 3000) * np.exp(-t * 40) * 0.25
    return norm(x.astype(np.float32), 0.9 * vel)


def crash(vel=1.0, dur=2.6):
    n = int(dur * SR); t = np.arange(n) / SR
    x = fpa(ruido(dur)[:n], 2500) * (np.exp(-t * 1.6) * 0.8 + np.exp(-t * 18) * 0.6)
    x += np.sin(2 * np.pi * 5200 * t) * np.exp(-t * 3) * 0.05
    return norm(x.astype(np.float32), 0.75 * vel)


def ride(vel=1.0):
    n = int(0.9 * SR); t = np.arange(n) / SR
    x = fpa(ruido(0.9)[:n], 5000) * np.exp(-t * 4) * 0.5 + np.sin(2 * np.pi * 3100 * t) * np.exp(-t * 6) * 0.25
    return norm(x.astype(np.float32), 0.45 * vel)


def virada(dur, vel=1.0):
    """Virada de tons descendo em semicolcheias (fecha a seção e chama a próxima)."""
    out = segundos(dur + 0.7); passos = max(4, int(dur / 0.075)); fs = np.geomspace(220, 80, passos)
    for k in range(passos):
        soma(out, tom(fs[k], vel * (0.7 + 0.3 * k / passos)) if k % 4 != 3 else caixa(vel), dur * k / passos)
    return out


# ------------------------------------------------ efeitos novos
def relogio(dur, bpm=60):
    """Tique-taque de relógio de parede (noite)."""
    out = segundos(dur + 0.2); passo = 60 / bpm
    for k in range(int(dur / passo)):
        f = 3200 if k % 2 == 0 else 2600; n = int(0.03 * SR); tt = np.arange(n) / SR
        soma(out, (banda(ruido(0.03)[:n], f - 800, f + 800) * np.exp(-tt * 260)).astype(np.float32), k * passo, 0.8)
    return out


def bloco_madeira(f=900.0, vel=1.0):
    """'Toc' de bloco de madeira (cubo de voto empilhando)."""
    n = int(0.18 * SR); t = np.arange(n) / SR
    x = np.sin(2 * np.pi * f * t) * np.exp(-t * 38) + np.sin(2 * np.pi * f * 2.7 * t) * np.exp(-t * 60) * 0.4
    return norm(x.astype(np.float32), 0.8 * vel)


def metal(f0=220.0, dur=1.4, vel=1.0):
    """Batida em lata/lixeira de metal: parciais inarmônicas decaindo."""
    n = int(dur * SR); t = np.arange(n) / SR; x = np.zeros(n, np.float32)
    for k, (m, a) in enumerate([(1, 1), (1.59, 0.7), (2.14, 0.6), (2.65, 0.45), (3.9, 0.3), (5.4, 0.2)]):
        x += (a * np.sin(2 * np.pi * f0 * m * t) * np.exp(-t * (4 + k * 2.5))).astype(np.float32)
    x += banda(ruido(dur)[:n], 1500, 7000) * np.exp(-t * 30) * 0.5
    return norm(x, 0.8 * vel)


def passos(n, intervalo=0.32, vel=0.6):
    out = segundos(n * intervalo + 0.3)
    for k in range(n):
        m = int(0.08 * SR); tt = np.arange(m) / SR
        x = banda(ruido(0.08)[:m], 120, 1400) * np.exp(-tt * 55) + np.sin(2 * np.pi * 70 * tt) * np.exp(-tt * 40) * 0.6
        soma(out, x.astype(np.float32), k * intervalo, vel * (0.8 + 0.2 * (k % 2)))
    return out


def papel(dur=0.5, vel=0.7):
    """Folha de papel deslizando / sendo manuseada."""
    n = int(dur * SR); t = np.arange(n) / SR
    x = banda(ruido(dur)[:n], 1800, 9000) * (0.4 + 0.6 * np.abs(np.sin(2 * np.pi * 7 * t))) * np.sin(np.pi * t / dur)
    return norm(x.astype(np.float32), 0.5 * vel)


def rabisco(dur=1.2, vel=0.7):
    """Lápis riscando o papel (redesenho do mapa)."""
    n = int(dur * SR); t = np.arange(n) / SR
    mod = 0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 9 * t + 2 * np.sin(2 * np.pi * 1.3 * t)))
    x = banda(ruido(dur)[:n], 2500, 8000) * mod * np.clip(t / 0.05, 0, 1) * np.clip((dur - t) / 0.1, 0, 1)
    return norm(x.astype(np.float32), 0.45 * vel)


def estaca(vel=1.0):
    """Mourão de madeira cravado no chão (cerca do curral)."""
    n = int(0.35 * SR); t = np.arange(n) / SR
    x = np.sin(2 * np.pi * (90 + 120 * np.exp(-t * 40)) * t) * np.exp(-t * 14)
    bm = bloco_madeira(420, 0.6); x[:len(bm)] += bm * 0.5
    return norm(x.astype(np.float32), 0.85 * vel)


def fanfarra_ironica(vel=0.7):
    """Três notas de metal de 'vencedor' (sintetizadas), meio de brincadeira."""
    out = segundos(1.6)
    for k, (f, d) in enumerate([(392.0, 0.14), (523.3, 0.14), (659.3, 0.7)]):
        n = int((d + 0.3) * SR); t = np.arange(n) / SR
        x = sum((1 / h) * np.sin(2 * np.pi * f * h * t) for h in range(1, 7)) * np.clip(t / 0.02, 0, 1) * np.exp(-np.maximum(0, t - d) / 0.12)
        soma(out, fpb(x.astype(np.float32), 2500), k * 0.15)
    return norm(out, 0.7 * vel)


# ------------------------------------------------ arranjador
E1, G1, A1, B0, C1, D1 = 41.2, 49.0, 55.0, 30.87, 32.7, 36.71   # baixo (o baixo toca uma oitava abaixo da guitarra)


def banda_secao(stems, t0, dur, bpm, acordes, estilo="palm", intens=1.0, virar=False, seed=1):
    """Escreve uma seção da banda nos stems (dict de buffers mono: bat, baixo, gE, gD).
    acordes = [(nota_guitarra_hz, colcheias), ...] em loop. estilos: palm (verso abafado), aberto (refrão),
    pulo (didático, guitarra no contratempo e baixo em oitavas), tensao (semicolcheias abafadas, tons), meio (meio-tempo pesado)."""
    col = 60 / bpm / 2
    seq = [n for n, k in acordes for _ in range(k)]
    passos_ = int(dur / col); fim_virada = dur - (2 * col * 2 if virar else 0)
    r = np.random.default_rng(seed)
    for i in range(passos_):
        t = t0 + i * col; nota = seq[i % len(seq)]; p = i % 8; bx = nota / 2
        h = (r.random() - 0.5) * 0.008                                                # humanização
        if t - t0 < fim_virada:
            # ---- bateria
            if estilo == "meio":
                if p == 0: soma(stems["bat"], bumbo(intens), t)
                if p == 4: soma(stems["bat"], caixa(intens * 1.05), t)
                soma(stems["bat"], ride(0.7 * intens) if p % 2 == 0 else chimbal(0.4 * intens), t)
            elif estilo == "pulo":
                if p in (0, 3, 4): soma(stems["bat"], bumbo(0.85 * intens), t)
                if p in (2, 6): soma(stems["bat"], caixa(0.8 * intens), t)
                soma(stems["bat"], chimbal(0.7 * intens, aberto=(p % 2 == 1)), t)
            elif estilo == "tensao":
                if p in (0, 3, 6): soma(stems["bat"], bumbo(0.9 * intens), t)
                if p in (4,): soma(stems["bat"], caixa(0.9 * intens), t)
                if p in (2, 7): soma(stems["bat"], tom(110 if p == 2 else 85, 0.6 * intens), t)
                soma(stems["bat"], chimbal(0.55 * intens), t); soma(stems["bat"], chimbal(0.3 * intens), t + col / 2)
            else:
                if p in ((0, 4, 5) if estilo == "aberto" else (0, 4)): soma(stems["bat"], bumbo(intens), t)
                if p in (2, 6): soma(stems["bat"], caixa((0.75 if estilo == "palm" else 1.0) * intens), t)
                if estilo == "aberto": soma(stems["bat"], ride(0.6 * intens) if p % 2 == 0 else chimbal(0.35 * intens), t)
                else: soma(stems["bat"], chimbal((0.6 if p % 2 == 0 else 0.4) * intens), t)
            if estilo == "aberto" and i % 16 == 0: soma(stems["bat"], crash(0.7 * intens), t)
        # ---- baixo
        if estilo == "pulo":
            soma(stems["baixo"], baixo(bx * (2 if p % 2 else 1), col * 0.8, 0.9 * intens, abafado=True), t)
        elif estilo == "meio":
            if p in (0, 3, 4, 6): soma(stems["baixo"], baixo(bx, col * (2 if p in (0, 4) else 1) * 0.95, intens), t)
        else:
            soma(stems["baixo"], baixo(bx, col * 0.9, (0.95 if p % 2 == 0 else 0.8) * intens, abafado=estilo in ("palm", "tensao")), t)
        # ---- guitarras (duas, uma em cada lado, levemente diferentes)
        for lado, (dt, det) in (("gE", (0.0, 1.0)), ("gD", (0.011, 1.0023))):
            if estilo == "palm":
                forte = p in (0, 3, 6)
                soma(stems[lado], guitarra(nota * det, col * (1.5 if forte else 1), abafada=not forte, vel=(0.75 if forte else 0.5) * intens), t + dt + h)
            elif estilo == "aberto":
                if p in (0, 3, 6): soma(stems[lado], guitarra(nota * det, col * (3 if p != 6 else 2), abafada=False, vel=0.9 * intens), t + dt + h)
            elif estilo == "pulo":
                if p % 2 == 1: soma(stems[lado], guitarra(nota * 2 * det, col * 0.6, abafada=True, vel=0.8 * intens), t + dt + h)
            elif estilo == "tensao":
                soma(stems[lado], guitarra((nota * 1.0595 if p == 7 else nota) * det, col * 0.5, abafada=p != 7, vel=0.6 * intens), t + dt + h)
                soma(stems[lado], guitarra(nota * det, col * 0.5, abafada=True, vel=0.4 * intens), t + col / 2 + dt + h)
            elif estilo == "meio":
                if p in (0, 4): soma(stems[lado], guitarra(nota * det, col * 3.6, abafada=False, vel=0.95 * intens), t + dt + h)
    if virar:
        soma(stems["bat"], virada(4 * col, 0.9 * intens), t0 + fim_virada)


def banda_golpe(stems, t, nota, vel=1.0, anel=0.9):
    """Golpe da banda inteira (carimbo musical): acorde aberto + baixo + bumbo + crash."""
    for lado, (dt, det) in (("gE", (0.0, 1.0)), ("gD", (0.009, 1.0023))):
        soma(stems[lado], guitarra(nota * det, anel, abafada=False, vel=vel), t + dt)
    soma(stems["baixo"], baixo(nota / 2, anel, vel), t)
    soma(stems["bat"], bumbo(vel), t); soma(stems["bat"], crash(0.8 * vel), t)
