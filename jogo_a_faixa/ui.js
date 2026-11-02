// =====================================================================
// A FAIXA — interface (mobile-first, vertical)
// =====================================================================

const app = document.getElementById('app');
const modal = document.getElementById('modal');
const modalCard = document.getElementById('modal-card');
const toastEl = document.getElementById('toast');
let SETUP_PARTIDO = null;
let tela = 'inicio';
let aba = 'inicio';
let subBrasil = 'economia';
let filtroProj = 'todos';
let modalMin = false;
let eventoResultado = null;
let tmpCandidatos = null;
let SET = null;
let minAberto = null;

const esc = s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const tom = (v,bom,ruim,inv)=> inv ? (v<=bom?'ok':v>=ruim?'bad':'mid') : (v>=bom?'ok':v<=ruim?'bad':'mid');
const reduzMov = ()=>window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------- ícones ----------
const IC = {
  inicio:'<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  congresso:'<path d="M3 21h18"/><path d="M10 21V4h4v17"/><path d="M2 15c1.5 2.6 6.5 2.6 8 0"/><path d="M14 13c1.5-2.6 6.5-2.6 8 0"/>',
  acoes:'<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',
  brasil:'<path d="M4 20V11M10 20V4M16 20v-8M22 20H2"/>',
  equipe:'<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.8-3.6 3.3-5.5 6.5-5.5s5.7 1.9 6.5 5.5"/><circle cx="17" cy="9" r="2.6"/><path d="M16 14.6c2.8 0 4.8 1.6 5.5 4.6"/>',
  menu:'<path d="M4 7h16M4 12h16M4 17h16"/>',
  voltar:'<path d="M15 5l-7 7 7 7"/>',
  pronunciamento:'<path d="M4 10v4h3l6 4V6L7 10z"/><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a7.5 7.5 0 0 1 0 11"/>',
  visitaestado:'<path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
  reuniaogrupo:'<path d="M4 6h16v10H8l-4 4z"/>',
  viagem:'<path d="M2 16l20-8-6 12-3-5z"/><path d="M13 15l-3 5"/>',
  emendas:'<rect x="3" y="6" width="18" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/>',
  cafepartido:'<path d="M4 9h12v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z"/><path d="M16 10h2a2.5 2.5 0 0 1 0 5h-2M8 3v3M12 3v3"/>',
  entrevista:'<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>',
};
const RAIO = '<svg class="rz" viewBox="0 0 24 24" aria-label="agenda"><path d="M13 2L4 14h7l-1 8 9-12h-7z"/></svg>';
const icon = (k,c='')=>`<svg class="ic ${c}" viewBox="0 0 24 24" aria-hidden="true">${IC[k]||''}</svg>`;

// ---------- componentes ----------
function spark(vals, o={}){
  const W=300, H=o.h||70; const v = vals.length? vals : [0];
  let mn = Math.min(...v, o.ref??Infinity), mx = Math.max(...v, o.ref??-Infinity);
  if (o.min!=null) mn = Math.min(mn,o.min); if (o.max!=null) mx = Math.max(mx,o.max);
  if (mx-mn<1e-6){ mx+=1; mn-=1; }
  const pad=(mx-mn)*0.12; mn-=pad; mx+=pad;
  const n=Math.max(v.length-1,1), X=i=>i/n*W, Y=y=>H-(y-mn)/(mx-mn)*H;
  const pts=v.map((y,i)=>`${X(i).toFixed(1)},${Y(y).toFixed(1)}`).join(' ');
  const ref=o.ref!=null?`<line x1="0" x2="${W}" y1="${Y(o.ref)}" y2="${Y(o.ref)}" class="sp-ref" vector-effect="non-scaling-stroke"/>`:'';
  const last=v.length-1;
  return `<svg class="spark" style="height:${H}px" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true">${ref}<polygon points="0,${H} ${pts} ${X(last).toFixed(1)},${H}" class="sp-area"/><polyline points="${pts}" class="sp-line" vector-effect="non-scaling-stroke"/><circle cx="${X(last)}" cy="${Y(v[last])}" r="3.5" class="sp-dot" vector-effect="non-scaling-stroke"/></svg>`;
}

function hemiciclo(cores, linhas, opts={}){
  const n=cores.length, W=240, H=128, cx=W/2, cy=H-6, R=112, r0=R*0.42;
  const radii=Array.from({length:linhas},(_,i)=>r0+(R-r0)*i/(linhas-1||1));
  const somaR=radii.reduce((a,b)=>a+b,0);
  const por=radii.map(r=>Math.round(n*r/somaR)); por[linhas-1]+=n-por.reduce((a,b)=>a+b,0);
  const pos=[];
  radii.forEach((r,i)=>{ const k=por[i]; for(let j=0;j<k;j++){ const a=Math.PI-Math.PI*(k===1?0.5:j/(k-1)); pos.push({x:cx+r*Math.cos(a), y:cy-r*Math.sin(a), a}); } });
  pos.sort((a,b)=>b.a-a.a);
  const dr=opts.dot||Math.max(1.6,Math.min(5.2,(R-r0)/linhas*0.42));
  return `<svg class="hemi" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(opts.label||'Plenário')}">${pos.map((p,i)=>`<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${dr}" fill="${cores[i]||'#444'}"/>`).join('')}${opts.centro!=null?`<text x="${cx}" y="${cy-10}" text-anchor="middle" class="hemi-num">${opts.centro}</text>`:''}${opts.sub?`<text x="${cx}" y="${cy+1}" text-anchor="middle" class="hemi-sub">${opts.sub}</text>`:''}</svg>`;
}

function barra(v,max=100,t){ const c=t||(v>=60?'ok':v<35?'bad':'mid'); return `<span class="bar"><span class="bar-f ${c}" style="width:${clamp(v/max*100,0,100)}%"></span></span>`; }

function anel(v, tam=64){
  const r=26, c=2*Math.PI*r, f=clamp(v,0,100)/100;
  const cor = v>=50?'var(--yel)':v>=35?'var(--ink)':'var(--red)';
  return `<svg class="anel" width="${tam}" height="${tam}" viewBox="0 0 64 64" aria-label="Aprovação ${fmt(v,0)}%"><circle cx="32" cy="32" r="${r}" class="anel-bg"/><circle cx="32" cy="32" r="${r}" class="anel-f" style="stroke:${cor}" stroke-dasharray="${(c*f).toFixed(1)} ${c.toFixed(1)}" transform="rotate(-90 32 32)"/><text x="32" y="37" text-anchor="middle" class="anel-t">${fmt(v,0)}</text></svg>`;
}

let avSeq = 0;
function avatar(nome, cor, tam=44){
  const ini = (nome||'?').split(/\s+/).filter(Boolean).map(w=>w[0]).slice(0,2).join('').toUpperCase();
  const id = 'cav'+(avSeq++);
  return `<svg class="avatar" width="${tam}" height="${tam}" viewBox="0 0 48 48" aria-hidden="true"><defs><clipPath id="${id}"><circle cx="24" cy="24" r="23"/></clipPath></defs><circle cx="24" cy="24" r="23" fill="var(--s3)"/><g clip-path="url(#${id})"><path d="M0 36 L36 0 L48 0 L48 6 L6 48 L0 48 Z" fill="var(--yel)" opacity=".9"/><path d="M6 48 L48 6 L48 12 L12 48 Z" fill="var(--red)"/></g><circle cx="24" cy="24" r="23" fill="none" stroke="${cor||'var(--yel)'}" stroke-width="2"/><text x="24" y="29" text-anchor="middle" class="av-t">${esc(ini)}</text></svg>`;
}

function chips(efs){
  if (!efs||!efs.length) return '';
  return `<ul class="fx">${efs.map(e=>{
    if (e.livre||e.txt) return `<li class="fx-txt">${esc(e.txt)}</li>`;
    const ruim=['Inflação','Dólar','Gasto extra','Desemprego','Tendência da pobreza','Tendência de homicídios','Tendência do desmatamento'].includes(e.lbl);
    let bom=e.v>0; if (ruim) bom=!bom; if (e.lbl==='Gasto extra') bom=false;
    const val=(Math.abs(e.v)<1&&e.v!==0)?fmt(e.v,2):fmt(e.v,Number.isInteger(e.v)?0:1);
    return `<li class="${bom?'pos':'neg'}"><span>${esc(e.lbl)}</span><b>${e.v>0?'+':''}${val}${e.suf||''}</b></li>`;
  }).join('')}</ul>`;
}

