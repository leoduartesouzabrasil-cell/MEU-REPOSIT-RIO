"""Monta a narração, a trilha e os efeitos do vídeo "Veneno na água" e gera a linha do tempo
que a cena (motor/cenas/indigenas-ms.js) usa. É a fonte única dos tempos: som e imagem batem.

Uso: python3 audio/indigenas-ms/montar.py
Saídas: audio/indigenas-ms/mix.wav e motor/cenas/indigenas-ms.tempos.js
"""
import json
import sys
from pathlib import Path

import numpy as np

AQUI = Path(__file__).resolve().parent
RAIZ = AQUI.parent.parent
sys.path.insert(0, str(RAIZ / "motor"))
import som  # noqa: E402
from som import SR, soma  # noqa: E402

# ---------------------------------------------------------------- narração em trechos
# (arquivo, início, fim, pausa depois). As pausas abrem espaço para os momentos CARTAZ.
ENTRADA = 1.5
PECAS = [
    (1, 0.00, 18.10, 2.0),    # ... votado em Lula. → CARTAZ "VENENO NA ÁGUA"
    (1, 18.10, None, 0.6),
    (2, 0.00, None, 0.6),
    (3, 0.00, 15.30, 2.2),    # ... assassinados em MS. → CARTAZ "6"
    (3, 15.30, None, 0.6),
    (4, 0.00, 22.25, 0.8),    # ... em quem votar. → CARTAZ final
    (4, 22.25, None, 4.0),    # cartela final
]

# correções da transcrição automática (sequência de palavras → texto certo)
CORRECOES = [
    (["Takuru,"], "Tacuru,"), (["Takuru"], "Tacuru"), (["saçoró,"], "Sassoró,"), (["Kayoá."], "Kaiowá."),
    (["Guaranikayoá"], "Guarani Kaiowá"), (["MS", "-200", "e", "89,"], "MS-289,"), (["Amman", "Bay,"], "Amambai,"),
    (["PIB,"], "Apib,"), (["Sélia"], "Célia"), (["Chacriabá"], "Xakriabá"), (["CIMI,"], "Cimi,"),
    (["caminhões", "pipa."], "caminhões-pipa."), (["Estado,"], "Estado."), (["o", "Cacique"], "O cacique"),
    (["completa,"], "completa."), (["proteger"], "Proteger"), (["Durante", "eleição,"], "Durante a eleição,"),
]


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


def montar_narracao():
    brutas = json.loads((AQUI / "palavras.json").read_text())
    audios = {k: som.ler_audio(str(AQUI / f"narracao-{k}.mp3")) for k in range(1, 5)}
    trechos, palavras, t = [], [], ENTRADA
    for k, a, b, pausa in PECAS:
        x = audios[k]
        b = b if b is not None else len(x) / SR
        pedaco = x[int(a * SR):int(b * SR)].copy()
        f = int(0.01 * SR)
        pedaco[:f] *= np.linspace(0, 1, f)
        pedaco[-f:] *= np.linspace(1, 0, f)
        trechos.append((t, pedaco))
        for w, w0, w1 in corrigir(brutas[str(k)]):
            if a <= w0 < b:
                palavras.append([w, round(t + w0 - a, 3), round(t + min(w1, b) - a, 3)])
        t += (b - a) + pausa
    voz = som.segundos(t)
    for t0, p in trechos:
        soma(voz, p, t0)
    return voz, palavras, trechos, t


def quando(palavras, inicio, depois=0.0):
    """Tempo absoluto da primeira palavra que começa com `inicio`, depois de `depois`."""
    for w, t0, _ in palavras:
        if t0 >= depois and w.lower().startswith(inicio.lower()):
            return t0
    raise KeyError(inicio)


def legendas(palavras, max_car=30):
    """Agrupa as palavras em linhas curtas, quebrando na pontuação e em pausas."""
    linhas, atual = [], []
    for i, p in enumerate(palavras):
        atual.append(p)
        texto = " ".join(w for w, _, _ in atual)
        prox = palavras[i + 1] if i + 1 < len(palavras) else None
        pausa = prox is None or prox[1] - p[2] > 0.45
        longa = prox is not None and len(texto) + 1 + len(prox[0]) > max_car
        if p[0][-1] in ".,?!" or longa or pausa:
            linhas.append({"t0": atual[0][1], "t1": p[2], "p": [[w, t0] for w, t0, _ in atual]})
            atual = []
    for a, b in zip(linhas, linhas[1:]):          # cada linha fica até a próxima começar (máx. +0.8 s)
        a["t1"] = round(min(b["t0"], a["t1"] + 0.8), 3)
    linhas[-1]["t1"] += 0.8
    return linhas


# ---------------------------------------------------------------- linha do tempo
voz, PAL, TRECHOS, FIM_VOZ = montar_narracao()
DUR = round(FIM_VOZ, 2)
Q = lambda w, d=0.0: quando(PAL, w, d)
fim_trecho = lambda i: TRECHOS[i][0] + len(TRECHOS[i][1]) / SR

