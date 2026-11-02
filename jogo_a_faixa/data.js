// =====================================================================
// A FAIXA — base de dados
// Fontes de referência (consultadas em nov/2026):
//  - Bancadas eleitas em out/2026: Congresso em Foco, Gazeta SP, O Liberal
//    (PL 121, PT 70, União 46, PSD 43, PP 41, Republicanos 41; demais
//    partidos são estimativas para fechar 513 cadeiras).
//  - Indicadores: Boletim Focus/BCB (Selic ~13,5%, IPCA ~5%, PIB ~1,9%),
//    IBGE/PNAD (desemprego ~5,6%), BCB (dívida bruta ~81-82% do PIB).
//  - Calendário: Copom (8 reuniões/ano), eleições municipais 2028,
//    gerais 2030, aposentadorias compulsórias no STF aos 75 anos.
// Personagens (ministros, vices, candidatos) são fictícios.
// =====================================================================

const PARTIDOS = [
  // e: eixo econômico (-10 esquerda, +10 direita) | s: eixo social (-10 progressista, +10 conservador)
  // fis: fisiologismo (0-1) — quanto valoriza cargos e emendas
  { id:'PSOL', nome:'Partido Socialismo e Liberdade', cor:'#C8102E', dep:12, sen:0, e:-8.5, s:-8.5, fis:0.10 },
  { id:'PCdoB', nome:'Partido Comunista do Brasil', cor:'#9E1B32', dep:6, sen:0, e:-7.5, s:-5, fis:0.30 },
  { id:'PT', nome:'Partido dos Trabalhadores', cor:'#E4002B', dep:70, sen:10, e:-6, s:-5, fis:0.35 },
  { id:'Rede', nome:'Rede Sustentabilidade', cor:'#1BA39C', dep:3, sen:0, e:-3.5, s:-6.5, fis:0.15 },
  { id:'PV', nome:'Partido Verde', cor:'#2E9E44', dep:5, sen:0, e:-3, s:-5, fis:0.40 },
  { id:'PSB', nome:'Partido Socialista Brasileiro', cor:'#F28C28', dep:20, sen:3, e:-3, s:-3, fis:0.45 },
  { id:'PDT', nome:'Partido Democrático Trabalhista', cor:'#D9534F', dep:12, sen:2, e:-3.5, s:-2, fis:0.45 },
  { id:'Solidariedade', nome:'Solidariedade', cor:'#F5A623', dep:2, sen:0, e:-1, s:0, fis:0.70 },
  { id:'Avante', nome:'Avante', cor:'#E8743B', dep:8, sen:0, e:0.5, s:2, fis:0.80 },
  { id:'MDB', nome:'Movimento Democrático Brasileiro', cor:'#2F7D32', dep:45, sen:11, e:1.5, s:1.5, fis:0.80 },
  { id:'PSD', nome:'Partido Social Democrático', cor:'#F2B705', dep:43, sen:12, e:2.5, s:2, fis:0.85 },
  { id:'PSDB', nome:'Partido da Social Democracia Brasileira', cor:'#1F5AA6', dep:10, sen:1, e:3.5, s:0, fis:0.50 },
  { id:'Podemos', nome:'Podemos', cor:'#3FA7D6', dep:14, sen:2, e:3, s:3, fis:0.70 },
  { id:'PRD', nome:'Partido Renovação Democrática', cor:'#5B6770', dep:8, sen:0, e:3.5, s:4, fis:0.85 },
  { id:'União', nome:'União Brasil', cor:'#1A3F8F', dep:46, sen:7, e:4.5, s:4, fis:0.85 },
  { id:'PP', nome:'Progressistas', cor:'#3B6FB6', dep:41, sen:7, e:5, s:5, fis:0.90 },
  { id:'Republicanos', nome:'Republicanos', cor:'#2A8F8A', dep:41, sen:5, e:4.5, s:7.5, fis:0.80 },
  { id:'Novo', nome:'Partido Novo', cor:'#F37021', dep:6, sen:1, e:9, s:3, fis:0.05 },
  { id:'PL', nome:'Partido Liberal', cor:'#16365C', dep:121, sen:20, e:7, s:8.5, fis:0.55 },
];
// Soma: 513 deputados, 81 senadores.

