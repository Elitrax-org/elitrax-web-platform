alter table public.teams
  add column if not exists field_length_meters integer,
  add column if not exists field_width_meters integer;

alter table public.teams
  drop constraint if exists teams_field_length_meters_check;

alter table public.teams
  drop constraint if exists teams_field_width_meters_check;

alter table public.teams
  add constraint teams_field_length_meters_check
    check (field_length_meters is null or field_length_meters between 20 and 200),
  add constraint teams_field_width_meters_check
    check (field_width_meters is null or field_width_meters between 10 and 120);