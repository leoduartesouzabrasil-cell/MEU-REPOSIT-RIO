"""Trilha (instrumentos reais amostrados, via lemo-opuscar sampler), efeitos (foley procedural) e voz → out/mix.wav.
Rock com banda completa (bateria MuldjordKit, baixo, guitarra distorcida) + camada cinematográfica (cordas, metais, tímpanos, gongo).
Lê events.json (exportado pela página: DUR + EV) e audio/palavras.json (marcas faladas). Uso: $LIB/.venv/bin/python mix.py"""
import json, os, sys
import numpy as np, soundfile as sf
from pathlib import Path
from scipy.signal import butter, sosfilt
AQUI = Path(__file__).resolve().parent; LIB = os.environ.get("LIB", "/root/lemo-opuscar"); sys.path.insert(0, LIB)
from core.audio import sampler as S          # noqa: E402
from core.audio import sfx as X              # noqa: E402
from core.audio.sfx import SR, add            # noqa: E402
S.seed(58); rng = np.random.default_rng(58)

evj = json.loads((AQUI / "events.json").read_text()); DUR = evj["dur"]; EV = evj["ev"]
P = json.loads((AQUI / "audio/palavras.json").read_text())["palavras"]
limpa = lambda w: w.lower().strip(".,?!:")
def q(txt, depois=0.0):
    for k in range(len(P)):
        if P[k][1] >= depois and (" ".join(limpa(p[0]) for p in P[k:k + 7]) + " ").startswith(txt + " "): return P[k][1]
    raise KeyError(txt)
M = dict(escr=q("escravidão"), fim=q("o fim da"), garant=q("garantido"), dia=q("dia 16"), duas=q("duas folgas por"), so=q("só que"),
         stf=q("stf abriram"), brecha=q("brecha"), acordo=q("com um acordo"), semana2=q("semana", 19.5), mes=q("mês"), lutou=q("a gente lutou"),
         agora=q("e agora o"), empurrar=q("empurrar"), ouseja=q("ou seja"), deixar=q("deixar"), ate=q("até a câmara"), camara=q("câmara"),
         senado=q("senado"), derrubar=q("derrubar"), julg=q("e o julgamento"), plen=q("ao plenário"), comp=q("compartilhe"),
         folga=q("folga toda"), toda=q("toda semana"), semana3=q("semana e não"), quiser=q("quiser"))
EVT = {}
for e in EV: EVT.setdefault(e["type"], []).append(e["t"])
M["quebra"] = EVT["quebra"][0]; M["logo"] = EVT["logo"][0]
N = int((DUR + 0.5) * SR)
B = 0.5                                        # 120 BPM: batida 0,5 s

# ------------------------------------------------------------------ partitura
ev_orq, ev_gtr, ev_bat = [], [], []
def o(t, inst, p, d, v, pan=0.0, g=1.0): ev_orq.append((t, inst, p, d, v, pan, g))
def bat(t, var, v, pan=0.0, g=1.0): ev_bat.append((t, "drum_kit", var, None, v, pan, g))
NOTA = {"D": 0, "Eb": 1, "E": 2, "F": 3, "G": 5, "A": 7, "Bb": 8, "C": 10}
def nm(root, oct_):  # nome → nota
    return f"{root}{oct_}"
PROG = [("D", "D2", ["D3", "A3", "D4"]), ("Bb", "Bb1", ["Bb2", "F3", "Bb3"]), ("F", "F2", ["F3", "C4", "F4"]), ("C", "C2", ["C3", "G3", "C4"])]

