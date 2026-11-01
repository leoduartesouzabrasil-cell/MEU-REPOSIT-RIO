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
        (4, 22.25, None, 4.4),    # cartela final + logo
    ]),
    "60": dict(entrada=0.3, sufixo="-60", pecas=[
        (1, 0.00, 18.10, 1.3),    # o áudio da ameaça → CARTAZ "VENENO NA ÁGUA"
        (1, 18.10, 22.50, 0.25),  # aldeia Sassoró, Guarani Kaiowá
        (1, 28.82, 32.95, 0.35),  # MPI: não há comprovação de contaminação
        (2, 0.00, 10.90, 0.35),   # não foi caso isolado · 5 assassinatos (Cimi)
        (3, 21.40, None, 0.4),    # MPF 24 horas · PF acionada
        (4, 22.17, None, 3.9),    # quem tem medo... Constituição → cartela final + logo
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
marca("logo", PAL[-1][2] + 2.0)
M = {k: v for k, v in M.items() if v >= 0}

(RAIZ / "motor" / "cenas" / f"indigenas-ms{CFG['sufixo']}.tempos.js").write_text(
    "// GERADO por audio/indigenas-ms/montar.py — não editar à mão\n"
    f"window.TEMPOS = {json.dumps({'dur': DUR, 'marcas': M, 'legendas': legendas(PAL)}, ensure_ascii=False)};\n")

# ---------------------------------------------------------------- trilha (modo TENSO)
N = len(voz)
mus = np.zeros(N, np.float32)
amb = np.zeros(N, np.float32)

# seções na ordem do vídeo
ordem = [(0.0, "suspense"), (M.get("gravacao"), "tenso"), (M.get("cartaz1"), "golpe"), (M.get("sassoro"), "luto"),
         (M.get("isolado"), "tenso"), (M.get("permanente"), "tenso"), (M.get("cartaz2"), "golpe"),
         (M.get("prefeitura"), "marcha"), (M.get("cacique"), "luto"), (M.get("cartaz3"), "climax"), (M.get("logo"), "fim")]
ordem = [o for o in ordem if o[0] is not None]
secoes = [(a, b, tipo) for (a, tipo), (b, _) in zip(ordem, ordem[1:] + [(DUR, "")])]

# bordão dissonante contínuo (Mi grave), mais forte nas partes de violência
d = som.drone_tenso(DUR + 1)
soma(mus, d, 0, 0.8)
soma(amb, som.vento(DUR), 0, 1.0)

coracao = 60 / 72
for a, b, tipo in secoes:
    t, i = a, 0
    while t < b - 0.05:
        if tipo in ("suspense", "tenso", "luto", "marcha"):          # coração o vídeo inteiro
            soma(mus, som.batimento(), t, 0.9 if tipo == "tenso" else 0.6)
        if tipo == "tenso" and i % 4 == 2:
            soma(mus, som.chocalho(0.5, 0.5), t + coracao / 2)
        if tipo == "marcha" and i % 2 == 0:                          # marcha pesada
            soma(mus, som.tambor(0.8, 80, 38, 0.9), t)
        if tipo == "marcha" and i % 2 == 1:
            soma(mus, som.chocalho(0.35, 0.4), t)
        if tipo == "climax":                                          # tambores graves + chocalho
            soma(mus, som.tambor(1.0, 75, 34, 1.0), t)
            if i % 2 == 1:
                soma(mus, som.tambor(0.6, 120, 60, 0.5), t + coracao / 2)
            if i % 4 == 3:
                soma(mus, som.chocalho(0.6, 0.6), t)
        t += coracao
        i += 1

# flauta grave em frígio: lamento, só onde a narração respira
frases = [
    (0.05, [0, 1, 0], [0.9, 0.6, 1.8]),
    ("sassoro", [3, 2, 1, 0], [0.8, 0.6, 0.8, 2.2], 0.2),
    ("medo", [4, 5, 4], [0.7, 0.7, 2.4], -0.2),
    ("cacique", [0, 1, 3, 1], [0.8, 0.6, 0.9, 2.0], 0.0),
    ("cartaz3", [7, 8, 7, 5, 4], [0.6, 0.6, 0.9, 0.6, 1.6], 0.3),
    ("favor", [4, 5, 4, 1, 0], [0.7, 0.5, 0.8, 0.6, 2.4], 0.0),
]
for t0, graus, ritmo, *desl in frases:
    if isinstance(t0, str):
        if t0 not in M:
            continue
        t0 = M[t0] + desl[0]
    soma(mus, som.frase_tensa(graus, ritmo, 0.5), t0)

# ---------------------------------------------------------------- efeitos
sfx = np.zeros(N, np.float32)
em = lambda *nomes: [M[n] for n in nomes if n in M]
impactos = em("cartaz1", "cinco", "cartaz2", "favor", "dever", "logo") + [M["cartaz3"] + 0.9, M["democracia"] + 0.2]
for t0 in impactos:
    soma(sfx, som.carimbo_sfx(), t0, 0.9)
    soma(sfx, som.boom(), t0, 0.8)
for t0 in em("cartaz1", "cartaz3", "logo"):                               # tensão sobe antes do golpe
    soma(sfx, som.riser(1.4), t0 - 1.4, 0.7)
for t0 in em("sassoro", "cartaz2", "prefeitura", "fim", "isolado", "ministerio"):
    soma(sfx, som.whoosh(), t0 - 0.35, 0.8)
soma(sfx, som.estatica(M["veneno"] - M["gravacao"] + 1.5), M["gravacao"], 1.2)   # chiado da gravação
for k in range(4):                                                        # gotas lentas, caindo no veneno
    soma(sfx, som.gota(), M["cartaz1"] + 0.5 + k * 0.32, 0.7 - k * 0.12)
for t0 in em("pararam"):
    for k in range(3):
        soma(sfx, som.gota(), t0 + 0.4 + k * 0.5, 0.5)
soma(sfx, som.maquina(22, 0.045), M["domingo"] - 0.3, 0.8)
for t0 in em("ministerio"):
    soma(sfx, som.maquina(18, 0.05), t0 + 0.2, 0.7)
for t0 in em("circunst"):
    soma(sfx, som.maquina(14, 0.05), t0, 0.7)
for t0 in em("prefeitura", "mpf", "pf", "deputadas", "governo"):
    soma(sfx, som.maquina(16, 0.04), t0 + 0.1, 0.7)
for t0 in em("apib"):                                                     # contador 2022 → 2026
    for k in range(5):
        soma(sfx, som.tique(), t0 + 1.2 + k * 0.6, 1.0)
for t0 in em("isolado", "rodovia"):
    for k in range(3):
        soma(sfx, som.tique(), t0 + 0.4 + k * 0.35, 0.8)
soma(sfx, som.sino_grave(), M["fim"] - 0.1, 0.9)
for t0 in em("medo"):
    soma(sfx, som.sino_grave(), t0 + 0.3, 0.5)

# ---------------------------------------------------------------- mixagem: a voz manda
# Níveis medidos pelo volume real (RMS) enquanto há fala, não pelo pico:
# trilha ~18 dB abaixo da voz durante a fala (~8 dB nas pausas); efeitos também cedem à voz.
e = som.envelope_voz(voz)
fala = e > 0.3
rms = lambda x: float(np.sqrt(np.mean(x[fala] ** 2))) or 1e-9
REF = 0.2                                        # RMS da voz durante a fala
voz_mix = voz * (REF / rms(voz))

leito = (mus + amb) * (1 - 0.7 * e)              # ducking ~10 dB
leito *= REF * 10 ** (-18 / 20) / rms(leito)
efeitos = sfx * (1 - 0.75 * e)
efeitos *= REF * 10 ** (-20 / 20) / max(rms(efeitos), 1e-9)
efeitos = np.clip(efeitos, -0.6, 0.6) if np.max(np.abs(efeitos)) > 0.6 else efeitos


def limitar(x, teto=0.7):
    """Limitador suave: acima do teto os picos (estrondos) são comprimidos, a voz fica intacta."""
    a = np.abs(x)
    y = np.where(a > teto, np.sign(x) * (teto + 0.28 * np.tanh((a - teto) / 0.28)), x)
    return y.astype(np.float32)


# leve estéreo: trilha um pouco aberta, voz no centro
esq = limitar(voz_mix + leito * 1.05 + amb * 0.05 + efeitos)
dir = limitar(voz_mix + leito * 0.95 - amb * 0.05 + efeitos)
som.salvar_wav(str(AQUI / f"mix{CFG['sufixo']}.wav"), esq, dir)
print(f"versão {VERSAO}: {DUR:.2f}s · {len(PAL)} palavras · marcas: {json.dumps(M)}")
