"""Monta a narração, a trilha e os efeitos do vídeo "Veneno na água" e gera a linha do tempo
que a cena (motor/cenas/indigenas-ms.js) usa. É a fonte única dos tempos: som e imagem batem.

Uso: python3 audio/indigenas-ms/montar.py [60|completo]
Saídas: audio/indigenas-ms/mix[-60].wav e motor/cenas/indigenas-ms[-60].tempos.js
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

# ---------------------------------------------------------------- versões
# trechos da narração: (arquivo, início, fim, pausa depois), cortes sempre dentro de silêncios.
# As pausas abrem espaço para os momentos CARTAZ.
VERSOES = {
    "completo": dict(entrada=1.5, sufixo="", pecas=[
        (1, 0.00, 18.10, 2.0),    # ... votado em Lula. → CARTAZ "VENENO NA ÁGUA"
        (1, 18.10, None, 0.6),
        (2, 0.00, None, 0.6),
        (3, 0.00, 15.30, 2.2),    # ... assassinados em MS. → CARTAZ "6"
        (3, 15.30, None, 0.6),
        (4, 0.00, 22.25, 0.8),    # ... em quem votar. → CARTAZ final
        (4, 22.25, None, 4.0),    # cartela final
    ]),
    "60": dict(entrada=0.6, sufixo="-60", pecas=[
        (1, 0.00, 18.10, 1.5),    # o áudio da ameaça → CARTAZ "VENENO NA ÁGUA"
        (1, 18.10, 22.50, 0.3),   # aldeia Sassoró, Guarani Kaiowá
        (1, 28.82, 32.95, 0.5),   # MPI: não há comprovação de contaminação
        (2, 0.00, 10.90, 0.5),    # não foi caso isolado · 5 assassinatos (Cimi)
        (3, 21.40, None, 0.6),    # MPF 24 horas · PF acionada
        (4, 22.17, None, 2.6),    # quem tem medo... Constituição → cartela final
    ]),
}
VERSAO = sys.argv[1] if len(sys.argv) > 1 else "completo"
CFG = VERSOES[VERSAO]

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
    trechos, palavras, t = [], [], CFG["entrada"]
    for k, a, b, pausa in CFG["pecas"]:
        x = audios[k]
        b = b if b is not None else len(x) / SR
        pedaco = x[int(a * SR):int(b * SR)].copy()
        f = int(0.01 * SR)
        pedaco[:f] *= np.linspace(0, 1, f)
        pedaco[-f:] *= np.linspace(1, 0, f)
        trechos.append((t, pedaco))
        for w, w0, w1 in corrigir(brutas[str(k)]):
            if w1 > a + 0.05 and w0 < b - 0.05:     # a transcrição às vezes marca o início um pouco cedo
                palavras.append([w, round(t + max(w0, a) - a, 3), round(t + min(w1, b) - a, 3)])
        t += (b - a) + pausa
    voz = som.segundos(t)
    for t0, p in trechos:
        soma(voz, p, t0)
    return voz, palavras, t


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
voz, PAL, FIM_VOZ = montar_narracao()
DUR = round(FIM_VOZ, 2)


def frase(texto, depois=0.0, fim=False):
    """Tempo absoluto em que a frase começa (ou termina, com fim=True). None se não estiver nesta versão."""
    limpa = lambda w: w.lower().strip(".,?!")
    for i in range(len(PAL)):
        if PAL[i][1] < depois:
            continue
        junto, j = "", i                     # as correções juntam palavras ("Durante a eleição,"): compara o texto
        while j < len(PAL) and len(junto) < len(texto):
            junto = (junto + " " + " ".join(limpa(x) for x in PAL[j][0].split())).strip()
            j += 1
        if junto == texto.lower() or junto.startswith(texto.lower() + " "):
            return PAL[j - 1][2] if fim else PAL[i][1]
    return None


M = {}  # marcas nomeadas (segundos); ausentes nesta versão ficam de fora


def marca(nome, valor):
    if valor is not None:
        M[nome] = round(valor, 3)


marca("domingo", frase("domingo"))
marca("audio", frase("áudio começou"))
marca("gravacao", frase("na gravação"))
marca("veneno", frase("veneno"))
marca("motivo", frase("o motivo"))
marca("cartaz1", (frase("em lula", fim=True) or -1) + 0.05)
marca("sassoro", frase("a água abastece"))
marca("pipa", frase("ali"))
marca("pararam", frase("depois do áudio"))
marca("ministerio", frase("o ministério dos povos"))
marca("medo", frase("mas o medo"))
marca("isolado", frase("e não foi"))
marca("cinco", frase("5"))
marca("rodovia", frase("na rodovia"))
marca("circunst", frase("as circunstâncias"))
marca("caminhonetes", frase("durante a eleição"))
marca("permanente", frase("para o cimi"))
marca("apib", frase("segundo a apib"))
if "apib" in M:
    marca("cartaz2", frase("mato grosso do sul", M["apib"], fim=True) + 0.05)
marca("prefeitura", frase("diante das") or frase("o ministério público"))
marca("mpf", frase("o ministério público"))
marca("pf", frase("a polícia federal"))
marca("deputadas", frase("as deputadas"))
marca("governo", frase("já o governo"))
marca("cacique", frase("o cacique"))
marca("direito", frase("e lembra"))
marca("cartaz3", frase("quem tem medo") - 0.5)
marca("democracia", frase("democracia"))
marca("favor", frase("proteger os povos"))
marca("dever", frase("dever do estado"))
marca("constituicao", frase("constituição"))
marca("fim", PAL[-1][2] + 0.4)
M = {k: v for k, v in M.items() if v >= 0}

(RAIZ / "motor" / "cenas" / f"indigenas-ms{CFG['sufixo']}.tempos.js").write_text(
    "// GERADO por audio/indigenas-ms/montar.py — não editar à mão\n"
    f"window.TEMPOS = {json.dumps({'dur': DUR, 'marcas': M, 'legendas': legendas(PAL)}, ensure_ascii=False)};\n")

# ---------------------------------------------------------------- trilha
N = len(voz)
mus = np.zeros(N, np.float32)
amb = np.zeros(N, np.float32)

# seções na ordem do vídeo: bordão em Lá nas partes calmas, Mi grave nas tensas
ordem = [(0.0, 55.0, "calmo"), (M.get("gravacao"), 41.2, "tenso"), (M.get("cartaz1"), 41.2, "golpe"),
         (M.get("sassoro"), 55.0, "triste"), (M.get("isolado"), 41.2, "tenso"), (M.get("permanente"), 41.2, "tenso"),
         (M.get("cartaz2"), 41.2, "golpe"), (M.get("prefeitura"), 55.0, "pulso"), (M.get("cacique"), 55.0, "quente"),
         (M.get("cartaz3"), 55.0, "climax")]
ordem = [o for o in ordem if o[0] is not None]
secoes = [(a, b, base, tipo) for (a, base, tipo), (b, _, _) in zip(ordem, ordem[1:] + [(DUR, 0, "")])]
for a, b, base, tipo in secoes:
    d = som.drone(b - a + 1.0, base, 0.6 if tipo in ("climax", "quente") else 0.2)
    f = int(0.8 * SR)
    d[:f] *= np.linspace(0, 1, f)
    d[-f:] *= np.linspace(1, 0, f)
    soma(mus, d, a - 0.2, 0.9 if tipo != "golpe" else 0.5)

    batida = 60 / 92
    t, i = a, 0
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
    (0.1, [5, 4, 3, 1, 2], [0.5, 0.35, 0.35, 0.6, 1.4]),
    ("sassoro", [3, 2, 1, 0], [0.7, 0.5, 0.6, 2.0], 0.3),
    ("pararam", [2, 3, 1, 0], [0.6, 0.6, 0.8, 1.8], 0.0),
    ("medo", [4, 3, 1], [0.6, 0.6, 2.4], -0.2),
    ("cacique", [0, 1, 2, 3, 2], [0.6, 0.5, 0.5, 0.9, 1.6], 0.0),
    ("direito", [3, 4, 5, 4], [0.5, 0.5, 0.9, 1.8], 1.0),
    ("cartaz3", [5, 6, 7, 6, 5, 4], [0.45, 0.45, 0.7, 0.45, 0.45, 1.2], 0.2),
    ("favor", [4, 5, 7, 8], [0.6, 0.6, 0.6, 2.2], 0.0),
    ("constituicao", [5, 4, 3, 5], [0.5, 0.5, 0.6, 2.5], 0.4),
]
for t0, graus, ritmo, *desl in frases:
    if isinstance(t0, str):
        if t0 not in M:
            continue
        t0 = M[t0] + desl[0]
    soma(mus, som.frase_flauta(graus, ritmo, 1.0, 0.55), t0)

# ambiente de mata nas partes calmas
fim_secao = {a: b for a, b, _, _ in secoes}
for nome in ["sassoro", "cacique"]:
    if nome in M:
        soma(amb, som.grilos(fim_secao[M[nome]] - M[nome]), M[nome], 0.8)
        for d in (2.0, 6.5):
            soma(amb, som.passaro(), M[nome] + d)
            soma(amb, som.passaro(0.18, 3000, 4200), M[nome] + d + 0.3)
soma(amb, som.grilos(M["gravacao"] + 1), 0, 1.0)
for t0 in [0.6, 3.2]:
    soma(amb, som.passaro(), t0)

# ---------------------------------------------------------------- efeitos
sfx = np.zeros(N, np.float32)
em = lambda *nomes: [M[n] for n in nomes if n in M]
for t0 in em("cartaz1", "cartaz2", "favor", "dever") + [M["cartaz3"] + 0.9, M["democracia"] + 0.2]:
    soma(sfx, som.carimbo_sfx(), t0, 0.9)
for t0 in em("cartaz1", "sassoro", "cartaz2", "prefeitura", "cartaz3", "fim"):
    soma(sfx, som.whoosh(), t0 - 0.35, 0.8)
soma(sfx, som.estatica(M["veneno"] - M["gravacao"] + 1.5), M["gravacao"], 1.0)   # chiado da gravação
for k in range(4):
    soma(sfx, som.gota(), M["cartaz1"] + 0.5 + k * 0.32, 0.8 - k * 0.15)
for t0 in em("pararam"):
    for k in range(3):
        soma(sfx, som.gota(), t0 + 0.4 + k * 0.5, 0.6)
soma(sfx, som.maquina(22, 0.045), M["domingo"] - 0.3, 0.9)
for t0 in em("ministerio"):
    soma(sfx, som.maquina(18, 0.05), t0 + 0.2, 0.8)
for t0 in em("circunst"):
    soma(sfx, som.maquina(14, 0.05), t0, 0.8)
for t0 in em("prefeitura", "mpf", "pf", "deputadas", "governo"):
    soma(sfx, som.maquina(16, 0.04), t0 + 0.1, 0.8)
for t0 in em("apib"):                                                     # contador 2022 → 2026
    for k in range(5):
        soma(sfx, som.tique(), t0 + 1.2 + k * 0.6, 1.0)
for t0 in em("isolado", "rodovia"):
    for k in range(3):
        soma(sfx, som.tique(), t0 + 0.4 + k * 0.35, 0.8)
soma(sfx, som.sino_grave(), M["fim"] - 0.2, 1.0)
for t0 in em("medo"):
    soma(sfx, som.sino_grave(), t0 + 0.3, 0.5)

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
som.salvar_wav(str(AQUI / f"mix{CFG['sufixo']}.wav"), esq, dir)
print(f"versão {VERSAO}: {DUR:.2f}s · {len(PAL)} palavras · marcas: {json.dumps(M)}")