const MINISTERIOS = [
  { id:'casacivil', nome:'Casa Civil', peso:3, area:'articulação' },
  { id:'fazenda', nome:'Fazenda', peso:3, area:'economia' },
  { id:'planej', nome:'Planejamento e Orçamento', peso:2, area:'orçamento' },
  { id:'itamaraty', nome:'Relações Exteriores', peso:2, area:'diplomacia' },
  { id:'defesa', nome:'Defesa', peso:2, area:'militares' },
  { id:'justica', nome:'Justiça e Segurança Pública', peso:3, area:'segurança' },
  { id:'saude', nome:'Saúde', peso:3, area:'saúde' },
  { id:'educacao', nome:'Educação', peso:3, area:'educação' },
  { id:'agricultura', nome:'Agricultura e Pecuária', peso:2, area:'agro' },
  { id:'ambiente', nome:'Meio Ambiente e Mudança do Clima', peso:1, area:'ambiente' },
  { id:'social', nome:'Desenvolvimento e Assistência Social', peso:2, area:'social' },
  { id:'minas', nome:'Minas e Energia', peso:2, area:'energia' },
  { id:'transportes', nome:'Transportes e Infraestrutura', peso:2, area:'infra' },
  { id:'cidades', nome:'Cidades', peso:2, area:'habitação' },
  { id:'mdic', nome:'Desenvolvimento, Indústria e Comércio', peso:2, area:'indústria' },
  { id:'trabalho', nome:'Trabalho e Emprego', peso:1, area:'trabalho' },
  { id:'ciencia', nome:'Ciência, Tecnologia e Inovação', peso:1, area:'ciência' },
];

const NOMES_F = ['Ana','Beatriz','Carla','Daniela','Fernanda','Gabriela','Helena','Isabel','Joana','Karina','Luciana','Marina','Natália','Patrícia','Renata','Simone','Tereza','Vera','Yara','Rosângela','Cláudia','Mônica','Priscila','Raquel','Tatiana','Eliane','Sônia','Lúcia'];
const NOMES_M = ['André','Bruno','Carlos','Diego','Eduardo','Fábio','Gustavo','Henrique','Igor','João','Leonardo','Marcelo','Nelson','Otávio','Paulo','Ricardo','Sérgio','Tiago','Vinícius','Wagner','Rodrigo','Márcio','Fernando','Antônio','Rui','Jorge','Alexandre','Luís'];
const SOBRENOMES = ['Albuquerque','Barreto','Cavalcanti','Damasceno','Esteves','Figueiredo','Guimarães','Holanda','Junqueira','Leitão','Macedo','Nogueira','Oliveira','Pimentel','Queiroz','Rezende','Sampaio','Tavares','Uchôa','Vasconcelos','Xavier','Zanetti','Brandão','Coutinho','Diniz','Falcão','Gusmão','Lacerda','Medeiros','Novaes','Pacheco','Ribeiro','Siqueira','Teixeira','Valadares','Andrade','Bezerra','Campos','Dantas','Monteiro','Prado','Salles','Fontes','Moraes'];

// formato 'masculino|feminino'
const PERFIS_MIN = {
  tecnico: ['ex-diretor do BNDES|ex-diretora do BNDES','professor titular da USP|professora titular da USP','servidor de carreira do Ipea|servidora de carreira do Ipea','ex-secretário do Tesouro|ex-secretária do Tesouro','pesquisador da Fiocruz|pesquisadora da Fiocruz','ex-reitor de universidade federal|ex-reitora de universidade federal','economista-chefe de banco|economista-chefe de banco','procurador de carreira|procuradora de carreira','engenheiro da Petrobras|engenheira da Petrobras','diplomata de carreira|diplomata de carreira','general da reserva|general da reserva','ex-presidente da Embrapa|ex-presidente da Embrapa','auditor do TCU|auditora do TCU','sanitarista do SUS|sanitarista do SUS'],
  politico: ['ex-governador|ex-governadora','senador licenciado|senadora licenciada','deputado federal em 3º mandato|deputada federal em 3º mandato','ex-prefeito de capital|ex-prefeita de capital','líder partidário na Câmara|líder partidária na Câmara','ex-ministro|ex-ministra','deputado estadual|deputada estadual','ex-vice-governador|ex-vice-governadora','presidente estadual do partido|presidente estadual do partido','ex-senador|ex-senadora'],
};

