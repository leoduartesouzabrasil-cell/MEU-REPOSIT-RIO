// =====================================================================
// PLANALTO 2027 — interface
// =====================================================================

const app = document.getElementById('app');
const modal = document.getElementById('modal');
const modalCard = document.getElementById('modal-card');
let SETUP_PARTIDO = null;
let tela = 'inicio';
let aba = 'painel';
let modalMin = false;       // decisões pendentes minimizadas
let eventoResultado = null; // resultado exibido após escolha
let tmpCandidatos = null;
let SET = null;

const esc = s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const cls = (v,bom,ruim,inverso)=>{ if (inverso) return v<=bom?'ok':v>=ruim?'bad':'warn'; return v>=bom?'ok':v<=ruim?'bad':'warn'; };

// ---------- componentes gráficos ----------
function spark(vals, o={}){
  const W=300, H=o.h||70; const v = vals.length? vals : [0];
  let mn = Math.min(...v, o.ref??Infinity), mx = Math.max(...v, o.ref??-Infinity);
  if (o.min!=null) mn = Math.min(mn,o.min); if (o.max!=null) mx = Math.max(mx,o.max);
  if (mx-mn<1e-6){ mx+=1; mn-=1; }
  const pad = (mx-mn)*0.12; mn-=pad; mx+=pad;
  const n = Math.max(v.length-1,1);
  const X = i=>i/n*W, Y = y=>H-(y-mn)/(mx-mn)*H;
  const pts = v.map((y,i)=>`${X(i).toFixed(1)},${Y(y).toFixed(1)}`).join(' ');
  const area = `0,${H} ${pts} ${X(v.length-1).toFixed(1)},${H}`;
  const ref = o.ref!=null? `<line x1="0" x2="${W}" y1="${Y(o.ref)}" y2="${Y(o.ref)}" class="sp-ref" vector-effect="non-scaling-stroke"/>` : '';
  const grid = [0.25,0.5,0.75].map(f=>`<line x1="0" x2="${W}" y1="${H*f}" y2="${H*f}" class="sp-grid" vector-effect="non-scaling-stroke"/>`).join('');
  const last = v.length-1;
  return `<svg class="spark ${o.cls||''}" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true">${grid}${ref}<polygon points="${area}" class="sp-area"/><polyline points="${pts}" class="sp-line" vector-effect="non-scaling-stroke"/><circle cx="${X(last)}" cy="${Y(v[last])}" r="3.2" class="sp-dot" vector-effect="non-scaling-stroke"/></svg>`;
}

function hemiciclo(cores, linhas, opts={}){
  const n = cores.length, W=240, H=128, cx=W/2, cy=H-6, R=112, r0=R*0.42;
  const radii = Array.from({length:linhas},(_,i)=>r0+(R-r0)*i/(linhas-1||1));
  const somaR = radii.reduce((a,b)=>a+b,0);
  let porLinha = radii.map(r=>Math.round(n*r/somaR));
  let dif = n - porLinha.reduce((a,b)=>a+b,0); porLinha[linhas-1]+=dif;
  const pos = [];
  radii.forEach((r,i)=>{ const k=porLinha[i]; for(let j=0;j<k;j++){ const a = Math.PI - Math.PI*(k===1?0.5:j/(k-1)); pos.push({x:cx+r*Math.cos(a), y:cy-r*Math.sin(a), a}); } });
  pos.sort((a,b)=>b.a-a.a);
  const dr = opts.dot || Math.max(1.6, Math.min(5.2, (R-r0)/linhas*0.42));
  const dots = pos.map((p,i)=>`<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${dr}" fill="${cores[i]||'#888'}"/>`).join('');
  return `<svg class="hemi" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(opts.label||'Plenário')}">${dots}${opts.centro?`<text x="${cx}" y="${cy-8}" text-anchor="middle" class="hemi-num">${opts.centro}</text>`:''}${opts.sub?`<text x="${cx}" y="${cy+2}" text-anchor="middle" class="hemi-sub">${opts.sub}</text>`:''}</svg>`;
}

function barra(v, max=100, tom){ const t = tom || (v>=60?'ok':v<35?'bad':'warn'); return `<span class="bar"><span class="bar-f ${t}" style="width:${clamp(v/max*100,0,100)}%"></span></span>`; }

function chips(efs){
  if (!efs || !efs.length) return '';
  return `<ul class="fx">${efs.map(e=>{
    if (e.livre || e.txt) return `<li class="fx-txt">${esc(e.txt)}</li>`;
    const ruimSeSobe = ['Inflação','Dólar','Gasto extra','Desemprego','Tendência da pobreza','Tendência de homicídios','Tendência do desmatamento'].includes(e.lbl);
    let bom = e.v>0; if (ruimSeSobe) bom = !bom; if (e.lbl==='Gasto extra') bom = false;
    const val = (Math.abs(e.v)<1 && e.v!==0)? fmt(e.v,2) : fmt(e.v, Number.isInteger(e.v)?0:1);
    return `<li class="${bom?'pos':'neg'}">${esc(e.lbl)} <b>${e.v>0?'+':''}${val}${e.suf||''}</b></li>`;
  }).join('')}</ul>`;
}

// ---------- tela inicial ----------
function renderInicio(){
  app.innerHTML = `
  <section class="capa">
    <div class="capa-in">
      <p class="eyebrow">Simulador de governo · mandato 2027–2030</p>
      <h1 class="capa-t">PLANALTO<span>2027</span></h1>
      <p class="capa-sub">Você foi eleito presidente da República Federativa do Brasil. São 48 meses para governar com um Congresso fragmentado, uma economia de juros altos, 27 governadores, 12 grupos de pressão e um mundo em disputa entre Washington e Pequim.</p>
      <div class="capa-acoes">
        <button class="btn prim" data-a="novo">Iniciar mandato</button>
        ${temSave()? `<button class="btn" data-a="continuar">Continuar governo salvo</button>`:''}
      </div>
      <dl class="capa-dados">
        <div><dt>Câmara</dt><dd>513 deputados · 19 partidos</dd></div>
        <div><dt>Senado</dt><dd>81 senadores</dd></div>
        <div><dt>Selic inicial</dt><dd>13,25% a.a.</dd></div>
        <div><dt>Dívida bruta</dt><dd>82,4% do PIB</dd></div>
      </dl>
      <p class="fonte">Bancadas eleitas em outubro de 2026 (PL 121, PT 70, União 46, PSD 43, PP 41, Republicanos 41; demais estimadas). Indicadores iniciais com base no Boletim Focus, IBGE e Banco Central. Ministros e demais personagens são fictícios.</p>
    </div>
  </section>`;
}

// ---------- configuração ----------
function novoSetup(){
  SET = { passo:0, pres:{ nome:'', idade:56, uf:'MG', bg:'economista', e:0, s:0 }, modo:'existente', partido:'PSD',
    novo:{ nome:'Partido da Renovação Nacional', sigla:'PRN', cor:'#7A3E9D' }, coalizao:[], vice:null, viceOps:[], cands:{}, esc:{}, promessas:[], dificuldade:'normal', ok:'' };
  const pp = PARTIDOS.find(p=>p.id===SET.partido); SET.pres.e = pp.e; SET.pres.s = pp.s;
}
function partidoSetup(){ return SET.modo==='novo'? SET.novo.sigla.trim()||'NOVO' : SET.partido; }
function aceitacao(p){
  const d = Math.hypot(p.e-SET.pres.e, p.s-SET.pres.s);
  const sc = 1 - d/12 + p.fis*0.5;
  return sc>=0.62? 'aceita' : sc>=0.3? 'exige' : 'recusa';
}
function partidosSetup(){
  const lista = PARTIDOS.map(p=>({...p}));
  if (SET.modo==='novo') lista.push({ id:partidoSetup(), nome:SET.novo.nome, cor:SET.novo.cor, dep:18, sen:2, e:SET.pres.e, s:SET.pres.s, fis:0.3, custom:true });
  return lista;
}

