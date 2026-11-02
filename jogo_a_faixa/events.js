// =====================================================================
// A FAIXA — eventos
// Agendados (calendário político real) e aleatórios (crises e oportunidades)
// Cada opção: { txt, fx, res }  — fx segue o formato de applyFx() em game.js
// =====================================================================

const pick = a => a[Math.floor(Math.random()*a.length)];

const EVENTOS_AGENDADOS = [
  { t:0, id:'posse', cat:'Política', titulo:'Posse no Congresso Nacional',
    texto:s=>`5 de janeiro de 2027, primeira posse na nova data fixada pela EC 111/2021. Depois de subir a rampa do Planalto e receber a faixa, ${s.pres.nome} faz o primeiro discurso como presidente. O tom vai marcar os primeiros 100 dias.`,
    opcoes:[
      { txt:'Discurso de pacificação e diálogo com a oposição', fx:{ aprov:3, party:{all:5}, grp:{imprensa:5, mercado:3} }, res:'A oposição reconhece o gesto. A lua de mel começa morna, mas sem atritos.' },
      { txt:'Discurso firme: mandato das urnas para mudar o país', fx:{ aprov:5, party:{opos:-8}, grp:{movsociais:5, evangelicos:2} }, res:'A base vibra. A oposição promete resistência desde o primeiro dia.' },
      { txt:'Foco na economia: responsabilidade fiscal e crescimento', fx:{ aprov:1, grp:{mercado:10, industria:5}, eco:{conf:6, dolarPct:-1.5} }, res:'O dólar recua no primeiro pregão do ano.' },
    ]},
  { t:1, id:'mesas', cat:'Congresso', titulo:'Eleição das Mesas da Câmara e do Senado',
    texto:'Fevereiro de 2027: a nova legislatura toma posse e termina o biênio de Hugo Motta (Republicanos-PB) na Câmara e de Davi Alcolumbre (União-AP) no Senado. Os novos presidentes controlarão a pauta por dois anos. O Centrão tem candidato forte; seu partido quer lançar nome próprio.',
    opcoes:[
      { txt:'Apoiar o candidato do Centrão (União/PP/Republicanos)', fx:{ presCamara:20, party:{'União':10,'PP':10,'Republicanos':8}, party2:{own:-6} }, res:'O candidato do Centrão vence com folga e promete "pauta de governabilidade", com preço.' },
      { txt:'Lançar candidato do seu partido', fx:{ custom:'mesaPropria' }, res:'' },
      { txt:'Ficar neutro', fx:{ presCamara:-5 }, res:'Vence um nome independente, que não deve nada ao Planalto.' },
    ]},
  { t:3, id:'ldo27', cat:'Orçamento', titulo:'Projeto da LDO 2028: meta fiscal',
    texto:'Até 15 de abril o Executivo envia a Lei de Diretrizes Orçamentárias. O mercado observa a meta de resultado primário prevista no arcabouço fiscal.',
    opcoes:[
      { txt:'Manter a meta (+0,5% do PIB)', fx:{ meta:0.5, grp:{mercado:3} }, res:'Meta mantida. Credibilidade preservada.' },
      { txt:'Endurecer (+1,0% do PIB) e contingenciar', fx:{ meta:1.0, grp:{mercado:10, movsociais:-6, governadores:-4}, eco:{primario:0.2, conf:6, pibShock:-0.15} }, res:'A Faria Lima aplaude. Ministros reclamam de cortes.' },
      { txt:'Flexibilizar (0% do PIB) para investir', fx:{ meta:0.0, grp:{mercado:-12, industria:4, governadores:5}, eco:{primario:-0.2, conf:-10, dolarPct:3} }, res:'"Mudança de meta" vira manchete e os juros futuros disparam.' },
    ]},
  { t:7, id:'loa27', cat:'Orçamento', titulo:'Proposta de Orçamento 2028 (PLOA)',
    texto:'Até 31 de agosto o governo envia o Orçamento. A margem discricionária é estreita: emendas parlamentares impositivas já consomem uma fatia recorde. Qual será a prioridade?',
    opcoes:[
      { txt:'Saúde: mais recursos para o SUS', fx:{ mod:{saude:0.04}, grp:{governadores:4}, aprov:1 }, res:'Hospitais e mutirões ganham reforço.' },
      { txt:'Educação: escolas em tempo integral', fx:{ mod:{educ:0.04}, grp:{sindicatos:3} }, res:'Prefeitos comemoram verbas do Fundeb.' },
      { txt:'Segurança: Força Nacional e inteligência', fx:{ mod:{homic:-0.02}, grp:{militares:4, governadores:3} }, res:'Mais efetivo e tecnologia para as polícias.' },
      { txt:'Infraestrutura: Novo PAC', fx:{ mod:{infra:0.04, potencial:0.03}, grp:{industria:5, governadores:5} }, res:'Obras paradas são retomadas.' },
    ]},
  { t:8, id:'onu27', cat:'Internacional', titulo:'Abertura da Assembleia Geral da ONU',
    texto:'Por tradição desde 1955, o Brasil faz o primeiro discurso do debate geral em Nova York. Qual será o tema central?',
    opcoes:[
      { txt:'Clima e Amazônia', fx:{ rel:{UE:5, China:2}, grp:{ambientalistas:6, agro:-3}, aprov:1 }, res:'Discurso aplaudido em plenário.' },
      { txt:'Reforma do Conselho de Segurança e multipolaridade', fx:{ rel:{China:4, Russia:4, India:5, AfricaSul:4, EUA:-4} }, res:'O Sul Global ecoa a fala; Washington torce o nariz.' },
      { txt:'Combate à fome e à desigualdade', fx:{ rel:{AfricaSul:4, India:2, UE:2}, grp:{movsociais:5}, aprov:1 }, res:'A Aliança Global contra a Fome ganha adesões.' },
      { txt:'Soberania, comércio livre e parceria com o Ocidente', fx:{ rel:{EUA:7, UE:3, China:-4, Russia:-5}, grp:{mercado:3} }, res:'Sinalização bem recebida pelo Departamento de Estado.' },
    ]},
  { t:9, id:'argentina27', cat:'Internacional', titulo:'Eleição presidencial na Argentina',
    texto:s=>`Outubro de 2027: os argentinos vão às urnas. ${s.flags.argEsq ? 'O candidato peronista' : 'O candidato da situação'} lidera. Como o Planalto se posiciona?`,
    pre:s=>{ s.flags.argEsq = Math.random()<0.45; },
    opcoes:[
      { txt:'Neutralidade estrita: "assunto interno argentino"', fx:{ rel:{Argentina:4}, grp:{imprensa:2} }, res:'O Itamaraty mantém a tradição de não ingerência.' },
      { txt:'Sinalizar simpatia pelo candidato mais próximo do seu campo', fx:{ custom:'argentinaApoio' }, res:'' },
      { txt:'Propor relançamento do Mercosul a quem vencer', fx:{ rel:{Argentina:6, Uruguai:3, Paraguai:3}, grp:{industria:3} }, res:'A proposta de agenda comum agrada Montevidéu e Assunção.' },
    ]},
  { t:10, id:'cop27', cat:'Internacional', titulo:'Conferência do Clima da ONU (COP)',
    texto:'Depois de sediar a COP30 em Belém, em 2025, o Brasil é cobrado a mostrar resultados. Qual compromisso levar?',
    opcoes:[
      { txt:'Meta de desmatamento zero até 2030', fx:{ mod:{desmat:-0.03}, rel:{UE:6, China:2}, grp:{ambientalistas:10, agro:-8} }, res:'Compromisso ambicioso; o agro fala em "imposição externa".' },
      { txt:'Fundo Florestas Tropicais para Sempre (TFFF)', fx:{ rel:{UE:4, Golfo:4, China:3}, grp:{ambientalistas:5}, eco:{conf:2} }, res:'Novos aportes de países do Golfo e da Noruega.' },
      { txt:'Defender a exploração de petróleo para financiar a transição', fx:{ rel:{UE:-5, Golfo:5}, grp:{ambientalistas:-10, industria:4} }, res:'Ativistas protestam do lado de fora do pavilhão brasileiro.' },
    ]},
  { t:15, id:'stf1', cat:'Judiciário', titulo:'Vaga no Supremo Tribunal Federal',
    texto:'Abril de 2028: o ministro Luiz Fux completa 75 anos e se aposenta compulsoriamente. Cabe a você indicar o substituto, que passa por sabatina no Senado (41 votos).',
    opcoes:[
      { txt:'Jurista técnico respeitado, sem filiação', fx:{ grp:{judiciario:8, imprensa:5}, stf:8 }, res:'Aprovação tranquila na CCJ do Senado.' },
      { txt:'Aliado político de confiança', fx:{ grp:{judiciario:-6, imprensa:-8}, stf:14, party:{own:6} }, res:'Críticas de "aparelhamento", mas um voto seguro no plenário do STF.' },
      { txt:'Jurista evangélico conservador', fx:{ grp:{evangelicos:14, movsociais:-8, judiciario:-2}, stf:4, party:{'Republicanos':8,'PL':4} }, res:'A bancada da Bíblia comemora.' },
      { txt:'Primeira jurista negra do STF', fx:{ grp:{movsociais:12, imprensa:6, judiciario:4}, stf:6, aprov:2 }, res:'Indicação histórica, elogiada por entidades de todo o país.' },
    ]},
  { t:18, id:'olimpiadas', cat:'Sociedade', titulo:'Jogos Olímpicos de Los Angeles',
    texto:'Julho de 2028. O Time Brasil vai a Los Angeles com expectativa recorde no skate, surfe, judô, ginástica e vôlei. O governo pode aproveitar o momento.',
    opcoes:[
      { txt:'Anunciar programa Bolsa Atleta ampliado', fx:{ custom:'olimpiadas', eco:{gasto:0.01} }, res:'' },
      { txt:'Apenas acompanhar e parabenizar os atletas', fx:{ custom:'olimpiadas' }, res:'' },
    ]},
  { t:21, id:'municipais', cat:'Eleições', titulo:'Eleições municipais de 2028',
    texto:'Outubro de 2028: 5.570 municípios elegem prefeitos e vereadores. O resultado vai redesenhar a força dos partidos para 2030. Como o presidente participa?',
    opcoes:[
      { txt:'Subir em palanques pelo país', fx:{ custom:'municipais', k:1.6 }, res:'' },
      { txt:'Apoiar apenas em capitais estratégicas', fx:{ custom:'municipais', k:1.0 }, res:'' },
      { txt:'Manter-se acima da disputa', fx:{ custom:'municipais', k:0.5, party:{all:3} }, res:'' },
    ]},
  { t:23, id:'bc', cat:'Economia', titulo:'Novo presidente do Banco Central',
    texto:'O mandato do presidente do Banco Central termina em 31 de dezembro de 2028. Pela Lei de Autonomia, cabe a você indicar o sucessor para um mandato até 2032.',
    opcoes:[
      { txt:'Economista ortodoxo de mercado', fx:{ bc:1.2, grp:{mercado:12}, eco:{conf:6, dolarPct:-2} }, res:'Juros futuros caem com a indicação.' },
      { txt:'Diretor de carreira, perfil técnico moderado', fx:{ bc:1.0, grp:{mercado:4} }, res:'Transição sem sobressaltos.' },
      { txt:'Economista desenvolvimentista alinhado ao governo', fx:{ bc:0.75, grp:{mercado:-14, industria:6, sindicatos:6}, eco:{conf:-8, dolarPct:4, inflShock:0.3} }, res:'O mercado teme perda de autonomia; expectativas de inflação sobem.' },
    ]},
  { t:27, id:'stf2', cat:'Judiciário', titulo:'Nova vaga no STF',
    texto:'Abril de 2029: a ministra Cármen Lúcia se aposenta aos 75 anos. É a segunda indicação do mandato.',
    opcoes:[
      { txt:'Indicar uma jurista técnica', fx:{ grp:{judiciario:8, imprensa:5, movsociais:4}, stf:7 }, res:'A sabatina passa com folga.' },
      { txt:'Indicar o atual Advogado-Geral da União', fx:{ grp:{judiciario:-3, imprensa:-5}, stf:12 }, res:'Aliado de confiança na Corte.' },
      { txt:'Negociar a vaga com o Centrão em troca de apoio', fx:{ grp:{judiciario:-8, imprensa:-10}, stf:2, party:{base:10}, presCamara:10 }, res:'O apoio no Congresso melhora; a imprensa fala em "balcão".' },
    ]},
  { t:39, id:'desincomp', cat:'Política', titulo:'Desincompatibilização: ministros deixam o governo',
    texto:'Abril de 2030: quem vai disputar as eleições de outubro precisa deixar o cargo seis meses antes. Vários ministros políticos anunciam saída.',
    opcoes:[
      { txt:'Substituir por técnicos e secretários-executivos', fx:{ custom:'desincomp', modo:'tec' }, res:'' },
      { txt:'Pedir que fiquem e abram mão de candidaturas', fx:{ custom:'desincomp', modo:'fica' }, res:'' },
    ]},
  { t:41, id:'copa2030', cat:'Sociedade', titulo:'Copa do Mundo de 2030',
    texto:'Junho de 2030: a Copa do Centenário começa com jogos na Espanha, em Portugal, no Marrocos e partidas comemorativas na América do Sul. O país para.',
    opcoes:[
      { txt:'Decretar ponto facultativo em dias de jogo do Brasil', fx:{ custom:'copa', eco:{pibShock:-0.05} }, res:'' },
      { txt:'Expediente normal', fx:{ custom:'copa' }, res:'' },
    ]},
  { t:43, id:'campanha', cat:'Eleições', titulo:'Campanha à reeleição',
    texto:'Agosto de 2030: começa oficialmente a campanha. Qual é a sua estratégia rumo a outubro?',
    opcoes:[
      { txt:'Defender o legado com dados e entregas', fx:{ custom:'campanha', modo:'legado' }, res:'' },
      { txt:'Ampliar alianças com o Centrão e governadores', fx:{ custom:'campanha', modo:'aliancas' }, res:'' },
      { txt:'Polarizar contra o adversário', fx:{ custom:'campanha', modo:'polarizar' }, res:'' },
      { txt:'Não disputar a reeleição', fx:{ custom:'campanha', modo:'desistir' }, res:'' },
    ]},
];

