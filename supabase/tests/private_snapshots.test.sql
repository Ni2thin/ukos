begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;
select plan(11);
insert into auth.users(id,email) values
 ('11111111-1111-4111-8111-111111111111','ukos-test-a@example.invalid'),
 ('22222222-2222-4222-8222-222222222222','ukos-test-b@example.invalid');
set local role authenticated;
select set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',true);
select is(public.ukos_save_snapshot('{"schemaVersion":1,"data":{},"trash":[]}',0,'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa')->>'status','saved','owner creates own snapshot');
select is((select revision::integer from public.ukos_snapshots),1,'first revision is one');
select is(public.ukos_save_snapshot('{"schemaVersion":1,"data":{},"trash":[]}',0,'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa')->>'status','saved','same mutation retry is idempotent');
select is((select revision::integer from public.ukos_snapshots),1,'retry does not increment revision');
select is(public.ukos_save_snapshot('{"schemaVersion":1,"data":{},"trash":[]}',0,'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb')->>'status','conflict','stale revision is rejected');
select set_config('request.jwt.claim.sub','22222222-2222-4222-8222-222222222222',true);
select is((select count(*)::integer from public.ukos_snapshots),0,'second account cannot read first account');
select throws_ok($$insert into public.ukos_snapshots(user_id,snapshot,revision,last_mutation_id) values('11111111-1111-4111-8111-111111111111','{}',1,'cccccccc-cccc-4ccc-8ccc-cccccccccccc')$$,'42501',null,'second account cannot insert another owner');
select lives_ok($$update public.ukos_snapshots set revision=99 where user_id='11111111-1111-4111-8111-111111111111'$$,'cross-account update executes with no matching rows');
select set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',true);
select is((select revision::integer from public.ukos_snapshots),1,'other account did not change the owner revision');
reset role;
set local role anon;
select throws_ok($$select * from public.ukos_snapshots$$,'42501',null,'anonymous account cannot read snapshots');
select throws_ok($$select public.ukos_save_snapshot('{"schemaVersion":1,"data":{},"trash":[]}',0,'dddddddd-dddd-4ddd-8ddd-dddddddddddd')$$,'42501',null,'anonymous account cannot call save RPC');
reset role;
select * from finish();
rollback;