function reacoes(efs, fx){
  let a=(fx&&fx.aprov)||0;
  efs.forEach(e=>{ if (e.lbl==='Aprovação') a=e.v; });
  const pega=arr=>arr[Math.floor(Math.random()*arr.length)];
  let posts;
  if (a>0) posts=[pega(REACOES.pos), pega(REACOES.neu)];
  else if (a<0){ const x=pega(REACOES.neg); posts=[x, pega(REACOES.neg.filter(y=>y!==x))]; }
  else posts=[pega(REACOES.pos), pega(REACOES.neg)];
  return `<div class="rede"><p class="rede-t">Nas redes</p>${posts.map(([u,t])=>`<div class="post"><b>${u}</b><p>${esc(t)}</p><small>${rint(2,48)} mil curtidas</small></div>`).join('')}</div>`;
}

// ---------- tela inicial ----------
function renderInicio(){
  app.innerHTML = `
  <section class="capa">
    <div class="faixa-deco" aria-hidden="true"><span></span><span></span></div>
    <p class="capa-ano">Brasil · 2027 — 2030</p>
    <h1 class="logo">A FAIXA</h1>
    <p class="capa-sub">Você ganhou a eleição. Agora governe.<br>4 anos, 513 deputados e uma caneta.</p>
    <div class="capa-bt">
      <button class="btn-g yel" data-a="novo">Começar mandato</button>
      ${temSave()?`<button class="btn-g out" data-a="continuar">Continuar governo</button>`:''}
    </div>
    <ul class="capa-lista">
      <li><b>48</b><span>meses de mandato</span></li>
      <li><b>33</b><span>projetos para votar</span></li>
      <li><b>60+</b><span>crises e decisões</span></li>
      <li><b>${CARIMBOS.length}</b><span>carimbos para colecionar</span></li>
    </ul>
    <p class="capa-nota">Bancadas e economia de partida com base em dados reais de 2026 (eleições, Boletim Focus, IBGE). Personagens fictícios.</p>
  </section>`;
}

// ---------- configuração ----------
function novoSetup(){
  SET = { passo:0, pres:{ nome:'', idade:56, uf:'MG', bg:'economista', e:2.5, s:2 }, modo:'existente', partido:'PSD',
    novo:{ nome:'Movimento Brasil Novo', sigla:'MBN', cor:'#E3262E' }, coalizao:[], vice:null, viceOps:[], cands:{}, esc:{}, promessas:[], dificuldade:'normal', ok:'' };
}
const partidoSetup = ()=> SET.modo==='novo' ? (SET.novo.sigla.trim()||'NOVO') : SET.partido;
function aceitacao(p){ const d=Math.hypot(p.e-SET.pres.e, p.s-SET.pres.s); const sc=1-d/12+p.fis*0.5; return sc>=0.62?'aceita':sc>=0.3?'exige':'recusa'; }
function partidosSetup(){ const l=PARTIDOS.map(p=>({...p})); if (SET.modo==='novo') l.push({ id:partidoSetup(), nome:SET.novo.nome, cor:SET.novo.cor, dep:18, sen:2, e:SET.pres.e, s:SET.pres.s, fis:0.3 }); return l; }
const rotE = v=> v<=-6?'Esquerda':v<=-2?'Centro-esquerda':v<2?'Centro':v<6?'Centro-direita':'Direita';
const rotS = v=> v<=-6?'Muito progressista':v<=-2?'Progressista':v<2?'Moderado':v<6?'Conservador':'Muito conservador';

function renderSetup(){
  const titulos=['Quem é você?','Seu partido','Monte sua base','Seu ministério','Suas promessas'];
  const p=SET.passo;
  const corpo=[setupIdentidade,setupPartido,setupCoalizao,setupMinisterios,setupPromessas][p]();
  app.innerHTML = `
  <div class="setup">
    <header class="st-h">
      <button class="ic-bt" data-a="${p>0?'voltar':'sair'}" aria-label="Voltar">${icon('voltar')}</button>
      <div class="st-dots">${titulos.map((_,i)=>`<i class="${i<=p?'on':''}"></i>`).join('')}</div>
      <span class="st-n">${p+1}/5</span>
    </header>
    <h2 class="st-t">${titulos[p]}</h2>
    <div class="st-c">${corpo}</div>
    <footer class="st-f">
      ${SET.ok?`<p class="st-msg" role="status">${esc(SET.ok)}</p>`:''}
      <button class="btn-g yel" data-a="avancar">${p===4?'Subir a rampa':'Continuar'}</button>
    </footer>
  </div>`;
}

function setupIdentidade(){
  return `<label class="campo"><span>Nome de urna</span><input id="f-nome" value="${esc(SET.pres.nome)}" placeholder="Ex.: Helena Damasceno" maxlength="32" autocomplete="off"></label>
  <div class="duo">
    <label class="campo"><span>Idade</span><input id="f-idade" type="number" inputmode="numeric" min="35" max="85" value="${SET.pres.idade}"></label>
    <label class="campo"><span>Estado</span><select id="f-uf">${ESTADOS.slice().sort((a,b)=>a.nome.localeCompare(b.nome)).map(e=>`<option value="${e.uf}" ${e.uf===SET.pres.uf?'selected':''}>${e.nome}</option>`).join('')}</select></label>
  </div>
  <p class="rot">Sua trajetória</p>
  <div class="tiles">${BACKGROUNDS.map(b=>`<button class="tile ${SET.pres.bg===b.id?'sel':''}" data-a="bg" data-v="${b.id}"><b>${b.nome}</b><small>${b.desc}</small></button>`).join('')}</div>`;
}

function setupPartido(){
  const lista=PARTIDOS.slice().sort((a,b)=>b.dep-a.dep);
  return `<div class="seg"><button class="${SET.modo==='existente'?'sel':''}" data-a="modo" data-v="existente">Partido existente</button><button class="${SET.modo==='novo'?'sel':''}" data-a="modo" data-v="novo">Fundar partido</button></div>
  ${SET.modo==='existente'?`<div class="plist">${lista.map(p=>`<button class="prow ${SET.partido===p.id?'sel':''}" data-a="partido" data-v="${p.id}"><i style="background:${p.cor}"></i><span><b>${p.id}</b><small>${p.nome}</small></span><em>${p.dep}<small>dep</small></em></button>`).join('')}</div>`
  :`<label class="campo"><span>Nome do partido</span><input id="f-pnome" value="${esc(SET.novo.nome)}" maxlength="44"></label>
    <div class="duo"><label class="campo"><span>Sigla</span><input id="f-psigla" value="${esc(SET.novo.sigla)}" maxlength="10"></label>
    <div class="campo"><span>Cor</span><div class="cores">${['#E3262E','#FFC629','#F07A1A','#2F6FE0','#8E3BD6','#18A37A','#E8E2D0','#C2185B'].map(c=>`<button class="cor ${SET.novo.cor===c?'sel':''}" style="background:${c}" data-a="cor" data-v="${c}" aria-label="Cor"></button>`).join('')}</div></div></div>
    <p class="dica">Partido novo: cerca de 18 deputados e 2 senadores fiéis, que migram de legendas próximas.</p>`}
  <p class="rot">Sua posição política</p>
  <label class="campo slider"><span>Economia · <b id="l-e">${rotE(SET.pres.e)}</b></span><input id="f-e" type="range" min="-10" max="10" step="0.5" value="${SET.pres.e}"><span class="escala"><i>Estado forte</i><i>Livre mercado</i></span></label>
  <label class="campo slider"><span>Costumes · <b id="l-s">${rotS(SET.pres.s)}</b></span><input id="f-s" type="range" min="-10" max="10" step="0.5" value="${SET.pres.s}"><span class="escala"><i>Progressista</i><i>Conservador</i></span></label>`;
}

