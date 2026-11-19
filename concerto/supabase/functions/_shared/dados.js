// =====================================================================
// CONCERTO DAS NAÇÕES — dados próprios do modo online
// Partidos, estados e projetos vêm da A Faixa (dados-faixa.js).
// =====================================================================

// Cadeiras por UF. Deputados federais: distribuição em vigor (513).
// Deputados estaduais (art. 27 da Constituição): 3x os federais até 36;
// acima disso, +1 para cada federal além de 12. DF: 24 deputados distritais.
export const FEDERAIS = { SP:70, MG:53, RJ:46, BA:39, RS:31, PR:30, PE:25, CE:22, MA:18, GO:17, PA:17, SC:16, PB:12,
  ES:10, PI:10, AL:9, AM:8, MT:8, MS:8, DF:8, RN:8, SE:8, RO:8, TO:8, AC:8, AP:8, RR:8 };
export const estaduais = uf => { const f = FEDERAIS[uf]; return uf === 'DF' ? 24 : (f <= 12 ? 3 * f : 36 + (f - 12)); };

export const CARGOS = {
  presidente: { nome:'Presidente da República', curto:'Presidente', casa:null,     nacional:true },
  senador:    { nome:'Senador(a)',              curto:'Senador',    casa:'senado' },
  dep_fed:    { nome:'Deputado(a) federal',     curto:'Dep. federal', casa:'camara' },
  dep_est:    { nome:'Deputado(a) estadual',    curto:'Dep. estadual', casa:'ale' },
};
export const vagas = (cargo, uf) => cargo === 'senador' ? 3 : cargo === 'dep_fed' ? FEDERAIS[uf] : cargo === 'dep_est' ? estaduais(uf) : 1;

// Eleitorado fictício de cada estado: segmentos com posição ideológica
// (e: economia -10 esquerda..+10 direita; s: costumes -10 progressista..+10 conservador)
// e peso por região. É uma população simulada, não pesquisa real.
export const SEGMENTOS = [
  { id:'trab',   nome:'Trabalhadores formais',     e:-4, s: 1, cor:'#C8201E' },
  { id:'perif',  nome:'Periferia e baixa renda',   e:-6, s: 3, cor:'#E06A2C' },
  { id:'media',  nome:'Classe média urbana',       e: 3, s:-1, cor:'#3F7CAC' },
  { id:'evang',  nome:'Evangélicos',               e: 2, s: 8, cor:'#6B4E9B' },
  { id:'agro',   nome:'Interior e agro',           e: 6, s: 6, cor:'#4E8F3A' },
  { id:'jovens', nome:'Jovens e estudantes',       e:-4, s:-6, cor:'#EBB52A' },
  { id:'empre',  nome:'Empresários e autônomos',   e: 7, s: 2, cor:'#1F3A5F' },
];
export const PESO_SEG = { // por região, soma 1
  N:  { trab:.12, perif:.24, media:.11, evang:.18, agro:.18, jovens:.10, empre:.07 },
  NE: { trab:.14, perif:.30, media:.11, evang:.14, agro:.12, jovens:.12, empre:.07 },
  CO: { trab:.13, perif:.16, media:.15, evang:.17, agro:.20, jovens:.10, empre:.09 },
  SE: { trab:.19, perif:.19, media:.19, evang:.15, agro:.06, jovens:.12, empre:.10 },
  S:  { trab:.18, perif:.13, media:.19, evang:.12, agro:.15, jovens:.11, empre:.12 },
};
export const ELEITORADO = 155_000_000; // aprox. eleitorado brasileiro em 2026

