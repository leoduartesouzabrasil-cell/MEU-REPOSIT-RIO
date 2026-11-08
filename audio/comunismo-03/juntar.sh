#!/usr/bin/env bash
# Põe o GANCHO do Jones Manoel DENTRO da moldura da cena renderizada (mesmo esquema do EP. 2).
# Trecho: 0–40,85 s, até "Foi assim!" (escolha do autor), do original 1080×1920 (midia/comunismo-03/gancho-original.mp4). Recorte 1035×1320 a partir do topo: a legenda dele começa em
# y ~1380 e fica fora (a nossa legenda está na cena). Escala para a janela da cena (x 195, y 445, 690×880).
# Uso: bash audio/comunismo-03/juntar.sh saida/comunismo-03.mp4 saida/comunismo-03-FINAL.mp4
set -euo pipefail
CENA="$1"; SAIDA="$2"
FIM=40.85
RAIZ="$(cd "$(dirname "$0")/../.." && pwd)"
J="$RAIZ/midia/comunismo-03/gancho-original.mp4"
ffmpeg -loglevel error -y -i "$J" -i "$CENA" -filter_complex "
[0:v]trim=0:$FIM,setpts=PTS-STARTPTS[jv];
[0:a]atrim=0:$FIM,asetpts=PTS-STARTPTS,afade=t=out:st=$(echo "$FIM - 0.12" | bc):d=0.12[ja0];
[jv]fps=30,crop=1035:1320:22:0,scale=690:880:flags=lanczos,setsar=1,noise=alls=7:allf=t,format=yuv420p[j];
[1:v][j]overlay=195:445:eof_action=pass:format=auto,format=yuv420p[v];
[ja0]aresample=48000,aformat=channel_layouts=stereo,loudnorm=I=-14:TP=-1.5[ja];
[1:a]aresample=48000,aformat=channel_layouts=stereo[ca];
[ca][ja]amix=inputs=2:duration=first:normalize=0[a]" -map "[v]" -map "[a]" -c:v libx264 -crf 24 -tune grain -preset medium -c:a aac -b:a 192k "$SAIDA.tmp.mp4"
# volume final no padrão de Reels
ffmpeg -loglevel error -y -i "$SAIDA.tmp.mp4" -c:v copy -af loudnorm=I=-14:TP=-1.5 -ar 48000 -c:a aac -b:a 192k "$SAIDA" && rm -f "$SAIDA.tmp.mp4"
echo "ok → $SAIDA"
