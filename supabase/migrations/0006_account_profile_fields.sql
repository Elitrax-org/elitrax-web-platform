-- Migration: enrich accounts with profile/contact/billing fields and
-- add `interval` to subscriptions. Applied via `supabase db push`.

-- =====================================================================
-- accounts: profile, contact, billing
-- =====================================================================

alter table public.accounts
  add column if not exists country_code char(2),
  add column if not exists city text,
  add column if not exists address_line1 text,
  add column if not exists address_line2 text,
  add column if not exists postal_code text,
  add column if not exists region text,
  add column if not exists contact_email extensions.citext,
  add column if not exists contact_phone text,
  add column if not exists billing_legal_name text,
  add column if not exists billing_tax_id text,
  add column if not exists billing_email extensions.citext,
  add column if not exists billing_address jsonb;

-- Backfill any pre-existing rows with placeholder data so the NOT NULL
-- constraints below can be enforced. New rows must always provide values.
update public.accounts
set
  country_code = coalesce(country_code, 'US'),
  city = coalesce(city, 'Unknown'),
  address_line1 = coalesce(address_line1, 'Unknown'),
  contact_email = coalesce(contact_email, 'unknown@example.com'),
  contact_phone = coalesce(contact_phone, '+10000000000'),
  billing_address = coalesce(billing_address, '{}'::jsonb)
where country_code is null
   or city is null
   or address_line1 is null
   or contact_email is null
   or contact_phone is null
   or billing_address is null;

alter table public.accounts
  alter column country_code set not null,
  alter column city set not null,
  alter column address_line1 set not null,
  alter column contact_email set not null,
  alter column contact_phone set not null,
  alter column billing_address set not null,
  add constraint accounts_country_code_format
    check (country_code ~ '^[A-Z]{2}$'),
  add constraint accounts_corporate_requires_billing
    check (
      type <> 'corporate'
      or (
        billing_legal_name is not null
        and length(trim(billing_legal_name)) > 0
        and billing_tax_id is not null
        and length(trim(billing_tax_id)) > 0
      )
    );

-- =====================================================================
-- subscriptions: billing interval
-- =====================================================================

do $$ begin
  create type billing_interval as enum ('monthly', 'yearly');
exception when duplicate_object then null; end $$;

alter table public.subscriptions
  add column if not exists billing_interval billing_interval;
