-- Financeiro: persistência normalizada de transações no Postgres (Supabase).
-- Rode este script uma vez no SQL Editor do projeto Supabase (não é aplicado
-- automaticamente pelo build/deploy). Substitui o armazenamento anterior via
-- Netlify Blobs (functions/financeiro-data.mjs, removido).

create extension if not exists pgcrypto;

create table public.financial_imports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  arquivo text not null,
  linhas_lidas int not null default 0,
  linhas_importadas int not null default 0,
  criado_em timestamptz not null default now()
);

create table public.financial_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  import_id uuid references public.financial_imports(id) on delete set null,
  row_number int,
  source_hash text not null,
  data date not null,
  descricao text not null,
  valor numeric(12,2) not null check (valor > 0),
  tipo text not null check (tipo in ('entrada','saida')),
  conta text not null default '',
  categoria text not null default 'Outros',
  subcategoria text not null default '',
  natureza text not null default '',
  confianca text not null default '',
  competencia_analitica text not null default '',
  impacto_receita numeric(12,2) not null default 0,
  impacto_despesa numeric(12,2) not null default 0,
  ignorar_resumo boolean not null default false,
  transferencia_interna boolean not null default false,
  pagamento_fatura boolean not null default false,
  status_conciliacao text not null default 'aguardando' check (status_conciliacao in ('aguardando','conciliado')),
  origem_documento text not null default '',
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  constraint financial_transactions_user_hash_uniq unique (user_id, source_hash)
);

create index financial_transactions_user_mes_idx on public.financial_transactions (user_id, competencia_analitica);
create index financial_transactions_user_data_idx on public.financial_transactions (user_id, data);
create index financial_transactions_import_idx on public.financial_transactions (import_id);

alter table public.financial_imports enable row level security;
alter table public.financial_transactions enable row level security;

create policy financial_imports_own_rows on public.financial_imports
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy financial_transactions_own_rows on public.financial_transactions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create or replace function public.financeiro_set_atualizado_em()
returns trigger language plpgsql as $$
begin
  new.atualizado_em = now();
  return new;
end;
$$;

create trigger financial_transactions_set_atualizado_em
  before update on public.financial_transactions
  for each row execute function public.financeiro_set_atualizado_em();
