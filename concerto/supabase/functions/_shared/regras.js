// =====================================================================
// CONCERTO DAS NAÇÕES — regras do jogo (puras, sem DOM e sem rede)
// O mesmo arquivo roda no navegador (modo demonstração) e na função do
// servidor (Supabase Edge Function), que é quem manda no modo online.
//   aplicar(estado, jogadorId, acao, agora, rnd) -> { est, msg }
// Toda jogada inválida lança Error com uma mensagem para o jogador.
// =====================================================================
import { PARTIDOS, ESTADOS, PROJETOS } from './dados-faixa.js';
import { CARGOS, vagas, SEGMENTOS, PESO_SEG, ELEITORADO, AUTORIDADES, ACOES_CAMPANHA, ACOES_MANDATO, dataJogo } from './dados.js';

export const CONFIG_PADRAO = {
  ciclo: 6,                       // eleição a cada 6 meses de jogo (apuração no fim do mês 6, 12, 18...)
  intervaloPresidente: 6 * 3600e3,// o presidente pode virar o mês a cada 6 h reais
  intervaloLivre: 24 * 3600e3,    // se o presidente sumir, qualquer jogador vira o mês depois de 24 h
  pcMax: 20, pcMes: 6,            // capital político
};

const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const r1 = x => Math.round(x * 10) / 10;
export const partido = id => PARTIDOS.find(p => p.id === id) || { id, nome:id, cor:'#7A7368', e:0, s:0, dep:0, sen:0, fis:.5 };
export const estado = uf => ESTADOS.find(e => e.uf === uf);
const dist = (a, b) => Math.hypot((a.e - b.e), (a.s - b.s) * 0.8);
const erro = m => { throw new Error(m); };

// ---------- consultas ----------
export const chave = (cargo, uf) => `${cargo}:${uf}`;
export const ocupantes = (est, cargo, uf) => Object.values(est.jogadores).filter(j => j.cargo && j.cargo.cargo === cargo && j.cargo.uf === uf);
export const proximaEleicao = (est, mes = est.mes) => { const c = est.cfg.ciclo; return Math.ceil((mes + 1) / c) * c - 1; };
export function vagasLivres(est, cargo, uf) {
  const d = est.disputas[chave(cargo, uf)];
  return vagas(cargo, uf) - ocupantes(est, cargo, uf).length - (d ? d.desafiantes.length : 0);
}
export function casaDe(cargo) { return CARGOS[cargo]?.casa || null; }
export function assentosCasa(casa) {
  if (casa === 'camara') return 513;
  if (casa === 'senado') return 81;
  if (casa.startsWith('ale:')) return vagas('dep_est', casa.slice(4));
  return 0;
}
export function membrosCasa(est, casa) {
  if (casa === 'camara') return Object.values(est.jogadores).filter(j => j.cargo?.cargo === 'dep_fed');
  if (casa === 'senado') return Object.values(est.jogadores).filter(j => j.cargo?.cargo === 'senador');
  const uf = casa.slice(4); return ocupantes(est, 'dep_est', uf);
}
export const naCasa = c => (c === 'senado' ? 'no ' : 'na ') + nomeCasa(c);
export const nomeCasa = c => c === 'camara' ? 'Câmara dos Deputados' : c === 'senado' ? 'Senado Federal' : c.startsWith('ale:') ? `Assembleia de ${c.slice(4)}` : c;

// Composição de uma casa: jogadores + cadeiras de NPC divididas pela bancada real dos partidos.
export function composicao(est, casa) {
  const total = assentosCasa(casa), jog = membrosCasa(est, casa);
  const npc = total - jog.length, base = casa === 'senado' ? 'sen' : 'dep';
  const soma = PARTIDOS.reduce((s, p) => s + p[base], 0);
  let resto = npc; const bancadas = PARTIDOS.map(p => { const n = Math.floor(npc * p[base] / soma); resto -= n; return { p, n, frac: npc * p[base] / soma - n }; });
  bancadas.sort((a, b) => b.frac - a.frac).forEach((b, i) => { if (i < resto) b.n++; });
  bancadas.sort((a, b) => a.p.e - b.p.e);
  return { total, jogadores: jog, npc: bancadas.filter(b => b.n > 0).map(b => ({ partido: b.p.id, cor: b.p.cor, n: b.n })) };
}

