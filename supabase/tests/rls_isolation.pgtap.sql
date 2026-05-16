-- pgTAP matrix for RLS helper functions and tenant isolation policies.
-- Run after migrations in a local Supabase/Postgres with pgTAP enabled.

begin;

create extension if not exists pgtap;

select plan(25);

insert into auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
)
values
  (
    '00000000-0000-0000-0000-000000000101',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'owner-a@example.com',
    now(),
    '{}'::jsonb,
    '{}'::jsonb,
    now(),
    now()
  ),
  (
    '00000000-0000-0000-0000-000000000102',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'viewer-a@example.com',
    now(),
    '{}'::jsonb,
    '{}'::jsonb,
    now(),
    now()
  ),
  (
    '00000000-0000-0000-0000-000000000103',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'technician-a@example.com',
    now(),
    '{}'::jsonb,
    '{}'::jsonb,
    now(),
    now()
  ),
  (
    '00000000-0000-0000-0000-000000000201',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'owner-b@example.com',
    now(),
    '{}'::jsonb,
    '{}'::jsonb,
    now(),
    now()
  ),
  (
    '00000000-0000-0000-0000-000000000999',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'outsider@example.com',
    now(),
    '{}'::jsonb,
    '{}'::jsonb,
    now(),
    now()
  )
on conflict (id) do nothing;

insert into public.accounts (
  id,
  type,
  display_name,
  owner_user_id,
  country_code,
  city,
  address_line1,
  contact_email,
  contact_phone,
  billing_legal_name,
  billing_tax_id,
  billing_address
)
values
  (
    '10000000-0000-0000-0000-000000000001',
    'corporate',
    'Tenant A',
    '00000000-0000-0000-0000-000000000101',
    'US',
    'Austin',
    '1 Test Street',
    'tenant-a@example.com',
    '+10000000001',
    'Tenant A LLC',
    'TENANT-A',
    '{}'::jsonb
  ),
  (
    '20000000-0000-0000-0000-000000000001',
    'corporate',
    'Tenant B',
    '00000000-0000-0000-0000-000000000201',
    'US',
    'Denver',
    '2 Test Street',
    'tenant-b@example.com',
    '+10000000002',
    'Tenant B LLC',
    'TENANT-B',
    '{}'::jsonb
  );

insert into public.account_members (account_id, user_id, role, joined_at)
values
  (
    '10000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000101',
    'owner',
    now()
  ),
  (
    '10000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000102',
    'viewer',
    now()
  ),
  (
    '10000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000103',
    'technician',
    now()
  ),
  (
    '20000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000201',
    'owner',
    now()
  );

insert into public.teams (id, account_id, name, sport_type)
values
  (
    '10000000-0000-0000-0000-000000000101',
    '10000000-0000-0000-0000-000000000001',
    'Tenant A Team',
    'football'
  ),
  (
    '20000000-0000-0000-0000-000000000101',
    '20000000-0000-0000-0000-000000000001',
    'Tenant B Team',
    'rugby'
  );

select ok(
  to_regprocedure('public.current_user_id()') is not null,
  'current_user_id helper exists'
);

select ok(
  to_regprocedure('public.is_account_member(uuid)') is not null,
  'is_account_member helper exists'
);

select ok(
  to_regprocedure('public.has_account_role(uuid,account_role[])') is not null,
  'has_account_role helper exists'
);

select is(
  (
    select count(*)
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relname in (
        'accounts',
        'account_members',
        'teams',
        'players',
        'training_sessions',
        'telemetry_uploads',
        'telemetry_samples',
        'audit_logs'
      )
      and c.relrowsecurity
  ),
  8::bigint,
  'critical tenant tables have RLS enabled'
);

select is(
  public.is_account_member('00000000-0000-0000-0000-000000000000'::uuid),
  false,
  'is_account_member returns false for anonymous/unknown membership'
);

