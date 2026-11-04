# Ferramentas de produção (rodar da raiz do repositório)

Ambiente Python das ferramentas pesadas (uma vez por sessão nova):
`python3 -m venv /tmp/venv && /tmp/venv/bin/pip install faster-whisper rembg[cpu] opencv-python-headless pillow`

| Ferramenta | Para quê | Uso |
|---|---|---|
| `stills.js` | quadros soltos de uma cena (conferir layout sem renderizar o vídeo) | `TEMPOS=<nome>-70 node ferramentas/stills.js <cena> 3.5 12 40` → `saida/q/<t>.jpg` |
| `enq.py` | prévia do enquadramento MANUAL de retratos redondos | json `[["Nome","foto.jpg",[cx,cy,lado]],...]` (cx, cy em fração da foto; lado em fração da ALTURA) → `python3 ferramentas/enq.py lista.json saida/q/enq.jpg` |
| `recortar.py` | tira o fundo de foto/arte (PNG) | `/tmp/venv/bin/python -I ferramentas/recortar.py entrada.jpg saida.png birefnet-portrait` (pessoas) ou `birefnet-general` (artes, grupos) |
| `transcrever.py` | palavras com tempo (faster-whisper) dos áudios da narração | `/tmp/venv/bin/python ferramentas/transcrever.py audio/<nome>/palavras.json audio/<nome>/narracao/1.mp3 ...` |

Dica: para ver vários quadros de uma vez, junte-os numa folha pequena (PIL, 270×480 cada) e abra só a folha.
