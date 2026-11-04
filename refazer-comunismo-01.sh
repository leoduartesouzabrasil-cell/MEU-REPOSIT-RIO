#!/usr/bin/env bash
# Refaz do zero o vídeo "Desmistificando o Comunismo · EP. 1: O que é o comunismo?" (1:37), a capa e a vinheta.
# Tudo o que é preciso está no repositório: cena, imagens, narração (4 áudios), transcrição (palavras.json),
# trilha sintetizada e o trecho do Jones Manoel. Não precisa baixar nada nem transcrever de novo.
# Uso (da raiz do repositório):  bash refazer-comunismo-01.sh
# Saídas: saida/comunismo-01-FINAL.mp4 · saida/capa-comunismo-01.png · saida/serie-vinheta.mp4
# Prévia ao vivo no navegador: motor/player.html?cena=comunismo-01
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p saida
python3 audio/serie-comunismo/vinheta.py                      # música da vinheta (audio/serie-comunismo/vinheta.wav)
python3 audio/comunismo-01/montar.py                          # voz + trilha + efeitos → audio/comunismo-01/mix.wav e as marcas/legendas
node motor/render.js comunismo-01 saida/comunismo-01-cena.mp4 --audio audio/comunismo-01/mix.wav
bash audio/comunismo-01/juntar.sh saida/comunismo-01-cena.mp4 saida/comunismo-01-FINAL.mp4   # põe o Jones na moldura
node motor/render.js capa-comunismo-01 saida/capa-comunismo-01.png --still 1
node motor/render.js serie-comunismo-logo saida/serie-vinheta-mudo.mp4
ffmpeg -loglevel error -y -i saida/serie-vinheta-mudo.mp4 -i audio/serie-comunismo/vinheta.wav -c:v libx264 -crf 24 -tune grain \
  -af loudnorm=I=-14:TP=-1.5 -c:a aac -b:a 192k -shortest saida/serie-vinheta.mp4
echo "pronto: saida/comunismo-01-FINAL.mp4 · saida/capa-comunismo-01.png · saida/serie-vinheta.mp4"
