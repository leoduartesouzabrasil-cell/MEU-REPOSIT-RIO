// =====================================================================
// CONCERTO DAS NAÇÕES — interface
// Telas: login -> salão de servidores -> mundo do servidor
// (barra de recursos no topo, trilho de ícones, painel à esquerda,
//  mapa do Brasil no centro, diário e notícias à direita).
// =====================================================================
import { api } from './api.js';
import { CONFIG } from './config.js';
import { PARTIDOS, ESTADOS, PROJETOS } from './dados-faixa.js';
import { CARGOS, vagas, SEGMENTOS, AUTORIDADES, ACOES_CAMPANHA, ACOES_MANDATO, FEDERAIS, estaduais, dataJogo } from './dados.js';
import { partido, estado as estadoUF, ocupantes, vagasLivres, proximaEleicao, projecao, candidatosDisputa, composicao, placar, nomeCasa, membrosCasa, chave } from './regras.js';
import { MAPA } from './mapa-brasil.js';

const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
const fmt = n => Math.round(n).toLocaleString('pt-BR');
const raiz = $('#raiz');

const S = { usuario: null, servidores: [], admin: false, srv: null, est: null, aba: 'perfil', uf: null, modo: 'gov', casa: 'camara', desliga: null, msgErro: '' };

// ---------- utilidades de interface ----------
let tt;
function toast(m, err) { const t = $('#toast'); t.textContent = m; t.className = err ? 'err' : ''; clearTimeout(tt); tt = setTimeout(() => t.className = 'oculto', 3800); }
async function tenta(f) { try { return await f(); } catch (e) { toast(e.message || String(e), true); } }
const chipP = id => { const p = partido(id); return `<span class="chip"><i style="background:${p.cor}"></i>${esc(p.id)}</span>`; };
const opcPartidos = sel => PARTIDOS.map(p => `<option value="${p.id}" ${p.id === sel ? 'selected' : ''}>${esc(p.id)} · ${esc(p.nome)}</option>`).join('');
const opcUFs = sel => [...ESTADOS].sort((a, b) => a.nome.localeCompare(b.nome)).map(e => `<option value="${e.uf}" ${e.uf === sel ? 'selected' : ''}>${esc(e.nome)}</option>`).join('');
const cargoTxt = c => !c ? 'Sem mandato' : c.cargo === 'presidente' ? 'Presidente da República' : `${CARGOS[c.cargo].nome} por ${c.uf}`;

function retrato(j, w = 120, h = 150) {
  const p = partido(j.partido), ini = j.nome.split(/\s+/).map(x => x[0]).slice(0, 2).join('').toUpperCase();
  let hsh = 0; for (const ch of j.nome) hsh = (hsh * 31 + ch.charCodeAt(0)) >>> 0;
  const pele = ['#8A5A3B', '#C68E63', '#6B4428', '#E0B48C', '#A8714A'][hsh % 5], cab = ['#1d1410', '#3b2a1e', '#5b4a3a', '#9a9a9a'][(hsh >> 3) % 4];
  return `<svg viewBox="0 0 120 150" width="${w}" height="${h}" aria-hidden="true"><defs><linearGradient id="fd${hsh}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3d5a4f"/><stop offset="1" stop-color="#14201c"/></linearGradient></defs>
  <rect width="120" height="150" fill="url(#fd${hsh})"/><path d="M12 150c4-34 22-46 48-46s44 12 48 46z" fill="#1d2430"/><path d="M44 106l16 30 16-30" fill="#efe7d6"/><path d="M57 110h6l2 34h-10z" fill="${p.cor}"/>
  <path d="M30 150l40-46 12 6-36 40z" fill="${p.cor}" opacity=".85"/><rect x="50" y="86" width="20" height="22" fill="${pele}"/><ellipse cx="60" cy="66" rx="24" ry="28" fill="${pele}"/>
  <path d="M36 60c0-22 12-30 24-30s25 8 24 30c-6-10-14-14-24-14s-18 4-24 14z" fill="${cab}"/><text x="104" y="20" text-anchor="end" font-family="Playfair Display SC,serif" font-weight="900" font-size="16" fill="#E7CB86">${esc(ini)}</text></svg>`;
}
const ic = {
  perfil:'<path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c1-5 4-7 8-7s7 2 8 7"/>',
  eleicoes:'<path d="M4 10h16v10H4zM8 10V5h8v5M10 14h4"/>',
  congresso:'<path d="M3 20h18M5 20v-7M19 20v-7M9 20v-7M15 20v-7M3 13h18L12 5z"/>',
  governo:'<path d="M12 3l2.5 5 5.5.8-4 3.9.9 5.5L12 15.6 7.1 18.2l.9-5.5-4-3.9 5.5-.8z"/>',
  jornal:'<path d="M4 5h13v14H6a2 2 0 0 1-2-2zM17 9h3v8a2 2 0 0 1-2 2M7 9h7M7 13h7M7 16h4"/>',
  jogadores:'<path d="M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM17 11a2.5 2.5 0 1 0 0-5M3 20c.6-4 3-6 6-6s5.4 2 6 6M16 14c3 0 4.6 2 5 6"/>',
  estado:'<path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/>',
  diario:'<path d="M6 3h11a1 1 0 0 1 1 1v17l-6-3-6 3V4a1 1 0 0 1 1-1z"/>',
  sair:'<path d="M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10"/>',
};
const svgIc = n => `<svg viewBox="0 0 24 24">${ic[n]}</svg>`;

