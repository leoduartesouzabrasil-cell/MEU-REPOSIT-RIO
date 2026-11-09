"""Monta narração, trilha e efeitos de "Desmistificando o Comunismo · EP. 3: O que é mais-valia?" e gera
motor/cenas/comunismo-03.tempos.js (marcas com os mesmos nomes de T na cena + legendas). Modelo: audio/comunismo-02/montar.py.

Ordem: gancho (vídeo do autor numa moldura, 0–GANCHO s; o áudio dele entra no juntar.sh) → vinheta (3,5 s) → narração.
O autor gravou um áudio só (gravação 27) com o roteiro inteiro; o chiado sai em audio/comunismo-03/limpar.py (narracao/limpa.wav).
Corte pedido pelo autor: "sem perceber" (ele queria dizer "sem receber"); a frase fica "…trabalha mais de 4h30 por dia."

Uso: python3 audio/comunismo-03/montar.py  →  render  →  bash audio/comunismo-03/juntar.sh
Entrada: narracao/limpa.wav e palavras.json (faster-whisper, tempo por palavra, no tempo da limpa.wav)
Saída: audio/comunismo-03/mix.wav
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
from previa import trilha, GANCHO  # noqa: E402

VIN = GANCHO + 0.4                            # a vinheta entra 0,4 s depois do fim do gancho (último quadro parado)
ENTRADA = VIN + 3.5 + 0.3                     # a voz entra logo depois da vinheta
VEL = float(os.environ.get("VEL", "1.12"))
PAUSA_MAX = 0.22
CORTES = [(97.93, 98.80)]                     # "sem perceber" (tempo da limpa.wav); o corte cai na pequena queda antes de "sem"
# pausas que ficam maiores (tempo da limpa.wav): troca de cena e carimbos
PAUSAS_ESPECIAIS = [(14.2, 0.55),             # "…uma hora e meia." → a hamburgueria
                    (64.1, 0.75),             # "…o trabalho não pago." (carimbo MAIS-VALIA) → por que
                    (84.6, 0.55),             # "…do teu trabalho." → o Brasil
                    (103.7, 0.45),            # "…mais de 6h30." → Marx, 1849
                    (114.4, 0.5)]             # "…quando o trabalho termina." → a pergunta final
CORRECOES = [(["R", "$25", ".00."], "R$ 25."), (["R", "$1", ".000", ".00."], "R$ 1.000."), (["R", "$600", ".00."], "R$ 600."),
             (["R", "$100", ".00."], "R$ 100."), (["R", "$3", ".738"], "R$ 3.738,"), (["A", "aeropão,"], ["Tira", "o pão,"]),
             (["mais", "valia,"], "mais-valia:"), (["média"], "média,"), (["gás"], "gás:"), (["Às"], "As"), (["6h40"], "6h40,"),
             (["marca"], "marca,"), (["transporte"], "transporte."), (["mínimo"], "mínimo,"), (["escrevia,"], "escrevia:"),
             (["suas"], "suas,"), (["seja,"], "seja:"), (["hambúrgueres,"], "hambúrguer."), (["cada"], "Cada")]


def corrigir(pal):
    out, i = [], 0
    while i < len(pal):
        for seq, novo in CORRECOES:
            if [p[0] for p in pal[i:i + len(seq)]] == seq:
                if isinstance(novo, list):            # a sequência vira várias palavras (o tempo é dividido entre elas)
                    t0, t1 = pal[i][1], pal[i + len(seq) - 1][2]
                    for k, w in enumerate(novo):
                        out.append([w, round(t0 + (t1 - t0) * k / len(novo), 3), round(t0 + (t1 - t0) * (k + 1) / len(novo), 3)])
                else:
                    out.append([novo, pal[i][1], pal[i + len(seq) - 1][2]])
                i += len(seq)
                break
        else:
            out.append(pal[i])
            i += 1
    return out


def ler_voz(caminho):
    raw = subprocess.run(["ffmpeg", "-loglevel", "error", "-i", str(caminho), "-af", f"atempo={VEL}", "-ac", "1", "-ar", str(SR),
                          "-f", "f32le", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).copy()


def mov(t):
    """Tempo da gravação → tempo da gravação sem os CORTES."""
    return t - sum(min(c1, t) - c0 for c0, c1 in CORTES if t > c0)


def cortar(x, pal):
    """Remove da voz (já acelerada) os CORTES, com cruzamento curto para não estalar; reajusta as palavras."""
    keep, a = [], 0
    f = int(0.012 * SR)
    for c0, c1 in sorted(CORTES):
        keep.append(x[int(a / VEL * SR):int(c0 / VEL * SR)]); a = c1
    keep.append(x[int(a / VEL * SR):])
    y = keep[0]
    for p in keep[1:]:
        cf = np.linspace(0, 1, f, dtype=np.float32)
        y = np.concatenate([y[:-f], y[-f:] * (1 - cf) + p[:f] * cf, p[f:]])
    pal2 = [[w, round(mov(w0), 3), round(mov(w1), 3)] for w, w0, w1 in pal if not any(c0 - 0.05 <= w0 < c1 for c0, c1 in CORTES)]
    return y, pal2


def trechos_com_fala(x, especiais, pal):
    """Segmentos [a, b) a manter: corta silêncio do começo/fim e encurta pausas internas longas (a fala vem do tempo das palavras)."""
    q = int(0.01 * SR)
    n = len(x) // q
    voz = np.zeros(n, bool)
    for _, w0, w1 in pal:
        voz[max(0, int((w0 / VEL - 0.04) * 100)):min(n, int((w1 / VEL + 0.08) * 100))] = True
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
                pendentes.remove(esp)
                alvo = esp[1]
                meio = int(min(alvo, (j - i) * 0.01) / 2 / 0.01)
                segs.append((a * 0.01, (i + meio) * 0.01))
                extra = alvo - (j - i) * 0.01
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


def mapear(t, segs, t0):
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


brutas = [[p["w"], p["s"], p["e"]] for p in json.loads((AQUI / "palavras.json").read_text())]
x = ler_voz(AQUI / "narracao" / "limpa.wav")
x, pal = cortar(x, brutas)
segs = trechos_com_fala(x, [(mov(a) / VEL, d) for a, d in PAUSAS_ESPECIAIS], pal)
partes = []
for a, b in segs:
    if a == "silencio":
        partes.append(np.zeros(int(b * SR), np.float32))
        continue
    p = x[int(a * SR):int(b * SR)].copy()
    f = min(int(0.008 * SR), len(p) // 2)
    p[:f] *= np.linspace(0, 1, f); p[-f:] *= np.linspace(1, 0, f)
    partes.append(p)
fala_audio = np.concatenate(partes)
for _ in range(2):
    pal = corrigir(pal)
for i in range(len(pal) - 1):                     # depois do corte, "…por dia" fecha a frase
    if pal[i][0] == "dia" and pal[i + 1][0] == "Quem":
        pal[i][0] = "dia."
PAL = [[w, round(mapear(w0 / VEL, segs, ENTRADA), 3), round(mapear(w1 / VEL, segs, ENTRADA), 3)] for w, w0, w1 in pal]
INICIO, FIM = ENTRADA, ENTRADA + len(fala_audio) / SR


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


M = {"vin": VIN, "gancho": GANCHO}
# #1 o gancho em CARTAZ: a régua de 8 horas
M["oito"] = INICIO - 0.1
M["minimo"] = frase("se você ganha")
M["menos"] = frase("menos de uma hora")
# #2 a hamburgueria
M["lanche"] = frase("agora imagina") - 0.3
M["preco"] = frase("cada lanche")
M["monta"] = frase("você monta")
M["mil"] = frase("que dá")
M["cupom"] = frase("tira o pão") - 0.2
M["carne"] = frase("a carne")
M["luz"] = frase("a luz")
M["sobram"] = frase("sobram")
M["novo"] = frase("esse valor novo")
M["salario"] = frase("e o seu salário")
M["cem"] = frase("r$ 100")
M["hora"] = frase("ou seja")
M["outras"] = frase("as outras")
M["aluguel"] = frase("o aluguel")
M["impostos"] = frase("os impostos")
M["juros"] = frase("os juros")
M["marca"] = frase("a marca")
M["lucro"] = frase("lucro do dono")
M["mv"] = frase("isso é o que marx") - 0.3
M["mvc"] = frase("mais-valia")
M["npago"] = frase("o trabalho não pago")
# #3 por que
M["porque"] = frase("e por que") - 0.3
M["forca"] = frase("força de trabalho")
M["preco2"] = frase("pelo preço")
M["comida"] = frase("comida")
M["aluguel2"] = frase("aluguel", M["comida"])
M["transporte"] = frase("transporte")
M["lucro2"] = frase("e o lucro")
M["seutrab"] = frase("ele vem do")
# #4 o Brasil
M["brasil"] = frase("mas e no brasil") - 0.3
M["conta"] = frase("a gente fez")
M["media"] = frase("quem ganha a média")
M["minimo2"] = frase("quem ganha o salário")
M["m1849"] = frase("em 1849") - 0.3
M["vida"] = frase("e a vida dele")
M["final"] = frase("mas e aí") - 0.3
M["conte"] = frase("me conta")
M["quantas"] = frase("quantas horas", M["final"])
M["logo"] = FIM + 0.9
M["dur"] = round(M["logo"] + 3.6, 2)
M = {k: round(v, 3) for k, v in M.items()}
DUR = M["dur"]

voz = np.zeros(int(DUR * SR) + SR, np.float32)
soma(voz, fala_audio, INICIO)
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
        longa = prox is not None and cabe > max_car and not (prox[0][-1] in ".,?!:" and cabe <= max_car + 9)
        if p[0][-1] in ".,?!:" or longa or pausa:
            linhas.append({"t0": atual[0][1], "t1": p[2], "p": [[w, t0] for w, t0, _ in atual]})
            atual = []
    for a, b in zip(linhas, linhas[1:]):
        a["t1"] = round(min(b["t0"], a["t1"] + 0.8), 3)
    linhas[-1]["t1"] += 0.8
    return linhas


(RAIZ / "motor" / "cenas" / "comunismo-03.tempos.js").write_text(
    "// GERADO por audio/comunismo-03/montar.py — não editar à mão\n"
    f"window.TEMPOS = {json.dumps({'dur': DUR, 'marcas': M, 'legendas': legendas(PAL)}, ensure_ascii=False)};\n")

(mus_e, mus_d), (sfx_e, sfx_d) = trilha(M, N)
mus_e, mus_d, sfx_e, sfx_d = (x[:N] for x in (mus_e, mus_d, sfx_e, sfx_d))

# ---------------------------------------------------------------- mixagem: a voz manda (trilha ~22 dB abaixo)
e = som.envelope_voz(voz)
fala = e > 0.3
rms = lambda x: float(np.sqrt(np.mean(x[fala] ** 2))) or 1e-9
REF = 0.2
voz_mix = voz * (REF / rms(voz))
g_mus = REF * 10 ** (-22 / 20) / rms((mus_e + mus_d) / 2 * (1 - 0.7 * e))
g_sfx = REF * 10 ** (-20 / 20) / max(rms((sfx_e + sfx_d) / 2 * (1 - 0.75 * e)), 1e-9)
leito_e, leito_d = mus_e * (1 - 0.7 * e) * g_mus, mus_d * (1 - 0.7 * e) * g_mus
# sob o vídeo do Jones: só um fundo bem baixo, ~24 dB abaixo da voz de referência (pedido do autor: "a trilha está alta na cena do Jones").
# Atenção: o volume final é ajustado com ganho FIXO (juntar.sh), sem loudnorm dinâmico, que antes "puxava" este fundo para cima.
tt = np.arange(N) / SR
ig = slice(int(0.5 * SR), int((GANCHO - 0.5) * SR))
r_hook = float(np.sqrt(np.mean(((leito_e + leito_d) / 2)[ig] ** 2))) or 1e-9
alvo = REF * 10 ** (-24 / 20)
sob_jones = np.interp(tt, [0, GANCHO, VIN], [alvo / r_hook, alvo / r_hook, 1.0]).astype(np.float32)
leito_e, leito_d = leito_e * sob_jones, leito_d * sob_jones
ef_e = np.clip(sfx_e * (1 - 0.75 * e) * g_sfx, -0.6, 0.6); ef_d = np.clip(sfx_d * (1 - 0.75 * e) * g_sfx, -0.6, 0.6)


def limitar(x, teto=0.7):
    a = np.abs(x)
    return np.where(a > teto, np.sign(x) * (teto + 0.28 * np.tanh((a - teto) / 0.28)), x).astype(np.float32)


som.salvar_wav(str(AQUI / "mix.wav"), limitar(voz_mix + leito_e + ef_e), limitar(voz_mix + leito_d + ef_d))
som.salvar_wav(str(AQUI / "voz.wav"), voz_mix.astype(np.float32), voz_mix.astype(np.float32))
print(f"{DUR:.2f}s · fala {INICIO:.1f}-{FIM:.1f} ({FIM - INICIO:.1f} s)")
print(json.dumps(M))
