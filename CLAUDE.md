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
- **Todo vídeo é legendado**: a narração aparece como legenda palavra a palavra, no tempo da fala (`legendas` em `<nome>.tempos.js`, gerado pelo `montar.py`). Estilo fixo: tarja escura do tamanho da frase, com filete vermelho à esquerda e texto bege (`eleicoes-2026.js`, y 1466–1542, texto até 48 px). Créditos de foto ficam logo abaixo da foto correspondente, sem encostar nela.
- Temas de violência/morte: **modo TENSO** (seção 8 do guia). Todo vídeo termina com o **logo O Camarada** (seção 9).
- **Capa de todo Reels**: cartaz de propaganda soviética com a figura ilustrada (seção 10 do guia; `motor/ilustrar.py` + `L.capaSovietica`).

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

## Referências de design: a pasta `videos/` (obrigatório)
Os vídeos finais já publicados ficam em `videos/` (lista em `videos/LEIA-ME.md`). **Antes de criar qualquer vídeo, abra os vídeos de
lá como referência de design** e mantenha o mesmo padrão. Para comparar, faça uma folha de quadros pequena:
`ffmpeg -i videos/<arquivo>.mp4 -vf "fps=1/3,scale=216:384" saida/ref/q_%02d.jpg`, junte os quadros com PIL e abra só a folha.
Se o vídeo novo continua um anterior (ex.: Renan Santos → Esquerda cirandeira), use aquele vídeo como **base** (padrão visual,
componentes, a régua), mas **não como cópia**: as cenas e o final são próprios do novo tema (no do Renan: sem circo e sem "radicalize-se").
Duração máxima: 50 a 60 s.

## Fluxo de cada vídeo (combinado com o autor) — siga sem precisar perguntar
1. **Pesquisa** (protocolo acima) → **roteiro** em `roteiros/<nome>.md` (áudios #1..#4, "NA TELA", notas de precisão) e `midia/<nome>/FONTES.md`. Enviar o roteiro por extenso na resposta.
2. **Prévia sem narração**: cena `motor/cenas/<nome>.js` + trilha `audio/<nome>/previa.py` (exporta `trilha(T, N)`). Conferir com `ferramentas/stills.js` em folha pequena antes de renderizar.
3. **Narração**: o autor manda 4 áudios. Antes de usar, comparar `md5sum` com áudios antigos (já chegaram arquivos repetidos de outros vídeos) e transcrever. Montar com `audio/<nome>/montar.py` (modelos: `audio/cesta-basica/montar.py`, `audio/esquerda-cirandeira/montar.py`): voz acelerada (VEL 1.08–1.20), pausas compactadas, marcas de T por frase falada, CORRECOES da transcrição, legendas.
4. **Render** em segundo plano (`run_in_background`), comprimir (`-crf 24 -tune grain`) para `saida/<nome>-FINAL.mp4`, enviar e fazer commit/push.
5. **Capa**: arte do autor + título; conferir o recorte 3:4 do grid (y 240–1680).

## Preferências do autor (valem para todos os vídeos)
- Legenda: tarja escura do tamanho da frase, filete vermelho, texto bege 48 px, y 1466–1542 (não usar faixa transparente).
- Nada sobreposto: título y 330, fonte dos dados y 384, conteúdo até y ~1420; crédito de foto logo ABAIXO da foto.
- Fotos de pessoas: as mais atuais com licença livre (Agência Brasil, Câmara/Senado via Commons, TSE como último recurso); enquadramento MANUAL de cada uma com `ferramentas/enq.py` (rosto inteiro com ombros, sem estourar a borda).
- Trilha: rock sintetizado (`som.rock`, guitarra + bateria) — o autor não gosta da flauta.
- Tom: leve/irônico quando pedido; fatos sempre conferidos (lista nominal de votações via dados abertos da Câmara).
- Duração-alvo ~50–60 s; se a narração não couber, entregar e oferecer versão curta (cortes de apoio, sem regravar).

## Economia de contexto
- Conversas longas gastam a janela de contexto: **comece uma conversa nova a cada vídeo**. Tudo o que importa está neste arquivo, em `identidade/IDENTIDADE.md`, `ferramentas/LEIA-ME.md`, nos roteiros e no git.
- Ver imagens só em folhas pequenas; ler arquivos grandes por trechos (`grep`/`sed -n`); renders sempre em segundo plano.

