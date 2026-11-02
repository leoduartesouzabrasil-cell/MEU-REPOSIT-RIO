// =====================================================================
// A FAIXA — pessoas reais
// Figuras públicas brasileiras com descrição factual da trajetória
// (situação conhecida até 2026). "tec" (preparo técnico para a pasta) e
// "pol" (trânsito político) são atributos de jogo, não avaliações pessoais.
// Escândalos do jogo atingem servidores e contratos das pastas, nunca as
// pessoas reais. Falas nas redes e pareceres são simulações ficcionais.
// =====================================================================

// [nome, gênero, partido|null, descrição, eixo econômico, eixo social, tec, pol]
const PESSOAS_MIN = {
  casacivil: [
    ['Rui Costa','m','PT','Ministro da Casa Civil no governo Lula 3; ex-governador da Bahia (2015–2022)',-4,-2,72,62],
    ['Gleisi Hoffmann','f','PT','Ex-presidente nacional do PT; ministra das Relações Institucionais (2025) e ex-ministra da Casa Civil (2011–2014)',-6,-5,60,74],
    ['Jaques Wagner','m','PT','Senador pela Bahia e líder do governo no Senado; ex-governador e ex-ministro da Casa Civil e da Defesa',-4,-2,66,88],
    ['Ciro Nogueira','m','PP','Senador pelo Piauí e presidente nacional do PP; ministro da Casa Civil (2021–2022)',5,4,55,90],
    ['Gilberto Kassab','m','PSD','Presidente nacional do PSD; ex-prefeito de São Paulo e ex-ministro das Cidades e da Ciência',3,2,66,92],
  ],
  fazenda: [
    ['Fernando Haddad','m','PT','Ministro da Fazenda no governo Lula 3 (arcabouço fiscal e reforma tributária); ex-prefeito de SP e ex-ministro da Educação',-3,-4,80,70],
    ['Henrique Meirelles','m','PSD','Presidente do Banco Central (2003–2010) e ministro da Fazenda (2016–2018), criador do teto de gastos',5,1,88,60],
    ['Paulo Guedes','m',null,'Ministro da Economia (2019–2022); economista liberal formado em Chicago',9,4,72,38],
    ['Armínio Fraga','m',null,'Presidente do Banco Central (1999–2002); economista, fundador da Gávea Investimentos',6,-1,92,40],
    ['Nelson Barbosa','m','PT','Ministro da Fazenda e do Planejamento no governo Dilma; professor da FGV e da UnB',-4,-2,82,50],
    ['Pérsio Arida','m',null,'Um dos formuladores do Plano Real; ex-presidente do BNDES e do Banco Central',5,-2,90,42],
  ],
  planej: [
    ['Simone Tebet','f','MDB','Ministra do Planejamento e Orçamento no governo Lula 3; ex-senadora e candidata à Presidência em 2022',2,0,72,76],
    ['Esther Dweck','f',null,'Ministra da Gestão e Inovação em Serviços Públicos no governo Lula 3; economista da UFRJ',-5,-3,78,45],
    ['Ana Carla Abrão','f',null,'Economista, ex-secretária da Fazenda de Goiás, especialista em gestão pública e RH do Estado',5,-1,82,35],
    ['Bruno Funchal','m',null,'Ex-secretário do Tesouro Nacional e ex-secretário especial de Fazenda (2020–2021)',6,0,80,35],
    ['Marcos Mendes','m',null,'Economista do Insper, um dos formuladores do teto de gastos de 2016',6,0,84,30],
  ],
  itamaraty: [
    ['Mauro Vieira','m',null,'Chanceler nos governos Dilma e Lula 3; diplomata de carreira',-2,-2,84,50],
    ['Celso Amorim','m','PT','Chanceler (1993–1994 e 2003–2010), ministro da Defesa (2011–2014) e assessor especial da Presidência',-5,-3,90,58],
    ['Aloysio Nunes','m','PSDB','Chanceler (2017–2018) e ex-senador por São Paulo',3,-1,70,62],
    ['Carlos França','m',null,'Chanceler (2021–2022), diplomata de carreira',2,2,74,40],
    ['Ernesto Araújo','m',null,'Chanceler (2019–2021), diplomata defensor de uma política externa conservadora',6,9,55,25],
  ],
  defesa: [
    ['José Múcio Monteiro','m',null,'Ministro da Defesa no governo Lula 3; ex-presidente do TCU e ex-deputado por Pernambuco',2,2,66,80],
    ['Hamilton Mourão','m','Republicanos','Senador pelo RS; general da reserva e vice-presidente da República (2019–2022)',5,7,62,50],
    ['Raul Jungmann','m',null,'Ministro da Defesa (2016–2018) e primeiro ministro da Segurança Pública (2018)',2,0,72,58],
    ['Aldo Rebelo','m',null,'Ministro da Defesa (2015–2016) e ex-presidente da Câmara, de trajetória no PCdoB',-1,3,62,62],
    ['Fernando Azevedo e Silva','m',null,'General da reserva, ministro da Defesa (2019–2021)',3,4,70,40],
  ],
  justica: [
    ['Ricardo Lewandowski','m',null,'Ministro da Justiça e Segurança Pública no governo Lula 3; ex-presidente do STF',-2,-3,82,55],
    ['Sergio Moro','m','União','Senador pelo Paraná; ex-juiz da Lava Jato e ministro da Justiça (2019–2020)',5,5,65,40],
    ['Guilherme Derrite','m','PP','Deputado federal por SP e ex-secretário da Segurança Pública de SP; capitão da reserva da PM',6,8,58,55],
    ['José Eduardo Cardozo','m','PT','Ministro da Justiça (2011–2016) e advogado-geral da União (2016)',-4,-4,74,55],
  ],
  saude: [
    ['Alexandre Padilha','m','PT','Ministro da Saúde (2011–2014 e a partir de 2025); médico infectologista',-5,-4,74,70],
    ['Nísia Trindade','f',null,'Primeira mulher a presidir a Fiocruz; ministra da Saúde (2023–2025)',-4,-5,84,40],
    ['Luiz Henrique Mandetta','m','União','Ministro da Saúde (2019–2020) no início da pandemia; médico ortopedista',4,2,76,58],
    ['Marcelo Queiroga','m','PL','Ministro da Saúde (2021–2022); médico cardiologista',6,7,60,45],
    ['José Gomes Temporão','m',null,'Ministro da Saúde (2007–2010); sanitarista e pesquisador da Fiocruz',-4,-5,82,45],
    ['Drauzio Varella','m',null,'Médico oncologista e comunicador; referência nacional em saúde pública',-2,-4,80,25],
  ],
  educacao: [
    ['Camilo Santana','m','PT','Ministro da Educação no governo Lula 3; ex-governador do Ceará, referência em alfabetização',-4,-2,76,74],
    ['Mendonça Filho','m','União','Deputado federal por PE; ministro da Educação (2016–2018), aprovou o Novo Ensino Médio',4,3,66,66],
    ['Priscila Cruz','f',null,'Cofundadora e presidente-executiva do Todos Pela Educação',0,-3,82,30],
    ['Tabata Amaral','f','PSB','Deputada federal por SP, ativista da educação pública',-2,-4,66,60],
    ['Cristovam Buarque','m',null,'Ministro da Educação (2003–2004), ex-governador do DF e ex-senador',-2,-2,72,45],
  ],
  agricultura: [
    ['Carlos Fávaro','m','PSD','Ministro da Agricultura no governo Lula 3; senador e produtor rural de Mato Grosso',3,3,68,72],
    ['Tereza Cristina','f','PP','Senadora por MS; ministra da Agricultura (2019–2022) e ex-líder da bancada ruralista',6,5,78,78],
    ['Pedro Lupion','m','PP','Deputado federal pelo Paraná e presidente da Frente Parlamentar da Agropecuária',7,6,58,80],
    ['Blairo Maggi','m',null,'Ministro da Agricultura (2016–2018), ex-governador de MT e empresário da soja',6,3,76,58],
    ['Roberto Rodrigues','m',null,'Ministro da Agricultura (2003–2006); coordenador do Centro de Agronegócio da FGV',3,1,86,50],
  ],
  ambiente: [
    ['Marina Silva','f','Rede','Ministra do Meio Ambiente (2003–2008 e no governo Lula 3), ex-senadora pelo Acre',-3,-1,82,55],
    ['Izabella Teixeira','f',null,'Ministra do Meio Ambiente (2010–2016), negociadora do Acordo de Paris',-2,-3,84,40],
    ['Sônia Guajajara','f','PSOL','Ministra dos Povos Indígenas no governo Lula 3; liderança histórica da Apib',-7,-7,62,50],
    ['Carlos Nobre','m',null,'Climatologista, referência mundial em Amazônia e mudanças climáticas',-2,-3,92,20],
    ['Ricardo Salles','m','Novo','Deputado federal por SP; ministro do Meio Ambiente (2019–2021)',8,6,50,45],
  ],
  social: [
    ['Wellington Dias','m','PT','Ministro do Desenvolvimento Social no governo Lula 3; quatro vezes governador do Piauí',-5,-1,70,76],
    ['Tereza Campello','f','PT','Ministra do Desenvolvimento Social (2011–2016), à frente do Brasil Sem Miséria',-6,-4,84,42],
    ['Damares Alves','f','Republicanos','Senadora pelo DF; ministra da Mulher, da Família e dos Direitos Humanos (2019–2022)',4,9,50,58],
    ['João Roma','m','PL','Ministro da Cidadania (2021–2022), responsável pelo Auxílio Brasil',5,5,58,52],
  ],
  minas: [
    ['Alexandre Silveira','m','PSD','Ministro de Minas e Energia no governo Lula 3; senador por Minas Gerais',3,2,62,78],
    ['Magda Chambriard','f',null,'Presidente da Petrobras a partir de 2024; ex-diretora-geral da ANP',-2,-1,84,40],
    ['Jean Paul Prates','m','PT','Presidente da Petrobras (2023–2024) e ex-senador pelo RN',-3,-2,78,55],
    ['Bento Albuquerque','m',null,'Almirante de esquadra; ministro de Minas e Energia (2019–2022)',5,4,74,40],
    ['Adriano Pires','m',null,'Economista, fundador do Centro Brasileiro de Infraestrutura (CBIE)',6,1,78,30],
  ],
  transportes: [
    ['Renan Filho','m','MDB','Ministro dos Transportes no governo Lula 3; ex-governador de Alagoas',0,1,70,78],
    ['Tarcísio de Freitas','m','Republicanos','Ministro da Infraestrutura (2019–2022) e governador de SP eleito em 2022; engenheiro militar',6,6,84,72],
    ['Silvio Costa Filho','m','Republicanos','Ministro de Portos e Aeroportos no governo Lula 3; deputado federal por PE',3,4,60,72],
    ['Márcio França','m','PSB','Ex-governador de SP e ministro no governo Lula 3 (Portos e Aeroportos; Empreendedorismo)',-1,0,60,70],
  ],
  cidades: [
    ['Jader Filho','m','MDB','Ministro das Cidades no governo Lula 3, à frente do Minha Casa, Minha Vida',0,1,62,70],
    ['Guilherme Boulos','m','PSOL','Ministro da Secretaria-Geral da Presidência (2025); ex-coordenador do MTST',-8,-6,58,60],
    ['Rogério Marinho','m','PL','Senador pelo RN; ministro do Desenvolvimento Regional (2020–2022) e relator da reforma trabalhista',7,6,70,74],
    ['Eduardo Paes','m','PSD','Prefeito do Rio de Janeiro (2009–2016 e a partir de 2021)',2,-1,78,82],
    ['Raquel Rolnik','f',null,'Urbanista da FAU-USP e ex-relatora da ONU para o direito à moradia',-6,-6,86,25],
  ],
  mdic: [
    ['Geraldo Alckmin','m','PSB','Vice-presidente e ministro do Desenvolvimento, Indústria e Comércio no governo Lula 3; quatro vezes governador de SP',2,3,76,84],
    ['Luiza Trajano','f',null,'Presidente do conselho do Magazine Luiza e fundadora do Grupo Mulheres do Brasil',0,-3,80,50],
    ['Paulo Skaf','m',null,'Presidente da Fiesp (2004–2021)',5,4,66,64],
    ['Josué Gomes da Silva','m',null,'Empresário da Coteminas e ex-presidente da Fiesp',2,1,70,48],
  ],
  trabalho: [
    ['Luiz Marinho','m','PT','Ministro do Trabalho no governo Lula 3; ex-presidente da CUT',-7,-3,66,66],
    ['Paulo Paim','m','PT','Senador pelo RS, autor do Estatuto do Idoso e defensor histórico da redução da jornada',-7,-4,60,60],
    ['Erika Hilton','f','PSOL','Deputada federal por SP, autora da PEC pelo fim da escala 6x1',-8,-9,55,55],
    ['Paulinho da Força','m','Solidariedade','Deputado federal por SP, presidente do Solidariedade e fundador da Força Sindical',-2,2,52,74],
  ],
  ciencia: [
    ['Luciana Santos','f','PCdoB','Ministra da Ciência e Tecnologia no governo Lula 3; presidente nacional do PCdoB',-6,-4,64,64],
    ['Marcos Pontes','m','PL','Senador por SP, primeiro astronauta brasileiro e ministro da Ciência (2019–2022)',5,5,66,46],
    ['Helena Nader','f',null,'Presidente da Academia Brasileira de Ciências; bioquímica da Unifesp',-3,-5,88,35],
    ['Miguel Nicolelis','m',null,'Neurocientista, pioneiro em interfaces cérebro-máquina',-6,-5,86,20],
    ['Sérgio Rezende','m',null,'Ministro da Ciência e Tecnologia (2005–2010); físico da UFPE',-3,-3,84,45],
  ],
};

