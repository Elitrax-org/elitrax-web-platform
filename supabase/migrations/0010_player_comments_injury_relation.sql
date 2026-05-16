-- Link player comments with injuries for auditable injury timeline.

alter table if exists public.player_comments
  add column if not exists injury_id uuid references public.injuries(id) on delete set null;

create index if not exists player_comments_injury_idx
  on public.player_comments(injury_id);
