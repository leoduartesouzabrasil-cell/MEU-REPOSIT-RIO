// =====================================================================
// CONCERTO DAS NAÇÕES — acesso aos dados
// Dois "back-ends" com a mesma interface:
//  - Online (Supabase): login real, servidores compartilhados, a função
//    "jogo" aplica as regras no servidor (ninguém trapaceia pelo navegador).
//  - Demonstração: tudo no localStorage, com jogadores-robô.
// =====================================================================
import { CONFIG } from './config.js';
import { aplicar, novoServidor, vagasLivres, proximaEleicao } from './regras.js';
import { PARTIDOS, ESTADOS, PROJETOS } from './dados-faixa.js';
import { ACOES_CAMPANHA, SEGMENTOS } from './dados.js';

const online = !!(CONFIG.SUPABASE_URL && CONFIG.SUPABASE_ANON_KEY);

// ------------------------------------------------------------------ demo
function demoApi() {
  const K = 'concerto_demo_v1';
  const ler = () => { try { return JSON.parse(localStorage.getItem(K)) || { servidores: {}, usuario: null }; } catch { return { servidores: {}, usuario: null }; } };
  const gravar = d => { try { localStorage.setItem(K, JSON.stringify(d)); } catch {} };
  let mem = ler();
  const salvar = () => gravar(mem);
  const resumo = s => ({ id: s.id, nome: s.nome, status: s.status, dono: s.dono, dono_nome: s.dono_nome, mes: s.estado?.mes || 0,
    jogadores: s.estado ? Object.keys(s.estado.jogadores).length : 0, criado_em: s.criado, souMembro: !!s.estado?.jogadores[mem.usuario?.id] });

  const NOMES = ['Rosa Teixeira','Caio Menezes','Dandara Lopes','Heitor Valadares','Iara Monteiro','Joaquim Brandão','Luzia Coutinho','Otávio Prado',
    'Benedita Falcão','Raimundo Diniz','Cecília Andrade','Severino Campos','Marta Siqueira','Edson Barreto','Tainá Queiroz','Wesley Pacheco'];
  function semearRobos(s) {
    let est = s.estado; const r = Math.random;
    NOMES.slice(0, 14).forEach((nome, i) => {
      const p = PARTIDOS[Math.floor(r() * PARTIDOS.length)], uf = ['SP','RJ','MG','BA','RR','AP','PE','RS','CE','PA','DF','AC','SE','AM'][i];
      est = aplicar(est, 'bot' + i, { tipo: 'entrar', nome, partido: p.id, uf }, Date.now(), r).est;
      const cargo = ['senador','dep_fed','dep_est'][i % 3];
      try { est = aplicar(est, 'bot' + i, { tipo: 'candidatar', cargo }, Date.now(), r).est; } catch {}
    });
    s.estado = est;
  }
  function robosJogam(s) {
    let est = s.estado; const r = Math.random;
    for (const id of Object.keys(est.jogadores).filter(x => x.startsWith('bot'))) {
      const tenta = a => { try { est = aplicar(est, id, a, Date.now(), r).est; } catch {} };
      const j = est.jogadores[id];
      if (j.cand || (j.cargo && est.disputas[`${j.cargo.cargo}:${j.cargo.uf}`])) {
        for (let n = 0; n < 3; n++) { const ac = ACOES_CAMPANHA[Math.floor(r() * ACOES_CAMPANHA.length)]; tenta({ tipo: 'campanha', acao: ac.id, seg: SEGMENTOS[Math.floor(r() * 7)].id }); }
      }
      if (j.cargo) {
        for (const p of est.projetos.filter(p => !p.fim)) tenta({ tipo: 'votar', projeto: p.id, voto: Math.hypot(p.e - j.e, p.s - j.s) < 6 ? 'sim' : 'nao' });
        if (r() < 0.15) { const c = PROJETOS[Math.floor(r() * PROJETOS.length)];
          if (j.cargo.cargo === 'dep_est') tenta({ tipo: 'propor', titulo: 'Programa estadual de ' + ['creches','segurança no campo','merenda escolar','saneamento','turismo'][Math.floor(r() * 5)], desc: 'Projeto estadual.', e: j.e, s: j.s });
          else tenta({ tipo: 'propor', catalogo: c.id }); }
        if (r() < 0.3) tenta({ tipo: 'mandato', acao: 'discurso' });
      } else if (!j.cand && r() < 0.35) tenta({ tipo: 'candidatar', cargo: ['senador','dep_fed','dep_est'][Math.floor(r() * 3)] });
    }
    s.estado = est;
  }
  const ouvintes = new Set();
  addEventListener('storage', e => { if (e.key === K) { mem = ler(); ouvintes.forEach(f => f()); } });

  return {
    modo: 'demo',
    async sessao() { return mem.usuario; },
    async entrarEmail(email) { const nome = (email.split('@')[0] || 'jogador'); mem.usuario = { id: 'u_' + btoa(unescape(encodeURIComponent(email))).replace(/[=+/]/g, ''), email, nome }; salvar(); return { usuario: mem.usuario }; },
    async criarConta(email) { return this.entrarEmail(email); },
    async linkMagico(email) { await this.entrarEmail(email); return { usuario: mem.usuario }; },
    async sair() { mem.usuario = null; salvar(); },
    async souAdmin() { return true; }, // na demo você é o administrador
    async listar() { return Object.values(mem.servidores).map(resumo).sort((a, b) => b.criado_em - a.criado_em); },
    async criar(nome, perfil) {
      if (!mem.usuario) throw new Error('Faça login.');
      novoServidor({ id: 'x', nome, dono: 'x', perfil, agora: 0 }); // valida
      const id = 'srv' + Date.now().toString(36);
      mem.servidores[id] = { id, nome: nome.trim(), dono: mem.usuario.id, dono_nome: perfil.nome, perfil, status: 'aguardando_pagamento', criado: Date.now(), estado: null };
      salvar(); return resumo(mem.servidores[id]);
    },
    async pendentes() { return Object.values(mem.servidores).filter(s => s.status === 'aguardando_pagamento').map(resumo); },
    async liberar(id) {
      const s = mem.servidores[id]; s.status = 'ativo';
      s.estado = novoServidor({ id, nome: s.nome, dono: s.dono, perfil: s.perfil, agora: Date.now(), cfg: { intervaloPresidente: 0, intervaloLivre: 0 } });
      semearRobos(s); salvar(); return resumo(s);
    },
    async abrir(id) { const s = mem.servidores[id]; if (!s?.estado) throw new Error('Servidor indisponível.'); return s.estado; },
    async jogar(id, acao) {
      const s = mem.servidores[id];
      if (acao.tipo === 'passar_mes') robosJogam(s);
      const { est, msg } = aplicar(s.estado, mem.usuario.id, acao, Date.now());
      s.estado = est; salvar(); return { estado: est, msg };
    },
    assinar(id, f) { const g = () => f(); ouvintes.add(g); return () => ouvintes.delete(g); },
    async apagarDemo() { mem = { servidores: {}, usuario: mem.usuario }; salvar(); },
  };
}

