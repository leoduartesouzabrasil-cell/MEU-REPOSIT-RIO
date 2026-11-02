// =====================================================================
// A FAIXA — motor de simulação
// =====================================================================

const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
const COPOM = [0,2,4,5,6,8,10,11];
const TOTAL_TURNOS = 48;
const SAVE_KEY = 'afaixa_save_v1';

let S = null;

// ---------- utilitários ----------
const clamp = (v,a,b)=>Math.max(a,Math.min(b,v));
const rnd = (a,b)=>a+Math.random()*(b-a);
const rint = (a,b)=>Math.floor(rnd(a,b+1));
const randn = ()=>{ let u=0,v=0; while(!u)u=Math.random(); while(!v)v=Math.random(); return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v); };
const fmt = (v,d=1)=>Number(v).toLocaleString('pt-BR',{minimumFractionDigits:d,maximumFractionDigits:d});
const fmtPct = (v,d=1)=>(v>0?'+':'')+fmt(v,d)+'%';
const dataTurno = t=>`${MESES[t%12]} de ${2027+Math.floor(t/12)}`;
const dataCurta = t=>`${MESES[t%12].slice(0,3).toLowerCase()}/${String(27+Math.floor(t/12))}`;
const P = id=>S.partidos.find(p=>p.id===id);
const MIN = id=>MINISTERIOS.find(m=>m.id===id);
const dist = (a,b)=>Math.hypot(a.e-b.e, a.s-b.s);

function gerarNome(){
  const f = Math.random()<0.45;
  return { nome:`${pick(f?NOMES_F:NOMES_M)} ${pick(SOBRENOMES)}`, gen: f?'f':'m' };
}

function gerarMinistro(minId, partido, opts={}){
  const n = gerarNome();
  const tecnico = !partido || (opts.forcaTec);
  const own = partido && partido===(S? S.pres.partido : (typeof SETUP_PARTIDO!=='undefined'? SETUP_PARTIDO : null));
  const integBase = tecnico? rint(65,95) : rint(35,88);
  return {
    nome:n.nome, gen:n.gen, partido: tecnico? null : partido,
    perfil: tecnico? 'tecnico':'politico',
    desc: pick(tecnico? PERFIS_MIN.tecnico : PERFIS_MIN.politico).split('|')[n.gen==='f'?1:0],
    comp: tecnico? rint(60,92) : rint(45,82),
    leal: own? rint(72,96) : tecnico? rint(55,82) : rint(42,80),
    integ: integBase,
    desde: S? S.t : 0,
  };
}

function candidatosMinisterio(minId, coalizao, presPartido){
  const out = [gerarMinistro(minId, null)];
  out.push(gerarMinistro(minId, presPartido));
  const aliados = coalizao.filter(p=>p!==presPartido);
  const pool = aliados.length? aliados.slice() : PARTIDOS.map(p=>p.id).filter(p=>p!==presPartido);
  for (let i=0;i<2;i++){
    const p = pool.length? pool.splice(Math.floor(Math.random()*pool.length),1)[0] : presPartido;
    out.push(gerarMinistro(minId, p));
  }
  return out;
}

// ---------- criação do jogo ----------
function novoEstado(cfg){
  const partidos = PARTIDOS.map(p=>({...p, sat:30}));
  if (cfg.novoPartido){
    const np = { id:cfg.novoPartido.sigla, nome:cfg.novoPartido.nome, cor:cfg.novoPartido.cor, dep:0, sen:0, e:cfg.pres.e, s:cfg.pres.s, fis:0.3, sat:80, custom:true };
    // migração de parlamentares dos partidos mais próximos ideologicamente
    const prox = partidos.slice().sort((a,b)=>dist(a,np)-dist(b,np)).slice(0,4);
    let dep=18, sen=2;
    while(dep>0){ for(const p of prox){ if(dep>0 && p.dep>4){ p.dep--; np.dep++; dep--; } } }
    while(sen>0){ for(const p of prox){ if(sen>0 && p.sen>1){ p.sen--; np.sen++; sen--; } } if(prox.every(p=>p.sen<=1)) break; }
    partidos.push(np);
  }
  partidos.sort((a,b)=>a.e-b.e);
  const dif = cfg.dificuldade;
  const st = {
    v:1, t:0, dificuldade:dif,
    pres:cfg.pres, vice:cfg.vice,
    partidos, coalizao:cfg.coalizao.slice(),
    ministros:cfg.ministros,
    eco:{ pib:1.8, ipca:4.6, selic:13.25, desemp:5.8, dolar:5.40, divida:82.4, primStruct:-0.35, primTemp:0, meta:0.5,
          conf:48, pibShock:0, inflShock:0, potencial:2.0, bcHawk:1.0, expInfl:4.2, global:0, dolar12:[5.4] },
    soc:{ pobreza:23.0, homic:20.8, desmat:5800, educ:52, saude:55, infra:45, salmin:1621 },
    mods:{ pobreza:0, homic:0, desmat:0, educ:0, saude:0, infra:0 },
    aprov:50, aprovShock:4, reg:{N:0,NE:0,CO:0,SE:0,S:0}, uf:{},
    grp:{}, rel:{}, presCamara:50, stf:50,
    projetos:[], aprovadas:[], rejeitadas:{},
    pendentes:[], log:[], hist:{ aprov:[], pib:[], ipca:[], selic:[], desemp:[], dolar:[], divida:[], primario:[], base:[], conf:[] },
    flags:{}, cooldowns:{}, usados:{}, promessas:cfg.promessas,
    pronCount:0, emendasBuff:0, ap:3, fim:null, baseCamara:0, baseSenado:0, cpi:0,
  };
  GRUPOS.forEach(g=>st.grp[g.id]=g.ini);
  PAISES.forEach(c=>st.rel[c.id]=c.ini);
  ESTADOS.forEach(e=>st.uf[e.uf]=0);
  st.uf[cfg.pres.uf] = 7;
  S = st;
  // ajustes de ideologia sobre grupos
  const L = leanGrupos();
  for (const g in L) S.grp[g] = clamp(S.grp[g] + L[g]*0.6, 5, 95);
  const bg = BACKGROUNDS.find(b=>b.id===cfg.pres.bg);
  if (bg) applyFx({ grp:bg.fx.grp||{} }, true);
  // diplomacia: alinhamento ideológico inicial
  S.rel.EUA = clamp(S.rel.EUA + S.pres.e*1.8, 10, 90);
  S.rel.China = clamp(S.rel.China - S.pres.e*0.6, 10, 90);
  S.rel.Venezuela = clamp(S.rel.Venezuela - S.pres.e*2, 5, 90);
  S.rel.Argentina = clamp(S.rel.Argentina + S.pres.e*1.5, 10, 90);
  if (dif==='facil'){ S.aprovShock += 5; S.grp.mercado += 5; }
  if (dif==='dificil'){ S.aprovShock -= 4; S.eco.conf -= 5; }
  // satisfação inicial dos partidos
  S.partidos.forEach(p=>{
    if (p.id===S.pres.partido) p.sat = 85;
    else if (S.coalizao.includes(p.id)) p.sat = 60;
    else p.sat = clamp(30 - dist(p,S.pres)*1.2, 5, 45);
  });
  if (S.vice && S.vice.partido){ const vp=P(S.vice.partido); if (vp) vp.sat += 10; }
  atualizarPartidos(true);
  calcBase();
  registrarHist();
  S.ap = apMax();
  logar('Política', `${S.pres.nome} toma posse como presidente da República em 5 de janeiro de 2027, primeira posse sob a data fixada pela EC 111/2021.`);
  enfileirarEventos();
  return S;
}

