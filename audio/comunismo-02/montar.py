"""Monta narração, trilha e efeitos de "Desmistificando o Comunismo · EP. 2" e gera motor/cenas/comunismo-02.tempos.js
(marcas com os mesmos nomes de T na cena + legendas). Modelo: audio/comunismo-01/montar.py.
A narração começa depois do gancho do Jones (0–14,35 s, áudio dele entra no juntar.sh) e da vinheta (14,75–18,25 s).
O autor gravou 3 áudios: #1 = roteiro #1 + #2, #2 = roteiro #3 + #4, #3 = chamada do Coletivo Lufã (fecha o vídeo).

Uso: python3 audio/comunismo-02/montar.py  →  depois: render + bash audio/comunismo-02/juntar.sh
Entrada: narracao/1..3 e palavras.json (transcrição com tempo por palavra, faster-whisper)
Saída: audio/comunismo-02/mix.wav
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

JONES, VIN = 14.35, 14.75                     # fim do vídeo do Jones e início da vinheta (fixos, iguais aos da cena)
ENTRADA = VIN + 3.5 + 0.3                     # a voz entra logo depois da vinheta
PAUSAS = {1: 0.5, 2: 0.6, 3: 0.5}
VEL = float(os.environ.get("VEL", "1.20"))
PAUSA_MAX = 0.20
PAUSAS_ESPECIAIS = {
    1: [(16.6, 0.7), (27.4, 0.5)],               # "…Soviéticas." (entra a ficha de 1827/1832) · "…França." (entram os utópicos)
    2: [(37.7, 0.8), (64.8, 0.4), (76.6, 0.6)],  # "…operária." (a escada) · "…precisa." · "…objetivo final." (próximo)
}
CORRECOES = [(["tópico."], "utópico."), (["Sam", "Simon,"], "Saint-Simon,"), (["Primeiro,"], "Primeiro:"),
             (["A", "camarada", "e"], "Camarada,"), (["desmistificando", "o", "comunismo"], "Desmistificando o Comunismo"),
             (["coletivo", "Lufan,"], "Coletivo Lufã,"), (["vambora?"], "vambora!"), (["mais", "valia,"], "mais-valia,"), (["Mas,", "da"], ["Mas", "da"]),
             (["Bom,"], "Bom:"), (["1830"], "1830,"), (["1847"], "1847,"),
             (["capitalismo."], "capitalismo:"), (["degrau,"], "degrau:"), (["socialistas,"], "socialistas:")]


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


def trechos_com_fala(x, especiais=(), pal=()):
    """Segmentos [a, b) a manter: corta silêncio do começo/fim e encurta pausas internas longas.
    especiais: [(instante, duração)] — a pausa que contém o instante fica com essa duração (pode até crescer)."""
    q = int(0.01 * SR)
    en = np.array([np.sqrt(np.mean(x[i:i + q] ** 2)) for i in range(0, len(x) - q, q)])
    # a gravação tem ruído de fundo alto (só ~20 dB abaixo da voz): a fala vem do tempo das palavras, não do volume
    voz = np.zeros(len(en), bool)
    for _, w0, w1 in pal:
        voz[max(0, int((w0 / VEL - 0.04) * 100)):int((w1 / VEL + 0.08) * 100)] = True
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
    raw = subprocess.run(["ffmpeg", "-loglevel", "error", "-i", str(caminho), "-af", f"highpass=f=70,afftdn=nr=18:nf=-28:tn=1,atempo={VEL}", "-ac", "1", "-ar", str(SR),
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
for k in range(1, 4):
    x = ler_voz(next((AQUI / "narracao").glob(f"{k}.*")))
    x, brutas_k = cortar(x, brutas[str(k)], k)
    segs = trechos_com_fala(x, [(a / VEL, d) for a, d in PAUSAS_ESPECIAIS.get(k, ())], brutas_k)
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


def talvez(texto, ajuste=0.0):
    """Marca opcional: some quando o trecho foi cortado (versão curta)."""
    try:
        return frase(texto) + ajuste
    except KeyError:
        return 0.0

M = {"vin": VIN}
M["nenhum"] = INICIO[1] - 0.1
M["urss"] = frase("tanto que") - 0.2
M["sel"] = frase("socialistas")
M["origem"] = frase("primeiro") - 0.35
M["franca"] = max(frase("e na frança") - 0.3, M["origem"] + 1.8)
M["utopicos"] = frase("era o chamado") - 0.3
M["utopico"] = max(frase("socialismo utópico", fim=True) - 0.35, M["utopicos"] + 1.0)
M["plano"] = frase("um bom plano")
M["cientifico"] = INICIO[2] - 0.3
M["engels"] = max(frase("e engels") - 0.1, M["cientifico"] + 0.6)
M["cient"] = frase("socialismo científico")
M["luta"] = frase("vem da luta")
M["e88"] = frase("tanto que em") - 0.2
M["sel88"] = frase("e o comunismo", M["e88"])
M["escada"] = frase("mas afinal") - 0.3
M["sobe"] = max(frase("é o primeiro") - 0.6, M["escada"] + 1.4)
M["selo1"] = frase("as fábricas")
M["selo2"] = frase("e a produção")
M["selo3"] = frase("e cada um recebe")
M["topo"] = frase("o comunismo é o último") - 0.3
M["marx"] = frase("cada um dá") - 0.3
M["fartura"] = frase("e recebe o que")
M["paises"] = frase("por isso") - 0.3
for k2, w in [("p0", "união soviética"), ("p1", "cuba"), ("p2", "vietnã"), ("p3", "china")]:
    M[k2] = frase(w, M["paises"])
M["caminho"] = frase("é o caminho", M["paises"])
M["proximo"] = frase("mas da onde") - 0.3
M["cta"] = INICIO[3] - 0.3
M["serie"] = frase("desmistificando o comunismo") - 0.2
M["inic"] = frase("fazem parte") - 0.1
M["lufa"] = frase("do coletivo lufã") + 0.1
M["formar"] = frase("para se formar")
M["participar"] = frase("e participar")
M["vamb"] = frase("vambora")
M["logo"] = FIM[3] + 0.8
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


(RAIZ / "motor" / "cenas" / "comunismo-02.tempos.js").write_text(
    "// GERADO por audio/comunismo-02/montar.py — não editar à mão\n"
    f"window.TEMPOS = {json.dumps({'dur': DUR, 'marcas': M, 'legendas': legendas(PAL)}, ensure_ascii=False)};\n")

(mus_e, mus_d), (sfx_e, sfx_d) = trilha(M, N)
mus_e, mus_d, sfx_e, sfx_d = (x[:N] for x in (mus_e, mus_d, sfx_e, sfx_d))

# ---------------------------------------------------------------- mixagem: a voz manda (regra da identidade)
e = som.envelope_voz(voz)
fala = e > 0.3
rms = lambda x: float(np.sqrt(np.mean(x[fala] ** 2))) or 1e-9
REF = 0.2
voz_mix = voz * (REF / rms(voz))
g_mus = REF * 10 ** (-22 / 20)   # trilha 4 dB mais baixa (pedido do autor: "a trilha está muito alta")
g_mus = g_mus / rms((mus_e + mus_d) / 2 * (1 - 0.7 * e))
g_sfx = REF * 10 ** (-20 / 20) / max(rms((sfx_e + sfx_d) / 2 * (1 - 0.75 * e)), 1e-9)
leito_e, leito_d = mus_e * (1 - 0.7 * e) * g_mus, mus_d * (1 - 0.7 * e) * g_mus
ef_e = np.clip(sfx_e * (1 - 0.75 * e) * g_sfx, -0.6, 0.6); ef_d = np.clip(sfx_d * (1 - 0.75 * e) * g_sfx, -0.6, 0.6)


def limitar(x, teto=0.7):
    a = np.abs(x)
    return np.where(a > teto, np.sign(x) * (teto + 0.28 * np.tanh((a - teto) / 0.28)), x).astype(np.float32)


som.salvar_wav(str(AQUI / "mix.wav"), limitar(voz_mix + leito_e + ef_e), limitar(voz_mix + leito_d + ef_d))
print(f"{DUR:.2f}s · fala: " + " · ".join(f"#{k} {INICIO[k]:.1f}-{FIM[k]:.1f}" for k in INICIO))
print(json.dumps(M))
