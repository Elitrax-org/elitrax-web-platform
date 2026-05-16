-- Add explicit body region to injuries so body_zone_detail can be interpreted
-- consistently by sport staff and UI visual selectors.

alter table if exists public.injuries
  add column if not exists body_region text;

update public.injuries
set body_region = coalesce(body_region, 'torso')
where body_region is null;

alter table public.injuries
  alter column body_region set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'injuries_body_region_check'
  ) then
    alter table public.injuries
      add constraint injuries_body_region_check
      check (body_region in (
        'head',
        'torso',
        'upperBack',
        'lowerBack',
        'leftArm',
        'rightArm',
        'leftLeg',
        'rightLeg'
      ));
  end if;
end;
$$;