function setupCoalizao(){
  const lista=partidosSetup(), own=partidoSetup();
  if (!SET.coalizao.includes(own)) SET.coalizao.unshift(own);
  const sel=lista.filter(p=>SET.coalizao.includes(p.id));
  const dep=sel.reduce((a,p)=>a+p.dep,0), sen=sel.reduce((a,p)=>a+p.sen,0);
  const vk=SET.coalizao.join(',');
  if (SET._vk!==vk||!SET.viceOps.length){ SET._vk=vk; const pool=SET.coalizao.filter(x=>x!==own); const ps=pool.length?pool:[own];
    SET.viceOps=[0,1,2].map(i=>{ const n=gerarNome(); return { ...n, partido:ps[i%ps.length], cargo:pick(PERFIS_MIN.politico).split('|')[n.gen==='f'?1:0] }; }); SET.vice=SET.viceOps[0]; }
  const ord=lista.slice().sort((a,b)=>a.e-b.e);
  const cores=[]; ord.forEach(p=>{ const c=SET.coalizao.includes(p.id)?p.cor:'var(--off)'; for(let i=0;i<p.dep;i++) cores.push(c); });
  return `<div class="placa">
    ${hemiciclo(cores,9,{centro:dep, sub:'DEPUTADOS NA BASE'})}
    <div class="metas"><div class="${dep>=257?'ok':''}"><b>257</b><span>maioria</span></div><div class="${dep>=308?'ok':''}"><b>308</b><span>muda a Constituição</span></div><div class="${sen>=41?'ok':''}"><b>${sen}/81</b><span>senadores</span></div></div>
  </div>
  <p class="dica">Toque nos partidos para convidá-los. Quanto mais longe da sua ideologia, mais cargos eles exigem.</p>
  <div class="pgrid">${ord.map(p=>{ const a=p.id===own?'own':aceitacao(p); const on=SET.coalizao.includes(p.id);
    return `<button class="pchip ${on?'sel':''} ${a}" data-a="coal" data-v="${p.id}" ${a==='recusa'||a==='own'?'disabled':''} style="--pc:${p.cor}"><b>${p.id}</b><span>${p.dep} dep</span><em>${a==='own'?'seu':a==='aceita'?'topa':a==='exige'?'quer cargos':'recusa'}</em></button>`; }).join('')}</div>
  <p class="rot">Vice-presidente</p>
  <div class="tiles">${SET.viceOps.map((v,i)=>`<button class="tile row ${SET.vice===v?'sel':''}" data-a="vice" data-v="${i}">${avatar(v.nome,(lista.find(p=>p.id===v.partido)||{}).cor,40)}<span><b>${esc(v.nome)}</b><small>${v.partido} · ${v.cargo}</small></span></button>`).join('')}</div>`;
}

function setupMinisterios(){
  SETUP_PARTIDO=partidoSetup();
  const chave=SET.coalizao.join(',');
  if (SET._chave!==chave){ SET._chave=chave; SET.cands={}; SET.esc={}; MINISTERIOS.forEach((m,i)=>{ SET.cands[m.id]=candidatosMinisterio(m.id,SET.coalizao,SETUP_PARTIDO); SET.esc[m.id]=[0,2,1,3][i%4]; }); }
  const tot={}; let W=0; MINISTERIOS.forEach(m=>{ W+=m.peso; const c=SET.cands[m.id][SET.esc[m.id]]; const k=c.partido||'Técnicos'; tot[k]=(tot[k]||0)+m.peso; });
  const lp=partidosSetup();
  return `<p class="dica">Deslize para o lado e toque para escolher. <b>C</b> competência · <b>L</b> lealdade · <b>I</b> integridade. Aliados sem cargo votam menos com você.</p>
  <div class="partilha">${Object.entries(tot).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`<span><i style="background:${(lp.find(p=>p.id===k)||{cor:'var(--muted)'}).cor}"></i>${k} ${Math.round(v/W*100)}%</span>`).join('')}</div>
  ${MINISTERIOS.map(m=>`<section class="minbloco"><h3>${m.nome} <small>${'★'.repeat(m.peso)}</small></h3>
    <div class="carrossel">${SET.cands[m.id].map((c,i)=>`<button class="ccard ${SET.esc[m.id]===i?'sel':''}" data-a="cand" data-v="${m.id}:${i}"><span class="cc-p" style="--pc:${c.partido?(lp.find(p=>p.id===c.partido)||{}).cor:'var(--muted)'}">${c.partido||'Técnic'+(c.gen==='f'?'a':'o')}</span><b>${esc(c.nome)}</b><small>${esc(c.desc)}</small><span class="stats"><i>C ${c.comp}</i><i>L ${c.leal}</i><i>I ${c.integ}</i></span></button>`).join('')}</div></section>`).join('')}`;
}

function setupPromessas(){
  return `<p class="dica">Escolha 3. Cumpri-las ajuda na reeleição e na nota final.</p>
  <div class="tiles">${PROMESSAS.map(p=>`<button class="tile row ${SET.promessas.includes(p.id)?'sel':''}" data-a="prom" data-v="${p.id}"><span class="chk">${SET.promessas.includes(p.id)?'✓':''}</span><b>${p.txt}</b></button>`).join('')}</div>
  <p class="rot">Dificuldade</p>
  <div class="tiles">${[['facil','Lua de mel','Mais agenda e mercado amigável'],['normal','Realista','O Brasil como ele é'],['dificil','Tempestade perfeita','Mais crises, mercado nervoso · nota +10%']].map(([k,n,d])=>`<button class="tile row ${SET.dificuldade===k?'sel':''}" data-a="dif" data-v="${k}"><span><b>${n}</b><small>${d}</small></span></button>`).join('')}</div>`;
}

function lerCamposSetup(){
  const g=id=>document.getElementById(id);
  if (g('f-nome')) SET.pres.nome=g('f-nome').value.trim();
  if (g('f-idade')) SET.pres.idade=clamp(+g('f-idade').value||56,35,85);
  if (g('f-uf')) SET.pres.uf=g('f-uf').value;
  if (g('f-pnome')) SET.novo.nome=g('f-pnome').value.trim();
  if (g('f-psigla')) SET.novo.sigla=g('f-psigla').value.trim().replace(/\s+/g,'').toUpperCase();
  if (g('f-e')) SET.pres.e=+g('f-e').value;
  if (g('f-s')) SET.pres.s=+g('f-s').value;
}

function avancarSetup(){
  lerCamposSetup(); SET.ok='';
  if (SET.passo===0 && !SET.pres.nome){ SET.ok='Escreva o nome do presidente.'; return renderSetup(); }
  if (SET.passo===1){
    if (SET.modo==='novo'){
      if (!SET.novo.nome||!SET.novo.sigla){ SET.ok='Dê nome e sigla ao partido.'; return renderSetup(); }
      if (PARTIDOS.some(p=>p.id.toLowerCase()===SET.novo.sigla.toLowerCase())){ SET.ok='Essa sigla já existe.'; return renderSetup(); }
    }
    SET.coalizao=SET.coalizao.filter(id=>{ const p=partidosSetup().find(x=>x.id===id); return p&&(id===partidoSetup()||aceitacao(p)!=='recusa'); });
    SET.viceOps=[];
  }
  if (SET.passo===4){ if (SET.promessas.length!==3){ SET.ok='Escolha exatamente 3 promessas.'; return renderSetup(); } return iniciarJogo(); }
  SET.passo++; renderSetup(); window.scrollTo(0,0);
}

function iniciarJogo(){
  const own=partidoSetup();
  const ministros={}; MINISTERIOS.forEach(m=>ministros[m.id]={...SET.cands[m.id][SET.esc[m.id]], desde:0});
  novoEstado({ pres:{...SET.pres, partido:own}, vice:SET.vice, coalizao:SET.coalizao, ministros, promessas:SET.promessas, dificuldade:SET.dificuldade,
    novoPartido: SET.modo==='novo'?{ nome:SET.novo.nome, sigla:own, cor:SET.novo.cor }:null });
  S.carimbos=[];
  S.partidos.forEach(p=>{ if (S.coalizao.includes(p.id)&&p.id!==own){ const sc=1-dist(p,S.pres)/12+p.fis*0.5; if (sc<0.62) p.sat-=10; } });
  salvar(); tela='jogo'; aba='inicio'; modalMin=false; render(); window.scrollTo(0,0);
}

// ---------- jogo ----------
const NAV=[['inicio','Gabinete'],['congresso','Congresso'],['acoes','Ações'],['brasil','Brasil'],['equipe','Equipe']];

function delta(k){ const h=S.hist[k]; return h.length>1? h[h.length-1]-h[h.length-2] : 0; }
function seta(d,inv){ if (Math.abs(d)<0.005) return ''; const bom=inv? d<0 : d>0; return `<i class="dl ${bom?'up':'dn'}">${d>0?'▲':'▼'}</i>`; }

