"""Monta narração, trilha e efeitos de "Desmistificando o Comunismo · EP. 1" e gera motor/cenas/comunismo-01.tempos.js
(marcas com os mesmos nomes de T na cena + legendas). Modelo: audio/voto-distrital/montar.py (mixagem em estéreo).
A narração começa depois do gancho do Jones (0–16,3 s, áudio dele entra no juntar.sh) e da vinheta (16,7–20,2 s).

Uso: python3 audio/comunismo-01/montar.py  →  depois: render + bash audio/comunismo-01/juntar.sh
Entrada: narracao/1..4 e palavras.json (transcrição com tempo por palavra, faster-whisper)
Saída: audio/comunismo-01/mix.wav
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

JONES, VIN = 16.3, 16.7                       # fim do vídeo do Jones e início da vinheta (fixos, iguais aos da cena)
ENTRADA = VIN + 3.5 + 0.3                     # a voz entra logo depois da vinheta
PAUSAS = {1: 1.8, 2: 0.6, 3: 0.5, 4: 0.6}   # depois do #1: a ficha da lei de 1833; depois do #2: a "luta de classes" selecionada
VEL = float(os.environ.get("VEL", "1.20"))
PAUSA_MAX = 0.20
PAUSAS_ESPECIAIS = {
    3: [(20.0, 0.5), (23.9, 0.45)],                # "…a padaria funciona? Funciona." · "…não sai um pão." (a tela muda)
    4: [(14.2, 0.4)],                              # "…sem explorado." (as plataformas terminam de subir)
}
CORRECOES = [(["Aí"], "Aí,"), (["assim."], "assim:"), (["isso."], "isso:"), (["padaria,"], "padaria:"),
             (["funciona.", "Funciona."], ["funciona?", "Funciona."]), (["lucro."], "o lucro."), (["com", "o", "lucro."], "com o lucro."),
             (["Então", "o"], ["Então,", "o"]), (["comunismo?"], "comunismo?"), (["classes,"], "classes:"),
             (["Por", "isso", "que"], "Por isso, o que"), (["riqueza."], "riqueza:"), (["socialismo", "é"], ["socialismo,", "é"])]


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
for k in range(1, 5):
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


def talvez(texto, ajuste=0.0):
    """Marca opcional: some quando o trecho foi cortado (versão curta)."""
    try:
        return frase(texto) + ajuste
    except KeyError:
        return 0.0

M = {"vin": VIN}
M["fab"] = VIN + 3.5
M["tear"] = max(frase("gente trabalhando") - 0.2, M["fab"] + 1.2)
M["crianca"] = max(frase("até mesmo") - 0.2, M["tear"] + 1.0)
M["lei"] = FIM[1] + 0.15
M["marx"] = max(INICIO[2] - 0.2, M["lei"] + 2.2)
M["engels"] = max(frase("friedrich") - 0.2, M["marx"] + 0.6)
M["manif"] = max(frase("o manifesto") - 0.3, M["engels"] + 0.8)
M["frase"] = frase("e o primeiro") + 0.2
M["sel"] = frase("luta de classes", M["frase"])
M["classes"] = INICIO[3] - 0.3
M["dono"] = frase("do outro")
M["padaria"] = frase("pensa numa") - 0.3
M["paes"] = frase("faz 500") - 0.1
M["nenhum"] = frase("e nenhum")
M["leva"] = frase("o pão é")
M["salario"] = frase("que paga")
M["lucro"] = max(frase("e fica com"), M["salario"] + 0.8)
M["semdono"] = frase("se o dono")
M["sempadeiro"] = frase("se o padeiro")
M["indisp"] = frase("quem é indispensável")
M["objetivo"] = INICIO[4] - 0.3
M["capital"] = max(frase("é superar") - 0.2, M["objetivo"] + 1.2)
M["supera"] = M["capital"] + 0.7
M["semclasses"] = frase("o objetivo") + 0.4
M["meios"] = frase("por isso") - 0.3
M["seu"] = frase("a sua casa") - 0.3
M["iphone"] = frase("continuam seus") + 0.2
M["proximo"] = frase("e socialismo") - 0.2
M["logo"] = FIM[4] + 1.0
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


(RAIZ / "motor" / "cenas" / "comunismo-01.tempos.js").write_text(
    "// GERADO por audio/comunismo-01/montar.py — não editar à mão\n"
    f"window.TEMPOS = {json.dumps({'dur': DUR, 'marcas': M, 'legendas': legendas(PAL)}, ensure_ascii=False)};\n")

(mus_e, mus_d), (sfx_e, sfx_d) = trilha(M, N)
mus_e, mus_d, sfx_e, sfx_d = (x[:N] for x in (mus_e, mus_d, sfx_e, sfx_d))

# ---------------------------------------------------------------- mixagem: a voz manda (regra da identidade)
e = som.envelope_voz(voz)
fala = e > 0.3
rms = lambda x: float(np.sqrt(np.mean(x[fala] ** 2))) or 1e-9
REF = 0.2
voz_mix = voz * (REF / rms(voz))
g_mus = REF * 10 ** (-18 / 20) / rms((mus_e + mus_d) / 2 * (1 - 0.7 * e))
g_sfx = REF * 10 ** (-17 / 20) / max(rms((sfx_e + sfx_d) / 2 * (1 - 0.75 * e)), 1e-9)
leito_e, leito_d = mus_e * (1 - 0.7 * e) * g_mus, mus_d * (1 - 0.7 * e) * g_mus
ef_e = np.clip(sfx_e * (1 - 0.75 * e) * g_sfx, -0.6, 0.6); ef_d = np.clip(sfx_d * (1 - 0.75 * e) * g_sfx, -0.6, 0.6)


def limitar(x, teto=0.7):
    a = np.abs(x)
    return np.where(a > teto, np.sign(x) * (teto + 0.28 * np.tanh((a - teto) / 0.28)), x).astype(np.float32)


som.salvar_wav(str(AQUI / "mix.wav"), limitar(voz_mix + leito_e + ef_e), limitar(voz_mix + leito_d + ef_d))
print(f"{DUR:.2f}s · fala: " + " · ".join(f"#{k} {INICIO[k]:.1f}-{FIM[k]:.1f}" for k in INICIO))
print(json.dumps(M))