function leanGrupos(){
  const e=S.pres.e, s=S.pres.s;
  return { mercado:e*2.5, agro:e*2+s*1, industria:e*1, comercio:e*1.5, sindicatos:-e*2.5, movsociais:-e*2-s*1.2,
    evangelicos:s*3, militares:s*1.5+e*0.8, imprensa:-Math.abs(s)*0.8, judiciario:-s*1.2, governadores:0, ambientalistas:-e*1-s*1.5 };
}

function apMax(){
  let a = 3;
  if (S.dificuldade==='facil') a++;
  const cc = S.ministros.casacivil; if (cc && cc.comp>=80) a++;
  return a;
}

function compMin(id){
  const m = S.ministros[id]; if (!m) return 0;
  let c = m.comp;
  const bg = BACKGROUNDS.find(b=>b.id===S.pres.bg);
  if (bg && bg.fx.bonus && bg.fx.bonus[id]) c += bg.fx.bonus[id];
  return (c-60)/40; // ~ -0.4 .. +0.9
}

function logar(cat, txt){ S.log.unshift({ t:S.t, cat, txt }); if (S.log.length>400) S.log.length=400; }

// ---------- efeitos ----------
function applyFx(fx, silencioso){
  const res = [];
  if (!fx) return res;
  const add = (lbl,v,suf='')=>{ if (v) res.push({ lbl, v, suf }); };
  if (fx.aprov){ S.aprovShock += fx.aprov; add('Aprovação', fx.aprov, ' pts'); }
  if (fx.reg) for (const r in fx.reg){ S.reg[r] += fx.reg[r]; add(REGIOES[r], fx.reg[r], ' pts'); }
  if (fx.grp) for (const g in fx.grp){ if (S.grp[g]==null) continue; S.grp[g] = clamp(S.grp[g]+fx.grp[g], 0, 100); add(GRUPOS.find(x=>x.id===g).nome, fx.grp[g]); }
  if (fx.rel) for (const c in fx.rel){ if (S.rel[c]==null) continue; let v=fx.rel[c]; if (v>0) v*= 1 + compMin('itamaraty')*0.3; S.rel[c] = clamp(S.rel[c]+v, 0, 100); add(PAISES.find(x=>x.id===c).nome, Math.round(v)); }
  for (const key of ['party','party2']) if (fx[key]) for (const k in fx[key]){
    const v = fx[key][k];
    let alvo = [];
    if (k==='all') alvo = S.partidos;
    else if (k==='base') alvo = S.partidos.filter(p=>S.coalizao.includes(p.id) && p.id!==S.pres.partido);
    else if (k==='opos') alvo = S.partidos.filter(p=>!S.coalizao.includes(p.id));
    else if (k==='own') alvo = [P(S.pres.partido)];
    else if (P(k)) alvo = [P(k)];
    alvo.forEach(p=>p.sat = clamp(p.sat+v, 0, 100));
    const nome = {all:'Todos os partidos', base:'Partidos da base', opos:'Oposição', own:'Seu partido'}[k] || k;
    add(nome, v);
  }
  if (fx.eco){
    const e=fx.eco;
    if (e.pibShock){ S.eco.pibShock += e.pibShock; add('Crescimento', e.pibShock, ' p.p.'); }
    if (e.inflShock){ S.eco.inflShock += e.inflShock; add('Inflação', e.inflShock, ' p.p.', true); }
    if (e.primario){ S.eco.primStruct += e.primario; add('Resultado primário', e.primario, '% PIB'); }
    if (e.gasto){ S.eco.primTemp -= e.gasto; add('Gasto extra', -e.gasto, '% PIB'); }
    if (e.conf){ S.eco.conf = clamp(S.eco.conf+e.conf, 0, 100); add('Confiança do mercado', e.conf); }
    if (e.dolarPct){ S.eco.dolar *= 1+e.dolarPct/100; add('Dólar', e.dolarPct, '%'); }
  }
  if (fx.mod) for (const k in fx.mod){
    const v = fx.mod[k];
    if (k==='potencial'){ S.eco.potencial += v; add('PIB potencial', v, ' p.p.'); }
    else if (k==='desemp'){ S.eco.desemp += v*30; add('Desemprego', v*30, ' p.p.'); }
    else { S.mods[k] = (S.mods[k]||0) + v; add({pobreza:'Tendência da pobreza',homic:'Tendência de homicídios',desmat:'Tendência do desmatamento',educ:'Educação (tendência)',saude:'Saúde (tendência)',infra:'Infraestrutura (tendência)'}[k]||k, v*100, '%/ano'); }
  }
  if (fx.idx) for (const k in fx.idx){
    if (k==='seg'){ S.soc.homic *= 1 - fx.idx[k]/100; add('Segurança', fx.idx[k]); }
    else { S.soc[k] = clamp(S.soc[k]+fx.idx[k], 0, 100); add({educ:'Educação',saude:'Saúde',infra:'Infraestrutura'}[k]||k, fx.idx[k]); }
  }
  if (fx.meta!=null){
    if (typeof fx.meta==='string') S.eco.meta = Math.round((S.eco.meta + parseFloat(fx.meta))*100)/100;
    else S.eco.meta = fx.meta;
    res.push({ lbl:'Meta fiscal', txt: fmt(S.eco.meta,2)+'% do PIB' });
  }
  if (fx.presCamara){ S.presCamara = clamp(S.presCamara+fx.presCamara,0,100); add('Presidência da Câmara', fx.presCamara); }
  if (fx.stf){ S.stf = clamp(S.stf+fx.stf,0,100); add('Relação com o STF', fx.stf); }
  if (fx.bc){ S.eco.bcHawk = fx.bc; }
  if (fx.flag){ S.flags[fx.flag] = true; }
  if (fx.custom && CUSTOM[fx.custom]){ const r = CUSTOM[fx.custom](fx); if (r) res.push({ txt:r, livre:true }); }
  return res;
}

function inverterFx(fx){
  const inv = {};
  if (fx.eco && fx.eco.primario) inv.eco = { primario:-fx.eco.primario };
  if (fx.mod){ inv.mod = {}; for (const k in fx.mod) inv.mod[k] = -fx.mod[k]; }
  return inv;
}

