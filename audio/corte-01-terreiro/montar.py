"""CORTE 01 da live do Coletivo Lufã (15/11/2026): Núcleo dos Povos de Terreiro (41:24–46:16, só os pontos principais).
Falam: Leonardo Duarte (@_ocamarada, janela "Coletivo Lufã") e Luiz Gustavo (@vamosinvestigar).
Gera edl.json (trechos da live → linha do tempo), mix.wav e motor/cenas/corte-01-terreiro.tempos.js (legendas + marcas + quem fala).
Depois: python3 audio/corte-01-terreiro/base.py e o overlay (ver roteiros/cortes-live-lufa.md)."""
import json, subprocess, sys
from pathlib import Path
import numpy as np
AQUI = Path(__file__).resolve().parent; RAIZ = AQUI.parent.parent
sys.path.insert(0, str(RAIZ / "motor"))
import som  # noqa
from som import SR, soma  # noqa
FONTE = RAIZ / "midia/cortes/fonte.mp4"
# (início, fim, quem, card) em segundos da live; as bordas vão para o vale de energia mais próximo
# v2 (pedido do autor): 50–60 s, começa no Dia Nacional da Umbanda, só o que tem mais força; cortes SEMPRE no silêncio entre frases.
# (início aprox., fim aprox., quem, card): a borda vai para o ponto de menor energia numa janela pequena antes/depois.
# v4 (pedido do autor): frases completas e com sentido, menos picotado, transição suave entre os trechos;
# Luiz na ordem: nome + "ogã de candomblé" → a importância (organizar, violência) → o mapeamento das casas.
SEGMENTOS = [
    (2509.90, 2527.05, "leo", "nucleo"),       # "Então hoje, no Dia Nacional ... da Umbanda, pra gente poder falar sobre a criação ... do Núcleo dos Povos de Terreiro ... acolhimento pra essa galera."
    (2546.66, 2577.62, "leo", "direita"),      # ... "são periféricas, foram em vida pessoas que sofreram ... pra que a gente possa aprender em vida, tá bom? Então, Luiz, fica à vontade de poder falar da importância da questão desse núcleo," (passagem natural para o Luiz)      # "Porque muitas vezes ... extrema direita, ao bolsonarismo. Isso não pode acontecer, porque hoje Oxalá é preto ... periféricas."
    (2622.28, 2623.66, "luiz", "luiz"),        # "Meu nome é Luiz Gustavo"
    (2634.77, 2635.75, "luiz", "luiz"),        # "sou ogã de candomblé"
    (2694.55, 2710.10, "luiz", "importancia"), # "Mas é importante a gente, enquanto marxista, se organizar junto com essa galera ... violência bolsonarista tá atacando muito essa galera, né."
    (2754.92, 2772.06, "luiz", "mapa"),        # "Eu acho que a ideia é fazer a iniciativa mesmo, né, a gente fazer esse mapeamento ... militando essas casas também."
]
CORRECOES = [(["lutativa"], "iniciativa"), (["Luz"], "Luiz"), (["um", "banda"], "Umbanda"), (["um", "banda,"], "Umbanda,"), (["comporância"], "concordância,"), (["o", "chá"], "o orixá"),
             (["gante"], "ogã de"), (["ao", "xalá"], "a Oxalá,"), (["canoblé"], "candomblé"), (["quanto", "marxista"], "enquanto marxista,"),
             (["nacional"], "Nacional"), (["Luiz"], "Luiz,"), (["Então", "Luiz"], "Então, Luiz,"), (["periféricas"], "periféricas,"), (["fica", "a", "vontade"], "fica à vontade"), (["dia", "15"], "dia 15")]
PAUSA_MAX, PAUSA_FICA = 1.0, 0.45
XF = 0.20                                   # transição suave (som e imagem) entre um trecho e outro

pal_live = json.load(open(RAIZ / "midia/cortes/transcricao.json"))
# áudio da janela 41:00–46:30, tratado: menos chiado da chamada, as duas vozes no mesmo volume
T0, T1 = 2460.0, 2790.0
af = ("highpass=f=75,afftdn=nr=10:nf=-42:tn=1,equalizer=f=300:t=q:w=1.3:g=-2,equalizer=f=3200:t=q:w=1.4:g=1.5,bass=g=2:f=120,"
      "dynaudnorm=f=300:g=15:p=0.9:m=8,acompressor=threshold=-20dB:ratio=2.5:attack=10:release=150:makeup=2,alimiter=limit=0.92")
raw = subprocess.run(["ffmpeg", "-loglevel", "error", "-ss", str(T0), "-t", str(T1 - T0), "-i", str(FONTE), "-vn", "-af", af, "-ac", "1", "-ar", str(SR),
                      "-f", "f32le", "-"], capture_output=True, check=True).stdout
x = np.frombuffer(raw, np.float32).copy()
q = int(0.01 * SR)
en = np.array([np.sqrt(np.mean(x[i:i + q] ** 2)) for i in range(0, len(x) - q, q)])
LIM = np.percentile(en, 95) * 10 ** (-32 / 20)
def vale(a, b):
    i, j = int((a - T0) * 100), int((b - T0) * 100); s = np.convolve(en, np.ones(3) / 3, "same")
    return T0 + (i + int(np.argmin(s[i:j]))) * 0.01