function renderJogo(){
  const e=S.eco, pend=S.pendentes.length, own=P(S.pres.partido);
  app.innerHTML = `
  <header class="hud">
    <div class="hud-l1">
      <span class="data-chip"><b>${MESES[S.t%12].slice(0,3).toUpperCase()}</b> ${2027+Math.floor(S.t/12)}</span>
      <span class="trilho" aria-label="Mês ${S.t+1} de 48"><span style="width:${(S.t+1)/48*100}%"></span></span>
      <span class="mes-n">${S.t+1}/48</span>
      <button class="ic-bt" data-a="menu" aria-label="Menu">${icon('menu')}</button>
    </div>
    <div class="hud-l2">
      ${anel(S.aprov,62)}
      <div class="hud-id">
        <b>${esc(S.pres.nome)}</b>
        <span><i style="background:${own.cor}"></i>${own.id} · aprovação ${seta(delta('aprov'))}</span>
        <span class="energia" aria-label="${S.ap} pontos de agenda">${Array.from({length:apMax()},(_,i)=>`<svg viewBox="0 0 24 24" class="${i<S.ap?'on':''}">${IC.acoes}</svg>`).join('')}<small>agenda</small></span>
      </div>
    </div>
    <div class="hud-l3">
      <div class="st ${tom(e.pib,2.5,1)}"><small>PIB</small><b>${fmtPct(e.pib)}</b>${seta(delta('pib'))}</div>
      <div class="st ${tom(e.ipca,4.5,6,true)}"><small>Inflação</small><b>${fmt(e.ipca)}%</b>${seta(delta('ipca'),true)}</div>
      <div class="st ${tom(e.desemp,6,8.5,true)}"><small>Desemprego</small><b>${fmt(e.desemp)}%</b>${seta(delta('desemp'),true)}</div>
      <div class="st ${S.baseCamara>=308?'ok':S.baseCamara>=257?'mid':'bad'}"><small>Base</small><b>${S.baseCamara}</b>${seta(delta('base'))}</div>
    </div>
  </header>
  <main class="tela">${({inicio:abaInicio, congresso:abaCongresso, acoes:abaAcoes, brasil:abaBrasil, equipe:abaEquipe})[aba]()}</main>
  <div class="cta">${pend?`<button class="btn-g red" data-a="abrirpend">Decidir agora <span class="badge">${pend}</span></button>`:`<button class="btn-g yel" data-a="encerrar">Próximo mês ▸</button>`}</div>
  <nav class="nav">${NAV.map(([k,n])=>`<button class="${aba===k?'at':''}" data-a="aba" data-v="${k}" aria-current="${aba===k?'page':'false'}">${icon(k)}<span>${n}</span></button>`).join('')}</nav>`;
  if (pend && !modalMin) abrirPendente(); else if (!pend) fecharModal();
  mostrarCarimbos();
}

function tomMapa(v){ return v>=56?'var(--yel)':v>=48?'#C9921A':v>=40?'var(--s3)':v>=32?'#9B1D22':'var(--red)'; }

function abaInicio(){
  const prom=S.promessas.map(id=>PROMESSAS.find(p=>p.id===id));
  const pend=S.pendentes.length;
  return `
  ${pend?`<button class="alerta" data-a="abrirpend"><b>${pend} decis${pend>1?'ões':'ão'} na sua mesa</b><span>O país espera. Toque para decidir.</span></button>`:''}
  <section class="card">
    <h3 class="ct">Mapa da aprovação</h3>
    <div class="mapa">${ESTADOS.map(e=>{ const a=aprovUF(e.uf); return `<button class="uf ${a>=48?'alto':''}" style="grid-row:${e.r+1};grid-column:${e.c+1};background:${tomMapa(a)}" data-a="acao-visita" data-v="${e.uf}" aria-label="${e.nome}: ${fmt(a,0)}%"><b>${e.uf}</b><small>${fmt(a,0)}</small></button>`; }).join('')}</div>
    <p class="dica c">Toque num estado para visitá-lo (1 ${RAIO})</p>
  </section>
  <section class="card">
    <h3 class="ct">Promessas de campanha</h3>
    <ul class="proms">${prom.map(p=>{ const ok=p.chk(S); return `<li class="${ok?'ok':''}"><span class="chk">${ok?'✓':''}</span>${p.txt}</li>`; }).join('')}</ul>
  </section>
  <section class="card">
    <h3 class="ct">Aprovação do governo</h3>
    ${spark(S.hist.aprov,{h:90,ref:50,min:20,max:70})}
    <div class="leg"><span>${dataCurta(0)}</span><span>— 50%</span><span>${dataCurta(Math.max(0,S.hist.aprov.length-1))}</span></div>
  </section>
  <section class="card jornal">
    <h3 class="ct">Manchetes</h3>
    <ul class="news">${S.log.slice(0,6).map(l=>`<li><span class="tag">${l.cat}</span><p>${esc(l.txt)}</p><small>${dataCurta(l.t)}</small></li>`).join('')}</ul>
    <button class="lnk" data-a="diario">Ver diário completo</button>
  </section>
  <section class="card">
    <h3 class="ct">Carimbos <small>${(S.carimbos||[]).length}/${CARIMBOS.length}</small></h3>
    <div class="carimbos">${CARIMBOS.map(c=>{ const on=(S.carimbos||[]).includes(c.id); return `<div class="carimbo ${on?'on':''}"><b>${on?esc(c.nome):'???'}</b><small>${esc(c.desc)}</small></div>`; }).join('')}</div>
  </section>`;
}

function previsao(def){
  let c=0,s=0; S.partidos.forEach(p=>{ c+=p.dep*0.925*probVoto(p,def,'camara'); s+=p.sen*0.95*probVoto(p,def,'senado'); });
  c=Math.round(c); s=Math.round(s);
  const nc=def.tipo==='PEC'?308:def.tipo==='PLP'?257:Math.round(513*0.925/2)+1, ns=def.tipo==='PEC'?49:def.tipo==='PLP'?41:39;
  const m=Math.min((c-nc)/40,(s-ns)/6);
  return { c, s, nc, ns, chance: m>0.6?'alta':m>-0.1?'incerta':'baixa' };
}

function abaCongresso(){
  const ord=S.partidos.slice().sort((a,b)=>a.e-b.e);
  const cores=[]; ord.forEach(p=>{ const on=S.coalizao.includes(p.id); for(let i=0;i<p.dep;i++) cores.push(on?p.cor:'var(--off)'); });
  const disp=PROJETOS.filter(p=>!S.aprovadas.includes(p.id)&&!S.projetos.some(x=>x.id===p.id)&&!(S.rejeitadas[p.id]!=null&&S.t-S.rejeitadas[p.id]<6))
    .filter(p=>filtroProj==='todos'||(CAT_PROJ[filtroProj]||[]).includes(p.id));
  const cats=[['todos','Todos'],['economia','Economia'],['social','Social'],['seguranca','Segurança'],['ambiente','Ambiente'],['instituicoes','Instituições']];
  return `
  <section class="card placa">
    ${hemiciclo(cores,11,{centro:S.baseCamara, sub:'DEPUTADOS FIÉIS'})}
    <div class="metas"><div class="${S.baseCamara>=257?'ok':''}"><b>257</b><span>maioria absoluta</span></div><div class="${S.baseCamara>=308?'ok':''}"><b>308</b><span>PEC</span></div><div class="${S.baseSenado>=49?'ok':''}"><b>${S.baseSenado}/81</b><span>senado fiel</span></div></div>
    <p class="dica c">Boa vontade da presidência da Câmara: ${fmt(S.presCamara,0)}/100</p>
  </section>
  ${S.projetos.length?`<h3 class="sec">Em votação</h3>${S.projetos.map(t=>{ const d=PROJETOS.find(p=>p.id===t.id); const pv=previsao({...d,artic:t.artic});
    return `<article class="proj tr"><header><span class="tag ${t.mp?'red':'yel'}">${t.mp?'MP':d.tipo}</span><b>${d.nome}</b></header>
    <div class="prev"><span>Vota em <b>${t.restante}</b> ${t.restante>1?'meses':'mês'}</span><span class="ch ${pv.chance}">chance ${pv.chance}</span></div>
    <div class="termo"><span style="width:${clamp(pv.c/513*100,0,100)}%"></span><i style="left:${pv.nc/513*100}%"></i></div>
    <small class="dica">~${pv.c} votos previstos de ${pv.nc} necessários · articulação ${'●'.repeat(t.artic)}${'○'.repeat(3-t.artic)}</small>
    ${t.artic<3?`<button class="btn-s" data-a="articular" data-v="${t.id}" ${S.ap<1?'disabled':''}>Articular votos · 1 ${RAIO}</button>`:''}</article>`; }).join('')}`:''}
  <h3 class="sec">Mandar ao Congresso</h3>
  <div class="filtros">${cats.map(([k,n])=>`<button class="${filtroProj===k?'sel':''}" data-a="filtro" data-v="${k}">${n}</button>`).join('')}</div>
  ${disp.map(d=>{ const pv=previsao({...d,artic:0});
    return `<article class="proj"><header><span class="tag">${d.tipo}</span><b>${d.nome}</b></header><p>${d.desc}</p>
    <div class="prev"><span>${rotE(d.e)} · ${d.tram} meses</span><span class="ch ${pv.chance}">chance ${pv.chance}</span></div>
    <div class="bts"><button class="btn-s yel" data-a="propor" data-v="${d.id}" ${S.ap<1?'disabled':''}>Enviar ${d.tipo} · 1 ${RAIO}</button>${d.mp?`<button class="btn-s" data-a="mp" data-v="${d.id}" ${S.ap<1?'disabled':''}>Medida Provisória</button>`:''}</div></article>`; }).join('')||'<p class="dica">Nada nesta categoria agora.</p>'}
  <h3 class="sec">Partidos</h3>
  <section class="card">${S.partidos.slice().sort((a,b)=>b.dep-a.dep).map(p=>{ const on=S.coalizao.includes(p.id), own=p.id===S.pres.partido;
    return `<div class="partido ${on?'on':''}" style="--pc:${p.cor}"><div class="pt-n"><b>${p.id}</b><small>${p.dep} dep · ${p.sen} sen · ${own?'seu partido':on?'base':'fora'}</small></div>${barra(p.sat)}
    ${own?'<span></span>':`<div class="pt-bt"><button class="btn-s" data-a="acao-cafe" data-v="${p.id}" ${S.ap<1?'disabled':''}>${on?'Agradar':'Convidar'}</button>${on?`<button class="btn-s ghost" data-a="romper" data-v="${p.id}" aria-label="Romper com ${p.id}">✕</button>`:''}</div>`}</div>`; }).join('')}</section>
  ${S.aprovadas.length?`<h3 class="sec">Leis do seu governo</h3><section class="card"><ul class="leis">${S.aprovadas.map(id=>`<li>${PROJETOS.find(p=>p.id===id).nome}</li>`).join('')}</ul></section>`:''}`;
}