// ================================================================ LOGIN
function telaLogin() {
  const demo = api.modo === 'demo';
  raiz.innerHTML = `<div class="tela"><div class="cartao">
    <div class="logo"><h1>Concerto<br>das Nações</h1><p>Brasil · a política é feita pelos jogadores</p></div>
    <p class="mut pq">Candidate-se a deputado(a) estadual, federal ou senador(a). Se houver vaga, você assume na hora; se não, convença o eleitorado com campanha. Governadores e prefeitos são os da vida real.</p>
    ${demo ? `<div class="aviso"><b>Modo demonstração.</b> O jogo ainda não está ligado ao servidor online: tudo fica salvo só neste navegador, com jogadores-robô. Use qualquer e-mail.</div>` : ''}
    <form id="fLogin">
      <label class="campo"><span>E-mail</span><input name="email" type="email" required autocomplete="email"></label>
      ${demo ? '' : `<label class="campo"><span>Senha</span><input name="senha" type="password" minlength="6" autocomplete="current-password"></label>`}
      <div id="lErro"></div>
      <button class="bt ouro larg" name="entrar">Entrar</button>
      ${demo ? '' : `<div class="linha" style="margin-top:.5rem"><button class="bt larg" type="button" id="bCriar" style="flex:1">Criar conta</button><button class="bt larg" type="button" id="bLink" style="flex:1">Receber link por e-mail</button></div>`}
    </form></div></div>`;
  const f = $('#fLogin'), erro = m => $('#lErro').innerHTML = m ? `<div class="erro">${esc(m)}</div>` : '';
  const v = () => ({ email: f.email.value.trim(), senha: f.senha?.value || '' });
  f.onsubmit = async ev => { ev.preventDefault(); erro(''); try { const r = await api.entrarEmail(v().email, v().senha); S.usuario = r.usuario; abrirLobby(); } catch (e) { erro(e.message); } };
  if (!demo) {
    $('#bCriar').onclick = async () => { erro(''); try { const { email, senha } = v(); if (senha.length < 6) throw new Error('Senha com pelo menos 6 caracteres.');
      const r = await api.criarConta(email, senha, email.split('@')[0]); if (r.confirmar) erro('Conta criada! Confirme pelo link enviado ao seu e-mail e depois entre.'); else { S.usuario = r.usuario; abrirLobby(); } } catch (e) { erro(e.message); } };
    $('#bLink').onclick = async () => { erro(''); try { await api.linkMagico(v().email); erro('Link enviado! Abra seu e-mail neste aparelho.'); } catch (e) { erro(e.message); } };
  }
}

// ================================================================ SALÃO
async function abrirLobby() {
  S.desliga?.(); S.desliga = null; S.srv = null; S.est = null;
  S.servidores = await tenta(() => api.listar()) || [];
  S.admin = await tenta(() => api.souAdmin()) || false;
  const pend = S.admin ? (await tenta(() => api.pendentes()) || []) : [];
  const meus = S.servidores.filter(s => s.dono === S.usuario.id && s.status !== 'ativo');
  const ativos = S.servidores.filter(s => s.status === 'ativo');
  const pg = CONFIG.PAGAMENTO;
  raiz.innerHTML = `<div class="tela"><div class="lobby">
    <header><h1>Concerto das Nações</h1><div class="linha"><span class="mut pq">${esc(S.usuario.email)}</span><button class="bt fino" id="bSair">Sair</button></div></header>
    ${api.modo === 'demo' ? `<div class="aviso"><b>Modo demonstração</b>: servidores e jogadas ficam só neste navegador. Para o jogo público, configure o Supabase (veja o README).</div>` : ''}
    <section class="secao"><h2>Servidores abertos</h2>
      <p class="mut pq">Cada servidor é um Brasil próprio. Entre em qualquer um de graça: crie seu personagem e dispute um cargo.</p>
      <div class="grade">${ativos.length ? ativos.map(s => `<div class="srv"><h3>${esc(s.nome)}</h3>
        <div class="mut pq">Presidente: <b class="ouro">${esc(s.dono_nome)}</b></div>
        <div class="linha pq"><span class="chip">${dataJogo(s.mes)}</span><span class="chip">${s.jogadores} jogador${s.jogadores === 1 ? '' : 'es'}</span></div>
        <button class="bt ${s.souMembro ? 'ouro' : ''}" data-abrir="${s.id}">${s.souMembro ? 'Continuar' : 'Entrar e jogar'}</button></div>`).join('') : '<p class="mut">Nenhum servidor aberto ainda. Abra o primeiro!</p>'}</div>
    </section>
    ${meus.length ? `<section class="secao"><h2>Seus servidores aguardando pagamento</h2>${meus.map(s => `<div class="cargo"><div><b>${esc(s.nome)}</b><div class="mut pq">Código: ${esc(s.id)}</div></div><span class="chip">aguardando pagamento</span></div>`).join('')}
      <div class="aviso">${esc(pg.instrucoes)}${pg.chavePix ? `<br>Chave Pix: <b>${esc(pg.chavePix)}</b>` : ''}${pg.contato ? `<br>Comprovante para: <b>${esc(pg.contato)}</b>` : ''}</div></section>` : ''}
    <section class="secao"><h2>Abrir um servidor novo · ${esc(pg.valor)}</h2>
      <p class="mut pq">Quem abre o servidor começa como <b>Presidente da República</b> daquele Brasil. O servidor fica aguardando pagamento até ser liberado.</p>
      <form id="fNovo" class="grade" style="grid-template-columns:repeat(auto-fit,minmax(200px,1fr))">
        <label class="campo"><span>Nome do servidor</span><input name="nome" required minlength="3" maxlength="48" placeholder="Ex.: República do Cerrado"></label>
        <label class="campo"><span>Seu nome político</span><input name="pnome" required minlength="3" maxlength="40"></label>
        <label class="campo"><span>Partido</span><select name="partido">${opcPartidos('PT')}</select></label>
        <label class="campo"><span>Estado de origem</span><select name="uf">${opcUFs('SP')}</select></label>
        <div style="align-self:end;margin:.55rem 0"><button class="bt ouro larg">Abrir servidor</button></div>
      </form></section>
    ${S.admin ? `<section class="secao"><h2>Administração · pagamentos</h2>${pend.length ? pend.map(s => `<div class="cargo"><div><b>${esc(s.nome)}</b> <span class="mut pq">de ${esc(s.dono_nome)} · ${esc(s.id)}</span></div><button class="bt ouro fino" data-liberar="${s.id}">${api.modo === 'demo' ? 'Simular pagamento e liberar' : 'Pagamento conferido: liberar'}</button></div>`).join('') : '<p class="mut pq">Nenhum servidor aguardando.</p>'}</section>` : ''}
    <p class="mut pq" style="text-align:center;margin-top:2rem">Governadores e prefeitos são pessoas reais e não são jogáveis; o que fazem no jogo é simulação. Mapa: @svg-maps/brazil (CC BY 4.0).</p>
  </div></div>`;
  $('#bSair').onclick = async () => { await api.sair(); S.usuario = null; telaLogin(); };
  raiz.querySelectorAll('[data-abrir]').forEach(b => b.onclick = () => entrarServidor(b.dataset.abrir));
  raiz.querySelectorAll('[data-liberar]').forEach(b => b.onclick = async () => { await tenta(() => api.liberar(b.dataset.liberar)); abrirLobby(); });
  $('#fNovo').onsubmit = async ev => { ev.preventDefault(); const f = ev.target;
    const r = await tenta(() => api.criar(f.nome.value, { nome: f.pnome.value, partido: f.partido.value, uf: f.uf.value }));
    if (r) { toast('Servidor criado! Ele será liberado após o pagamento.'); abrirLobby(); } };
}