function renderSetup(){
  const passos = ['Identidade','Partido','Coalizão','Ministério','Compromissos'];
  const p = SET.passo;
  let corpo = '';
  if (p===0) corpo = setupIdentidade();
  if (p===1) corpo = setupPartido();
  if (p===2) corpo = setupCoalizao();
  if (p===3) corpo = setupMinisterios();
  if (p===4) corpo = setupPromessas();
  app.innerHTML = `
  <div class="setup">
    <header class="setup-h">
      <span class="marca">PLANALTO<b>2027</b></span>
      <ol class="passos">${passos.map((n,i)=>`<li class="${i===p?'at':i<p?'feito':''}"><span>${i+1}</span>${n}</li>`).join('')}</ol>
    </header>
    <main class="setup-m">${corpo}</main>
    <footer class="setup-f">
      ${p>0?`<button class="btn" data-a="voltar">Voltar</button>`:`<button class="btn" data-a="sair">Cancelar</button>`}
      <span class="setup-msg" role="status">${esc(SET.ok)}</span>
      <button class="btn prim" data-a="avancar">${p===4?'Tomar posse':'Avançar'}</button>
    </footer>
  </div>`;
}

function setupIdentidade(){
  return `<h2 class="sec-t">Quem governa o Brasil?</h2>
  <div class="form-grid">
    <label class="campo"><span>Nome de urna</span><input id="f-nome" value="${esc(SET.pres.nome)}" placeholder="Ex.: Helena Damasceno" maxlength="40"></label>
    <label class="campo"><span>Idade na posse</span><input id="f-idade" type="number" min="35" max="85" value="${SET.pres.idade}"></label>
    <label class="campo"><span>Estado de origem</span><select id="f-uf">${ESTADOS.slice().sort((a,b)=>a.nome.localeCompare(b.nome)).map(e=>`<option value="${e.uf}" ${e.uf===SET.pres.uf?'selected':''}>${e.nome}</option>`).join('')}</select></label>
  </div>
  <h3 class="sub-t">Trajetória antes da Presidência</h3>
  <div class="cards">${BACKGROUNDS.map(b=>`<button class="card-op ${SET.pres.bg===b.id?'sel':''}" data-a="bg" data-v="${b.id}"><b>${b.nome}</b><small>${b.desc}</small></button>`).join('')}</div>`;
}

function setupPartido(){
  const lista = PARTIDOS.slice().sort((a,b)=>b.dep-a.dep);
  return `<h2 class="sec-t">Seu partido</h2>
  <div class="seg"><button class="${SET.modo==='existente'?'sel':''}" data-a="modo" data-v="existente">Partido existente</button><button class="${SET.modo==='novo'?'sel':''}" data-a="modo" data-v="novo">Fundar um partido</button></div>
  ${SET.modo==='existente'? `<div class="lista-part">${lista.map(p=>`<button class="part ${SET.partido===p.id?'sel':''}" data-a="partido" data-v="${p.id}"><i style="background:${p.cor}"></i><b>${p.id}</b><small>${p.nome}</small><span class="mono">${p.dep} dep · ${p.sen} sen</span></button>`).join('')}</div>`
  : `<div class="form-grid">
      <label class="campo"><span>Nome do partido</span><input id="f-pnome" value="${esc(SET.novo.nome)}" maxlength="50"></label>
      <label class="campo"><span>Sigla</span><input id="f-psigla" value="${esc(SET.novo.sigla)}" maxlength="12"></label>
      <div class="campo"><span>Cor</span><div class="cores">${['#7A3E9D','#0B7A75','#C2410C','#1D4ED8','#BE185D','#4D7C0F','#334155','#B45309'].map(c=>`<button class="cor ${SET.novo.cor===c?'sel':''}" style="background:${c}" data-a="cor" data-v="${c}" aria-label="Cor ${c}"></button>`).join('')}</div></div>
    </div>
    <p class="nota">Um partido novo começa com cerca de 18 deputados e 2 senadores que migram de legendas próximas, 100% fiéis a você, mas sem a máquina dos grandes partidos.</p>`}
  <h3 class="sub-t">Sua posição política</h3>
  <div class="ideo">
    <label class="campo"><span>Economia: <b id="l-e">${rotE(SET.pres.e)}</b></span><input id="f-e" type="range" min="-10" max="10" step="0.5" value="${SET.pres.e}"><span class="escala"><i>Estado forte</i><i>Livre mercado</i></span></label>
    <label class="campo"><span>Costumes: <b id="l-s">${rotS(SET.pres.s)}</b></span><input id="f-s" type="range" min="-10" max="10" step="0.5" value="${SET.pres.s}"><span class="escala"><i>Progressista</i><i>Conservador</i></span></label>
  </div>`;
}
const rotE = v=> v<=-6?'Esquerda':v<=-2?'Centro-esquerda':v<2?'Centro':v<6?'Centro-direita':'Direita';
const rotS = v=> v<=-6?'Muito progressista':v<=-2?'Progressista':v<2?'Moderado':v<6?'Conservador':'Muito conservador';

function setupCoalizao(){
  const lista = partidosSetup();
  const own = partidoSetup();
  if (!SET.coalizao.includes(own)) SET.coalizao.unshift(own);
  const sel = lista.filter(p=>SET.coalizao.includes(p.id));
  const dep = sel.reduce((a,p)=>a+p.dep,0), sen = sel.reduce((a,p)=>a+p.sen,0);
  const vk = SET.coalizao.join(',');
  if (SET._vk!==vk || !SET.viceOps.length){ SET._vk = vk;
    const pool = SET.coalizao.filter(x=>x!==own); const ps = pool.length? pool : [own];
    SET.viceOps = [0,1,2].map(i=>({ ...gerarNome(), partido: ps[i%ps.length], cargo: pick(['ex-governador','senador','ex-ministro','empresário','ex-prefeito de capital']) }));
    SET.vice = SET.viceOps[0];
  }
  const ord = lista.slice().sort((a,b)=>a.e-b.e);
  const cores = []; ord.forEach(p=>{ const c = SET.coalizao.includes(p.id)? p.cor : 'var(--seat-off)'; for(let i=0;i<p.dep;i++) cores.push(c); });
  return `<h2 class="sec-t">Monte a coalizão de governo</h2>
  <p class="lead">O presidencialismo de coalizão exige maioria: 257 deputados aprovam projetos de lei complementar; 308 aprovam emendas constitucionais. Partidos distantes da sua posição recusam o convite.</p>
  <div class="coal">
    <div class="coal-plen">
      ${hemiciclo(cores, 9, { centro:dep, sub:'deputados na base', label:'Composição da base na Câmara' })}
      <div class="limiares">
        <div><span>Câmara</span>${barra(dep,513,dep>=308?'ok':dep>=257?'warn':'bad')}<b class="mono">${dep}/513</b></div>
        <div><span>Senado</span>${barra(sen,81,sen>=49?'ok':sen>=41?'warn':'bad')}<b class="mono">${sen}/81</b></div>
        <p class="nota">${dep>=308?'Base suficiente para PECs, se estiver satisfeita.':dep>=257?'Maioria absoluta, mas PECs exigirão negociação.':'Sem maioria: governar será difícil.'}</p>
      </div>
    </div>
    <div class="lista-coal">${ord.map(p=>{ const a = p.id===own? 'own' : aceitacao(p); const on = SET.coalizao.includes(p.id);
      return `<button class="pc ${on?'sel':''} ${a}" data-a="coal" data-v="${p.id}" ${a==='recusa'||a==='own'?'disabled':''}><i style="background:${p.cor}"></i><b>${p.id}</b><span class="mono">${p.dep}/${p.sen}</span><em>${a==='own'?'seu partido':a==='aceita'?'aceita':a==='exige'?'exige cargos':'recusa'}</em></button>`; }).join('')}</div>
  </div>
  <h3 class="sub-t">Vice-presidente</h3>
  <div class="cards c3">${SET.viceOps.map((v,i)=>`<button class="card-op ${SET.vice===v?'sel':''}" data-a="vice" data-v="${i}"><b>${v.nome}</b><small>${v.partido} · ${v.cargo}</small></button>`).join('')}</div>`;
}

