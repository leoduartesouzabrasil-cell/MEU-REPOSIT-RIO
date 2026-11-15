"""Transcreve um áudio longo (ex.: live de 1 h) com tempo por palavra, salvando em JSON [[palavra, ini, fim], ...] e um TXT legível por minuto.
Uso: python3 ferramentas/transcrever_longo.py entrada.wav saida.json"""
import json, subprocess, sys
import numpy as np
from faster_whisper import WhisperModel
ent, sai = sys.argv[1], sys.argv[2]
raw = subprocess.run(["ffmpeg", "-loglevel", "error", "-i", ent, "-ac", "1", "-ar", "16000", "-f", "f32le", "-"], capture_output=True, check=True).stdout
x = np.frombuffer(raw, np.float32)
m = WhisperModel("small", device="cpu", compute_type="int8")
segs, _ = m.transcribe(x, language="pt", word_timestamps=True, vad_filter=True)
pal, linhas = [], []
for s in segs:
    pal += [[w.word.strip(), round(w.start, 2), round(w.end, 2)] for w in s.words]
    linhas.append(f"[{int(s.start // 60):02d}:{s.start % 60:05.2f}] {s.text.strip()}")
    print(linhas[-1], flush=True)
json.dump(pal, open(sai, "w"), ensure_ascii=False)
open(sai.replace(".json", ".txt"), "w").write("\n".join(linhas))
