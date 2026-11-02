// =====================================================================
// A FAIXA — medidas do jogador (texto livre + IA), negociação e rupturas
// =====================================================================

const INSTRUMENTOS = {
  DECRETO:{ nome:'Decreto presidencial', regra:'Vale na hora, sem votação. Só regulamenta leis e organiza a administração (art. 84). Pode ser derrubado pelo STF ou por decreto legislativo.' },
  MP:{ nome:'Medida Provisória', regra:'Vale na hora, mas o Congresso tem 120 dias para aprovar por maioria simples (art. 62). Se não votar, caduca.' },
  PL:{ nome:'Projeto de Lei ordinária', regra:'Maioria simples dos presentes na Câmara e no Senado.' },
  PLP:{ nome:'Projeto de Lei Complementar', regra:'Maioria absoluta: 257 deputados e 41 senadores.' },
  PEC:{ nome:'Proposta de Emenda à Constituição', regra:'3/5 em dois turnos: 308 deputados e 49 senadores. Não pode abolir cláusulas pétreas (art. 60, § 4º).' },
};

// ---------- normalização ----------
const lim = (v,a,b,d=0)=>{ v=Number(v); return isFinite(v)? clamp(v,a,b) : d; };

function normalizarMedida(raw, texto){
  const ef = raw.efeitos || {};
  const grp = {}; Object.entries(ef.grupos||{}).forEach(([k,v])=>{ if (GRUPOS.some(g=>g.id===k)) grp[k]=Math.round(lim(v,-20,20)); });
  const rel = {}; Object.entries(ef.relacoes||{}).forEach(([k,v])=>{ if (PAISES.some(c=>c.id===k)) rel[k]=Math.round(lim(v,-15,15)); });
  const mod = {}; Object.entries(ef.tendencias||{}).forEach(([k,v])=>{ if (['pobreza','homic','desmat','educ','saude','infra'].includes(k)) mod[k]=lim(v,-0.08,0.08); });
  const frentes = {}; Object.entries(raw.frentes||{}).forEach(([k,v])=>{ if (FRENTES.some(f=>f.id===k)) frentes[k]=lim(v,-1,1); });
  let inst = String(raw.instrumento||'PL').toUpperCase().replace(/[^A-Z]/g,'');
  if (!INSTRUMENTOS[inst]) inst = 'PL';
  const fx = { aprov:lim(ef.aprov,-6,6), grp, rel, mod, eco:{ pibShock:lim(ef.pib,-1,1), inflShock:lim(ef.inflacao,-1,1), primario:lim(ef.primario,-0.6,0.6), conf:lim(ef.confianca_mercado,-15,15) } };
  const min = MINISTERIOS.some(m=>m.id===raw.ministerio) ? raw.ministerio : 'casacivil';
  return {
    id: 'u'+((S.medidaSeq=(S.medidaSeq||0)+1)), custom:true, texto,
    nome: String(raw.titulo||texto).slice(0,90), desc: String(raw.resumo||'').slice(0,400),
    instrumento: inst, tipo: inst==='MP'?'PL':inst==='DECRETO'?'DECRETO':inst, mp: inst==='MP',
    motivo: String(raw.motivo_instrumento||'').slice(0,300),
    ministerio: min, e:lim(raw.e,-10,10), s:lim(raw.s,-10,10), we:lim(raw.peso_economico,0,1,0.6), ws:lim(raw.peso_social,0,1,0.4),
    pop:lim(raw.pop,-1,1), tram: Math.round(lim(raw.meses_tramitacao,1,6,3)), inconst: !!raw.inconstitucional, risco: lim(raw.risco_juridico,0,1,0.1),
    frentes, fx, apoia: (raw.quem_apoia||[]).slice(0,4).map(String), resiste: (raw.quem_resiste||[]).slice(0,4).map(String), ia: !!raw._ia,
  };
}