// Vices possíveis
const VICES = [
  ['Geraldo Alckmin','m','PSB','Vice-presidente no governo Lula 3; quatro vezes governador de SP',2,3],
  ['Simone Tebet','f','MDB','Ministra do Planejamento; ex-senadora por MS',2,0],
  ['Tereza Cristina','f','PP','Senadora por MS e ex-ministra da Agricultura',6,5],
  ['Hamilton Mourão','m','Republicanos','Senador pelo RS e vice-presidente (2019–2022)',5,7],
  ['Marina Silva','f','Rede','Ministra do Meio Ambiente; ex-senadora pelo Acre',-3,-1],
  ['Ratinho Júnior','m','PSD','Governador do Paraná (eleito em 2018 e 2022)',4,5],
  ['Romeu Zema','m','Novo','Governador de Minas Gerais (eleito em 2018 e 2022)',8,5],
  ['Eduardo Leite','m','PSD','Governador do Rio Grande do Sul (eleito em 2018 e 2022)',3,-2],
  ['Helder Barbalho','m','MDB','Governador do Pará (eleito em 2018 e 2022), anfitrião da COP30',1,1],
  ['Camilo Santana','m','PT','Ministro da Educação; ex-governador do Ceará',-4,-2],
  ['Michelle Bolsonaro','f','PL','Presidente do PL Mulher e ex-primeira-dama (2019–2022)',6,9],
  ['Tabata Amaral','f','PSB','Deputada federal por SP',-2,-4],
];