// ---------------------------------------------------------------- online
function onlineApi() {
  const sb = window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
  let usuario = null;
  const doUser = u => u ? { id: u.id, email: u.email, nome: u.user_metadata?.nome || u.email.split('@')[0] } : null;
  const ok = ({ data, error }) => { if (error) throw new Error(error.message); return data; };
  async function funcao(corpo) {
    const { data, error } = await sb.functions.invoke('jogo', { body: corpo });
    if (error) { let m = error.message; try { m = (await error.context.json()).erro || m; } catch {} throw new Error(m); }
    if (data?.erro) throw new Error(data.erro);
    return data;
  }
  return {
    modo: 'online',
    async sessao() { const { data } = await sb.auth.getSession(); usuario = doUser(data.session?.user); return usuario; },
    async entrarEmail(email, senha) { const d = ok(await sb.auth.signInWithPassword({ email, password: senha })); usuario = doUser(d.user); return { usuario }; },
    async criarConta(email, senha, nome) {
      const d = ok(await sb.auth.signUp({ email, password: senha, options: { data: { nome }, emailRedirectTo: location.href.split('#')[0] } }));
      usuario = doUser(d.session?.user); return { usuario, confirmar: !d.session };
    },
    async linkMagico(email) { ok(await sb.auth.signInWithOtp({ email, options: { emailRedirectTo: location.href.split('#')[0] } })); return { enviado: true }; },
    async sair() { await sb.auth.signOut(); usuario = null; },
    async souAdmin() { if (!usuario) return false; const d = ok(await sb.from('admins').select('id').eq('id', usuario.id)); return d.length > 0; },
    async listar() {
      const d = ok(await sb.from('servidores').select('id,nome,status,dono,dono_nome,mes,jogadores,criado_em').order('jogadores', { ascending: false }).limit(200));
      const meus = usuario ? ok(await sb.from('membros').select('servidor').eq('jogador', usuario.id)).map(x => x.servidor) : [];
      return d.map(s => ({ ...s, criado_em: Date.parse(s.criado_em), souMembro: meus.includes(s.id) }));
    },
    async criar(nome, perfil) {
      if (!usuario) throw new Error('Faça login.');
      novoServidor({ id: 'x', nome, dono: 'x', perfil, agora: 0 });
      return ok(await sb.from('servidores').insert({ nome: nome.trim(), dono_nome: perfil.nome, perfil_presidente: perfil }).select('id,nome,status,dono,dono_nome,mes,jogadores,criado_em').single());
    },
    async pendentes() { return ok(await sb.from('servidores').select('id,nome,status,dono,dono_nome,mes,jogadores,criado_em').eq('status', 'aguardando_pagamento')); },
    async liberar(id) { return funcao({ op: 'liberar', servidor: id }); },
    async abrir(id) { const d = ok(await sb.from('servidores').select('estado').eq('id', id).single()); if (!d.estado) throw new Error('Servidor ainda não liberado.'); return d.estado; },
    async jogar(id, acao) { return funcao({ op: 'jogar', servidor: id, acao }); },
    assinar(id, f) {
      const ch = sb.channel('srv-' + id).on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'servidores', filter: `id=eq.${id}` }, () => f()).subscribe();
      return () => sb.removeChannel(ch);
    },
  };
}

export const api = online ? onlineApi() : demoApi();
export { vagasLivres, proximaEleicao };
