-- Open IPTV Pro Web: one private JSON document per Supabase Auth user.
-- Run once in the project's SQL Editor. No service-role key is needed by the web.
begin;
create table if not exists public.openiptv_user_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  payload jsonb not null default '{}'::jsonb,
  revision bigint not null default 1 check (revision >= 1),
  updated_at timestamptz not null default now(),
  constraint openiptv_payload_object check (jsonb_typeof(payload) = 'object'),
  constraint openiptv_payload_size check (octet_length(payload::text) <= 2097152)
);
alter table public.openiptv_user_state enable row level security;
revoke all on table public.openiptv_user_state from public, anon;
grant select, insert, update, delete on table public.openiptv_user_state to authenticated;
drop policy if exists "iptv_select_own" on public.openiptv_user_state;
drop policy if exists "iptv_insert_own" on public.openiptv_user_state;
drop policy if exists "iptv_update_own" on public.openiptv_user_state;
drop policy if exists "iptv_delete_own" on public.openiptv_user_state;
create policy "iptv_select_own" on public.openiptv_user_state
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "iptv_insert_own" on public.openiptv_user_state
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "iptv_update_own" on public.openiptv_user_state
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "iptv_delete_own" on public.openiptv_user_state
  for delete to authenticated using ((select auth.uid()) = user_id);
commit;

-- Security validation:
-- Anonymous SELECT/INSERT must return 401/403 (no table privileges).
-- Two different authenticated users must never see or change each other's rows.
-- Data includes IPTV URLs (possibly credential-bearing); do not expose in public repos.
