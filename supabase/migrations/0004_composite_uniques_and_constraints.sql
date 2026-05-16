-- Migration: per-tenant uniqueness, name validations and updated_at triggers.
-- Applied to the configured remote project via `supabase db push`.

-- =====================================================================
-- Per-tenant uniqueness
-- =====================================================================

create unique index if not exists teams_name_per_account_uniq
  on public.teams (account_id, lower(name));

create unique index if not exists players_display_name_per_account_uniq
  on public.players (account_id, lower(display_name));

create unique index if not exists invitations_email_per_account_uniq
  on public.invitations (account_id, lower(email))
  where accepted_at is null;

create unique index if not exists subscriptions_active_per_account_uniq
  on public.subscriptions (account_id)
  where status in ('trialing', 'active', 'past_due');

create unique index if not exists team_players_jersey_uniq
  on public.team_players (team_id, jersey_number)
  where jersey_number is not null;

-- =====================================================================
-- Display name sanity checks
-- =====================================================================

alter table public.accounts
  drop constraint if exists accounts_display_name_not_blank,
  add constraint accounts_display_name_not_blank
  check (length(btrim(display_name)) > 0);

alter table public.teams
  drop constraint if exists teams_name_not_blank,
  add constraint teams_name_not_blank
  check (length(btrim(name)) > 0);

alter table public.players
  drop constraint if exists players_display_name_not_blank,
  add constraint players_display_name_not_blank
  check (length(btrim(display_name)) > 0);

-- =====================================================================
-- updated_at trigger
-- =====================================================================

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

do $$
declare
  table_name text;
  touched_tables text[] := array[
    'profiles','accounts','subscriptions','teams','players','training_sessions'
  ];
begin
  foreach table_name in array touched_tables loop
    execute format('drop trigger if exists %I_touch_updated_at on public.%I',
      table_name, table_name);
    execute format(
      'create trigger %I_touch_updated_at before update on public.%I for each row execute function public.touch_updated_at()',
      table_name, table_name
    );
  end loop;
end $$;
