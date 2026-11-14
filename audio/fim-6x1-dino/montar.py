"""Fim da 6x1 (talking head do Léo + abertura com o Rick Azevedo): cortes, voz, trilha, efeitos e marcas.
Gera: audio/fim-6x1-dino/edl.json (trechos do vídeo bruto → linha do tempo), mix.wav e motor/cenas/fim-6x1-dino.tempos.js.
Depois: bash audio/fim-6x1-dino/juntar.sh
Abertura (0–ABERT s): tela dividida, Rick em cima ("Isso é nojento. Isso não existe. Que decisão é essa, Flávio Dino?"), print do Léo embaixo.
Depois: o Léo falando, com os erros e as pausas cortados (corte seco a cada pausa, alternando zoom 1,0/1,12 → ritmo de jump cut).
"""
import json, subprocess, sys
from pathlib import Path
import numpy as np

AQUI = Path(__file__).resolve().parent
RAIZ = AQUI.parent.parent
sys.path.insert(0, str(RAIZ / "motor"))
import som  # noqa: E402
from som import SR, soma  # noqa: E402

VEL = 1.05                      # o Léo um pouco mais rápido (ritmo de Reels, sem soar acelerado)
RICK = (200.95, 6.25 + 200.0)   # trecho do Rick (s no vídeo dele)
ABERT = RICK[1] - RICK[0]
PAUSA = 0.28                    # pausa maior que isso dentro de um trecho vira corte seco
# trechos escolhidos (tempo de início da 1ª e da última palavra, no vídeo bruto do Léo). Fora ficam: a saudação, "comerciários",
# "antes", "que tratam-se de funcionários...", "pelo fim das classes por um", "dois dias de descansar", "debaixo de nossa nariz",
# as pausas longas e as repetições do "manda pra todo mundo".
# v5 (pedido do autor: "não corte minhas falas"; pode passar de 45 s): a fala corre INTEIRA, só saem os erros de verdade.
# (início, fim) aproximados no bruto; cada borda é ajustada ao vale de energia mais próximo (±0,12 s).
SEGMENTOS = [
    (5.02, 15.80),   # "Eu gostaria de estar aparecendo aqui ... não tem um momento de paz. E agora, o Flávio Dino acatou"
                     #  ("Dino" e "acatou" saem colados: o corte fica DEPOIS do 1º "acatou", que emenda no "a pressão dos empresários")
                     #  [sai: "a pressão dos comerciários, acatou" — ele se corrige logo depois]
    (17.60, 30.40),  # "acatou a pressão dos empresários, especialmente ... regras da 6x1, deixando em aberto"
                     #  [sai: a 1ª tentativa de "para decisões" — ele repete]
    (31.72, 41.94),  # "para decisões coletivas. E agora com essas brechas ... Isso é um escárnio com toda a luta"
                     #  [sai: "pelo fim das classes por um"]
    (43.79, 54.72),  # "do Rick Azevedo, da Erika Hilton ... dois dias de descansar, no mínimo. Então isso não pode acontecer,"
                     #  [sai: a 1ª tentativa de "mas é o que está acontecendo debaixo de nossa..." — ele repete certo]
    (57.30, 59.86),  # "mas é o que está acontecendo debaixo do nosso nariz."
                     #  [sai: a 1ª tentativa de "é por isso que nós não podemos desmobilizar" (59,9–62,3)]
    (63.72, 73.75),  # "É por isso ... radicalizar urgente. Então compartilhe esse vídeo, curte, comenta, manda ... que precisa saber,"
                     #  [sai: a repetição "manda pra todo mundo que você puder,"]
    (76.32, 83.10),  # "pra que todo mundo saiba o que tá acontecendo, da covardia, da picaretagem que tá acontecendo debaixo do nosso nariz."
]
CORRECOES = {"Ricky": "Rick", "Azevedo": "Azevedo,", "acontecendo": "acontecendo", "nariz.": "nariz!"}

pal = json.loads((AQUI / "palavras.json").read_text())["1"]
idx = lambda t: min(range(len(pal)), key=lambda i: abs(pal[i][1] - t))
# energia da voz limpa (10 ms) para achar os silêncios dentro de cada trecho
def ler(f, ss=None, t=None, af=None):
    cmd = ["ffmpeg", "-loglevel", "error"] + (["-ss", str(ss)] if ss is not None else []) + (["-t", str(t)] if t else []) + ["-i", str(f)]
    cmd += (["-af", af] if af else []) + ["-ac", "1", "-ar", str(SR), "-f", "f32le", "-"]
    return np.frombuffer(subprocess.run(cmd, capture_output=True, check=True).stdout, np.float32).copy()