function setupMinisterios(){
  SETUP_PARTIDO = partidoSetup();
  const chave = SET.coalizao.join(',');
  if (SET._chave!==chave){ SET._chave=chave; SET.cands={}; SET.esc={}; MINISTERIOS.forEach((m,i)=>{ SET.cands[m.id]=candidatosMinisterio(m.id, SET.coalizao, SETUP_PARTIDO); SET.esc[m.id]=[0,2,1,3][i%4]; }); }
  const tot={}; let W=0; MINISTERIOS.forEach(m=>{ W+=m.peso; const c=SET.cands[m.id][SET.esc[m.id]]; const k=c.partido||'Técnicos'; tot[k]=(tot[k]||0)+m.peso; });
  return `<h2 class="sec-t">Escolha o ministério</h2>
  <p class="lead">Cada nome tem <b>competência</b> (resultados da pasta), <b>lealdade</b> e <b>integridade</b> (risco de escândalo). Dar ministérios a partidos aliados aumenta a satisfação deles no Congresso.</p>
  <p class="nota">Partidos aliados sem ministérios ficam insatisfeitos e votam menos com o governo.</p>
  <div class="partilha">${Object.entries(tot).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`<span><i style="background:${(partidosSetup().find(p=>p.id===k)||{cor:'var(--muted)'}).cor}"></i>${k} <b class="mono">${Math.round(v/W*100)}%</b></span>`).join('')}</div>
  <div class="mins">${MINISTERIOS.map(m=>`<div class="min-row"><div class="min-n"><b>${m.nome}</b><small>${'●'.repeat(m.peso)}${'○'.repeat(3-m.peso)} peso político</small></div>
    <div class="min-c">${SET.cands[m.id].map((c,i)=>`<button class="cand ${SET.esc[m.id]===i?'sel':''}" data-a="cand" data-v="${m.id}:${i}"><b>${c.nome}</b><small>${c.partido||'Técnic'+(c.gen==='f'?'a':'o')} · ${c.desc}</small><span class="mono">C${c.comp} L${c.leal} I${c.integ}</span></button>`).join('')}</div></div>`).join('')}</div>`;
}

function setupPromessas(){
  return `<h2 class="sec-t">Compromissos de campanha</h2>
  <p class="lead">Escolha 3 promessas. Cumpri-las ajuda na reeleição e na sua avaliação histórica.</p>
  <div class="cards">${PROMESSAS.map(p=>`<button class="card-op ${SET.promessas.includes(p.id)?'sel':''}" data-a="prom" data-v="${p.id}"><b>${p.txt}</b></button>`).join('')}</div>
  <h3 class="sub-t">Dificuldade</h3>
  <div class="seg">${[['facil','Lua de mel'],['normal','Realista'],['dificil','Tempestade perfeita']].map(([k,n])=>`<button class="${SET.dificuldade===k?'sel':''}" data-a="dif" data-v="${k}">${n}</button>`).join('')}</div>`;
}

function lerCamposSetup(){
  const g = id=>document.getElementById(id);
  if (g('f-nome')) SET.pres.nome = g('f-nome').value.trim();
  if (g('f-idade')) SET.pres.idade = clamp(+g('f-idade').value||56,35,85);
  if (g('f-uf')) SET.pres.uf = g('f-uf').value;
  if (g('f-pnome')) SET.novo.nome = g('f-pnome').value.trim();
  if (g('f-psigla')) SET.novo.sigla = g('f-psigla').value.trim().replace(/\s+/g,'');
  if (g('f-e')) SET.pres.e = +g('f-e').value;
  if (g('f-s')) SET.pres.s = +g('f-s').value;
}

function avancarSetup(){
  lerCamposSetup(); SET.ok='';
  if (SET.passo===0 && !SET.pres.nome){ SET.ok='Informe o nome do presidente.'; return renderSetup(); }
  if (SET.passo===1){
    if (SET.modo==='novo'){
      if (!SET.novo.nome || !SET.novo.sigla){ SET.ok='Dê nome e sigla ao novo partido.'; return renderSetup(); }
      if (PARTIDOS.some(p=>p.id.toLowerCase()===SET.novo.sigla.toLowerCase())){ SET.ok='Essa sigla já existe.'; return renderSetup(); }
    }
    SET.coalizao = SET.coalizao.filter(id=>{ const p = partidosSetup().find(x=>x.id===id); return p && (id===partidoSetup() || aceitacao(p)!=='recusa'); });
    SET.viceOps = [];
  }
  if (SET.passo===4){
    if (SET.promessas.length!==3){ SET.ok='Escolha exatamente 3 promessas.'; return renderSetup(); }
    return iniciarJogo();
  }
  SET.passo++; renderSetup(); window.scrollTo(0,0);
}

function iniciarJogo(){
  const own = partidoSetup();
  const ministros = {}; MINISTERIOS.forEach(m=>ministros[m.id] = { ...SET.cands[m.id][SET.esc[m.id]], desde:0 });
  const cfg = { pres:{ ...SET.pres, partido:own }, vice:SET.vice, coalizao:SET.coalizao, ministros, promessas:SET.promessas, dificuldade:SET.dificuldade,
    novoPartido: SET.modo==='novo'? { nome:SET.novo.nome, sigla:own, cor:SET.novo.cor } : null };
  novoEstado(cfg);
  // partidos que "exigem cargos" entram menos satisfeitos
  S.partidos.forEach(p=>{ if (S.coalizao.includes(p.id) && p.id!==own){ const d=dist(p,S.pres); const sc=1-d/12+p.fis*0.5; if (sc<0.62) p.sat-=10; } });
  salvar();
  tela='jogo'; aba='painel'; modalMin=false;
  render();
}

// ---------- jogo principal ----------
const ABAS = [['painel','Painel'],['economia','Economia'],['congresso','Congresso'],['governo','Ministérios'],['agenda','Agenda'],['mundo','Mundo'],['sociedade','Sociedade'],['diario','Diário']];

function kpi(lbl, val, serie, tom, delta, inv){
  const d = delta==null||isNaN(delta)? '' : `<span class="d ${(inv? delta<0 : delta>0)?'up':'dn'}">${delta>0?'▲':delta<0?'▼':'•'} ${fmt(Math.abs(delta), Math.abs(delta)<1?2:1)}</span>`;
  return `<div class="kpi ${tom}"><span class="k-l">${lbl}</span><span class="k-v mono">${val}</span>${d}${serie?spark(serie.slice(-12),{h:24,cls:'mini'}):''}</div>`;
}