// ---------- interpretação offline (sem IA) ----------
const LEXICO = [
  [/reduz\w* (de )?impost|isen[çc]|cortar? impost|zera\w* (o )?impost|desoner/i, { min:'fazenda', e:4, pop:.4, fx:{eco:{primario:-0.18, pibShock:.2}, grp:{comercio:6, industria:6}} }],
  [/grandes fortunas|super[- ]?ricos|bilion[aá]ri|dividendo|taxar (os )?ricos|imposto sobre heran/i, { min:'fazenda', e:-7, pop:.5, fx:{eco:{primario:.2, conf:-8}, grp:{mercado:-12, sindicatos:6}}, fr:{trab:.6} }],
  [/aument\w* (o |os )?impost|cria\w* (um |novo )?(imposto|tributo)|nova contribui/i, { min:'fazenda', e:-3, pop:-.5, fx:{eco:{primario:.2}, grp:{comercio:-8, industria:-8}} }],
  [/jornada|6x1|escala|f[ée]rias|clt|trabalhador|sal[aá]rio m[ií]nimo/i, { min:'trabalho', e:-5, pop:.6, fx:{grp:{sindicatos:10, industria:-8, comercio:-8}, eco:{pibShock:-.15}}, fr:{trab:1} }],
  [/pol[ií]cia|seguran[çc]a|crime|fac[çc][ãa]o|pres[ií]dio|pris[ãa]o|pena /i, { min:'justica', s:4, pop:.5, fx:{mod:{homic:-.03}, grp:{militares:4}}, fr:{bala:.8} }],
  [/\barma|porte de arma|cac\b/i, { min:'justica', s:8, pop:-.1, fx:{grp:{movsociais:-8}}, fr:{bala:1, fpe:.4} }],
  [/sa[uú]de|\bsus\b|hospital|m[ée]dic|vacina|rem[ée]dio/i, { min:'saude', e:-2, pop:.7, fx:{mod:{saude:.05}, eco:{primario:-.1}} }],
  [/escola|educa|professor|universidade|ensino|creche/i, { min:'educacao', e:-2, pop:.6, fx:{mod:{educ:.05}, eco:{primario:-.1}} }],
  [/desmat|amaz[oô]n|ambient|clima|floresta|carbono|ibama|queimada/i, { min:'ambiente', e:-1, s:-3, pop:.2, fx:{mod:{desmat:-.04}, grp:{ambientalistas:10, agro:-6}, rel:{UE:4}}, fr:{amb:1, fpa:-.5} }],
  [/reforma agr[aá]ria|assentament|latif[uú]ndio|\bmst\b/i, { min:'agricultura', e:-7, fx:{grp:{movsociais:12, agro:-15}}, fr:{fpa:-1, trab:.6} }],
  [/agro|safra|produtor rural|plano safra|pecu[aá]ria/i, { min:'agricultura', e:3, pop:.2, fx:{grp:{agro:10}}, fr:{fpa:.8} }],
  [/privatiz|desestatiz|concess[ãa]o|vender (a |as )?estata/i, { min:'fazenda', e:7, pop:-.3, fx:{grp:{mercado:10, sindicatos:-12}, eco:{conf:6, primario:.05}} }],
  [/estatiz|nacionaliz|reestatiz/i, { min:'minas', e:-8, pop:.1, fx:{grp:{mercado:-18, sindicatos:8}, eco:{conf:-12, dolarPct:3}} }],
  [/bolsa fam[ií]lia|aux[ií]lio|renda b[aá]sica|fome|pobreza|cesta b[aá]sica|vale[- ]|cad[uú]nico|benef[ií]cio|botij|g[aá]s de cozinha|transfer[eê]ncia de renda/i, { min:'social', e:-5, pop:.8, fx:{mod:{pobreza:-.04}, eco:{primario:-.15, pibShock:.1}, aprov:2} }],
  [/moradia|habita|minha casa|saneamento|aluguel/i, { min:'cidades', e:-3, pop:.7, fx:{mod:{infra:.02}, eco:{primario:-.1, pibShock:.15}} }],
  [/energia|petr[oó]leo|petrobras|combust[ií]vel|gasolina|diesel|conta de luz/i, { min:'minas', e:-1, pop:.5, fx:{eco:{inflShock:-.2, primario:-.05}} }],
  [/estrada|rodovia|ferrovia|porto|aeroporto|transporte|[oô]nibus|metr[oô]/i, { min:'transportes', e:0, pop:.5, fx:{mod:{infra:.03}, eco:{primario:-.08}} }],
  [/ind[uú]stria|f[aá]brica|exporta|importa|tarifa de importa/i, { min:'mdic', e:-1, pop:.2, fx:{grp:{industria:8}} }],
  [/ci[eê]ncia|pesquisa|tecnologia|intelig[eê]ncia artificial|semicondutor/i, { min:'ciencia', e:-1, pop:.2, fx:{eco:{primario:-.03}} }],
  [/aborto/i, { min:'saude', s:/legaliz|descriminaliz|direito/i, pop:-.3, fx:{grp:{evangelicos:-15, movsociais:8}}, fr:{fpe:-1} }],
  [/maconha|cannabis|drogas/i, { min:'justica', s:-6, pop:-.2, fx:{grp:{evangelicos:-10}}, fr:{fpe:-1, bala:-.5} }],
  [/fam[ií]lia tradicional|igreja|religi|ideologia de g[eê]nero|escola sem partido/i, { min:'educacao', s:8, pop:0, fx:{grp:{evangelicos:12, movsociais:-10}}, fr:{fpe:1} }],
  [/for[çc]as armadas|militar|ex[ée]rcito|defesa nacional/i, { min:'defesa', s:4, fx:{grp:{militares:10}, eco:{primario:-.04}}, fr:{bala:.6} }],
  [/china|estados unidos|eua|mercosul|acordo comercial|uni[ãa]o europeia|brics/i, { min:'itamaraty', e:1, fx:{} }],
  [/reelei[çc][ãa]o|mandato|voto|elei[çc][ãa]o|partido|congresso|stf|supremo/i, { min:'casacivil', e:0, fx:{grp:{imprensa:2}} }],
];

function interpretarLocal(texto){
  const t = texto.toLowerCase();
  let e=0, s=0, n=0, pop=0, min=null;
  const fx = { aprov:0, grp:{}, rel:{}, mod:{}, eco:{} }; const fr = {};
  const soma=(o,k,v)=>{ o[k]=(o[k]||0)+v; };
  LEXICO.forEach(([re, r])=>{
    if (!re.test(texto)) return;
    n++; if (!min) min=r.min;
    if (r.e) e+=r.e;
    if (r.s instanceof RegExp) s += r.s.test(texto)? -8 : 8; else if (r.s) s+=r.s;
    pop += r.pop||0;
    const f=r.fx||{};
    if (f.aprov) fx.aprov+=f.aprov;
    ['grp','rel','mod','eco'].forEach(k=>Object.entries(f[k]||{}).forEach(([a,v])=>soma(fx[k],a,v)));
    Object.entries(r.fr||{}).forEach(([a,v])=>soma(fr,a,v));
  });
  if (n>1){ e/=n*0.8; s/=n*0.8; pop/=n; }
  let inst = 'PL';
  if (/constitui|\bpec\b|emenda constitucional|reelei|mandato de|cl[aá]usula/i.test(t)) inst='PEC';
  else if (/decreto|regulament/i.test(t)) inst='DECRETO';
  else if (/medida provis|\bmp\b|urgente|imediat/i.test(t)) inst='MP';
  else if (/grandes fortunas|lei complementar/i.test(t)) inst='PLP';
  const titulo = texto.trim().replace(/\s+/g,' ');
  return { _ia:false, titulo: titulo.charAt(0).toUpperCase()+titulo.slice(1,80)+(titulo.length>80?'…':''),
    resumo: n? 'Classificação automática por palavras-chave (modo sem IA). Os efeitos são estimativas genéricas.' : 'A assessoria não conseguiu identificar a área com clareza; a medida foi tratada como de baixo impacto.',
    instrumento:inst, motivo_instrumento: INSTRUMENTOS[inst].regra, ministerio:min||'casacivil', e, s, peso_economico:0.6, peso_social:0.4, pop:clamp(pop,-1,1), meses_tramitacao: inst==='PEC'?4:3,
    inconstitucional:false, risco_juridico: inst==='DECRETO'?0.35:0.1,
    efeitos:{ aprov:fx.aprov, pib:fx.eco.pibShock, inflacao:fx.eco.inflShock, primario:fx.eco.primario, confianca_mercado:fx.eco.conf, grupos:fx.grp, tendencias:fx.mod, relacoes:fx.rel },
    frentes: fr };
}