// Pesquisa eleitoral simulada de uma disputa (população fictícia por segmento).
export function projecao(est, cargo, uf, ids) {
  const E = estado(uf), pesos = PESO_SEG[E.reg];
  const eleitores = ELEITORADO * E.peso / 100 * 0.8;
  const cand = ids.map(id => est.jogadores[id]).filter(Boolean);
  const tot = Object.fromEntries(cand.map(c => [c.id, 0])); let brancos = 0;
  const seg = {};
  for (const g of SEGMENTOS) {
    const sc = cand.map(c => {
      const fama = c.fama[uf] || 0, simp = c.simp[uf]?.[g.id] || 0;
      const inc = c.cargo && c.cargo.cargo === cargo && c.cargo.uf === uf ? 0.4 : 0;
      return Math.exp(fama / 22 + simp / 20 - dist(c, g) / 5 + inc);
    });
    const bn = Math.exp(0.6), soma = sc.reduce((a, b) => a + b, 0) + bn;
    const ne = eleitores * pesos[g.id];
    seg[g.id] = {};
    cand.forEach((c, i) => { const v = ne * sc[i] / soma; tot[c.id] += v; seg[g.id][c.id] = sc[i] / soma; });
    brancos += ne * bn / soma;
  }
  const validos = Object.values(tot).reduce((a, b) => a + b, 0) || 1;
  const lista = cand.map(c => ({ id: c.id, nome: c.nome, partido: c.partido, votos: Math.round(tot[c.id]), pct: r1(100 * tot[c.id] / validos) }))
    .sort((a, b) => b.votos - a.votos);
  return { lista, brancos: Math.round(brancos), seg };
}
export function candidatosDisputa(est, k) {
  const d = est.disputas[k]; if (!d) return [];
  const [cargo, uf] = k.split(':');
  return [...ocupantes(est, cargo, uf).map(j => j.id), ...d.desafiantes];
}

// Placar de uma votação: votos dos jogadores + bancadas NPC (por afinidade ideológica).
export function placar(est, p, rnd = () => 0.5) {
  const comp = composicao(est, p.casa);
  const pres = est.jogadores[est.presidente];
  let sim = 0, nao = 0, abst = 0; const jog = { sim: 0, nao: 0, abst: 0 };
  for (const j of comp.jogadores) { const v = p.votos[j.id] || 'abst'; jog[v]++; }
  for (const b of comp.npc) {
    const pt = partido(b.partido);
    const dp = Math.hypot((p.we ?? 1) * (p.e - pt.e), (p.ws ?? 1) * (p.s - pt.s) * 0.8);
    let z = (4.6 - dp) / 1.5 + (p.pop || 0) * 0.6;
    if (pres && p.casa !== undefined && !p.casa.startsWith('ale:')) z += dist(p, pres) < 4 ? 0.5 * pt.fis : -0.3 * pt.fis;
    const prob = 1 / (1 + Math.exp(-z));
    const s = clamp(Math.round(b.n * prob + (rnd() - 0.5) * b.n * 0.15), 0, b.n);
    const ab = Math.round((b.n - s) * 0.12);
    sim += s; nao += b.n - s - ab; abst += ab;
  }
  sim += jog.sim; nao += jog.nao; abst += jog.abst;
  const T = comp.total;
  const exigido = p.tipo === 'PEC' ? Math.ceil(T * 3 / 5) : p.tipo === 'PLP' ? Math.floor(T / 2) + 1 : null;
  const aprovado = exigido ? sim >= exigido : sim > nao;
  return { sim, nao, abst, jog, exigido, aprovado, total: T };
}

// ---------- criação ----------
export function novoJogador(est, id, { nome, partido: pid, uf }) {
  nome = String(nome || '').trim().slice(0, 40);
  if (nome.length < 3) erro('Escolha um nome político com pelo menos 3 letras.');
  if (!PARTIDOS.some(p => p.id === pid)) erro('Escolha um partido da lista.');
  if (!estado(uf)) erro('Escolha o estado do seu domicílio eleitoral.');
  if (Object.values(est.jogadores).some(j => j.nome.toLowerCase() === nome.toLowerCase())) erro('Já existe alguém com esse nome neste servidor.');
  const p = partido(pid);
  return { id, nome, partido: pid, e: p.e, s: p.s, uf, pc: 12, fundo: 150, fama: { [uf]: 8 }, simp: {}, cargo: null, cand: null,
    entrou: est.mes, apoioGov: null, projeto: null, feitos: { leis: 0, eleicoes: 0, campanhas: 0 } };
}

