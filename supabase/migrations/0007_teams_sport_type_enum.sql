-- Replace teams.category with a fixed sport_type enum.

set search_path = public;

do $$ begin
  create type sport_type as enum ('football', 'hockey', 'rugby');
exception when duplicate_object then null;
end $$;

alter table public.teams
  add column if not exists sport_type sport_type;

update public.teams
set sport_type = case lower(trim(coalesce(category, '')))
  when 'football' then 'football'::sport_type
  when 'futbol' then 'football'::sport_type
  when 'soccer' then 'football'::sport_type
  when 'hockey' then 'hockey'::sport_type
  when 'jockey' then 'hockey'::sport_type
  when 'rugby' then 'rugby'::sport_type
  else 'football'::sport_type
end
where sport_type is null;

alter table public.teams
  alter column sport_type set default 'football'::sport_type,
  alter column sport_type set not null;

alter table public.teams
  drop column if exists category;