// ---------- IA ----------
let _sample;
async function obterIA(){
  if (_sample!==undefined) return _sample;
  try { _sample = (window.claude && window.claude.use) ? await window.claude.use('sample') : null; } catch(e){ _sample = null; }
  return _sample;
}
function resumoEstado(){
  const e=S.eco;
  return `Data: ${dataTurno(S.t)}. Presidente: ${S.pres.nome} (${S.pres.partido}), posição econômica ${S.pres.e} e social ${S.pres.s} (escala -10 a 10). Aprovação ${fmt(S.aprov,0)}%. PIB ${fmt(e.pib)}%, IPCA ${fmt(e.ipca)}%, Selic ${fmt(e.selic,2)}%, desemprego ${fmt(e.desemp)}%, dólar R$ ${fmt(e.dolar,2)}, dívida bruta ${fmt(e.divida)}% do PIB, resultado primário ${fmt(e.primario??0,2)}% do PIB. Base fiel na Câmara: ${S.baseCamara} de 513.`;
}
async function interpretarIA(texto, signal){
  const sample = await obterIA();
  if (!sample) return null;
  const prompt = `Você é a Subchefia de Assuntos Jurídicos da Casa Civil num jogo de simulação política realista do Brasil. O jogador é o presidente da República e escreveu uma medida. Classifique-a e estime efeitos REALISTAS (a maioria das medidas tem efeito modesto; medidas radicais têm custos altos).

${resumoEstado()}

Regras da Constituição de 1988 que você deve aplicar:
- DECRETO (art. 84): só regulamenta lei existente ou organiza a administração. Não cria imposto, crime, nem despesa sem lei.
- MP (art. 62): relevância e urgência; vale 60+60 dias. Proibida para direito penal e processual, eleitoral, partidos, nacionalidade, matéria de lei complementar e confisco de poupança.
- PL: lei ordinária, maioria simples. PLP: lei complementar, maioria absoluta (ex.: imposto sobre grandes fortunas, normas gerais tributárias, sistema financeiro).
- PEC: 3/5 em dois turnos nas duas Casas. Cláusulas pétreas (forma federativa, voto direto secreto universal e periódico, separação de Poderes, direitos e garantias individuais) não podem ser abolidas: se a medida tenta isso, inconstitucional=true e risco_juridico alto.

Texto do presidente:
"""${texto.slice(0,1500)}"""

Responda SOMENTE com um objeto JSON neste formato:
{"titulo":"ementa curta, até 70 caracteres","resumo":"1 a 2 frases objetivas","instrumento":"DECRETO|MP|PL|PLP|PEC","motivo_instrumento":"1 frase citando o artigo","ministerio":"um de: ${MINISTERIOS.map(m=>m.id).join(', ')}","e":0,"s":0,"peso_economico":0.6,"peso_social":0.4,"pop":0,"meses_tramitacao":3,"inconstitucional":false,"risco_juridico":0.1,"efeitos":{"aprov":0,"pib":0,"inflacao":0,"primario":0,"confianca_mercado":0,"grupos":{},"tendencias":{},"relacoes":{}},"frentes":{},"quem_apoia":["até 3 atores"],"quem_resiste":["até 3 atores"]}

Escalas: e = posição econômica da medida (-10 esquerda/estatista, +10 direita/liberal); s = posição nos costumes (-10 progressista, +10 conservadora); pop -1 a 1 (apelo popular); aprov -6 a 6 (pontos de aprovação); pib -1 a 1 (choque temporário no crescimento, em pontos percentuais); inflacao -1 a 1; primario -0.6 a 0.6 (% do PIB por ano; positivo melhora as contas, gasto novo é negativo); confianca_mercado -15 a 15.
grupos (-20 a 20), use só estas chaves: ${GRUPOS.map(g=>g.id).join(', ')}.
tendencias (-0.08 a 0.08 ao ano; negativo reduz o indicador), use só: pobreza, homic, desmat, educ, saude, infra.
relacoes (-15 a 15), use só: ${PAISES.map(c=>c.id).join(', ')}.
frentes (-1 contra a +1 a favor), use só: fpa (agropecuária), fpe (evangélica), bala (segurança), trab (trabalhadores), amb (ambientalista).`;
  const r = await sample.json(prompt, { modelTier:'default', signal });
  if (!r || typeof r!=='object') throw { code:'invalid_json' };
  r._ia = true;
  return r;
}

