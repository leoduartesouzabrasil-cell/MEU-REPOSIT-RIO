# Instruções permanentes — produção de vídeos

**Todo vídeo pedido neste repositório usa a identidade "Construtivismo Tropical".**
Antes de criar qualquer vídeo, leia `identidade/IDENTIDADE.md` e siga paleta, tipografia,
composição, vocabulário de movimento e a lista do que não fazer. As referências originais
estão em `identidade/referencias/` (pôster "O Camarada", cartaz soviético 1917–1957 e quadros de um documentário de motion graphics).

Resumo rápido:
- **Dois registros alternados**: ARQUIVO (documentário calmo, ~70%) e CARTAZ (impacto soviético, ~30%, nos picos). Ver seção 0 do guia.
- Cores: bege `#EDE0C4` (base), vermelho `#C8201E`, amarelo `#EBB52A`; azul `#1F3A5F` só como contraponto. Tinta `#1C1714`.
- Fontes: Big Shoulders Display (manchete), Russo One (palavra-bloco), Oswald (kicker), Special Elite (datilografia), Instrument Serif itálica (narração), Archivo 700 (rótulos/digitação).
- Movimento CARTAZ: carimbo, corte diagonal, sol nascente, escada, bandeira, contador.
- Movimento ARQUIVO: palavra por palavra, digitação + seleção, câmera documental, foco entrando, ondas + etiquetas, cor seletiva, moldura; varredura de TV.
- Papel com grão "fervendo" sempre ligado.
- Formato padrão: 1080×1920, 30 fps, **até ~60 s** salvo pedido contrário.
- Temas de violência/morte: **modo TENSO** (seção 8 do guia). Todo vídeo termina com o **logo O Camarada** (seção 9).

## Pesquisa automática (fatos e imagens)
Todo vídeo sobre tema real (ex.: Lula, uma lei, uma data histórica) começa com pesquisa, sem esperar o usuário pedir:
siga `pesquisa/PROTOCOLO.md`. Em resumo: buscar com `WebSearch` só em fontes confiáveis, 2 fontes por fato,
anotar em `midia/<tema>/FONTES.md`; imagens só de Agência Brasil, Wikimedia Commons, Agência Senado/Câmara,
baixadas com `python3 pesquisa/baixar_imagem.py <url> <tema>` (gera `CREDITOS.md`), e crédito na tela.

## Como produzir
1. Copie `motor/cenas/arquivo.js` (modelo com os dois registros; `demo.js` só tem o Cartaz) para `motor/cenas/<nome>.js` e escreva o roteiro usando as funções de `motor/lib.js` (objeto `CT`, recebido como `L`).
2. Confira quadros: `node motor/render.js <nome> saida/q.png --still 2.5`
3. Renderize: `node motor/render.js <nome> [saida/<nome>.mp4] [--audio trilha.mp3]`
4. Fotos/imagens: declare em `CENA.imagens = { nome: 'caminho' }` e use `L.foto(ctx, L.img.nome, ...)`.
5. **Narração + trilha + efeitos**: siga `audio/indigenas-ms/montar.py` como modelo. Ele transcreve a narração
   (palavras com tempo, via faster-whisper), corta em trechos com pausas para os momentos CARTAZ, sintetiza a trilha e
   os efeitos com `motor/som.py` (sem amostras de terceiros), faz o ducking e gera `motor/cenas/<nome>.tempos.js`
   (marcas e legendas), que a cena usa. Assim som e imagem ficam sincronizados.
   Trilha "indígena": maracá, tambor de pele, flauta de taquara (pentatônica), bordão e mata. É evocação sintetizada,
   não música tradicional real; para música de verdade, licenciar artistas indígenas.
6. Render paralelo: `node motor/render.js <nome> saida/<nome>.mp4 --audio audio/<nome>/mix.wav` (aceita `--de/--ate`
   para testar um trecho). O áudio sai normalizado em -14 LUFS (padrão de Reels).
7. Pré-visualização ao vivo: abra `motor/player.html?cena=<nome>` num navegador.

Quando faltar algo na biblioteca (novo símbolo, transição), adicione em `motor/lib.js` e documente em `identidade/IDENTIDADE.md`, mantendo a identidade.