function abaAcoes(){
  return `<p class="dica">Você tem <b>${S.ap}</b> ${RAIO} de agenda este mês. Eles recarregam no próximo mês.</p>
  <div class="acoes">${ACOES.map(a=>`<button class="acao" data-a="acao-${a.id}" ${S.ap<a.custo?'disabled':''}>${icon(a.id,'big')}<b>${a.nome}</b><small>${a.desc}</small><span class="custo">${RAIO.repeat(a.custo)}</span></button>`).join('')}</div>`;
}

function abaBrasil(){
  const subs=[['economia','Economia'],['sociedade','Sociedade'],['mundo','Mundo'],['grupos','Grupos']];
  let c='';
  const e=S.eco, h=S.hist;
  if (subBrasil==='economia'){
    const prox=(()=>{ for(let k=0;k<12;k++){ const t=S.t+k; if (COPOM.includes(t%12)) return dataTurno(t); } return '-'; })();
    const g=(t,s,v,o={})=>`<section class="card graf"><div class="gh"><span>${t}</span><b>${v}</b></div>${spark(s,{h:64,...o})}${o.nota?`<small class="dica">${o.nota}</small>`:''}</section>`;
    c = g('PIB — crescimento',h.pib,fmtPct(e.pib),{ref:2})
      + g('Inflação (IPCA 12m)',h.ipca,fmt(e.ipca)+'%',{ref:3,nota:'Meta 3% · teto 4,5%'})
      + g('Selic',h.selic,fmt(e.selic,2)+'%',{nota:`Próximo Copom: ${prox}`})
      + g('Desemprego',h.desemp,fmt(e.desemp)+'%')
      + g('Dólar',h.dolar,'R$ '+fmt(e.dolar,2))
      + g('Dívida bruta',h.divida,fmt(e.divida)+'% do PIB')
      + g('Resultado primário',h.primario,fmtPct(e.primario??e.primStruct,2),{ref:e.meta,nota:`Meta fiscal ${fmtPct(e.meta,2)} do PIB`})
      + g('Confiança do mercado',h.conf,fmt(e.conf,0)+'/100');
  }
  if (subBrasil==='sociedade'){
    const s=S.soc;
    const ind=(t,v,n,k)=>`<div class="ind ${k}"><small>${t}</small><b>${v}</b><span>${n}</span></div>`;
    c=`<section class="card"><div class="inds">
      ${ind('Pobreza',fmt(s.pobreza)+'%','da população',tom(s.pobreza,20,26,true))}
      ${ind('Homicídios',fmt(s.homic),'por 100 mil hab.',tom(s.homic,17,22,true))}
      ${ind('Desmatamento',Math.round(s.desmat).toLocaleString('pt-BR'),'km² por ano',tom(s.desmat,4000,7000,true))}
      ${ind('Salário mínimo','R$ '+s.salmin.toLocaleString('pt-BR'),'por mês','mid')}
      ${ind('Saúde',fmt(s.saude,0),'de 100',tom(s.saude,60,48))}
      ${ind('Educação',fmt(s.educ,0),'de 100',tom(s.educ,58,46))}
      ${ind('Infraestrutura',fmt(s.infra,0),'de 100',tom(s.infra,55,40))}
      ${ind('STF',fmt(S.stf,0),'relação de 100',tom(S.stf,60,40))}
    </div></section>
    <section class="card"><h3 class="ct">Regiões</h3>${Object.keys(REGIOES).map(r=>`<div class="linha"><span>${REGIOES[r]}</span>${barra(aprovRegiao(r))}<b>${fmt(aprovRegiao(r),0)}%</b></div>`).join('')}</section>`;
  }
  if (subBrasil==='mundo'){
    c=`<p class="dica">Viagem de Estado custa 2 ${RAIO} e pode render acordo comercial.</p><section class="card">${PAISES.map(p=>`<div class="linha pais"><span><b>${p.nome}</b><small>${p.bloco} · ${Math.round(p.comercio*100)}% do comércio · ${fmt(S.rel[p.id],0)}/100</small></span>${barra(S.rel[p.id])}<button class="btn-s" data-a="viagem" data-v="${p.id}" ${S.ap<2?'disabled':''}>Visitar</button></div>`).join('')}</section>`;
  }
  if (subBrasil==='grupos'){
    c=`<p class="dica">Reunir um grupo custa 1 ${RAIO}. Agradar um lado pode irritar o outro.</p><section class="card">${GRUPOS.map(g=>`<div class="linha pais"><span><b>${g.nome}</b><small>${fmt(S.grp[g.id],0)}/100</small></span>${barra(S.grp[g.id])}<button class="btn-s" data-a="reuniao" data-v="${g.id}" ${S.ap<1?'disabled':''}>Reunir</button></div>`).join('')}</section>`;
  }
  return `<div class="seg full">${subs.map(([k,n])=>`<button class="${subBrasil===k?'sel':''}" data-a="sub" data-v="${k}">${n}</button>`).join('')}</div>${c}`;
}

function abaEquipe(){
  return `<section class="card vice">${avatar(S.vice?S.vice.nome:'?',(P(S.vice&&S.vice.partido)||{}).cor,44)}<span><small>Vice-presidente</small><b>${esc(S.vice?S.vice.nome:'—')}</b><small>${S.vice?S.vice.partido:''}</small></span></section>
  <p class="dica">Toque num ministro para ver detalhes. Trocar custa 1 ${RAIO}; o partido que perde a pasta se irrita.</p>
  ${MINISTERIOS.map(m=>{ const mi=S.ministros[m.id]; const p=mi.partido?P(mi.partido):null; const c=compMin(m.id); const ab=minAberto===m.id;
    return `<article class="mrow ${ab?'ab':''}"><button class="mrow-h" data-a="minab" data-v="${m.id}">${avatar(mi.nome,p?p.cor:'var(--muted)',40)}<span><small>${m.nome}</small><b>${esc(mi.nome)}</b></span><em class="${c>0.3?'ok':c<0?'bad':'mid'}">${c>0.3?'Forte':c<0?'Fraco':'Regular'}</em></button>
    ${ab?`<div class="mrow-d"><p>${esc(mi.desc)} · ${mi.partido||'sem partido'} · desde ${dataCurta(mi.desde||0)}</p>
      <div class="linha"><span>Competência</span>${barra(mi.comp)}<b>${mi.comp}</b></div>
      <div class="linha"><span>Lealdade</span>${barra(mi.leal)}<b>${mi.leal}</b></div>
      <div class="linha"><span>Integridade</span>${barra(mi.integ)}<b>${mi.integ}</b></div>
      <button class="btn-s yel" data-a="trocar" data-v="${m.id}" ${S.ap<1?'disabled':''}>Trocar ministro · 1 ${RAIO}</button></div>`:''}</article>`; }).join('')}`;
}