def ritmo(t0, t1, estilo, vel=0.8, prog=PROG, guitarra=True, baixo=True, preenche=True):
    """banda de rock no grid de 120 BPM, compasso de 4 batidas; cada acorde = 1 compasso"""
    nb = int((t1 - t0) / B)
    for b in range(nb):
        t = t0 + b * B; bar, beat = divmod(b, 4); ch = prog[bar % len(prog)]
        fim_sec = b >= nb - 2 and preenche and nb >= 8
        if estilo == "rock":
            if beat in (0, 2): bat(t, "kick_drum_left", vel)
            if beat == 2: bat(t + B * 0.5, "kick_drum_right", vel * 0.7)
            if beat in (1, 3) and not fim_sec: bat(t, "snare_1", vel * 0.95)
            for h in (0, 0.5): bat(t + h * B, "hi_hat_closed", vel * (0.55 if h else 0.7), 0.3)
        elif estilo == "acelerado":
            bat(t, "kick_drum_left", vel); bat(t + B / 2, "kick_drum_right", vel * 0.6)
            if beat in (1, 3) and not fim_sec: bat(t, "snare_1", vel)
            for h in (0, .25, .5, .75): bat(t + h * B, "hi_hat_closed", vel * (0.6 if h == 0 else 0.4), 0.3)
        elif estilo == "meio":
            if beat == 0: bat(t, "kick_drum_left", vel)
            if beat == 2: bat(t, "snare_2", vel)
            bat(t, "ride_left", vel * 0.45, -0.3)
        elif estilo == "maquina":
            bat(t, "kick_drum_left", vel * 0.9)
            for h in (0, .25, .5, .75): bat(t + h * B, "snare_rest_1" if h else "snare_1", vel * (0.35 if h else 0.6), 0.1)
        elif estilo == "marcha":
            if beat in (0, 2): bat(t, "kick_drum_left", vel)
            o(t, "snare2", "roll" if beat == 3 else "on", B * 0.9 if beat == 3 else None, vel * 0.6, 0.15)
            if beat != 3: o(t + B * 0.5, "snare2", "on", None, vel * 0.4, 0.15); o(t + B * 0.75, "snare2", "on", None, vel * 0.35, 0.15)
        if beat == 0 and bar > 0: pass
        if fim_sec and b == nb - 2:                                        # virada nos toms
            for k, tom in enumerate(["tom_1", "tom_1", "tom_2", "tom_2", "tom_3", "tom_3", "tom_4", "tom_4"]): bat(t + k * B / 4, tom, vel * (0.7 + k * 0.03), -0.4 + k * 0.1)
        # baixo: colcheias na fundamental
        if baixo:
            for h in (0, 0.5):
                ev_orq.append((t + h * B, "electric_bass", ch[1], B * 0.45, vel * 0.85, 0.0, 1.0))
        if guitarra:
            if estilo in ("rock", "acelerado"):
                if beat == 0: [ev_gtr.append((t, "electric_guitar", n, B * 3.8, 0.85, -0.6)) for n in ch[2]]; [ev_gtr.append((t + 0.012, "electric_guitar", n, B * 3.8, 0.8, 0.6)) for n in ch[2]]
            elif estilo in ("meio", "maquina"):           # palm mute em colcheias
                for h in (0, 0.5): [ev_gtr.append((t + h * B, "electric_guitar", n, 0.12, 0.7, -0.5 if h else 0.5)) for n in ch[2][:2]]

def ostinato(t0, t1, inst="cellos_spic", raiz="D", oit=3, vel=0.6, pan=-0.2):
    seq = [0, 0, 3, 0, 7, 0, 2, 3]                 # D D F D A D E F
    base = 12 * (oit + 1) + {"D": 2, "Bb": -2, "F": 5, "C": 0}[raiz]
    k = 0; t = t0
    while t < t1 - 0.05: o(t, inst, base + seq[k % 8], 0.22, vel * (1.0 if k % 2 == 0 else 0.8), pan); t += B / 2; k += 1

def rufo_timp(t0, t1, v0=0.3, v1=0.9, nota="D3"):
    t = t0
    while t < t1: o(t, "timpani", nota, 0.2, v0 + (v1 - v0) * (t - t0) / max(1e-3, t1 - t0), 0.1); t += 1 / 16