// ---------- ações customizadas de eventos ----------
const CUSTOM = {
  mesaPropria(){
    const ok = Math.random() < (S.baseCamara>257? 0.6 : 0.28);
    if (ok){ S.presCamara = clamp(S.presCamara+28,0,100); P(S.pres.partido).sat += 8; return 'Vitória apertada no segundo turno da eleição da Mesa. O governo controla a pauta da Câmara.'; }
    S.presCamara = clamp(S.presCamara-22,0,100); ['União','PP','Republicanos'].forEach(id=>{ if(P(id)) P(id).sat -= 8; });
    return 'Derrota: o candidato do Centrão vence e assume a Câmara ressentido com o Planalto.';
  },
  argentinaApoio(){
    const alinhado = (S.pres.e<0) === !!S.flags.argEsq;
    const venceuEsq = Math.random() < (S.flags.argEsq? 0.58 : 0.42);
    const apoiouVenceu = alinhado ? (venceuEsq === !!S.flags.argEsq) : (venceuEsq !== !!S.flags.argEsq);
    const quem = venceuEsq? 'o candidato peronista' : 'o candidato liberal';
    if (apoiouVenceu){ S.rel.Argentina = clamp(S.rel.Argentina+14,0,100); return `Vence ${quem}, a quem você sinalizou apoio. Relação com Buenos Aires em alta.`; }
    S.rel.Argentina = clamp(S.rel.Argentina-16,0,100); return `Vence ${quem}, que acusa o Brasil de interferência. Relação abalada.`;
  },
  olimpiadas(){
    const ouro = rint(2,9), total = ouro + rint(12,20);
    const fx = (total-20)*0.25 + (ouro-4)*0.3;
    S.aprovShock += fx;
    return `O Brasil termina Los Angeles 2028 com ${total} medalhas, ${ouro} de ouro. ${total>=24?'Melhor campanha da história!':'Campanha dentro do esperado.'}`;
  },
  municipais(fx){
    const k = fx.k||1;
    const forca = (S.aprov-45)*0.25*k + rnd(-2,2);
    S.flags.forcaMunicipal = forca;
    const own = P(S.pres.partido);
    own.sat = clamp(own.sat + forca, 0, 100);
    S.partidos.filter(p=>S.coalizao.includes(p.id)).forEach(p=>p.sat = clamp(p.sat + forca*0.5, 0, 100));
    S.aprovShock += k>1? forca*0.15 : 0;
    const prefs = Math.max(40, Math.round(250 + forca*40));
    return forca>0 ? `Bom resultado: o ${own.id} elege ${prefs} prefeitos e vence em capitais importantes. A base sai fortalecida para 2030.`
                   : `Resultado ruim: o ${own.id} elege apenas ${prefs} prefeitos. Aliados começam a olhar para outras candidaturas em 2030.`;
  },
  salmin(fx){
    const reaj = S.eco.ipca + (fx.real||0);
    const novo = Math.round(S.soc.salmin*(1+reaj/100));
    S.soc.salmin = novo;
    if (fx.real>=5) S.mods.pobreza -= 0.01;
    return `Novo salário mínimo: R$ ${novo.toLocaleString('pt-BR')} (reajuste de ${fmt(reaj)}%).`;
  },
  rebaixamento(){
    if (Math.random()<0.6){ applyFx({ eco:{conf:-12, dolarPct:4}, grp:{mercado:-8} }); return 'A agência rebaixa a nota do Brasil. Dólar dispara e investidores estrangeiros saem.'; }
    return 'A agência mantém a nota, mas com alerta. O mercado respira.';
  },
  cpi(fx){
    const forte = S.baseCamara>290;
    S.cpi = 4;
    S.aprovShock -= forte? 1.5 : 4;
    return forte? `A CPI sobre ${fx.tema} é instalada com relator governista. O desgaste é controlado.`
                : `A CPI sobre ${fx.tema} é dominada pela oposição. Depoimentos diários na TV desgastam o governo.`;
  },
  centrao(fx){
    const p = P(S.flags._centrao) || P('PP');
    if (fx.modo==='emendas'){ applyFx({ eco:{gasto:0.05} }); p.sat = clamp(p.sat+14,0,100); return `O ${p.id} se acalma após o pagamento das emendas.`; }
    if (fx.modo==='estatal'){ p.sat = clamp(p.sat+11,0,100); S.grp.imprensa -= 3; return `Um indicado do ${p.id} assume a presidência de uma estatal.`; }
    p.sat = clamp(p.sat-16,0,100); S.aprovShock += 1; S.grp.imprensa += 3; return `O ${p.id} ameaça romper. A imprensa elogia a firmeza.`;
  },
  impeachmentrisco(){ S.flags.impeachRisk = (S.flags.impeachRisk||0)+1; S.aprovShock -= 1; return 'O pedido segue na gaveta do presidente da Câmara, que agora tem uma carta na manga.'; },
  pfAliado(fx){
    const p = P(S.flags._pfp) || P(S.pres.partido);
    if (fx.defende){ p.sat=clamp(p.sat+8,0,100); S.aprovShock -= 3; S.grp.imprensa -= 6; S.grp.judiciario -= 5; return `O ${p.id} agradece; a imprensa acusa o governo de proteger investigados.`; }
    p.sat=clamp(p.sat-10,0,100); S.grp.imprensa += 5; S.aprovShock += 1; return `O ${p.id} reclama de "abandono", mas a opinião pública aprova.`;
  },
  desincomp(fx){
    const pol = MINISTERIOS.filter(m=>S.ministros[m.id] && S.ministros[m.id].perfil==='politico');
    if (fx.modo==='fica'){ pol.forEach(m=>{ const p=P(S.ministros[m.id].partido); if(p) p.sat=clamp(p.sat-5,0,100); }); return `${pol.length} ministros políticos permanecem, mas seus partidos reclamam de perder candidatos.`; }
    let n=0;
    pol.forEach(m=>{ if (Math.random()<0.65){ n++; S.ministros[m.id] = gerarMinistro(m.id, null); } });
    return `${n} ministros deixam o governo para disputar eleições. Secretários-executivos técnicos assumem as pastas.`;
  },
  copa(){
    const r = Math.random();
    let txt, fx;
    if (r<0.12){ S.flags.hexa = true; txt='O Brasil é HEXACAMPEÃO do mundo! Carnaval fora de época nas ruas.'; fx=5; }
    else if (r<0.24){ txt='O Brasil perde a final nos pênaltis. Orgulho e frustração.'; fx=1.5; }
    else if (r<0.45){ txt='Eliminado na semifinal.'; fx=0.5; }
    else if (r<0.75){ txt='Eliminado nas quartas de final. Mais um ciclo de cobranças.'; fx=-0.5; }
    else { txt='Vexame: eliminado nas oitavas. O humor nacional despenca.'; fx=-1.5; }
    S.aprovShock += fx; return txt;
  },
  campanha(fx){
    const prom = S.promessas.filter(id=>PROMESSAS.find(p=>p.id===id).chk(S)).length;
    if (fx.modo==='legado'){ S.flags.camp = 1.5 + prom*1.2; return 'A campanha aposta em obras, números e promessas cumpridas.'; }
    if (fx.modo==='aliancas'){ S.flags.camp = 2.5; S.partidos.filter(p=>S.coalizao.includes(p.id)).forEach(p=>p.sat=clamp(p.sat+10,0,100)); return 'Palanques duplos nos estados e tempo de TV recorde.'; }
    if (fx.modo==='polarizar'){ S.flags.camp = rnd(-2,5); return 'Campanha de confronto. Mobiliza a base, mas afasta o eleitor de centro.'; }
    S.flags.desistiu = true; return 'Você anuncia que não será candidato. Seu partido lança um sucessor.';
  },
  impeachmentLuta(fx){
    if (fx.modo==='renuncia'){ S.fim = { tipo:'renuncia' }; return 'Você renuncia ao mandato.'; }
    if (fx.modo==='emendas'){ applyFx({ eco:{gasto:0.15}, party:{all:12}, presCamara:10 }); }
    if (fx.modo==='rua'){ S.aprovShock += 3; S.grp.movsociais += 6; }
    calcBase();
    const contra = votacaoImpeachment(fx.modo==='emendas'?0.06:fx.modo==='rua'?0.02:0);
    if (contra >= 342){ S.fim = { tipo:'impeachment', votos:contra }; return `A Câmara autoriza o processo por ${contra} votos a ${513-contra}. O Senado afasta você do cargo.`; }
    S.flags.impeachRisk = 0; S.flags.sobreviveu = true;
    return `O pedido é rejeitado: apenas ${contra} votos a favor, abaixo dos 342 necessários. Você sobrevive.`;
  },
  saidaPartido(fx){
    const p = P(fx.p);
    if (fx.modo==='cede'){ p.sat = clamp(p.sat+22,0,100); S.grp.imprensa -= 2; return `O ${p.id} fica na base após ganhar uma secretaria com status de ministério.`; }
    if (fx.modo==='emendas'){ applyFx({ eco:{gasto:0.05} }); p.sat = clamp(p.sat+16,0,100); return `Emendas pagas, o ${p.id} recua.`; }
    S.coalizao = S.coalizao.filter(x=>x!==p.id);
    // ministros do partido deixam o governo
    for (const id in S.ministros) if (S.ministros[id].partido===p.id) S.ministros[id] = gerarMinistro(id, null);
    calcBase();
    return `O ${p.id} entrega os cargos e deixa a base do governo. Técnicos assumem os ministérios que eram do partido.`;
  },
  adesao(fx){
    const p = P(fx.p);
    if (fx.modo==='aceita'){ S.coalizao.push(p.id); p.sat = 58; calcBase(); return `O ${p.id} entra oficialmente na base. Indique um nome do partido para algum ministério para consolidar o apoio.`; }
    p.sat -= 6; return `O ${p.id} segue independente.`;
  },
  escandalo(fx){
    const m = S.ministros[fx.min]; if (!m) return '';
    const p = m.partido? P(m.partido) : null;
    if (fx.modo==='demite'){
      S.aprovShock -= 1; if (p) p.sat = clamp(p.sat-8,0,100);
      S.ministros[fx.min] = gerarMinistro(fx.min, null);
      return `${m.nome} é exonerad${m.gen==='f'?'a':'o'}. ${S.ministros[fx.min].nome}, ${S.ministros[fx.min].desc}, assume a pasta.`;
    }
    if (fx.modo==='afasta'){ S.aprovShock -= 2; m.comp -= 5; return `${m.nome} se licencia até a conclusão das investigações. A pasta perde ritmo.`; }
    const pego = Math.random() < (100-m.integ)/100 + 0.15;
    if (pego){ S.aprovShock -= 6; S.grp.imprensa -= 8; S.flags.impeachRisk=(S.flags.impeachRisk||0)+1; S.ministros[fx.min] = gerarMinistro(fx.min,null); if(p) p.sat=clamp(p.sat-10,0,100);
      return `Novas provas surgem e ${m.nome} cai mesmo assim, duas semanas depois. O desgaste respinga no Planalto.`; }
    if (p) p.sat = clamp(p.sat+5,0,100); m.leal = clamp(m.leal+10,0,100); S.aprovShock -= 1.5;
    return `A investigação não avança. ${m.nome} fica no cargo, mais leal do que nunca.`;
  },
};

