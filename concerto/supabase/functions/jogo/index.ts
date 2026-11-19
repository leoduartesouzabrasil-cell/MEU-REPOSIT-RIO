// =====================================================================
// CONCERTO DAS NAÇÕES — função "jogo" (Supabase Edge Function, Deno)
// Aplica as regras (as mesmas do navegador, copiadas em ../_shared pelo
// script ferramentas/sincronizar-funcao.sh) e grava o novo estado.
//   POST { op:'jogar',   servidor, acao }  -> { estado, msg }
//   POST { op:'liberar', servidor }        -> { ok }   (só administradores)
// =====================================================================
import { createClient } from 'npm:@supabase/supabase-js@2.45.4';
import { aplicar, novoServidor } from '../_shared/regras.js';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const resp = (corpo: unknown, status = 200) =>
  new Response(JSON.stringify(corpo), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return resp('ok');
  try {
    const url = Deno.env.get('SUPABASE_URL')!;
    const servico = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const token = (req.headers.get('Authorization') || '').replace('Bearer ', '');
    const { data: u } = await servico.auth.getUser(token);
    if (!u?.user) return resp({ erro: 'Faça login para jogar.' }, 401);
    const quem = u.user.id;
    const { op, servidor, acao } = await req.json();
    if (typeof servidor !== 'string') return resp({ erro: 'Servidor inválido.' }, 400);

    if (op === 'liberar') {
      const { data: adm } = await servico.from('admins').select('id').eq('id', quem);
      if (!adm?.length) return resp({ erro: 'Só administradores liberam servidores.' }, 403);
      const { data: s } = await servico.from('servidores').select('*').eq('id', servidor).single();
      if (!s || s.status !== 'aguardando_pagamento') return resp({ erro: 'Servidor não está aguardando pagamento.' }, 400);
      const estado = novoServidor({ id: s.id, nome: s.nome, dono: s.dono, perfil: s.perfil_presidente, agora: Date.now() });
      const { error } = await servico.from('servidores').update({
        status: 'ativo', estado, versao: 1, jogadores: 1, atualizado_em: new Date().toISOString(),
        pagamento: { liberado_por: quem, em: new Date().toISOString() },
      }).eq('id', s.id).eq('status', 'aguardando_pagamento');
      if (error) throw error;
      await servico.from('membros').upsert({ servidor: s.id, jogador: s.dono });
      return resp({ ok: true });
    }

    if (op !== 'jogar' || !acao || typeof acao.tipo !== 'string') return resp({ erro: 'Operação inválida.' }, 400);
    for (let tentativa = 0; tentativa < 5; tentativa++) {
      const { data: s, error } = await servico.from('servidores').select('estado,versao,status').eq('id', servidor).single();
      if (error || !s) return resp({ erro: 'Servidor não encontrado.' }, 404);
      if (s.status !== 'ativo') return resp({ erro: 'Servidor não está ativo.' }, 400);
      let r;
      try { r = aplicar(s.estado, quem, acao, Date.now()); }
      catch (e) { return resp({ erro: (e as Error).message }, 400); }
      const { data: gravou, error: e2 } = await servico.from('servidores').update({
        estado: r.est, versao: s.versao + 1, mes: r.est.mes, jogadores: Object.keys(r.est.jogadores).length,
        atualizado_em: new Date().toISOString(),
      }).eq('id', servidor).eq('versao', s.versao).select('id');
      if (e2) throw e2;
      if (gravou && gravou.length) {
        if (acao.tipo === 'entrar') await servico.from('membros').upsert({ servidor, jogador: quem });
        return resp({ estado: r.est, msg: r.msg });
      }
      // outro jogador gravou ao mesmo tempo: relê e tenta de novo
    }
    return resp({ erro: 'Servidor ocupado, tente de novo.' }, 409);
  } catch (e) {
    console.error(e);
    return resp({ erro: 'Erro interno.' }, 500);
  }
});