function renderJogo(){
  const e=S.eco, h=S.hist, L=h.aprov.length;
  const dl = k=>L>1? h[k][L-1]-h[k][L-2] : null;
  const pend = S.pendentes.length;
  app.innerHTML = `
  <header class="top">
    <div class="top-in">
      <div class="top-id">
        <span class="marca">PLANALTO<b>2027</b></span>
        <span class="quem"><i style="background:${P(S.pres.partido).cor}"></i>${esc(S.pres.nome)} · ${S.pres.partido}</span>
      </div>
      <div class="top-t">
        <span class="data">${dataTurno(S.t)}</span>
        <span class="mes mono">mês ${S.t+1}/48</span>
        <span class="trilho"><span style="width:${(S.t+1)/48*100}%"></span></span>
      </div>
      <div class="top-a">
        <span class="ap" title="Pontos de agenda do mês">${Array.from({length:apMax()},(_,i)=>`<i class="${i<S.ap?'on':''}"></i>`).join('')}<small>${S.ap} agenda</small></span>
        <button class="btn fim" data-a="encerrar" ${pend?'disabled':''}>${pend?`${pend} decis${pend>1?'ões':'ão'} pendente${pend>1?'s':''}`:'Encerrar mês →'}</button>
      </div>
    </div>
  </header>
  ${pend&&modalMin?`<div class="faixa-pend"><span>Há ${pend} decis${pend>1?'ões':'ão'} aguardando o presidente.</span><button class="btn sm" data-a="abrirpend">Decidir agora</button></div>`:''}
  <section class="kpis">
    ${kpi('Aprovação', fmt(S.aprov,0)+'%', h.aprov, cls(S.aprov,50,35), dl('aprov'))}
    ${kpi('PIB (anual)', fmtPct(e.pib), h.pib, cls(e.pib,2.5,1), dl('pib'))}
    ${kpi('IPCA 12m', fmt(e.ipca)+'%', h.ipca, cls(e.ipca,4.5,6,true), dl('ipca'), true)}
    ${kpi('Selic', fmt(e.selic,2)+'%', h.selic, cls(e.selic,10,14,true), dl('selic'), true)}
    ${kpi('Desemprego', fmt(e.desemp)+'%', h.desemp, cls(e.desemp,6,8.5,true), dl('desemp'), true)}
    ${kpi('Dólar', 'R$ '+fmt(e.dolar,2), h.dolar, cls(e.dolar,5.2,6.2,true), dl('dolar'), true)}
    ${kpi('Dívida/PIB', fmt(e.divida)+'%', h.divida, cls(e.divida,78,88,true), dl('divida'), true)}
    ${kpi('Base fiel', S.baseCamara+' dep.', h.base, S.baseCamara>=308?'ok':S.baseCamara>=257?'warn':'bad', dl('base'))}
  </section>
  <nav class="abas" role="tablist">${ABAS.map(([k,n])=>`<button role="tab" aria-selected="${aba===k}" class="${aba===k?'at':''}" data-a="aba" data-v="${k}">${n}</button>`).join('')}</nav>
  <main class="conteudo">${({painel:abaPainel, economia:abaEconomia, congresso:abaCongresso, governo:abaGoverno, agenda:abaAgenda, mundo:abaMundo, sociedade:abaSociedade, diario:abaDiario})[aba]()}</main>
  <footer class="rod"><button class="lnk" data-a="menu">Menu principal</button><span>Salvo automaticamente a cada mês.</span></footer>`;
  if (pend && !modalMin) abrirPendente(); else if (!pend) fecharModal();
}

function tomAprov(v){ const hue = clamp((v-20)/45,0,1)*130+5; return `hsl(${hue} 52% 42%)`; }

function abaPainel(){
  const regs = Object.keys(REGIOES);
  const prom = S.promessas.map(id=>PROMESSAS.find(p=>p.id===id));
  const tram = S.projetos;
  return `<div class="grid-p">
    <section class="bloco mapa-b">
      <h3 class="b-t">Aprovação por estado</h3>
      <div class="mapa">${ESTADOS.map(e=>{ const a=aprovUF(e.uf); return `<button class="uf" style="grid-row:${e.r+1};grid-column:${e.c+1};background:${tomAprov(a)}" data-a="acao-visita" data-v="${e.uf}" title="${e.nome}: ${fmt(a,0)}% — clique para visitar (1 agenda)"><b>${e.uf}</b><small>${fmt(a,0)}</small></button>`; }).join('')}</div>
      <div class="regs">${regs.map(r=>`<div><span>${REGIOES[r]}</span><b class="mono">${fmt(aprovRegiao(r),0)}%</b></div>`).join('')}</div>
      <p class="nota">Toque em um estado para visitá-lo (custa 1 ponto de agenda).</p>
    </section>
    <section class="bloco">
      <h3 class="b-t">Aprovação do governo</h3>
      <div class="graf-g">${spark(S.hist.aprov,{h:120, ref:50, min:20, max:70})}</div>
      <div class="leg-g"><span>${dataCurta(0)}</span><span>linha: 50%</span><span>${dataCurta(Math.max(0,S.hist.aprov.length-1))}</span></div>
      <h3 class="b-t">Promessas de campanha</h3>
      <ul class="prom">${prom.map(p=>{ const ok=p.chk(S); return `<li class="${ok?'ok':''}"><span class="st">${ok?'Cumprida':'Pendente'}</span>${p.txt}</li>`; }).join('')}</ul>
    </section>
    <section class="bloco">
      <h3 class="b-t">No Congresso</h3>
      ${tram.length? `<ul class="tram">${tram.map(t=>{ const d=PROJETOS.find(p=>p.id===t.id); return `<li><span class="tag">${t.mp?'MP':d.tipo}</span>${d.nome}<small>votação em ${t.restante} ${t.restante>1?'meses':'mês'}</small></li>`; }).join('')}</ul>` : `<p class="nota">Nenhum projeto do governo em tramitação. Abra a aba Congresso para enviar propostas.</p>`}
      <h3 class="b-t">Últimas notícias</h3>
      <ul class="news">${S.log.slice(0,7).map(l=>`<li><span class="tag">${l.cat}</span>${esc(l.txt)}<small>${dataCurta(l.t)}</small></li>`).join('')}</ul>
    </section>
  </div>`;
}

function abaEconomia(){
  const e=S.eco, h=S.hist;
  const prox = (()=>{ for(let k=0;k<12;k++){ const t=S.t+k; if (COPOM.includes(t%12)) return dataTurno(t); } return '-'; })();
  const g = (t,serie,val,o={})=>`<div class="graf"><div class="graf-h"><span>${t}</span><b class="mono">${val}</b></div>${spark(serie,o)}${o.nota?`<small>${o.nota}</small>`:''}</div>`;
  return `<div class="grid-e">
    ${g('PIB — crescimento anualizado', h.pib, fmtPct(e.pib), {ref:2, nota:`PIB potencial estimado: ${fmt(e.potencial + compMin('fazenda')*0.15 + (S.soc.infra-45)*0.012,1)}%`})}
    ${g('IPCA — 12 meses', h.ipca, fmt(e.ipca)+'%', {ref:3, nota:'Meta contínua: 3,0% (tolerância até 4,5%)'})}
    ${g('Taxa Selic', h.selic, fmt(e.selic,2)+'%', {nota:`Próximo Copom: ${prox} · expectativa de inflação ${fmt(e.expInfl)}%`})}
    ${g('Desemprego (PNAD)', h.desemp, fmt(e.desemp)+'%')}
    ${g('Dólar (R$)', h.dolar, fmt(e.dolar,2))}
    ${g('Dívida bruta (% PIB)', h.divida, fmt(e.divida)+'%')}
    ${g('Resultado primário (% PIB)', h.primario, fmtPct(e.primario??e.primStruct,2), {ref:e.meta, nota:`Meta fiscal: ${fmtPct(e.meta,2)} · banda de ±0,25 p.p.`})}
    ${g('Confiança do mercado', h.conf, fmt(e.conf,0)+'/100')}
  </div>
  <section class="bloco">
    <h3 class="b-t">Como a economia reage</h3>
    <ul class="expl">
      <li><b>Banco Central:</b> o Copom se reúne 8 vezes por ano e segue uma regra de Taylor. Inflação acima da meta leva a juros mais altos, que freiam o PIB e valorizam o real. ${e.bcHawk<1?'Seu indicado no BC é leniente: expectativas de inflação sobem.':''}</li>
      <li><b>Fiscal:</b> déficits estimulam o PIB no curto prazo, mas aumentam a dívida, derrubam a confiança e pressionam o dólar. A despesa obrigatória cresce sozinha todo mês.</li>
      <li><b>Dívida:</b> cresce quando os juros implícitos superam o crescimento nominal do PIB. Com Selic alta, é difícil estabilizá-la sem superávit.</li>
      <li><b>Comércio exterior:</b> boas relações com China, EUA e União Europeia somam exportações e investimento.</li>
    </ul>
  </section>`;
}

