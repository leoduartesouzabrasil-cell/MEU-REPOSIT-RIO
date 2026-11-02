#!/usr/bin/env bash
# Põe o GANCHO do Jones Manoel (0–16,3 s do vídeo dele, até "…são os franciscanos.") DENTRO da moldura da cena renderizada.
# Uso: bash audio/comunismo-01/juntar.sh saida/comunismo-01.mp4 saida/comunismo-01-FINAL.mp4
# Recorte 576×535 a partir de y = 200 do original: tira o título e a legenda dele (a nossa legenda está na cena).
# Escala para a janela da cena (JANELA em motor/cenas/comunismo-01.js: x 120, y 450, 840×780), com grão leve.
# O áudio dele (normalizado em -14 LUFS, fade no fim) soma com o da cena, que nesse trecho tem só um fundo baixo.
set -euo pipefail
CENA="$1"; SAIDA="$2"; FIM=16.3
RAIZ="$(cd "$(dirname "$0")/../.." && pwd)"
JONES="$RAIZ/midia/comunismo-01/jones-manoel-original.mp4"
ffmpeg -loglevel error -y -t "$FIM" -i "$JONES" -i "$CENA" -filter_complex "
[0:v]fps=30,crop=576:535:0:200,scale=840:780:flags=lanczos,setsar=1,noise=alls=7:allf=t,format=yuv420p[j];
[1:v][j]overlay=120:450:eof_action=pass:format=auto,format=yuv420p[v];
[0:a]aresample=48000,aformat=channel_layouts=stereo,loudnorm=I=-14:TP=-1.5,afade=t=out:st=$(echo "$FIM - 0.15" | bc):d=0.15[ja];
[1:a]aresample=48000,aformat=channel_layouts=stereo[ca];
[ca][ja]amix=inputs=2:duration=first:normalize=0[a]" -map "[v]" -map "[a]" -c:v libx264 -crf 24 -tune grain -preset medium -c:a aac -b:a 192k "$SAIDA"
echo "ok → $SAIDA"