// ---------- Congresso ----------
function probVoto(p, proj, casa){
  let base;
  if (p.id===S.pres.partido) base = 0.92;
  else if (S.coalizao.includes(p.id)) base = 0.57 + (p.sat-50)/110;
  else base = 0.29 + (p.sat-30)/160;
  const w = (proj.we||0)+(proj.ws||0) || 1;
  const d = (Math.abs(proj.e - p.e)*(proj.we||0) + Math.abs(proj.s - p.s)*(proj.ws||0))/w;
  const align = 0.27 - d*0.045;
  const popEf = (proj.pop||0) * (S.aprov-32)/90 * (0.5 + p.fis*0.6);
  const art = (proj.artic||0)*0.045;
  const pc = casa==='camara'? (S.presCamara-50)/450 : (S.stf-50)/2000;
  return clamp(base + align + popEf + art + pc + (S.aprov-45)/350, 0.01, 0.985);
}

function votar(proj){
  const def = PROJETOS.find(x=>x.id===proj.id);
  const p2 = { ...def, artic:proj.artic };
  const res = { camara:[], senado:[] };
  let simC=0, naoC=0, simS=0, naoS=0;
  S.partidos.forEach(p=>{
    const pr = probVoto(p, p2, 'camara');
    const pres = Math.round(p.dep*rnd(0.88,0.97));
    let sim = Math.round(clamp(pres*pr + randn()*Math.sqrt(pres*pr*(1-pr)+0.01), 0, pres));
    res.camara.push({ id:p.id, cor:p.cor, sim, nao:pres-sim, aus:p.dep-pres });
    simC += sim; naoC += pres-sim;
    const prS = probVoto(p, p2, 'senado');
    const presS = Math.min(p.sen, Math.round(p.sen*rnd(0.9,1)));
    let simSen = Math.round(clamp(presS*prS + randn()*Math.sqrt(presS*prS*(1-prS)+0.01), 0, presS));
    res.senado.push({ id:p.id, cor:p.cor, sim:simSen, nao:presS-simSen, aus:p.sen-presS });
    simS += simSen; naoS += presS-simSen;
  });
  let okC, okS, regraC, regraS;
  if (def.tipo==='PEC'){ okC = simC>=308; okS = simS>=49; regraC='308 votos (3/5)'; regraS='49 votos (3/5)'; }
  else if (def.tipo==='PLP'){ okC = simC>=257; okS = simS>=41; regraC='257 votos (maioria absoluta)'; regraS='41 votos'; }
  else { okC = simC>naoC; okS = simS>naoS; regraC='maioria simples dos presentes'; regraS='maioria simples'; }
  if (!okC){ res.senado = null; okS = false; }
  return { ...res, simC, naoC, simS, naoS, okC, okS, aprovado: okC && okS, regraC, regraS, tipo:def.tipo, nome:def.nome, id:def.id };
}

function votacaoImpeachment(bonus){
  let contra = 0;
  S.partidos.forEach(p=>{
    let lealdade;
    if (p.id===S.pres.partido) lealdade = 0.95;
    else if (S.coalizao.includes(p.id)) lealdade = clamp((p.sat+15)/100 + (S.aprov-25)/100 + bonus, 0.05, 0.98);
    else lealdade = clamp(0.1 + (S.aprov-25)/150 + bonus*0.5, 0.01, 0.6);
    contra += Math.round(p.dep*(1-lealdade));
  });
  return contra;
}

function calcBase(){
  let c=0, s=0;
  S.partidos.forEach(p=>{
    let pr;
    if (p.id===S.pres.partido) pr = 0.95;
    else if (S.coalizao.includes(p.id)) pr = clamp((p.sat+22)/100, 0, 0.97);
    else pr = clamp((p.sat-35)/150, 0, 0.3);
    c += p.dep*pr; s += p.sen*pr;
  });
  S.baseCamara = Math.round(c); S.baseSenado = Math.round(s);
}

function partilha(){
  const tot = {}; let W = 0;
  MINISTERIOS.forEach(m=>{ W += m.peso; const mi = S.ministros[m.id]; if (mi && mi.partido) tot[mi.partido] = (tot[mi.partido]||0) + m.peso; });
  return { tot, W };
}