// Eventos anuais repetidos (salário mínimo, LDO, LOA, ONU, COP) — gerados para cada ano
function eventosAnuais(t){
  const m = t%12, ano = 2027 + Math.floor(t/12);
  const out = [];
  if (m===0) out.push({ id:'sm'+ano, cat:'Economia', titulo:`Reajuste do salário mínimo ${ano}`,
    texto:s=>`Decreto de janeiro. Pela regra em vigor, o reajuste é a inflação (INPC) mais o crescimento do PIB de dois anos antes, limitado ao arcabouço. O salário mínimo hoje é de R$ ${s.soc.salmin.toLocaleString('pt-BR')}.`,
    opcoes:[
      { txt:'Seguir a regra (inflação + ganho real limitado)', fx:{ custom:'salmin', real:2.0 }, res:'' },
      { txt:'Aumento acima da regra (+5% real)', fx:{ custom:'salmin', real:5.0, grp:{sindicatos:10, mercado:-10, governadores:-4}, eco:{primario:-0.12, inflShock:0.25, pibShock:0.15}, aprov:3 }, res:'' },
      { txt:'Só repor a inflação', fx:{ custom:'salmin', real:0, grp:{sindicatos:-10, mercado:6}, eco:{primario:0.05}, aprov:-2 }, res:'' },
    ]});
  if (m===3 && t>3) out.push({ id:'ldo'+ano, cat:'Orçamento', titulo:`LDO ${ano+1}: meta fiscal`,
    texto:s=>`O resultado primário atual é ${fmtPct(s.eco.primario)} do PIB e a dívida bruta está em ${s.eco.divida.toFixed(1)}%. Que meta enviar ao Congresso para ${ano+1}?`,
    opcoes:[
      { txt:'Manter a trajetória do arcabouço', fx:{ meta:'+0.25', grp:{mercado:4} }, res:'Sinal de continuidade.' },
      { txt:'Meta mais dura, com contingenciamento', fx:{ meta:'+0.5', grp:{mercado:10, movsociais:-6}, eco:{primario:0.2, conf:5, pibShock:-0.15} }, res:'Cortes atingem ministérios.' },
      { txt:'Reduzir a meta para abrir espaço a investimento', fx:{ meta:'-0.25', grp:{mercado:-10, governadores:4}, eco:{primario:-0.15, conf:-8, dolarPct:2.5} }, res:'Prêmio de risco sobe.' },
    ]});
  if (m===8 && t>8) out.push({ id:'onu'+ano, cat:'Internacional', titulo:`Assembleia Geral da ONU ${ano}`,
    texto:'O Brasil abre novamente o debate geral. Qual será a mensagem?',
    opcoes:[
      { txt:'Clima e florestas', fx:{ rel:{UE:4}, grp:{ambientalistas:4} }, res:'Mensagem reforçada.' },
      { txt:'Paz: Brasil como mediador de conflitos', fx:{ rel:{China:2, India:2, Russia:2, EUA:-1, UE:1}, grp:{imprensa:2} }, res:'Proposta de grupo de países amigos da paz.' },
      { txt:'Comércio justo e contra o protecionismo', fx:{ rel:{China:3, EUA:-3}, grp:{agro:4, industria:2} }, res:'Recado direto às tarifas unilaterais.' },
    ]});
  if (m===10 && t>10) out.push({ id:'prodes'+ano, cat:'Ambiente', titulo:`Dado anual do desmatamento (Prodes ${ano})`,
    texto:s=>`O Inpe divulga a taxa consolidada: ${Math.round(s.soc.desmat).toLocaleString('pt-BR')} km² desmatados na Amazônia Legal nos últimos 12 meses. Como o governo reage?`,
    opcoes:[
      { txt:'Operação conjunta Ibama-PF-Força Nacional', fx:{ mod:{desmat:-0.03}, eco:{gasto:0.02}, grp:{ambientalistas:6, agro:-4} }, res:'Embargos e apreensões sobem.' },
      { txt:'Programa de pagamento por serviços ambientais', fx:{ mod:{desmat:-0.02}, eco:{primario:-0.03}, grp:{ambientalistas:4, agro:3} }, res:'Produtores aderem ao programa.' },
      { txt:'Priorizar regularização fundiária', fx:{ mod:{desmat:0.01}, grp:{agro:8, ambientalistas:-6} }, res:'O agro elogia "segurança jurídica".' },
    ]});
  return out;
}

