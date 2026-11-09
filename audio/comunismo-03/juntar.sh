#!/usr/bin/env bash
# Põe o GANCHO do Jones Manoel DENTRO da moldura da cena renderizada (mesmo esquema do EP. 2).
# Trecho: 0–40,85 s, até "Foi assim!" (escolha do autor), do original 1080×1920 (midia/comunismo-03/gancho-original.mp4). Recorte 1035×1320 a partir do topo: a legenda dele começa em
# y ~1380 e fica fora (a nossa legenda está na cena). Escala para a janela da cena (x 195, y 445, 690×880).
# Uso: bash audio/comunismo-03/juntar.sh saida/comunismo-03.mp4 saida/comunismo-03-FINAL.mp4
set -euo pipefail
CENA="$1"; SAIDA="$2"
FIM=40.85
RAIZ="$(cd "$(dirname "$0")/../.." && pwd)"
J="$RAIZ/midia/comunismo-03/gancho-trecho.mp4"   # 0–41,5 s do original (o original de 41 MB fica fora do git)
# a voz do Jones vai a -14 LUFS (ganho fixo, medido no trecho)
IJ=$(ffmpeg -hide_banner -t "$FIM" -i "$J" -af ebur128 -f null - 2>&1 | grep -E "^\s+I:" | tail -1 | awk '{print $2}')
GJ=$(echo "-14 - ($IJ)" | bc -l)
ffmpeg -loglevel error -y -i "$J" -i "$CENA" -filter_complex "
[0:v]trim=0:$FIM,setpts=PTS-STARTPTS[jv];
[0:a]atrim=0:$FIM,asetpts=PTS-STARTPTS,afade=t=out:st=$(echo "$FIM - 0.12" | bc):d=0.12[ja0];
[jv]fps=30,crop=1035:1320:22:0,scale=690:880:flags=lanczos,setsar=1,noise=alls=7:allf=t,format=yuv420p[j];
[1:v][j]overlay=195:445:eof_action=pass:format=auto,format=yuv420p[v];
[ja0]aresample=48000,aformat=channel_layouts=stereo,volume=${GJ}dB[ja];
[1:a]aresample=48000,aformat=channel_layouts=stereo[ca];
[ca][ja]amix=inputs=2:duration=first:normalize=0[a]" -map "[v]" -map "[a]" -c:v libx264 -crf 24 -tune grain -preset medium -c:a aac -b:a 192k "$SAIDA.tmp.mp4"
# volume final no padrão de Reels (-14 LUFS) com ganho FIXO: o loudnorm dinâmico subia o fundo baixo sob o Jones
I=$(ffmpeg -hide_banner -i "$SAIDA.tmp.mp4" -af ebur128 -f null - 2>&1 | grep -E "^\s+I:" | tail -1 | awk '{print $2}')
G=$(echo "-14 - ($I)" | bc -l)
ffmpeg -loglevel error -y -i "$SAIDA.tmp.mp4" -c:v copy -af "volume=${G}dB,alimiter=limit=0.84:level=false" -ar 48000 -c:a aac -b:a 192k "$SAIDA" && rm -f "$SAIDA.tmp.mp4"
echo "ok → $SAIDA"
