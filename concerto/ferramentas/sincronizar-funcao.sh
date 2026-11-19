#!/usr/bin/env bash
# Copia as regras do jogo para a função do Supabase (rode antes de "supabase functions deploy jogo").
set -e
cd "$(dirname "$0")/.."
mkdir -p supabase/functions/_shared
cp js/regras.js js/dados.js js/dados-faixa.js supabase/functions/_shared/
echo "regras copiadas para supabase/functions/_shared"
