-- Migration: telemetry samples partitioned by month + storage buckets.
-- Applied to the configured remote project via `supabase db push`.

-- =====================================================================
-- Partitioned parent table
-- =====================================================================

create table if not exists public.telemetry_samples (
  id uuid not null default gen_random_uuid(),
  account_id uuid not null references public.accounts(id) on delete cascade,
  upload_id uuid not null references public.telemetry_uploads(id) on delete cascade,
  player_id uuid references public.players(id) on delete set null,
  captured_at timestamptz not null,
  latitude double precision,
  longitude double precision,
  speed_mps numeric(6,3),
  heart_rate integer,
  payload jsonb,
  primary key (id, captured_at)
) partition by range (captured_at);

create index if not exists telemetry_samples_account_idx
  on public.telemetry_samples (account_id);

create index if not exists telemetry_samples_account_time_brin
  on public.telemetry_samples using brin (account_id, captured_at);

alter table public.telemetry_samples enable row level security;

drop policy if exists telemetry_samples_member_read on public.telemetry_samples;
create policy telemetry_samples_member_read on public.telemetry_samples
  for select using (public.is_account_member(account_id));

drop policy if exists telemetry_samples_staff_write on public.telemetry_samples;
create policy telemetry_samples_staff_write on public.telemetry_samples
  for all using (
    public.has_account_role(
      account_id,
      array['owner','administrator','technician']::account_role[]
    )
  ) with check (
    public.has_account_role(
      account_id,
      array['owner','administrator','technician']::account_role[]
    )
  );

-- =====================================================================
-- Initial monthly partitions (current and next 11 months)
-- =====================================================================

do $$
declare
  start_month date := date_trunc('month', now())::date;
  current_start date;
  current_end date;
  partition_name text;
begin
  for i in 0..11 loop
    current_start := (start_month + make_interval(months => i))::date;
    current_end := (start_month + make_interval(months => i + 1))::date;
    partition_name := format('telemetry_samples_%s', to_char(current_start, 'YYYY_MM'));
    execute format(
      'create table if not exists public.%I partition of public.telemetry_samples for values from (%L) to (%L)',
      partition_name,
      current_start::text,
      current_end::text
    );
  end loop;
end $$;

-- =====================================================================
-- Storage buckets + policies (idempotent)
-- =====================================================================

insert into storage.buckets (id, name, public)
values
  ('avatars', 'avatars', true),
  ('account-assets', 'account-assets', false),
  ('telemetry-raw', 'telemetry-raw', false),
  ('reports', 'reports', false)
on conflict (id) do nothing;

-- Avatars: any authenticated user reads, only the owner writes their own object.
drop policy if exists avatars_public_read on storage.objects;
create policy avatars_public_read on storage.objects
  for select using (bucket_id = 'avatars');

drop policy if exists avatars_owner_write on storage.objects;
create policy avatars_owner_write on storage.objects
  for all using (
    bucket_id = 'avatars'
    and split_part(name, '/', 1) = auth.uid()::text
  ) with check (
    bucket_id = 'avatars'
    and split_part(name, '/', 1) = auth.uid()::text
  );

-- Account-scoped buckets: only members can read; staff can write.
do $$
declare
  bucket_name text;
  scoped_buckets text[] := array['account-assets', 'telemetry-raw', 'reports'];
begin
  foreach bucket_name in array scoped_buckets loop
    execute format(
      'drop policy if exists %I on storage.objects',
      bucket_name || '_member_read'
    );
    execute format(
      'create policy %I on storage.objects for select using (bucket_id = %L and public.is_account_member(split_part(name, ''/'', 1)::uuid))',
      bucket_name || '_member_read',
      bucket_name
    );

    execute format(
      'drop policy if exists %I on storage.objects',
      bucket_name || '_staff_write'
    );
    execute format(
      'create policy %I on storage.objects for all using (bucket_id = %L and public.has_account_role(split_part(name, ''/'', 1)::uuid, array[''owner'',''administrator'',''technician'']::account_role[])) with check (bucket_id = %L and public.has_account_role(split_part(name, ''/'', 1)::uuid, array[''owner'',''administrator'',''technician'']::account_role[]))',
      bucket_name || '_staff_write',
      bucket_name,
      bucket_name
    );
  end loop;
end $$;