M = {}  # marcas nomeadas (segundos)
M["domingo"] = Q("domingo")
M["audio"] = Q("áudio")
M["gravacao"] = Q("Na")
M["veneno"] = Q("veneno")
M["motivo"] = Q("motivo")
M["lula"] = Q("Lula")
M["cartaz1"] = round(fim_trecho(0) + 0.05, 3)
M["sassoro"] = TRECHOS[1][0]
M["pipa"] = Q("Ali")
M["pararam"] = Q("Depois", M["pipa"])
M["ministerio"] = Q("Ministério")
M["medo"] = Q("Mas", M["ministerio"])
M["isolado"] = TRECHOS[2][0]
M["cimi5"] = Q("Segundo", M["isolado"])
M["cinco"] = Q("5")
M["rodovia"] = Q("rodovia")
M["circunst"] = Q("circunstâncias")
M["caminhonetes"] = Q("Durante")
M["permanente"] = TRECHOS[3][0]
M["apib"] = Q("Apib")
M["cartaz2"] = round(fim_trecho(3) + 0.05, 3)
M["prefeitura"] = TRECHOS[4][0]
M["mpf"] = Q("Ministério", M["prefeitura"])
M["pf"] = Q("Polícia")
M["deputadas"] = TRECHOS[5][0]
M["governo"] = Q("Já", M["deputadas"])
M["cacique"] = Q("O cacique")
M["direito"] = Q("lembra")
M["cartaz3"] = TRECHOS[6][0] - 0.5
M["democracia"] = Q("democracia")
M["favor"] = Q("Proteger")
M["dever"] = Q("dever")
M["constituicao"] = Q("Constituição")
M["fim"] = round(fim_trecho(6) + 0.2, 3)
M = {k: round(v, 3) for k, v in M.items()}

(RAIZ / "motor" / "cenas" / "indigenas-ms.tempos.js").write_text(
    "// GERADO por audio/indigenas-ms/montar.py — não editar à mão\n"
    f"window.TEMPOS = {json.dumps({'dur': DUR, 'marcas': M, 'legendas': legendas(PAL)}, ensure_ascii=False)};\n")

# ---------------------------------------------------------------- trilha
mus = np.zeros(len(voz), np.float32)
amb = np.zeros(len(voz), np.float32)

# bordão: Lá nas partes calmas, Mi grave nas tensas
secoes = [(0, M["gravacao"], 55.0, "calmo"), (M["gravacao"], M["cartaz1"], 41.2, "tenso"),
          (M["cartaz1"], M["sassoro"], 41.2, "golpe"), (M["sassoro"], M["isolado"], 55.0, "triste"),
          (M["isolado"], M["permanente"], 41.2, "tenso"), (M["permanente"], M["cartaz2"], 41.2, "tenso"),
          (M["cartaz2"], M["prefeitura"], 41.2, "golpe"), (M["prefeitura"], M["cacique"], 55.0, "pulso"),
          (M["cacique"], M["cartaz3"], 55.0, "quente"), (M["cartaz3"], DUR, 55.0, "climax")]
for a, b, base, tipo in secoes:
    d = som.drone(b - a + 1.0, base, 0.6 if tipo in ("climax", "quente") else 0.2)
    f = int(0.8 * SR)
    d[:f] *= np.linspace(0, 1, f)
    d[-f:] *= np.linspace(1, 0, f)
    soma(mus, d, a - 0.2, 0.9 if tipo != "golpe" else 0.5)

    bpm = 92
    batida = 60 / bpm
    t = a
    i = 0
    while t < b:
        if tipo in ("pulso", "climax", "quente"):                  # maracá constante, acento no tempo
            soma(mus, som.maraca(1.0 if i % 2 == 0 else 0.55), t)
            soma(mus, som.maraca(0.4), t + batida / 2)
        if tipo == "triste" and i % 4 == 0:
            soma(mus, som.maraca(0.35, 0.25), t)
        if tipo == "tenso" and i % 2 == 0:                          # coração
            soma(mus, som.batimento(), t, 0.8)
        if tipo == "climax" and i % 2 == 0:
            soma(mus, som.tambor(0.9), t)
        if tipo == "climax" and i % 4 == 3:
            soma(mus, som.tambor(0.6, 140, 70, 0.4), t + batida / 2)
        if tipo == "pulso" and i % 4 == 0:
            soma(mus, som.tambor(0.45), t)
        t += batida
        i += 1

