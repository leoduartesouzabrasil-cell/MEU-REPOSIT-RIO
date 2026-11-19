# Concerto das Nações

Jogo online de política brasileira, multijogador. É a evolução da [A Faixa](../jogo_a_faixa/README.md): reaproveita os partidos e as bancadas, os 27 estados e os projetos de lei do debate nacional. A interface segue o modelo dos jogos de grande estratégia: barra de recursos no topo, trilho de ícones, painel à esquerda, mapa no centro e diário à direita.

**Como jogar:** abra `concerto/index.html` por um servidor web (GitHub Pages, por exemplo). Sem o Supabase configurado, o jogo abre em **modo demonstração**: tudo fica no navegador e há jogadores-robô.

## Regras

- **Servidores.** Cada servidor é um Brasil próprio. Abrir um servidor é pago, e quem abre começa como **Presidente da República** daquele servidor. Entrar num servidor aberto é grátis: basta fazer login e criar o personagem (nome, partido e domicílio eleitoral).
- **Cargos dos jogadores:** deputado(a) estadual, deputado(a) federal e senador(a), sempre pelo estado do domicílio. As cadeiras são as reais: 513 deputados federais distribuídos por UF, 3 senadores por UF e deputados estaduais pela regra do art. 27 da Constituição (24 distritais no DF).
- **Governadores e prefeitos são os da vida real** (governadores eleitos em 2026; prefeitos das capitais no mandato 2025–2028). Não são jogáveis: aparecem no mapa, dão ou negam apoio a candidatos e sancionam ou vetam projetos das assembleias. Essas reações são **simulação** e o jogo avisa isso.
- **Candidatura.** Se houver vaga (cadeira que não está com um jogador), a posse é **imediata**. Se as cadeiras estiverem lotadas de jogadores, a candidatura vai às urnas na próxima eleição contra todos os ocupantes; vence quem tiver mais votos.
- **Eleições** a cada 6 meses de jogo, apuradas na virada do mês. O eleitorado é uma **população fictícia**: em cada estado, sete segmentos (trabalhadores formais, periferia, classe média, evangélicos, interior e agro, jovens, empresários), com peso por região e posição ideológica própria. O voto depende da fama do candidato no estado, da simpatia em cada segmento, da distância ideológica e de quem já ocupa a cadeira.
- **Campanha** gasta capital político (recarrega todo mês) e fundo de campanha: comício, TV e rádio, redes (pode viralizar ou virar gafe), visita a segmento, pedir apoio ao governador e arrecadar fundos.
- **Mandato:** discurso, emenda para o estado, propor projetos (do catálogo da A Faixa ou escritos pelo jogador) e votar. Câmara e Senado misturam os votos dos jogadores com as cadeiras restantes, que votam como as bancadas reais por afinidade ideológica. PEC precisa de 3/5 nas duas casas; PLP, maioria absoluta; PL, maioria simples. O presidente sanciona ou veta (sem decisão, há sanção tácita na virada).
- **Tempo:** o presidente vira o mês (fecha votações, apura eleições, move a economia) no máximo a cada 6 h reais. Se ele sumir, qualquer jogador pode virar o mês depois de 24 h.

## Arquivos

| Arquivo | O que é |
|---|---|
| `index.html` | página e estilos |
| `js/ui.js` | interface (login, salão de servidores, mapa, painéis) |
| `js/regras.js` | regras puras do jogo; rodam no navegador (demo) e na função do servidor |
| `js/api.js` | acesso aos dados: modo demonstração (localStorage) ou online (Supabase) |
| `js/dados.js` | cadeiras, eleitorado simulado, governadores e prefeitos reais, ações |
| `js/dados-faixa.js` | gerado da A Faixa por `ferramentas/gerar-dados-faixa.mjs` |
| `js/mapa-brasil.js` | contornos dos estados (@svg-maps/brazil, CC BY 4.0) |
| `js/config.js` | endereço do Supabase e texto do pagamento |
| `supabase/esquema.sql` | tabelas e regras de acesso (RLS) |
| `supabase/functions/jogo/` | função que aplica as jogadas com trava contra gravação simultânea |
| `FONTES.md` | fontes dos governadores e prefeitos |

## Colocar o jogo público no ar (servidor separado)

1. Crie um projeto novo no [Supabase](https://supabase.com) (o plano grátis serve para começar). É um projeto só do jogo, separado do site do Coletivo Lufã.
2. No **SQL Editor**, rode `supabase/esquema.sql`.
3. Em **Authentication → URL Configuration**, coloque o endereço do jogo em *Site URL* (ex.: `https://leoduartesouzabrasil-cell.github.io/MEU-REPOSIT-RIO/concerto/`).
4. Publique a função (precisa da [Supabase CLI](https://supabase.com/docs/guides/cli)):
   ```bash
   cd concerto
   ./ferramentas/sincronizar-funcao.sh
   supabase functions deploy jogo --project-ref SEU_PROJETO
   ```
5. Em `js/config.js`, preencha `SUPABASE_URL` e `SUPABASE_ANON_KEY` (em *Project Settings → API*) e os dados do pagamento.
6. Publique a pasta: no GitHub, *Settings → Pages*, escolha a branch. O jogo fica em `.../concerto/`.
7. Crie sua conta no jogo e torne-se administrador (SQL Editor):
   ```sql
   insert into public.admins (id) select id from auth.users where email = 'SEU-EMAIL';
   ```

### Pagamento dos servidores
Nesta versão o pagamento é conferido à mão. O servidor nasce "aguardando pagamento" (no máximo 3 pendentes por pessoa), o jogo mostra o valor e a chave Pix de `config.js`, e o administrador clica em **Liberar** na área de administração do salão. A cobrança automática (Mercado Pago ou Stripe, com webhook liberando o servidor) é o próximo passo.

## Testes

```bash
node concerto/ferramentas/teste-regras.mjs    # simula candidaturas, campanha, votação e eleição
```

## Próximos passos sugeridos
- Cobrança automática (Pix/cartão) com liberação por webhook.
- Partidos criados por jogadores, coligações, lideranças de bancada e cargos de mesa (presidente da Câmara/Senado).
- Ministérios da A Faixa no modo online (o presidente nomeia jogadores).
- Chat por servidor e por casa legislativa.
- Fotos com licença livre das autoridades reais (Agência Brasil, Wikimedia Commons), com crédito.