// Estados: tile-grid (linha, coluna), região, peso eleitoral aproximado (% do eleitorado)
const ESTADOS = [
  ['RR','Roraima','N',0,3,0.3],['AP','Amapá','N',0,5,0.4],
  ['AM','Amazonas','N',1,2,1.7],['PA','Pará','N',1,4,4.0],['MA','Maranhão','NE',1,5,3.3],['CE','Ceará','NE',1,6,4.4],['RN','Rio Grande do Norte','NE',1,7,1.6],
  ['AC','Acre','N',2,1,0.4],['RO','Rondônia','N',2,2,0.8],['MT','Mato Grosso','CO',2,3,1.7],['TO','Tocantins','N',2,4,0.7],['PI','Piauí','NE',2,5,1.6],['PE','Pernambuco','NE',2,6,4.6],['PB','Paraíba','NE',2,7,2.0],
  ['GO','Goiás','CO',3,3,3.4],['DF','Distrito Federal','CO',3,4,1.5],['BA','Bahia','NE',3,5,7.1],['SE','Sergipe','NE',3,6,1.1],['AL','Alagoas','NE',3,7,1.6],
  ['MS','Mato Grosso do Sul','CO',4,3,1.3],['MG','Minas Gerais','SE',4,4,10.4],['ES','Espírito Santo','SE',4,5,1.9],
  ['PR','Paraná','S',5,2,5.5],['SP','São Paulo','SE',5,3,21.9],['RJ','Rio de Janeiro','SE',5,4,8.1],
  ['SC','Santa Catarina','S',6,2,3.8],
  ['RS','Rio Grande do Sul','S',7,2,5.4],
].map(([uf,nome,reg,r,c,peso])=>({uf,nome,reg,r,c,peso}));

const REGIOES = { N:'Norte', NE:'Nordeste', CO:'Centro-Oeste', SE:'Sudeste', S:'Sul' };

const GRUPOS = [
  { id:'mercado', nome:'Mercado financeiro', ini:45 },
  { id:'agro', nome:'Agronegócio', ini:40 },
  { id:'industria', nome:'Indústria (CNI/Fiesp)', ini:48 },
  { id:'comercio', nome:'Comércio e serviços', ini:48 },
  { id:'sindicatos', nome:'Centrais sindicais', ini:55 },
  { id:'movsociais', nome:'Movimentos sociais', ini:55 },
  { id:'evangelicos', nome:'Lideranças evangélicas', ini:38 },
  { id:'militares', nome:'Forças Armadas', ini:45 },
  { id:'imprensa', nome:'Imprensa', ini:50 },
  { id:'judiciario', nome:'STF e Judiciário', ini:55 },
  { id:'governadores', nome:'Governadores', ini:50 },
  { id:'ambientalistas', nome:'Ambientalistas e indígenas', ini:50 },
];

const PAISES = [
  { id:'China', nome:'China', ini:62, comercio:0.28, bloco:'BRICS' },
  { id:'EUA', nome:'Estados Unidos', ini:42, comercio:0.12, bloco:'Ocidente' },
  { id:'UE', nome:'União Europeia', ini:55, comercio:0.14, bloco:'Ocidente' },
  { id:'Argentina', nome:'Argentina', ini:45, comercio:0.05, bloco:'Mercosul' },
  { id:'Paraguai', nome:'Paraguai', ini:55, comercio:0.02, bloco:'Mercosul' },
  { id:'Uruguai', nome:'Uruguai', ini:65, comercio:0.01, bloco:'Mercosul' },
  { id:'Venezuela', nome:'Venezuela', ini:35, comercio:0.005, bloco:'América do Sul' },
  { id:'India', nome:'Índia', ini:58, comercio:0.03, bloco:'BRICS' },
  { id:'Russia', nome:'Rússia', ini:52, comercio:0.02, bloco:'BRICS' },
  { id:'AfricaSul', nome:'África do Sul', ini:60, comercio:0.01, bloco:'BRICS' },
  { id:'Japao', nome:'Japão', ini:55, comercio:0.025, bloco:'Ocidente' },
  { id:'Golfo', nome:'Países do Golfo', ini:55, comercio:0.03, bloco:'Oriente Médio' },
];

const BACKGROUNDS = [
  { id:'economista', nome:'Economista', desc:'Mercado confia mais. Fazenda rende +10% de competência.', fx:{ grp:{mercado:8}, bonus:{fazenda:10} } },
  { id:'sindicalista', nome:'Líder sindical', desc:'Base trabalhadora fiel. Sindicatos e movimentos +10; mercado −6.', fx:{ grp:{sindicatos:10, movsociais:8, mercado:-6} } },
  { id:'empresario', nome:'Empresário', desc:'Indústria e comércio +10; movimentos sociais −6.', fx:{ grp:{industria:10, comercio:10, movsociais:-6} } },
  { id:'militar', nome:'Militar da reserva', desc:'Forças Armadas +15; Judiciário e imprensa −5.', fx:{ grp:{militares:15, judiciario:-5, imprensa:-5} } },
  { id:'jurista', nome:'Jurista / ex-magistrado', desc:'Judiciário +12; mais resistência a escândalos.', fx:{ grp:{judiciario:12} , bonus:{escandalo:-0.3} } },
  { id:'medico', nome:'Médico sanitarista', desc:'Saúde rende mais; crises sanitárias pesam menos.', fx:{ bonus:{saude:10} } },
  { id:'pastor', nome:'Líder religioso', desc:'Evangélicos +18; movimentos sociais e imprensa −6.', fx:{ grp:{evangelicos:18, movsociais:-6, imprensa:-6} } },
  { id:'governador', nome:'Ex-governador', desc:'Governadores +12 e +4 pontos de articulação no Congresso.', fx:{ grp:{governadores:12}, bonus:{artic:4} } },
];

