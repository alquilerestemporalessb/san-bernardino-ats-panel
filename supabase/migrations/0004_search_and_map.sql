-- San Bernardino ATS — Panel Admin
-- Migracion 0004: coordenadas por propiedad + calendario de disponibilidad
--
-- Habilita el mapa (lat/lng) y el filtro de busqueda por fechas (property_blocked_dates:
-- una fila = una noche bloqueada para esa propiedad).

alter table properties add column if not exists latitude double precision;
alter table properties add column if not exists longitude double precision;

create table if not exists property_blocked_dates (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references properties(id) on delete cascade,
  date date not null,
  created_at timestamptz not null default now(),
  unique (property_id, date)
);

create index if not exists property_blocked_dates_property_id_idx
  on property_blocked_dates (property_id, date);

alter table property_blocked_dates enable row level security;

drop policy if exists "authenticated_full_access" on property_blocked_dates;
create policy "authenticated_full_access" on property_blocked_dates
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

drop policy if exists "public_read_active_property_blocked_dates" on property_blocked_dates;
create policy "public_read_active_property_blocked_dates" on property_blocked_dates
  for select
  using (exists (
    select 1 from properties p
    where p.id = property_blocked_dates.property_id and p.active = true
  ));
