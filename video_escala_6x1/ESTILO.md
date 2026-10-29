# Base de estilo: "documentário editorial"

Extraída do vídeo de referência do Pinterest (pin 1086986060089969292, sobre Hedy Lamarr).
Implementada em `gerar_video_estilo.py`.

## Formato e ritmo
- Vertical 9:16 (a referência tem 720x1280, 30 fps, 32 s).
- **Cortes secos a cada 1–1,5 s** (~22 cortes em 32 s). Sem transições suaves.
- **Uma ideia por tela**: 1 a 3 palavras, quase sempre no centro.
- Palavras de uma frase aparecem **uma por vez**, às vezes espalhadas pela tela.

## Tipografia (duas vozes)
| Uso | Fonte | Onde |
|---|---|---|
| Frases de impacto, caixa alta | Sans negrito (Helvetica/Arial) | Fundo preto, texto branco |
| Narração e detalhes | Serifa itálica (Times/Didot) | Fundo papel, texto quase preto |

Os tamanhos são pequenos e discretos. O destaque vem do contraste e do espaço vazio.

## Fundos
- **Preto** com granulação.
- **Papel off-white** com manchas suaves e linhas horizontais.
- **Folha de patente**: papel bege com desenho técnico apagado (retângulos hachurados, números de referência, assinatura).
- Fotos de arquivo em P&B ou coloridas, e recortes de objetos com sombra (lixeira, quadro, torpedo).

## Recursos gráficos
- **Texto digitado** com cursor piscando ("SHE HELPED|").
- **Caixa de seleção azul com alças**, como no After Effects ou Figma, marcando uma palavra.
- **Rótulos de interface**: retângulo azul, borda branca, texto branco ("Wi-Fi", "Bluetooth", "GPS"), entrando em escada.
- **Círculos concêntricos** (radar/sinal) sobre preto.
- **Ondas de sinal vermelhas** e ilustrações recortadas.
- **Moldura dourada** para "enquadrar" uma ideia.
- Recortes de papel levemente girados, com sombra projetada.

## Acabamento
- Granulação de filme em todo quadro, scanlines horizontais leves e vinheta escura nas bordas.
- Zoom lento (~4%) dentro de cada plano e leve tremida de película.
- Texto entra com um "pulo" de escala rápido (~0,15 s).

## Som
- Narração contínua (voz) sobre uma trilha de fundo grave.
- Estalo curto em cada corte, cliques de tecla no texto digitado, "blips" nos rótulos.
- No vídeo da 6x1 não há narração. A trilha é um drone grave com relógio tiquetaqueando (tema: tempo).

---

# Base de estilo: "cartaz soviético / construtivista"

Inspirada nos cartaces de referência enviados (propaganda soviética e o post "O Camarada").
Implementada em `gerar_video_cartaz.py`.

- **Paleta:** vermelho `#CC2220`, mostarda `#EAB426`, creme `#EEE2C6` e preto `#1E1916`.
- **Tipografia:** condensada em caixa alta (Bebas Neue) para títulos e bloco geométrico (Russo One) para apoio. As duas fontes estão em `fontes/`, com licença OFL.
- **Composição:** diagonais de 6° a 12°, faixas que atravessam a tela, raios de sol girando atrás do tema e estrelas.
- **Ícones chapados:** bandeira tremulando com foice e martelo, punho erguido, fábrica com chaminés, relógio e barras de calendário.
- **Movimento:** textos que "carimbam" (caem de 1,8x para 1x), deslizam com passada e sobem de baixo.
- **Impressão:** granulação forte, manchas de papel, vinheta e registro desalinhado (canal vermelho deslocado 3 px).
- **Som:** marcha a 120 bpm (bumbo e tarol, com rufo), acordes de metais nos títulos, carimbos e sino.