def stab(t, v=0.9, acorde=("D3", "F3", "A3"), grave=("D2", "A2")):
    for n in acorde: o(t, "horn_stac", n, 0.3, v, -0.25); o(t, "trumpet_stac", S.midi(n) + 12, 0.25, v * 0.7, 0.25)
    for n in grave: o(t, "trombone_stac", n, 0.3, v, 0.1)
    o(t, "timpani", "D3", 0.4, v * 0.8)

def golpe(t, v=1.0, gongo=False):
    o(t, "gran_cassa", "hit", None, v, 0); o(t, "timpani", "D3", 0.8, v); o(t, "crash", None, None, v * 0.8, 0.2)
    if gongo: o(t, "gong", None, None, v * 0.9, 0)

Q = M["quebra"]
# GANCHO: drone grave + ostinato entrando + tímpano em crescendo até a quebra
o(0.05, "contrabass", "D2", Q - 0.05, 0.55, 0, 0.9); o(0.05, "cellos", "D3", Q - 0.05, 0.4, -0.3, 0.7)
ostinato(0.9, Q - 0.1, vel=0.55)
stab(0.02, 0.8, ("D3", "F3", "A3"), ("D2",)); stab(q("os empresários"), 0.7, ("D3", "F3"), ("D2",)); golpe(q("briga"), 0.6)
for k in range(int((Q - M["escr"] + 2.0) / B)): o(M["escr"] - 2.0 + k * B, "bass_drum", None, None, 0.5, 0)
rufo_timp(M["escr"] - 1.0, Q - 0.02, 0.25, 0.95)
o(M["escr"], "trombone", "D2", Q - M["escr"], 0.7, 0, 0.8); o(M["escr"], "horn", "A2", Q - M["escr"], 0.6, -0.2, 0.7)
# QUEBRA: o golpe mais pesado, depois silêncio
golpe(Q, 1.0, gongo=True); o(Q, "trombone_stac", "D2", 0.4, 1.0); o(Q, "tuba_stac", "D2", 0.4, 1.0)
# CONQUISTA: a banda entra no tempo
c0, c1 = M["fim"] - 0.1, M["so"] - 0.06
bat(c0, "crash_left", 0.9, -0.3); bat(c0, "kick_drum_left", 1.0)
ritmo(c0, c1, "rock", 0.8)
ostinato(c0, c1, vel=0.45)
for k in ("garant", "dia", "duas"): stab(M[k], 0.85)
o(c0, "violins", "A4", c1 - c0, 0.35, 0.4, 0.5); o(c0 + 4 * B * 2, "violins", "C5", c1 - c0 - 4, 0.35, 0.4, 0.5)
# BRECHA: a banda some; cordas em trêmulo, pulso de gran cassa, gongo na rachadura
b0, b1 = c1, M["acordo"] - 0.12
o(b0, "violins_trem", "D5", b1 - b0 + 0.6, 0.4, 0.4, 0.7); o(b0, "violins_trem", "Eb5", b1 - b0 + 0.6, 0.35, -0.4, 0.6)
o(b0, "cellos", "D2", b1 - b0 + 0.6, 0.5, -0.2, 0.8); o(b0, "contrabass", "D2", b1 - b0 + 0.6, 0.5, 0, 0.8)
for k in range(int((M["brecha"] - b0) / B)): o(b0 + k * B, "gran_cassa", "hit", None, 0.35 + k * 0.05, 0)
golpe(M["brecha"], 1.0, gongo=True); o(M["brecha"], "trombone_stac", "Eb2", 0.4, 0.9); o(M["brecha"], "tuba_stac", "D2", 0.4, 0.9)
o(M["stf"], "timpani", "A2", 0.4, 0.6)
# CALENDÁRIO: tensão rítmica; quedas com tímpano e metais graves
k0, k1 = b1, M["lutou"] - 0.15
ostinato(k0 + 0.3, k1, vel=0.55); ostinato(k0 + 0.3, k1, "violas_pizz", oit=4, vel=0.35, pan=0.4)
for k in range(int((k1 - k0 - 0.3) / B)):
    t = k0 + 0.3 + k * B; bat(t, "kick_drum_left", 0.55 if k % 2 == 0 else 0.35); o(t + B / 2, "snare2", "taps", None, 0.25, 0.2)