# frases de flauta (pentatônica de Lá): só nas partes calmas, tristes, quentes e no clímax
frases = [
    (0.1, [5, 4, 3, 1, 2], [0.5, 0.35, 0.35, 0.6, 1.4], 1.0),
    (M["sassoro"] + 0.3, [3, 2, 1, 0], [0.7, 0.5, 0.6, 2.0], 1.0),
    (M["pararam"], [2, 3, 1, 0], [0.6, 0.6, 0.8, 1.8], 1.0),
    (M["medo"] - 0.2, [4, 3, 1], [0.6, 0.6, 2.4], 0.5),
    (M["cacique"], [0, 1, 2, 3, 2], [0.6, 0.5, 0.5, 0.9, 1.6], 1.0),
    (M["direito"] + 1.0, [3, 4, 5, 4], [0.5, 0.5, 0.9, 1.8], 1.0),
    (M["cartaz3"] + 0.2, [5, 6, 7, 6, 5, 4], [0.45, 0.45, 0.7, 0.45, 0.45, 1.2], 1.0),
    (M["favor"], [4, 5, 7, 8], [0.6, 0.6, 0.6, 2.2], 1.0),
    (M["constituicao"] + 0.4, [5, 4, 3, 5], [0.5, 0.5, 0.6, 2.5], 1.0),
]
for t0, graus, ritmo, oit in frases:
    soma(mus, som.frase_flauta(graus, ritmo, oit, 0.55), t0)

# ambiente de mata nas partes calmas
soma(amb, som.grilos(M["gravacao"] + 1), 0, 1.0)
soma(amb, som.grilos(M["isolado"] - M["sassoro"]), M["sassoro"], 0.8)
soma(amb, som.grilos(M["cartaz3"] - M["cacique"]), M["cacique"], 0.8)
for t0 in [0.6, 3.2, M["sassoro"] + 2.0, M["sassoro"] + 6.5, M["cacique"] + 1.5, M["cacique"] + 7.0]:
    soma(amb, som.passaro(), t0)
    soma(amb, som.passaro(0.18, 3000, 4200), t0 + 0.3)

# ---------------------------------------------------------------- efeitos
sfx = np.zeros(len(voz), np.float32)
for t0 in [M["cartaz1"], M["cartaz2"], M["cartaz3"] + 0.9, M["democracia"] + 0.2, M["favor"] + 0.1, M["dever"]]:
    soma(sfx, som.carimbo_sfx(), t0, 0.9)
for t0 in [M["cartaz1"] - 0.35, M["sassoro"] - 0.35, M["cartaz2"] - 0.35, M["prefeitura"] - 0.35, M["cartaz3"] - 0.4,
           M["fim"] - 0.35]:
    soma(sfx, som.whoosh(), t0, 0.8)
soma(sfx, som.estatica(M["veneno"] - M["gravacao"] + 1.5), M["gravacao"], 1.0)   # chiado da gravação
for k in range(4):
    soma(sfx, som.gota(), M["cartaz1"] + 0.5 + k * 0.32, 0.8 - k * 0.15)
for k in range(3):
    soma(sfx, som.gota(), M["pararam"] + 0.4 + k * 0.5, 0.6)
soma(sfx, som.maquina(22, 0.045), M["domingo"] - 0.3, 0.9)
soma(sfx, som.maquina(18, 0.05), M["ministerio"] + 0.2, 0.8)
soma(sfx, som.maquina(14, 0.05), M["circunst"], 0.8)
for nome in ["prefeitura", "mpf", "pf", "deputadas", "governo"]:
    soma(sfx, som.maquina(16, 0.04), M[nome] + 0.1, 0.8)
for k in range(5):                                                        # contador 2022 → 2026
    soma(sfx, som.tique(), M["apib"] + 1.2 + k * 0.6, 1.0)
for nome in ["isolado", "rodovia"]:
    for k in range(3):
        soma(sfx, som.tique(), M[nome] + 0.4 + k * 0.35, 0.8)
soma(sfx, som.sino_grave(), M["fim"] - 0.2, 1.0)
soma(sfx, som.sino_grave(), M["medo"] + 0.3, 0.5)

# ---------------------------------------------------------------- mixagem com ducking
e = som.envelope_voz(voz)
duck = 1 - 0.72 * e                       # trilha cai ~11 dB quando há voz
mus_mix = mus * duck * 0.55 + amb * (1 - 0.5 * e)
sfx_mix = sfx * (1 - 0.35 * e) * 0.6
voz_mix = som.norm(voz, 0.85)

# leve estéreo: maracá/ambiente um pouco abertos, voz no centro
esq = voz_mix + mus_mix * 0.95 + amb * 0.1 + sfx_mix
dir = voz_mix + mus_mix * 0.85 - amb * 0.1 + sfx_mix
pico = max(np.max(np.abs(esq)), np.max(np.abs(dir)))
esq, dir = esq / pico * 0.95, dir / pico * 0.95
som.salvar_wav(str(AQUI / "mix.wav"), esq, dir)
print(f"duração {DUR:.2f}s · {len(PAL)} palavras · marcas: {json.dumps(M)}")