function atualizarPartidos(inicial){
  const { tot, W } = partilha();
  const aliados = S.partidos.filter(p=>S.coalizao.includes(p.id) && p.id!==S.pres.partido);
  const depAli = aliados.reduce((a,p)=>a+p.dep,0) || 1;
  S.partidos.forEach(p=>{
    let alvo;
    const d = dist(p, S.pres);
    if (p.id===S.pres.partido) alvo = 80 + (S.aprov-45)*0.2;
    else if (S.coalizao.includes(p.id)){
      const esperado = p.dep/depAli*0.7;
      const tem = (tot[p.id]||0)/W;
      const cargo = clamp((tem-esperado)*130, -25, 22);
      alvo = 52 + cargo + S.emendasBuff*p.fis + (S.aprov-45)*0.35 - d*1.5*(1-p.fis*0.6) + (S.presCamara-50)*0.05;
    } else {
      alvo = 30 + (S.aprov-45)*0.25 - d*1.2*(1-p.fis*0.5) + S.emendasBuff*p.fis*0.3;
    }
    p.alvo = clamp(alvo, 0, 100);
    if (!inicial) p.sat = clamp(p.sat + (p.alvo - p.sat)*0.12, 0, 100);
  });
}

// ---------- tramitação ----------
function propor(id, comoMP){
  const def = PROJETOS.find(p=>p.id===id);
  const proj = { id, tIni:S.t, restante: comoMP? 4 : def.tram, artic:0, mp:!!comoMP };
  S.projetos.push(proj);
  S.ap -= 1;
  if (comoMP){
    proj.efeitos = applyFx(def.fx);
    S.presCamara = clamp(S.presCamara-3,0,100); S.grp.judiciario = clamp(S.grp.judiciario-1,0,100);
    logar('Congresso', `Medida Provisória editada: ${def.nome}. Vigência imediata; o Congresso tem 120 dias para votar.`);
  } else {
    logar('Congresso', `Governo envia ao Congresso: ${def.nome} (${def.tipo}).`);
  }
}

function processarTramitacao(){
  for (const proj of S.projetos.slice()){
    proj.restante--;
    if (proj.restante>0) continue;
    const r = votar(proj);
    const def = PROJETOS.find(p=>p.id===proj.id);
    S.projetos = S.projetos.filter(p=>p!==proj);
    r.mp = proj.mp;
    if (r.aprovado){
      S.aprovadas.push(def.id);
      r.efeitos = proj.mp ? [{ txt:'A MP é convertida em lei. Os efeitos já em vigor se tornam permanentes.', livre:true }] : applyFx(def.fx);
      logar('Congresso', `APROVADO: ${def.nome}. Câmara ${r.simC} a ${r.naoC}; Senado ${r.simS} a ${r.naoS}.`);
    } else {
      S.rejeitadas[def.id] = S.t;
      S.aprovShock -= def.tipo==='PEC'? 1.5 : 1;
      P(S.pres.partido).sat -= 1;
      if (proj.mp){ S.flags.mpCaiu = true; applyFx(inverterFx(def.fx)); S.presCamara = clamp(S.presCamara-4,0,100); }
      r.efeitos = [{ txt: proj.mp ? 'A MP perde a validade. Os efeitos fiscais e estruturais são revertidos.' : 'Derrota do governo no plenário. O projeto só poderá ser reapresentado em 6 meses.', livre:true }];
      logar('Congresso', `REJEITADO: ${def.nome}. ${r.okC? 'Passou na Câmara, caiu no Senado.' : `Câmara: ${r.simC} sim, ${r.naoC} não.`}`);
    }
    S.pendentes.push({ tipo:'voto', voto:r });
  }
}

// ---------- simulação mensal ----------
function simularEconomia(){
  const e = S.eco;
  const m = S.t%12;
  e.global += -e.global*0.1 + rnd(-0.18,0.18)*(S.dificuldade==='dificil'?1.4:1);
  const primEf = e.primStruct + (e.pib-2)*0.12 + e.primTemp;
  e.primario = primEf;
  const juroReal = e.selic - e.expInfl;
  const premio = Math.max(0, e.divida-85)*0.06 + Math.max(0, 35-e.conf)*0.02;
  const monet = -(juroReal-5.2)*0.22 - premio;
  const fiscal = -primEf*0.35;
  const conf = (e.conf-50)*0.02;
  let comercio = 0; PAISES.forEach(c=>comercio += (S.rel[c.id]-50)*c.comercio*0.05);
  const pot = e.potencial + compMin('fazenda')*0.15 + (S.soc.infra-45)*0.012 + compMin('mdic')*0.08 + compMin('agricultura')*0.06;
  const alvo = pot + monet + fiscal + conf + comercio + e.global + e.pibShock;
  e.pib += (alvo - e.pib)*0.22;
  e.pibShock *= 0.8;
  e.pib = clamp(e.pib, -6, 8);
  const gap = e.pib - pot;
  // inflação
  const d12 = e.dolar12.length? e.dolar12[0] : e.dolar;
  const passThrough = ((e.dolar/d12)-1)*100*0.07;
  const alvoInf = e.expInfl + gap*0.35 + passThrough + e.inflShock;
  e.ipca += (alvoInf - e.ipca)*0.16;
  e.inflShock *= 0.85;
  e.ipca = clamp(e.ipca, -1, 25);
  const ancora = 3 + (1-e.bcHawk)*3 + Math.max(0, e.divida-85)*0.06 + Math.max(0, 35-e.conf)*0.04;
  e.expInfl += (0.45*e.ipca + 0.55*ancora - e.expInfl)*0.1;
  // Copom
  if (COPOM.includes(m)){
    const taylor = 4.8 + e.expInfl + 1.5*(e.ipca-3)*e.bcHawk + 0.5*gap;
    let passo = clamp((taylor - e.selic)*0.45, -0.75, 0.75);
    passo = Math.round(passo*4)/4;
    if (passo!==0){
      e.selic = clamp(e.selic + passo, 2, 22);
      logar('Economia', `Copom ${passo>0?'eleva':'corta'} a Selic em ${fmt(Math.abs(passo)*100,0)} pontos-base, para ${fmt(e.selic,2)}% ao ano.`);
    } else logar('Economia', `Copom mantém a Selic em ${fmt(e.selic,2)}% ao ano.`);
  }
  // desemprego
  const alvoDes = 6.8 - (e.pib-1)*1.1;
  e.desemp += (alvoDes - e.desemp)*0.06 + randn()*0.03;
  e.desemp = clamp(e.desemp, 3, 18);
  // confiança e câmbio
  const alvoConf = 50 + (e.primario - e.meta)*22 + (82-e.divida)*1.4 + (S.grp.mercado-50)*0.4 + compMin('fazenda')*10 - (e.ipca-4)*3 + (e.bcHawk-1)*15;
  e.conf += (clamp(alvoConf,0,100) - e.conf)*0.12;
  const alvoDolar = 5.4*(1 + (50-e.conf)*0.004 + (e.divida-82)*0.005 - (e.selic-13)*0.015 + e.global*0.03 + (e.ipca-4.5)*0.01);
  e.dolar += (alvoDolar - e.dolar)*0.14 + randn()*0.04;
  e.dolar = clamp(e.dolar, 3, 12);
  e.dolar12.push(e.dolar); if (e.dolar12.length>12) e.dolar12.shift();
  // dívida
  const nom = e.pib + e.ipca;
  e.divida += e.divida*(e.selic*0.75 - nom)/1200 - primEf/12;
  e.divida = clamp(e.divida, 30, 160);
  // drift fiscal: despesas obrigatórias crescem
  e.primStruct -= 0.004;
  e.primTemp *= 0.92;
  if (m===2) logar('Economia', `IBGE divulga o PIB de ${2026+Math.floor(S.t/12)}: crescimento de ${fmt(e.pib)}%.`);
}

