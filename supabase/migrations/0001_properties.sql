-- San Bernardino ATS — Panel Admin
-- Migracion 0001: tabla properties + RLS
--
-- Correr esto en el SQL Editor del proyecto de Supabase (Dashboard > SQL Editor > New query),
-- o via Supabase CLI (`supabase db push`) si se adopta mas adelante.

create extension if not exists "pgcrypto";

create table if not exists properties (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null,
  capacity integer not null check (capacity > 0),
  zone text not null,
  description text,
  photo_url text,
  whatsapp_message text,
  verified boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists properties_active_idx on properties (active);

-- Mantiene updated_at al dia en cada UPDATE.
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists properties_set_updated_at on properties;
create trigger properties_set_updated_at
  before update on properties
  for each row
  execute function set_updated_at();

alter table properties enable row level security;

-- v1: un solo tipo de usuario (equipo ATS autenticado) con acceso total.
-- Cuando la landing publica se conecte a esta base, agregar ademas:
--   create policy "public_read_active" on properties
--     for select using (active = true);
-- sin tocar esta policy de escritura.
drop policy if exists "authenticated_full_access" on properties;
create policy "authenticated_full_access" on properties
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