function parecerLocal(def, pv){
  const m = S.ministros[def.ministerio];
  const d = Math.hypot(def.e-m.e, def.s-m.s);
  const parecer = d<4?'favoravel':d<9?'com_ressalvas':'contrario';
  const falta = pv.c>=pv.nc && pv.s>=pv.ns ? 'Pelas contas da articulação, os votos existem hoje. Não vale arriscar perdê-los com demora.' : `Faltam cerca de ${Math.max(0,pv.nc-pv.c)} votos na Câmara e ${Math.max(0,pv.ns-pv.s)} no Senado. É preciso negociar com ${pv.contra.slice(0,2).join(' e ')||'o centro'}.`;
  const fala = { favoravel:'A medida está alinhada com o que defendemos para a pasta. Tenho condições de defendê-la no Congresso.', com_ressalvas:'A direção é razoável, mas o texto precisa de ajustes para não gerar resistência desnecessária.', contrario:'Recomendo cautela: a medida contraria a linha da pasta e pode nos custar apoio.' }[parecer];
  return { parecer, fala, pontos:[ def.fx.eco.primario<-0.1?'O impacto fiscal precisa de fonte de compensação.':'O impacto fiscal é administrável.', def.pop>0.3?'Tem apelo popular, o que ajuda a pressionar o Congresso.':'O apelo popular é baixo; a votação dependerá de negociação.' ],
    o_que_falta: falta, ajuste:{ descricao:'Moderar o texto para atrair o centro.', e_delta: -Math.sign(def.e)*1.5, s_delta: -Math.sign(def.s)*1.5, pop_delta:0, custo_fator:0.85, efeito_fator:0.85 }, _ia:false };
}

async function parecerIA(def, pv, signal){
  const sample = await obterIA();
  if (!sample) return null;
  const m = S.ministros[def.ministerio], mi = MIN(def.ministerio);
  const prompt = `Num jogo de simulação política do Brasil, escreva o parecer interno do ministro responsável sobre uma medida proposta pelo presidente. O parecer é uma SIMULAÇÃO: escreva em tom profissional, coerente com as posições públicas conhecidas da pessoa e da sua área, sem caricatura, sem atribuir fatos pessoais inventados nem condutas ilegais.

Ministro(a): ${m.nome} — ${m.desc}. Partido: ${m.partido||'sem partido'}. Posição econômica ${m.e}, social ${m.s} (escala -10 a 10). Pasta: ${mi.nome}.
${resumoEstado()}

Medida (${INSTRUMENTOS[def.instrumento].nome}): ${def.nome}. ${def.desc}
Posição da medida: econômica ${fmt(def.e)}, social ${fmt(def.s)}; apelo popular ${fmt(def.pop,1)}; efeito fiscal ${fmt(def.fx.eco.primario,2)}% do PIB/ano.
Previsão de votos: Câmara ~${pv.c} de ${pv.nc} necessários; Senado ~${pv.s} de ${pv.ns}. Bancadas mais resistentes: ${pv.contra.join(', ')||'nenhuma relevante'}.

Responda SOMENTE com JSON:
{"parecer":"favoravel|com_ressalvas|contrario","fala":"2 a 4 frases em primeira pessoa","pontos":["até 3 pontos técnicos"],"o_que_falta":"1 frase sobre o que é preciso para aprovar","ajuste":{"descricao":"1 frase com a mudança sugerida no texto","e_delta":0,"s_delta":0,"pop_delta":0,"custo_fator":1,"efeito_fator":1}}
Limites do ajuste: e_delta e s_delta entre -3 e 3, pop_delta entre -0.3 e 0.3, custo_fator entre 0.5 e 1.2, efeito_fator entre 0.6 e 1.1.`;
  const r = await sample.json(prompt, { modelTier:'default', signal });
  if (!r || typeof r!=='object') throw { code:'invalid_json' };
  r._ia = true;
  return r;
}

function aplicarAjuste(def, aj){
  if (!aj) return def;
  def.e = clamp(def.e + lim(aj.e_delta,-3,3), -10, 10);
  def.s = clamp(def.s + lim(aj.s_delta,-3,3), -10, 10);
  def.pop = clamp(def.pop + lim(aj.pop_delta,-0.3,0.3), -1, 1);
  const cf = lim(aj.custo_fator,0.5,1.2,1), ef = lim(aj.efeito_fator,0.6,1.1,1);
  if (def.fx.eco.primario<0) def.fx.eco.primario *= cf;
  escalarEfeitos(def, ef);
  def.ajustada = (def.ajustada||0)+1;
  return def;
}
function escalarEfeitos(def, f){
  const fx=def.fx;
  fx.aprov*=f; fx.eco.pibShock*=f; fx.eco.conf*=f;
  for (const k in fx.grp) fx.grp[k]=Math.round(fx.grp[k]*f);
  for (const k in fx.mod) fx.mod[k]*=f;
  for (const k in fx.rel) fx.rel[k]=Math.round(fx.rel[k]*f);
}

// ---------- previsão detalhada ----------
function mapaVotos(def){
  const linhas = S.partidos.map(p=>{
    const pc = probVoto(p, def, 'camara'), ps = probVoto(p, def, 'senado');
    return { id:p.id, cor:p.cor, dep:p.dep, sen:p.sen, pc, ps, simC:Math.round(p.dep*0.925*pc), simS:Math.round(p.sen*0.95*ps) };
  }).sort((a,b)=>b.dep-a.dep);
  const c = linhas.reduce((a,l)=>a+l.simC,0), s = linhas.reduce((a,l)=>a+l.simS,0);
  const nc = def.tipo==='PEC'?308:def.tipo==='PLP'?257:Math.round(513*0.925/2)+1, ns = def.tipo==='PEC'?49:def.tipo==='PLP'?41:39;
  const contra = linhas.filter(l=>l.dep>=8 && l.pc<0.45).sort((a,b)=>b.dep-a.dep).map(l=>l.id);
  const m = Math.min((c-nc)/40,(s-ns)/6);
  return { linhas, c, s, nc, ns, contra, chance: m>0.6?'alta':m>-0.1?'incerta':'baixa' };
}