// ================================================================ MUNDO
async function entrarServidor(id) {
  const est = await tenta(() => api.abrir(id)); if (!est) return;
  S.srv = id; S.est = est; S.aba = 'perfil'; S.uf = null;
  if (!est.jogadores[S.usuario.id]) return criarPersonagem();
  montarJogo();
  S.desliga = api.assinar(id, async () => { const e = await tenta(() => api.abrir(id)); if (e) { S.est = e; desenhar(); } });
}
function criarPersonagem() {
  const m = document.createElement('div'); m.className = 'modal';
  m.innerHTML = `<div class="cartao"><div class="logo"><h1 style="font-size:1.5rem">${esc(S.est.nome)}</h1><p>Crie seu personagem político</p></div>
    <form id="fPers"><label class="campo"><span>Nome político</span><input name="nome" required minlength="3" maxlength="40"></label>
    <label class="campo"><span>Partido</span><select name="partido">${opcPartidos('PSB')}</select></label>
    <label class="campo"><span>Domicílio eleitoral (onde você disputa)</span><select name="uf">${opcUFs('SP')}</select></label>
    <p class="mut pq">Sua posição ideológica começa igual à do partido. Os partidos e as bancadas que não são de jogadores votam como na vida real (simulação).</p>
    <div class="linha"><button type="button" class="bt" id="bVolta">Voltar</button><button class="bt ouro" style="flex:1">Entrar na vida pública</button></div></form></div>`;
  document.body.append(m);
  m.querySelector('#bVolta').onclick = () => { m.remove(); abrirLobby(); };
  m.querySelector('#fPers').onsubmit = async ev => { ev.preventDefault(); const f = ev.target;
    const r = await tenta(() => api.jogar(S.srv, { tipo: 'entrar', nome: f.nome.value, partido: f.partido.value, uf: f.uf.value }));
    if (r) { m.remove(); toast(r.msg); const id = S.srv; S.srv = null; entrarServidor(id); } };
}

async function jogar(acao) {
  const r = await tenta(() => api.jogar(S.srv, acao));
  if (r) { S.est = r.estado; toast(r.msg); desenhar(); }
}

function montarJogo() {
  raiz.innerHTML = `<div id="jogo"><div id="top"></div><nav id="rail" aria-label="Seções"></nav><aside id="painel" class="${innerWidth <= 900 ? 'fechado' : ''}"></aside>
    <main id="mapa"><svg class="br" viewBox="${MAPA.viewBox}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Mapa do Brasil por estado">
      ${Object.entries(MAPA.uf).map(([uf, d]) => `<path class="uf" data-uf="${uf}" d="${d}"><title>${esc(estadoUF(uf).nome)}</title></path>`).join('')}<g id="rot"></g></svg>
      <div class="leg" id="leg"></div><div class="modos" id="modos"></div></main>
    <aside id="diario" class="fechado"></aside></div>`;
  const svg = raiz.querySelector('svg.br'), g = $('#rot');
  svg.querySelectorAll('path.uf').forEach(p => {
    const b = p.getBBox(), uf = p.dataset.uf;
    const ajuste = { DF: [0, -2], RN: [6, 0], PB: [10, 0], PE: [14, 0], AL: [10, 2], SE: [8, 3], ES: [5, 0], RJ: [4, 4], SC: [3, 0] }[uf] || [0, 0];
    g.insertAdjacentHTML('beforeend', `<text x="${b.x + b.width / 2 + ajuste[0]}" y="${b.y + b.height / 2 + 3 + ajuste[1]}" text-anchor="middle">${uf}</text>`);
    p.onclick = () => { S.uf = uf; S.aba = 'estado'; abrePainel(); desenhar(); };
    p.onmousemove = ev => { const d = $('#dica'); d.className = ''; d.innerHTML = dicaUF(uf); d.style.left = (ev.clientX + 14) + 'px'; d.style.top = (ev.clientY + 14) + 'px'; };
    p.onmouseleave = () => $('#dica').className = 'oculto';
  });
  desenhar();
}
const abrePainel = () => { $('#painel')?.classList.remove('fechado'); if (innerWidth <= 900) $('#diario')?.classList.add('fechado'); };

function eu() { return S.est.jogadores[S.usuario.id]; }
function pendencias() {
  const est = S.est, j = eu(), l = [];
  for (const p of est.projetos.filter(p => !p.fim)) {
    if (p.casa === 'sancao' && est.presidente === j.id) l.push({ t: `Sanção pendente: "${p.titulo}"`, aba: 'governo' });
    else if (!p.casa.startsWith('sanc') && membrosCasa(est, p.casa).some(m => m.id === j.id) && !p.votos[j.id]) l.push({ t: `Votar: "${p.titulo}" (${nomeCasa(p.casa)})`, aba: 'congresso', casa: p.casa });
  }
  if (j.cargo && est.disputas[chave(j.cargo.cargo, j.cargo.uf)]) l.push({ t: `Sua cadeira está sendo disputada! Faça campanha até ${dataJogo(est.disputas[chave(j.cargo.cargo, j.cargo.uf)].eleicao)}.`, aba: 'perfil' });
  return l;
}

