-- San Bernardino ATS — Panel Admin
-- Migracion 0013: tarifas por bloques estandarizados (quincena, mes, fin de
-- semana, noche, extension de fiestas)
--
-- Reemplaza (para las propiedades que la usen) el precio fijo por noche de
-- properties.price_per_* por tramos de fechas con precio propio. date_from/
-- date_to tienen doble sentido segun kind:
--   - 'bloque' / 'extension': fechas exactas del tramo vendible. Convencion:
--     el check-out de un bloque es el check-in del siguiente (1 ene a 16
--     ene, 16 ene a 1 feb, mes 1 ene a 1 feb son 3 filas independientes).
--   - 'fin_de_semana' / 'noche': ventana de vigencia de esa tarifa
--     (temporada), no una estadia puntual.
-- Son precios publicos: nunca se guarda ni se expone precio de propietario
-- ni comision.

create table if not exists property_rates (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references properties(id) on delete cascade,
  kind text not null check (kind in ('bloque', 'fin_de_semana', 'noche', 'extension')),
  label text not null,
  date_from date not null,
  date_to date not null,
  price_gs numeric(12, 2) not null,
  extra_night_gs numeric(12, 2),
  min_nights integer,
  deposit_gs numeric(12, 2),
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint property_rates_dates_check check (date_to > date_from)
);

alter table property_rates enable row level security;

-- lectura publica: el catalogo necesita mostrar/cotizar tarifas sin login
drop policy if exists "public_read_active_property_rates" on property_rates;
create policy "public_read_active_property_rates" on property_rates
  for select
  using (active = true);

-- escritura solo para el equipo ATS
drop policy if exists "authenticated_full_access_property_rates" on property_rates;
create policy "authenticated_full_access_property_rates" on property_rates
  for all
  to authenticated
  using (true)
  with check (true);

create index if not exists property_rates_property_id_idx on property_rates(property_id);

-- servicios incluidos (limpieza, ropa de cama, etc). Nullable a proposito:
-- la UI solo lo muestra si tiene datos, a diferencia de amenities (default '{}').
alter table properties add column if not exists included_services text[];