function previsao(def){
  let c=0,s=0; S.partidos.forEach(p=>{ c+=p.dep*0.925*probVoto(p,def,'camara'); s+=p.sen*0.95*probVoto(p,def,'senado'); });
  c=Math.round(c); s=Math.round(s);
  const nc = def.tipo==='PEC'?308:def.tipo==='PLP'?257:Math.round(513*0.925/2)+1;
  const ns = def.tipo==='PEC'?49:def.tipo==='PLP'?41:39;
  const m = Math.min((c-nc)/40, (s-ns)/6);
  return { c, s, nc, ns, chance: m>0.6?'alta':m>-0.1?'incerta':'baixa' };
}

function abaCongresso(){
  const ord = S.partidos.slice().sort((a,b)=>a.e-b.e);
  const cores = [], coresS=[];
  ord.forEach(p=>{ const on=S.coalizao.includes(p.id); for(let i=0;i<p.dep;i++) cores.push(on?p.cor:'var(--seat-off)'); for(let i=0;i<p.sen;i++) coresS.push(on?p.cor:'var(--seat-off)'); });
  const depCoal = S.partidos.filter(p=>S.coalizao.includes(p.id)).reduce((a,p)=>a+p.dep,0);
  const disp = PROJETOS.filter(p=>!S.aprovadas.includes(p.id) && !S.projetos.some(x=>x.id===p.id) && !(S.rejeitadas[p.id]!=null && S.t-S.rejeitadas[p.id]<6));
  return `<div class="grid-c">
    <section class="bloco">
      <h3 class="b-t">Câmara dos Deputados</h3>
      ${hemiciclo(cores, 11, { centro:S.baseCamara, sub:`base fiel · ${depCoal} na coalizão`, label:'Câmara' })}
      <div class="limiares"><div><span>Maioria absoluta</span>${barra(S.baseCamara,513,S.baseCamara>=257?'ok':'bad')}<b class="mono">257</b></div><div><span>PEC (3/5)</span>${barra(S.baseCamara,513,S.baseCamara>=308?'ok':'bad')}<b class="mono">308</b></div></div>
      <h3 class="b-t">Senado Federal</h3>
      ${hemiciclo(coresS, 5, { centro:S.baseSenado, sub:'senadores fiéis', label:'Senado', dot:4.6 })}
      <p class="nota">Relação com a presidência da Câmara: <b>${fmt(S.presCamara,0)}/100</b>. Ela define a velocidade e o humor das votações.</p>
    </section>
    <section class="bloco">
      <h3 class="b-t">Partidos</h3>
      <div class="tab-wrap"><table class="tab">
        <thead><tr><th>Partido</th><th>Dep.</th><th>Sen.</th><th>Satisfação</th><th></th></tr></thead>
        <tbody>${S.partidos.slice().sort((a,b)=>b.dep-a.dep).map(p=>{ const on=S.coalizao.includes(p.id), own=p.id===S.pres.partido;
          return `<tr class="${on?'on':''}"><td><i class="dot" style="background:${p.cor}"></i><b>${p.id}</b> <small>${own?'seu partido':on?'base':'oposição/indep.'}</small></td><td class="mono">${p.dep}</td><td class="mono">${p.sen}</td><td>${barra(p.sat)}<span class="mono sm">${fmt(p.sat,0)}</span></td>
          <td class="acts">${own?'':on?`<button class="btn sm" data-a="acao-cafe" data-v="${p.id}">Agradar</button><button class="btn sm ghost" data-a="romper" data-v="${p.id}">Romper</button>`:`<button class="btn sm" data-a="acao-cafe" data-v="${p.id}">Convidar</button>`}</td></tr>`; }).join('')}</tbody>
      </table></div>
      <p class="nota">Convidar ou agradar custa 1 ponto de agenda. A satisfação depende de cargos no ministério, emendas, afinidade ideológica e da sua popularidade.</p>
    </section>
  </div>
  <section class="bloco">
    <h3 class="b-t">Em tramitação</h3>
    ${S.projetos.length? `<div class="projs">${S.projetos.map(t=>{ const d=PROJETOS.find(p=>p.id===t.id); const pv=previsao({...d,artic:t.artic});
      return `<article class="proj tr"><header><span class="tag">${t.mp?'MP':d.tipo}</span><b>${d.nome}</b></header><p>Votação em ${t.restante} ${t.restante>1?'meses':'mês'}. Articulação: ${'●'.repeat(t.artic)}${'○'.repeat(3-t.artic)}</p>
      <p class="prev">Previsão: Câmara ~${pv.c} (precisa ${pv.nc}) · Senado ~${pv.s} (precisa ${pv.ns}) · chance <b class="ch-${pv.chance}">${pv.chance}</b></p>
      ${t.artic<3?`<button class="btn sm" data-a="articular" data-v="${t.id}" ${S.ap<1?'disabled':''}>Articular votação (1 agenda)</button>`:''}</article>`; }).join('')}</div>` : `<p class="nota">Nada em tramitação.</p>`}
  </section>
  <section class="bloco">
    <h3 class="b-t">Propor ao Congresso</h3>
    <p class="nota">Enviar um projeto custa 1 ponto de agenda. Medidas Provisórias têm efeito imediato, mas caducam se não forem aprovadas em 120 dias, e irritam o Congresso.</p>
    <div class="projs">${disp.map(d=>{ const pv=previsao({...d,artic:0});
      return `<article class="proj"><header><span class="tag">${d.tipo}</span><b>${d.nome}</b></header><p>${d.desc}</p>
      <p class="prev">${rotE(d.e)} · tramitação ${d.tram} meses · chance <b class="ch-${pv.chance}">${pv.chance}</b> <small>(Câmara ~${pv.c}/${pv.nc})</small></p>
      <div class="bt"><button class="btn sm" data-a="propor" data-v="${d.id}" ${S.ap<1?'disabled':''}>Enviar ${d.tipo}</button>${d.mp?`<button class="btn sm ghost" data-a="mp" data-v="${d.id}" ${S.ap<1?'disabled':''}>Editar MP</button>`:''}</div></article>`; }).join('')}</div>
    ${S.aprovadas.length?`<h3 class="b-t">Aprovadas no mandato</h3><ul class="aprov">${S.aprovadas.map(id=>`<li>${PROJETOS.find(p=>p.id===id).nome}</li>`).join('')}</ul>`:''}
  </section>`;
}

