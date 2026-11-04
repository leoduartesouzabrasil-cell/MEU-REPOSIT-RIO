"""Monta narração, trilha e efeitos de "Política é da sua conta! · EP. 1" e gera motor/cenas/politica-01.tempos.js
(marcas com os mesmos nomes de T na cena + legendas). Modelo: audio/comunismo-01/montar.py.
A narração chegou em 3 áudios (o #3 já traz o final). O #1 é cortado em dois: o gancho ("…nessa história?") vem antes da
vinheta e o resto ("Quais bairros…") logo depois dela.

Uso: python3 audio/politica-01/montar.py  →  node motor/render.js politica-01 saida/politica-01.mp4 --audio audio/politica-01/mix.wav
Entrada: narracao/REC_*.aac (ordem = 1, 2, 3) e palavras.json (faster-whisper, ferramentas/transcrever.py)
Saída: audio/politica-01/mix.wav
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
sys.path.insert(0, str(AQUI))
import som  # noqa: E402
from som import SR, soma  # noqa: E402
from previa import trilha  # noqa: E402

ARQ = sorted((AQUI / "narracao").glob("REC_*.aac"))          # 1, 2, 3 pela ordem de gravação
VEL = float(os.environ.get("VEL", "1.04"))      # velocidade natural (pedido: mais devagar, para entender melhor)
PAUSA_MAX = 0.34
VIN = 3.5                                                    # duração da vinheta
CORTE_1 = 8.2                                                # no #1, entre "história?" e "Quais" (tempo original)
# blocos: (áudio, início, fim no tempo original, pausa depois do bloco)
BLOCOS = [(1, 0.0, CORTE_1, None), (1, CORTE_1, None, 0.7), (2, 0.0, None, 0.7), (3, 0.0, None, 0.0)]
PAUSAS_ESPECIAIS = {                                         # (instante original, duração da pausa)
    2: [(7.9, 0.45), (19.4, 0.45)],                          # antes da escola · antes do "O ônibus precisa melhorar"
    3: [(9.3, 0.4), (20.8, 0.5), (29.6, 0.75), (35.7, 0.55)],  # antes do participar, das perguntas, do "E no seu dia" e do próximo
}
CORRECOES = [(["esperando", "ônibus?"], "esperando o ônibus."), (["R", "$", "5", ",30"], "R$ 5,30"),
             (["Prefeitura"], "prefeitura"), (["Prefeitura."], "prefeitura."), (["Sua", "Cidade"], "sua cidade"),
             (["lei", "de", "acesso", "à", "informação"], "Lei de Acesso à Informação"), (["Poder", "Público."], "poder público."),
             (["dia,"], "dia:"), (["episódio,"], "episódio:"), (["sociedade,"], "sociedade:"), (["perguntas."], "perguntas:")]


def corrigir(pal):
    out, i = [], 0
    while i < len(pal):
        for seq, novo in CORRECOES:
            if [p[0] for p in pal[i:i + len(seq)]] == seq:
                out.append([novo, pal[i][1], pal[i + len(seq) - 1][2]])
                i += len(seq)
                break
        else:
            out.append(pal[i]); i += 1
    return out


def trechos_com_fala(x, pal, especiais=()):
    """Segmentos [a, b) a manter. Corta só SILÊNCIO DE VERDADE (abaixo de -40 dB do pico, com pelo menos 0,45 s),
    deixando 0,17 s de folga de cada lado do som: finais de palavra e consoantes fracas ficam inteiros.
    especiais: [(instante, duração)] fixa a duração de uma pausa."""
    q = int(0.01 * SR)
    en = np.array([np.sqrt(np.mean(x[i:i + q] ** 2)) for i in range(0, len(x) - q, q)])
    som_ = en > np.max(en) * 10 ** (-40 / 20)
    idx = np.where(som_)[0]
    ini, fim = max(0, idx[0] - 15), min(len(en), idx[-1] + 25)
    segs, a, i, pend = [], ini * 0.01, ini, list(especiais)
    while i < fim:
        if som_[i]:
            i += 1; continue
        j = i
        while j < fim and not som_[j]:
            j += 1
        run = (j - i) * 0.01
        alvo = next((e for e in pend if i * 0.01 - 0.3 <= e[0] <= j * 0.01 + 0.3), None) if run > 0.12 else None
        manter = alvo[1] if alvo else PAUSA_MAX
        if alvo:
            pend.remove(alvo)
        if run > max(manter, 0.45) or alvo:
            meio = max(min(manter, run) / 2, 0.17 if run > 0.34 else run / 2)
            segs.append((a, i * 0.01 + meio))
            if alvo and manter > run:
                segs.append(("silencio", manter - run))
            a = j * 0.01 - meio
        i = j
    segs.append((a, fim * 0.01))
    if pend:
        print("aviso: pausas especiais não encontradas:", pend)
    return segs


# limpeza da voz: corta graves e chiado, reduz o ruído de fundo (FFT, acompanhando o ruído), suaviza os "s",
# dá presença na faixa da fala e comprime de leve para o volume ficar estável
LIMPEZA = ("highpass=f=75,afftdn=nr=10:nf=-50,deesser=i=0.2,"          # ruído reduzido sem "picotar" a voz
           "equalizer=f=170:t=q:w=1:g=1.5,equalizer=f=3000:t=q:w=1.4:g=3,"   # corpo + presença (fala mais clara)
           "acompressor=threshold=-24dB:ratio=2.2:attack=12:release=140:makeup=3")   # compressão leve: mantém a entonação


def ler_voz(caminho):
    raw = subprocess.run(["ffmpeg", "-loglevel", "error", "-i", str(caminho), "-af", LIMPEZA + f",atempo={VEL}", "-ac", "1",
                          "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).copy()


def mapear(t, segs, t0):
    acc = t0
    for a, b in segs:
        if a == "silencio":
            acc += b; continue
        if t < a:
            return acc
        if t <= b:
            return acc + t - a
        acc += b - a
    return acc


brutas = json.loads((AQUI / "palavras.json").read_text())
vozes = {k: ler_voz(ARQ[k - 1]) for k in (1, 2, 3)}
t = 0.3
pecas, PAL, INICIO, FIM = [], [], [], []
for n, (k, o0, o1, pausa) in enumerate(BLOCOS):
    x = vozes[k]
    a0, a1 = int(o0 / VEL * SR), (int(o1 / VEL * SR) if o1 else len(x))
    x = x[a0:a1]
    pal = [[w, w0 - o0, w1 - o0] for w, w0, w1 in brutas[str(k)] if w0 >= o0 and (o1 is None or w0 < o1)]
    esp = [((s - o0) / VEL, d) for s, d in PAUSAS_ESPECIAIS.get(k, ()) if s >= o0 and (o1 is None or s < o1)]
    segs = trechos_com_fala(x, [[w, w0 / VEL, w1 / VEL] for w, w0, w1 in pal], esp)
    partes = []
    for a, b in segs:
        if a == "silencio":
            partes.append(np.zeros(int(b * SR), np.float32)); continue
        p = x[int(a * SR):int(b * SR)].copy()
        f = min(int(0.02 * SR), len(p) // 2)          # emenda suave (20 ms), sem estalo
        p[:f] *= np.linspace(0, 1, f); p[-f:] *= np.linspace(1, 0, f)
        partes.append(p)
    audio = np.concatenate(partes)
    pecas.append((t, audio))
    for w, w0, w1 in corrigir(pal):
        PAL.append([w, round(mapear(w0 / VEL, segs, t), 3), round(mapear(w1 / VEL, segs, t), 3)])
    INICIO.append(t); FIM.append(t + len(audio) / SR)
    t = FIM[-1] + (0.3 + VIN + 0.15 if n == 0 else pausa)


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


M = {"gancho": 0.0}
M["atraso"] = frase("está atrasado")
M["bolso"] = frase("a passagem pesa")
M["onde"] = frase("mas onde") + 0.2
M["vin"] = FIM[0] + 0.3
M["onibus"] = M["vin"] + VIN
M["viagens"] = frase("quantas viagens")
M["preco"] = frase("quanto custa")
M["print"] = frase("em são paulo") - 0.3
M["sel"] = frase("r$ 5,30")
M["prefeitura"] = max(frase("em janeiro"), M["sel"] + 0.9)
M["politica"] = INICIO[2] - 0.35
M["decide"] = frase("quem decide")
M["regras"] = frase("quais regras")
M["recursos"] = frase("quais recursos")
M["escola"] = frase("pensando em") - 0.3
M["planejar"] = frase("planejar")
M["financiar"] = frase("financiar")
M["realizar"] = frase("realizar")
M["metas"] = max(frase("o acesso") - 0.25, M["realizar"] + 0.9)
M["metasSel"] = frase("sem atingir")
M["prior"] = frase("o ônibus precisa") - 0.3
M["primeiro"] = frase("mas o que vem")
M["interesses"] = frase("nestas escolhas") - 0.1
M["ouvido"] = frase("quem está sendo")
M["eleicao"] = INICIO[3] - 0.35
M["naoAcaba"] = frase("não acaba")
M["camara"] = frase("depois do voto") - 0.2
M["continuam"] = frase("as decisões continuam")
M["lai"] = frase("e nós podemos") - 0.3
M["laiSel"] = frase("garante o direito")
M["passos"] = frase("dá para se")
M["perguntas"] = frase("agora eu") - 0.3
M["p1"] = frase("quem é responsável")
M["p2"] = frase("onde conferir")
M["p3"] = max(frase("como foi"), M["p2"] + 1.0)
M["dia"] = frase("e no seu dia") - 0.45
M["conta"] = frase("política é da sua conta") - 0.1
M["proximo"] = frase("no próximo") - 0.3
M["logo"] = FIM[-1] + 0.5
M["dur"] = round(M["logo"] + 3.0, 2)
M = {k: round(v, 3) for k, v in M.items()}
DUR = M["dur"]

voz = np.zeros(int(DUR * SR) + SR, np.float32)
for t0, p in pecas:
    soma(voz, p, t0)
voz = voz[:int(DUR * SR)]
N = len(voz)


def legendas(palavras, max_car=28):
    linhas, atual = [], []
    for i, p in enumerate(palavras):
        atual.append(p)
        texto = " ".join(w for w, _, _ in atual)
        prox = palavras[i + 1] if i + 1 < len(palavras) else None
        pausa = prox is None or prox[1] - p[2] > 0.45
        cabe = len(texto) + 1 + len(prox[0]) if prox else 0
        longa = prox is not None and cabe > max_car and not (prox[0][-1] in ".,?!:" and cabe <= max_car + 9)
        if p[0][-1] in ".,?!:" or longa or pausa:
            linhas.append({"t0": atual[0][1], "t1": p[2], "p": [[w, t0] for w, t0, _ in atual]})
            atual = []
    for a, b in zip(linhas, linhas[1:]):
        a["t1"] = round(min(b["t0"], a["t1"] + 0.8), 3)
    linhas[-1]["t1"] += 0.8
    return linhas


(RAIZ / "motor" / "cenas" / "politica-01.tempos.js").write_text(
    "// GERADO por audio/politica-01/montar.py — não editar à mão\n"
    f"window.TEMPOS = {json.dumps({'dur': DUR, 'marcas': M, 'legendas': legendas(PAL)}, ensure_ascii=False)};\n")

(mus_e, mus_d), (sfx_e, sfx_d) = trilha(M, N)
mus_e, mus_d, sfx_e, sfx_d = (x[:N] for x in (mus_e, mus_d, sfx_e, sfx_d))

# ---------------------------------------------------------------- mixagem: a voz manda (regra da identidade, igual ao comunismo-01)
e = som.envelope_voz(voz)
fala = e > 0.3
rms = lambda x: float(np.sqrt(np.mean(x[fala] ** 2))) or 1e-9
REF = 0.2
voz_mix = voz * (REF / rms(voz))
g_mus = REF * 10 ** (-27 / 20) / rms((mus_e + mus_d) / 2 * (1 - 0.7 * e))
g_sfx = REF * 10 ** (-25 / 20) / max(rms((sfx_e + sfx_d) / 2 * (1 - 0.75 * e)), 1e-9)
leito_e, leito_d = mus_e * (1 - 0.7 * e) * g_mus, mus_d * (1 - 0.7 * e) * g_mus
ef_e = np.clip(sfx_e * (1 - 0.75 * e) * g_sfx, -0.6, 0.6); ef_d = np.clip(sfx_d * (1 - 0.75 * e) * g_sfx, -0.6, 0.6)


def limitar(x, teto=0.7):
    a = np.abs(x)
    return np.where(a > teto, np.sign(x) * (teto + 0.28 * np.tanh((a - teto) / 0.28)), x).astype(np.float32)


som.salvar_wav(str(AQUI / "mix.wav"), limitar(voz_mix + leito_e + ef_e), limitar(voz_mix + leito_d + ef_d))
print(f"{DUR:.2f}s · fala: " + " · ".join(f"{a:.1f}-{b:.1f}" for a, b in zip(INICIO, FIM)))
print(json.dumps(M))
