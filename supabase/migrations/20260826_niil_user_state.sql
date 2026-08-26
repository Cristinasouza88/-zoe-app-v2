-- Estado principal do NIIL por usuário autenticado.
create table if not exists public.niil_user_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  state jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.niil_user_state enable row level security;

drop policy if exists "niil_user_state_select_own" on public.niil_user_state;
create policy "niil_user_state_select_own"
on public.niil_user_state
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "niil_user_state_insert_own" on public.niil_user_state;
create policy "niil_user_state_insert_own"
on public.niil_user_state
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "niil_user_state_update_own" on public.niil_user_state;
create policy "niil_user_state_update_own"
on public.niil_user_state
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "niil_user_state_delete_own" on public.niil_user_state;
create policy "niil_user_state_delete_own"
on public.niil_user_state
for delete
to authenticated
using (auth.uid() = user_id);

comment on table public.niil_user_state is 'Estado principal do aplicativo NIIL sincronizado por usuário.';
