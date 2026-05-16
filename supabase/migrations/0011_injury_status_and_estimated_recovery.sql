-- Add injury status enum and estimated recovery date for clinical follow-up.

do $$
begin
  if not exists (
    select 1
    from pg_type
    where typname = 'injury_status'
      and typnamespace = 'public'::regnamespace
  ) then
    create type public.injury_status as enum (
      'injured',
      'recovering',
      'recovered'
    );
  end if;
end;
$$;

alter table if exists public.injuries
  add column if not exists status public.injury_status,
  add column if not exists estimated_recovery_at timestamptz;

update public.injuries
set
  status = coalesce(status, 'injured'::public.injury_status),
  estimated_recovery_at = coalesce(estimated_recovery_at, resolved_at, diagnosed_at)
where status is null
   or estimated_recovery_at is null;

alter table public.injuries
  alter column status set not null,
  alter column estimated_recovery_at set not null,
  alter column status set default 'injured'::public.injury_status;
