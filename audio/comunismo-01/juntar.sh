#!/usr/bin/env bash
# Cola o GANCHO do Jones Manoel (0–16,3 s do vídeo dele, até "…são os franciscanos.") antes da cena renderizada.
# Uso: bash audio/comunismo-01/juntar.sh saida/comunismo-01.mp4 saida/comunismo-01-FINAL.mp4
# O trecho do Jones entra em tela cheia (576×1024 → 1080×1920), com a legenda própria dele e o crédito "Vídeo: Jones Manoel";
# o áudio dele é normalizado em -14 LUFS (o mesmo da cena) e termina com fade curto.
set -euo pipefail
CENA="$1"; SAIDA="$2"; FIM=16.3
RAIZ="$(cd "$(dirname "$0")/../.." && pwd)"
FONTE="$RAIZ/identidade/fontes/SpecialElite-Regular.ttf"
JONES="$RAIZ/midia/comunismo-01/jones-manoel-original.mp4"
ffmpeg -loglevel error -y -t "$FIM" -i "$JONES" -i "$CENA" -filter_complex "
[0:v]scale=1080:1920:flags=lanczos,setsar=1,fps=30,
drawtext=fontfile=$FONTE:text='Vídeo\: Jones Manoel':fontsize=34:fontcolor=0xEDE0C4:box=1:boxcolor=0x1C1714@0.85:boxborderw=14:x=60:y=1720,
format=yuv420p[v0];
[0:a]aresample=48000,aformat=channel_layouts=stereo,loudnorm=I=-14:TP=-1.5,afade=t=out:st=$(echo "$FIM - 0.15" | bc):d=0.15[a0];
[1:v]fps=30,setsar=1,format=yuv420p[v1];
[1:a]aresample=48000,aformat=channel_layouts=stereo[a1];
[v0][a0][v1][a1]concat=n=2:v=1:a=1[v][a]" -map "[v]" -map "[a]" -c:v libx264 -crf 24 -tune grain -preset medium -c:a aac -b:a 192k "$SAIDA"
echo "ok → $SAIDA"