function desenhar() {
  if (!S.est || !$('#jogo')) return;
  const est = S.est, j = eu(), e = est.eco, souPres = est.presidente === j.id;
  const pend = pendencias();
  const dt = Date.now() - est.ultimoMes, lim = souPres ? est.cfg.intervaloPresidente : est.cfg.intervaloLivre;
  const podeVirar = dt >= lim, falta = Math.max(0, lim - dt);
  const tempo = falta > 3600e3 ? `${Math.ceil(falta / 3600e3)} h` : `${Math.ceil(falta / 60e3)} min`;
  $('#top').innerHTML = `<div class="brasao" title="${esc(est.nome)}"></div><span class="nome">${esc(est.nome)}</span>
    <span class="stat ${e.pib >= 2 ? 'bom' : 'mau'}" title="Crescimento do PIB no ano"><small>PIB</small>${e.pib.toFixed(1)}%</span>
    <span class="stat ${e.inflacao <= 4.5 ? 'bom' : 'mau'}" title="Inflação (IPCA) em 12 meses"><small>IPCA</small>${e.inflacao.toFixed(1)}%</span>
    <span class="stat opc" title="Desemprego"><small>Desemprego</small>${e.desemprego.toFixed(1)}%</span>
    <span class="stat ${e.aprovacao >= 45 ? 'bom' : 'mau'}" title="Aprovação do governo do presidente"><small>Governo</small>${e.aprovacao}%</span>
    <span class="stat" title="Seu capital político: gasto em ações, recarrega todo mês"><small>Capital</small>${j.pc}/${est.cfg.pcMax}</span>
    <span class="stat" title="Seu fundo de campanha"><small>Fundo</small>R$ ${fmt(j.fundo)} mil</span>
    <div class="relogio"><span class="data">${dataJogo(est.mes)}</span>
      <button class="bt ${podeVirar ? 'ouro' : ''} fino" id="bMes" ${podeVirar ? '' : 'disabled'} title="${podeVirar ? 'Fecha as votações e passa o mês' : (souPres ? 'Próxima virada em ' + tempo : 'Só o presidente vira o mês (qualquer um após 24 h)')}">${podeVirar ? 'Virar o mês ▸' : '⏳ ' + tempo}</button></div>`;
  $('#bMes').onclick = () => jogar({ tipo: 'passar_mes' });

  const abas = [['perfil', 'Personagem'], ['eleicoes', 'Eleições'], ['congresso', 'Congresso'], ['governo', 'Governo'], ['jogadores', 'Jogadores'], ['jornal', 'Jornal']];
  const contaAba = a => pend.filter(p => p.aba === a).length;
  $('#rail').innerHTML = abas.map(([a, t]) => `<button class="rb ${S.aba === a ? 'on' : ''}" data-aba="${a}" title="${t}" aria-label="${t}">${svgIc(a)}${contaAba(a) ? `<span class="n">${contaAba(a)}</span>` : ''}</button>`).join('')
    + `<button class="rb mobile-diario" data-diario title="Diário" aria-label="Diário">${svgIc('diario')}${pend.length ? `<span class="n">${pend.length}</span>` : ''}</button><span style="flex:1"></span><button class="rb" id="bLobby" title="Voltar aos servidores" aria-label="Voltar aos servidores">${svgIc('sair')}</button>`;
  $('#rail').querySelectorAll('[data-aba]').forEach(b => b.onclick = () => { if (innerWidth <= 900 && S.aba === b.dataset.aba && !$('#painel').classList.contains('fechado')) { $('#painel').classList.add('fechado'); return; } S.aba = b.dataset.aba; abrePainel(); desenhar(); });
  $('#rail').querySelector('[data-diario]').onclick = () => { const d = $('#diario'); d.classList.toggle('fechado'); if (innerWidth <= 900) $('#painel').classList.add('fechado'); };
  $('#bLobby').onclick = abrirLobby;

  desenharPainel(); desenharMapa(); desenharDiario(pend);
}

// ---------------------------------------------------------------- painel
const PAINEIS = { perfil: pPerfil, eleicoes: pEleicoes, congresso: pCongresso, governo: pGoverno, jogadores: pJogadores, jornal: pJornal, estado: pEstado };
const TITULOS = { perfil: 'Personagem', eleicoes: 'Eleições', congresso: 'Congresso', governo: 'Governo', jogadores: 'Jogadores', jornal: 'Jornal', estado: 'Estado' };
function desenharPainel() {
  const el = $('#painel'), topo = el.scrollTop;
  el.innerHTML = `<div class="ph"><h2>${S.aba === 'estado' && S.uf ? esc(estadoUF(S.uf).nome) : TITULOS[S.aba]}</h2><button class="x" aria-label="Fechar painel">×</button></div><div class="pc">${PAINEIS[S.aba]()}</div>`;
  el.scrollTop = topo;
  el.querySelector('.x').onclick = () => el.classList.add('fechado');
  el.querySelectorAll('[data-j]').forEach(b => b.onclick = () => { if (b.dataset.confirma && !confirm(b.dataset.confirma)) return; jogar(JSON.parse(b.dataset.j)); });
  el.querySelectorAll('[data-ir]').forEach(b => b.onclick = () => { const [a, x] = b.dataset.ir.split('|'); S.aba = a; if (a === 'estado') S.uf = x; if (a === 'congresso' && x) S.casa = x; desenhar(); });
  const fp = el.querySelector('#fProj');
  if (fp) {
    const atual = () => { const cat = fp.catalogo.value; fp.querySelector('#livre').classList.toggle('oculto', !!cat); const c = PROJETOS.find(p => p.id === cat); fp.querySelector('#descCat').textContent = c ? c.desc : ''; };
    fp.catalogo?.addEventListener('change', atual); if (fp.catalogo) atual();
    fp.onsubmit = ev => { ev.preventDefault(); const cat = fp.catalogo?.value;
      jogar(cat ? { tipo: 'propor', catalogo: cat } : { tipo: 'propor', titulo: fp.titulo.value, desc: fp.desc.value, tipoLei: fp.tipoLei?.value, e: +fp.e.value, s: +fp.s.value }); };
  }
  el.querySelectorAll('[data-casa]').forEach(b => b.onclick = () => { S.casa = b.dataset.casa; desenharPainel(); });
}
const J = o => esc(JSON.stringify(o));

function blocoDisputa(k, titulo) {
  const est = S.est, d = est.disputas[k]; if (!d) return '';
  const ids = candidatosDisputa(est, k), pr = projecao(est, d.cargo, d.uf, ids), n = vagas(d.cargo, d.uf);
  const max = Math.max(...pr.lista.map(x => x.pct), 1);
  return `<div class="bloco"><h3>${titulo || `${CARGOS[d.cargo].curto} · ${d.uf}`}<span class="chip">eleição ${dataJogo(d.eleicao)}</span></h3>
    <p class="mut pq" style="margin:0 0 .4rem">${n} cadeira${n > 1 ? 's' : ''} · ${ids.length} na disputa · pesquisa simulada (votos válidos)</p>
    <table class="tab">${pr.lista.map((x, i) => `<tr><td>${i < n ? '<b class="ouro">●</b>' : '<span class="mut">○</span>'}</td><td>${esc(x.nome)} ${chipP(x.partido)}${est.jogadores[x.id]?.cargo?.cargo === d.cargo ? ' <span class="mut pq">(ocupa)</span>' : ''}</td>
      <td style="width:35%"><div class="barra"><b style="width:${100 * x.pct / max}%;background:${partido(x.partido).cor}"></b></div></td><td class="num">${x.pct}%</td></tr>`).join('')}</table></div>`;
}

