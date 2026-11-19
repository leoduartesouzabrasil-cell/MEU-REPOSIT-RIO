#!/bin/sh
# Refaz o vídeo do zero: corte da voz → eventos → quadros → trilha/efeitos/mix → master −14 LUFS.
# Requer a biblioteca do plugin lemo-opuscar (sh <skill>/scripts/setup.sh deps music) e ffmpeg 7+ no PATH para o mux.
set -e
LIB=${LIB:-/root/lemo-opuscar}; export LIB
HERE=$(cd "$(dirname "$0")" && pwd)
"$LIB/.venv/bin/python" "$LIB/core/audio/sampler.py" --need "$HERE/mix.py"
"$LIB/.venv/bin/python" "$HERE/audio/cortar.py"
cd "$LIB"
node core/render/events.mjs "$HERE" --size 1080x1920
node core/render/video.mjs "$HERE" --fps 30 --workers 5 --size 1080x1920 --out "$HERE/out/video.mp4"
"$LIB/.venv/bin/python" "$HERE/mix.py"
sh core/render/mux.sh "$HERE/out/video.mp4" "$HERE/out/mix.wav" "$HERE/out/6x1-brecha-cine.mp4" 30 1
