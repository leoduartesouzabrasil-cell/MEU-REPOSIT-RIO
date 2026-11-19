-- =====================================================================
-- CONCERTO DAS NAÇÕES — banco (projeto Supabase PRÓPRIO do jogo)
-- Rode no SQL Editor do Supabase, uma vez. Depois publique a função
-- supabase/functions/jogo (ver README).
--
-- Modelo: cada servidor guarda o mundo inteiro em "estado" (jsonb).
-- Os jogadores só LEEM direto do banco; toda jogada passa pela função
-- "jogo", que aplica js/regras.js com a chave de serviço e grava com
-- trava otimista (coluna versao).
-- =====================================================================

create table if not exists public.admins (
  id uuid primary key references auth.users on delete cascade
);

create table if not exists public.servidores (
  id                uuid primary key default gen_random_uuid(),
  nome              text not null check (char_length(nome) between 3 and 48),
  dono              uuid not null default auth.uid() references auth.users on delete cascade,
  dono_nome         text not null check (char_length(dono_nome) between 3 and 40),
  perfil_presidente jsonb not null,           -- {nome, partido, uf} do personagem presidente
  status            text not null default 'aguardando_pagamento'
                    check (status in ('aguardando_pagamento','ativo','encerrado')),
  pagamento         jsonb,                    -- anotações do admin (comprovante, data, valor)
  estado            jsonb,                    -- o mundo do jogo (null até ser liberado)
  versao            integer not null default 0,
  mes               integer not null default 0,
  jogadores         integer not null default 0,
  criado_em         timestamptz not null default now(),
  atualizado_em     timestamptz not null default now()
);
create index if not exists servidores_status on public.servidores (status);

create table if not exists public.membros (
  servidor uuid not null references public.servidores on delete cascade,
  jogador  uuid not null references auth.users on delete cascade,
  entrou_em timestamptz not null default now(),
  primary key (servidor, jogador)
);

create or replace function public.eh_admin() returns boolean
language sql stable security definer set search_path = public as
$$ select exists (select 1 from admins where id = auth.uid()) $$;

-- Quem cria um servidor não escolhe status nem estado: sempre nasce aguardando pagamento.
create or replace function public.servidor_novo() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  new.dono := auth.uid();
  new.status := 'aguardando_pagamento';
  new.estado := null; new.versao := 0; new.mes := 0; new.jogadores := 0; new.pagamento := null;
  if (select count(*) from servidores where dono = auth.uid() and status = 'aguardando_pagamento') >= 3 then
    raise exception 'Você já tem 3 servidores aguardando pagamento.';
  end if;
  return new;
end $$;
drop trigger if exists servidor_novo on public.servidores;
create trigger servidor_novo before insert on public.servidores
  for each row execute function public.servidor_novo();

alter table public.admins     enable row level security;
alter table public.servidores enable row level security;
alter table public.membros    enable row level security;

drop policy if exists "admin ve a si" on public.admins;
create policy "admin ve a si" on public.admins for select using (id = auth.uid());

-- O jogo é público: qualquer pessoa vê os servidores ativos (e o dono vê os seus pendentes).
drop policy if exists "ver servidores" on public.servidores;
create policy "ver servidores" on public.servidores for select
  using (status = 'ativo' or dono = auth.uid() or public.eh_admin());
drop policy if exists "criar servidor" on public.servidores;
create policy "criar servidor" on public.servidores for insert to authenticated
  with check (dono = auth.uid());
-- Sem política de update/delete: só a função (chave de serviço) altera servidores.

drop policy if exists "ver membros" on public.membros;
create policy "ver membros" on public.membros for select using (true);

-- Tempo real: avisa os navegadores quando o mundo de um servidor muda.
do $$ begin
  alter publication supabase_realtime add table public.servidores;
exception when others then null; end $$;

-- Para se tornar administrador (liberar servidores pagos), depois de criar sua conta no jogo:
--   insert into public.admins (id) select id from auth.users where email = 'SEU-EMAIL';