# cadeia de locução (sobre a voz já sem ruído): tira o grave embolado e a "caixa" do quarto, dá corpo, presença e ar,
# suaviza os "s", segura a dinâmica (voz sempre na frente) e limita os picos
VOZ_PRO = ("highpass=f=85:poles=2,equalizer=f=140:t=q:w=1:g=1.5,equalizer=f=320:t=q:w=1.4:g=-3,equalizer=f=700:t=q:w=1.5:g=-1.5,"
           "equalizer=f=3500:t=q:w=1.2:g=2.5,equalizer=f=10000:t=h:w=0.7:g=2,deesser=i=0.45:m=0.5:f=0.5,"
           "acompressor=threshold=-22dB:ratio=3.5:attack=6:release=90:makeup=3,"
           "agate=threshold=0.015:ratio=2:range=0.25:attack=4:release=150,alimiter=limit=0.9,loudnorm=I=-16:TP=-1.5:LRA=6")
limpa = ler(AQUI / "voz-deteccao.flac")                    # só para achar pausas e vales (mesmos tempos da v2)
voz_pro = ler(AQUI / "voz-tratada.flac")                   # v3: redução de ruído leve, sem som metalizado (tratar_voz.py)
q = int(0.01 * SR)
en = np.array([np.sqrt(np.mean(limpa[i:i + q] ** 2)) for i in range(0, len(limpa) - q, q)])
LIMIAR = np.percentile(en, 95) * 10 ** (-30 / 20)
SIL_MIN, SIL_RESTO = 0.90, 0.40          # v2 (fluido): só pausa MUITO longa (> 0,7 s) é encurtada, e fica 0,35 s de respiro natural

def sem_silencios(ini, fim):
    """Divide [ini, fim) nos silêncios internos longos; devolve os pedaços com fala."""
    a, b = int(ini * 100), int(fim * 100)
    voz_ = en[a:b] > LIMIAR
    out, i0, i = [], a, a
    while i < b:
        if not voz_[i - a]:
            j = i
            while j < b and not voz_[j - a]: j += 1
            if (j - i) * 0.01 > SIL_MIN and i > i0:
                out.append((i0 * 0.01, (i + int(SIL_RESTO * 50)) * 0.01)); i0 = j - int(SIL_RESTO * 50)
            i = j
        else:
            i += 1
    out.append((i0 * 0.01, fim))
    return [(x, y) for x, y in out if y - x > 0.12]

def vale(a, b):
    """Instante de menor energia (janela de 30 ms) entre a e b: o silêncio entre duas palavras."""
    i, j = int(a * 100), int(b * 100)
    sua = np.convolve(en, np.ones(3) / 3, 'same')
    return (i + int(np.argmin(sua[i:j]))) * 0.01

def fim_da_fala(ws, maximo=1.4):
    """Da palavra que começa em ws, anda até a voz parar de verdade (0,15 s seguidos de silêncio) e corta ali."""
    i = int(ws * 100) + 15
    while i < int((ws + maximo) * 100) and not np.all(en[i:i + 25] < LIMIAR * 0.6): i += 1
    return i * 0.01 + 0.08

def borda_silencio(tt, direcao, maximo=0.30):
    """Leva o ponto de corte até o silêncio mais próximo (para trás no início, para frente no fim), sem passar de `maximo` s."""
    i = int(tt * 100)
    for d in range(int(maximo * 100)):
        j = i + d * direcao
        if 0 <= j < len(en) and en[j] < LIMIAR * 0.7:
            return j * 0.01 + (0.03 if direcao < 0 else 0.0) * 0 + (-0.02 if direcao < 0 else 0.04)
    return tt

edl, t, PAL = [], ABERT, []
k = 0
for n_trecho, (a0, b0) in enumerate(SEGMENTOS):
    ini = vale(a0 - 0.04, a0 + 0.04)                                  # bordas já conferidas à mão no vale de energia
    fim = fim_da_fala(b0 - 0.6) if n_trecho == len(SEGMENTOS) - 1 else vale(b0 - 0.04, b0 + 0.04)
    pedacos = sem_silencios(ini, fim)
    t_ped = []
    for x, y in pedacos:
        dur = (y - x) / VEL
        edl.append({"ini": round(x, 3), "fim": round(y, 3), "t": round(t, 3), "dur": round(dur, 3), "zoom": 1.0 if n_trecho % 2 == 0 else 1.12})
        t_ped.append((x, y, t)); t += dur; k += 1
    for w, wa, wb in pal:
        if not (ini - 0.15 <= wa < fim): continue
        if w in ("por", "um,") and 28 < wa < 30: continue          # "6 por 1" vira "6x1"
        x, y, tt = next(((x, y, tt) for x, y, tt in t_ped if wa < y), t_ped[-1])
        w = "6x1," if w == "SES" else CORRECOES.get(w, w)
        if w.startswith("-") and PAL:                              # "tratam -se" → "tratam-se"
            PAL[-1][0] += w; continue
        PAL.append([w, round(tt + max(0, wa - x) / VEL, 3), round(tt + (min(wb, y) - x) / VEL, 3)])