function simularSociedade(){
  const s = S.soc, e = S.eco, md = S.mods;
  s.pobreza *= 1 + (md.pobreza + (e.desemp-6)*0.02 + (e.ipca-4.5)*0.01 - compMin('social')*0.03)/12;
  s.pobreza = clamp(s.pobreza, 3, 60);
  s.homic *= 1 + (md.homic - compMin('justica')*0.04 + (e.desemp-6)*0.006 - 0.012)/12;
  s.homic = clamp(s.homic, 5, 50);
  s.desmat *= 1 + (md.desmat - compMin('ambiente')*0.10 + (S.grp.agro-50)*0.0012 + S.pres.e*0.006 + (S.grp.ambientalistas-50)*-0.001)/12;
  s.desmat = clamp(s.desmat, 300, 25000);
  s.educ += (md.educ*30 + compMin('educacao')*1.6 + (50-s.educ)*0.03)/12;
  s.saude += (md.saude*30 + compMin('saude')*1.6 + (52-s.saude)*0.03 - Math.max(0,-e.primario-1)*0.5)/12;
  s.infra += (md.infra*30 + compMin('transportes')*1.6 + compMin('cidades')*0.6 + (45-s.infra)*0.02)/12;
  ['educ','saude','infra'].forEach(k=>s[k]=clamp(s[k],0,100));
}

function simularAprovacao(){
  const e=S.eco, s=S.soc;
  const lua = Math.max(0, 6 - S.t)*0.8;
  let fund = 42 + (6.5-e.desemp)*2.2 + (4.5-e.ipca)*2.6 + (e.pib-2)*1.4 + (s.saude-55)*0.3 + (s.educ-52)*0.15
    + (20.8-s.homic)*0.45 + (23-s.pobreza)*0.4 + (S.grp.imprensa-50)*0.08 + (S.grp.evangelicos-45)*0.04 + (5.6-e.dolar)*1.2 + Math.min(0,e.conf-30)*0.08 + lua;
  if (S.dificuldade==='facil') fund += 3;
  if (S.dificuldade==='dificil') fund -= 3;
  if (S.cpi>0){ S.cpi--; S.aprovShock -= 0.6; }
  if (S.t>=36) fund -= 1.5; // desgaste do fim de mandato
  const alvo = clamp(fund + S.aprovShock, 4, 92);
  S.aprov += (alvo - S.aprov)*0.55;
  S.aprovShock *= 0.88;
  S.pronCount *= 0.7;
  S.emendasBuff *= 0.75;
  for (const r in S.reg) S.reg[r] *= 0.97;
  for (const u in S.uf) S.uf[u] *= 0.96;
  S.uf[S.pres.uf] = Math.max(S.uf[S.pres.uf], 5);
}

function aprovRegiao(r){
  const e = S.pres.e;
  const lean = { N:e*0.4, NE:-e*1.4, CO:e*1.0, SE:e*0.3, S:e*1.1 }[r];
  return clamp(S.aprov + lean + S.reg[r], 2, 98);
}
function aprovUF(uf){
  const est = ESTADOS.find(x=>x.uf===uf);
  return clamp(aprovRegiao(est.reg) + (S.uf[uf]||0), 2, 98);
}

function simularGrupos(){
  const L = leanGrupos();
  GRUPOS.forEach(g=>{
    let alvo = g.ini + L[g.id]*0.6;
    if (g.id==='mercado') alvo += (S.eco.conf-50)*0.5;
    if (g.id==='sindicatos') alvo += (6.5-S.eco.desemp)*2;
    if (g.id==='comercio') alvo += (S.eco.pib-2)*3;
    if (g.id==='industria') alvo += (S.eco.pib-2)*2 - (S.eco.selic-11)*1;
    if (g.id==='agro') alvo += compMin('agricultura')*6;
    if (g.id==='militares') alvo += compMin('defesa')*6;
    if (g.id==='ambientalistas') alvo += (5800-S.soc.desmat)/200 + compMin('ambiente')*5;
    if (g.id==='governadores') alvo += (S.aprov-45)*0.3;
    S.grp[g.id] = clamp(S.grp[g.id] + (alvo - S.grp[g.id])*0.025, 0, 100);
  });
  PAISES.forEach(c=>{
    let alvo = c.ini;
    if (c.id==='EUA') alvo += S.pres.e*1.5;
    if (c.id==='Venezuela') alvo -= S.pres.e*1.5;
    if (c.id==='Argentina') alvo += S.pres.e*1.2;
    S.rel[c.id] = clamp(S.rel[c.id] + (alvo - S.rel[c.id])*0.015, 0, 100);
  });
}

function registrarHist(){
  const h = S.hist, e=S.eco;
  h.aprov.push(+S.aprov.toFixed(1)); h.pib.push(+e.pib.toFixed(2)); h.ipca.push(+e.ipca.toFixed(2));
  h.selic.push(e.selic); h.desemp.push(+e.desemp.toFixed(2)); h.dolar.push(+e.dolar.toFixed(2));
  h.divida.push(+e.divida.toFixed(1)); h.primario.push(+(e.primario??e.primStruct).toFixed(2)); h.base.push(S.baseCamara); h.conf.push(+e.conf.toFixed(1));
}

// ---------- eventos ----------
function getEvento(ref){
  if (ref.tipo==='voto') return null;
  const id = ref.id;
  if (id.startsWith('escandalo:')) return eventoEscandalo(id.split(':')[1], ref);
  if (id.startsWith('saida:')) return eventoSaida(id.split(':')[1]);
  if (id.startsWith('adesao:')) return eventoAdesao(id.split(':')[1]);
  if (id==='impeachment') return eventoImpeachment();
  return EVENTOS_AGENDADOS.find(e=>e.id===id) || EVENTOS_ALEATORIOS.find(e=>e.id===id) || eventosAnuais(ref.t).find(e=>e.id===id);
}

