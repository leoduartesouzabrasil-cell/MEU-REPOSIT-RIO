"""Monta narração, trilha e efeitos de "Uma nova via" (Lula × Jones Manoel) e gera motor/cenas/jones-manoel-2030.tempos.js
(marcas com os mesmos nomes de T na cena + legendas). Modelo: audio/eleicoes-2026/montar.py.

Uso: python3 audio/jones-manoel-2030/montar.py
Entrada: narracao/1..4 e palavras.json (transcrição com tempo por palavra, faster-whisper)
Saída: audio/jones-manoel-2030/mix.wav
"""
import json
import subprocess
import sys
from pathlib import Path

import numpy as np

AQUI = Path(__file__).resolve().parent
RAIZ = AQUI.parent.parent
sys.path.insert(0, str(RAIZ / "motor"))
import som  # noqa: E402
from som import SR, soma  # noqa: E402
from previa import trilha  # noqa: E402

ENTRADA = 0.4
PAUSAS = {1: 0.5, 2: 0.6, 3: 0.6, 4: 0.6}
VEL = 1.12                 # voz 12% mais rápida (atempo: mantém o tom)
PAUSA_MAX = 0.24
PAUSAS_ESPECIAIS = {
    1: [(1.8, 0.7), (4.5, 0.9), (16.5, 0.5)],      # "Esse é o Lula." · "Esse é o Jones Manoel." · antes de "Jones é comunista"
    2: [(7.9, 0.9)],                               # carimbo "VENCEMOS."
    3: [],
    4: [(6.4, 0.5), (13.4, 0.8)],                  # contador de votos · carimbo "JONES 2030?"
}
CORRECOES = [(["Jones", "-Manuel."], "Jones Manoel."), (["Jones", "-Manuel,"], "Jones Manoel,"), (["vencê", "-nos."], "vencemos."),
             (["releger"], "reeleger"), (["extrema", "-direita"], "extrema-direita"), (["14", "%"], "14%"),
             (["arcabolso"], "arcabouço"), (["revertê", "-las"], "revertê-las"), (["Reforma", "Trabalhista,"], "reforma trabalhista,"),
             (["Betz,"], "Bets,"), (["Reforma", "Agrária"], "reforma agrária"), (["Verdade,"], "verdade,"), (["Transporte"], "transporte"),
             (["Saniamento"], "saneamento"), (["Públicos,"], "públicos,"), (["Terra"], "terra"), (["Indígenas"], "indígenas"),
             (["Quilombolas"], "quilombolas"), (["Fim"], "fim"), (["Dívida"], "dívida"), (["Hashtag", "Jones", "2030."], "#Jones2030"),
             (["juros,"], "Juros:"), (["Jornada,"], "Jornada:"), (["Privatizações,"], "Privatizações:")]


def corrigir(pal):
    out, i = [], 0
    while i < len(pal):
        for seq, novo in CORRECOES:
            if [p[0] for p in pal[i:i + len(seq)]] == seq:
                out.append([novo, pal[i][1], pal[i + len(seq) - 1][2]])
                i += len(seq)
                break
        else:
            out.append(pal[i])
            i += 1
    return out