DUR_LEO = t
FIM_CTA = 0.5                    # o card final ("manda pra quem trabalha 6x1") segura um pouco depois da última palavra
DUR = round(t + FIM_CTA, 2)

# palavras do Rick na abertura
pr = json.loads((AQUI / "palavras-rick.json").read_text())["1"]
PAL_RICK = [[w, round(a - RICK[0], 3), round(b - RICK[0], 3)] for w, a, b in pr if RICK[0] <= a < RICK[1]]

def legendas(palavras, max_car=24):
    linhas, atual = [], []
    for i, p in enumerate(palavras):
        atual.append(p)
        texto = " ".join(w for w, _, _ in atual)
        prox = palavras[i + 1] if i + 1 < len(palavras) else None
        cabe = len(texto) + 1 + len(prox[0]) if prox else 0
        if p[0][-1] in ".,?!" or (prox and cabe > max_car) or prox is None or (prox and prox[1] - p[1] > 0.9):
            linhas.append({"t0": atual[0][1], "t1": (prox[1] if prox else p[1] + 0.8), "p": [[w, t0] for w, t0, _ in atual]})
            atual = []
    return linhas

def quando(texto, depois=0.0):
    alvo = texto.lower().split()
    ws = [w.lower().strip(".,?!") for w, _, _ in PAL]
    for i in range(len(ws)):
        if ws[i:i + len(alvo)] == alvo and PAL[i][1] >= depois:
            return PAL[i][1]
    raise KeyError(texto)

M = {"abert": ABERT, "empresarios": quando("acatou a pressão"), "regras": quando("para alterar"), "coletivas": quando("decisões coletivas"),
     "brechas": quando("e agora com essas"), "folgas": quando("duas folgas"), "escarnio": quando("escárnio"), "rick": quando("da erika"),
     "classe": quando("mas principalmente"), "desmob": quando("desmobilizar"), "radical": quando("radicalizar"), "cta": quando("então compartilhe"),
     "picaretagem": quando("picaretagem"), "fimfala": DUR_LEO, "dur": DUR}
M = {k: round(v, 3) for k, v in M.items()}
(AQUI / "edl.json").write_text(json.dumps({"abert": ABERT, "rick": RICK, "vel": VEL, "dur": DUR, "rabo": FIM_CTA, "cortes": edl}, indent=1))
(RAIZ / "motor" / "cenas" / "fim-6x1-dino.tempos.js").write_text(
    "// GERADO por audio/fim-6x1-dino/montar.py — não editar à mão\n"
    f"window.TEMPOS = {json.dumps({'dur': DUR, 'marcas': M, 'cortes': [c['t'] for c in edl], 'legendas': legendas(PAL_RICK) + legendas(PAL)}, ensure_ascii=False)};\n")