// ---------- protocolar medida do jogador ----------
function protocolarMedida(def){
  S.medidas = S.medidas || {};
  S.medidas[def.id] = def;
  if (def.instrumento==='DECRETO'){
    S.ap -= 1;
    def.efeitos = applyFx(def.fx);
    S.decretos = S.decretos || []; S.decretos.push({ id:def.id, t:S.t });
    S.aprovadas.push(def.id);
    if (def.risco>0.3 || def.inconst) (S.riscoJur = S.riscoJur||[]).push({ id:def.id, t:S.t, p: clamp(def.risco + (def.inconst?0.4:0),0,0.95) });
    logar('Governo', `Decreto publicado no Diário Oficial: ${def.nome}.`);
    return `Decreto publicado no Diário Oficial da União. Já está valendo.${def.risco>0.3?' A assessoria jurídica alerta: há risco de o STF suspender.':''}`;
  }
  propor(def.id, def.mp);
  if (def.inconst) (S.riscoJur = S.riscoJur||[]).push({ id:def.id, t:S.t+def.tram, p:0.7, posLei:true });
  return def.mp ? `MP publicada e já valendo. O Congresso tem 4 meses para convertê-la em lei.` : `${INSTRUMENTOS[def.instrumento].nome} protocolado. Vai a plenário em ${def.tram} ${def.tram>1?'meses':'mês'}. Use a mesa de negociação para garantir os votos.`;
}

// ---------- mesa de negociação ----------
const NEG_ACOES = [
  { id:'bancada', nome:'Negociar com uma bancada', custo:1, desc:'Cargos, emendas ou mudanças no texto em troca de votos de um partido.' },
  { id:'frente', nome:'Acordo com uma frente parlamentar', custo:1, desc:'Ruralistas, evangélicos, bancada da bala, sindical ou ambientalista votam em bloco.' },
  { id:'camara', nome:'Ligar para o presidente da Câmara', custo:1, desc:'Ele controla a pauta e influencia o Centrão.' },
  { id:'senado', nome:'Jantar com senadores', custo:1, desc:'Reforça os votos no Senado.' },
  { id:'ministro', nome:'Escalar o ministro para defender', custo:1, desc:'O ministro da área percorre gabinetes e comissões.' },
  { id:'governadores', nome:'Pedir apoio aos governadores', custo:1, desc:'Governadores pressionam suas bancadas, mas cobram convênios.' },
  { id:'rua', nome:'Convocar manifestações', custo:1, desc:'Leva apoiadores às ruas. Pode lotar ou esvaziar, e a oposição pode reagir.' },
  { id:'greve', nome:'Pedir greve geral às centrais', custo:2, desc:'Só para pautas trabalhistas ou populares. Pressão forte, custo econômico alto.' },
  { id:'redes', nome:'Campanha nas redes e na TV', custo:1, desc:'Funciona melhor quando a medida é popular.' },
  { id:'urgencia', nome:'Pedir urgência', custo:1, desc:'Leva o projeto a plenário no fim deste mês.' },
  { id:'adiar', nome:'Adiar a votação', custo:1, desc:'Ganha um mês para negociar. Irrita a Mesa.' },
];