export function novoServidor({ id, nome, dono, perfil, agora, cfg = {} }) {
  nome = String(nome || '').trim().slice(0, 48);
  if (nome.length < 3) erro('Dê um nome ao servidor (mínimo 3 letras).');
  const est = { v: 1, id, nome, criado: agora, mes: 0, ultimoMes: agora, cfg: { ...CONFIG_PADRAO, ...cfg },
    presidente: dono, jogadores: {}, disputas: {}, projetos: [], leis: [], eleicoes: [], noticias: [], seq: 1,
    eco: { pib: 2.0, inflacao: 4.4, desemprego: 6.2, aprovacao: 50, caixa: 0 } };
  const j = novoJogador(est, dono, perfil);
  j.cargo = { cargo: 'presidente', uf: 'BR', desde: 0 }; j.fama = Object.fromEntries(ESTADOS.map(e => [e.uf, 35])); j.pc = 16;
  est.jogadores[dono] = j;
  noticia(est, `${j.nome} (${j.partido}) toma posse como Presidente da República e abre o servidor "${est.nome}".`, 'posse');
  return est;
}

function noticia(est, t, tipo = 'info', uf = null) { est.noticias.unshift({ m: est.mes, t, tipo, uf }); est.noticias.length = Math.min(est.noticias.length, 120); }
function gasta(j, pc, custo = 0) {
  if (j.pc < pc) erro(`Falta capital político (precisa de ${pc}, você tem ${j.pc}). Ele recarrega a cada mês.`);
  if (j.fundo < custo) erro(`Falta dinheiro de campanha (precisa de R$ ${custo} mil).`);
  j.pc -= pc; j.fundo -= custo;
}
const addFama = (j, uf, x) => { j.fama[uf] = clamp((j.fama[uf] || 0) + x, 0, 100); };
const addSimp = (j, uf, seg, x) => { j.simp[uf] = j.simp[uf] || {}; j.simp[uf][seg] = clamp((j.simp[uf][seg] || 0) + x, -40, 40); };
const SEG_OPOSTO = { trab:'empre', perif:'empre', media:'perif', evang:'jovens', agro:'jovens', jovens:'evang', empre:'trab' };

function tomarPosse(est, j, cargo, uf, auto) {
  if (j.cargo) noticia(est, `${j.nome} deixa o cargo de ${CARGOS[j.cargo.cargo].curto} para assumir o novo mandato.`);
  j.cargo = { cargo, uf, desde: est.mes }; j.cand = null;
  noticia(est, `${j.nome} (${j.partido}) assume como ${CARGOS[cargo].nome} por ${uf}${auto ? ': havia vaga, posse direta' : ': eleito(a) nas urnas'}.`, 'posse', uf);
}

