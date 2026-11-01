import sys, json, subprocess
import numpy as np
from faster_whisper import WhisperModel
m = WhisperModel('small', device='cpu', compute_type='int8')
out = {}
for k, f in enumerate(sys.argv[2:], 1):
    raw = subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', f, '-ac', '1', '-ar', '16000', '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    x = np.frombuffer(raw, np.float32)
    segs, _ = m.transcribe(x, language='pt', word_timestamps=True)
    out[str(k)] = [[w.word.strip(), round(w.start, 2), round(w.end, 2)] for s in segs for w in s.words]
json.dump(out, open(sys.argv[1], 'w'), ensure_ascii=False)
for k, v in out.items(): print(k, ' '.join(f'{w}[{a}]' for w, a, b in v), '\n')