function negociar(projId, acao, alvo, modo){
  const t = S.projetos.find(x=>x.id===projId); if (!t) return 'Projeto não encontrado.';
  const def = getProj(projId);
  const a = NEG_ACOES.find(x=>x.id===acao);
  if (S.ap < a.custo) return 'Sem pontos de agenda neste mês.';
  t.neg = t.neg || { p:{}, g:0, cam:0, sen:0 }; t.hist = t.hist || [];
  const addP=(id,v)=>{ t.neg.p[id]=(t.neg.p[id]||0)+v; };
  let txt='';
  S.ap -= a.custo;
  if (acao==='bancada'){
    const p = P(alvo); const lider = LIDERES[alvo] ? `${LIDERES[alvo]}, presidente do ${alvo}` : `a cúpula do ${alvo}`;
    if (modo==='cargos'){ addP(alvo, 0.13*(0.6+p.fis)); p.sat=clamp(p.sat+4,0,100); S.grp.imprensa=clamp(S.grp.imprensa-1,0,100); txt=`Você recebe ${lider}. Diretorias em estatais e cargos de segundo escalão selam o apoio da bancada.`; }
    else if (modo==='emendas'){ addP(alvo, 0.11*(0.6+p.fis)); S.eco.primTemp-=0.02; txt=`Acordo com ${lider}: emendas da bancada serão pagas antes da votação.`; }
    else { addP(alvo, 0.18); def.e += (p.e-def.e)*0.25; def.s += (p.s-def.s)*0.25; if (def.fx) escalarEfeitos(def, 0.88); txt=`${lider[0].toUpperCase()+lider.slice(1)} exige mudanças no texto. O relator incorpora as emendas da bancada e o projeto fica mais moderado.`; }
  }
  if (acao==='frente'){
    const f = FRENTES.find(x=>x.id===alvo);
    def.frentes = { ...(def.frentes || FRENTES_PROJ[def.id] || {}) };
    const tag = def.frentes[f.id]||0;
    if (tag<0){ def.frentes[f.id] = tag*0.3; if (def.fx) escalarEfeitos(def, 0.9); S.grp[f.grp]=clamp(S.grp[f.grp]+4,0,100); txt=`Acordo com a ${f.nome} (${f.apelido}): o texto ganha exceções pedidas pela frente, que deixa de fechar questão contra.`; }
    else { def.frentes[f.id] = Math.min(1, tag+0.4); S.grp[f.grp]=clamp(S.grp[f.grp]+2,0,100); txt=`A ${f.nome}${f.lider?`, presidida por ${f.lider},`:''} orienta seus membros a votar a favor.`; }
  }
  if (acao==='camara'){
    const v = S.presCamara>=50? 0.05 : 0.02; t.neg.cam += v; S.presCamara=clamp(S.presCamara-3,0,100);
    txt = S.presCamara>=50 ? 'O presidente da Câmara promete pautar com boa vontade e conversar com os líderes do Centrão. Em troca, quer prestígio.' : 'O presidente da Câmara ouve, mas não promete nada. A relação com o Planalto está fria.';
  }
  if (acao==='senado'){ t.neg.sen += 0.07; txt='Jantar com senadores na residência oficial. O líder do governo no Senado contabiliza novos votos.'; }
  if (acao==='ministro'){
    const m = S.ministros[def.ministerio||'casacivil'] || S.ministros.casacivil;
    const v = clamp((m.pol-45)/550, 0.005, 0.07); t.neg.g += v;
    txt = `${m.nome} passa a semana no Congresso defendendo o projeto em comissões e gabinetes. ${m.pol>=70?'O trânsito político ajuda.':'O trânsito no Congresso é limitado.'}`;
  }
  if (acao==='governadores'){
    if (S.grp.governadores>=45){ t.neg.g += 0.045; S.eco.primTemp-=0.03; txt='Governadores aliados ligam para suas bancadas. Em troca, convênios e obras nos estados.'; }
    else { t.neg.g += 0.01; txt='Os governadores estão insatisfeitos com o Planalto e fazem pouco esforço.'; }
  }
  if (acao==='rua'){
    const esq = (def.e||0) <= 0;
    const g = esq ? (S.grp.movsociais+S.grp.sindicatos)/2 : (S.grp.evangelicos+S.grp.agro)/2;
    const publico = (g*0.5 + S.aprov*0.5) + rnd(-12,12) + (def.pop||0)*10;
    if (publico>58){ t.neg.g += 0.06; S.aprovShock += 1; txt=`${esq?'Centrais, MST e estudantes':'Igrejas, produtores e grupos conservadores'} lotam a Esplanada e avenidas em 20 capitais. Deputados sentem a pressão.`; }
    else if (publico>42){ t.neg.g += 0.025; txt='Atos médios em algumas capitais. Repercussão moderada.'; }
    else { t.neg.g -= 0.02; S.aprovShock -= 1.5; txt='Os atos esvaziam. A oposição posta fotos das praças vazias e o governo vira meme.'; }
    if (Math.random()<0.15){ S.aprovShock -= 2; S.grp.imprensa=clamp(S.grp.imprensa-3,0,100); txt+=' Há confronto com a polícia em uma das capitais.'; }
    if (Math.random()<0.3){ t.neg.g -= 0.015; txt+=' A oposição convoca contra-atos para o fim de semana.'; }
  }
  if (acao==='greve'){
    const trabalhista = (def.frentes||FRENTES_PROJ[def.id]||{}).trab>0 || (def.e||0)<-2;
    if (S.grp.sindicatos<50 || !trabalhista){ S.ap += 1; txt = S.grp.sindicatos<50 ? 'As centrais sindicais recusam: a relação com o governo está ruim.' : 'As centrais recusam convocar greve geral por uma pauta que não é dos trabalhadores.'; }
    else { t.neg.g += 0.09; applyFx({ eco:{pibShock:-0.35}, grp:{mercado:-8, comercio:-8, industria:-6, sindicatos:6} }); txt='Greve geral: transporte, bancos, escolas e fábricas param por 24 horas em todo o país. O Congresso sente a pressão; empresários reclamam do prejuízo.'; }
  }
  if (acao==='redes'){ const v=(def.pop||0)*0.05; t.neg.g += v; S.aprovShock += (def.pop||0)>0?0.5:-0.5; txt = v>0.015 ? 'A campanha viraliza e deputados indecisos recebem milhares de mensagens de eleitores.' : 'A campanha não engaja: o tema tem pouco apelo popular.'; }
  if (acao==='urgencia'){
    if (S.presCamara<40){ S.ap += 1; txt='O presidente da Câmara nega o pedido de urgência.'; }
    else { t.restante = 1; S.presCamara=clamp(S.presCamara-2,0,100); txt='Urgência aprovada: o projeto vai a plenário no fim deste mês.'; }
  }
  if (acao==='adiar'){
    if (t.mp && (S.t - t.tIni) >= 3){ S.ap += 1; txt='Não dá para adiar: a MP caduca se não for votada até o fim do prazo.'; }
    else { t.restante += 1; S.presCamara=clamp(S.presCamara-4,0,100); txt='Votação adiada por um mês. Líderes reclamam de "pauta travada".'; }
  }
  t.hist.unshift({ t:S.t, txt });
  logar('Congresso', `${def.nome}: ${txt}`);
  calcBase(); salvar();
  return txt;
}

// ---------- ato em defesa do governo (ação geral) ----------
ACOES_FX.ato = function(){
  const esq = S.pres.e <= 0;
  const g = esq ? (S.grp.movsociais+S.grp.sindicatos)/2 : (S.grp.evangelicos+S.grp.agro)/2;
  const publico = g*0.5 + S.aprov*0.5 + rnd(-12,12);
  if (publico>58){ S.aprovShock += 2; S.presCamara=clamp(S.presCamara+4,0,100); logar('Agenda','Ato em defesa do governo reúne multidão.'); return 'Multidão nas ruas em defesa do governo. O Congresso recebe o recado.'; }
  if (publico>42){ S.aprovShock += 0.5; logar('Agenda','Ato em defesa do governo tem adesão moderada.'); return 'Adesão moderada. Bom para a militância, pouco efeito fora dela.'; }
  S.aprovShock -= 2; logar('Agenda','Ato governista esvaziado vira piada nas redes.'); return 'O ato esvazia e vira piada nas redes. Aprovação −2.';
};

