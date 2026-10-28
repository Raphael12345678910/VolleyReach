-- Run once in the SQL Editor of your Supabase project.
create table if not exists public.athlete_workspaces (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null,
  revision bigint not null default 1,
  updated_at timestamptz not null default now(),
  constraint workspace_shape check (jsonb_typeof(data) = 'object' and data ?& array['profile', 'saved'] and jsonb_typeof(data->'profile') = 'object' and jsonb_typeof(data->'saved') = 'array'),
  constraint workspace_size check (octet_length(data::text) < 2000000)
);

alter table public.athlete_workspaces enable row level security;
revoke all on public.athlete_workspaces from public, anon;
grant select, insert, update, delete on public.athlete_workspaces to authenticated;

drop policy if exists "Read own workspace" on public.athlete_workspaces;
create policy "Read own workspace" on public.athlete_workspaces for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "Insert own workspace" on public.athlete_workspaces;
create policy "Insert own workspace" on public.athlete_workspaces for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists "Update own workspace" on public.athlete_workspaces;
create policy "Update own workspace" on public.athlete_workspaces for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists "Delete own workspace" on public.athlete_workspaces;
create policy "Delete own workspace" on public.athlete_workspaces for delete to authenticated using ((select auth.uid()) = user_id);

-- Compare-and-swap prevents two devices silently overwriting each other.
create or replace function public.save_workspace(workspace_data jsonb, expected_revision bigint)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare
  saved_revision bigint;
begin
  if auth.uid() is null then raise exception 'Sign in required' using errcode = '42501'; end if;
  if expected_revision = 0 then
    insert into public.athlete_workspaces(user_id, data, revision)
    values (auth.uid(), workspace_data, 1)
    on conflict (user_id) do nothing returning revision into saved_revision;
  else
    update public.athlete_workspaces set data = workspace_data, revision = revision + 1, updated_at = now()
    where user_id = auth.uid() and revision = expected_revision returning revision into saved_revision;
  end if;
  if saved_revision is null then raise exception 'Workspace changed on another device' using errcode = '40001'; end if;
  return jsonb_build_object('revision', saved_revision);
end;
$$;
revoke all on function public.save_workspace(jsonb, bigint) from public, anon;
grant execute on function public.save_workspace(jsonb, bigint) to authenticated;