// Presidentes que podem ser escolhidos (figuras reais)
const PRES_REAIS = [
  { nome:'Luiz Inácio Lula da Silva', partido:'PT', uf:'PE', idade:81, bg:'sindicalista', e:-5.5, s:-3.5, desc:'Presidente em três mandatos; ex-líder metalúrgico do ABC' },
  { nome:'Flávio Bolsonaro', partido:'PL', uf:'RJ', idade:45, bg:'parlamentar', e:7, s:8.5, desc:'Senador pelo RJ e candidato do PL à Presidência em 2026' },
  { nome:'Tarcísio de Freitas', partido:'Republicanos', uf:'SP', idade:51, bg:'governador', e:6, s:6, desc:'Governador de SP eleito em 2022; ex-ministro da Infraestrutura' },
  { nome:'Ratinho Júnior', partido:'PSD', uf:'PR', idade:45, bg:'governador', e:4, s:5, desc:'Governador do Paraná' },
  { nome:'Ronaldo Caiado', partido:'União', uf:'GO', idade:77, bg:'governador', e:6, s:7, desc:'Governador de Goiás; médico e líder ruralista' },
  { nome:'Romeu Zema', partido:'Novo', uf:'MG', idade:62, bg:'empresario', e:8.5, s:5, desc:'Governador de MG; empresário do varejo' },
  { nome:'Simone Tebet', partido:'MDB', uf:'MS', idade:56, bg:'parlamentar', e:2, s:0, desc:'Ministra do Planejamento; ex-senadora' },
  { nome:'Eduardo Leite', partido:'PSD', uf:'RS', idade:41, bg:'governador', e:3, s:-2, desc:'Governador do Rio Grande do Sul' },
  { nome:'Marina Silva', partido:'Rede', uf:'AC', idade:68, bg:'parlamentar', e:-3, s:-1, desc:'Ministra do Meio Ambiente; três vezes candidata à Presidência' },
  { nome:'Guilherme Boulos', partido:'PSOL', uf:'SP', idade:44, bg:'movimento', e:-8, s:-6, desc:'Ex-coordenador do MTST; ministro da Secretaria-Geral' },
];