function abaGoverno(){
  return `<section class="bloco"><h3 class="b-t">Esplanada dos Ministérios</h3>
  <p class="nota">Vice-presidente: <b>${esc(S.vice?S.vice.nome:'—')}</b>${S.vice?` (${S.vice.partido})`:''}. Trocar um ministro custa 1 ponto de agenda; o partido que perde a pasta fica insatisfeito.</p>
  <div class="minis">${MINISTERIOS.map(m=>{ const mi=S.ministros[m.id]; const p=mi.partido?P(mi.partido):null; const c=compMin(m.id);
    return `<article class="mcard"><header><span class="m-n">${m.nome}</span><span class="m-p" style="--pc:${p?p.cor:'var(--muted)'}">${mi.partido||'Técnico'}</span></header>
    <b class="m-nome">${esc(mi.nome)}</b><small>${esc(mi.desc)} · desde ${dataCurta(mi.desde||0)}</small>
    <dl class="m-st"><div><dt>Competência</dt><dd>${barra(mi.comp)}<span class="mono">${mi.comp}</span></dd></div><div><dt>Lealdade</dt><dd>${barra(mi.leal)}<span class="mono">${mi.leal}</span></dd></div><div><dt>Integridade</dt><dd>${barra(mi.integ)}<span class="mono">${mi.integ}</span></dd></div></dl>
    <footer><span class="ef ${c>0.3?'ok':c<0?'bad':'warn'}">${c>0.3?'Gestão forte':c<0?'Gestão fraca':'Gestão regular'}</span><button class="btn sm ghost" data-a="trocar" data-v="${m.id}" ${S.ap<1?'disabled':''}>Trocar</button></footer></article>`; }).join('')}</div></section>`;
}

function abaAgenda(){
  return `<section class="bloco"><h3 class="b-t">Agenda presidencial</h3>
  <p class="nota">Você tem <b>${S.ap}</b> ponto${S.ap!==1?'s':''} de agenda neste mês. Ministro da Casa Civil com competência 80+ dá um ponto extra.</p>
  <div class="acoes">${ACOES.map(a=>`<article class="acao"><b>${a.nome}</b><p>${a.desc}</p><button class="btn sm" data-a="acao-${a.id}" ${S.ap<a.custo?'disabled':''}>${a.custo} agenda${a.custo>1?'s':''}</button></article>`).join('')}</div></section>`;
}

function abaMundo(){
  return `<section class="bloco"><h3 class="b-t">Política externa</h3>
  <p class="nota">Itamaraty: ${esc(S.ministros.itamaraty.nome)}. Viagens de Estado custam 2 pontos de agenda e podem render acordos comerciais. Aproximar-se de um polo geopolítico pode irritar o outro.</p>
  <div class="paises">${PAISES.map(c=>`<article class="pais"><header><b>${c.nome}</b><span class="tag">${c.bloco}</span></header>${barra(S.rel[c.id])}<div class="pais-f"><span class="mono">${fmt(S.rel[c.id],0)}/100</span><small>${Math.round(c.comercio*100)}% do comércio</small><button class="btn sm" data-a="viagem" data-v="${c.id}" ${S.ap<2?'disabled':''}>Visitar</button></div></article>`).join('')}</div></section>`;
}

function abaSociedade(){
  const s=S.soc;
  const ind = (t,v,nota,tom)=>`<div class="ind ${tom}"><span>${t}</span><b class="mono">${v}</b><small>${nota}</small></div>`;
  return `<div class="grid-c">
  <section class="bloco"><h3 class="b-t">Indicadores sociais</h3>
    <div class="inds">
      ${ind('Pobreza', fmt(s.pobreza)+'%', 'da população abaixo de US$ 6,85/dia', cls(s.pobreza,20,26,true))}
      ${ind('Homicídios', fmt(s.homic), 'por 100 mil habitantes', cls(s.homic,17,22,true))}
      ${ind('Desmatamento', Math.round(s.desmat).toLocaleString('pt-BR')+' km²', 'Amazônia Legal, taxa anual (Prodes)', cls(s.desmat,4000,7000,true))}
      ${ind('Salário mínimo', 'R$ '+s.salmin.toLocaleString('pt-BR'), 'valor mensal', 'warn')}
      ${ind('Saúde', fmt(s.saude,0)+'/100', 'acesso e filas do SUS', cls(s.saude,60,48))}
      ${ind('Educação', fmt(s.educ,0)+'/100', 'aprendizado e alfabetização', cls(s.educ,58,46))}
      ${ind('Infraestrutura', fmt(s.infra,0)+'/100', 'logística, energia, saneamento', cls(s.infra,55,40))}
      ${ind('Relação com o STF', fmt(S.stf,0)+'/100', 'ministros indicados e diálogo', cls(S.stf,60,40))}
    </div></section>
  <section class="bloco"><h3 class="b-t">Grupos de pressão</h3>
    <ul class="grps">${GRUPOS.map(g=>`<li><span>${g.nome}</span>${barra(S.grp[g.id])}<b class="mono">${fmt(S.grp[g.id],0)}</b><button class="btn sm ghost" data-a="reuniao" data-v="${g.id}" ${S.ap<1?'disabled':''}>Reunir</button></li>`).join('')}</ul></section>
  </div>`;
}

function abaDiario(){
  return `<section class="bloco"><h3 class="b-t">Diário do governo</h3><ul class="news full">${S.log.map(l=>`<li><span class="tag">${l.cat}</span>${esc(l.txt)}<small>${dataCurta(l.t)}</small></li>`).join('')}</ul></section>`;
}

// ---------- modais ----------
function abrirModal(html, wide){ modalCard.innerHTML = html; modalCard.classList.toggle('wide', !!wide); modal.hidden = false; const b = modalCard.querySelector('button'); if (b) b.focus({preventScroll:true}); }
function fecharModal(){ modal.hidden = true; }

function abrirPendente(){
  const ref = S.pendentes[0]; if (!ref) return fecharModal();
  if (eventoResultado) return mostrarResultado();
  if (ref.tipo==='voto') return mostrarVoto(ref.voto);
  if (ref.tipo==='eleicao') return mostrarEleicao(ref.r);
  const ev = getEvento(ref);
  if (!ev){ S.pendentes.shift(); return render(); }
  const texto = typeof ev.texto==='function'? ev.texto(S) : ev.texto;
  abrirModal(`<div class="ev"><p class="ev-cat"><span class="tag">${ev.cat}</span>${dataTurno(S.t)}${S.pendentes.length>1?` · ${S.pendentes.length} decisões`:''}</p>
    <h2 class="ev-t">${esc(ev.titulo)}</h2><p class="ev-x">${esc(texto)}</p>
    <div class="ev-ops">${ev.opcoes.map((o,i)=>`<button class="op" data-a="opcao" data-v="${i}">${esc(o.txt)}</button>`).join('')}</div>
    <button class="lnk" data-a="minimizar">Ver o painel antes de decidir</button></div>`);
}

function escolherOpcao(i){
  const ref = S.pendentes[0]; const ev = getEvento(ref); const op = ev.opcoes[i];
  const efs = applyFx(op.fx);
  logar(ev.cat, `${ev.titulo}: ${op.txt}.`);
  eventoResultado = { titulo:ev.titulo, escolha:op.txt, res:op.res, efs };
  calcBase();
  mostrarResultado();
}
function mostrarResultado(){
  const r = eventoResultado;
  abrirModal(`<div class="ev"><p class="ev-cat"><span class="tag">Decisão tomada</span></p><h2 class="ev-t">${esc(r.titulo)}</h2>
    <p class="ev-esc">${esc(r.escolha)}</p>${r.res?`<p class="ev-x">${esc(r.res)}</p>`:''}${chips(r.efs)}
    <button class="btn prim" data-a="continuar-ev">Continuar</button></div>`);
}

