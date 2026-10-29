# CONSTRUTIVISMO TROPICAL — Identidade visual dos vídeos (v2)

Base estética obrigatória para **todo vídeo** produzido neste repositório.
É uma mistura de três fontes:

| Fonte | O que herdamos |
|---|---|
| Cartaz soviético (ref-02, *1917–1957*) | Diagonais heroicas, figuras em contra-plongée olhando para cima e para a direita, blocos de texto em escada, bandeira vermelha como massa de cor, litografia com contorno e sombras chapadas. |
| Pôster "O Camarada" (ref-01) | Fundo amarelo chapado, tipografia vermelha geométrica e condensada, palavra-chave em letra blocada/modular, kicker pequeno + logo no topo, grão de papel, ilustração em aquarela/guache com rosto em tons sépia. |
| Documentário de arquivo (ref-03, vídeo do Pinterest) | Ritmo de narração: texto pequeno no centro, palavra por palavra; serifa itálica editorial misturada com grotesca em caixa alta; linhas de TV/VHS e separação de cor; fotos de arquivo P&B com **um** elemento colorido; plantas/patentes como fundo; câmera que desliza e dá zoom seguindo o texto; seleção de texto estilo celular; ondas de sinal e etiquetas de interface; retratos em moldura dourada com foco entrando. |
| **Nossa assinatura** (o que é só nosso) | Temas brasileiros e latino-americanos, paleta bege-papel como base, azul apenas como contraponto, animação "impressa": cada frame parece uma gravura que se move. |

Referências salvas em `identidade/referencias/` (ref-03 é uma folha de quadros do vídeo; a parte final dele é anúncio e não faz parte do estilo).

## 0. Dois registros — a regra mais importante

Todo vídeo alterna entre dois registros. O contraste entre eles é a identidade.

| | **ARQUIVO** (conta a história) | **CARTAZ** (bate o martelo) |
|---|---|---|
| Função | Narração, contexto, dados, tensão | Clímax, palavra de ordem, conclusão |
| Fundo | Bege com planta técnica, foto de arquivo, ou tinta (escuro) | Amarelo, vermelho ou bege chapado + raios |
| Texto | Pequeno (50–90 px), centralizado, palavra por palavra | Gigante, ocupa a largura toda |
| Fontes | Instrument Serif itálica + Archivo 700 caixa alta | Big Shoulders, Russo One |
| Movimento | Lento e contínuo: pan, zoom de 5–25%, desfoque→foco | Seco e rápido: carimbo, corte diagonal |
| Textura | Varredura de TV + grão | Só grão de papel |
| Proporção | ~70% do tempo | ~30% do tempo, nos picos |

Estrutura típica: ARQUIVO (gancho calmo) → ARQUIVO (contexto) → **CARTAZ** (virada) → ARQUIVO (desenvolvimento) → **CARTAZ** (final) ou fecho calmo em ARQUIVO.

---

## 1. Paleta

| Token | Hex | Uso |
|---|---|---|
| `--bege` | `#EDE0C4` | **Base**: papel envelhecido, fundo padrão |
| `--bege-escuro` | `#D6C29A` | Sombras do papel, faixas secundárias |
| `--vermelho` | `#C8201E` | Cor de ação: títulos, bandeiras, raios, estrelas |
| `--vermelho-escuro` | `#8A1411` | Sombra do vermelho, contorno, profundidade |
| `--amarelo` | `#EBB52A` | Fundo de impacto (cenas-cartaz), símbolos sobre vermelho |
| `--azul` | `#1F3A5F` | **Só quando necessário**: contraponto (dado, inimigo, frio, mar, céu noturno) |
| `--tinta` | `#1C1714` | Contornos, texto pequeno, figuras em sépia |

Regras:
- No máximo **3 cores por frame** (+ tinta). Combinações aprovadas:
  bege+vermelho · amarelo+vermelho · vermelho+amarelo (inverso) · bege+vermelho+azul.
- Azul nunca é cor dominante e nunca encosta direto no amarelo em área grande.
- Nada de gradiente digital liso. Profundidade = chapado + sombra de cor + textura.
- Nunca branco puro nem preto puro: use `--bege` e `--tinta`.

## 2. Tipografia (arquivos em `identidade/fontes/`)

| Papel | Fonte | Tratamento |
|---|---|---|
| Manchete | **Big Shoulders Display** 800–900 | CAIXA ALTA, condensada, entrelinha 0.85, tracking 0 |
| Palavra-bloco (a palavra que importa) | **Russo One** | Gigante, ocupa a largura toda, 1 palavra por vídeo/cena |
| Subtítulo / kicker | **Oswald** 500–600 | CAIXA ALTA, tracking +4%, pequeno |
| Legenda, data, citação, fonte | **Special Elite** | Datilografado, revelado letra a letra |
| Narração (registro Arquivo) | **Instrument Serif** *itálica* | Minúsculas, pequena, palavra por palavra com desfoque→nítido |
| Rótulo / digitação de interface (Arquivo) | **Archivo** 700 | CAIXA ALTA pequena, com cursor e separação de cor |