// Lideranças partidárias (presidentes de partido conhecidos até 2026)
const LIDERES = {
  PT:'Edinho Silva', PL:'Valdemar Costa Neto', PSD:'Gilberto Kassab', MDB:'Baleia Rossi', PP:'Ciro Nogueira',
  'União':'Antonio Rueda', Republicanos:'Marcos Pereira', PSB:'Carlos Siqueira', PDT:'Carlos Lupi', PSOL:'Paula Coradi',
  PCdoB:'Luciana Santos', Solidariedade:'Paulinho da Força', Podemos:'Renata Abreu', PSDB:'Marconi Perillo', Avante:'Luis Tibé', PV:'José Luiz Penna',
};
const MESA_INICIAL = { camara:'Hugo Motta (Republicanos-PB)', senado:'Davi Alcolumbre (União-AP)' };

// Frentes parlamentares: fração de cada bancada que integra a frente
const FRENTES = [
  { id:'fpa', nome:'Frente Parlamentar da Agropecuária', apelido:'bancada ruralista', lider:'Pedro Lupion (PP-PR)', grp:'agro',
    share:{PL:.6,PP:.75,'União':.65,PSD:.65,MDB:.6,Republicanos:.55,Podemos:.5,PSDB:.5,Novo:.5,PRD:.6,Avante:.5,Solidariedade:.4,PSB:.2,PDT:.2,PT:.05} },
  { id:'fpe', nome:'Frente Parlamentar Evangélica', apelido:'bancada da Bíblia', lider:null, grp:'evangelicos',
    share:{PL:.45,Republicanos:.7,PP:.3,'União':.3,PSD:.25,MDB:.25,Podemos:.3,PRD:.4,Avante:.3,PSDB:.15,PSB:.1,PDT:.1,PT:.05,Novo:.2} },
  { id:'bala', nome:'Frente Parlamentar da Segurança Pública', apelido:'bancada da bala', lider:null, grp:'militares',
    share:{PL:.45,PP:.3,'União':.3,Republicanos:.3,PSD:.2,MDB:.15,Novo:.3,Podemos:.2,PRD:.3,Avante:.2} },
  { id:'trab', nome:'Frente em Defesa dos Trabalhadores', apelido:'bancada sindical', lider:null, grp:'sindicatos',
    share:{PT:.8,PSOL:.9,PCdoB:.9,PDT:.6,PSB:.5,Rede:.6,PV:.4,Solidariedade:.6,MDB:.1,PSD:.05} },
  { id:'amb', nome:'Frente Parlamentar Ambientalista', apelido:'bancada verde', lider:null, grp:'ambientalistas',
    share:{PSOL:.9,Rede:1,PV:.9,PT:.6,PSB:.5,PDT:.4,PCdoB:.6,MDB:.1,PSDB:.2,PSD:.05} },
];