// Promessas de campanha — avaliadas ao longo e no fim do mandato
const PROMESSAS = [
  { id:'desemprego', txt:'Desemprego abaixo de 5%', chk:s=>s.eco.desemp < 5 },
  { id:'inflacao', txt:'Inflação dentro da meta (até 4,5%)', chk:s=>s.eco.ipca <= 4.5 },
  { id:'crescimento', txt:'PIB crescendo 3% ao ano', chk:s=>s.eco.pib >= 3 },
  { id:'divida', txt:'Dívida bruta abaixo de 80% do PIB', chk:s=>s.eco.divida < 80 },
  { id:'desmat', txt:'Reduzir desmatamento da Amazônia abaixo de 3.000 km²', chk:s=>s.soc.desmat < 3000 },
  { id:'homicidio', txt:'Reduzir homicídios para menos de 17 por 100 mil', chk:s=>s.soc.homic < 17 },
  { id:'pobreza', txt:'Reduzir a pobreza para menos de 18%', chk:s=>s.soc.pobreza < 18 },
  { id:'p6x1', txt:'Aprovar o fim da escala 6x1', chk:s=>s.aprovadas.includes('fim6x1') },
  { id:'padm', txt:'Aprovar a Reforma Administrativa', chk:s=>s.aprovadas.includes('refadm') },
  { id:'pseg', txt:'Aprovar a PEC da Segurança Pública', chk:s=>s.aprovadas.includes('pecseg') },
  { id:'peduc', txt:'Educação: índice acima de 60', chk:s=>s.soc.educ > 60 },
  { id:'psaude', txt:'Saúde: índice acima de 62', chk:s=>s.soc.saude > 62 },
];