# ---------------------------------------------------------------- áudio
N = int(DUR * SR)
voz = np.zeros(N + SR, np.float32)
rick = ler(RAIZ / "midia/fim-6x1-dino/rick-azevedo.mp4", RICK[0], ABERT, "highpass=f=90,equalizer=f=320:t=q:w=1.4:g=-2,equalizer=f=3500:t=q:w=1.2:g=2,acompressor=threshold=-22dB:ratio=3:makeup=2,loudnorm=I=-16:TP=-1.5:LRA=6")
f = int(0.01 * SR); rick[:f] *= np.linspace(0, 1, f); rick[-f * 3:] *= np.linspace(1, 0, f * 3)
soma(voz, rick, 0)
for c in edl:
    p = limpa[int(c["ini"] * SR):int(c["fim"] * SR)]
    p = ler_tempo = None
    raw = subprocess.run(["ffmpeg", "-loglevel", "error", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "-", "-af", f"atempo={VEL}", "-f", "f32le", "-"],
                         input=voz_pro[int(c["ini"] * SR):int(c["fim"] * SR)].tobytes(), capture_output=True, check=True).stdout
    p = np.frombuffer(raw, np.float32).copy()
    g = min(int(0.006 * SR), len(p) // 2); p[:g] *= np.linspace(0, 1, g); p[-g:] *= np.linspace(1, 0, g)
    soma(voz, p, c["t"])
voz = voz[:N]

# trilha: banda tensa e abafada embaixo da voz; golpes nos carimbos
E, G, A, C, D = 82.41, 98.0, 110.0, 65.41, 73.42
st = {k: np.zeros(N + SR * 4, np.float32) for k in ("bat", "baixo", "gE", "gD", "solo", "sinte")}
som.banda_golpe(st, 0.0, E, 1.0, anel=0.6)
soma(st["sinte"], som.sinte([82.41, 87.31, 123.5], ABERT, 0.3, brilho=700, ataque=0.2), 0)
som.banda_secao(st, ABERT, M["escarnio"] - ABERT, 112, ((E, 8), (C, 4), (D, 4)), "palm", 0.55, virar=True, seed=61)
som.banda_secao(st, M["escarnio"], M["cta"] - M["escarnio"], 120, ((E, 8), (G, 4), (A, 4)), "tensao", 0.62, virar=True, seed=62)
som.banda_secao(st, M["cta"], DUR - M["cta"], 128, ((E, 8), (C, 8), (G, 8), (D, 8)), "aberto", 0.75, seed=63)
for k in ("escarnio", "radical", "cta"):
    som.banda_golpe(st, M[k], E, 1.0, anel=0.7)
som.banda_golpe(st, DUR - 1.2, E, 1.0, anel=1.2)
fx = np.zeros(N + SR * 4, np.float32)
soma(fx, som.carimbo_sfx(), 0.05, 0.8); soma(fx, som.boom(), 0.05, 0.5)
soma(fx, som.whoosh(), ABERT - 0.3, 0.8)
soma(fx, som.buzina_palhaco(), 1.7, 1.0)                    # o Dino vira palhaço (fotinha no canto)
for k in ("empresarios", "regras", "coletivas", "rick"):
    soma(fx, som.tique(), M[k] + 0.2, 0.8); soma(fx, som.papel(0.3), M[k] + 0.2, 0.5)
soma(fx, som.whoosh(0.5), M["folgas"] + 0.4, 0.6); soma(fx, som.carimbo_sfx(), M["folgas"] + 1.4, 0.8)
for k in ("escarnio", "radical"):
    soma(fx, som.carimbo_sfx(), M[k], 1.0); soma(fx, som.boom(), M[k], 0.45)
soma(fx, som.riser(0.8), M["cta"] - 0.8, 0.4); soma(fx, som.carimbo_sfx(), M["cta"], 0.9)
soma(fx, som.carimbo_sfx(), DUR - 1.2, 0.9)

esq = np.zeros(N, np.float32); dir_ = np.zeros(N, np.float32); rev = np.zeros(N, np.float32)
ganhos = dict(bat=0.85, baixo=0.6, gE=0.42, gD=0.42, solo=0.5, sinte=0.45)
panos = dict(bat=0.0, baixo=0.0, gE=-0.75, gD=0.75, solo=0.2, sinte=0.0)
for k, x in st.items():
    x = som.fpa(x[:N], 50 if k != "baixo" else 38, 3) * ganhos[k]
    l, r = som.pan(x, panos[k]); esq += l; dir_ += r; rev += x * 0.15
rl, rr = som.reverb(rev, 1.6); esq += rl * 0.5; dir_ += rr * 0.5
esq, dir_ = som.comprimir(esq, 0.3, 2.5), som.comprimir(dir_, 0.3, 2.5)
fx = fx[:N]

e = som.envelope_voz(voz); fala = e > 0.3
rms = lambda x: float(np.sqrt(np.mean(x[fala] ** 2))) or 1e-9
REF = 0.16
voz_mix = voz * (REF / rms(voz))
g_mus = 1.10 * REF * 10 ** (-22 / 20) / rms((esq + dir_) / 2 * (1 - 0.7 * e))
g_fx = REF * 10 ** (-20 / 20) / max(rms(fx * (1 - 0.75 * e)), 1e-9)
le, ld = esq * (1 - 0.7 * e) * g_mus, dir_ * (1 - 0.7 * e) * g_mus
ef = np.clip(fx * (1 - 0.75 * e) * g_fx, -0.6, 0.6)
lim = lambda x: np.where(np.abs(x) > 0.7, np.sign(x) * (0.7 + 0.28 * np.tanh((np.abs(x) - 0.7) / 0.28)), x).astype(np.float32)
som.salvar_wav(str(AQUI / "mix.wav"), lim(voz_mix + le + ef), lim(voz_mix + ld + ef))
print(f"{DUR:.2f}s (abertura {ABERT:.2f}s + Léo {DUR_LEO - ABERT:.2f}s + CTA) · {len(edl)} cortes")
print(json.dumps(M))
