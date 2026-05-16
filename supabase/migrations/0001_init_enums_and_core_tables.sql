-- Migration: enums + core tenant-aware tables.
-- Applied to the configured remote project via `supabase db push`.

create extension if not exists "pgcrypto";
create extension if not exists "uuid-ossp";
create extension if not exists "citext" with schema extensions;

-- =====================================================================
-- Enums
-- =====================================================================

do $$ begin
  create type account_type as enum ('individual', 'corporate');
exception when duplicate_object then null; end $$;

do $$ begin
  create type account_role as enum (
    'owner',
    'administrator',
    'technician',
    'assistant',
    'viewer'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type plan_tier as enum ('basic', 'pro', 'pro_plus');
exception when duplicate_object then null; end $$;

do $$ begin
  create type subscription_status as enum (
    'trialing', 'active', 'past_due', 'canceled', 'incomplete'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type training_session_kind as enum (
    'team_training', 'gym', 'running', 'match', 'recovery', 'other'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type match_event_kind as enum (
    'goal', 'assist', 'shot', 'foul', 'yellow_card', 'red_card',
    'substitution', 'injury', 'note'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type telemetry_source as enum ('garmin', 'polar', 'apple_health', 'manual', 'other');
exception when duplicate_object then null; end $$;

do $$ begin
  create type recommendation_status as enum ('queued', 'running', 'succeeded', 'failed');
exception when duplicate_object then null; end $$;

-- =====================================================================
-- Identity & Tenancy
-- =====================================================================

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  preferred_locale text not null default 'en',
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.accounts (
  id uuid primary key default gen_random_uuid(),
  type account_type not null,
  display_name text not null,
  owner_user_id uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.account_members (
  account_id uuid not null references public.accounts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role account_role not null,
  invited_at timestamptz,
  joined_at timestamptz,
  created_at timestamptz not null default now(),
  primary key (account_id, user_id)
);

create index if not exists account_members_user_idx on public.account_members(user_id);

create table if not exists public.invitations (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts(id) on delete cascade,
  email extensions.citext,
  role account_role not null,
  token uuid not null default gen_random_uuid(),
  expires_at timestamptz not null,
  accepted_at timestamptz,
  created_at timestamptz not null default now()
);

-- =====================================================================
-- Billing
-- =====================================================================

create table if not exists public.plans (
  id uuid primary key default gen_random_uuid(),
  tier plan_tier not null unique,
  display_name text not null,
  player_limit integer,
  team_limit integer,
  created_at timestamptz not null default now()
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts(id) on delete cascade,
  plan_id uuid not null references public.plans(id) on delete restrict,
  status subscription_status not null,
  current_period_start timestamptz,
  current_period_end timestamptz,
  external_provider text,
  external_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists subscriptions_account_idx on public.subscriptions(account_id);

create table if not exists public.subscription_usage (
  account_id uuid primary key references public.accounts(id) on delete cascade,
  player_count integer not null default 0,
  team_count integer not null default 0,
  updated_at timestamptz not null default now()
);

-- =====================================================================
-- Teams & Roster
-- =====================================================================

create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts(id) on delete cascade,
  name text not null,
  category text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists teams_account_idx on public.teams(account_id);

create table if not exists public.players (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  display_name text not null,
  birth_date date,
  position text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists players_account_idx on public.players(account_id);

create table if not exists public.team_players (
  team_id uuid not null references public.teams(id) on delete cascade,
  player_id uuid not null references public.players(id) on delete cascade,
  account_id uuid not null references public.accounts(id) on delete cascade,
  jersey_number integer,
  joined_at timestamptz not null default now(),
  primary key (team_id, player_id)
);

create index if not exists team_players_account_idx on public.team_players(account_id);

create table if not exists public.player_measurements (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts(id) on delete cascade,
  player_id uuid not null references public.players(id) on delete cascade,
  taken_at timestamptz not null default now(),
  height_centimeters numeric(5,2),
  weight_kilograms numeric(5,2),
  body_fat_percentage numeric(4,2),
  notes text
);

-- =====================================================================
-- Health & Injuries
-- =====================================================================

create table if not exists public.injuries (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts(id) on delete cascade,
  player_id uuid not null references public.players(id) on delete cascade,
  diagnosed_at timestamptz not null,
  resolved_at timestamptz,
  body_zone_detail integer not null check (body_zone_detail between 0 and 127),
  severity text,
  description text
);

create index if not exists injuries_player_idx on public.injuries(player_id);

create table if not exists public.player_comments (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts(id) on delete cascade,
  player_id uuid not null references public.players(id) on delete cascade,
  author_user_id uuid references auth.users(id) on delete set null,
  body text not null,
  created_at timestamptz not null default now()
);

-- =====================================================================
-- Training & Performance
-- =====================================================================

create table if not exists public.training_sessions (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts(id) on delete cascade,
  team_id uuid references public.teams(id) on delete set null,
  kind training_session_kind not null,
  scheduled_for timestamptz not null,
  duration_seconds integer,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists training_sessions_account_idx on public.training_sessions(account_id);

create table if not exists public.session_players (
  session_id uuid not null references public.training_sessions(id) on delete cascade,
  player_id uuid not null references public.players(id) on delete cascade,
  account_id uuid not null references public.accounts(id) on delete cascade,
  primary key (session_id, player_id)
);

create table if not exists public.gym_exercise_logs (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts(id) on delete cascade,
  session_id uuid not null references public.training_sessions(id) on delete cascade,
  player_id uuid not null references public.players(id) on delete cascade,
  exercise_id text not null,
  performed_at timestamptz not null default now(),
  sets jsonb not null
);

-- =====================================================================
-- Match Mode
-- =====================================================================

create table if not exists public.match_events (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts(id) on delete cascade,
  session_id uuid not null references public.training_sessions(id) on delete cascade,
  occurred_at timestamptz not null default now(),
  match_minute integer,
  kind match_event_kind not null,
  player_id uuid references public.players(id) on delete set null,
  payload jsonb not null default '{}'::jsonb
);

create index if not exists match_events_session_idx on public.match_events(session_id);

-- =====================================================================
-- Telemetry
-- =====================================================================

create table if not exists public.telemetry_uploads (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts(id) on delete cascade,
  player_id uuid references public.players(id) on delete set null,
  session_id uuid references public.training_sessions(id) on delete set null,
  source telemetry_source not null,
  storage_path text not null,
  uploaded_at timestamptz not null default now(),
  processed_at timestamptz
);

-- Telemetry samples are partitioned in 0003 migration.

create table if not exists public.session_player_metrics (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts(id) on delete cascade,
  session_id uuid not null references public.training_sessions(id) on delete cascade,
  player_id uuid not null references public.players(id) on delete cascade,
  total_distance_meters numeric(10,2),
  total_duration_seconds integer,
  average_speed_mps numeric(6,3),
  max_speed_mps numeric(6,3),
  zones jsonb,
  computed_at timestamptz not null default now(),
  unique (session_id, player_id)
);

create table if not exists public.heatmap_tiles (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts(id) on delete cascade,
  session_id uuid not null references public.training_sessions(id) on delete cascade,
  player_id uuid references public.players(id) on delete set null,
  tile_x integer not null,
  tile_y integer not null,
  intensity numeric(6,3) not null,
  computed_at timestamptz not null default now()
);

create index if not exists heatmap_tiles_session_idx on public.heatmap_tiles(session_id);

create table if not exists public.route_annotations (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts(id) on delete cascade,
  session_id uuid not null references public.training_sessions(id) on delete cascade,
  label text not null,
  latitude double precision not null,
  longitude double precision not null,
  notes text
);

-- =====================================================================
-- AI Recommendations
-- =====================================================================

create table if not exists public.recommendation_runs (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts(id) on delete cascade,
  requested_by uuid references auth.users(id) on delete set null,
  status recommendation_status not null default 'queued',
  model text,
  prompt jsonb,
  result jsonb,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists public.recommendation_candidates (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts(id) on delete cascade,
  run_id uuid not null references public.recommendation_runs(id) on delete cascade,
  player_id uuid not null references public.players(id) on delete cascade,
  rank integer not null,
  score numeric(6,3) not null,
  reasons jsonb not null default '[]'::jsonb
);

-- =====================================================================
-- Audit
-- =====================================================================

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts(id) on delete cascade,
  actor_user_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists audit_logs_account_created_idx
  on public.audit_logs(account_id, created_at desc);
