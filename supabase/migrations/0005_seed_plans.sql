-- Migration: seed canonical plans rows.
-- Applied to the configured remote project via `supabase db push`. Idempotent via tier unique key.

insert into public.plans (tier, display_name, player_limit, team_limit)
values
  ('basic',    'Basic',    22,    1),
  ('pro',      'Pro',      66,   3),
  ('pro_plus', 'Pro Plus', 400, 10)
on conflict (tier) do update set
  display_name = excluded.display_name,
  player_limit = excluded.player_limit,
  team_limit   = excluded.team_limit;
