"""Monta narração, trilha e efeitos de "5 curiosidades da China" e gera motor/cenas/china-5-curiosidades.tempos.js
(marcas + legendas). Modelo: audio/comunismo-01/montar.py.

Uso: python3 audio/china-5-curiosidades/montar.py
Entrada: narracao/1..2 (já limpas com limpar.sh: 1 = gravação 46, gancho; 2 = gravação 48, as 5 curiosidades) e palavras.json
Saída: audio/china-5-curiosidades/mix.wav (voz na frente: trilha ~22 dB e efeitos ~20 dB abaixo da voz, com ducking)
"""
import json
import os
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

ENTRADA = 0.3
PAUSAS = {1: 0.9, 2: 0.0}            # depois do #1: o carimbo "5 CURIOSIDADES"
VEL = float(os.environ.get("VEL", "1.15"))
PAUSA_MAX = 0.20
PAUSAS_ESPECIAIS = {
    1: [(5.6, 0.75)],                # "…proibido?" | disco arranhado | "Pegadinha do malandro"
    2: [(18.3, 0.45), (28.4, 0.45), (42.0, 0.45), (58.5, 0.5), (64.3, 0.45), (74.4, 0.45)],   # antes de cada "Número" e do "E aí"
}
CORRECOES = [(["registradas"], "registradas,"), (["Segundo"], "Segundo o"), (["3", "quartos"], "três quartos"),
             (["trembala."], "trem-bala."), (["ver", "de"], "verde"), (["8", "%"], "8%"), (["25", "%"], "25%."),
             (["Número", "1,"], "Número 1:"), (["Número", "2,"], "Número 2:"), (["Número", "3,"], "Número 3:"),
             (["Número", "4,"], "Número 4:"), (["número", "5."], "número 5:"), (["e", "a"], ["E", "a"])]
CORTES = json.loads(os.environ.get("CORTES", "{}"))   # {"2": [[t0, t1], ...]} trechos falados removidos (tempo original)



def cortar(x, pal, k):
    """Remove da voz (já acelerada) e das palavras os trechos de CORTES[k]; devolve voz, palavras e tempos reajustados."""
    cs = sorted(CORTES.get(str(k), []))
    if not cs:
        return x, pal
    keep, a = [], 0
    for c0, c1 in cs:
        keep.append(x[int(a / VEL * SR):int(c0 / VEL * SR)]); a = c1
    keep.append(x[int(a / VEL * SR):])
    def mov(t):
        return t - sum(min(c1, t) - c0 for c0, c1 in cs if t > c0)
    pal2 = [[w, round(mov(w0), 3), round(mov(w1), 3)] for w, w0, w1 in pal if not any(c0 <= w0 < c1 for c0, c1 in cs)]
    return np.concatenate(keep), pal2


def corrigir(pal):
    out, i = [], 0
    while i < len(pal):
        for seq, novo in CORRECOES:
            if [p[0] for p in pal[i:i + len(seq)]] == seq:
                if isinstance(novo, list):                   # a última palavra da sequência vira uma palavra separada
                    out.append([novo[0], pal[i][1], pal[i + len(seq) - 2][2]])
                    out.append([novo[1], pal[i + len(seq) - 1][1], pal[i + len(seq) - 1][2]])
                else:
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
for k in range(1, 3):
    x = ler_voz(next((AQUI / "narracao").glob(f"{k}.*")))
    x, brutas_k = cortar(x, brutas[str(k)], k)
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
    for w, w0, w1 in corrigir(brutas_k):
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


M = {"gancho": ENTRADA}
M["proibido"] = frase("proibido")
M["corte"] = frase("proibido", fim=True) + 0.05
M["mentira"] = frase("pegadinha") - 0.05
M["carimbo"] = frase("mentira")
M["igreja"] = frase("só nas")
M["religioes"] = frase("e quase")
M["errado"] = frase("mas tem")
M["cinco"] = frase("5 curiosidades")
M["n1"] = INICIO[2] - 0.1
M["n2"] = frase("número 2") - 0.1
M["n3"] = frase("número 3") - 0.1
M["n4"] = frase("número 4") - 0.1
M["ultimo"] = frase("e por último") - 0.1
M["n5"] = frase("número 5") - 0.1
M["alemanha"] = frase("isso é mais gente")
M["comenta"] = frase("e aí") - 0.1
M["logo"] = FIM[2] + 0.8
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
(RAIZ / "motor" / "cenas" / "china-5-curiosidades.tempos.js").write_text(
    "// GERADO por audio/china-5-curiosidades/montar.py — não editar à mão\n"
    f"window.TEMPOS = {json.dumps({'dur': DUR, 'marcas': M, 'legendas': legendas(PAL)}, ensure_ascii=False)};\n")

(mus_e, mus_d), (sfx_e, sfx_d) = trilha(M, N)
mus_e, mus_d, sfx_e, sfx_d = (x[:N] for x in (mus_e, mus_d, sfx_e, sfx_d))

# ---------------------------------------------------------------- mixagem: a voz manda (regra da identidade)
e = som.envelope_voz(voz)
fala = e > 0.3
rms = lambda x: float(np.sqrt(np.mean(x[fala] ** 2))) or 1e-9
REF = 0.2
voz_mix = voz * (REF / rms(voz))
g_mus = REF * 10 ** (-22 / 20) / rms((mus_e + mus_d) / 2 * (1 - 0.7 * e))
g_sfx = REF * 10 ** (-20 / 20) / max(rms((sfx_e + sfx_d) / 2 * (1 - 0.75 * e)), 1e-9)
leito_e, leito_d = mus_e * (1 - 0.7 * e) * g_mus, mus_d * (1 - 0.7 * e) * g_mus
ef_e = np.clip(sfx_e * (1 - 0.75 * e) * g_sfx, -0.6, 0.6); ef_d = np.clip(sfx_d * (1 - 0.75 * e) * g_sfx, -0.6, 0.6)


def limitar(x, teto=0.7):
    a = np.abs(x)
    return np.where(a > teto, np.sign(x) * (teto + 0.28 * np.tanh((a - teto) / 0.28)), x).astype(np.float32)


som.salvar_wav(str(AQUI / "mix.wav"), limitar(voz_mix + leito_e + ef_e), limitar(voz_mix + leito_d + ef_d))
# a mesma mixagem só com a música/efeitos e só com a voz, para medir a distância
mus_rms = rms((leito_e + leito_d) / 2); sfx_rms = rms((ef_e + ef_d) / 2)
print(f"{DUR:.2f}s · voz acima da trilha: {20 * np.log10(REF / mus_rms):.1f} dB · acima dos efeitos: {20 * np.log10(REF / sfx_rms):.1f} dB")
print(json.dumps(M))