- Texto em escada diagonal (como o cartaz soviético) ou empilhado e alinhado à esquerda (como ref-01).
- Efeito "erro de impressão": uma cópia do título deslocada 4–8 px em `--vermelho-escuro` ou `--azul` por trás.

## 3. Composição

- Formato padrão: **1080×1920 (Reels/Shorts), 30 fps**. Alternativos: 1080×1350 e 1920×1080.
- Zonas seguras para Reels: 220 px no topo e 380 px embaixo sem texto importante.
- Topo: logo/kicker pequeno. Meio: manchete. Embaixo: figura ou símbolo.
- **Diagonal dominante de 15° a 30°**, subindo da esquerda para a direita (= futuro, avanço).
- Figuras: em contra-plongée, queixo erguido, olhar para cima e para a direita.
- Símbolos próprios: estrela de 5 pontas, raios de sol (sunburst), punho, bandeira tremulando, engrenagem, espiga.
  A foice e o martelo entram quando o tema pede.

## 4. Vocabulário de movimento

| Nome | Descrição | Duração |
|---|---|---|
| **Carimbo** | Escala 1.6→1 com overshoot + tremida de 2–3 frames + poeira de tinta | 6–10 frames |
| **Corte diagonal** | Faixa de cor varre a tela a 20–30° e revela a cena seguinte | 10–14 frames |
| **Sol nascente** | Raios girando devagar atrás do elemento principal (6–10°/s) | contínuo |
| **Escada** | Linhas de texto entram uma a uma da esquerda, em degrau | 4–6 frames de intervalo |
| **Datilografia** | Special Elite letra a letra, com cursor | 1–2 frames/letra |
| **Bandeira** | Tecido ondulando (onda senoidal na borda) | contínuo |
| **Contador** | Números/datas rolando até travar com carimbo | 20–40 frames |
| **Papel vivo** | Grão e manchas "fervendo" a 12 fps sobre tudo | contínuo |
| **Palavra por palavra** | Narração em serifa itálica; cada palavra surge desfocada e assenta, no tempo da fala | 0,2–0,4 s por palavra |
| **Letra por letra** | Variante: as letras da palavra entram desfocadas em sequência ("Duri…" → "During") | 0,5–0,8 s |
| **Digitação + seleção** | Grotesca com cursor; depois uma palavra é selecionada como no celular (caixa + alças) em vermelho ou azul | 1–2 s |
| **Câmera documental** | Pan e zoom lentos sobre planta/foto; a câmera vai até a palavra importante | contínuo |
| **Foco entrando** | Foto ou retrato começa desfocado e fica nítido (rack focus) | 0,6–1 s |
| **Ondas + etiquetas** | Ondas concêntricas de sinal; etiquetas de interface surgem com pop ao redor | 0,3 s por etiqueta |
| **Cor seletiva** | Foto P&B em que um único elemento fica colorido (sempre vermelho, amarelo ou azul da paleta) | estático |
| **Moldura** | Retrato de arquivo em moldura dourada (amarelo + vermelho-escuro) na parede bege | estático + zoom |

- Curva padrão: saída forte (`cubic-bezier(.2,.9,.1,1)`): chega rápido e assenta. Nada de ease-in-out suave e genérico.
- Elementos ilustrados se movem **"em dois"** (troca a cada 2 frames) para parecer feito à mão; texto e cortes ficam em 30 fps.
- Ritmo: cortes no tempo da música, segurar cada manchete por 0,8 a 1,5 s.

## 5. Textura e acabamento (sempre ligados)

1. Grão de papel animado (opacidade 8–14%).
1b. No registro Arquivo: linhas de varredura de TV (a cada 4 px) + leve tremulação de brilho, e separação de cor de 1–2 px nos textos.
2. Vinheta leve em `--tinta` nas bordas.
3. Retícula (halftone) nas áreas de sombra.
4. Bordas de forma levemente irregulares, como tinta de gravura.

## 6. Som (sugestão)

Percussão marcial e/ou ritmo brasileiro (surdo, alfaia), um baque de impacto em cada **carimbo** e uma batida de máquina de escrever na **datilografia**.

## 7. Não fazer

- Fontes arredondadas, script ou "tech".
- Gradiente, glow, lens flare, brilho neon, 3D brilhante.
- Fundo branco, preto puro ou paleta fora da tabela.
- Movimento flutuante/elástico de app; aqui o movimento é firme e decidido.
- Ficar o vídeo inteiro num registro só.
- Fotos coloridas inteiras no Arquivo (sempre P&B/sépia, com no máximo um elemento colorido).
- Fundo cinza-frio ou verde-azulado da referência: no lugar deles use bege e tinta.