def pausas(ini, fim):
    a, b = int((ini - T0) * 100), int((fim - T0) * 100); v = en[a:b] > LIM
    out, i0, i = [], a, a
    while i < b:
        if not v[i - a]:
            j = i
            while j < b and not v[j - a]: j += 1
            if (j - i) * 0.01 > PAUSA_MAX and i > i0:
                m = int(PAUSA_FICA / 2 * 100); out.append((T0 + i0 * 0.01, T0 + (i + m) * 0.01)); i0 = j - m
            i = j
        else: i += 1
    out.append((T0 + i0 * 0.01, fim)); return out

def corrigir(ws):
    out, i = [], 0
    while i < len(ws):
        for seq, novo in CORRECOES:
            if [w[0] for w in ws[i:i + len(seq)]] == seq:
                out.append([novo, ws[i][1], ws[i + len(seq) - 1][2]]); i += len(seq); break
        else: out.append(list(ws[i])); i += 1
    return out

edl, PAL, t, BLOCOS = [], [], 0.0, []
for n, (a, b, quem, card) in enumerate(SEGMENTOS):
    ini, fim = vale(a - 0.03, a + 0.03), vale(b - 0.04, b + 0.04)       # pontos de corte conferidos à mão no silêncio entre as palavras
    t_bloco = t
    peds = pausas(ini, fim); tp = []
    for p0, p1 in peds:
        if edl: t -= XF                                      # o trecho novo entra por cima do fim do anterior (fusão de 0,2 s)
        edl.append({"ini": round(p0, 3), "fim": round(p1, 3), "t": round(t, 3), "dur": round(p1 - p0, 3), "quem": quem}); tp.append((p0, p1, t)); t += p1 - p0
    ws = corrigir([w for w in pal_live if ini - 0.03 <= w[1] < fim - 0.08])
    if ws:
        ws[0][0] = ws[0][0][:1].upper() + ws[0][0][1:]
        if ws[-1][0][-1] not in ".!?": ws[-1][0] = ws[-1][0].rstrip(",") + "."
    for w, wa, wb in ws:
        p0, p1, tt = next(((p0, p1, tt) for p0, p1, tt in tp if wa < p1), tp[-1])
        PAL.append([w, round(tt + max(0, wa - p0), 3), round(tt + min(wb, p1) - p0, 3)])
    BLOCOS.append({"t0": round(t_bloco, 3), "t1": round(t, 3), "quem": quem, "card": card})
# blocos seguidos com o mesmo card viram um só (o card não reanima)
_b = []
for b in BLOCOS:
    if _b and _b[-1]["card"] == b["card"] and _b[-1]["quem"] == b["quem"]: _b[-1]["t1"] = b["t1"]
    else: _b.append(b)
BLOCOS = _b
DUR = round(t + 0.6, 2)

def legendas(ps, max_car=26):
    linhas, at = [], []
    for i, p in enumerate(ps):
        at.append(p); txt = " ".join(w for w, _, _ in at); prox = ps[i + 1] if i + 1 < len(ps) else None
        if p[0][-1] in ".,?!" or prox is None or len(txt) + 1 + len(prox[0]) > max_car or prox[1] - p[2] > 0.6:
            linhas.append({"t0": at[0][1], "t1": prox[1] if prox else p[2] + 0.6, "p": [[w, a] for w, a, _ in at]}); at = []
    return linhas
def quando(txt, depois=0.0):
    """Primeiro instante em que a fala (legenda já corrigida) começa com o texto dado (compara o texto corrido, sem pontuação)."""
    limpa = lambda w: w.lower().replace(",", "").replace(".", "").replace("?", "").replace("!", "")
    for i in range(len(PAL)):
        corrido = " ".join(limpa(w) for w, _, _ in PAL[i:i + 6])
        if PAL[i][1] >= depois and (corrido + " ").startswith(txt.lower() + " "): return round(PAL[i][1], 3)
    return None
MARCAS = {k: quando(v) for k, v in {"nucleo": "do núcleo", "consc": "conscientização", "extrema": "extrema", "oxala": "o orixá", "foram": "foram em vida", "chamada": "então luiz", "pretas": "são pretas",
          "institucional": "institucional", "casas": "das casas"}.items()}
(RAIZ / "motor/cenas/corte-01-terreiro.tempos.js").write_text(
    "// GERADO por audio/corte-01-terreiro/montar.py\n"
    f"window.TEMPOS = {json.dumps({'dur': DUR, 'blocos': BLOCOS, 'marcas': MARCAS, 'legendas': legendas(PAL)}, ensure_ascii=False)};\n")
(AQUI / "edl.json").write_text(json.dumps({"dur": DUR, "xf": XF, "cortes": edl}, indent=1))

# áudio montado (sem trilha: é fala de live), com microfades nas emendas
N = int(DUR * SR); voz = np.zeros(N + SR, np.float32)
for c in edl:
    p = x[int((c["ini"] - T0) * SR):int((c["fim"] - T0) * SR)].copy(); g = min(int(XF * SR), len(p) // 2)
    p[:g] *= np.sqrt(np.linspace(0, 1, g)); p[-g:] *= np.sqrt(np.linspace(1, 0, g)); soma(voz, p, c["t"])   # fusão de som igual-potência
voz = voz[:N]
som.salvar_wav(str(AQUI / "mix.wav"), voz, voz)
print(f"{DUR:.1f}s · {len(edl)} pedaços · {len(SEGMENTOS)} trechos")
print(" / ".join(" ".join(w for w, _ in l["p"]) for l in legendas(PAL)))