// =====================================================================
// PROJETOS DE LEI
// tipo: PL (maioria simples), PLP (maioria absoluta), PEC (3/5), PDL (ratificação)
// e/s: posição ideológica do projeto; we/ws: peso de cada eixo no voto
// pop: apelo popular (-1 a 1) — com aprovação alta o Centrão adere mais
// tram: meses de tramitação | mp: pode virar Medida Provisória
// fx: efeitos ao aprovar (veja applyFx) | mod: efeitos permanentes por mês
// =====================================================================
const PROJETOS = [
  { id:'fim6x1', nome:'PEC do fim da escala 6x1', tipo:'PEC', e:-6, s:-1, we:1, ws:0.2, pop:0.9, tram:4,
    desc:'Reduz a jornada máxima para 40h semanais e garante dois dias de folga. Popular entre trabalhadores; o comércio e a indústria alertam para custo de até 7% na folha.',
    fx:{ aprov:6, grp:{sindicatos:15, movsociais:10, comercio:-15, industria:-12, mercado:-8}, eco:{pibShock:-0.4, inflShock:0.25} , mod:{potencial:-0.05, pobreza:-0.01} } },
  { id:'refadm', nome:'PEC da Reforma Administrativa', tipo:'PEC', e:6, s:0, we:1, ws:0, pop:-0.1, tram:5,
    desc:'Avaliação de desempenho, fim de promoções automáticas e novas regras de estabilidade para futuros servidores.',
    fx:{ aprov:-2, grp:{mercado:15, sindicatos:-15, industria:6, imprensa:4}, eco:{primario:0.25, conf:8}, mod:{potencial:0.08} } },
  { id:'pecseg', nome:'PEC da Segurança Pública', tipo:'PEC', e:0, s:2, we:0.2, ws:1, pop:0.6, tram:4,
    desc:'Integra as polícias no Sistema Único de Segurança Pública, amplia o papel da PF e da PRF contra facções e cria fundo constitucional.',
    fx:{ aprov:3, grp:{governadores:6, militares:4}, eco:{primario:-0.05}, mod:{homic:-0.05} } },
  { id:'antifaccao', nome:'Lei Antifacção', tipo:'PL', e:1, s:5, we:0.2, ws:1, pop:0.7, tram:2, mp:true,
    desc:'Tipifica facções criminosas como organizações ultraviolentas, endurece penas e permite asfixia financeira por bloqueio de bens.',
    fx:{ aprov:3, grp:{evangelicos:4, movsociais:-5, judiciario:-3}, mod:{homic:-0.04} } },
  { id:'maioridade', nome:'PEC da redução da maioridade penal', tipo:'PEC', e:2, s:9, we:0, ws:1, pop:0.4, tram:4,
    desc:'Reduz a maioridade penal para 16 anos em crimes hediondos.',
    fx:{ aprov:2, grp:{evangelicos:10, movsociais:-15, judiciario:-8, imprensa:-5}, mod:{homic:-0.005} } },
  { id:'grandesfortunas', nome:'Imposto sobre Grandes Fortunas', tipo:'PLP', e:-8, s:-2, we:1, ws:0, pop:0.6, tram:3,
    desc:'Alíquota de 0,5% a 1,5% sobre patrimônios acima de R$ 10 milhões.',
    fx:{ aprov:3, grp:{mercado:-18, industria:-8, movsociais:10, sindicatos:8}, eco:{primario:0.2, conf:-10, dolarPct:2} } },
  { id:'dividendos', nome:'Tributação ampliada de lucros e dividendos', tipo:'PL', e:-5, s:0, we:1, ws:0, pop:0.4, tram:3, mp:true,
    desc:'Eleva a alíquota mínima sobre dividendos e fecha brechas de pessoa jurídica (pejotização).',
    fx:{ aprov:1, grp:{mercado:-10, industria:-5, sindicatos:5}, eco:{primario:0.3, conf:-4} } },
  { id:'cortegastos', nome:'Pacote de revisão de gastos', tipo:'PLP', e:5, s:0, we:1, ws:0, pop:-0.5, tram:2,
    desc:'Revê regras de BPC, abono salarial e supersalários; limita crescimento de despesas obrigatórias.',
    fx:{ aprov:-4, grp:{mercado:14, movsociais:-10, sindicatos:-8}, eco:{primario:0.45, conf:10, dolarPct:-2}, mod:{pobreza:0.01} } },
  { id:'supersalarios', nome:'PEC do fim dos supersalários', tipo:'PEC', e:2, s:0, we:0.6, ws:0, pop:0.9, tram:3,
    desc:'Aplica o teto constitucional sem exceções (penduricalhos) a todos os Poderes.',
    fx:{ aprov:4, grp:{judiciario:-12, mercado:6, imprensa:6}, eco:{primario:0.08} } },
  { id:'autonomiabc', nome:'Autonomia financeira do Banco Central', tipo:'PEC', e:6, s:0, we:1, ws:0, pop:-0.1, tram:3,
    desc:'Transforma o BC em empresa pública com orçamento próprio, fora das regras fiscais.',
    fx:{ grp:{mercado:12, sindicatos:-4}, eco:{conf:6, dolarPct:-1.5}, flag:'bcAutonomo' } },
  { id:'bolsaplus', nome:'Ampliação do Bolsa Família', tipo:'PL', e:-6, s:-1, we:1, ws:0, pop:0.8, tram:2, mp:true,
    desc:'Eleva o benefício mínimo e cria adicional por criança na primeira infância.',
    fx:{ aprov:4, reg:{NE:4, N:2}, grp:{movsociais:8, mercado:-6}, eco:{primario:-0.25, pibShock:0.15}, mod:{pobreza:-0.05} } },
  { id:'mcmv', nome:'Minha Casa, Minha Vida — nova fase', tipo:'PL', e:-3, s:0, we:1, ws:0, pop:0.7, tram:2, mp:true,
    desc:'Meta de 1 milhão de moradias e faixa para classe média com juros subsidiados.',
    fx:{ aprov:3, grp:{comercio:5, industria:6, governadores:5}, eco:{primario:-0.12, pibShock:0.25}, mod:{infra:0.02} } },
  { id:'tarifazero', nome:'Tarifa Zero Nacional', tipo:'PLP', e:-7, s:-2, we:1, ws:0, pop:0.85, tram:3,
    desc:'Fundo federal para gratuidade de ônibus urbanos em cidades com mais de 100 mil habitantes.',
    fx:{ aprov:5, grp:{mercado:-8, governadores:8, movsociais:10}, eco:{primario:-0.3, inflShock:-0.3} } },
  { id:'novaindustria', nome:'Nova Indústria Brasil — crédito e conteúdo local', tipo:'PL', e:-3, s:0, we:1, ws:0, pop:0.3, tram:3, mp:true,
    desc:'Crédito do BNDES para neoindustrialização, semicondutores, defesa e complexo da saúde.',
    fx:{ grp:{industria:12, mercado:-5}, eco:{primario:-0.1, pibShock:0.2}, mod:{potencial:0.05} } },
  { id:'ferrovias', nome:'Programa de concessões e ferrovias', tipo:'PL', e:4, s:0, we:1, ws:0, pop:0.2, tram:3,
    desc:'Novo marco de autorizações ferroviárias, leilões de rodovias e portos via PPI.',
    fx:{ grp:{agro:10, mercado:8, industria:6}, eco:{conf:4}, mod:{potencial:0.08, infra:0.04} } },
  { id:'privcorreios', nome:'Privatização dos Correios', tipo:'PL', e:7, s:0, we:1, ws:0, pop:-0.3, tram:4,
    desc:'Desestatiza a empresa, que acumula prejuízos bilionários, com universalização garantida em contrato.',
    fx:{ aprov:-2, grp:{mercado:12, sindicatos:-15}, eco:{primario:0.1, conf:6} } },
  { id:'pne', nome:'Plano Nacional de Educação e ensino integral', tipo:'PL', e:-2, s:-1, we:0.6, ws:0.3, pop:0.6, tram:3,
    desc:'Metas decenais: ensino integral para 50% das escolas, alfabetização na idade certa e piso docente.',
    fx:{ aprov:2, grp:{sindicatos:5, governadores:4}, eco:{primario:-0.12}, mod:{educ:0.08} } },
  { id:'maismedicos', nome:'Agora Tem Especialistas — SUS', tipo:'PL', e:-3, s:0, we:1, ws:0, pop:0.8, tram:2, mp:true,
    desc:'Mutirões de cirurgias e consultas especializadas, contratação de médicos e uso da rede privada.',
    fx:{ aprov:3, grp:{governadores:5}, eco:{primario:-0.1}, mod:{saude:0.08} } },
  { id:'iaregula', nome:'Marco Legal da Inteligência Artificial', tipo:'PL', e:-1, s:-1, we:0.5, ws:0.5, pop:0.2, tram:3,
    desc:'Classifica sistemas por risco, protege direitos autorais e cria autoridade reguladora.',
    fx:{ grp:{imprensa:6, judiciario:4, industria:-2}, mod:{potencial:0.02}, rel:{UE:4, EUA:-3} } },
  { id:'redes', nome:'Regulação das plataformas digitais', tipo:'PL', e:-2, s:-5, we:0.3, ws:1, pop:0.1, tram:3,
    desc:'Dever de cuidado das big techs com conteúdo criminoso, transparência de algoritmos e publicidade.',
    fx:{ grp:{imprensa:10, judiciario:8, evangelicos:-8}, rel:{EUA:-8, UE:4} } },
  { id:'licamb', nome:'Desmatamento Zero 2030', tipo:'PL', e:-3, s:-5, we:0.5, ws:0.8, pop:0.3, tram:3,
    desc:'Metas legais de desmatamento zero, rastreabilidade bovina e mercado regulado de carbono.',
    fx:{ grp:{ambientalistas:15, agro:-12}, rel:{UE:8, China:2}, mod:{desmat:-0.05} } },
  { id:'mineracaoti', nome:'Mineração em terras indígenas', tipo:'PL', e:6, s:6, we:0.7, ws:0.7, pop:-0.3, tram:3,
    desc:'Autoriza garimpo e mineração industrial em terras indígenas mediante consulta.',
    fx:{ grp:{ambientalistas:-20, agro:8, movsociais:-10, judiciario:-6}, rel:{UE:-10}, eco:{pibShock:0.2}, mod:{desmat:0.06} } },
  { id:'marcotemporal', nome:'PEC do Marco Temporal', tipo:'PEC', e:5, s:6, we:0.5, ws:1, pop:-0.1, tram:4,
    desc:'Constitucionaliza que só são terras indígenas as ocupadas em 5 de outubro de 1988.',
    fx:{ grp:{agro:18, ambientalistas:-20, judiciario:-10}, rel:{UE:-6}, mod:{desmat:0.03} } },
  { id:'margemeq', nome:'Exploração da Margem Equatorial', tipo:'PL', e:4, s:2, we:1, ws:0.3, pop:0.3, tram:2,
    desc:'Política nacional para exploração de petróleo na foz do Amazonas, com royalties para a região Norte.',
    fx:{ reg:{N:5}, grp:{industria:6, ambientalistas:-15, mercado:5}, rel:{UE:-3}, mod:{potencial:0.05} } },
  { id:'transicao', nome:'Transição energética e hidrogênio verde', tipo:'PL', e:-1, s:-3, we:0.5, ws:0.5, pop:0.3, tram:3,
    desc:'Incentivos a eólicas offshore, hidrogênio verde no Nordeste e combustível sustentável de aviação.',
    fx:{ reg:{NE:3}, grp:{ambientalistas:8, industria:5}, rel:{UE:6, Japao:4}, eco:{primario:-0.05}, mod:{potencial:0.04} } },
  { id:'distrital', nome:'PEC do voto distrital misto', tipo:'PEC', e:2, s:1, we:0.3, ws:0.3, pop:0.1, tram:5,
    desc:'Metade da Câmara eleita por distritos, metade por lista partidária, a partir de 2030.',
    fx:{ grp:{imprensa:5}, party:{all:-6} } },
  { id:'fimreeleicao', nome:'PEC do fim da reeleição e mandato de 5 anos', tipo:'PEC', e:0, s:1, we:0, ws:0.2, pop:0.5, tram:4,
    desc:'Acaba a reeleição para cargos executivos a partir de 2034; seu direito à reeleição em 2030 fica preservado.',
    fx:{ aprov:2, grp:{imprensa:6, governadores:-6} } },
  { id:'prevmilitar', nome:'Reforma da previdência dos militares', tipo:'PL', e:4, s:-2, we:1, ws:0.3, pop:0.4, tram:3,
    desc:'Idade mínima para reserva remunerada e fim da pensão por morte ficta.',
    fx:{ grp:{militares:-18, mercado:6}, eco:{primario:0.08} } },
  { id:'cannabis', nome:'Cannabis medicinal e cânhamo industrial', tipo:'PL', e:1, s:-6, we:0.2, ws:1, pop:-0.1, tram:3,
    desc:'Regulamenta cultivo para fins medicinais e industriais, com controle da Anvisa.',
    fx:{ grp:{evangelicos:-14, movsociais:6, agro:4}, mod:{saude:0.01} } },
  { id:'escolacivica', nome:'Escolas cívico-militares', tipo:'PL', e:2, s:7, we:0.2, ws:1, pop:0.3, tram:2, mp:true,
    desc:'Programa federal de escolas com gestão compartilhada com militares e policiais.',
    fx:{ grp:{militares:8, evangelicos:6, sindicatos:-8, movsociais:-6}, mod:{educ:0.005} } },
  { id:'mercosulue', nome:'Ratificação do Acordo Mercosul–União Europeia', tipo:'PDL', e:3, s:0, we:1, ws:0, pop:0.2, tram:2,
    desc:'Abertura gradual de tarifas, cotas para carne e etanol, compras governamentais e regras de origem.',
    fx:{ grp:{agro:10, industria:-6, mercado:8}, rel:{UE:15, Argentina:3}, mod:{potencial:0.07} } },
  { id:'desoneracao', nome:'Desoneração da folha para 17 setores', tipo:'PL', e:4, s:0, we:1, ws:0, pop:0.2, tram:2, mp:true,
    desc:'Substitui contribuição patronal sobre a folha por alíquota sobre a receita bruta.',
    fx:{ grp:{industria:10, comercio:8, sindicatos:3}, eco:{primario:-0.15, pibShock:0.15}, mod:{desemp:-0.01} } },
  { id:'cashback', nome:'Cashback tributário para baixa renda', tipo:'PLP', e:-4, s:0, we:1, ws:0, pop:0.7, tram:2,
    desc:'Devolução de CBS/IBS na conta de luz, gás e alimentos para famílias do CadÚnico.',
    fx:{ aprov:3, reg:{NE:2}, eco:{primario:-0.1, inflShock:-0.1}, mod:{pobreza:-0.02} } },
];