// ---------- folhas (modais) ----------
function abrirModal(html, cls=''){ modalCard.className='sheet '+cls; modalCard.innerHTML=html; modal.hidden=false; modalCard.scrollTop=0; const b=modalCard.querySelector('button'); if (b) b.focus({preventScroll:true}); }
function fecharModal(){ modal.hidden=true; }

function abrirPendente(){
  const ref=S.pendentes[0]; if (!ref) return fecharModal();
  if (eventoResultado) return mostrarResultado();
  if (ref.tipo==='resumo') return mostrarResumo(ref);
  if (ref.tipo==='voto') return mostrarVoto(ref.voto);
  if (ref.tipo==='eleicao') return mostrarEleicao(ref.r);
  const ev=getEvento(ref);
  if (!ev){ S.pendentes.shift(); return render(); }
  const texto=typeof ev.texto==='function'?ev.texto(S):ev.texto;
  const crise=['Escândalo','Crise','Desastre'].includes(ev.cat);
  abrirModal(`<div class="ev">
    <div class="ev-top"><span class="tag ${crise?'red':'yel'}">${ev.cat}</span><span>${dataTurno(S.t)}</span></div>
    <h2 class="ev-t">${esc(ev.titulo)}</h2>
    <p class="ev-x">${esc(texto)}</p>
    <div class="ops">${ev.opcoes.map((o,i)=>`<button class="op" data-a="opcao" data-v="${i}"><span class="op-l">${'ABCD'[i]}</span><span>${esc(o.txt)}</span></button>`).join('')}</div>
    <button class="lnk c" data-a="minimizar">Olhar o painel antes</button></div>`, crise?'crise':'');
}

function escolherOpcao(i){
  const ref=S.pendentes[0]; const ev=getEvento(ref); const op=ev.opcoes[i];
  const efs=applyFx(op.fx);
  logar(ev.cat, `${ev.titulo}: ${op.txt}.`);
  eventoResultado={ titulo:ev.titulo, escolha:op.txt, res:op.res, efs, rede:reacoes(efs, op.fx) };
  calcBase(); mostrarResultado();
}
function mostrarResultado(){
  const r=eventoResultado;
  abrirModal(`<div class="ev"><div class="ev-top"><span class="tag yel">Decidido</span></div><h2 class="ev-t sm">${esc(r.titulo)}</h2>
    <div class="despacho"><small>Despacho do presidente</small><p>${esc(r.escolha)}</p></div>
    ${r.res?`<p class="ev-x">${esc(r.res)}</p>`:''}${chips(r.efs)}${r.rede}
    <button class="btn-g yel" data-a="continuar-ev">Continuar</button></div>`);
}

function mostrarResumo(ref){
  const h=S.hist, L=h.aprov.length;
  const row=(n,k,f,inv)=>{ const a=h[k][L-1], b=h[k][L-2]??a, d=a-b; const bom=inv?d<0:d>0; return `<div class="rs-r"><span>${n}</span><b>${f(a)}</b><em class="${Math.abs(d)<0.005?'':bom?'up':'dn'}">${Math.abs(d)<0.005?'=':(d>0?'▲ ':'▼ ')+fmt(Math.abs(d),Math.abs(d)<1?2:1)}</em></div>`; };
  const manch=S.log.find(l=>l.t===ref.mes && !['Agenda','Carimbo'].includes(l.cat));
  abrirModal(`<div class="ev"><div class="ev-top"><span class="tag yel">Balanço do mês</span></div>
    <h2 class="ev-t">${MESES[ref.mes%12]} de ${2027+Math.floor(ref.mes/12)}</h2>
    <div class="rs">${row('Aprovação','aprov',v=>fmt(v,0)+'%')}${row('PIB','pib',v=>fmtPct(v))}${row('Inflação','ipca',v=>fmt(v)+'%',true)}${row('Selic','selic',v=>fmt(v,2)+'%',true)}${row('Desemprego','desemp',v=>fmt(v)+'%',true)}${row('Dólar','dolar',v=>'R$ '+fmt(v,2),true)}${row('Dívida','divida',v=>fmt(v)+'%',true)}${row('Base na Câmara','base',v=>v)}</div>
    ${manch?`<div class="despacho"><small>Manchete</small><p>${esc(manch.txt)}</p></div>`:''}
    <p class="ev-x c">Começa <b>${dataTurno(S.t)}</b>. Você tem ${S.ap} ${RAIO} de agenda.</p>
    <button class="btn-g yel" data-a="continuar-ev">${S.pendentes.length>1?`Ver ${S.pendentes.length-1} decis${S.pendentes.length>2?'ões':'ão'}`:'Ao trabalho'}</button></div>`);
}

function mostrarVoto(v){
  const casa=(nome,sim,nao,tot,nec,regra,ok)=>`<div class="placar"><div class="pl-h"><span>${nome}</span><small>${regra}</small></div>
    <div class="pl-n"><span class="sim"><b data-conta="${sim}">0</b><small>SIM</small></span><span class="nao"><b data-conta="${nao}">0</b><small>NÃO</small></span></div>
    <div class="pl-b"><span class="s" data-w="${sim/tot*100}"></span><span class="n" data-w="${nao/tot*100}"></span>${nec?`<i style="left:${nec/tot*100}%"></i>`:''}</div>
    <small class="dica">${nec?`Precisa de ${nec}`:'Maioria dos presentes'} · ${ok?'passou':'não passou'}</small></div>`;
  const nec=v.tipo==='PEC'?[308,49]:v.tipo==='PLP'?[257,41]:[0,0];
  abrirModal(`<div class="ev"><div class="ev-top"><span class="tag ${v.mp?'red':'yel'}">${v.mp?'Medida Provisória':v.tipo}</span><span>Plenário</span></div>
    <h2 class="ev-t sm">${esc(v.nome)}</h2>
    ${casa('Câmara',v.simC,v.naoC,513,nec[0],v.regraC,v.okC)}
    ${v.senado?casa('Senado',v.simS,v.naoS,81,nec[1],v.regraS,v.okS):''}
    <div class="carimbo-grande ${v.aprovado?'ok':'bad'}">${v.aprovado?'APROVADO':'REJEITADO'}</div>
    ${chips(v.efeitos)}
    <button class="btn-g yel" data-a="continuar-ev">Continuar</button></div>`, 'voto');
  animarPlacar();
}

function animarPlacar(){
  const nums=modalCard.querySelectorAll('[data-conta]'), bars=modalCard.querySelectorAll('[data-w]');
  if (reduzMov()){ nums.forEach(n=>n.textContent=n.dataset.conta); bars.forEach(b=>b.style.width=b.dataset.w+'%'); return; }
  requestAnimationFrame(()=>requestAnimationFrame(()=>bars.forEach(b=>b.style.width=b.dataset.w+'%')));
  const t0=performance.now(), dur=1200;
  const passo=t=>{ const k=Math.min(1,(t-t0)/dur), e=1-Math.pow(1-k,3); nums.forEach(n=>n.textContent=Math.round(n.dataset.conta*e)); if (k<1) requestAnimationFrame(passo); };
  requestAnimationFrame(passo);
  setTimeout(()=>{ nums.forEach(n=>n.textContent=n.dataset.conta); bars.forEach(b=>b.style.width=b.dataset.w+'%'); }, dur+200);
}

function mostrarEleicao(r){
  abrirModal(`<div class="ev"><div class="ev-top"><span class="tag yel">Eleições 2030</span><span>Outubro</span></div>
    <h2 class="ev-t">Apuração do 2º turno</h2>
    <div class="placar"><div class="pl-n"><span class="sim"><b>${fmt(r.votos)}%</b><small>${esc(r.candidato)}</small></span><span class="nao"><b>${fmt(100-r.votos)}%</b><small>Oposição</small></span></div>
    <div class="pl-b"><span class="s" style="width:${r.votos}%"></span><span class="n" style="width:${100-r.votos}%"></span><i style="left:50%"></i></div></div>
    <p class="ev-x">No primeiro turno, ${esc(r.candidato)} teve ${fmt(r.primeiro)}% dos votos válidos. Promessas cumpridas: ${r.prom} de 3.</p>
    <div class="carimbo-grande ${r.vence?'ok':'bad'}">${r.vence?(S.flags.desistiu?'SUCESSOR ELEITO':'REELEITO'):'DERROTADO'}</div>
    <p class="dica c">O mandato segue até dezembro de 2030.</p>
    <button class="btn-g yel" data-a="continuar-ev">Continuar</button></div>`);
}

