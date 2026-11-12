#!/usr/bin/env bash
# Limpa a narração: corta o ronco grave (<75 Hz), reduz o ruído de fundo (RNN + FFT), tira o "embolado" de 250 Hz,
# dá presença em 3,2 kHz, suaviza os "s" (de-esser), comprime de leve e normaliza em -16 LUFS (a mixagem final vai a -14).
# Uso: bash audio/china-5-curiosidades/limpar.sh entrada.m4a saida.wav
set -e
D=$(cd "$(dirname "$0")" && pwd)
CH="highpass=f=75:poles=2,highpass=f=75:poles=2,arnndn=m=$D/sh.rnnn:mix=0.85,afftdn=nr=10:nf=-40:tn=1,equalizer=f=250:t=q:w=1.2:g=-3,equalizer=f=3200:t=q:w=1.5:g=2.5,equalizer=f=9000:t=h:w=0.7:g=1,deesser=i=0.35,acompressor=threshold=-20dB:ratio=3:attack=8:release=120:makeup=2,alimiter=limit=0.89"
ffmpeg -y -hide_banner -loglevel error -i "$1" -af "$CH" -ar 48000 /tmp/_limpo.wav
ffmpeg -y -hide_banner -loglevel error -i /tmp/_limpo.wav -af loudnorm=I=-16:TP=-1.5:LRA=7 -ar 48000 "$2"