function eventoEscandalo(minId){
  const m = S.ministros[minId], mi = MIN(minId);
  const casos = ['contratos superfaturados na pasta','uso de jatinho de empresário em viagem particular','emendas direcionadas a ONG de parentes','mensagens com lobista investigado pela PF','compra de imóvel incompatível com a renda'];
  const caso = S.flags['_caso'+minId] || (S.flags['_caso'+minId] = pick(casos));
  return { id:'escandalo:'+minId, cat:'Escândalo', titulo:`Denúncia contra ${m? (m.gen==='f'?'a ministra':'o ministro'):'ministro'} de ${mi.nome}`,
    texto:`Reportagem revela suspeitas de ${caso} envolvendo ${m?m.nome:'o titular'}${m&&m.partido?` (${m.partido})`:''}. A oposição pede a cabeça e fala em CPI.`,
    opcoes:[
      { txt:'Exonerar imediatamente', fx:{ custom:'escandalo', min:minId, modo:'demite' } },
      { txt:'Afastar até o fim das investigações', fx:{ custom:'escandalo', min:minId, modo:'afasta' } },
      { txt:'Manter e defender publicamente', fx:{ custom:'escandalo', min:minId, modo:'defende' } },
    ]};
}
function eventoSaida(pid){
  const p = P(pid);
  return { id:'saida:'+pid, cat:'Congresso', titulo:`${pid} ameaça deixar a base`,
    texto:`Insatisfeita com espaço no governo e com a condução política, a bancada do ${p.nome} (${p.dep} deputados, ${p.sen} senadores) aprova indicativo de saída da base.`,
    opcoes:[
      { txt:'Oferecer mais espaço no governo', fx:{ custom:'saidaPartido', p:pid, modo:'cede' } },
      { txt:'Liberar emendas para a bancada', fx:{ custom:'saidaPartido', p:pid, modo:'emendas' } },
      { txt:'Deixar o partido sair', fx:{ custom:'saidaPartido', p:pid, modo:'sai' } },
    ]};
}
function eventoAdesao(pid){
  const p = P(pid);
  return { id:'adesao:'+pid, cat:'Congresso', titulo:`${pid} sinaliza adesão ao governo`,
    texto:`Com o governo bem avaliado, a cúpula do ${p.nome} (${p.dep} deputados) procura o Planalto e se oferece para integrar a base em troca de espaço.`,
    opcoes:[
      { txt:'Aceitar o partido na base', fx:{ custom:'adesao', p:pid, modo:'aceita' } },
      { txt:'Recusar', fx:{ custom:'adesao', p:pid, modo:'recusa' } },
    ]};
}
function eventoImpeachment(){
  return { id:'impeachment', cat:'Crise', titulo:'Processo de impeachment vai a votação',
    texto:`O presidente da Câmara aceita a denúncia por crime de responsabilidade. Com aprovação de ${fmt(S.aprov,0)}% e uma base fiel de cerca de ${S.baseCamara} deputados, o plenário vai decidir se autoriza o processo. São necessários 342 votos.`,
    opcoes:[
      { txt:'Abrir o cofre: emendas e cargos para garantir 172 votos', fx:{ custom:'impeachmentLuta', modo:'emendas' } },
      { txt:'Mobilizar as ruas e a militância', fx:{ custom:'impeachmentLuta', modo:'rua' } },
      { txt:'Confiar na base e esperar o voto', fx:{ custom:'impeachmentLuta', modo:'nada' } },
      { txt:'Renunciar', fx:{ custom:'impeachmentLuta', modo:'renuncia' } },
    ]};
}

function enfileirarEventos(){
  const t = S.t;
  const fila = [];
  EVENTOS_AGENDADOS.filter(e=>e.t===t).forEach(e=>fila.push(e));
  eventosAnuais(t).forEach(e=>fila.push(e));
  // aleatórios
  const elegiveis = EVENTOS_ALEATORIOS.filter(e=>{
    if (e.unico && S.usados[e.id]) return false;
    if (e.cooldown && S.cooldowns[e.id]!=null && t - S.cooldowns[e.id] < e.cooldown) return false;
    if (e.cond && !e.cond(S)) return false;
    return true;
  });
  const nAleat = t===0? 0 : (Math.random()<0.25? 2 : Math.random()<0.75? 1 : 0) + (S.dificuldade==='dificil' && Math.random()<0.3 ? 1 : 0);
  const pool = elegiveis.slice();
  for (let i=0;i<nAleat && pool.length;i++){
    const tot = pool.reduce((a,e)=>a+(e.peso||1),0);
    let r = Math.random()*tot, esc = pool[0];
    for (const e of pool){ r -= (e.peso||1); if (r<=0){ esc=e; break; } }
    pool.splice(pool.indexOf(esc),1);
    fila.push(esc);
  }
  fila.forEach(e=>{
    if (e.pre) e.pre(S);
    S.usados[e.id] = true; S.cooldowns[e.id] = t;
    S.pendentes.push({ id:e.id, t });
  });
  // escândalos de ministros
  const bg = BACKGROUNDS.find(b=>b.id===S.pres.bg);
  const fatorBg = bg && bg.fx.bonus && bg.fx.bonus.escandalo ? 1+bg.fx.bonus.escandalo : 1;
  if (t>1) for (const id in S.ministros){
    const m = S.ministros[id];
    if (S.cooldowns['esc'+id]!=null && t - S.cooldowns['esc'+id] < 8) continue;
    if (Math.random() < (100-m.integ)/100*0.016*fatorBg){
      S.cooldowns['esc'+id] = t; delete S.flags['_caso'+id];
      S.pendentes.push({ id:'escandalo:'+id, t }); break;
    }
  }
  // partidos insatisfeitos / interessados
  S.partidos.forEach(p=>{
    if (p.id===S.pres.partido) return;
    const cd = S.cooldowns['p'+p.id];
    if (cd!=null && t-cd<6) return;
    if (S.coalizao.includes(p.id) && p.sat<24 && p.dep>=5){ S.cooldowns['p'+p.id]=t; S.pendentes.push({ id:'saida:'+p.id, t }); }
    else if (!S.coalizao.includes(p.id) && p.sat>62 && p.dep>=5){ S.cooldowns['p'+p.id]=t; S.pendentes.push({ id:'adesao:'+p.id, t }); }
  });
  // impeachment
  if (S.aprov<22 && S.baseCamara<172 && (S.flags.impeachRisk||0)>0 && Math.random()<0.4 && t<44){
    S.pendentes.push({ id:'impeachment', t });
  }
}

// ---------- eleição ----------
function eleicao(){
  const prom = S.promessas.filter(id=>PROMESSAS.find(p=>p.id===id).chk(S)).length;
  let votos = 50 + (S.aprov-45)*0.85 + (S.flags.camp||0) + (S.baseCamara-257)*0.012 + prom*0.6 + randn()*2.5;
  if (S.flags.desistiu) votos -= 4;
  if (S.flags.forcaMunicipal) votos += S.flags.forcaMunicipal*0.15;
  votos = clamp(votos, 15, 80);
  const primeiro = clamp(votos - rnd(2,6), 10, 75);
  const vence = votos>50;
  return { votos:+votos.toFixed(2), primeiro:+primeiro.toFixed(2), vence, candidato: S.flags.desistiu? `o candidato do ${S.pres.partido}` : S.pres.nome, prom };
}

// ---------- fim de turno ----------
function encerrarMes(){
  if (S.pendentes.length || S.fim) return;
  simularEconomia();
  simularSociedade();
  atualizarPartidos();
  simularAprovacao();
  simularGrupos();
  calcBase();
  processarTramitacao();
  // janela partidária (março de 2030)
  if (S.t===38){
    const f = (S.flags.forcaMunicipal||0) + (S.aprov-45)*0.3;
    const n = Math.round(clamp(f,-12,15));
    const own = P(S.pres.partido);
    const doadores = S.partidos.filter(p=>p.id!==own.id && p.dep>6).sort((a,b)=>b.dep-a.dep);
    if (n>0){ for(let i=0;i<n;i++){ const d=doadores[i%doadores.length]; d.dep--; own.dep++; } logar('Congresso', `Janela partidária: ${n} deputados migram para o ${own.id}.`); }
    else if (n<0){ for(let i=0;i<-n && own.dep>1;i++){ const d=doadores[i%doadores.length]; d.dep++; own.dep--; } logar('Congresso', `Janela partidária: ${-n} deputados deixam o ${own.id}.`); }
  }
  // eleição em outubro de 2030
  if (S.t===45){
    const r = eleicao();
    S.flags.eleicao = r;
    logar('Eleições', r.vence ? `${r.candidato} vence o segundo turno com ${fmt(r.votos)}% dos votos válidos.` : `${r.candidato} perde a eleição: ${fmt(r.votos)}% dos votos válidos no segundo turno.`);
    S.pendentes.push({ tipo:'eleicao', r });
  }
  registrarHist();
  checarCarimbos();
  const mesFechado = S.t;
  S.t++;
  if (S.t>=TOTAL_TURNOS){ S.fim = { tipo:'mandato' }; salvar(); return; }
  S.ap = apMax();
  // manchetes mensais
  if (S.t%3===0) logar('Economia', `PNAD: desemprego em ${fmt(S.eco.desemp)}%. IPCA em 12 meses: ${fmt(S.eco.ipca)}%.`);
  enfileirarEventos();
  S.pendentes.unshift({ tipo:'resumo', mes:mesFechado });
  salvar();
}