function modalEscolha(titulo, texto, itens, acao){
  abrirModal(`<div class="ev"><h2 class="ev-t sm">${titulo}</h2><p class="ev-x">${texto}</p><div class="ops lista">${itens.map(it=>`<button class="op" data-a="${acao}" data-v="${it.v}"><span><b>${it.t}</b>${it.s?`<small>${it.s}</small>`:''}</span></button>`).join('')}</div><button class="lnk c" data-a="fechar">Cancelar</button></div>`);
}
function feedbackAcao(titulo, txt){
  abrirModal(`<div class="ev"><div class="ev-top"><span class="tag yel">Agenda</span></div><h2 class="ev-t sm">${titulo}</h2><div class="despacho"><p>${esc(txt)}</p></div><button class="btn-g yel" data-a="fechar-render">Beleza</button></div>`);
}
function executarAcao(id, v){
  const a=ACOES.find(x=>x.id===id); if (S.ap<a.custo) return feedbackAcao('Sem agenda','Seus pontos de agenda acabaram. Avance para o próximo mês para recarregar.');
  S.ap-=a.custo; const txt=ACOES_FX[id](v); calcBase(); salvar(); feedbackAcao(a.nome, txt);
}

function mostrarCarimbos(){
  if (!S||!S.novosCarimbos||!S.novosCarimbos.length||!toastEl.hidden) return;
  const id=S.novosCarimbos.shift(); const c=CARIMBOS.find(x=>x.id===id); salvar();
  toastEl.innerHTML=`<small>Carimbo conquistado</small><b>${esc(c.nome)}</b><span>${esc(c.desc)}</span>`;
  toastEl.hidden=false; toastEl.classList.remove('vai'); void toastEl.offsetWidth; toastEl.classList.add('vai');
  setTimeout(()=>{ toastEl.hidden=true; mostrarCarimbos(); }, 3200);
}

// ---------- fim ----------
function notaFinal(){
  const h=S.hist, e=S.eco, el=S.flags.eleicao;
  const cumpridas=S.promessas.filter(id=>PROMESSAS.find(p=>p.id===id).chk(S)).length;
  const media=k=>h[k].reduce((a,b)=>a+b,0)/h[k].length;
  let n=S.aprov*0.6 + cumpridas*8 + media('pib')*4 - Math.max(0,e.ipca-4.5)*3 - Math.max(0,e.divida-82.4)*0.6 + S.aprovadas.length*1.2 + (el&&el.vence?8:0) + (S.carimbos||[]).length*0.5;
  if (S.fim.tipo==='impeachment') n-=40; if (S.fim.tipo==='renuncia') n-=30;
  if (S.dificuldade==='dificil') n*=1.1; if (S.dificuldade==='facil') n*=0.9;
  const letra=n>=85?'S':n>=72?'A':n>=58?'B':n>=45?'C':n>=30?'D':'F';
  return { pontos:Math.max(0,Math.round(n*20)), letra, cumpridas };
}

function renderFim(){
  checarCarimbos(); S.novosCarimbos=[];
  const f=S.fim, h=S.hist, e=S.eco, el=S.flags.eleicao, nf=notaFinal();
  const titulo=f.tipo==='impeachment'?'Impeachment':f.tipo==='renuncia'?'Renúncia':el&&el.vence?(S.flags.desistiu?'Sucessor eleito':'Reeleito!'):'Fim do mandato';
  const linha=(n,a,b,d=1,suf='')=>`<div class="rs-r"><span>${n}</span><b>${fmt(b,d)}${suf}</b><em>era ${fmt(a,d)}${suf}</em></div>`;
  const resumo=`${S.pres.nome} (${S.pres.partido}): nota ${nf.letra} e ${nf.pontos} pontos em A FAIXA. Aprovação final de ${fmt(S.aprov,0)}%, ${S.aprovadas.length} leis aprovadas, ${(S.carimbos||[]).length} carimbos.`;
  app.innerHTML=`<section class="final">
    <p class="capa-ano">${dataTurno(Math.min(S.t,47))}</p>
    <h1 class="final-t">${titulo}</h1>
    <div class="nota-final"><span class="letra l-${nf.letra}">${nf.letra}</span><span><b>${nf.pontos.toLocaleString('pt-BR')}</b><small>pontos</small></span></div>
    <p class="ev-x c">${esc(S.pres.nome)} termina com ${fmt(S.aprov,0)}% de aprovação, ${S.aprovadas.length} ${S.aprovadas.length===1?'lei aprovada':'leis aprovadas'} e ${nf.cumpridas} de 3 promessas cumpridas.</p>
    <section class="card"><h3 class="ct">Aprovação no mandato</h3>${spark(h.aprov,{h:90,ref:50,min:10,max:80})}</section>
    <section class="card"><h3 class="ct">O Brasil que você entrega</h3><div class="rs">
      ${linha('PIB',h.pib[0],e.pib,1,'%')}${linha('Inflação',h.ipca[0],e.ipca,1,'%')}${linha('Selic',h.selic[0],e.selic,2,'%')}${linha('Desemprego',h.desemp[0],e.desemp,1,'%')}${linha('Dívida/PIB',h.divida[0],e.divida,1,'%')}${linha('Dólar',h.dolar[0],e.dolar,2)}${linha('Pobreza',23,S.soc.pobreza,1,'%')}${linha('Homicídios',20.8,S.soc.homic)}${linha('Desmatamento',5800,S.soc.desmat,0,' km²')}
    </div></section>
    <section class="card"><h3 class="ct">Carimbos <small>${(S.carimbos||[]).length}/${CARIMBOS.length}</small></h3><div class="carimbos">${CARIMBOS.map(c=>{ const on=(S.carimbos||[]).includes(c.id); return `<div class="carimbo ${on?'on':''}"><b>${on?esc(c.nome):'???'}</b><small>${esc(c.desc)}</small></div>`; }).join('')}</div></section>
    <div class="despacho"><small>Seu resultado</small><p id="resumo-txt">${esc(resumo)}</p></div>
    <button class="btn-g out" data-a="copiar">Copiar resultado</button>
    <button class="btn-g yel" data-a="novojogo">Novo mandato</button>
  </section>`;
  fecharModal();
}

// ---------- roteamento ----------
function render(){
  if (tela==='inicio') return renderInicio();
  if (tela==='setup') return renderSetup();
  if (S&&S.fim) return renderFim();
  renderJogo();
}

document.addEventListener('input', ev=>{
  if (ev.target.id==='f-e'){ const l=document.getElementById('l-e'); if (l) l.textContent=rotE(+ev.target.value); }
  if (ev.target.id==='f-s'){ const l=document.getElementById('l-s'); if (l) l.textContent=rotS(+ev.target.value); }
});