// Medidas de agenda (ações do presidente)
const ACOES = [
  { id:'pronunciamento', nome:'Pronunciamento em rede nacional', custo:1, desc:'Fala na TV e no rádio. Rende aprovação, mas o efeito cai se repetido.' },
  { id:'visitaestado', nome:'Visitar um estado', custo:1, desc:'Agenda de entregas e comício. Sobe a aprovação no estado e na região.' },
  { id:'reuniaogrupo', nome:'Reunião com grupo de interesse', custo:1, desc:'Melhora a relação com um setor da sociedade.' },
  { id:'viagem', nome:'Viagem internacional', custo:2, desc:'Visita de Estado. Melhora relações e pode render acordos comerciais.' },
  { id:'emendas', nome:'Liberar emendas parlamentares', custo:1, desc:'R$ 3 bilhões a mais em emendas: base mais satisfeita, resultado primário pior.' },
  { id:'cafepartido', nome:'Negociar com um partido', custo:1, desc:'Jantar no Alvorada com a cúpula de um partido. Pode trazê-lo para a base.' },
  { id:'entrevista', nome:'Entrevista coletiva', custo:1, desc:'Melhora a relação com a imprensa; risco de gafe.' },
];

// =====================================================================
// Carimbos (conquistas) e reações da internet
// =====================================================================
const CARIMBOS = [
  { id:'rolo', nome:'Rolo compressor', desc:'Base fiel acima de 308 deputados', chk:s=>s.baseCamara>=308 },
  { id:'idolo', nome:'Ídolo nacional', desc:'Aprovação de 65% ou mais', chk:s=>s.aprov>=65 },
  { id:'volume', nome:'Volume morto', desc:'Aprovação abaixo de 20%', chk:s=>s.aprov<20 },
  { id:'domada', nome:'Inflação domada', desc:'IPCA em 12 meses até 3,5%', chk:s=>s.eco.ipca<=3.5 },
  { id:'pleno', nome:'Pleno emprego', desc:'Desemprego abaixo de 5%', chk:s=>s.eco.desemp<5 },
  { id:'pibao', nome:'Pibão', desc:'PIB crescendo 3,5% ou mais', chk:s=>s.eco.pib>=3.5 },
  { id:'recessao', nome:'Recessão técnica', desc:'PIB negativo', chk:s=>s.eco.pib<0 },
  { id:'dolar7', nome:'Dólar a sete', desc:'Dólar acima de R$ 7', chk:s=>s.eco.dolar>=7 },
  { id:'tesoura', nome:'Mão de tesoura', desc:'Superávit primário de 1% do PIB', chk:s=>s.eco.primario>=1 },
  { id:'constituinte', nome:'Emendou a Constituição', desc:'Aprovou uma PEC', chk:s=>s.aprovadas.some(id=>PROJETOS.find(p=>p.id===id).tipo==='PEC') },
  { id:'reformista', nome:'Reformista', desc:'8 projetos aprovados', chk:s=>s.aprovadas.length>=8 },
  { id:'caducou', nome:'Caducou', desc:'Deixou uma MP perder a validade', chk:s=>!!s.flags.mpCaiu },
  { id:'amigos', nome:'Amigo de todos', desc:'Média das relações externas acima de 65', chk:s=>Object.values(s.rel).reduce((a,b)=>a+b,0)/Object.keys(s.rel).length>=65 },
  { id:'floresta', nome:'Floresta em pé', desc:'Desmatamento abaixo de 3.500 km²', chk:s=>s.soc.desmat<3500 },
  { id:'paz', nome:'Paz nas ruas', desc:'Menos de 17 homicídios por 100 mil', chk:s=>s.soc.homic<17 },
  { id:'fome', nome:'Fome zero', desc:'Pobreza abaixo de 18%', chk:s=>s.soc.pobreza<18 },
  { id:'blindado', nome:'Blindado', desc:'Sobreviveu a uma votação de impeachment', chk:s=>!!s.flags.sobreviveu },
  { id:'hexa', nome:'Hexa!', desc:'Governou durante o hexacampeonato', chk:s=>!!s.flags.hexa },
  { id:'reeleito', nome:'Mais quatro anos', desc:'Venceu a eleição de 2030', chk:s=>!!(s.flags.eleicao && s.flags.eleicao.vence) },
];