// =====================================================================
// Eventos aleatórios
// cond(s) => bool | peso | unico | cooldown (meses)
// =====================================================================
const EVENTOS_ALEATORIOS = [
  { id:'petroleo', cat:'Economia', peso:3, cooldown:14, titulo:'Disparada do petróleo',
    texto:'Tensão no Estreito de Ormuz leva o barril de Brent acima de US$ 110. A Petrobras precisa decidir se repassa o aumento para gasolina e diesel.',
    opcoes:[
      { txt:'Repassar integralmente (paridade internacional)', fx:{ eco:{inflShock:0.7}, aprov:-4, grp:{mercado:6} }, res:'Gasolina sobe 12% nas bombas.' },
      { txt:'Segurar preços com a Petrobras', fx:{ eco:{inflShock:0.2, conf:-6}, grp:{mercado:-10}, aprov:1 }, res:'Ações da estatal caem 9%.' },
      { txt:'Zerar PIS/Cofins do diesel temporariamente', fx:{ eco:{inflShock:0.35, gasto:0.12}, grp:{agro:4, mercado:-3}, aprov:-1 }, res:'Caminhoneiros aliviados; Tesouro perde arrecadação.' },
    ]},
  { id:'caminhoneiros', cat:'Economia', peso:2, cooldown:20, cond:s=>s.eco.ipca>4.5, titulo:'Greve dos caminhoneiros',
    texto:'Bloqueios em 19 estados contra o preço do diesel e o valor do frete. Postos e supermercados começam a ficar desabastecidos.',
    opcoes:[
      { txt:'Negociar tabela de frete mínimo e subsídio ao diesel', fx:{ eco:{gasto:0.08, inflShock:0.1}, aprov:-1, grp:{mercado:-5, agro:-3} }, res:'Greve encerrada em 4 dias.' },
      { txt:'Acionar a PRF e a Justiça para desbloquear rodovias', fx:{ aprov:-3, eco:{pibShock:-0.3, inflShock:0.2}, grp:{militares:3, comercio:4} }, res:'Confrontos pontuais; estradas liberadas em uma semana.' },
      { txt:'Esperar o movimento perder força', fx:{ aprov:-6, eco:{pibShock:-0.6, inflShock:0.35} }, res:'Dez dias de paralisação derrubam a atividade.' },
    ]},
  { id:'tarifaco', cat:'Internacional', peso:3, cooldown:14, cond:s=>s.rel.EUA<55, titulo:'Tarifaço americano',
    texto:'A Casa Branca anuncia sobretaxa de 40% sobre aço, carne, café e suco de laranja brasileiros, citando "práticas desleais" e decisões judiciais no Brasil.',
    opcoes:[
      { txt:'Retaliar com base na Lei de Reciprocidade', fx:{ rel:{EUA:-12, China:4}, aprov:4, grp:{agro:-6, industria:-6, mercado:-6}, eco:{pibShock:-0.3, inflShock:0.15} }, res:'Discurso de soberania rende apoio interno.' },
      { txt:'Negociar no USTR e oferecer contrapartidas (etanol, big techs)', fx:{ rel:{EUA:8}, grp:{agro:4, mercado:4, imprensa:-2}, eco:{pibShock:-0.1} }, res:'Parte dos produtos sai da lista após 2 meses.' },
      { txt:'Linha de crédito para exportadores afetados', fx:{ eco:{gasto:0.1, pibShock:-0.15}, grp:{agro:6, industria:6} }, res:'R$ 30 bi em crédito via BNDES e fundo garantidor.' },
    ]},
  { id:'rating', cat:'Economia', peso:4, cooldown:10, cond:s=>s.eco.divida>84 || s.eco.primario< -0.6, titulo:'Agência de risco ameaça rebaixar o Brasil',
    texto:s=>`Com dívida bruta em ${s.eco.divida.toFixed(1)}% do PIB, uma das três grandes agências coloca a nota do país em perspectiva negativa.`,
    opcoes:[
      { txt:'Anunciar contingenciamento imediato de R$ 25 bi', fx:{ eco:{primario:0.2, conf:8, pibShock:-0.15}, grp:{mercado:8, governadores:-4, movsociais:-5}, aprov:-2 }, res:'A agência mantém a nota por ora.' },
      { txt:'Contestar a metodologia da agência', fx:{ custom:'rebaixamento' }, res:'' },
    ]},
  { id:'upgrade', cat:'Economia', peso:3, unico:true, cond:s=>s.eco.primario>0.4 && s.eco.divida<82 && s.t>12, titulo:'Grau de investimento à vista',
    texto:'Com superávit primário consistente, a Moody\'s eleva a nota do Brasil a um degrau do grau de investimento.',
    opcoes:[ { txt:'Celebrar em coletiva com a equipe econômica', fx:{ grp:{mercado:15, imprensa:4}, eco:{conf:12, dolarPct:-5}, aprov:2 }, res:'Bolsa bate recorde; dólar cai.' } ]},
  { id:'safra', cat:'Economia', peso:3, cooldown:12, titulo:'Safra recorde de grãos',
    texto:'A Conab projeta safra recorde de soja e milho. Os preços dos alimentos devem recuar.',
    opcoes:[
      { txt:'Visitar a colheita no Mato Grosso', fx:{ eco:{pibShock:0.3, inflShock:-0.3}, grp:{agro:8}, reg:{CO:4} }, res:'Foto com colheitadeiras viraliza.' },
      { txt:'Anunciar estoques reguladores da Conab', fx:{ eco:{pibShock:0.25, inflShock:-0.4, gasto:0.03}, grp:{agro:2, movsociais:3} }, res:'Preços do arroz e feijão estabilizam.' },
    ]},
  { id:'alimentos', cat:'Economia', peso:3, cooldown:10, titulo:'Preço dos alimentos dispara',
    texto:'Clima extremo derruba a produção de café, carne e hortaliças. A inflação de alimentos em domicílio passa de 9% em 12 meses.',
    opcoes:[
      { txt:'Zerar imposto de importação de alimentos', fx:{ eco:{inflShock:-0.15, gasto:0.02}, grp:{agro:-6}, aprov:1 }, res:'Efeito modesto nas gôndolas.' },
      { txt:'Pressionar supermercados publicamente', fx:{ aprov:1, grp:{comercio:-8, mercado:-4}, eco:{inflShock:0.25} }, res:'Grande repercussão, pouco efeito nos preços.' },
      { txt:'Deixar o mercado se ajustar', fx:{ aprov:-3, eco:{inflShock:0.4} }, res:'Alimentos pesam no bolso; aprovação cai entre os mais pobres.' },
    ]},
  { id:'apagao', cat:'Infraestrutura', peso:2, cooldown:18, titulo:'Apagão atinge 25 estados',
    texto:'Falha em linha de transmissão derruba o sistema interligado por 4 horas. Hospitais e metrôs param.',
    opcoes:[
      { txt:'Demitir a cúpula do ONS e auditar o setor', fx:{ aprov:1, grp:{mercado:-2} }, res:'Resposta enérgica bem recebida.' },
      { txt:'Antecipar leilão de transmissão bilionário', fx:{ mod:{infra:0.02}, grp:{mercado:5, industria:3}, eco:{conf:2} }, res:'Investidores disputam os lotes.' },
      { txt:'Culpar a privatização da Eletrobras', fx:{ aprov:-1, grp:{mercado:-8, sindicatos:5} }, res:'Embate político, sem solução técnica.' },
    ]},
  { id:'crisehidrica', cat:'Infraestrutura', peso:2, cooldown:24, titulo:'Reservatórios no limite',
    texto:'Seca histórica derruba os reservatórios do Sudeste/Centro-Oeste para 25%. A Aneel sugere bandeira vermelha patamar 2 e termelétricas ligadas.',
    opcoes:[
      { txt:'Acionar térmicas e bandeira vermelha', fx:{ eco:{inflShock:0.45}, aprov:-3 }, res:'Conta de luz sobe 18%.' },
      { txt:'Programa de bônus para quem economizar energia', fx:{ eco:{inflShock:0.2, gasto:0.05}, aprov:-1, grp:{industria:-3} }, res:'Consumo cai 6%.' },
    ]},
  { id:'enchentes', cat:'Desastre', peso:2, cooldown:18, titulo:'Enchentes devastadoras no Sul',
    texto:'Chuvas extremas deixam centenas de milhares de desalojados no Rio Grande do Sul e em Santa Catarina. Cidades inteiras estão submersas.',
    opcoes:[
      { txt:'Crédito extraordinário de R$ 50 bi fora da meta', fx:{ eco:{gasto:0.35, pibShock:-0.2}, reg:{S:8}, aprov:3, grp:{governadores:8, mercado:-4} }, res:'Pix para famílias e reconstrução de pontes.' },
      { txt:'Mobilizar Forças Armadas e Defesa Civil, com recursos do Orçamento', fx:{ eco:{gasto:0.12, pibShock:-0.3}, reg:{S:3}, grp:{militares:6} }, res:'Resgates heroicos; reconstrução lenta.' },
      { txt:'Transferir recursos e deixar a gestão com o estado', fx:{ eco:{gasto:0.08, pibShock:-0.35}, reg:{S:-6}, aprov:-3, grp:{governadores:-4} }, res:'Críticas de ausência do governo federal.' },
    ]},
  { id:'secaamazonia', cat:'Desastre', peso:2, cooldown:18, titulo:'Seca extrema na Amazônia',
    texto:'Rios Negro e Solimões atingem níveis mínimos históricos. Comunidades ribeirinhas isoladas; incêndios se espalham.',
    opcoes:[
      { txt:'Operação humanitária e brigadas de incêndio', fx:{ eco:{gasto:0.04}, reg:{N:5}, grp:{ambientalistas:5} }, res:'Ajuda chega a 600 mil pessoas.' },
      { txt:'Pedir cooperação internacional', fx:{ rel:{UE:4, EUA:2}, reg:{N:2}, grp:{militares:-3} }, res:'Aviões de combate a incêndio chegam de outros países.' },
    ]},
  { id:'dengue', cat:'Saúde', peso:3, cooldown:12, titulo:'Epidemia de dengue',
    texto:'Casos de dengue batem recorde; capitais decretam emergência. A vacina do Butantan ainda está em expansão.',
    opcoes:[
      { txt:'Antecipar vacinação em massa', fx:{ eco:{gasto:0.04}, mod:{saude:0.01}, aprov:2 }, res:'Milhões vacinados em 2 meses.' },
      { txt:'Mutirões de combate ao mosquito com o Exército', fx:{ grp:{militares:3}, aprov:1 }, res:'Ação visível, efeito parcial.' },
      { txt:'Deixar a resposta com estados e municípios', fx:{ aprov:-3, grp:{governadores:-5}, idx:{saude:-2} }, res:'Hospitais lotados viram manchete.' },
    ]},
  { id:'pandemia', cat:'Saúde', peso:1, unico:true, cond:s=>s.t>6, titulo:'Novo vírus respiratório',
    texto:'A OMS declara emergência internacional por um novo vírus respiratório. Os primeiros casos chegam ao Brasil por Guarulhos.',
    opcoes:[
      { txt:'Restrições sanitárias rápidas e testagem em massa', fx:{ eco:{pibShock:-0.8, gasto:0.2}, idx:{saude:2}, aprov:2, grp:{comercio:-10, judiciario:4} }, res:'Curva controlada; comércio sofre.' },
      { txt:'Vigilância sem restrições à economia', fx:{ eco:{pibShock:-0.3}, idx:{saude:-5}, aprov:-5, grp:{comercio:4, imprensa:-8} }, res:'Hospitais sob pressão.' },
    ]},
  { id:'faccao', cat:'Segurança', peso:3, cooldown:8, titulo:'Ataques de facção paralisam capital',
    texto:'Facção criminosa ordena ataques a ônibus e delegacias em uma capital do Nordeste após transferência de líderes para presídio federal.',
    opcoes:[
      { txt:'Enviar Força Nacional e decretar GLO', fx:{ grp:{militares:4, movsociais:-3}, aprov:2, reg:{NE:2}, eco:{gasto:0.02} }, res:'Situação controlada em uma semana.' },
      { txt:'Operação de inteligência da PF contra o braço financeiro', fx:{ mod:{homic:-0.01}, grp:{judiciario:3} }, res:'R$ 2 bi bloqueados em fintechs e postos de gasolina.' },
      { txt:'Deixar a resposta com o governo estadual', fx:{ aprov:-3, grp:{governadores:-4} }, res:'Oposição acusa omissão.' },
    ]},
  { id:'megaoperacao', cat:'Segurança', peso:2, cooldown:14, titulo:'Megaoperação policial deixa dezenas de mortos',
    texto:'Operação da polícia estadual no Rio deixa mais de 60 mortos. Parte da população apoia; entidades de direitos humanos denunciam execuções.',
    opcoes:[
      { txt:'Defender o enfrentamento ao crime organizado', fx:{ grp:{evangelicos:4, militares:3, movsociais:-10, judiciario:-4}, aprov:2, reg:{SE:2} }, res:'Pesquisas mostram apoio majoritário à operação.' },
      { txt:'Pedir investigação independente pela PF', fx:{ grp:{movsociais:8, judiciario:4, governadores:-6}, aprov:-2 }, res:'Governador acusa o Planalto de "proteger bandidos".' },
      { txt:'Propor plano federal de retomada de territórios', fx:{ eco:{gasto:0.03}, mod:{homic:-0.01}, grp:{governadores:3}, aprov:1 }, res:'Plano piloto em três comunidades.' },
    ]},
  { id:'fraudeinss', cat:'Escândalo', peso:2, cooldown:24, titulo:'Fraude bilionária em benefícios do INSS',
    texto:'A CGU e a PF descobrem descontos indevidos em aposentadorias por associações de fachada, desde governos anteriores. Prejuízo estimado em R$ 6 bi.',
    opcoes:[
      { txt:'Ressarcir aposentados com recursos do Tesouro já', fx:{ eco:{gasto:0.06}, aprov:1, grp:{movsociais:4} }, res:'Devolução começa em 30 dias.' },
      { txt:'Esperar recuperar o dinheiro dos fraudadores', fx:{ aprov:-5, grp:{imprensa:-6} }, res:'Aposentados protestam em frente às agências.' },
      { txt:'Apoiar CPMI ampla para investigar', fx:{ custom:'cpi', tema:'INSS', aprov:1, grp:{imprensa:4} }, res:'' },
    ]},
  { id:'pix', cat:'Economia', peso:2, cooldown:24, titulo:'Ataque hacker ao sistema financeiro',
    texto:'Criminosos invadem um provedor de tecnologia ligado ao Pix e desviam R$ 800 milhões de contas de reserva de instituições financeiras.',
    opcoes:[
      { txt:'Endurecer regras para fintechs e provedores', fx:{ grp:{mercado:2, judiciario:3}, aprov:1 }, res:'BC publica novas regras de segurança.' },
      { txt:'Pedir ao Congresso tipificar crimes cibernéticos financeiros', fx:{ grp:{judiciario:4} }, res:'Projeto aprovado em regime de urgência.' },
    ]},
  { id:'bets', cat:'Sociedade', peso:2, cooldown:24, titulo:'Endividamento por apostas online',
    texto:'Estudo do BC mostra famílias do Bolsa Família gastando bilhões em bets. Pressão para proibir publicidade.',
    opcoes:[
      { txt:'Proibir publicidade e elevar tributação das bets', fx:{ eco:{primario:0.05}, grp:{evangelicos:8, imprensa:-4}, aprov:2 }, res:'Clubes de futebol perdem patrocinadores.' },
      { txt:'Bloquear CPF de beneficiários de programas sociais', fx:{ grp:{movsociais:-2, evangelicos:4}, aprov:1 }, res:'Medida popular, contestada no STF.' },
      { txt:'Manter regras atuais', fx:{ grp:{evangelicos:-6}, aprov:-1 }, res:'Críticas de igrejas e economistas.' },
    ]},
  { id:'greveservidores', cat:'Política', peso:2, cooldown:12, titulo:'Greve das universidades e institutos federais',
    texto:'Professores e técnicos de 60 universidades cruzam os braços por reajuste e recomposição orçamentária.',
    opcoes:[
      { txt:'Conceder reajuste escalonado', fx:{ eco:{primario:-0.04}, grp:{sindicatos:8, mercado:-3}, idx:{educ:1} }, res:'Aulas retomadas em 3 semanas.' },
      { txt:'Endurecer: corte de ponto', fx:{ grp:{sindicatos:-12, movsociais:-6, mercado:4}, idx:{educ:-2}, aprov:-1 }, res:'Greve dura 3 meses.' },
    ]},
  { id:'protestodireita', cat:'Política', peso:3, cooldown:6, cond:s=>s.pres.e<2 || s.aprov<40, titulo:'Grandes atos da oposição',
    texto:'Centenas de milhares vão à Avenida Paulista e à Esplanada contra o governo, com pautas de impostos, segurança e anistia.',
    opcoes:[
      { txt:'Ignorar e manter a agenda', fx:{ aprov:-1 }, res:'A imprensa destaca o tamanho dos atos.' },
      { txt:'Responder com ato próprio no fim de semana seguinte', fx:{ aprov:1, grp:{movsociais:6}, party:{opos:-4} }, res:'Polarização sobe dois tons.' },
      { txt:'Convidar lideranças para diálogo no Planalto', fx:{ grp:{evangelicos:4, agro:3, movsociais:-4}, party:{opos:3} }, res:'Gesto de moderação dividiu os manifestantes.' },
    ]},
  { id:'protestoesquerda', cat:'Política', peso:3, cooldown:6, cond:s=>s.pres.e>2 || s.aprov<40, titulo:'Mobilização de centrais e movimentos',
    texto:'Centrais sindicais, MST e estudantes ocupam ruas em 200 cidades contra cortes e por direitos trabalhistas.',
    opcoes:[
      { txt:'Receber as lideranças e abrir mesa de negociação', fx:{ grp:{sindicatos:8, movsociais:8, mercado:-4} }, res:'Atos esvaziam após a reunião.' },
      { txt:'Manter a linha do governo', fx:{ grp:{sindicatos:-6, movsociais:-6, mercado:3}, aprov:-1 }, res:'Novos atos marcados.' },
    ]},
  { id:'deepfake', cat:'Política', peso:2, cooldown:12, titulo:'Deepfake do presidente viraliza',
    texto:'Vídeo falso feito com IA mostra o presidente supostamente admitindo fraude. São 40 milhões de visualizações em 24 horas.',
    opcoes:[
      { txt:'Acionar o STF e pedir remoção imediata', fx:{ grp:{judiciario:3, imprensa:-2, evangelicos:-3}, aprov:1 }, res:'Vídeo removido; oposição fala em censura.' },
      { txt:'Desmentir com transparência e humor nas redes', fx:{ aprov:2, grp:{imprensa:3} }, res:'A resposta viraliza mais que o deepfake.' },
    ]},
  { id:'centraodemanda', cat:'Congresso', peso:4, cooldown:6, cond:s=>s.t>2, titulo:'Centrão cobra fatura',
    texto:s=>{ const p = s.flags._centrao || 'PP'; return `Líderes do ${p} avisam que a bancada vai "votar com independência" se não ganhar mais espaço no governo e as emendas não forem pagas.`; },
    pre:s=>{ const c = ['PP','União','Republicanos','PSD','MDB'].filter(p=>s.coalizao.includes(p)); s.flags._centrao = c.length? pick(c) : 'PP'; },
    opcoes:[
      { txt:'Pagar R$ 5 bi em emendas', fx:{ custom:'centrao', modo:'emendas' }, res:'' },
      { txt:'Oferecer a presidência de uma estatal', fx:{ custom:'centrao', modo:'estatal' }, res:'' },
      { txt:'Recusar: "o governo não é balcão de negócios"', fx:{ custom:'centrao', modo:'recusa' }, res:'' },
    ]},
  { id:'stfderruba', cat:'Judiciário', peso:2, cooldown:12, cond:s=>s.aprovadas.length>0, titulo:'STF suspende lei do governo',
    texto:s=>`Ministro do STF concede liminar suspendendo trechos de lei aprovada pelo governo, atendendo ação de partido de oposição.`,
    opcoes:[
      { txt:'Respeitar e recorrer pela AGU', fx:{ grp:{judiciario:5, imprensa:3}, aprov:-1 }, res:'Plenário deve julgar em 3 meses.' },
      { txt:'Criticar o "ativismo judicial" publicamente', fx:{ grp:{judiciario:-12, evangelicos:3, imprensa:-4}, stf:-8 }, res:'Crise institucional na pauta.' },
    ]},
  { id:'tcu', cat:'Orçamento', peso:2, cooldown:12, cond:s=>s.eco.primario< 0, titulo:'TCU aponta irregularidade fiscal',
    texto:'O Tribunal de Contas da União questiona manobras contábeis e despesas fora da meta. A oposição fala em "pedalada".',
    opcoes:[
      { txt:'Corrigir a contabilidade e cortar despesas', fx:{ eco:{primario:0.08, conf:3}, grp:{mercado:4} }, res:'O TCU aprova as contas com ressalvas.' },
      { txt:'Defender a legalidade e enfrentar o TCU', fx:{ grp:{mercado:-6, imprensa:-4}, flag:'pedalada' }, res:'Tema entra no radar de juristas da oposição.' },
    ]},
  { id:'venezuela', cat:'Internacional', peso:2, cooldown:18, titulo:'Crise na fronteira com a Venezuela',
    texto:'Instabilidade em Caracas aumenta o fluxo de migrantes para Roraima e há tropas venezuelanas próximas à região do Essequibo.',
    opcoes:[
      { txt:'Reforçar a Operação Acolhida e o Exército na fronteira', fx:{ eco:{gasto:0.02}, reg:{N:3}, grp:{militares:6}, rel:{Venezuela:-4, EUA:3} }, res:'Situação estabilizada.' },
      { txt:'Propor mediação regional', fx:{ rel:{Venezuela:6, EUA:-2, China:2}, grp:{imprensa:2} }, res:'Diálogo patrocinado pelo Brasil e pela Colômbia.' },
      { txt:'Condenar duramente o regime venezuelano', fx:{ rel:{Venezuela:-15, EUA:6, Argentina:4}, grp:{movsociais:-4, evangelicos:3} }, res:'Caracas convoca seu embaixador.' },
    ]},
  { id:'cinturao', cat:'Internacional', peso:2, unico:true, titulo:'China propõe aderir à Nova Rota da Seda',
    texto:'Pequim convida o Brasil a aderir formalmente à Iniciativa Cinturão e Rota, com promessa de US$ 50 bi em infraestrutura.',
    opcoes:[
      { txt:'Aderir formalmente', fx:{ rel:{China:18, EUA:-15, UE:-3}, mod:{infra:0.03, potencial:0.04}, grp:{mercado:-3, industria:-4, agro:4} }, res:'Washington se diz "preocupado".' },
      { txt:'Sinergias sem adesão formal (como em 2024)', fx:{ rel:{China:5}, mod:{infra:0.01} }, res:'Projetos bilaterais em ferrovias e energia.' },
      { txt:'Recusar', fx:{ rel:{China:-10, EUA:6}, grp:{agro:-6} }, res:'Pequim responde com inspeções sanitárias mais rígidas na carne.' },
    ]},
  { id:'itaipu', cat:'Internacional', peso:2, unico:true, titulo:'Revisão do Anexo C de Itaipu',
    texto:'Paraguai pressiona por tarifa mais alta e liberdade para vender sua energia excedente no mercado livre brasileiro.',
    opcoes:[
      { txt:'Ceder parcialmente', fx:{ rel:{Paraguai:12}, eco:{inflShock:0.08} }, res:'Acordo assinado em Foz do Iguaçu.' },
      { txt:'Manter posição dura', fx:{ rel:{Paraguai:-10}, grp:{industria:3} }, res:'Negociação se arrasta.' },
    ]},
  { id:'brics', cat:'Internacional', peso:2, cooldown:12, titulo:'Cúpula do BRICS: moeda comum?',
    texto:'Na cúpula anual, Rússia e Irã propõem acelerar sistema de pagamentos fora do dólar. Washington ameaça sanções a quem aderir.',
    opcoes:[
      { txt:'Apoiar pagamentos em moedas locais, sem moeda comum', fx:{ rel:{China:4, India:3, EUA:-3} }, res:'Posição de equilíbrio.' },
      { txt:'Apoiar fortemente a desdolarização', fx:{ rel:{Russia:10, China:8, EUA:-15}, grp:{mercado:-6} }, res:'Tarifas ameaçadas no dia seguinte.' },
      { txt:'Esvaziar a proposta', fx:{ rel:{Russia:-8, China:-3, EUA:6}, grp:{mercado:3} }, res:'Moscou critica o Brasil.' },
    ]},
  { id:'ucrania', cat:'Internacional', peso:2, cooldown:24, titulo:'Convite para mediar a paz na Ucrânia',
    texto:'Kiev e Moscou aceitam conversas preliminares e uma das partes sugere o Brasil como sede.',
    opcoes:[
      { txt:'Sediar conversas no Itamaraty', fx:{ rel:{UE:4, Russia:4, China:3, EUA:2}, grp:{imprensa:5}, aprov:1 }, res:'Brasília vira capital diplomática por uma semana.' },
      { txt:'Declinar com cautela', fx:{}, res:'Sem custo, sem ganho.' },
    ]},
  { id:'eudr', cat:'Internacional', peso:2, unico:true, titulo:'Lei antidesmatamento da UE entra em vigor',
    texto:'Exportações de soja, carne, café e cacau para a Europa precisam comprovar origem livre de desmatamento.',
    opcoes:[
      { txt:'Criar rastreabilidade nacional com a Embrapa', fx:{ grp:{agro:-3, ambientalistas:5}, rel:{UE:8}, eco:{gasto:0.02} }, res:'Exportadores se adaptam.' },
      { txt:'Acionar a OMC contra a UE', fx:{ rel:{UE:-10}, grp:{agro:10} }, res:'Painel aberto em Genebra.' },
    ]},
  { id:'investchina', cat:'Internacional', peso:2, cooldown:18, cond:s=>s.rel.China>55, titulo:'Montadora chinesa anuncia fábrica',
    texto:'Gigante chinesa de carros elétricos quer instalar sua segunda fábrica no Brasil e pede redução da tarifa de importação durante a transição.',
    opcoes:[
      { txt:'Aceitar e escolher o Nordeste', fx:{ reg:{NE:4}, rel:{China:6}, grp:{industria:-4, sindicatos:3}, eco:{pibShock:0.15} }, res:'15 mil empregos prometidos.' },
      { txt:'Exigir conteúdo local alto', fx:{ rel:{China:-2}, grp:{industria:6, sindicatos:5} }, res:'Negociação demorada.' },
    ]},
  { id:'investeua', cat:'Internacional', peso:2, cooldown:18, cond:s=>s.rel.EUA>50, titulo:'Big tech quer data centers no Brasil',
    texto:'Empresa americana anuncia US$ 15 bi em data centers, desde que haja energia barata e incentivos fiscais.',
    opcoes:[
      { txt:'Aprovar regime especial (Redata)', fx:{ rel:{EUA:5}, eco:{pibShock:0.15, primario:-0.02}, grp:{industria:3, ambientalistas:-3} }, res:'Pedra fundamental no Ceará.' },
      { txt:'Exigir contrapartidas de soberania de dados', fx:{ rel:{EUA:-2}, grp:{imprensa:3} }, res:'Investimento adiado.' },
    ]},
  { id:'yanomami', cat:'Ambiente', peso:2, cooldown:24, titulo:'Garimpo volta à Terra Yanomami',
    texto:'Imagens de satélite mostram retorno de garimpeiros e casos de malária em alta na terra indígena.',
    opcoes:[
      { txt:'Nova operação de desintrusão', fx:{ eco:{gasto:0.02}, grp:{ambientalistas:8, militares:2}, reg:{N:-1} }, res:'Garimpeiros expulsos.' },
      { txt:'Prometer ação e priorizar outras áreas', fx:{ grp:{ambientalistas:-8, imprensa:-4}, rel:{UE:-3} }, res:'Imprensa internacional repercute.' },
    ]},
  { id:'queimadas', cat:'Ambiente', peso:2, cooldown:12, titulo:'Queimadas recordes no Pantanal',
    texto:'Fumaça encobre capitais do Centro-Oeste e do Sudeste. Focos de incêndio batem recorde.',
    opcoes:[
      { txt:'Decretar emergência e enviar 3 mil brigadistas', fx:{ eco:{gasto:0.02}, grp:{ambientalistas:6}, reg:{CO:2} }, res:'Incêndios controlados em 3 semanas.' },
      { txt:'Atribuir a culpa às mudanças climáticas', fx:{ grp:{ambientalistas:-4, agro:2}, aprov:-1 }, res:'Resposta considerada lenta.' },
    ]},
  { id:'petrobrasdiv', cat:'Economia', peso:2, cooldown:12, titulo:'Petrobras: dividendos ou investimentos?',
    texto:'O conselho da Petrobras decide entre pagar dividendos extraordinários (o Tesouro recebe R$ 20 bi) ou investir em refino e fertilizantes.',
    opcoes:[
      { txt:'Dividendos extraordinários', fx:{ eco:{gasto:-0.15}, grp:{mercado:6} }, res:'Reforço de caixa no Tesouro.' },
      { txt:'Investir em refinarias e fertilizantes', fx:{ mod:{potencial:0.03}, grp:{industria:6, sindicatos:4, mercado:-6} }, res:'Obras da Abreu e Lima retomadas.' },
    ]},
  { id:'militaresnota', cat:'Política', peso:2, cooldown:18, cond:s=>s.grp.militares<35, titulo:'Mal-estar nos quartéis',
    texto:'Generais da reserva publicam carta crítica ao governo; comandantes não desautorizam. Ministro da Defesa pede orientação.',
    opcoes:[
      { txt:'Exonerar o comandante do Exército', fx:{ grp:{militares:-8, judiciario:4, movsociais:5}, aprov:-1 }, res:'Hierarquia reafirmada; tensão alta.' },
      { txt:'Reunir o Alto Comando e anunciar reequipamento', fx:{ grp:{militares:12}, eco:{primario:-0.04} }, res:'Clima nos quartéis melhora.' },
      { txt:'Ignorar', fx:{ grp:{militares:-3, imprensa:-3} }, res:'Crise morre sozinha, mas deixa sequelas.' },
    ]},
  { id:'igrejas', cat:'Sociedade', peso:2, cooldown:12, titulo:'Bancada evangélica pede isenção fiscal ampliada',
    texto:'Lideranças evangélicas pedem ampliação da imunidade tributária de templos para atividades comerciais ligadas às igrejas.',
    opcoes:[
      { txt:'Apoiar', fx:{ grp:{evangelicos:12, imprensa:-5}, eco:{primario:-0.02}, party:{'Republicanos':6} }, res:'Pastores elogiam o governo nos cultos.' },
      { txt:'Recusar', fx:{ grp:{evangelicos:-8, imprensa:2}, party:{'Republicanos':-4} }, res:'Sermões críticos em grandes igrejas.' },
    ]},
  { id:'vazamento', cat:'Escândalo', peso:2, cooldown:12, titulo:'Áudios do Palácio vazados',
    texto:'Áudio de um assessor do Planalto combinando liberação de emendas em troca de votos chega à imprensa.',
    opcoes:[
      { txt:'Demitir o assessor e abrir sindicância', fx:{ aprov:-1, grp:{imprensa:3} }, res:'Caso perde força.' },
      { txt:'Negar e falar em "armação"', fx:{ aprov:-4, grp:{imprensa:-8}, flag:'audios' }, res:'Novos áudios aparecem na semana seguinte.' },
    ]},
  { id:'impeachmentpedido', cat:'Congresso', peso:5, cooldown:6, cond:s=>s.aprov<28, titulo:'Pedido de impeachment protocolado',
    texto:'Juristas e partidos de oposição protocolam pedido de impeachment por crime de responsabilidade. O presidente da Câmara diz que vai "analisar".',
    opcoes:[
      { txt:'Negociar com o presidente da Câmara para engavetar', fx:{ presCamara:-5, eco:{gasto:0.05}, party:{base:6} }, res:'Pedido engavetado, por enquanto.' },
      { txt:'Ir à TV defender o mandato', fx:{ aprov:2, grp:{movsociais:4} }, res:'Base mobilizada.' },
      { txt:'Ignorar', fx:{ custom:'impeachmentrisco' }, res:'' },
    ]},
  { id:'reformaministerial', cat:'Política', peso:2, cooldown:12, cond:s=>s.aprov<42 && s.t>6, titulo:'Pressão por reforma ministerial',
    texto:'Aliados e imprensa dizem que o governo "perdeu o rumo". Líderes pedem mudanças no ministério para relançar a gestão.',
    opcoes:[
      { txt:'Fazer reforma ampla dando mais espaço ao Centrão', fx:{ party:{base:12}, grp:{imprensa:-3}, aprov:1 }, res:'Base se reorganiza.' },
      { txt:'Trocar apenas a articulação política', fx:{ party:{base:4}, presCamara:5 }, res:'Novo nome na Secretaria de Relações Institucionais.' },
      { txt:'Manter a equipe', fx:{ party:{base:-5} }, res:'Aliados reclamam nos bastidores.' },
    ]},
  { id:'pf_aliado', cat:'Escândalo', peso:2, cooldown:14, cond:s=>s.coalizao.length>2, titulo:'PF faz operação contra aliado',
    texto:s=>`A Polícia Federal cumpre mandados contra um líder do ${s.flags._pfp||'partido aliado'} suspeito de desvio de emendas.`,
    pre:s=>{ const c=s.coalizao.filter(p=>p!==s.pres.partido); s.flags._pfp = c.length? pick(c):s.pres.partido; },
    opcoes:[
      { txt:'Garantir autonomia da PF: "doa a quem doer"', fx:{ custom:'pfAliado', defende:false }, res:'' },
      { txt:'Prestar solidariedade ao aliado', fx:{ custom:'pfAliado', defende:true }, res:'' },
    ]},
  { id:'cpiopos', cat:'Congresso', peso:3, cooldown:10, cond:s=>s.baseCamara<300 && s.t>4, titulo:'Oposição consegue assinaturas para CPI',
    texto:'Oposição reúne 171 assinaturas para uma CPI sobre contratos de publicidade e ONGs do governo.',
    opcoes:[
      { txt:'Trabalhar para retirar assinaturas', fx:{ eco:{gasto:0.03}, party:{base:3}, grp:{imprensa:-4} }, res:'CPI não é instalada.' },
      { txt:'Deixar a CPI funcionar e ocupar a relatoria', fx:{ custom:'cpi', tema:'publicidade' }, res:'' },
    ]},
  { id:'golfoinvest', cat:'Internacional', peso:2, cooldown:24, titulo:'Fundo soberano do Golfo quer investir',
    texto:'Fundo soberano dos Emirados quer investir US$ 10 bi em portos, hidrogênio verde e fertilizantes.',
    opcoes:[
      { txt:'Abrir as portas com garantias do BNDES', fx:{ rel:{Golfo:8}, mod:{potencial:0.03, infra:0.02}, grp:{mercado:4} }, res:'Memorando assinado em Abu Dhabi.' },
      { txt:'Exigir parceria com estatais', fx:{ rel:{Golfo:2}, grp:{sindicatos:3} }, res:'Investimento menor que o esperado.' },
    ]},
  { id:'haiti', cat:'Internacional', peso:1, unico:true, titulo:'ONU pede tropas brasileiras no Haiti',
    texto:'Com gangues controlando Porto Príncipe, o Conselho de Segurança pede ao Brasil que lidere nova missão.',
    opcoes:[
      { txt:'Enviar contingente', fx:{ rel:{EUA:6, UE:3}, grp:{militares:5, movsociais:-3}, eco:{gasto:0.02} }, res:'Prestígio diplomático em alta.' },
      { txt:'Enviar apenas ajuda humanitária', fx:{ rel:{EUA:1} }, res:'Contribuição modesta.' },
    ]},
  { id:'correios', cat:'Economia', peso:2, unico:true, cond:s=>!s.aprovadas.includes('privcorreios'), titulo:'Correios à beira da insolvência',
    texto:'A estatal acumula prejuízo bilionário e pede aporte do Tesouro para pagar fornecedores e salários.',
    opcoes:[
      { txt:'Aportar R$ 10 bi e reestruturar', fx:{ eco:{gasto:0.08}, grp:{sindicatos:4, mercado:-5} }, res:'Correios ganham fôlego.' },
      { txt:'Plano de demissão voluntária e fechamento de agências', fx:{ grp:{sindicatos:-8, mercado:4}, eco:{gasto:0.02}, aprov:-1 }, res:'Greve nacional dos Correios.' },
    ]},
  { id:'escola', cat:'Sociedade', peso:1, cooldown:24, titulo:'Ataque a escola choca o país',
    texto:'Um ex-aluno ataca uma escola estadual. A tragédia reacende o debate sobre segurança escolar e redes sociais.',
    opcoes:[
      { txt:'Programa federal de segurança e saúde mental nas escolas', fx:{ eco:{gasto:0.02}, idx:{educ:1}, aprov:1 }, res:'Psicólogos em 10 mil escolas.' },
      { txt:'Pressionar plataformas por moderação de conteúdo extremista', fx:{ rel:{EUA:-3}, grp:{imprensa:4, judiciario:4} }, res:'Big techs removem comunidades.' },
    ]},
  { id:'greve_pm', cat:'Segurança', peso:1, cooldown:24, titulo:'Motim de policiais militares',
    texto:'Policiais militares cruzam os braços em um estado do Nordeste por reajuste. Saques e homicídios disparam.',
    opcoes:[
      { txt:'Enviar Força Nacional e Exército (GLO)', fx:{ grp:{militares:3, governadores:5}, eco:{gasto:0.01}, reg:{NE:2} }, res:'Ordem restabelecida.' },
      { txt:'Mediar com o governador', fx:{ grp:{governadores:2}, idx:{seg:-1} }, res:'Motim dura 9 dias.' },
    ]},
  { id:'nobel', cat:'Sociedade', peso:1, unico:true, cond:s=>s.soc.pobreza<21, titulo:'Brasil sai do Mapa da Fome de novo',
    texto:'A FAO confirma que o Brasil segue fora do Mapa da Fome, com queda da insegurança alimentar grave.',
    opcoes:[ { txt:'Celebrar com programas sociais', fx:{ aprov:3, grp:{movsociais:6, imprensa:4}, rel:{UE:2, AfricaSul:3} }, res:'Reconhecimento internacional.' } ]},
];
