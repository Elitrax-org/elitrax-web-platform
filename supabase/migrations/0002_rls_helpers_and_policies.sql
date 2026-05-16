-- Migration: helpers + RLS policies for tenant-scoped tables.
-- Applied to the configured remote project via `supabase db push`.

-- =====================================================================
-- Helper functions
-- =====================================================================

create or replace function public.current_user_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select auth.uid();
$$;

create or replace function public.is_account_member(target_account uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.account_members am
    where am.account_id = target_account
      and am.user_id = auth.uid()
  );
$$;

create or replace function public.has_account_role(
  target_account uuid,
  allowed account_role[]
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.account_members am
    where am.account_id = target_account
      and am.user_id = auth.uid()
      and am.role = any(allowed)
  );
$$;

-- =====================================================================
-- Enable RLS
-- =====================================================================

alter table public.profiles enable row level security;
alter table public.accounts enable row level security;
alter table public.account_members enable row level security;
alter table public.invitations enable row level security;
alter table public.plans enable row level security;
alter table public.subscriptions enable row level security;
alter table public.subscription_usage enable row level security;
alter table public.teams enable row level security;
alter table public.players enable row level security;
alter table public.team_players enable row level security;
alter table public.player_measurements enable row level security;
alter table public.injuries enable row level security;
alter table public.player_comments enable row level security;
alter table public.training_sessions enable row level security;
alter table public.session_players enable row level security;
alter table public.gym_exercise_logs enable row level security;
alter table public.match_events enable row level security;
alter table public.telemetry_uploads enable row level security;
alter table public.session_player_metrics enable row level security;
alter table public.heatmap_tiles enable row level security;
alter table public.route_annotations enable row level security;
alter table public.recommendation_runs enable row level security;
alter table public.recommendation_candidates enable row level security;
alter table public.audit_logs enable row level security;

-- =====================================================================
-- Policies: profile is per-user
-- =====================================================================

drop policy if exists profiles_select_self on public.profiles;
create policy profiles_select_self on public.profiles
  for select using (id = auth.uid());

drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

-- =====================================================================
-- Policies: accounts visible to members; mutations restricted to owner/admin
-- =====================================================================

drop policy if exists accounts_select_member on public.accounts;
create policy accounts_select_member on public.accounts
  for select using (public.is_account_member(id));

drop policy if exists accounts_update_admin on public.accounts;
create policy accounts_update_admin on public.accounts
  for update using (public.has_account_role(id, array['owner','administrator']::account_role[]))
  with check (public.has_account_role(id, array['owner','administrator']::account_role[]));

drop policy if exists account_members_select on public.account_members;
create policy account_members_select on public.account_members
  for select using (public.is_account_member(account_id));

drop policy if exists account_members_admin_write on public.account_members;
create policy account_members_admin_write on public.account_members
  for all using (public.has_account_role(account_id, array['owner','administrator']::account_role[]))
  with check (public.has_account_role(account_id, array['owner','administrator']::account_role[]));

drop policy if exists invitations_admin_all on public.invitations;
create policy invitations_admin_all on public.invitations
  for all using (public.has_account_role(account_id, array['owner','administrator']::account_role[]))
  with check (public.has_account_role(account_id, array['owner','administrator']::account_role[]));

-- =====================================================================
-- Policies: plans are global read, billing tables restricted
-- =====================================================================

drop policy if exists plans_read_all on public.plans;
create policy plans_read_all on public.plans for select using (true);

drop policy if exists subscriptions_read on public.subscriptions;
create policy subscriptions_read on public.subscriptions
  for select using (public.is_account_member(account_id));

drop policy if exists subscriptions_admin_write on public.subscriptions;
create policy subscriptions_admin_write on public.subscriptions
  for all using (public.has_account_role(account_id, array['owner','administrator']::account_role[]))
  with check (public.has_account_role(account_id, array['owner','administrator']::account_role[]));

drop policy if exists subscription_usage_read on public.subscription_usage;
create policy subscription_usage_read on public.subscription_usage
  for select using (public.is_account_member(account_id));

drop policy if exists subscription_usage_admin_write on public.subscription_usage;
create policy subscription_usage_admin_write on public.subscription_usage
  for all using (public.has_account_role(account_id, array['owner','administrator']::account_role[]))
  with check (public.has_account_role(account_id, array['owner','administrator']::account_role[]));

-- =====================================================================
-- Generic tenant-scoped policy generator
-- All non-billing data: read for any member; write for coach/admin/owner roles.
-- =====================================================================

do $$
declare
  table_name text;
  read_tables text[] := array[
    'teams','players','team_players','player_measurements',
    'injuries','player_comments','training_sessions','session_players',
    'gym_exercise_logs','match_events','telemetry_uploads',
    'session_player_metrics','heatmap_tiles','route_annotations',
    'recommendation_runs','recommendation_candidates','audit_logs'
  ];
begin
  foreach table_name in array read_tables loop
    execute format(
      'drop policy if exists %I_member_read on public.%I',
      table_name, table_name
    );
    execute format(
      'create policy %I_member_read on public.%I for select using (public.is_account_member(account_id))',
      table_name, table_name
    );

    execute format(
      'drop policy if exists %I_staff_write on public.%I',
      table_name, table_name
    );
    execute format(
      'create policy %I_staff_write on public.%I for all using (public.has_account_role(account_id, array[''owner'',''administrator'',''technician'']::account_role[])) with check (public.has_account_role(account_id, array[''owner'',''administrator'',''technician'']::account_role[]))',
      table_name, table_name
    );
  end loop;
end $$;
