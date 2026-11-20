-- Open IPTV Pro / fresh Supabase project bootstrap.
-- Apply ONLY to a NEW, empty Supabase project after confirming the project
-- belongs to the intended GitHub-linked organization/account.
-- This file does not move, delete, or read users from any existing project.
begin;

create table if not exists public.openiptv_user_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  payload jsonb not null default '{}'::jsonb,
  revision bigint not null default 1 check (revision >= 1),
  updated_at timestamptz not null default now(),
  constraint openiptv_user_state_payload_is_object
    check (jsonb_typeof(payload) = 'object')
);

alter table public.openiptv_user_state enable row level security;

revoke all on table public.openiptv_user_state from public, anon;
grant select, insert, update, delete on table public.openiptv_user_state to authenticated;

drop policy if exists iptv_select_own on public.openiptv_user_state;
create policy iptv_select_own on public.openiptv_user_state
 for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists iptv_insert_own on public.openiptv_user_state;
create policy iptv_insert_own on public.openiptv_user_state
 for insert to authenticated with check ((select auth.uid()) = user_id);

drop policy if exists iptv_update_own on public.openiptv_user_state;
create policy iptv_update_own on public.openiptv_user_state
 for update to authenticated
 using ((select auth.uid()) = user_id)
 with check ((select auth.uid()) = user_id);

drop policy if exists iptv_delete_own on public.openiptv_user_state;
create policy iptv_delete_own on public.openiptv_user_state
 for delete to authenticated using ((select auth.uid()) = user_id);

commit;

-- Verification on target:
-- SELECT relrowsecurity FROM pg_class
-- WHERE oid = 'public.openiptv_user_state'::regclass;
-- SELECT policyname, cmd, roles FROM pg_policies
-- WHERE schemaname = 'public' AND tablename = 'openiptv_user_state';