// ---------- jogadas ----------
export function aplicar(est0, quem, a, agora = Date.now(), rnd = Math.random) {
  const est = structuredClone(est0);
  const tipo = a?.tipo;
  if (tipo === 'entrar') {
    if (est.jogadores[quem]) erro('Você já tem um personagem neste servidor.');
    const j = novoJogador(est, quem, a); est.jogadores[quem] = j;
    noticia(est, `${j.nome} (${j.partido}-${j.uf}) entra na vida pública.`, 'entrada', j.uf);
    return { est, msg: 'Bem-vindo(a) à política! Lance uma candidatura para disputar um cargo.' };
  }
  const j = est.jogadores[quem]; if (!j) erro('Crie seu personagem neste servidor primeiro.');
  const souPres = est.presidente === quem;
  let msg = 'Feito.';

  switch (tipo) {
    case 'candidatar': {
      const { cargo } = a, uf = j.uf;
      if (!['senador', 'dep_fed', 'dep_est'].includes(cargo)) erro('Cargo inválido. Governadores e prefeitos são as pessoas reais e não estão em disputa.');
      if (souPres) erro('O presidente do servidor não disputa outros cargos.');
      if (j.cand) erro('Você já tem uma candidatura em andamento. Retire-a antes de lançar outra.');
      if (j.cargo && j.cargo.cargo === cargo) erro('Você já ocupa esse cargo.');
      if (vagasLivres(est, cargo, uf) > 0) { tomarPosse(est, j, cargo, uf, true); msg = `Havia vaga: você é ${CARGOS[cargo].nome} por ${uf}!`; break; }
      const k = chave(cargo, uf);
      est.disputas[k] = est.disputas[k] || { cargo, uf, desafiantes: [], eleicao: proximaEleicao(est) };
      est.disputas[k].desafiantes.push(quem); j.cand = k;
      noticia(est, `${j.nome} (${j.partido}) desafia os ocupantes das ${vagas(cargo, uf)} cadeiras de ${CARGOS[cargo].curto} por ${uf}. Eleição em ${dataJogo(est.disputas[k].eleicao)}.`, 'disputa', uf);
      msg = `Sem vaga livre: sua candidatura vai às urnas em ${dataJogo(est.disputas[k].eleicao)}. Faça campanha para convencer o eleitorado.`;
      break;
    }
    case 'retirar': {
      if (!j.cand) erro('Você não tem candidatura.');
      const d = est.disputas[j.cand]; d.desafiantes = d.desafiantes.filter(x => x !== quem);
      if (!d.desafiantes.length) delete est.disputas[j.cand];
      j.cand = null; msg = 'Candidatura retirada.'; break;
    }
    case 'renunciar': {
      if (!j.cargo || souPres) erro('Não há cargo para renunciar.');
      noticia(est, `${j.nome} renuncia ao cargo de ${CARGOS[j.cargo.cargo].curto} (${j.cargo.uf}).`, 'info', j.cargo.uf);
      j.cargo = null; msg = 'Você renunciou ao mandato.'; break;
    }
    case 'campanha': {
      const ac = ACOES_CAMPANHA.find(x => x.id === a.acao); if (!ac) erro('Ação desconhecida.');
      const emDisputa = !!j.cand, defendendo = j.cargo && est.disputas[chave(j.cargo.cargo, j.cargo.uf)];
      if (!emDisputa && !defendendo) erro('Campanha só vale quando há disputa: lance candidatura ou defenda sua cadeira quando for desafiado(a).');
      const uf = j.uf; gasta(j, ac.pc, ac.custo); j.feitos.campanhas++;
      if (ac.id === 'comicio') { const g = 3 + Math.round(rnd() * 6); addFama(j, uf, g); msg = `Comício cheio! Fama em ${uf} +${g}.`; }
      if (ac.id === 'tv') { addFama(j, uf, 12); msg = `Seu programa foi ao ar em todo o estado. Fama +12.`; }
      if (ac.id === 'visita') {
        const g = SEGMENTOS.find(s => s.id === a.seg) || erro('Escolha o segmento.');
        addSimp(j, uf, g.id, 8); addSimp(j, uf, SEG_OPOSTO[g.id], -2); addFama(j, uf, 1);
        msg = `Conversa com ${g.nome.toLowerCase()}: simpatia +8 nesse grupo.`;
      }
      if (ac.id === 'redes') {
        const x = rnd();
        if (x > 0.85) { addFama(j, uf, 15); addSimp(j, uf, 'jovens', 6); msg = 'Viralizou! Fama +15.'; noticia(est, `Vídeo de ${j.nome} viraliza nas redes.`, 'redes', uf); }
        else if (x < 0.12) { addFama(j, uf, 3); addSimp(j, uf, 'media', -6); msg = 'Gafe nas redes: o vídeo pegou mal na classe média.'; }
        else { const g = 2 + Math.round(x * 6); addFama(j, uf, g); addSimp(j, uf, 'jovens', 3); msg = `Bom engajamento: fama +${g}.`; }
      }
      if (ac.id === 'arrecadar') { const v = Math.round(40 + rnd() * 60 + (j.cargo ? 40 : 0)); j.fundo += v; msg = `Você arrecadou R$ ${v} mil.`; }
      if (ac.id === 'apoio') {
        const k = (j.cand || chave(j.cargo.cargo, j.cargo.uf)) + '@' + proximaEleicao(est);
        if (j.apoioGov === k) erro('Você já pediu apoio ao governador nesta eleição.');
        j.apoioGov = k; const A = AUTORIDADES[uf], gp = partido(A.gov[1]);
        const chance = clamp(0.8 - dist(j, gp) / 10 + (j.partido === gp.id ? 0.2 : 0), 0.05, 0.95);
        if (rnd() < chance) { addFama(j, uf, 8); SEGMENTOS.forEach(s => addSimp(j, uf, s.id, 3)); msg = `${A.gov[0]} declarou apoio a você (simulação)! Fama +8.`; noticia(est, `Governador(a) ${A.gov[0]} declara apoio a ${j.nome} (simulação do jogo).`, 'apoio', uf); }
        else msg = `${A.gov[0]} preferiu não se envolver na sua campanha (simulação).`;
      }
      break;
    }
    case 'mandato': {
      const ac = ACOES_MANDATO.find(x => x.id === a.acao); if (!ac) erro('Ação desconhecida.');
      if (!j.cargo || souPres) erro('Ação exclusiva de parlamentares com mandato.');
      if (ac.cargos && !ac.cargos.includes(j.cargo.cargo)) erro('Seu cargo não permite essa ação.');
      gasta(j, ac.pc); const uf = j.cargo.uf;
      if (ac.id === 'discurso') { const g = 2 + Math.round(rnd() * 3); addFama(j, uf, g); msg = `Discurso repercutiu em ${uf}: fama +${g}.`; }
      if (ac.id === 'emenda') { addFama(j, uf, 5); SEGMENTOS.forEach(s => addSimp(j, uf, s.id, 1)); est.eco.caixa = r1(est.eco.caixa - 0.4); msg = `Emenda liberada para ${uf}: fama +5.`; }
      break;
    }
    case 'pronunciamento': {
      if (!souPres) erro('Só o presidente faz pronunciamento em rede nacional.');
      gasta(j, 2); const g = 1 + Math.round(rnd() * 2); est.eco.aprovacao = clamp(est.eco.aprovacao + g, 0, 100);
      noticia(est, `Pronunciamento em rede nacional do presidente ${j.nome}.`, 'governo'); msg = `Aprovação do governo +${g}.`; break;
    }
    case 'propor': {
      if (!j.cargo) erro('Só quem tem mandato pode propor projetos.');
      if (est.projetos.some(p => p.autor === quem && !p.fim)) erro('Você já tem um projeto tramitando. Espere a votação terminar.');
      gasta(j, 3);
      let p;
      const casa = j.cargo.cargo === 'dep_est' ? `ale:${j.cargo.uf}` : j.cargo.cargo === 'senador' ? 'senado' : 'camara';
      if (a.catalogo) {
        if (casa.startsWith('ale:')) erro('Projetos do catálogo são federais. Na Assembleia, escreva um projeto estadual.');
        const c = PROJETOS.find(x => x.id === a.catalogo) || erro('Projeto não encontrado.');
        if (est.projetos.some(x => x.catalogo === c.id && !x.fim) || est.leis.some(x => x.catalogo === c.id)) erro('Esse projeto já tramita ou já virou lei neste servidor.');
        p = { titulo: c.nome, desc: c.desc, tipo: c.tipo === 'PDL' ? 'PL' : c.tipo, e: c.e, s: c.s, we: c.we, ws: c.ws, pop: c.pop, fx: c.fx, catalogo: c.id };
      } else {
        const titulo = String(a.titulo || '').trim().slice(0, 120), desc = String(a.desc || '').trim().slice(0, 700);
        if (titulo.length < 8) erro('Dê um título ao projeto (mínimo 8 letras).');
        const tp = casa.startsWith('ale:') ? 'PL' : (['PL', 'PLP', 'PEC'].includes(a.tipoLei) ? a.tipoLei : 'PL');
        p = { titulo, desc, tipo: tp, e: clamp(+a.e || 0, -10, 10), s: clamp(+a.s || 0, -10, 10), pop: 0, fx: null };
      }
            Object.assign(p, { id: est.seq++, autor: quem, autorNome: j.nome, casa, origem: casa, desde: est.mes, votos: {}, hist: [] });
      est.projetos.push(p);
      noticia(est, `${j.nome} apresenta "${p.titulo}" (${p.tipo}) ${naCasa(casa)}.`, 'projeto', casa.startsWith('ale:') ? casa.slice(4) : null);
      msg = 'Projeto protocolado. A votação fecha na virada do mês.'; break;
    }
    case 'votar': {
      const p = est.projetos.find(x => x.id === a.projeto && !x.fim) || erro('Projeto não está em votação.');
      if (!membrosCasa(est, p.casa).some(m => m.id === quem)) erro(`Só membros da ${nomeCasa(p.casa)} votam agora.`);
      if (!['sim', 'nao', 'abst'].includes(a.voto)) erro('Voto inválido.');
      p.votos[quem] = a.voto; msg = 'Voto registrado.'; break;
    }
    case 'sancionar': {
      if (!souPres) erro('Só o presidente sanciona ou veta.');
      const p = est.projetos.find(x => x.id === a.projeto && x.casa === 'sancao') || erro('Projeto não aguarda sanção.');
      if (a.ok) virarLei(est, p, 'sancionado'); else { p.fim = 'vetado'; noticia(est, `Presidente ${j.nome} veta "${p.titulo}".`, 'veto'); }
      msg = a.ok ? 'Sancionado: virou lei!' : 'Projeto vetado.'; break;
    }
    case 'passar_mes': {
      const dt = agora - est.ultimoMes;
      const pode = (souPres && dt >= est.cfg.intervaloPresidente) || dt >= est.cfg.intervaloLivre;
      if (!pode) erro(souPres ? `Aguarde ${Math.ceil((est.cfg.intervaloPresidente - dt) / 60e3)} min para virar o mês.` : 'Só o presidente vira o mês (ou qualquer um, após 24 h sem virada).');
      virarMes(est, agora, rnd); msg = `Começa ${dataJogo(est.mes)}.`; break;
    }
    default: erro('Jogada desconhecida.');
  }
  return { est, msg };
}

