-- Materialized analytics views for telemetry reporting and dashboard rollups.

create materialized view if not exists public.telemetry_upload_metrics_mv as
select
  s.account_id,
  s.upload_id,
  u.session_id,
  coalesce(s.player_id, u.player_id) as player_id,
  min(s.captured_at) as started_at,
  max(s.captured_at) as ended_at,
  extract(epoch from (max(s.captured_at) - min(s.captured_at)))::bigint as duration_seconds,
  count(*)::bigint as sample_count,
  avg(s.heart_rate)::numeric(10,2) as avg_heart_rate,
  max(s.heart_rate) as max_heart_rate,
  avg(s.speed_mps)::numeric(10,3) as avg_speed_mps,
  max(s.speed_mps)::numeric(10,3) as max_speed_mps,
  now() as refreshed_at
from public.telemetry_samples s
join public.telemetry_uploads u on u.id = s.upload_id
group by s.account_id, s.upload_id, u.session_id, coalesce(s.player_id, u.player_id);

create unique index if not exists telemetry_upload_metrics_mv_upload_idx
  on public.telemetry_upload_metrics_mv (upload_id);

create index if not exists telemetry_upload_metrics_mv_account_started_idx
  on public.telemetry_upload_metrics_mv (account_id, started_at desc);

create index if not exists telemetry_upload_metrics_mv_session_idx
  on public.telemetry_upload_metrics_mv (session_id);

create or replace function public.refresh_telemetry_upload_metrics_mv()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  refresh materialized view concurrently public.telemetry_upload_metrics_mv;
end;
$$;
