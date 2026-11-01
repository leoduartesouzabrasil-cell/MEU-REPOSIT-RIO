# Renan Santos: da "direita" para a extrema direita

Vídeo vertical de 30 s (1080x1920, 30 fps), gerado por `gerar_video_renan.py`.
Usa o mesmo estilo "documentário editorial" do vídeo da 6x1 (veja
`../video_escala_6x1/ESTILO.md`) e reaproveita os efeitos de `efeitos_sonoros.py`.

É a continuação do vídeo da "esquerda cirandeira". Na régua daquele vídeo, Renan
Santos ficou na seção "direita". Os comentários do post apontaram que o lugar dele
é a extrema direita, e este vídeo corrige a régua.

## Roteiro (tela por tela)

| Tempo | Fundo | Texto |
|---|---|---|
| 0,0 – 1,4 | preto | LEMBRA DA RÉGUA? |
| 1,4 – 3,0 | papel | aquela do vídeo da *esquerda cirandeira* |
| 3,0 – 5,6 | papel | régua com o marcador "RENAN SANTOS" em *direita* (seleção azul) |
| 5,6 – 7,6 | preto | mas nos comentários... (3 cartões de comentário) |
| 7,6 – 9,0 | preto | E VOCÊS TINHAM RAZÃO. |
| 9,0 – 10,6 | patente | QUEM É RENAN SANTOS? (digitado) |
| 10,6 – 12,2 | papel | cofundador do **MBL** e líder do partido **MISSÃO** |
| 12,2 – 14,2 | papel | ficha 2017: campanha do MBL contra a exposição Queermuseu |
| 14,2 – 16,2 | papel | ficha 2018: Facebook remove rede de páginas ligadas ao MBL |
| 16,2 – 18,0 | patente | no discurso, a política vira GUERRA / INIMIGOS / MÃO DE FERRO |
| 18,0 – 19,6 | preto | ISSO NÃO É DIREITA MODERADA. |
| 19,6 – 22,6 | papel | régua corrigida: o "direita" é riscado e o marcador vai para *extrema direita* |
| 22,6 – 24,2 | papel | trocar o grito pelo terno, e pelo partido novo |
| 24,2 – 25,8 | patente | NÃO MUDA O LUGAR na régua. |
| 25,8 – 28,2 | papel | moldura dourada "a mesma régua": que mede a esquerda cirandeira mede a direita também |
| 28,2 – 30,0 | preto | E VOCÊ, ONDE COLOCARIA? |

## Som

Uma cama grave em tom menor com pulsação dupla, como um batimento. Ela substitui o
relógio da 6x1, que era específico daquele tema. Por cima ficam os mesmos efeitos
de antes: estalo nos cortes, teclas no texto digitado, blips nos rótulos, "pop" nos
comentários, risco de caneta e sino no final.

## Antes de postar: confira os fatos

As fichas citam fatos que foram noticiados. Mesmo assim, vale conferir as fontes e
deixá-las na legenda do post:

- **2017, Queermuseu:** o MBL fez campanha contra a exposição no Santander Cultural,
  em Porto Alegre, e o banco encerrou a mostra antes do previsto.
- **2018, Facebook:** em julho de 2018, o Facebook removeu uma rede de páginas e perfis
  ligados ao MBL. A empresa citou contas falsas e desinformação.
- **"Líder do partido Missão":** confira o cargo atual de Renan Santos no partido.
- **"Guerra / inimigos / mão de ferro":** essa tela é uma leitura crítica do discurso
  dele, não uma citação literal.
- **Comentários:** os cartões resumem o que foi dito no post. Não são prints.

## Como gerar

```bash
python3 gerar_video_renan.py                    # gera renan_santos_extrema_direita.mp4
python3 gerar_video_renan.py --previa <pasta>   # salva um PNG de cada plano na pasta
```
