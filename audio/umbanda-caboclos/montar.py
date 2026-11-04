"""Monta narração, trilha contínua (tensa, com maracá/tambor/flauta) e efeitos do vídeo "Okê, caboclo",
e gera motor/cenas/umbanda-caboclos.tempos.js (marcas + legendas) para a cena.

Uso: python3 audio/umbanda-caboclos/montar.py
Entrada: narracao-1..4.m4a e palavras.json (transcrição com tempo por palavra, faster-whisper)
Saída: audio/umbanda-caboclos/mix.wav
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

ENTRADA = 0.6
# pausa depois de cada áudio: espaço para os golpes CARTAZ e para o logo
PAUSAS = {1: 0.4, 2: 1.2, 3: 1.6, 4: 3.6}
PAUSA_MAX = 0.32
# pausas que devem ser MAIORES (arquivo, instante no arquivo original → duração): espaço para efeitos
PAUSAS_ESPECIAIS = {3: [(12.15, 1.4)]}     # entre "só em 2025," e "258": rajada de tiros         # silêncios internos mais longos que isto são encurtados (sem cortar fala)

CORRECOES = [
    (["O", "que", "caboclo?"], "Okê, caboclo!"), (["pitiguaíba,"], "Pitiguaíba,"), (["sete", "flechas,"], "Sete Flechas,"),
    (["caboca", "jurema,"], "Cabocla Jurema,"), (["topnambá."], "Tupinambá."), (["reverancia"], "reverencia"),
    (["umbanda"], "Umbanda"), (["o", "caboclo", "das", "sete", "encruzilhadas,"], "o Caboclo das Sete Encruzilhadas,"),
    (["o", "Brasil"], "O Brasil"),
    (["espiritismo,"], "Espiritismo:"), (["negros"], "negros e"), (["saúda", "a", "caboclo"], "saúda caboclo"),
    (["já."], "já!"), (["Agora", "pensa,"], "Agora pensa."),
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


def trechos_com_fala(x, especiais=()):
    """Segmentos [a, b) a manter: corta silêncio do começo/fim e encurta pausas internas longas.
    especiais: [(instante, duração)] — a pausa que contém o instante fica com essa duração (pode até crescer)."""
    q = int(0.01 * SR)
    en = np.array([np.sqrt(np.mean(x[i:i + q] ** 2)) for i in range(0, len(x) - q, q)])
    voz = en > np.max(en) * 10 ** (-38 / 20)
    idx = np.where(voz)[0]
    ini, fim = idx[0], idx[-1]
    segs, a, i = [], max(0, ini - 10), ini
    pendentes = list(especiais)
    while i <= fim:
        if not voz[i]:
            j = i
            while j <= fim and not voz[j]:
                j += 1
            alvo = next((d for t_e, d in pendentes if i * 0.01 - 0.3 <= t_e <= j * 0.01 + 0.3), None)
            if alvo is not None:
                pendentes = [e for e in pendentes if e[1] != alvo]     # cada pausa especial vale uma vez só
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
    return segs


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
    x = som.ler_audio(str(AQUI / f"narracao-{k}.m4a"))
    segs = trechos_com_fala(x, PAUSAS_ESPECIAIS.get(k, ()))
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
    for w, w0, w1 in corrigir(brutas[str(k)]):
        PAL.append([w, round(mapear(w0, segs, t), 3), round(mapear(w1, segs, t), 3)])
    INICIO[k], FIM[k] = t, t + len(audio_k) / SR
    t = FIM[k] + PAUSAS[k]
DUR = round(t, 2)
voz = np.zeros(int(DUR * SR) + SR, np.float32)
for t0, p in pecas:
    soma(voz, p, t0)
voz = voz[:int(DUR * SR)]
N = len(voz)


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


M = {
    "oke1": frase("okê"), "gira": frase("na gira"), "pitiguaiba": frase("pitiguaíba"), "flechas": frase("sete flechas"),
    "jurema": frase("cabocla jurema"), "tupinamba": frase("tupinambá"), "reverencia": frase("você reverencia"),
    "roupa": frase("roupa branca"), "origem": INICIO[2], "setecruz": frase("o caboclo das sete encruzilhadas"), "ano1908": frase("1908"), "abriu": frase("ele abriu"),
    "elitizado": frase("elitizado"), "negros": frase("negros"), "pensa": INICIO[3], "milhao": frase("o brasil tem"),
    "povos391": frase("391"), "ano2025": frase("só em 2025"), "n258": frase("258"), "terra": frase("quando a terra"),
    "voz": FIM[3] + 0.05, "naoda": INICIO[4], "votar": frase("muito menos"), "sauda": frase("quem saúda"),
    "oke2": frase("okê", INICIO[4]), "demarcacao": frase("demarcação"), "logo": FIM[4] + 0.6,
}
M["fim2"] = FIM[2]
# rajada de tiros na pausa entre "só em 2025," e "258" + um tiro distante depois de "assassinados"
_g1 = frase("258"); _g0 = _g1 - 1.45
M["tiro1"], M["tiro2"], M["tiro3"] = _g0 + 0.15, _g0 + 0.5, _g0 + 0.72
M["tiro4"] = frase("assassinados", fim=True) + 0.15
M["urna"] = frase("votar")
M["contra"] = frase("contra")
M = {k: round(v, 3) for k, v in M.items()}


def legendas(palavras, max_car=26):
    linhas, atual = [], []
    for i, p in enumerate(palavras):
        atual.append(p)
        texto = " ".join(w for w, _, _ in atual)
        prox = palavras[i + 1] if i + 1 < len(palavras) else None
        pausa = prox is None or prox[1] - p[2] > 0.45
        longa = prox is not None and len(texto) + 1 + len(prox[0]) > max_car
        if p[0][-1] in ".,?!:" or longa or pausa:
            linhas.append({"t0": atual[0][1], "t1": p[2], "p": [[w, t0] for w, t0, _ in atual]})
            atual = []
    for a, b in zip(linhas, linhas[1:]):
        a["t1"] = round(min(b["t0"], a["t1"] + 0.8), 3)
    linhas[-1]["t1"] += 0.8
    return linhas


(RAIZ / "motor" / "cenas" / "umbanda-caboclos.tempos.js").write_text(
    "// GERADO por audio/umbanda-caboclos/montar.py — não editar à mão\n"
    f"window.TEMPOS = {json.dumps({'dur': DUR, 'marcas': M, 'legendas': legendas(PAL)}, ensure_ascii=False)};\n")

# ---------------------------------------------------------------- trilha contínua: tensa, com elementos indígenas
mus = np.zeros(N, np.float32)
amb = np.zeros(N, np.float32)
soma(mus, som.drone_tenso(DUR + 1, 41.2), 0, 0.8)
soma(amb, som.vento(DUR), 0, 1.0)

batida = 60 / 76
tt, i = 0.0, 0
while tt < DUR - 0.3:
    fase = "terreiro" if tt < M["pensa"] else "virada" if tt < M["naoda"] else "chamado" if tt < M["logo"] else "fim"
    # maracá contínuo do começo ao fim (a "respiração" indígena da trilha)
    soma(mus, som.maraca(0.55 if i % 4 == 0 else 0.3), tt)
    if fase == "terreiro":
        soma(mus, som.maraca(0.2), tt + batida / 2)
    elif fase == "virada":
        soma(mus, som.batimento(), tt, 0.9)
        if i % 4 == 2:
            soma(mus, som.chocalho(0.5, 0.5), tt + batida / 2)
    elif fase == "chamado":
        soma(mus, som.tambor(0.9, 75, 34, 1.0), tt)
        soma(mus, som.maraca(0.35), tt + batida / 2)
        if i % 2 == 1:
            soma(mus, som.tambor(0.55, 120, 60, 0.5), tt + batida / 2)
    tt += batida
    i += 1

# atabaques: toque de caboclo durante toda a parte da Umbanda (áudios #1 e #2), sumindo antes da virada
toque = som.toque_caboclo(M["pensa"] - 1.0)
fade = np.ones(len(toque), np.float32)
f = int(1.5 * SR)
fade[-f:] = np.linspace(1, 0, f)
soma(mus, toque * fade, 0.0, 1.6)
# volta dos atabaques no chamado final ("Okê, caboclo!")
soma(mus, som.toque_caboclo(M["logo"] - M["oke2"]), M["oke2"] - 0.1, 1.4)

for t0, graus, ritmo in [
    (0.05, [0, 1, 0], [0.9, 0.6, 1.8]),
    (M["reverencia"] - 0.2, [3, 2, 1, 0], [0.8, 0.6, 0.8, 2.2]),
    (M["fim2"] + 0.1, [4, 5, 4], [0.5, 0.5, 1.6]),
    (M["sauda"], [7, 8, 7, 5, 4], [0.6, 0.6, 0.9, 0.6, 1.6]),
    (M["logo"] - 0.3, [4, 5, 4, 1, 0], [0.6, 0.5, 0.7, 0.6, 2.4]),
]:
    soma(mus, som.frase_tensa(graus, ritmo, 0.5), t0)

# silêncio súbito antes de "Agora pensa" (a trilha some e volta com o estrondo)
corte = np.ones(N, np.float32)
c0, c1 = int((M["pensa"] - 0.9) * SR), int((M["pensa"] + 0.02) * SR)
corte[c0:c1] = 0
r = int(0.12 * SR)
corte[c0 - r:c0] = np.linspace(1, 0, r)
mus *= corte
amb *= corte

# ---------------------------------------------------------------- efeitos
sfx = np.zeros(N, np.float32)
impactos = [M["pensa"], M["n258"], M["voz"], M["sauda"], M["demarcacao"], M["logo"]]
for t0 in impactos:
    soma(sfx, som.carimbo_sfx(), t0, 0.9)
    soma(sfx, som.boom(), t0, 0.8)
for t0 in [M["pensa"], M["voz"], M["logo"]]:
    soma(sfx, som.riser(1.2), t0 - 1.2, 0.6)
for t0 in [M["origem"], M["naoda"], M["roupa"]]:
    soma(sfx, som.whoosh(), t0 - 0.35, 0.8)
for nome in ["pitiguaiba", "flechas", "jurema", "tupinamba"]:
    soma(sfx, som.tique(), M[nome], 1.0)
soma(sfx, som.maquina(16, 0.04), M["ano1908"] - 0.3, 0.8)
soma(sfx, som.maquina(14, 0.04), M["elitizado"], 0.7)
for t0 in [M["milhao"] + 0.6, M["povos391"]]:
    for k in range(4):
        soma(sfx, som.tique(), t0 + k * 0.12, 0.8)
soma(sfx, som.sino_grave(), M["logo"] - 0.1, 0.9)
for nome in ["tiro1", "tiro2", "tiro3"]:
    soma(sfx, som.tiro(), M[nome], 1.0)
soma(sfx, som.tiro(2.5), M["tiro4"], 0.7)
soma(sfx, som.urna_eletronica(), M["urna"], 0.9)
soma(sfx, som.negacao(), M["contra"], 0.8)
soma(sfx, som.atabaque(150, 1.0), M["roupa"] + 0.3, 1.0)           # golpe seco de atabaque em "roupa branca?"
soma(sfx, som.atabaque(150, 1.0), M["oke1"], 1.0)

# ---------------------------------------------------------------- mixagem: a voz manda (regra da identidade)
e = som.envelope_voz(voz)
fala = e > 0.3
rms = lambda x: float(np.sqrt(np.mean(x[fala] ** 2))) or 1e-9
REF = 0.2
voz_mix = voz * (REF / rms(voz))
leito = (mus + amb) * (1 - 0.7 * e)
leito *= REF * 10 ** (-18 / 20) / rms(leito)
efeitos = sfx * (1 - 0.75 * e)
efeitos *= REF * 10 ** (-20 / 20) / max(rms(efeitos), 1e-9)
efeitos = np.clip(efeitos, -0.6, 0.6)


def limitar(x, teto=0.7):
    a = np.abs(x)
    return np.where(a > teto, np.sign(x) * (teto + 0.28 * np.tanh((a - teto) / 0.28)), x).astype(np.float32)


esq = limitar(voz_mix + leito * 1.05 + amb * 0.05 + efeitos)
dir = limitar(voz_mix + leito * 0.95 - amb * 0.05 + efeitos)
som.salvar_wav(str(AQUI / "mix.wav"), esq, dir)
print(f"{DUR:.2f}s · fala: " + " · ".join(f"#{k} {INICIO[k]:.1f}-{FIM[k]:.1f}" for k in INICIO))
print(json.dumps(M))