function pPerfil() {
  const est = S.est, j = eu(), souPres = est.presidente === j.id, uf = j.uf;
  const kDef = j.cargo && j.cargo.cargo !== 'presidente' ? chave(j.cargo.cargo, j.cargo.uf) : null;
  const emDisputa = j.cand || (kDef && est.disputas[kDef]);
  const leis = est.leis.filter(l => l.autor === j.nome).length;
  let h = `<div class="ficha"><div class="retrato">${retrato(j)}</div><div>
    <div class="tit" style="font-size:1.25rem;color:var(--papel)">${esc(j.nome)}</div>
    <div class="ouro pq" style="margin:.15rem 0 .5rem">${cargoTxt(j.cargo)}</div>
    <dl class="kv"><dt>Partido</dt><dd>${chipP(j.partido)}</dd><dt>Domicílio</dt><dd>${esc(estadoUF(uf).nome)}</dd>
    <dt>Fama em ${uf}</dt><dd><div class="barra" style="margin-top:.4rem"><b style="width:${j.fama[uf] || 0}%"></b></div></dd>
    <dt>Leis</dt><dd>${leis}</dd><dt>Eleições</dt><dd>${j.feitos.eleicoes} vencida(s)</dd></dl></div></div>`;

  if (j.cand) h += blocoDisputa(j.cand, 'Sua candidatura');
  else if (kDef && est.disputas[kDef]) h += blocoDisputa(kDef, 'Sua cadeira em disputa');
  if (emDisputa) {
    h += `<div class="bloco"><h3>Campanha <span class="cust">${j.pc} capital · R$ ${fmt(j.fundo)} mil</span></h3><div class="acoes">
      ${ACOES_CAMPANHA.filter(a => !a.seg).map(a => `<button class="acao" data-j="${J({ tipo: 'campanha', acao: a.id })}" ${j.pc < a.pc || j.fundo < a.custo ? 'disabled' : ''} title="${esc(a.desc)}"><b>${a.nome}</b><span class="cust">${a.pc} capital${a.custo ? ` · R$ ${a.custo} mil` : ''}</span><small>${esc(a.desc)}</small></button>`).join('')}
      </div><h3 style="margin-top:.7rem">Visitar segmento <span class="cust">1 capital · R$ 5 mil</span></h3><div class="acoes">
      ${SEGMENTOS.map(s => `<button class="acao" data-j="${J({ tipo: 'campanha', acao: 'visita', seg: s.id })}" ${j.pc < 1 || j.fundo < 5 ? 'disabled' : ''}><b><span class="chip"><i style="background:${s.cor}"></i></span> ${esc(s.nome)}</b></button>`).join('')}</div>
      ${j.cand ? `<button class="bt fino" style="margin-top:.6rem" data-j="${J({ tipo: 'retirar' })}">Retirar candidatura</button>` : ''}</div>`;
  }
  if (!souPres && !j.cand) {
    h += `<div class="bloco"><h3>Lançar candidatura</h3><p class="mut pq" style="margin-top:0">Você disputa por ${esc(estadoUF(uf).nome)}. Havendo vaga, a posse é imediata; sem vaga, sua candidatura vai às urnas em ${dataJogo(proximaEleicao(est))} contra quem ocupa as cadeiras.</p><div class="cargos">
      ${['dep_est', 'dep_fed', 'senador'].map(c => { const lv = Math.max(0, vagasLivres(est, c, uf)), oc = ocupantes(est, c, uf).length, meu = j.cargo?.cargo === c;
        return `<div class="cargo"><div><b>${CARGOS[c].nome}</b><div class="mut pq">${vagas(c, uf)} cadeiras · ${oc} de jogadores · ${lv ? `<span style="color:#9fd59a">${lv} vaga(s) livre(s)</span>` : '<span style="color:#f0928a">lotado</span>'}</div></div>
        ${meu ? '<span class="chip">seu cargo</span>' : `<button class="bt ${lv ? 'ouro' : ''} fino" data-j="${J({ tipo: 'candidatar', cargo: c })}">${lv ? 'Assumir vaga' : 'Disputar'}</button>`}</div>`; }).join('')}</div>
      <p class="mut pq">Governador(a) e prefeito(a) são os da vida real e não entram em disputa.</p></div>`;
  }
  if (j.cargo && !souPres) {
    h += `<div class="bloco"><h3>Mandato</h3><div class="acoes">${ACOES_MANDATO.filter(a => !a.cargos || a.cargos.includes(j.cargo.cargo)).map(a => `<button class="acao" data-j="${J({ tipo: 'mandato', acao: a.id })}" ${j.pc < a.pc ? 'disabled' : ''}><b>${a.nome}</b><span class="cust">${a.pc} capital</span><small>${esc(a.desc)}</small></button>`).join('')}
      <button class="acao" data-ir="congresso|${j.cargo.cargo === 'dep_est' ? 'ale:' + j.cargo.uf : j.cargo.cargo === 'senador' ? 'senado' : 'camara'}"><b>Ir para o plenário</b><small>Votar e propor projetos</small></button></div>
      <button class="bt fino" style="margin-top:.6rem" data-j="${J({ tipo: 'renunciar' })}" data-confirma="Renunciar ao mandato?">Renunciar</button></div>`;
  }
  h += `<div class="bloco"><h3>Simpatia do eleitorado · ${uf}</h3>${SEGMENTOS.map(s => { const v = j.simp[uf]?.[s.id] || 0;
    return `<div class="seg"><span>${esc(s.nome)}</span><div class="simp"><b style="${v >= 0 ? `left:50%;width:${v / 40 * 50}%;background:#6fae69` : `left:${50 + v / 40 * 50}%;width:${-v / 40 * 50}%;background:#c85a4e`}"></b></div><span class="num pq">${v > 0 ? '+' : ''}${Math.round(v)}</span></div>`; }).join('')}
    <p class="mut pq">População simulada. A distância entre a sua ideologia e a de cada segmento também pesa no voto.</p></div>`;
  return h;
}

function pEleicoes() {
  const est = S.est, ks = Object.keys(est.disputas);
  let h = `<div class="bloco"><h3>Próxima eleição <span class="chip">${dataJogo(proximaEleicao(est))}</span></h3><p class="mut pq" style="margin:0">A cada ${est.cfg.ciclo} meses de jogo as urnas são apuradas no fim do mês. Só há eleição onde há mais candidatos que cadeiras: com vaga sobrando, a posse é direta.</p></div>`;
  h += ks.length ? ks.map(k => blocoDisputa(k)).join('') : '<p class="mut">Nenhuma disputa aberta no momento.</p>';
  if (est.eleicoes.length) h += `<h3 class="tit ouro" style="margin:1rem 0 .3rem">Resultados</h3>` + est.eleicoes.slice(0, 12).map(r => `<div class="bloco"><h3>${CARGOS[r.cargo].curto} · ${r.uf}<span class="chip">${dataJogo(r.m)}</span></h3><table class="tab">${r.lista.map(x => `<tr><td>${x.eleito ? '<b class="ouro">ELEITO</b>' : '<span class="mut">não eleito</span>'}</td><td>${esc(x.nome)} ${chipP(x.partido)}</td><td class="num">${fmt(x.votos)}</td><td class="num">${x.pct}%</td></tr>`).join('')}</table></div>`).join('');
  return h;
}