document.addEventListener('click', ev=>{
  if (ev.target===modal && !(S&&S.pendentes&&S.pendentes.length&&tela==='jogo')){ fecharModal(); return; }
  const b=ev.target.closest('[data-a]'); if (!b||b.disabled) return;
  const a=b.dataset.a, v=b.dataset.v;
  if (a==='novo'){ novoSetup(); tela='setup'; render(); return window.scrollTo(0,0); }
  if (a==='continuar'){ if (carregar()){ S.carimbos=S.carimbos||[]; tela='jogo'; modalMin=false; render(); } return; }
  if (a==='sair'){ tela='inicio'; return render(); }
  if (a==='voltar'){ lerCamposSetup(); SET.ok=''; SET.passo--; render(); return window.scrollTo(0,0); }
  if (a==='avancar') return avancarSetup();
  if (a==='bg'){ lerCamposSetup(); SET.pres.bg=v; return renderMantendoScroll(); }
  if (a==='modo'){ lerCamposSetup(); SET.modo=v; return render(); }
  if (a==='partido'){ lerCamposSetup(); SET.partido=v; const p=PARTIDOS.find(x=>x.id===v); SET.pres.e=p.e; SET.pres.s=p.s; SET.coalizao=[]; return renderMantendoScroll(); }
  if (a==='cor'){ lerCamposSetup(); SET.novo.cor=v; return renderMantendoScroll(); }
  if (a==='coal'){ const i=SET.coalizao.indexOf(v); if (i>=0) SET.coalizao.splice(i,1); else SET.coalizao.push(v); return renderMantendoScroll(); }
  if (a==='vice'){ SET.vice=SET.viceOps[+v]; return renderMantendoScroll(); }
  if (a==='cand'){ const [m,i]=v.split(':'); SET.esc[m]=+i; return renderMantendoScroll(); }
  if (a==='prom'){ const i=SET.promessas.indexOf(v); if (i>=0) SET.promessas.splice(i,1); else if (SET.promessas.length<3) SET.promessas.push(v); return renderMantendoScroll(); }
  if (a==='dif'){ SET.dificuldade=v; return renderMantendoScroll(); }
  // jogo
  if (a==='aba'){ aba=v; render(); return window.scrollTo({top:0}); }
  if (a==='sub'){ subBrasil=v; return render(); }
  if (a==='filtro'){ filtroProj=v; return renderMantendoScroll(); }
  if (a==='minab'){ minAberto=minAberto===v?null:v; return renderMantendoScroll(); }
  if (a==='encerrar'){ encerrarMes(); modalMin=false; render(); return window.scrollTo({top:0}); }
  if (a==='minimizar'){ modalMin=true; fecharModal(); return render(); }
  if (a==='abrirpend'){ modalMin=false; return abrirPendente(); }
  if (a==='opcao') return escolherOpcao(+v);
  if (a==='continuar-ev'){ eventoResultado=null; S.pendentes.shift(); salvar(); modalMin=false; return renderMantendoScroll(); }
  if (a==='fechar'){ return fecharModal(); }
  if (a==='fechar-render'){ fecharModal(); return renderMantendoScroll(); }
  if (a==='menu') return abrirModal(`<div class="ev"><h2 class="ev-t sm">Menu</h2><div class="ops"><button class="op" data-a="diario"><span>Diário do governo</span></button><button class="op" data-a="sairmenu"><span>Salvar e voltar à capa</span></button><button class="op" data-a="confnovo"><span>Abandonar e começar de novo</span></button></div><button class="lnk c" data-a="fechar">Fechar</button></div>`);
  if (a==='diario') return abrirModal(`<div class="ev"><h2 class="ev-t sm">Diário do governo</h2><ul class="news">${S.log.map(l=>`<li><span class="tag">${l.cat}</span><p>${esc(l.txt)}</p><small>${dataCurta(l.t)}</small></li>`).join('')}</ul><button class="btn-g yel" data-a="fechar">Fechar</button></div>`);
  if (a==='sairmenu'){ salvar(); tela='inicio'; fecharModal(); return render(); }
  if (a==='confnovo') return abrirModal(`<div class="ev"><h2 class="ev-t sm">Abandonar o mandato?</h2><p class="ev-x">O governo salvo será apagado.</p><div class="ops"><button class="op" data-a="novojogo"><span>Sim, apagar e recomeçar</span></button><button class="op" data-a="fechar"><span>Não</span></button></div></div>`);
  if (a==='novojogo'){ apagarSave(); S=null; tela='inicio'; fecharModal(); render(); return window.scrollTo(0,0); }
  if (a==='copiar'){ const el=document.getElementById('resumo-txt'); const ok=()=>{ b.textContent='Copiado!'; }; const falha=()=>{ const r=document.createRange(); r.selectNodeContents(el); const s=getSelection(); s.removeAllRanges(); s.addRange(r); b.textContent='Texto selecionado: copie manualmente'; }; try{ navigator.clipboard.writeText(el.textContent).then(ok,falha); }catch(e){ falha(); } return; }
  if (a==='propor'||a==='mp'){ if (S.ap<1) return; propor(v, a==='mp'); calcBase(); salvar(); const d=PROJETOS.find(p=>p.id===v); return feedbackAcao(a==='mp'?'Medida Provisória editada':'Projeto enviado', a==='mp'?`${d.nome} já está valendo. O Congresso tem 4 meses para aprovar, ou a MP cai.`:`${d.nome} começa a tramitar e vai a plenário em ${d.tram} meses. Articule votos até lá.`); }
  if (a==='articular'){ const t=S.projetos.find(x=>x.id===v); if (!t||S.ap<1) return; S.ap--; t.artic++; S.eco.primTemp-=0.02; S.partidos.filter(p=>S.coalizao.includes(p.id)).forEach(p=>p.sat=clamp(p.sat+1,0,100)); logar('Congresso',`Planalto articula votos para: ${PROJETOS.find(p=>p.id===v).nome}.`); salvar(); return renderMantendoScroll(); }
  if (a==='romper') return abrirModal(`<div class="ev"><h2 class="ev-t sm">Romper com o ${v}?</h2><p class="ev-x">O partido deixa a base e seus ministros são trocados por técnicos.</p><div class="ops"><button class="op" data-a="romper-ok" data-v="${v}"><span>Sim, romper</span></button><button class="op" data-a="fechar"><span>Cancelar</span></button></div></div>`);
  if (a==='romper-ok'){ romperPartido(v); salvar(); fecharModal(); return renderMantendoScroll(); }
  if (a==='trocar'){ const mi=MIN(v); tmpCandidatos={ min:v, lista:candidatosMinisterio(v,S.coalizao,S.pres.partido) };
    return abrirModal(`<div class="ev"><h2 class="ev-t sm">Novo nome para ${mi.nome}</h2><p class="ev-x">Sai ${esc(S.ministros[v].nome)}. Quem entra?</p><div class="ops lista">${tmpCandidatos.lista.map((c,i)=>`<button class="op" data-a="trocar-ok" data-v="${i}"><span><b>${esc(c.nome)} · ${c.partido||'Técnico'}</b><small>${esc(c.desc)} · C ${c.comp} · L ${c.leal} · I ${c.integ}</small></span></button>`).join('')}</div><button class="lnk c" data-a="fechar">Cancelar</button></div>`); }
  if (a==='trocar-ok'){ if (S.ap<1) return; trocarMinistro(tmpCandidatos.min, tmpCandidatos.lista[+v]); minAberto=null; salvar(); fecharModal(); return renderMantendoScroll(); }
  // ações
  if (a==='acao-pronunciamento'||a==='acao-emendas'||a==='acao-entrevista') return executarAcao(a.slice(5));
  if (a==='acao-visitaestado') return modalEscolha('Visitar um estado','Os estados com menor aprovação aparecem primeiro.', ESTADOS.slice().sort((x,y)=>aprovUF(x.uf)-aprovUF(y.uf)).map(e=>({v:e.uf,t:e.nome,s:`Aprovação ${fmt(aprovUF(e.uf),0)}%`})), 'acao-visita');
  if (a==='acao-visita') return executarAcao('visitaestado', v);
  if (a==='acao-reuniaogrupo') return modalEscolha('Receber no Planalto','Quem você chama para conversar?', GRUPOS.map(g=>({v:g.id,t:g.nome,s:`Relação ${fmt(S.grp[g.id],0)}/100`})), 'reuniao');
  if (a==='reuniao') return executarAcao('reuniaogrupo', v);
  if (a==='acao-viagem') return modalEscolha('Viagem de Estado','Para onde vai o avião presidencial?', PAISES.map(c=>({v:c.id,t:c.nome,s:`Relação ${fmt(S.rel[c.id],0)}/100`})), 'viagem');
  if (a==='viagem') return executarAcao('viagem', v);
  if (a==='acao-cafepartido') return modalEscolha('Jantar no Alvorada','Qual partido você chama?', S.partidos.filter(p=>p.id!==S.pres.partido).sort((x,y)=>y.dep-x.dep).map(p=>({v:p.id,t:`${p.id} · ${p.dep} deputados`,s:`${S.coalizao.includes(p.id)?'Na base':'Fora da base'} · satisfação ${fmt(p.sat,0)}`})), 'acao-cafe');
  if (a==='acao-cafe') return executarAcao('cafepartido', v);
});

function renderMantendoScroll(){
  const sx=[...document.querySelectorAll('.carrossel')].map(c=>c.scrollLeft), sy=window.scrollY;
  render();
  document.querySelectorAll('.carrossel').forEach((c,k)=>{ if (sx[k]!=null) c.scrollLeft=sx[k]; });
  window.scrollTo(0,sy);
}

document.addEventListener('keydown', ev=>{ if (ev.key==='Escape' && !modal.hidden && !(S&&S.pendentes&&S.pendentes.length)) fecharModal(); });

function iniciar(d){
  if (d && d.S){ S=d.S; tela=d.tela||'jogo'; aba=d.aba||'inicio'; }
  render();
}
try{ window.claude?.hot?.snapshot?.(()=>({ S, tela: tela==='setup'?'inicio':tela, aba })); }catch(e){}
window.claude?.hot?.ready ? window.claude.hot.ready(iniciar) : iniciar(window.claude?.hot?.data ?? {});