select is(
  public.has_account_role(
    '00000000-0000-0000-0000-000000000000'::uuid,
    array['owner']::public.account_role[]
  ),
  false,
  'has_account_role returns false for anonymous/unknown membership'
);

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000101', true);
select set_config('request.jwt.claim.role', 'authenticated', true);

select is(
  public.is_account_member('10000000-0000-0000-0000-000000000001'::uuid),
  true,
  'owner helper detects own tenant membership'
);

select is(
  public.has_account_role(
    '10000000-0000-0000-0000-000000000001'::uuid,
    array['owner']::public.account_role[]
  ),
  true,
  'owner helper detects allowed role'
);

select is(
  (select count(*) from public.accounts),
  1::bigint,
  'owner sees only their account'
);

select is(
  (select count(*) from public.teams),
  1::bigint,
  'owner sees only own tenant teams'
);

select throws_ok(
  $$ insert into public.teams (account_id, name, sport_type)
     values ('20000000-0000-0000-0000-000000000001', 'Cross Tenant Team', 'football') $$,
  '42501',
  'new row violates row-level security policy for table "teams"',
  'owner cannot insert into another tenant'
);

select lives_ok(
  $$ update public.teams
     set name = 'Tenant A Team Renamed'
     where id = '10000000-0000-0000-0000-000000000101' $$,
  'owner can update own tenant team'
);

select is(
  (
    select name
    from public.teams
    where id = '10000000-0000-0000-0000-000000000101'
  ),
  'Tenant A Team Renamed',
  'owner update is persisted inside own tenant'
);

reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000102', true);
select set_config('request.jwt.claim.role', 'authenticated', true);

select is(
  public.is_account_member('10000000-0000-0000-0000-000000000001'::uuid),
  true,
  'viewer helper detects own tenant membership'
);

select is(
  public.has_account_role(
    '10000000-0000-0000-0000-000000000001'::uuid,
    array['owner','administrator','technician']::public.account_role[]
  ),
  false,
  'viewer helper denies staff roles'
);

select is(
  (select count(*) from public.account_members),
  3::bigint,
  'viewer reads only members from own tenant'
);

select throws_ok(
  $$ insert into public.teams (account_id, name, sport_type)
     values ('10000000-0000-0000-0000-000000000001', 'Viewer Team', 'football') $$,
  '42501',
  'new row violates row-level security policy for table "teams"',
  'viewer cannot insert into own tenant'
);

select lives_ok(
  $$ update public.teams
     set name = 'Viewer Rewrite'
     where id = '10000000-0000-0000-0000-000000000101' $$,
  'viewer update statement is filtered by RLS'
);

select is(
  (
    select name
    from public.teams
    where id = '10000000-0000-0000-0000-000000000101'
  ),
  'Tenant A Team Renamed',
  'viewer cannot mutate own tenant team'
);

reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000103', true);
select set_config('request.jwt.claim.role', 'authenticated', true);

select lives_ok(
  $$ insert into public.teams (account_id, name, sport_type)
     values ('10000000-0000-0000-0000-000000000001', 'Technician Team', 'hockey') $$,
  'technician can insert into own tenant'
);

select is(
  (select count(*) from public.teams),
  2::bigint,
  'technician sees newly inserted own tenant team'
);

reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000999', true);
select set_config('request.jwt.claim.role', 'authenticated', true);

select is(
  public.is_account_member('10000000-0000-0000-0000-000000000001'::uuid),
  false,
  'outsider helper denies unknown membership'
);

select is(
  (select count(*) from public.accounts),
  0::bigint,
  'outsider sees no accounts'
);

select is(
  (select count(*) from public.teams),
  0::bigint,
  'outsider sees no tenant teams'
);

select throws_ok(
  $$ insert into public.teams (account_id, name, sport_type)
     values ('10000000-0000-0000-0000-000000000001', 'Outsider Team', 'football') $$,
  '42501',
  'new row violates row-level security policy for table "teams"',
  'outsider cannot insert into any tenant'
);

reset role;
select * from finish();

rollback;