// Como as frentes reagem aos projetos pré-definidos (-1 contra, +1 a favor)
const FRENTES_PROJ = {
  fim6x1:{trab:1}, refadm:{trab:-1}, pecseg:{bala:.7}, antifaccao:{bala:1,fpe:.4}, maioridade:{bala:1,fpe:.8,trab:-.4},
  grandesfortunas:{fpa:-.6,trab:.8}, cortegastos:{trab:-.8}, bolsaplus:{trab:.4}, tarifazero:{trab:.6},
  licamb:{fpa:-1,amb:1}, mineracaoti:{fpa:.6,amb:-1}, marcotemporal:{fpa:1,amb:-1}, margemeq:{amb:-.8}, transicao:{amb:.8},
  cannabis:{fpe:-1,bala:-.6}, escolacivica:{bala:.8,fpe:.6,trab:-.5}, mercosulue:{fpa:.7}, desoneracao:{trab:.3},
  prevmilitar:{bala:-1}, redes:{fpe:-.7}, anistia:{bala:1,fpe:.6,trab:-.8}, blindagem:{}, reformaagraria:{fpa:-1,trab:.7,amb:.3},
  bigtechs:{fpe:-.3}, foro:{}, aborto:{fpe:1}, armas:{bala:1,fpe:.4,trab:-.5},
};