// ---------- rupturas institucionais ----------
const RUPTURAS = {
  militar: { nome:'Regime militar', cor:'var(--yel)',
    intro:'O caminho do autogolpe. O Brasil viveu isso em 1937 (Estado Novo) e em 1964, com 21 anos de ditadura, censura, tortura e o AI-5. Em 8 de janeiro de 2023 houve a tentativa de ruptura mais recente, e os envolvidos foram processados pelos crimes contra o Estado Democrático de Direito (Lei 14.197/2021).',
    etapas:[
      { nome:'Cortejar a caserna', desc:'Reajuste de soldos, reequipamento e generais em cargos civis.', req:{}, fx:{ grp:{militares:15, judiciario:-6, imprensa:-5}, eco:{primario:-0.08} } },
      { nome:'GLO permanente nas capitais', desc:'Garantia da Lei e da Ordem prolongada, com tropas nas ruas e comando militar na segurança pública.', req:{militares:62}, fx:{ grp:{militares:8, movsociais:-12, imprensa:-10, judiciario:-10}, aprov:-1, rel:{UE:-6, EUA:-4}, idx:{seg:4} } },
      { nome:'Estado de Defesa', desc:'Art. 136: restringe direitos de reunião e sigilo de comunicações. O Congresso precisa aprovar por maioria absoluta em 10 dias.', req:{militares:70, aprov:38}, voto:{ tipo:'PLP', e:5, s:8, we:0.4, ws:1, pop:-0.4, tram:1 } },
      { nome:'Ruptura institucional', desc:'Fechar o Congresso e afastar ministros do STF com apoio das Forças Armadas. Arts. 359-L e 359-M do Código Penal: crime contra o Estado Democrático de Direito.', req:{militares:80, governadores:55}, final:true },
    ]},
  socialista: { nome:'Revolução socialista', cor:'var(--red)',
    intro:'O caminho da ruptura pela esquerda. As Reformas de Base de João Goulart, em 1964, terminaram em golpe militar; no Chile, o governo de Salvador Allende caiu em 1973. A Constituição de 1988 só pode ser substituída por um novo poder constituinte, e o mercado, o agro e as Forças Armadas reagem.',
    etapas:[
      { nome:'Conselhos populares', desc:'Decreto de participação social cria conselhos populares com voz sobre o orçamento federal.', req:{}, fx:{ grp:{movsociais:12, sindicatos:6, mercado:-10, imprensa:-5, agro:-5} } },
      { nome:'Plebiscito por Constituinte exclusiva', desc:'O Congresso precisa autorizar o plebiscito (decreto legislativo, maioria simples). Depois, o povo decide nas urnas.', req:{movsociais:65, aprov:46}, voto:{ tipo:'PL', e:-7, s:-4, we:1, ws:0.3, pop:0.3, tram:2 }, plebiscito:true },
      { nome:'Nacionalizações e reforma agrária radical', desc:'Bancos e Petrobras sob controle estatal, desapropriação de latifúndios, controle de capitais.', req:{sindicatos:62, movsociais:70}, fx:{ grp:{mercado:-35, agro:-30, industria:-20, militares:-15, sindicatos:10, movsociais:12, imprensa:-8}, eco:{conf:-30, dolarPct:25, pibShock:-2, inflShock:3}, rel:{EUA:-30, UE:-12, China:8, Russia:6, Venezuela:15}, mod:{pobreza:-0.05} } },
      { nome:'Promulgar a nova Constituição', desc:'A Constituinte aprova uma República Socialista com planejamento estatal dos setores estratégicos.', req:{aprov:50, movsociais:75, sindicatos:70}, final:true },
    ]},
};
const ROT_REQ = { militares:'Forças Armadas', governadores:'Governadores', aprov:'Aprovação', movsociais:'Movimentos sociais', sindicatos:'Centrais sindicais' };
function valorReq(k){ return k==='aprov' ? S.aprov : S.grp[k]; }

function estadoRuptura(path){
  S.poder = S.poder || { militar:0, socialista:0, tMil:-9, tSoc:-9, pend:null };
  const R = RUPTURAS[path], i = S.poder[path], et = R.etapas[i];
  if (!et) return { fim:true };
  const reqs = Object.entries(et.req).map(([k,v])=>({ k, nome:ROT_REQ[k], v, atual:valorReq(k), ok:valorReq(k)>=v }));
  const ult = path==='militar'? S.poder.tMil : S.poder.tSoc;
  const espera = S.t - ult < 2;
  const outro = path==='militar'? S.poder.socialista : S.poder.militar;
  const emVoto = S.projetos.some(p=>{ const d=getProj(p.id); return d && d.ruptura && d.ruptura.path===path; });
  return { i, et, reqs, ok: reqs.every(r=>r.ok) && !espera && !emVoto && outro===0 && S.ap>=2, espera, outro, emVoto };
}

