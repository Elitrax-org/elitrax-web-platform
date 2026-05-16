-- Migration: store team jersey numbers as short text tokens.

alter table public.team_players
  alter column jersey_number type text using nullif(btrim(jersey_number::text), '');

alter table public.team_players
  drop constraint if exists team_players_jersey_number_format,
  add constraint team_players_jersey_number_format
  check (
    jersey_number is null
    or (
      length(jersey_number) between 1 and 3
      and jersey_number ~ '^[A-Za-z0-9]{1,3}$'
      and jersey_number = btrim(jersey_number)
    )
  );

create unique index if not exists team_players_jersey_uniq
  on public.team_players (team_id, jersey_number)
  where jersey_number is not null;
