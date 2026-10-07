-- New private snapshot store. Existing legacy tables are not used or modified.
create table if not exists public.ukos_snapshots (
  user_id uuid primary key references auth.users(id) on delete cascade,
  snapshot jsonb not null,
  revision bigint not null default 0 check (revision >= 0),
  last_mutation_id uuid not null,
  updated_at timestamptz not null default now()
);
alter table public.ukos_snapshots enable row level security;
revoke all on public.ukos_snapshots from anon, authenticated;
grant select, insert, update on public.ukos_snapshots to authenticated;
create policy "Read own UKOS snapshot" on public.ukos_snapshots for select to authenticated using ((select auth.uid()) = user_id);
create policy "Create own UKOS snapshot" on public.ukos_snapshots for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Update own UKOS snapshot" on public.ukos_snapshots for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create or replace function public.ukos_save_snapshot(p_snapshot jsonb, p_expected_revision bigint, p_mutation_id uuid)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare
  owner uuid := auth.uid();
  current_row public.ukos_snapshots%rowtype;
begin
  if owner is null then raise exception 'Sign in to save records'; end if;
  if p_snapshot is null or p_mutation_id is null or p_expected_revision is null or p_expected_revision < 0
     or p_snapshot->>'schemaVersion' is distinct from '1'
     or jsonb_typeof(p_snapshot->'data') is distinct from 'object'
     or jsonb_typeof(p_snapshot->'trash') is distinct from 'array'
     or octet_length(p_snapshot::text) > 20971520 then raise exception 'Invalid snapshot'; end if;
  perform pg_advisory_xact_lock(hashtextextended(owner::text, 0));
  select * into current_row from public.ukos_snapshots where user_id = owner for update;
  if found then
    if current_row.last_mutation_id = p_mutation_id then
      return jsonb_build_object('status','saved','record',to_jsonb(current_row));
    end if;
    if current_row.revision <> p_expected_revision then
      return jsonb_build_object('status','conflict','record',to_jsonb(current_row));
    end if;
    update public.ukos_snapshots set snapshot = p_snapshot, revision = revision + 1,
      last_mutation_id = p_mutation_id, updated_at = now() where user_id = owner returning * into current_row;
  else
    if p_expected_revision <> 0 then raise exception 'Snapshot revision mismatch'; end if;
    insert into public.ukos_snapshots(user_id,snapshot,revision,last_mutation_id)
      values(owner,p_snapshot,1,p_mutation_id) returning * into current_row;
  end if;
  return jsonb_build_object('status','saved','record',to_jsonb(current_row));
end;
$$;
revoke all on function public.ukos_save_snapshot(jsonb,bigint,uuid) from public, anon;
grant execute on function public.ukos_save_snapshot(jsonb,bigint,uuid) to authenticated;