function mostrarVoto(v){
  const coresVoto = lista=>{ const c=[]; lista.forEach(p=>{ for(let i=0;i<p.sim;i++) c.push('var(--good)'); }); lista.forEach(p=>{ for(let i=0;i<p.aus;i++) c.push('var(--seat-off)'); }); lista.forEach(p=>{ for(let i=0;i<p.nao;i++) c.push('var(--bad)'); }); return c; };
  const tab = lista=>`<div class="tab-wrap"><table class="tab sm"><thead><tr><th>Partido</th><th>Sim</th><th>Não</th><th>Aus.</th></tr></thead><tbody>${lista.filter(p=>p.sim+p.nao+p.aus>0).sort((a,b)=>(b.sim+b.nao)-(a.sim+a.nao)).map(p=>`<tr><td><i class="dot" style="background:${p.cor}"></i>${p.id}</td><td class="mono">${p.sim}</td><td class="mono">${p.nao}</td><td class="mono">${p.aus}</td></tr>`).join('')}</tbody></table></div>`;
  abrirModal(`<div class="ev"><p class="ev-cat"><span class="tag">${v.mp?'Medida Provisória':v.tipo}</span>Votação em plenário</p>
    <h2 class="ev-t">${esc(v.nome)}</h2>
    <p class="veredito ${v.aprovado?'ok':'bad'}">${v.aprovado?'APROVADO':'REJEITADO'}</p>
    <div class="votos">
      <div><h4>Câmara · ${v.regraC}</h4>${hemiciclo(coresVoto(v.camara),11,{centro:`${v.simC} × ${v.naoC}`, sub:v.okC?'aprovado':'rejeitado'})}<details><summary>Votos por partido</summary>${tab(v.camara)}</details></div>
      ${v.senado?`<div><h4>Senado · ${v.regraS}</h4>${hemiciclo(coresVoto(v.senado),5,{centro:`${v.simS} × ${v.naoS}`, sub:v.okS?'aprovado':'rejeitado', dot:4.6})}<details><summary>Votos por partido</summary>${tab(v.senado)}</details></div>`:''}
    </div>${chips(v.efeitos)}
    <button class="btn prim" data-a="continuar-ev">Continuar</button></div>`, true);
}

function mostrarEleicao(r){
  abrirModal(`<div class="ev"><p class="ev-cat"><span class="tag">Eleições 2030</span>Outubro de 2030</p>
    <h2 class="ev-t">${r.vence?'Vitória nas urnas':'Derrota nas urnas'}</h2>
    <p class="ev-x">Primeiro turno: ${esc(r.candidato)} com ${fmt(r.primeiro)}% dos votos válidos. No segundo turno, ${fmt(r.votos)}% contra ${fmt(100-r.votos)}%.</p>
    <p class="veredito ${r.vence?'ok':'bad'}">${r.vence? (S.flags.desistiu?'SEU SUCESSOR É ELEITO':'REELEITO') : 'DERROTADO'}</p>
    <p class="nota">Promessas cumpridas: ${r.prom} de 3. O mandato segue até dezembro de 2030.</p>
    <button class="btn prim" data-a="continuar-ev">Continuar</button></div>`);
}

function modalEscolha(titulo, texto, itens, acao){
  abrirModal(`<div class="ev"><h2 class="ev-t">${titulo}</h2><p class="ev-x">${texto}</p><div class="esc-lista">${itens.map(it=>`<button class="op" data-a="${acao}" data-v="${it.v}">${it.t}${it.s?`<small>${it.s}</small>`:''}</button>`).join('')}</div><button class="lnk" data-a="fechar">Cancelar</button></div>`);
}

function feedbackAcao(titulo, txt){
  abrirModal(`<div class="ev"><p class="ev-cat"><span class="tag">Agenda</span></p><h2 class="ev-t">${titulo}</h2><p class="ev-x">${esc(txt)}</p><button class="btn prim" data-a="fechar-render">OK</button></div>`);
}

function executarAcao(id, v){
  const a = ACOES.find(x=>x.id===id); if (S.ap < a.custo) return;
  S.ap -= a.custo;
  const txt = ACOES_FX[id](v);
  calcBase(); salvar();
  feedbackAcao(a.nome, txt);
}

// ---------- fim ----------
function renderFim(){
  const f = S.fim, h=S.hist, e=S.eco, el=S.flags.eleicao;
  const prom = S.promessas.map(id=>PROMESSAS.find(p=>p.id===id));
  const cumpridas = prom.filter(p=>p.chk(S)).length;
  const media = k=>h[k].reduce((a,b)=>a+b,0)/h[k].length;
  let nota = S.aprov*0.6 + cumpridas*8 + media('pib')*4 - Math.max(0,e.ipca-4.5)*3 - Math.max(0,e.divida-82.4)*0.6 + S.aprovadas.length*1.2 + (el&&el.vence?8:0);
  if (f.tipo==='impeachment') nota -= 40; if (f.tipo==='renuncia') nota -= 30;
  const conceito = nota>=75?'A':nota>=60?'B':nota>=45?'C':nota>=30?'D':'E';
  const titulo = f.tipo==='impeachment'? 'Mandato interrompido por impeachment' : f.tipo==='renuncia'? 'Renúncia' : el && el.vence ? (S.flags.desistiu?'Sucessor eleito':'Reeleição conquistada') : 'Fim do mandato';
  const linha = (n,a,b,d=1,suf='')=>`<tr><td>${n}</td><td class="mono">${fmt(a,d)}${suf}</td><td class="mono">${fmt(b,d)}${suf}</td></tr>`;
  app.innerHTML = `<section class="final">
    <p class="eyebrow">${dataTurno(Math.min(S.t,47))}</p>
    <h1 class="final-t">${titulo}</h1>
    <p class="lead">${esc(S.pres.nome)} (${S.pres.partido}) termina com aprovação de ${fmt(S.aprov,0)}%, ${S.aprovadas.length} projetos aprovados e ${cumpridas} de 3 promessas cumpridas.</p>
    <div class="conceito"><span>Avaliação histórica</span><b>${conceito}</b></div>
    <div class="grid-c">
      <section class="bloco"><h3 class="b-t">Aprovação ao longo do mandato</h3>${spark(h.aprov,{h:120,ref:50,min:10,max:80})}</section>
      <section class="bloco"><h3 class="b-t">Brasil: antes e depois</h3><div class="tab-wrap"><table class="tab"><thead><tr><th>Indicador</th><th>Posse</th><th>Saída</th></tr></thead><tbody>
        ${linha('PIB (%)',h.pib[0],e.pib)}${linha('IPCA (%)',h.ipca[0],e.ipca)}${linha('Selic (%)',h.selic[0],e.selic,2)}${linha('Desemprego (%)',h.desemp[0],e.desemp)}${linha('Dívida/PIB (%)',h.divida[0],e.divida)}${linha('Dólar (R$)',h.dolar[0],e.dolar,2)}${linha('Pobreza (%)',23,S.soc.pobreza)}${linha('Homicídios/100 mil',20.8,S.soc.homic)}${linha('Desmatamento (km²)',5800,S.soc.desmat,0)}
      </tbody></table></div></section>
    </div>
    <section class="bloco"><h3 class="b-t">Promessas</h3><ul class="prom">${prom.map(p=>`<li class="${p.chk(S)?'ok':''}"><span class="st">${p.chk(S)?'Cumprida':'Não cumprida'}</span>${p.txt}</li>`).join('')}</ul></section>
    <div class="capa-acoes"><button class="btn prim" data-a="novojogo">Novo mandato</button></div>
  </section>`;
  fecharModal();
}

// ---------- roteamento ----------
function render(){
  if (tela==='inicio') return renderInicio();
  if (tela==='setup') return renderSetup();
  if (S && S.fim) return renderFim();
  renderJogo();
}