function virarLei(est, p, como) {
  p.fim = 'lei'; p.casa = 'lei'; est.leis.unshift({ id: p.id, titulo: p.titulo, tipo: p.tipo, m: est.mes, autor: p.autorNome, catalogo: p.catalogo || null, uf: p.origem.startsWith('ale:') ? p.origem.slice(4) : null });
  const autor = est.jogadores[p.autor]; if (autor) { autor.feitos.leis++; addFama(autor, autor.cargo?.uf === 'BR' ? autor.uf : (autor.cargo?.uf || autor.uf), 6); }
  if (p.fx) { const e = p.fx.eco || {}; est.eco.pib = r1(est.eco.pib + (e.pibShock || 0)); est.eco.inflacao = r1(est.eco.inflacao + (e.inflShock || 0)); est.eco.aprovacao = clamp(est.eco.aprovacao + (p.fx.aprov || 0), 0, 100); }
  noticia(est, `"${p.titulo}" ${como === 'promulgado' ? 'é promulgada' : 'vira lei'}${p.origem.startsWith('ale:') ? ' em ' + p.origem.slice(4) : ''}.`, 'lei');
}

function resolverVotacoes(est, rnd) {
  for (const p of est.projetos) {
    if (p.fim || p.desde > est.mes) continue;
    if (p.casa === 'sancao') { virarLei(est, p, 'tacita'); continue; } // sanção tácita
    if (p.casa === 'sancao_gov') {
      const uf = p.origem.slice(4), A = AUTORIDADES[uf], gp = partido(A.gov[1]);
      if (dist(p, gp) < 6 || rnd() < 0.4) virarLei(est, p, 'sancionado');
      else { p.fim = 'vetado'; noticia(est, `Governador(a) ${A.gov[0]} veta "${p.titulo}" (simulação).`, 'veto', uf); }
      continue;
    }
    const pl = placar(est, p, rnd); p.hist.push({ casa: p.casa, m: est.mes, ...pl });
    if (!pl.aprovado) { p.fim = 'rejeitado'; noticia(est, `${nomeCasa(p.casa)} rejeita "${p.titulo}": ${pl.sim} a ${pl.nao}.`, 'rejeitado'); continue; }
    noticia(est, `${nomeCasa(p.casa)} aprova "${p.titulo}": ${pl.sim} a ${pl.nao}.`, 'aprovado');
    const passou = new Set(p.hist.map(h => h.casa));
    if (p.casa.startsWith('ale:')) p.casa = 'sancao_gov';
    else if (!passou.has('camara')) p.casa = 'camara';
    else if (!passou.has('senado')) p.casa = 'senado';
    else if (p.tipo === 'PEC') { virarLei(est, p, 'promulgado'); continue; }
    else p.casa = 'sancao';
    p.votos = {}; p.desde = est.mes + 1;
  }
  est.projetos = est.projetos.filter(p => !p.fim || p.desde >= est.mes - 3).slice(-60);
}