def trechos_com_fala(x, especiais=()):
    """Segmentos [a, b) a manter: corta silêncio do começo/fim e encurta pausas internas longas.
    especiais: [(instante, duração)] — a pausa que contém o instante fica com essa duração (pode até crescer)."""
    q = int(0.01 * SR)
    en = np.array([np.sqrt(np.mean(x[i:i + q] ** 2)) for i in range(0, len(x) - q, q)])
    voz = en > np.max(en) * 10 ** (-32 / 20)
    idx = np.where(voz)[0]
    ini, fim = idx[0], idx[-1]
    segs, a, i = [], max(0, ini - 10), ini
    pendentes = list(especiais)
    while i <= fim:
        if not voz[i]:
            j = i
            while j <= fim and not voz[j]:
                j += 1
            esp = next((e for e in pendentes if i * 0.01 - 0.3 <= e[0] <= j * 0.01 + 0.3), None)
            if esp is not None and (j - i) * 0.01 > 0.12:
                pendentes.remove(esp)                    # cada pausa especial vale uma vez só
                alvo = esp[1]
                meio = int(min(alvo, (j - i) * 0.01) / 2 / 0.01)
                segs.append((a * 0.01, (i + meio) * 0.01))
                extra = alvo - (j - i) * 0.01            # pausa maior que a gravada: completa com silêncio
                if extra > 0:
                    segs.append(("silencio", extra))
                a = j - meio
            elif (j - i) * 0.01 > PAUSA_MAX:
                meio = int(PAUSA_MAX / 2 / 0.01)
                segs.append((a * 0.01, (i + meio) * 0.01))
                a = j - meio
            i = j
        else:
            i += 1
    segs.append((a * 0.01, min(len(x) / SR, (fim + 15) * 0.01)))
    if pendentes:
        print("aviso: pausas especiais não encontradas:", pendentes)
    return segs