document.addEventListener('input', ev=>{
  if (ev.target.id==='f-e'){ const l=document.getElementById('l-e'); if(l) l.textContent=rotE(+ev.target.value); }
  if (ev.target.id==='f-s'){ const l=document.getElementById('l-s'); if(l) l.textContent=rotS(+ev.target.value); }
});

document.addEventListener('click', ev=>{
  const b = ev.target.closest('[data-a]'); if (!b || b.disabled) return;
  const a = b.dataset.a, v = b.dataset.v;
  // tela inicial / setup
  if (a==='novo'){ novoSetup(); tela='setup'; return render(); }
  if (a==='continuar'){ if (carregar()){ tela='jogo'; modalMin=false; render(); } return; }
  if (a==='sair'){ tela='inicio'; return render(); }
  if (a==='voltar'){ lerCamposSetup(); SET.ok=''; SET.passo--; return render(); }
  if (a==='avancar') return avancarSetup();
  if (a==='bg'){ lerCamposSetup(); SET.pres.bg=v; return render(); }
  if (a==='modo'){ lerCamposSetup(); SET.modo=v; return render(); }
  if (a==='partido'){ lerCamposSetup(); SET.partido=v; const p=PARTIDOS.find(x=>x.id===v); SET.pres.e=p.e; SET.pres.s=p.s; SET.coalizao=[]; return render(); }
  if (a==='cor'){ lerCamposSetup(); SET.novo.cor=v; return render(); }
  if (a==='coal'){ const i=SET.coalizao.indexOf(v); if(i>=0) SET.coalizao.splice(i,1); else SET.coalizao.push(v); return render(); }
  if (a==='vice'){ SET.vice=SET.viceOps[+v]; return render(); }
  if (a==='cand'){ const [m,i]=v.split(':'); SET.esc[m]=+i; return render(); }
  if (a==='prom'){ const i=SET.promessas.indexOf(v); if(i>=0) SET.promessas.splice(i,1); else if (SET.promessas.length<3) SET.promessas.push(v); return render(); }
  if (a==='dif'){ SET.dificuldade=v; return render(); }
  // jogo
  if (a==='aba'){ aba=v; render(); window.scrollTo({top:0}); return; }
  if (a==='encerrar'){ encerrarMes(); modalMin=false; render(); window.scrollTo({top:0}); return; }
  if (a==='minimizar'){ modalMin=true; fecharModal(); return render(); }
  if (a==='abrirpend'){ modalMin=false; return abrirPendente(); }
  if (a==='opcao') return escolherOpcao(+v);
  if (a==='continuar-ev'){ eventoResultado=null; S.pendentes.shift(); salvar(); modalMin=false; return render(); }
  if (a==='fechar'){ fecharModal(); return; }
  if (a==='fechar-render'){ fecharModal(); return render(); }
  if (a==='menu'){ salvar(); tela='inicio'; fecharModal(); return render(); }
  if (a==='novojogo'){ apagarSave(); S=null; tela='inicio'; return render(); }
  if (a==='propor'||a==='mp'){ if (S.ap<1) return; propor(v, a==='mp'); calcBase(); salvar(); return render(); }
  if (a==='articular'){ const t=S.projetos.find(x=>x.id===v); if (!t||S.ap<1) return; S.ap--; t.artic++; S.eco.primTemp-=0.02; S.partidos.filter(p=>S.coalizao.includes(p.id)).forEach(p=>p.sat=clamp(p.sat+1,0,100)); logar('Congresso',`Planalto articula votos para: ${PROJETOS.find(p=>p.id===v).nome}.`); salvar(); return render(); }
  if (a==='romper'){ return abrirModal(`<div class="ev"><h2 class="ev-t">Romper com o ${v}?</h2><p class="ev-x">O partido deixa a base e seus ministros são substituídos por técnicos.</p><div class="ev-ops"><button class="op" data-a="romper-ok" data-v="${v}">Sim, romper</button><button class="op" data-a="fechar">Cancelar</button></div></div>`); }
  if (a==='romper-ok'){ romperPartido(v); salvar(); fecharModal(); return render(); }
  if (a==='trocar'){
    const mi = MIN(v);
    tmpCandidatos = { min:v, lista:candidatosMinisterio(v, S.coalizao, S.pres.partido) };
    return abrirModal(`<div class="ev"><h2 class="ev-t">Novo titular: ${mi.nome}</h2><p class="ev-x">Atual: ${esc(S.ministros[v].nome)} (${S.ministros[v].partido||'técnico'}). Escolha o substituto.</p><div class="esc-lista">${tmpCandidatos.lista.map((c,i)=>`<button class="op" data-a="trocar-ok" data-v="${i}"><b>${esc(c.nome)}</b> · ${c.partido||'Técnico'}<small>${esc(c.desc)} · Competência ${c.comp} · Lealdade ${c.leal} · Integridade ${c.integ}</small></button>`).join('')}</div><button class="lnk" data-a="fechar">Cancelar</button></div>`);
  }
  if (a==='trocar-ok'){ if (S.ap<1) return; trocarMinistro(tmpCandidatos.min, tmpCandidatos.lista[+v]); salvar(); fecharModal(); return render(); }
  // ações de agenda
  if (a==='acao-pronunciamento' || a==='acao-emendas' || a==='acao-entrevista'){ return executarAcao(a.slice(5)); }
  if (a==='acao-visitaestado') return modalEscolha('Visitar um estado','Escolha o destino da agenda.', ESTADOS.slice().sort((x,y)=>aprovUF(x.uf)-aprovUF(y.uf)).map(e=>({v:e.uf, t:e.nome, s:`Aprovação ${fmt(aprovUF(e.uf),0)}%`})), 'acao-visita');
  if (a==='acao-visita'){ if (S.ap<1) return feedbackAcao('Sem agenda','Você não tem pontos de agenda neste mês. Encerre o mês para recuperá-los.'); return executarAcao('visitaestado', v); }
  if (a==='acao-reuniaogrupo') return modalEscolha('Reunião com grupo de interesse','Quem será recebido no Planalto?', GRUPOS.map(g=>({v:g.id, t:g.nome, s:`Relação ${fmt(S.grp[g.id],0)}/100`})), 'reuniao');
  if (a==='reuniao') return executarAcao('reuniaogrupo', v);
  if (a==='acao-viagem') return modalEscolha('Viagem internacional','Escolha o destino da visita de Estado.', PAISES.map(c=>({v:c.id, t:c.nome, s:`Relação ${fmt(S.rel[c.id],0)}/100`})), 'viagem');
  if (a==='viagem') return executarAcao('viagem', v);
  if (a==='acao-cafepartido') return modalEscolha('Negociar com um partido','Jantar no Palácio da Alvorada.', S.partidos.filter(p=>p.id!==S.pres.partido).sort((x,y)=>y.dep-x.dep).map(p=>({v:p.id, t:`${p.id} · ${p.dep} deputados`, s:`${S.coalizao.includes(p.id)?'Base':'Fora da base'} · satisfação ${fmt(p.sat,0)}`})), 'acao-cafe');
  if (a==='acao-cafe') return executarAcao('cafepartido', v);
});

document.addEventListener('keydown', ev=>{ if (ev.key==='Escape' && !modal.hidden && !S?.pendentes?.length) fecharModal(); });

// boot (com suporte a atualização ao vivo no visualizador)
function iniciar(dados){
  if (dados && dados.S){ S = dados.S; tela = dados.tela||'jogo'; aba = dados.aba||'painel'; }
  render();
}
try{ window.claude?.hot?.snapshot?.(()=>({ S, tela: tela==='setup'?'inicio':tela, aba })); }catch(e){}
window.claude?.hot?.ready ? window.claude.hot.ready(iniciar) : iniciar(window.claude?.hot?.data ?? {});