function apurar(est) {
  for (const [k, d] of Object.entries(est.disputas)) {
    if (d.eleicao > est.mes) continue;
    const ids = candidatosDisputa(est, k), n = vagas(d.cargo, d.uf);
    const { lista } = projecao(est, d.cargo, d.uf, ids);
    const venc = new Set(lista.slice(0, n).map(x => x.id));
    for (const x of lista) {
      const j = est.jogadores[x.id];
      if (venc.has(x.id)) { if (!(j.cargo && j.cargo.cargo === d.cargo && j.cargo.uf === d.uf)) tomarPosse(est, j, d.cargo, d.uf, false); j.feitos.eleicoes++; }
      else { if (j.cargo && j.cargo.cargo === d.cargo && j.cargo.uf === d.uf) { j.cargo = null; noticia(est, `${j.nome} perde a cadeira de ${CARGOS[d.cargo].curto} por ${d.uf} nas urnas.`, 'derrota', d.uf); } j.cand = null; }
    }
    est.eleicoes.unshift({ k, cargo: d.cargo, uf: d.uf, m: est.mes, vagas: n, lista: lista.map(x => ({ ...x, eleito: venc.has(x.id) })) });
    est.eleicoes.length = Math.min(est.eleicoes.length, 40);
    noticia(est, `Urnas apuradas: ${CARGOS[d.cargo].curto} por ${d.uf}. Mais votado(a): ${lista[0]?.nome} (${lista[0]?.pct}%).`, 'eleicao', d.uf);
    delete est.disputas[k];
  }
}

