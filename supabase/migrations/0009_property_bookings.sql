-- San Bernardino ATS — Panel Admin
-- Migracion 0009: reservas formales + comision (Etapa 1 del modelo de agencia curadora)
--
-- Una fila = una reserva confirmada por el equipo ATS (cerrada por WhatsApp, no pago online).
-- commission_amount no se guarda, se calcula al mostrar (amount * commission_pct / 100) para no
-- arrastrar un dato derivado desincronizado. Dato comercial interno: sin politica publica.

create table if not exists property_bookings (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references properties(id) on delete cascade,
  guest_name text not null,
  guest_contact text,
  check_in date not null,
  check_out date not null,
  amount numeric(12, 2) not null,
  commission_pct numeric(5, 2) not null default 10,
  status text not null default 'confirmada' check (status in ('confirmada', 'cancelada')),
  notes text,
  created_at timestamptz not null default now(),
  constraint property_bookings_dates_check check (check_out > check_in)
);

alter table property_bookings enable row level security;

drop policy if exists "authenticated_full_access_property_bookings" on property_bookings;
create policy "authenticated_full_access_property_bookings" on property_bookings
  for all
  to authenticated
  using (true)
  with check (true);

create index if not exists property_bookings_property_id_idx on property_bookings(property_id);
