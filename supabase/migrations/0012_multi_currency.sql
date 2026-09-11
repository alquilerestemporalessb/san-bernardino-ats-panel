-- San Bernardino ATS — Panel Admin
-- Migracion 0012: precios y reservas en Gs o USD + cotizacion editable
--
-- La moneda vive por cada precio (no por propiedad): una propiedad puede cotizar la noche en Gs
-- y el mes en USD. Las filas existentes eran todas en guaranies -> default 'PYG'.
-- app_settings guarda la cotizacion del dolar; el sitio publico la lee para convertir en el
-- filtro de precio, por eso lleva policy de lectura publica (no es dato sensible).

alter table properties
  add column if not exists price_per_night_currency text not null default 'PYG'
    check (price_per_night_currency in ('PYG', 'USD'));
alter table properties
  add column if not exists price_per_week_currency text not null default 'PYG'
    check (price_per_week_currency in ('PYG', 'USD'));
alter table properties
  add column if not exists price_per_month_currency text not null default 'PYG'
    check (price_per_month_currency in ('PYG', 'USD'));

alter table property_bookings
  add column if not exists currency text not null default 'PYG'
    check (currency in ('PYG', 'USD'));

create table if not exists app_settings (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

alter table app_settings enable row level security;

-- lectura publica: la landing necesita la cotizacion para convertir precios en el filtro
drop policy if exists "public_read_app_settings" on app_settings;
create policy "public_read_app_settings" on app_settings
  for select
  using (true);

-- escritura solo para el equipo ATS
drop policy if exists "authenticated_write_app_settings" on app_settings;
create policy "authenticated_write_app_settings" on app_settings
  for all
  to authenticated
  using (true)
  with check (true);

insert into app_settings (key, value)
values ('usd_to_pyg_rate', '7500')
on conflict (key) do nothing;