function hemiciclo(est, casa) {
  const c = composicao(est, casa), seats = [];
  c.npc.forEach(b => { for (let i = 0; i < b.n; i++) seats.push({ cor: b.cor }); });
  const meuId = S.usuario.id;
  const jog = [...c.jogadores].sort((a, b) => partido(a.partido).e - partido(b.partido).e);
  // jogadores entram na ordem ideológica, destacados em dourado
  for (const j of jog) { const pe = partido(j.partido).e; let pos = seats.findIndex(s => s.cor && PARTIDOS.find(p => p.cor === s.cor)?.e >= pe); if (pos < 0) pos = seats.length; seats.splice(pos, 0, { cor: partido(j.partido).cor, jog: true, eu: j.id === meuId }); }
  const N = seats.length, linhas = Math.max(3, Math.round(Math.sqrt(N / 3.2))), R0 = 40, R1 = 95;
  const raios = Array.from({ length: linhas }, (_, i) => R0 + (R1 - R0) * i / (linhas - 1));
  const somaR = raios.reduce((a, b) => a + b, 0);
  let cont = raios.map(r => Math.round(N * r / somaR)); cont[linhas - 1] += N - cont.reduce((a, b) => a + b, 0);
  const pos = []; raios.forEach((r, i) => { for (let k = 0; k < cont[i]; k++) { const a = Math.PI * (cont[i] === 1 ? .5 : k / (cont[i] - 1)); pos.push({ a, r }); } });
  pos.sort((x, y) => y.a - x.a || x.r - y.r);
  const rr = Math.min(3.4, 150 / Math.sqrt(N) * 0.55);
  return `<svg viewBox="-102 -102 204 108" style="width:100%;display:block">${pos.map((p, i) => { const s = seats[i]; if (!s) return ''; const x = Math.cos(p.a) * p.r, y = -Math.sin(p.a) * p.r;
    return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${s.jog ? rr * 1.15 : rr}" fill="${s.cor}" ${s.jog ? `stroke="${s.eu ? '#fff' : '#E7CB86'}" stroke-width="${s.eu ? 1.4 : 0.9}"` : 'opacity=".85"'}/>`; }).join('')}
    <text x="0" y="-6" text-anchor="middle" font-size="13" font-weight="700" fill="#EDE0C4">${N}</text><text x="0" y="4" text-anchor="middle" font-size="5.5" fill="#A7A28F">${c.jogadores.length} jogadores · ${N - c.jogadores.length} simulados</text></svg>`;
}

function pCongresso() {
  const est = S.est, j = eu();
  const minhaAle = j.cargo?.cargo === 'dep_est' ? 'ale:' + j.cargo.uf : 'ale:' + j.uf;
  if (S.casa.startsWith('ale:') && S.casa !== minhaAle && !est.projetos.some(p => p.casa === S.casa)) S.casa = minhaAle;
  const casas = [['camara', 'Câmara'], ['senado', 'Senado'], [minhaAle, 'Assembleia ' + minhaAle.slice(4)]];
  const membro = membrosCasa(est, S.casa).some(m => m.id === j.id);
  const projs = est.projetos.filter(p => p.casa === S.casa && !p.fim);
  let h = `<div class="linha" style="margin-bottom:.5rem">${casas.map(([c, t]) => `<button class="bt fino ${S.casa === c ? 'ouro' : ''}" data-casa="${c}">${t}</button>`).join('')}</div>
    <div class="bloco"><h3>${nomeCasa(S.casa)}</h3>${hemiciclo(est, S.casa)}<p class="mut pq" style="margin:.3rem 0 0">Cadeiras com borda dourada são de jogadores${membro ? ' (a branca é a sua)' : ''}. As demais votam como as bancadas reais, por afinidade ideológica (simulação).</p></div>`;
  h += `<h3 class="tit ouro" style="margin:.8rem 0 .2rem">Em votação</h3>`;
  h += projs.length ? projs.map(p => { const pl = placar(est, p); const meu = p.votos[j.id];
    return `<div class="bloco"><h3>${esc(p.titulo)}<span class="chip">${p.tipo}</span></h3><p class="pq" style="margin:.1rem 0 .4rem">${esc(p.desc)}</p>
      <div class="mut pq">Autor(a): ${esc(p.autorNome)} · fecha na virada do mês${pl.exigido ? ` · precisa de ${pl.exigido} votos` : ' · maioria simples'}</div>
      <div class="pq" style="margin:.35rem 0">Projeção: <b style="color:#9fd59a">${pl.sim} sim</b> × <b style="color:#f0928a">${pl.nao} não</b> · ${pl.aprovado ? '<span class="ouro">passaria</span>' : '<span class="mut">cairia</span>'}</div>
      ${membro ? `<div class="voto">${['sim', 'nao', 'abst'].map(v => `<button class="bt fino ${meu === v ? 'on ouro' : ''}" data-j="${J({ tipo: 'votar', projeto: p.id, voto: v })}">${{ sim: 'Sim', nao: 'Não', abst: 'Abstenção' }[v]}</button>`).join('')}</div>` : '<span class="mut pq">Só membros desta casa votam.</span>'}</div>`; }).join('') : '<p class="mut pq">Nada em votação nesta casa.</p>';
  const casaPropor = j.cargo ? (j.cargo.cargo === 'dep_est' ? 'ale:' + j.cargo.uf : j.cargo.cargo === 'senador' ? 'senado' : 'camara') : null;
  if (casaPropor === S.casa) {
    const temProj = est.projetos.some(p => p.autor === j.id && !p.fim), ale = S.casa.startsWith('ale:');
    const usados = new Set([...est.projetos.filter(p => !p.fim).map(p => p.catalogo), ...est.leis.map(l => l.catalogo)]);
    h += `<div class="bloco"><h3>Propor projeto <span class="cust">3 capital</span></h3>${temProj ? '<p class="mut pq">Você já tem um projeto tramitando.</p>' : `<form id="fProj">
      ${ale ? '' : `<label class="campo"><span>Do debate nacional (catálogo da A Faixa)</span><select name="catalogo"><option value="">— escrever o meu —</option>${PROJETOS.filter(p => !usados.has(p.id)).map(p => `<option value="${p.id}">${esc(p.nome)} (${p.tipo})</option>`).join('')}</select></label><p class="pq mut" id="descCat"></p>`}
      <div id="livre"><label class="campo"><span>Título</span><input name="titulo" maxlength="120" placeholder="${ale ? 'Ex.: Passe livre estudantil no ônibus intermunicipal' : 'Ex.: Lei de incentivo à ferrovia'}"></label>
      <label class="campo"><span>O que o projeto faz</span><textarea name="desc" maxlength="700"></textarea></label>
      ${ale ? '' : `<label class="campo"><span>Tipo</span><select name="tipoLei"><option value="PL">Projeto de lei (maioria simples)</option><option value="PLP">Lei complementar (maioria absoluta)</option><option value="PEC">Emenda à Constituição (3/5 nas duas casas)</option></select></label>`}
      <label class="campo"><span>Economia: esquerda ← → direita</span><input name="e" type="range" min="-10" max="10" value="${Math.round(j.e)}"></label>
      <label class="campo"><span>Costumes: progressista ← → conservador</span><input name="s" type="range" min="-10" max="10" value="${Math.round(j.s)}"></label></div>
      <button class="bt ouro larg" ${j.pc < 3 ? 'disabled' : ''}>Protocolar</button></form>`}</div>`;
  }
  return h;
}

function pGoverno() {
  const est = S.est, j = eu(), pres = est.jogadores[est.presidente], souPres = pres.id === j.id, e = est.eco;
  let h = `<div class="ficha"><div class="retrato">${retrato(pres)}</div><div><div class="tit" style="font-size:1.2rem">${esc(pres.nome)}</div><div class="ouro pq">Presidente da República · ${chipP(pres.partido)}</div>
    <dl class="kv" style="margin-top:.5rem"><dt>Aprovação</dt><dd>${e.aprovacao}%</dd><dt>PIB</dt><dd>${e.pib.toFixed(1)}%</dd><dt>Inflação</dt><dd>${e.inflacao.toFixed(1)}%</dd><dt>Desemprego</dt><dd>${e.desemprego.toFixed(1)}%</dd><dt>Emendas</dt><dd>R$ ${(-e.caixa).toFixed(1)} bi</dd></dl></div></div>`;
  if (souPres) {
    const sanc = est.projetos.filter(p => p.casa === 'sancao' && !p.fim);
    h += `<div class="bloco"><h3>Mesa do presidente</h3><div class="acoes"><button class="acao" data-j="${J({ tipo: 'pronunciamento' })}" ${j.pc < 2 ? 'disabled' : ''}><b>Pronunciamento em rede nacional</b><span class="cust">2 capital</span><small>Sobe a aprovação do governo.</small></button>
      <button class="acao" data-ir="congresso|camara"><b>Enviar projeto ao Congresso</b><small>Do catálogo ou escrito por você</small></button></div></div>`;
    h += `<div class="bloco"><h3>Sanção ou veto</h3>${sanc.length ? sanc.map(p => `<div class="cargo"><div><b>${esc(p.titulo)}</b><div class="mut pq">${p.tipo} de ${esc(p.autorNome)}. Sem decisão até a virada, vira lei (sanção tácita).</div></div><div class="linha"><button class="bt ouro fino" data-j="${J({ tipo: 'sancionar', projeto: p.id, ok: true })}">Sancionar</button><button class="bt verm fino" data-j="${J({ tipo: 'sancionar', projeto: p.id, ok: false })}">Vetar</button></div></div>`).join('') : '<p class="mut pq">Nada aguardando sanção.</p>'}</div>`;
  }
  h += `<div class="bloco"><h3>Leis aprovadas</h3>${est.leis.length ? `<table class="tab">${est.leis.slice(0, 30).map(l => `<tr><td><span class="chip">${l.tipo}</span></td><td>${esc(l.titulo)}<div class="mut pq">${esc(l.autor)}${l.uf ? ' · ' + l.uf : ''} · ${dataJogo(l.m)}</div></td></tr>`).join('')}</table>` : '<p class="mut pq">Nenhuma lei ainda.</p>'}</div>`;
  return h;
}

function pJogadores() {
  const est = S.est, ord = { presidente: 0, senador: 1, dep_fed: 2, dep_est: 3 };
  const l = Object.values(est.jogadores).sort((a, b) => (ord[a.cargo?.cargo] ?? 9) - (ord[b.cargo?.cargo] ?? 9) || a.nome.localeCompare(b.nome));
  return `<table class="tab"><tr><th>Jogador</th><th>Cargo</th><th class="num">Fama</th></tr>${l.map(j => `<tr><td>${esc(j.nome)} ${chipP(j.partido)}${j.id === S.usuario.id ? ' <span class="ouro pq">(você)</span>' : ''}</td><td class="pq">${j.cargo ? (j.cargo.cargo === 'presidente' ? '<b class="ouro">Presidente</b>' : `${CARGOS[j.cargo.cargo].curto} · ${j.cargo.uf}`) : (j.cand ? '<span class="mut">candidato(a)</span>' : '<span class="mut">—</span>')}</td><td class="num">${Math.round(j.fama[j.cargo?.uf && j.cargo.uf !== 'BR' ? j.cargo.uf : j.uf] || 0)}</td></tr>`).join('')}</table>`;
}
function pJornal() {
  return S.est.noticias.map(n => `<div class="not"><small>${dataJogo(n.m)}</small>${esc(n.t)}</div>`).join('') || '<p class="mut">Sem notícias.</p>';
}
function pEstado() {
  const est = S.est, uf = S.uf; if (!uf) return '<p class="mut">Clique num estado no mapa.</p>';
  const E = estadoUF(uf), A = AUTORIDADES[uf];
  const pessoa = (rot, p) => p ? `<div class="cargo"><div><div class="mut pq">${rot}</div><b>${esc(p[0])}</b> ${p[1] ? chipP(p[1]) : ''}</div><span class="chip" title="Pessoa real, não jogável">vida real</span></div>` : '';
  const jogs = Object.values(est.jogadores).filter(j => j.uf === uf);
  let h = `<div class="bloco"><h3>Autoridades</h3><div class="cargos">${pessoa('Governador(a) · 2027–2030', A.gov)}${A.pref ? pessoa('Prefeito(a) de ' + A.cap, A.pref) : ''}</div>
    ${A.conf === false ? '<p class="mut pq">Dado da prefeitura a confirmar.</p>' : ''}<p class="mut pq">Pessoas reais, não jogáveis. Apoios e vetos no jogo são simulação.</p></div>`;
  h += `<div class="bloco"><h3>Cadeiras de ${uf}</h3><table class="tab"><tr><th>Cargo</th><th class="num">Total</th><th class="num">Jogadores</th><th class="num">Livres</th></tr>${['senador', 'dep_fed', 'dep_est'].map(c => `<tr><td>${CARGOS[c].curto}</td><td class="num">${vagas(c, uf)}</td><td class="num">${ocupantes(est, c, uf).length}</td><td class="num">${Math.max(0, vagasLivres(est, c, uf))}</td></tr>`).join('')}</table>
    <p class="mut pq">Eleitorado simulado: ~${fmt(155 * E.peso / 100 * 1e6 / 1e6)} milhões de eleitores.</p></div>`;
  h += Object.keys(est.disputas).filter(k => k.endsWith(':' + uf)).map(k => blocoDisputa(k)).join('');
  h += `<div class="bloco"><h3>Jogadores de ${uf}</h3>${jogs.length ? jogs.map(j => `<div class="pq" style="margin:.2rem 0">${esc(j.nome)} ${chipP(j.partido)} <span class="mut">${cargoTxt(j.cargo)}</span></div>`).join('') : '<p class="mut pq">Ninguém ainda. Vagas abertas!</p>'}</div>`;
  return h;
}

// ---------------------------------------------------------------- mapa
const MODOS = [['gov', 'Governadores'], ['jog', 'Jogadores'], ['fama', 'Sua fama'], ['disp', 'Disputas']];
function corUF(uf) {
  const est = S.est;
  if (S.modo === 'gov') return partido(AUTORIDADES[uf].gov[1]).cor;
  if (S.modo === 'jog') { const n = Object.values(est.jogadores).filter(j => j.uf === uf).length; return n ? `hsl(43,${40 + Math.min(n, 6) * 8}%,${62 - Math.min(n, 6) * 6}%)` : '#3B4A44'; }
  if (S.modo === 'fama') { const f = eu().fama[uf] || 0; return `hsl(2,${20 + f * .6}%,${30 + f * .3}%)`; }
  const n = Object.keys(est.disputas).filter(k => k.endsWith(':' + uf)).length; return n ? '#C8201E' : '#3B4A44';
}
function desenharMapa() {
  document.querySelectorAll('#mapa path.uf').forEach(p => { p.style.fill = corUF(p.dataset.uf); p.classList.toggle('sel', p.dataset.uf === S.uf && S.aba === 'estado'); });
  $('#modos').innerHTML = MODOS.map(([m, t]) => `<button class="${S.modo === m ? 'on' : ''}" data-m="${m}">${t}</button>`).join('');
  $('#modos').querySelectorAll('button').forEach(b => b.onclick = () => { S.modo = b.dataset.m; desenharMapa(); });
  let leg = '';
  if (S.modo === 'gov') { const ps = [...new Set(Object.values(AUTORIDADES).map(a => a.gov[1]))]; leg = `<b>Partido do governador (vida real)</b>` + ps.map(p => `<div><i style="background:${partido(p).cor}"></i>${esc(p)} · ${Object.values(AUTORIDADES).filter(a => a.gov[1] === p).length}</div>`).join(''); }
  if (S.modo === 'jog') leg = '<b>Jogadores por domicílio</b><div><i style="background:#3B4A44"></i>nenhum</div><div><i style="background:hsl(43,88%,26%)"></i>muitos</div>';
  if (S.modo === 'fama') leg = '<b>Quanto o eleitorado te conhece</b><div><i style="background:hsl(2,20%,30%)"></i>pouco</div><div><i style="background:hsl(2,80%,60%)"></i>muito</div>';
  if (S.modo === 'disp') leg = '<b>Estados com disputa aberta</b><div><i style="background:#C8201E"></i>há eleição marcada</div>';
  $('#leg').innerHTML = leg;
}
function dicaUF(uf) {
  const est = S.est, A = AUTORIDADES[uf], n = Object.values(est.jogadores).filter(j => j.uf === uf).length;
  return `<b class="ouro">${esc(estadoUF(uf).nome)}</b><br>Gov.: ${esc(A.gov[0])} (${esc(A.gov[1])})<br>${n} jogador(es) · ${FEDERAIS[uf]} dep. fed. · ${estaduais(uf)} dep. est.<br><span class="mut">Sua fama: ${Math.round(eu().fama[uf] || 0)}</span>`;
}

// ---------------------------------------------------------------- diário
function desenharDiario(pend) {
  const est = S.est, j = eu();
  const dicas = [];
  if (!j.cargo && !j.cand) dicas.push({ t: 'Você ainda não tem mandato. Lance uma candidatura: se houver vaga, a posse é na hora.', aba: 'perfil' });
  if (j.cargo && !est.projetos.some(p => p.autor === j.id && !p.fim) && j.pc >= 3) dicas.push({ t: 'Com mandato você pode propor projetos de lei.', aba: 'congresso' });
  $('#diario').innerHTML = `<div class="dh">Diário</div>
    ${pend.map(p => `<div class="item alerta">${esc(p.t)}<br><button class="bt fino" data-ir="${p.aba}|${p.casa || ''}">Ver</button></div>`).join('')}
    ${dicas.map(p => `<div class="item dica">${esc(p.t)}<br><button class="bt fino" data-ir="${p.aba}|">Abrir</button></div>`).join('')}
    <div class="item"><b>Próxima eleição:</b> ${dataJogo(proximaEleicao(est))} · ${Object.keys(est.disputas).length} disputa(s)</div>
    <div class="dh">Notícias</div>${est.noticias.slice(0, 25).map(n => `<div class="not"><small>${dataJogo(n.m)}</small>${esc(n.t)}</div>`).join('')}`;
  $('#diario').querySelectorAll('[data-ir]').forEach(b => b.onclick = () => { const [a, x] = b.dataset.ir.split('|'); S.aba = a; if (a === 'congresso' && x) S.casa = x; abrePainel(); desenhar(); });
}

// ================================================================ início
setInterval(() => { if (S.est && $('#jogo')) { const b = $('#bMes'); if (b && b.disabled) desenhar(); } }, 60e3);
(async () => {
  S.usuario = await tenta(() => api.sessao());
  if (S.usuario) abrirLobby(); else telaLogin();
})();
