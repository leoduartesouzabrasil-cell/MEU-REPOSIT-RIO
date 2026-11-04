# Protocolo de pesquisa — fatos e imagens para os vídeos

Todo vídeo sobre um tema real (pessoa, fato, data, número) passa por esta pesquisa **antes** do roteiro.
A pesquisa é feita automaticamente pelo Claude com a busca na web (`WebSearch`), restrita aos domínios abaixo.

## 1. Fatos e números

**Fontes primárias (preferir):**
- Governo e dados oficiais: `gov.br`, `planalto.gov.br`, `ibge.gov.br`, `ipea.gov.br`, `tse.jus.br`, `stf.jus.br`, `senado.leg.br`, `camara.leg.br`, `in.gov.br` (Diário Oficial), `bcb.gov.br`
- Agência pública: `agenciabrasil.ebc.com.br`

**Imprensa (para confirmar e dar contexto):** `g1.globo.com`, `folha.uol.com.br`, `estadao.com.br`, `bbc.com/portuguese`, `reuters.com`, `apnews.com`, `cartacapital.com.br`, `brasildefato.com.br`, `aosfatos.org`, `lupa.uol.com.br`

Regras:
- Todo número, data ou citação no vídeo precisa de **2 fontes independentes**, ou de 1 fonte primária oficial.
- Citação entre aspas só se for literal e com a fonte da fala. Na dúvida, parafrasear.
- Fato que só aparece em blog, rede social ou site partidário não entra.
- Anotar tudo em `midia/<tema>/FONTES.md` (afirmação → links), para conferir antes de publicar.
- Lembrar que o vídeo é opinativo na forma (estética de cartaz), mas **os fatos dentro dele precisam estar certos**.

## 2. Imagens

Só imagens com licença que permite reuso, sempre com crédito:

| Fonte | Licença | Observação |
|---|---|---|
| Agência Brasil (`agenciabrasil.ebc.com.br/foto/...`) | CC BY 3.0 BR | Melhor fonte para Lula, governo, Brasília, movimentos sociais. Baixa até 770 px de largura. |
| Wikimedia Commons (`commons.wikimedia.org/wiki/File:...`) | varia por arquivo (o script lê a licença real) | Ótimo para fotos históricas e domínio público. Às vezes bloqueia por excesso de acesso: tentar depois. |
| Agência Senado / Agência Câmara | uso livre com crédito | Sessões, votações, parlamentares. |

**Nunca usar** fotos de jornais, revistas, Getty, Reuters, AP, bancos de imagem ou do Google Imagens diretamente: são protegidas.

Como baixar (registra autor, licença e origem em `midia/<tema>/CREDITOS.md`):

```
python3 pesquisa/baixar_imagem.py <url-da-página-da-foto> <tema> [nome-do-arquivo]
```

No vídeo:
- Fotos entram pelo registro ARQUIVO: P&B/sépia, retícula, moldura, foco entrando (`L.foto`).
- O crédito aparece na tela em Special Elite pequeno, num canto ("Foto: Bruno Peres / Agência Brasil"), durante a foto, ou nos créditos finais.
- Fotos de baixa resolução: usar menores (moldura, recorte), nunca em tela cheia esticada.