o(k0, "violins_trem", "A4", k1 - k0, 0.3, 0.4, 0.5)
for k in ("semana2", "mes"): o(M[k], "timpani", "D3", 0.6, 0.85); o(M[k], "trombone", "D2", 1.2, 0.7, 0, 0.8); o(M[k] + 0.3, "trombone", "C#2", 0.8, 0.5, 0, 0.7)
# LUTA: banda acelerada, metais
l0, l1 = k1, M["agora"] - 0.06
bat(l0, "crash_right", 0.9, 0.3); ritmo(l0, l1, "acelerado", 0.85, preenche=False); stab(l0, 0.9)
o(l0, "horn", "D4", l1 - l0, 0.55, -0.3, 0.7); o(l0 + 1.5, "horn", "F4", l1 - l0 - 1.5, 0.55, -0.3, 0.7)
# EMPURRA: pesado, meio-tempo; tuba nos tempos; arrasto
e0, e1 = l1, M["ouseja"] - 0.10
ritmo(e0, e1, "meio", 0.85, prog=[PROG[0], PROG[0], PROG[1], PROG[0]])
for k in range(int((e1 - e0) / B)): o(e0 + k * B, "tuba_stac", "D2" if (k // 4) % 2 == 0 else "Bb1", 0.3, 0.6, 0)
stab(M["empurrar"], 0.9, ("D3", "Eb3", "A3")); o(M["empurrar"], "gran_cassa", "hit", None, 0.7, 0)
o(EVT["carimbo"][4] if len(EVT["carimbo"]) > 4 else e1 - 1, "crash", None, None, 0.5, -0.3)
# OU SEJA: máquina — fagote + cellos em spiccato, caixa em semicolcheia, bloco de madeira
m0, m1 = e1, M["ate"] - 0.12
ritmo(m0, m1, "maquina", 0.75, prog=[PROG[0]])
ostinato(m0, m1, "bassoon_stac", oit=2, vel=0.6, pan=0.3); ostinato(m0, m1, vel=0.5)
for k in range(int((m1 - m0) / B)): o(m0 + k * B + B / 2, "woodblock", "a", None, 0.4, 0.5)
stab(M["deixar"] + 0.05, 0.8, ("D3", "F3", "Ab3"))
# CÂMARA: marcha, trompas, carimbo de metais no "derrubar"
r0, r1 = m1, M["comp"] - 0.12
ritmo(r0, r1, "marcha", 0.75, prog=[PROG[1], PROG[2], PROG[3], PROG[0]], guitarra=False)
o(r0, "horn", "Bb3", 2.0, 0.55, -0.3, 0.8); o(r0, "horn", "F4", 2.0, 0.5, 0.3, 0.7); o(r0 + 2, "horn", "C4", 2.0, 0.55, -0.3, 0.8); o(r0 + 2, "horn", "A4", 2.0, 0.5, 0.3, 0.7)
for k in ("camara", "senado"): o(M[k], "trumpet_stac", "D5", 0.25, 0.75, 0.2); o(M[k], "trumpet_stac", "A4", 0.25, 0.7, -0.2)
golpe(M["derrubar"], 0.95); stab(M["derrubar"], 1.0)
rufo_timp(M["julg"] - 0.6, M["julg"] - 0.05, 0.3, 0.8); stab(M["plen"] + 0.1, 0.85)
# CHAMADO: tutti + motivo dos metais + cordas
h0, h1 = r1, M["logo"]
bat(h0, "crash_left", 1.0, -0.3); ritmo(h0, h1 - 0.2, "rock", 0.95, preenche=False)
ostinato(h0, h1 - 0.2, vel=0.5)
for t, n in [(0, "A4"), (0.25, "A4"), (0.5, "D5"), (1.0, "C5"), (1.5, "A4"), (2.0, "F4"), (2.5, "G4"), (3.0, "A4")]:
    o(h0 + 0.5 + t, "trumpet_stac", n, 0.3, 0.8, 0.2); o(h0 + 0.5 + t, "horn_stac", n.replace("5", "4") if n.endswith("5") else n.replace("4", "3"), 0.3, 0.7, -0.2)
o(h0, "violins", "D5", h1 - h0, 0.4, 0.4, 0.6); o(h0, "violas", "A4", h1 - h0, 0.4, -0.4, 0.6); o(h0, "cellos", "D3", h1 - h0, 0.45, -0.2, 0.7)
for k in ("folga", "toda", "semana3"): stab(M[k], 0.95); bat(M[k], "crash_right", 0.7, 0.3)
golpe(M["quiser"], 1.0, gongo=True)
# LOGO: acorde final em ré maior
for n, inst, p in [("D3", "horn", -0.3), ("F#3", "horn", 0.3), ("A3", "trombone", 0), ("D4", "trumpet", 0.2), ("D2", "tuba", 0), ("D5", "violins", 0.4), ("A4", "violas", -0.4), ("D3", "cellos", -0.2)]:
    o(M["logo"], inst, n, DUR - M["logo"] - 0.3, 0.6, p, 0.8)
golpe(M["logo"], 0.9, gongo=True)

print("partitura:", len(ev_orq), "orq ·", len(ev_gtr), "guitarra ·", len(ev_bat), "bateria")
orq = S.render(ev_orq, dur=DUR + 0.5, master=False)[:N]
bateria = S.render(ev_bat, dur=DUR + 0.5, master=False)[:N]
gtr = S.render(ev_gtr, dur=DUR + 0.5, master=False)[:N]
def filt(x, kind, f, o_=2): return sosfilt(butter(o_, f, kind, fs=SR, output="sos"), x, axis=0)
# guitarra: ganho alto + tanh (distorção) + "caixa" (passa-faixa) → power chord de rock
g = np.tanh(filt(gtr, "high", 120) * 9.0); g = filt(filt(g, "low", 4800, 4), "high", 90); g = filt(g, "band", [100, 5200]) * 0.6
bateria = filt(bateria, "high", 35)
musica = orq * 1.0 + bateria * 0.9 + g * 0.42
musica = filt(musica, "high", 30)
musica = S.room(musica.astype(np.float32), size=0.45, mix=0.16)
musica = np.stack([X.compress(musica[:, c], thr=0.12, ratio=3.0, att=0.01, rel=0.15) for c in range(2)], 1).astype(np.float32)   # cola da banda

# ------------------------------------------------------------------ efeitos (foley) nos quadros da página
fx = np.zeros((N, 2), np.float32)
def nz(d): return rng.standard_normal(int(d * SR))
def env(d, a=0.005, tau=0.1): t = np.arange(int(d * SR)) / SR; return np.minimum(1, t / a) * np.exp(-t / tau)
def metal(f=900, d=0.6):
    t = np.arange(int(d * SR)) / SR; return X.norm(sum(np.sin(2 * np.pi * f * k * t + k) * np.exp(-t / (0.25 / k)) / k for k in (1, 2.76, 5.4, 8.93)))
def carimbo(v=1): return X.norm(X.thump(1, 62)[:int(0.35 * SR)] + np.pad(X.clack(0.8), (0, int(0.35 * SR) - len(X.clack(0.8)))) * 0.7) * v
def rachadura(v=1):
    d = 1.0; out = np.zeros(int(d * SR))
    for k in range(9):
        s = int((k / 9) ** 1.6 * 0.35 * SR); c = X.clack(0.5 + rng.random() * 0.5, 0.5 + rng.random() * 0.5); out[s:s + len(c)] += c[:len(out) - s]
    out += X.lp(X.brown(d), 180) * env(d, 0.002, 0.35) * 1.2
    out[:int(0.25 * SR)] += X.hp(nz(0.25), 2500) * env(0.25, 0.001, 0.04) * 0.8
    return X.norm(out) * v
def corrente(d=1.2):
    out = np.zeros(int(d * SR))
    for k in range(int(d * 14)):
        s = int(k / 14 * SR + rng.random() * 0.02 * SR); m = metal(1400 + rng.random() * 1600, 0.12) * (0.3 + rng.random() * 0.5); out[s:s + len(m)] += m[:len(out) - s]
    return X.norm(out)
def quebra():
    d = 2.2; out = np.zeros(int(d * SR))
    out[:int(1.8 * SR)] += X.ignite(1)[:int(1.8 * SR)] * 0.9
    m = metal(1150, 1.6); out[:len(m)] += m * 0.6; m = metal(2300, 1.0); out[:len(m)] += m * 0.4
    c = X.crash(0.8); out[:len(c)] += c * 0.6
    for k in range(10):
        s = int((0.15 + rng.random() * 0.7) * SR); tk = metal(3000 + rng.random() * 3000, 0.08) * 0.3; out[s:s + len(tk)] += tk
    return X.norm(out)
def papel(d=0.35): return X.norm(X.bp(nz(d), 1500, 6000) * np.abs(np.sin(np.linspace(0, 9, int(d * SR)))) * np.sin(np.linspace(0, np.pi, int(d * SR))))
def marcador(d=0.4): x = X.bp(nz(d), 2500, 7000) * (0.6 + 0.4 * np.sin(np.linspace(0, 40, int(d * SR)))) * np.sin(np.linspace(0, np.pi, int(d * SR))) ** 0.5; return X.norm(x)
def arrasto(d=1.8):
    t = np.arange(int(d * SR)) / SR; x = X.lp(X.brown(d), 500) * (0.7 + 0.3 * np.sin(2 * np.pi * 7 * t)) + X.bp(nz(d), 300, 1800) * 0.3
    return X.norm(x * np.minimum(1, t / 0.1) * np.minimum(1, (d - t) / 0.3))
def relogio(d=1.6):
    out = np.zeros(int(d * SR))
    for k in range(int(d / 0.12)): c = X.click(1.4 if k % 2 else 1.1, 0.7); s = int(k * 0.12 * SR); out[s:s + len(c)] += c[:len(out) - s]
    return out
def queda(): d = 1.0; t = np.arange(int(d * SR)) / SR; f = 900 * np.exp(-t * 2.2); return X.norm(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 1.5) * 0.3 + X.whoosh(d) * 0.7)
def multidao(d):
    t = np.arange(int(d * SR)) / SR; x = X.bp(nz(d), 300, 2500) * (0.6 + 0.4 * X.lp(np.abs(nz(d)), 3)) ; x += X.bp(nz(d), 2000, 5000) * 0.15
    return X.norm(x * np.minimum(1, t / 0.6) * np.minimum(1, (d - t) / 0.6))
SONS = {
    "slam": lambda: X.norm(X.thump(1, 58) + np.pad(metal(700, 0.3), (0, int(0.35 * SR) - int(0.3 * SR))) * 0.4), "carimbo": carimbo, "racha": lambda: rachadura(0.6),
    "baque": lambda: X.thump(1, 55), "corrente": lambda: corrente(1.3), "zoom": lambda: X.whoosh(0.3), "quebra": quebra, "wipe": lambda: X.whoosh(0.32),
    "risco": lambda: marcador(0.32), "clique": lambda: X.click(1.0), "corte": lambda: X.whoosh(0.2), "rachadura": rachadura, "papel": papel,
    "marcador": marcador, "queda": queda, "puxa": lambda: X.whoosh(0.7), "arrasto": arrasto, "relogio": relogio,
    "cadeado": lambda: X.norm(np.concatenate([X.click(0.6), X.clack(1.4)])),
    "iris": lambda: X.whoosh(0.45), "fecha": lambda: marcador(0.3), "golpe": lambda: X.norm(X.thump(1, 48) * 1.0), "logo": carimbo, "flash": None, "drone": None,
}
GAN = {"slam": 0.7, "carimbo": 0.9, "racha": 0.7, "baque": 0.6, "corrente": 0.5, "zoom": 0.5, "quebra": 1.0, "wipe": 0.6, "risco": 0.45, "clique": 0.5, "corte": 0.45,
       "rachadura": 0.9, "papel": 0.4, "marcador": 0.4, "queda": 0.6, "puxa": 0.5, "arrasto": 0.55, "relogio": 0.4, "cadeado": 0.6, "iris": 0.5, "fecha": 0.5, "golpe": 0.9, "logo": 0.8}
for e in EV:
    f = SONS.get(e["type"])
    if f is None: continue
    s = f(); add(fx, s.astype(np.float32), e["t"] - (0.12 if e["type"] in ("wipe", "zoom", "iris", "corte", "puxa") else 0), GAN.get(e["type"], 0.5) * e.get("g", 1.0), float(rng.uniform(-0.25, 0.25)))
# ambiências
add(fx, (X.lp(X.brown(Q), 160) * 0.6).astype(np.float32), 0, 0.5)                                              # galpão grave no gancho
add(fx, multidao(c1 - c0).astype(np.float32), c0, 0.16); add(fx, multidao(l1 - l0).astype(np.float32), l0, 0.2); add(fx, multidao(h1 - h0).astype(np.float32), h0, 0.22)

# ------------------------------------------------------------------ voz e mix
voz, sr = sf.read(AQUI / "audio/voz.wav", dtype="float32"); assert sr == SR
voz = np.concatenate([voz, np.zeros(max(0, N - len(voz)), np.float32)])[:N]
voz = X.compress(X.hp(voz, 70), thr=0.18, ratio=3.0).astype(np.float32)
# envelope de fala para ducking (50 ms, ataque rápido e soltura de 250 ms)
a = np.abs(voz); k = int(0.05 * SR); e = np.convolve(a, np.ones(k) / k, "same"); e = e / (np.percentile(e, 98) + 1e-9)
e = np.clip(e * 2.2, 0, 1)
rel = np.exp(-1 / (0.25 * SR)); env_d = e.copy()
for i in range(1, len(env_d)): env_d[i] = max(e[i], env_d[i - 1] * rel)
fala = env_d > 0.3
def rms(x, m=None): x = x if m is None else x[m]; return float(np.sqrt(np.mean(x ** 2)) + 1e-12)
REF = 0.16; vz = voz * (REF / rms(voz, fala))
duck_m = (1 - 0.72 * env_d)[:, None]; duck_f = (1 - 0.6 * env_d)[:, None]
mus = musica * duck_m; mus *= REF * 10 ** (-18 / 20) / rms(mus.mean(1), fala)          # trilha ~18 dB abaixo da voz enquanto ele fala
efx = fx * duck_f; efx *= REF * 10 ** (-16 / 20) / rms(efx.mean(1), fala)             # efeitos ~16 dB abaixo
out = vz[:, None] + mus + efx
out[:int(0.025 * SR)] *= np.linspace(0, 1, int(0.025 * SR))[:, None]
fade = int(0.6 * SR); out[-fade:] *= np.linspace(1, 0, fade)[:, None]
out = np.stack([X.limit(out[:, c], 0.85) for c in range(2)], 1)
(AQUI / "out").mkdir(exist_ok=True); sf.write(AQUI / "out/mix.wav", out.astype(np.float32), SR, subtype="FLOAT")
sf.write(AQUI / "out/trilha.wav", (mus + efx).astype(np.float32), SR, subtype="FLOAT")
print(f"mix: {DUR:.2f}s → out/mix.wav")
print("CREDITS:\n" + "\n".join(S.credits(sorted({e[1] for e in ev_orq + ev_gtr + ev_bat}))))