def ler_voz(caminho):
    raw = subprocess.run(["ffmpeg", "-loglevel", "error", "-i", str(caminho), "-af", f"atempo={VEL}", "-ac", "1", "-ar", str(SR),
                          "-f", "f32le", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).copy()


def mapear(t, segs, t0):
    """Tempo no arquivo original → tempo no vídeo (segmentos colados a partir de t0)."""
    acc = t0
    for a, b in segs:
        if a == "silencio":
            acc += b
            continue
        if t < a:
            return acc
        if t <= b:
            return acc + t - a
        acc += b - a
    return acc


brutas = json.loads((AQUI / "palavras.json").read_text())
t = ENTRADA
pecas, PAL, INICIO, FIM = [], [], {}, {}
for k in range(1, 5):
    x = ler_voz(next((AQUI / "narracao").glob(f"{k}.*")))
    segs = trechos_com_fala(x, [(a / VEL, d) for a, d in PAUSAS_ESPECIAIS.get(k, ())])
    partes = []
    for a, b in segs:
        if a == "silencio":
            partes.append(np.zeros(int(b * SR), np.float32))
            continue
        p = x[int(a * SR):int(b * SR)].copy()
        f = min(int(0.008 * SR), len(p) // 2)
        p[:f] *= np.linspace(0, 1, f)
        p[-f:] *= np.linspace(1, 0, f)
        partes.append(p)
    audio_k = np.concatenate(partes)
    pecas.append((t, audio_k))
    for w, w0, w1 in corrigir(brutas[str(k)]):
        PAL.append([w, round(mapear(w0 / VEL, segs, t), 3), round(mapear(w1 / VEL, segs, t), 3)])
    INICIO[k], FIM[k] = t, t + len(audio_k) / SR
    t = FIM[k] + PAUSAS[k]


def frase(texto, depois=0.0, fim=False):
    limpa = lambda w: w.lower().strip(".,?!:")
    for i in range(len(PAL)):
        if PAL[i][1] < depois:
            continue
        junto, j = "", i
        while j < len(PAL) and len(junto) < len(texto):
            junto = (junto + " " + " ".join(limpa(y) for y in PAL[j][0].split())).strip()
            j += 1
        if junto == texto.lower() or junto.startswith(texto.lower() + " "):
            return PAL[j - 1][2] if fim else PAL[i][1]
    raise KeyError(texto)


M = {"lula": ENTRADA, "jones": frase("esse é o jones")}
M["concilia"] = frase("lula é um conciliador") - 0.2
M["comunista"] = frase("jones é comunista") - 0.2
M["virada"] = INICIO[2] - 0.35
M["vencemos"] = frase("e vencemos")
M["naoBasta"] = frase("mas só derrotar") - 0.15
M["novaVia"] = frase("o brasil precisa") - 0.2
M["mercado"] = frase("e não se renda")
M["diferencas"] = INICIO[3] - 0.45
temas = ["jornada", "juros", "privatizações", "reforma trabalhista", "bets"]
for n, tema in enumerate(temas, 1):                  # tema → "o governo" → "Jones": cada coluna entra na fala
    M[f"d{n}"] = frase(tema, M.get(f"d{n - 1}", 0)) - 0.15
    M[f"g{n}"] = frase("o governo", M[f"d{n}"])
    M[f"j{n}"] = frase("jones", M[f"g{n}"])
M["mais"] = frase("e tem mais") - 0.2
for n, item in enumerate(["reforma agrária", "transporte", "saneamento", "terra para", "o fim da"], 1):
    M[f"m{n}"] = frase(item, M["mais"]) - 0.1
M["votos"] = INICIO[4] - 0.35
M["eterno"] = frase("o lula não vai") - 0.1
M["jones2030"] = frase("jones manoel", M["eterno"])
M["organize"] = frase("se decide na organização")
M["comente"] = frase("comente") - 0.1
M["logo"] = FIM[4] + 0.6
M["dur"] = round(M["logo"] + 3.4, 2)
M = {k: round(v, 3) for k, v in M.items()}
DUR = M["dur"]

voz = np.zeros(int(DUR * SR) + SR, np.float32)
for t0, p in pecas:
    soma(voz, p, t0)
voz = voz[:int(DUR * SR)]
N = len(voz)

def legendas(palavras, max_car=28):
    """Linhas curtas de legenda (quebra em pontuação, pausa ou ~28 caracteres), palavra a palavra no tempo da fala."""
    linhas, atual = [], []
    for i, p in enumerate(palavras):
        atual.append(p)
        texto = " ".join(w for w, _, _ in atual)
        prox = palavras[i + 1] if i + 1 < len(palavras) else None
        pausa = prox is None or prox[1] - p[2] > 0.45
        cabe = len(texto) + 1 + len(prox[0]) if prox else 0
        # passa do limite, salvo se a próxima for a última palavra da frase (evita palavra órfã na linha seguinte)
        longa = prox is not None and cabe > max_car and not (prox[0][-1] in ".,?!:" and cabe <= max_car + 9)
        if p[0][-1] in ".,?!:" or longa or pausa:
            linhas.append({"t0": atual[0][1], "t1": p[2], "p": [[w, t0] for w, t0, _ in atual]})
            atual = []
    for a, b in zip(linhas, linhas[1:]):
        a["t1"] = round(min(b["t0"], a["t1"] + 0.8), 3)
    linhas[-1]["t1"] += 0.8
    return linhas


(RAIZ / "motor" / "cenas" / "jones-manoel-2030.tempos.js").write_text(
    "// GERADO por audio/jones-manoel-2030/montar.py — não editar à mão\n"
    f"window.TEMPOS = {json.dumps({'dur': DUR, 'marcas': M, 'legendas': legendas(PAL)}, ensure_ascii=False)};\n")

mus, sfx = trilha(M, N)

# ---------------------------------------------------------------- mixagem: a voz manda (regra da identidade)
e = som.envelope_voz(voz)
fala = e > 0.3
rms = lambda x: float(np.sqrt(np.mean(x[fala] ** 2))) or 1e-9
REF = 0.2
voz_mix = voz * (REF / rms(voz))
leito = mus * (1 - 0.7 * e)
leito *= REF * 10 ** (-18 / 20) / rms(leito)
efeitos = sfx * (1 - 0.75 * e)
efeitos *= REF * 10 ** (-17 / 20) / max(rms(efeitos), 1e-9)
efeitos = np.clip(efeitos, -0.6, 0.6)


def limitar(x, teto=0.7):
    a = np.abs(x)
    return np.where(a > teto, np.sign(x) * (teto + 0.28 * np.tanh((a - teto) / 0.28)), x).astype(np.float32)


som.salvar_wav(str(AQUI / "mix.wav"), limitar(voz_mix + leito * 1.03 + efeitos), limitar(voz_mix + leito * 0.97 + efeitos))
print(f"{DUR:.2f}s · fala: " + " · ".join(f"#{k} {INICIO[k]:.1f}-{FIM[k]:.1f}" for k in INICIO))
print(json.dumps(M))
