"""Monta narração, trilha e efeitos de "Não foi golpe. Foi o povo." e gera motor/cenas/eleicoes-2026.tempos.js
(marcas com os mesmos nomes de T na cena), para som e imagem ficarem sincronizados.

Uso: python3 audio/eleicoes-2026/montar.py            (versão completa, ~1:53)
     python3 audio/eleicoes-2026/montar.py --curta    (versão de ~70 s: mix-70.wav + eleicoes-2026-70.tempos.js;
                                                       render com --tempos eleicoes-2026-70)
Entrada: narracao/1..5.mp3 e palavras.json (transcrição com tempo por palavra, faster-whisper)
Saída: audio/eleicoes-2026/mix.wav
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
from trilha import trilha  # noqa: E402

ENTRADA = 0.5
# pausa depois de cada áudio: espaço para os golpes CARTAZ e, no fim, para o logo
PAUSAS = {1: 0.5, 2: 0.7, 3: 1.0, 4: 0.7, 5: 0.6}
VEL = 1.08                 # voz 8% mais rápida (atempo: mantém o tom), para o Reels não arrastar
PAUSA_MAX = 0.26           # silêncios internos mais longos que isto são encurtados (sem cortar fala)
# pausas que ficam MAIORES (instante no arquivo original → duração): tempo para ler a tela
PAUSAS_ESPECIAIS = {
    1: [(8.6, 1.3), (20.7, 1.0)],                  # mapa do 1º turno · carimbo "GOLPE?"
    2: [(17.7, 0.9)],                              # "= 14,1 MI"
    3: [(15.6, 1.2), (21.7, 0.6)],                 # "NÃO FOI GOLPE." · fogo antes de "o Brasil é soberano"
    5: [(14.4, 0.9), (20.3, 2.1), (23.3, 1.8)],    # Espanha → história · Fidel e Che · Mao
}
CURTA = "--curta" in sys.argv
# versão curta: trechos de apoio tirados da fala (arquivo → intervalos no áudio original, em s) e pausas de leitura menores
CORTES = {
    1: [(0.0, 3.25), (9.15, 10.74)],               # "Quatro de outubro, 1º turno." (já está na tela) · "21 dias depois,"
    2: [(0.0, 15.2)],                              # o detalhamento das contas (fica "São 14 milhões…")
    3: [(2.55, 3.98), (9.35, 12.9)],               # "com cédulas de papel," · "As missões internacionais atestaram o resultado e"
    4: [(2.85, 12.18)],                            # abstenção e Nordeste (o contador segue na tela)
    5: [(10.03, 23.88), (28.58, 31.6)],            # "contra a lei…" + Cuba e China · "mobilizado na rua e nas redes."
} if CURTA else {}
if CURTA:
    ENTRADA, VEL = 1.5, 1.12
    PAUSAS = {1: 1.9, 2: 0.5, 3: 0.7, 4: 0.5, 5: 0.6}      # depois de "Vamos às contas": os blocos da soma entram na música
    PAUSAS_ESPECIAIS = {1: [(8.6, 1.5), (19.0, 0.9), (20.7, 0.6)], 2: [(17.7, 0.5)], 3: [(15.6, 0.7), (21.7, 0.4)],
                        5: [(14.0, 0.8)]}      # 19.0: carimbo "VIRADA" depois de "48,2%"
SUFIXO = "-70" if CURTA else ""
CORRECOES = [(["nenhuma"], "Nenhuma"), (["moradia"], "moradia."), (["organizado,"], "organizado.")] * CURTA + [(["Echer", "e"], "e Che."), (["na", "China"], "E na China"), (["ensina"], "ensina:"), (["Mau."], "Mao."), (["51", ",8%."], "51,8%."), (["48", ",2%."], "48,2%."),
             (["extrema", "-direita."], "extrema-direita."), (["nordeste"], "Nordeste"), (["foram", "as", "urnas"], "foram às urnas"),
             (["e", "não", "é", "só", "aqui."], "E não é só aqui."), (["4", "de", "outubro,"], "Quatro de outubro,"),
             (["Flávio", "3"], "Flávio, 3"), (["21", "dias"], "Vinte e um dias")]


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
for k in range(1, 6):
    x = ler_voz(AQUI / "narracao" / f"{k}.mp3")
    for a, b in CORTES.get(k, ()):                        # trecho cortado vira silêncio, que a compactação some
        x[int(a / VEL * SR):int(b / VEL * SR)] = 0
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
    fora = lambda w0: any(a <= w0 < b for a, b in CORTES.get(k, ()))
    for w, w0, w1 in corrigir([w for w in brutas[str(k)] if not fora(w[1])]):
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


M = {"inicio": 0.0, "turno1": frase("flávio bolsonaro") - 0.3}
M["mapa"] = frase("45%", fim=True) + 0.15
M["mapaVira"] = frase("lula cresceu") - (0.1 if CURTA else 0)
if CURTA:                                          # o fim de "45%" vem esticado na transcrição: o mapa entra 1,6 s antes da virada
    M["mapa"] = M["mapaVira"] - 1.6
M["minas"] = frase("virou minas")
M["turno2"] = frase("lula", M["minas"]) - 0.3
M["virada"] = frase("48,2%", M["turno2"], fim=True) + 0.45
M["golpe"] = frase("foi golpe")
if CURTA:                                          # a transcrição estica "48,2%" até o "Foi": carimbo na pausa antes
    M["virada"] = M["golpe"] - 0.75
M["vamos"] = frase("vamos às contas")
if CURTA:                                          # sem a fala do detalhamento: os blocos entram na pausa, com a música
    M["contas"] = FIM[1] + 0.25
    M["outros"], M["voltaram"], M["brancos"] = M["contas"] + 0.35, M["contas"] + 0.8, M["contas"] + 1.25
else:
    M["contas"] = INICIO[2] - 0.2
    M["outros"] = frase("9 milhões")
    M["voltaram"] = frase("quase 3")
    M["brancos"] = frase("quase 2")
M["total"] = frase("são 14")
M["divide"] = frase("lula conquistou")
M["checklist"] = INICIO[3] - 0.45
M["ck1"] = INICIO[3] + 0.1
M["ck2"] = frase("observadores")
M["ck3"] = M["ck2"] + 1.3 if CURTA else frase("as missões")
M["ck4"] = frase("nenhuma prova") - (0 if CURTA else 0.3)
M["naoGolpe"] = frase("apresentada", fim=True) + 0.15
M["soberania"] = frase("e quem pediu") - 0.25
M["fogo"] = frase("pressionar")
M["soberano"] = frase("o brasil é soberano")
M["povo"] = INICIO[4] - 0.3
if CURTA:                                          # sem a fala: o contador da abstenção roda durante "foi o povo"
    M["abst"], M["desde2006"] = M["povo"] + 0.5, M["povo"] + 1.6
    M["nordeste"] = 9999
else:
    M["abst"] = frase("a abstenção")
    M["desde2006"] = frase("desde")
    M["nordeste"] = frase("o nordeste")
M["rua"] = frase("teve transporte") - (0.2 if CURTA else 0)
M["mundo"] = INICIO[5] - 0.3
M["franca"] = frase("na frança")
M["espanha"] = frase("na espanha")
if CURTA:                                          # versão curta: sem Cuba e China (a cena fecha só com França e Espanha)
    M["cuba"] = M["cubaLideres"] = M["china"] = M["chinaLider"] = 9999
else:
    M["cuba"] = frase("e a história") - 0.2
    M["cubaLideres"] = frase("com fidel") - 0.3
    M["china"] = frase("e na china") - 1.3          # a foto da China entra na pausa depois de "Fidel e Che"
    M["chinaLider"] = frase("com mao") - 0.2
M["organizado"] = frase("nenhuma grande") - 0.2
M["redes"] = 9999 if CURTA else frase("mobilizado")
M["acabou"] = frase("a eleição acabou") - 0.15
M["mobilizacao"] = frase("mas a mobilização")
M["logo"] = FIM[5] + PAUSAS[5]
M["dur"] = round(M["logo"] + (3.1 if CURTA else 3.4), 2)
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


(RAIZ / "motor" / "cenas" / f"eleicoes-2026{SUFIXO}.tempos.js").write_text(
    "// GERADO por audio/eleicoes-2026/montar.py — não editar à mão\n"
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


som.salvar_wav(str(AQUI / f"mix{SUFIXO}.wav"), limitar(voz_mix + leito * 1.03 + efeitos), limitar(voz_mix + leito * 0.97 + efeitos))
print(f"{DUR:.2f}s · fala: " + " · ".join(f"#{k} {INICIO[k]:.1f}-{FIM[k]:.1f}" for k in INICIO))
print(json.dumps(M))