function checarCarimbos(){
  S.carimbos = S.carimbos || [];
  CARIMBOS.forEach(c=>{ if (!S.carimbos.includes(c.id) && c.chk(S)){ S.carimbos.push(c.id); (S.novosCarimbos = S.novosCarimbos||[]).push(c.id); logar('Carimbo', `Carimbo conquistado: ${c.nome}.`); } });
}

// ---------- ações do presidente ----------
const ACOES_FX = {
  pronunciamento(){
    const g = Math.max(0.3, 3 - S.pronCount*1.1);
    S.pronCount += 1; S.aprovShock += g;
    logar('Agenda', 'Pronunciamento em cadeia nacional de rádio e TV.');
    return `Aprovação +${fmt(g)} pts (efeito menor a cada repetição).`;
  },
  visitaestado(uf){
    const e = ESTADOS.find(x=>x.uf===uf);
    S.uf[uf] = (S.uf[uf]||0) + 5; S.reg[e.reg] += 1.5; S.aprovShock += 0.4; S.grp.governadores = clamp(S.grp.governadores+1.5,0,100);
    logar('Agenda', `Presidente visita ${e.nome} e inaugura obras.`);
    return `${e.nome}: +5 pts; ${REGIOES[e.reg]}: +1,5 pts.`;
  },
  reuniaogrupo(g){
    const opostos = { mercado:'movsociais', movsociais:'mercado', agro:'ambientalistas', ambientalistas:'agro', sindicatos:'industria', industria:'sindicatos', evangelicos:'movsociais', militares:'movsociais' };
    const ganho = rint(4,8);
    S.grp[g] = clamp(S.grp[g]+ganho,0,100);
    if (opostos[g]) S.grp[opostos[g]] = clamp(S.grp[opostos[g]]-2,0,100);
    const nome = GRUPOS.find(x=>x.id===g).nome;
    logar('Agenda', `Reunião no Planalto com ${nome}.`);
    return `${nome}: +${ganho}.${opostos[g]?` ${GRUPOS.find(x=>x.id===opostos[g]).nome}: −2.`:''}`;
  },
  viagem(c){
    const pais = PAISES.find(x=>x.id===c);
    const ganho = Math.round(rint(6,11)*(1+compMin('itamaraty')*0.3));
    S.rel[c] = clamp(S.rel[c]+ganho,0,100);
    const rivais = { EUA:['China','Russia','Venezuela'], China:['EUA'], Russia:['EUA','UE'], Venezuela:['EUA'] }[c]||[];
    rivais.forEach(r=>S.rel[r]=clamp(S.rel[r]-2,0,100));
    let txt = `${pais.nome}: +${ganho}.`;
    if (Math.random() < 0.3 + (S.rel[c]-50)/200){
      S.eco.pibShock += 0.12 + pais.comercio; S.eco.potencial += 0.01 + pais.comercio*0.05;
      txt += ' Acordo comercial e de investimentos assinado!';
      logar('Internacional', `Visita de Estado a ${pais.nome} termina com acordo de comércio e investimentos.`);
    } else logar('Internacional', `Visita de Estado a ${pais.nome}.`);
    if (rivais.length) txt += ` Rivais geopolíticos: −2.`;
    return txt;
  },
  emendas(){
    S.emendasBuff += 6; S.eco.primTemp -= 0.03;
    S.partidos.filter(p=>S.coalizao.includes(p.id)).forEach(p=>p.sat = clamp(p.sat + 3*p.fis + 1,0,100));
    logar('Congresso', 'Governo libera R$ 3 bilhões em emendas parlamentares.');
    return 'Base mais satisfeita. Gasto extra de 0,03% do PIB.';
  },
  cafepartido(pid){
    const p = P(pid);
    if (S.coalizao.includes(pid)){
      p.sat = clamp(p.sat+rint(5,9),0,100);
      logar('Congresso', `Jantar no Alvorada com a cúpula do ${pid}.`);
      return `${pid} mais satisfeito com o governo.`;
    }
    const chance = clamp(0.45 - dist(p,S.pres)*0.035 + (S.aprov-45)*0.012 + p.fis*0.3 + (p.sat-30)*0.01, 0.03, 0.9);
    if (Math.random()<chance){
      S.coalizao.push(pid); p.sat = 52; calcBase();
      logar('Congresso', `${pid} anuncia adesão à base do governo.`);
      return `O ${pid} aceita entrar na base! Dê ao partido um ministério para consolidar o apoio.`;
    }
    p.sat = clamp(p.sat+3,0,100);
    logar('Congresso', `${pid} recusa convite para integrar o governo.`);
    return `O ${pid} recusa por ora (chance era de ${Math.round(chance*100)}%), mas a relação melhora um pouco.`;
  },
  entrevista(){
    S.grp.imprensa = clamp(S.grp.imprensa+5,0,100);
    if (Math.random()<0.22){ S.aprovShock -= 2; logar('Agenda','Gafe em entrevista coletiva repercute nas redes.'); return 'Imprensa +5, mas uma gafe vira meme: aprovação −2.'; }
    S.aprovShock += 0.5; logar('Agenda','Entrevista coletiva no Palácio do Planalto.');
    return 'Imprensa +5. Aprovação +0,5.';
  },
};

function trocarMinistro(minId, novo){
  const antigo = S.ministros[minId];
  if (antigo && antigo.partido && antigo.partido!==novo.partido){ const p=P(antigo.partido); if (p) p.sat = clamp(p.sat-8,0,100); }
  novo.desde = S.t;
  S.ministros[minId] = novo;
  if (novo.partido){ const p=P(novo.partido); if (p) p.sat = clamp(p.sat+6,0,100); }
  S.ap -= 1;
  logar('Governo', `${novo.nome} (${novo.partido||'técnic'+(novo.gen==='f'?'a':'o')}) assume o Ministério de ${MIN(minId).nome}${antigo?` no lugar de ${antigo.nome}`:''}.`);
}

function romperPartido(pid){
  S.coalizao = S.coalizao.filter(x=>x!==pid);
  const p = P(pid); p.sat = clamp(p.sat-20,0,100);
  for (const id in S.ministros) if (S.ministros[id].partido===pid) S.ministros[id] = gerarMinistro(id, null);
  calcBase();
  logar('Congresso', `Governo rompe com o ${pid}. Ministros do partido são substituídos por técnicos.`);
}

// ---------- salvar ----------
function salvar(){ try{ localStorage.setItem(SAVE_KEY, JSON.stringify(S)); }catch(e){} }
function carregar(){ try{ const j = localStorage.getItem(SAVE_KEY); if (j){ S = JSON.parse(j); return true; } }catch(e){} return false; }
function temSave(){ try{ return !!localStorage.getItem(SAVE_KEY); }catch(e){ return false; } }
function apagarSave(){ try{ localStorage.removeItem(SAVE_KEY); }catch(e){} }