// Comentaristas reais: [nome, quem é, e, s, [elogios], [críticas]]
const COMENTARISTAS = [
  ['Miriam Leitão','jornalista, O Globo e GloboNews',1,-3,['Do ponto de vista fiscal, a medida é defensável. Falta saber se o governo vai executar.','Uma notícia boa, rara nesta semana em Brasília.'],['O custo disso vai aparecer na conta de juros. A economia não perdoa improviso.','É um erro que o país já cometeu antes, e pagou caro.']],
  ['Reinaldo Azevedo','jornalista, BandNews e UOL',1,-2,['Correto e dentro da Constituição. Os inimigos da democracia que se acalmem.','Gol do governo. Sem firula.'],['Isso aí não para em pé no Supremo, e o governo sabe.','Erro político primário. Vai entregar o discurso de bandeja para a oposição.']],
  ['Andréia Sadi','jornalista, GloboNews',0,-2,['Nos bastidores, aliados comemoram: o Planalto ganhou fôlego.','Interlocutores do presidente dizem que a jogada foi calculada.'],['Aliados admitem, reservadamente, que a decisão saiu cara.','No Congresso, a leitura é de que o governo perdeu a mão.']],
  ['Natuza Nery','jornalista, GloboNews',-1,-3,['Movimento inteligente: o governo pautou o debate em vez de reagir.','A medida desarma parte da oposição.'],['O governo abriu um flanco que não precisava abrir.','A conta política dessa decisão vai chegar.']],
  ['Merval Pereira','colunista, O Globo',3,0,['Acerto do governo, que mostrou responsabilidade.','Uma decisão de estadista, para variar.'],['O populismo cobra seu preço mais cedo ou mais tarde.','Mais um passo na direção errada.']],
  ['Leonardo Sakamoto','jornalista, UOL',-5,-6,['Quem ganha com isso são os mais pobres. Já era hora.','Uma vitória de quem vive do próprio trabalho.'],['Mais uma vez, a conta fica com o trabalhador.','Direitos não deveriam estar na mesa de negociação.']],
  ['Mônica Bergamo','colunista, Folha de S.Paulo',-2,-3,['Ministros contam que a decisão foi tomada pessoalmente pelo presidente.','Repercussão positiva entre empresários e lideranças sociais.'],['A coluna apurou que até aliados ficaram contrariados.','Gente próxima do Planalto não esconde o desconforto.']],
  ['Alexandre Garcia','comentarista político',6,7,['Finalmente uma decisão de bom senso.','O brasileiro de bem agradece.'],['Mais Estado, mais imposto, menos liberdade. Já vimos esse filme.','Quem vai pagar isso é você, que trabalha.']],
  ['Felipe Neto','youtuber e influenciador',-3,-5,['Isso aqui é o mínimo que se espera de um governo sério.','Bom ver uma decisão que pensa nas pessoas.'],['Não dá para passar pano para isso.','Decisão péssima. E eu vou falar mesmo.']],
  ['Nikolas Ferreira','deputado federal (PL-MG) e influenciador',7,9,['Pelo menos uma vez, o governo ouviu a população.','Vitória da família brasileira.'],['Isso é um ataque direto ao cidadão de bem. Não vamos aceitar.','Querem decidir a sua vida por você.']],
  ['Jones Manoel','historiador e comunicador marxista',-9,-6,['Passo pequeno, mas na direção certa. A luta continua.','A classe trabalhadora arrancou essa.'],['Governo de conciliação faz isso: entrega para o mercado.','É o capital mandando, como sempre.']],
  ['Kim Kataguiri','deputado federal (União-SP)',7,3,['Medida correta. Raramente digo isso deste governo.','Menos burocracia, mais liberdade. Apoio.'],['Gasto sem lastro. Alguém vai pagar a conta.','Mais um puxadinho fiscal.']],
  ['Erika Hilton','deputada federal (PSOL-SP)',-8,-9,['Conquista do povo trabalhador. Seguimos.','Isso muda a vida real das pessoas.'],['Retrocesso. Não vamos aceitar calados.','Mais uma vez, os de sempre pagam a conta.']],
  ['Samuel Pessôa','economista, FGV Ibre',5,-1,['A medida tem racionalidade econômica.','Bom desenho; o efeito aparece em dois anos.'],['A economia política disso não fecha.','Quem vai financiar? A conta não fecha.']],
  ['Laura Carvalho','economista, USP',-5,-5,['Política bem desenhada, com efeito distributivo claro.','A evidência empírica sustenta essa escolha.'],['Medida regressiva: pesa mais sobre os mais pobres.','Austeridade na hora errada aprofunda a desigualdade.']],
  ['Monica de Bolle','economista, Peterson Institute',2,-4,['Uma resposta técnica correta.','Raro ver evidência guiando a política pública.'],['Faltou dado e sobrou improviso.','O mercado vai cobrar, e com razão.']],
  ['Tabata Amaral','deputada federal (PSB-SP)',-2,-4,['Política pública séria, com foco em resultado.','É assim que se faz: com dados e diálogo.'],['Faltou ouvir quem está na ponta.','Do jeito que está, não vai funcionar.']],
  ['Pablo Marçal','empresário e influenciador',8,6,['Isso aqui é atitude! Quem é forte entende.','Tá vendo? Dá para fazer quando quer.'],['Estado inchado, quem trabalha que se vire.','Mais imposto pra sustentar a máquina. Acorda!']],
];

const AVISO_SIMULACAO = 'Reações e pareceres são simulações ficcionais inspiradas no perfil público de cada pessoa; não são falas reais.';