const REACOES = {
  pos: [['@tiadozap_oficial','Compartilhem! Finalmente alguém fazendo alguma coisa nesse país.'],['@economista_de_x','Surpreendentemente sensato. Agora é ver a execução.'],['@motoboy_sp','Se chegar no bolso do povo, eu aplaudo.'],['@prof_de_historia','Medida acertada. Coisa rara em Brasília.'],['@agro_raiz','Até que enfim ouviram quem trabalha.'],['@estudante_ufba','Ponto pro governo hoje, não vou mentir.'],['@vizinha_fofoqueira','Meu marido que nunca elogia ninguém elogiou.']],
  neg: [['@faria_limer','Vendi tudo. Dólar vai a sete.'],['@tiadozap_oficial','ABSURDO!!! Repassem antes que apaguem!!!'],['@colunista_bsb','O Planalto perdeu o controle da narrativa.'],['@oposicao_raiz','Impeachment já. Só isso.'],['@meme_politico','o governo tentando explicar isso: [cachorro tomando café na casa pegando fogo]'],['@contribuinte_cansado','E quem paga a conta somos nós, como sempre.'],['@sindicato_geral','Traição com quem te elegeu.']],
  neu: [['@analista_politico','Jogada arriscada. O Centrão vai cobrar a fatura.'],['@jornal_meio_dia','Governo decide; mercado aguarda detalhes.'],['@cientista_politica','Efeito real só aparece daqui a seis meses.']],
};

const CAT_PROJ = {
  economia:['refadm','grandesfortunas','dividendos','cortegastos','supersalarios','autonomiabc','novaindustria','ferrovias','privcorreios','desoneracao','cashback','mercosulue'],
  social:['fim6x1','bolsaplus','mcmv','tarifazero','pne','maismedicos','prevmilitar'],
  seguranca:['pecseg','antifaccao','maioridade','escolacivica','cannabis'],
  ambiente:['licamb','mineracaoti','marcotemporal','margemeq','transicao'],
  instituicoes:['distrital','fimreeleicao','iaregula','redes'],
};