function avancarRuptura(path){
  const st = estadoRuptura(path); if (!st.ok) return null;
  const R = RUPTURAS[path], et = st.et;
  S.ap -= 2;
  if (path==='militar') S.poder.tMil = S.t; else S.poder.tSoc = S.t;
  logar('Crise', `${R.nome}: ${et.nome}.`);
  if (et.voto){
    const id = `rupt_${path}_${st.i}`;
    S.medidas = S.medidas||{};
    S.medidas[id] = { id, nome:et.nome, desc:et.desc, ...et.voto, custom:true, instrumento: et.voto.tipo, ruptura:{ path, i:st.i, plebiscito:!!et.plebiscito }, fx:{ aprov:0, grp:{}, rel:{}, mod:{}, eco:{} } };
    propor(id, false); S.ap += 1; // propor já desconta 1
    S.flags.impeachRisk = (S.flags.impeachRisk||0) + (path==='militar'?1:0);
    return `${et.nome} enviado ao Congresso. A votação será em ${et.voto.tram} ${et.voto.tram>1?'meses':'mês'}. Juristas, OAB e imprensa reagem com alarme.`;
  }
  if (et.final) return finalRuptura(path);
  const efs = applyFx(et.fx);
  S.poder[path]++;
  reacoesRuptura(path);
  return `${et.nome}: medida em vigor.`;
}

function reacoesRuptura(path){
  if (path==='militar'){ S.grp.judiciario=clamp(S.grp.judiciario-6,0,100); S.stf=clamp(S.stf-8,0,100); S.rel.EUA=clamp(S.rel.EUA-3,0,100); S.rel.UE=clamp(S.rel.UE-5,0,100); S.flags.impeachRisk=(S.flags.impeachRisk||0)+1; logar('Crise','OAB, entidades da sociedade civil e ex-presidentes do STF divulgam nota em defesa da democracia.'); }
  else { S.grp.militares=clamp(S.grp.militares-6,0,100); S.grp.mercado=clamp(S.grp.mercado-6,0,100); S.eco.conf=clamp(S.eco.conf-6,0,100); S.eco.dolar*=1.03; logar('Crise','Entidades empresariais e o agro acusam o governo de "rumo ao autoritarismo"; o dólar dispara.'); }
}

function concluirEtapaVotada(def, aprovado){
  const { path, i, plebiscito } = def.ruptura;
  if (!aprovado){
    S.aprovShock -= 4;
    if (path==='militar'){ S.flags.impeachRisk=(S.flags.impeachRisk||0)+2; S.grp.militares=clamp(S.grp.militares-8,0,100); }
    return 'O Congresso rejeita. A ruptura perde força e a oposição fala em impeachment.';
  }
  if (plebiscito){
    const sim = clamp(S.aprov + rnd(-6,6) + (S.grp.movsociais-60)*0.2, 10, 90);
    if (sim<50){ S.aprovShock -= 5; return `Plebiscito: ${fmt(100-sim,1)}% votam NÃO à Constituinte. Derrota histórica do governo.`; }
    S.poder[path]=i+1; reacoesRuptura(path);
    return `Plebiscito: ${fmt(sim,1)}% votam SIM. Uma Assembleia Constituinte exclusiva será eleita.`;
  }
  S.poder[path]=i+1; reacoesRuptura(path);
  return 'Aprovado. As Forças Armadas assumem o controle da segurança nas capitais sob Estado de Defesa.';
}

function finalRuptura(path){
  if (path==='militar'){
    const sc = (S.grp.militares-75)/8 + (S.grp.governadores-55)/14 + (S.aprov-40)/14 + (S.baseCamara-257)/140 - (S.grp.judiciario-25)/25 - (S.rel.EUA-30)/40 - 0.6;
    const p = 1/(1+Math.exp(-sc));
    if (Math.random()<p){ S.fim = { tipo:'ditadura' }; return 'Tanques nas ruas de Brasília. O Congresso é fechado e ministros do STF são afastados. Começa um regime de exceção.'; }
    S.fim = { tipo:'golpe_fracassado' }; return 'O Alto Comando se divide e parte das tropas não adere. O STF determina sua prisão e o Congresso aprova o afastamento.';
  }
  const sc = (S.aprov-50)/9 + (S.grp.movsociais-70)/10 + (S.grp.sindicatos-65)/12 - (S.grp.militares-30)/14 - 0.3;
  const p = 1/(1+Math.exp(-sc));
  if (Math.random()<p){ S.fim = { tipo:'socialismo' }; return 'A nova Constituição é promulgada em sessão solene. Nasce a República Socialista do Brasil, sob sanções e forte oposição interna.'; }
  if (S.grp.militares>35){ S.fim = { tipo:'deposto' }; return 'Com o país dividido, as Forças Armadas se recusam a reconhecer a nova Constituição e depõem o governo, como em 1964.'; }
  S.fim = { tipo:'impeachment' }; return 'A Constituinte se fragmenta e o Congresso aprova seu impeachment.';
}

// ---------- reações de figuras públicas ----------
function reacoesReais(def, aprovFx){
  const pega = a=>a[Math.floor(Math.random()*a.length)];
  const lista = COMENTARISTAS.map(c=>({ c, d: def ? Math.hypot((def.e||0)-c[2], (def.s||0)-c[3]) : Math.random()*10 }));
  let posts;
  if (def && (def.e||def.s)){
    lista.sort((a,b)=>a.d-b.d);
    const fav = pega(lista.slice(0,4)).c, con = pega(lista.slice(-4)).c;
    posts = [[fav, pega(fav[4])], [con, pega(con[5])]];
  } else {
    const a = pega(COMENTARISTAS), b = pega(COMENTARISTAS.filter(x=>x!==a));
    posts = aprovFx>0 ? [[a,pega(a[4])],[b,pega(b[5])]] : aprovFx<0 ? [[a,pega(a[5])],[b,pega(b[5])]] : [[a,pega(a[4])],[b,pega(b[5])]];
  }
  return posts.map(([c,t])=>({ nome:c[0], quem:c[1], texto:t }));
}