// Governadores (mandato 2027–2030, eleitos em out/2026) e prefeitos das capitais
// (mandato 2025–2028; onde o eleito renunciou em 2026, o vice que assumiu).
// São pessoas reais e NÃO são jogáveis: aparecem como autoridades que apoiam
// ou não os jogadores. As reações delas no jogo são simulações ficcionais.
// Fontes em concerto/FONTES.md. "conf:false" = confirmar antes de publicar.
export const AUTORIDADES = {
  AC:{ gov:['Mailza Assis','PP'],              cap:'Rio Branco',     pref:['Tião Bocalom','PL'] },
  AL:{ gov:['JHC','PSDB'],                     cap:'Maceió',         pref:['Rodrigo Cunha',null] },
  AP:{ gov:['Dr. Furlan','PSD'],               cap:'Macapá',         pref:['vice de Dr. Furlan',null], conf:false },
  AM:{ gov:['Omar Aziz','PSD'],                cap:'Manaus',         pref:['Renato Junior',null] },
  BA:{ gov:['Jerônimo Rodrigues','PT'],        cap:'Salvador',       pref:['Bruno Reis','União'] },
  CE:{ gov:['Elmano de Freitas','PT'],         cap:'Fortaleza',      pref:['Evandro Leitão','PT'] },
  DF:{ gov:['Celina Leão','PP'],               cap:'Brasília',       pref:null },
  ES:{ gov:['Lorenzo Pazolini','Republicanos'],cap:'Vitória',        pref:['Cris Samorini','PP'] },
  GO:{ gov:['Daniel Vilela','MDB'],            cap:'Goiânia',        pref:['Sandro Mabel','União'] },
  MA:{ gov:['Eduardo Braide','PSD'],           cap:'São Luís',       pref:['vice de Eduardo Braide',null], conf:false },
  MT:{ gov:['Otaviano Pivetta','Republicanos'],cap:'Cuiabá',         pref:['Abilio Brunini','PL'] },
  MS:{ gov:['Eduardo Riedel','PP'],            cap:'Campo Grande',   pref:['Adriane Lopes','PP'] },
  MG:{ gov:['Cleitinho','Republicanos'],       cap:'Belo Horizonte', pref:['Álvaro Damião','União'] },
  PA:{ gov:['Dr. Daniel','Podemos'],           cap:'Belém',          pref:['Igor Normando','MDB'] },
  PB:{ gov:['Lucas Ribeiro','PP'],             cap:'João Pessoa',    pref:['Leo Bezerra','Cidadania'] },
  PR:{ gov:['Sergio Moro','PL'],               cap:'Curitiba',       pref:['Eduardo Pimentel','PSD'] },
  PE:{ gov:['Raquel Lyra','PSD'],              cap:'Recife',         pref:['Victor Marques','PCdoB'] },
  PI:{ gov:['Rafael Fonteles','PT'],           cap:'Teresina',       pref:['Silvio Mendes','União'] },
  RJ:{ gov:['Douglas Ruas','PL'],              cap:'Rio de Janeiro', pref:['Eduardo Cavaliere','PSD'] },
  RN:{ gov:['Cadu de Lula','PT'],              cap:'Natal',          pref:['Paulinho Freire','União'] },
  RS:{ gov:['Luciano Zucco','PL'],             cap:'Porto Alegre',   pref:['Sebastião Melo','MDB'] },
  RO:{ gov:['Marcos Rogério','PL'],            cap:'Porto Velho',    pref:['Léo Moraes','Podemos'] },
  RR:{ gov:['Arthur Henrique','PL'],           cap:'Boa Vista',      pref:['vice de Arthur Henrique',null], conf:false },
  SC:{ gov:['Jorginho Mello','PL'],            cap:'Florianópolis',  pref:['Topázio Neto','PSD'] },
  SP:{ gov:['Tarcísio de Freitas','Republicanos'],cap:'São Paulo',   pref:['Ricardo Nunes','MDB'] },
  SE:{ gov:['Fábio Mitidieri','PSD'],          cap:'Aracaju',        pref:['Emília Corrêa','PL'] },
  TO:{ gov:['Vicentinho Júnior','PSDB'],       cap:'Palmas',         pref:['Eduardo Siqueira Campos','Podemos'] },
};

// Ações de campanha: pc = capital político, custo = R$ mil.
export const ACOES_CAMPANHA = [
  { id:'comicio',   nome:'Comício',            pc:2, custo:30,  desc:'Ato na praça do seu estado. Aumenta o quanto o eleitorado te conhece.' },
  { id:'visita',    nome:'Visitar um segmento',pc:1, custo:5,   desc:'Corpo a corpo com um grupo de eleitores: ganha simpatia nele, perde um pouco no grupo oposto.', seg:true },
  { id:'tv',        nome:'Propaganda na TV e no rádio', pc:1, custo:120, desc:'Caro, mas chega a todo o estado.' },
  { id:'redes',     nome:'Campanha nas redes', pc:1, custo:5,   desc:'Barato e imprevisível: pode viralizar ou virar gafe. Forte entre os jovens.' },
  { id:'apoio',     nome:'Pedir apoio ao governador', pc:2, custo:0, desc:'O governador real do estado pode declarar apoio (simulação). Depende da afinidade com o seu partido. Uma vez por eleição.' },
  { id:'arrecadar', nome:'Arrecadar fundos',   pc:2, custo:0,   desc:'Jantares e doações de pessoas físicas. Rende mais para quem já tem mandato.' },
];
export const ACOES_MANDATO = [
  { id:'discurso', nome:'Discurso na tribuna', pc:1, desc:'Reforça sua imagem no estado e marca posição.' },
  { id:'emenda',   nome:'Emenda para o estado', pc:2, desc:'Leva obra e verba para a sua base. Sobe a fama no estado; pesa no caixa do governo.', cargos:['dep_fed','senador'] },
];

export const MESES = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
export const ANO_INICIAL = 2027;
export const dataJogo = m => `${MESES[m % 12]}/${ANO_INICIAL + Math.floor(m / 12)}`;