function virarMes(est, agora, rnd) {
  resolverVotacoes(est, rnd);
  apurar(est);
  const e = est.eco;
  e.pib = r1(e.pib + (2.0 - e.pib) * 0.08 + (rnd() - 0.5) * 0.3);
  e.inflacao = r1(clamp(e.inflacao + (4.0 - e.inflacao) * 0.08 + (rnd() - 0.5) * 0.25 - e.caixa * 0.002, 0, 30));
  e.desemprego = r1(clamp(e.desemprego - (e.pib - 2) * 0.05 + (rnd() - 0.5) * 0.15, 3, 20));
  e.aprovacao = Math.round(clamp(e.aprovacao + (48 + (e.pib - 2) * 3 - (e.inflacao - 4) * 2 - (e.desemprego - 6) * 1.5 - e.aprovacao) * 0.1 + (rnd() - 0.5) * 2, 0, 100));
  e.caixa = r1(e.caixa * 0.9);
  for (const j of Object.values(est.jogadores)) {
    j.pc = Math.min(est.cfg.pcMax, j.pc + est.cfg.pcMes);
    if (j.cargo) j.fundo += j.cargo.cargo === 'presidente' ? 0 : 15;
    for (const uf in j.fama) j.fama[uf] = r1(j.fama[uf] * 0.97);
    if (j.id === est.presidente) for (const uf in j.fama) j.fama[uf] = clamp(e.aprovacao * 0.7, 0, 100);
  }
  est.mes++; est.ultimoMes = agora;
  const pe = proximaEleicao(est);
  noticia(est, `Começa ${dataJogo(est.mes)}.${pe === est.mes ? ' Mês de eleição: as urnas abrem no fim do mês!' : ''}`, 'mes');
}
