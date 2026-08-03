-- San Bernardino ATS — Panel Admin
-- Migracion 0005: tracking de eventos por propiedad (vistas, clics a WhatsApp)
--
-- Escritura abierta al publico (cualquier visitante genera eventos), lectura solo para el
-- equipo ATS (asi nadie de afuera ve cuantas consultas tiene cada propiedad).

create table if not exists property_events (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references properties(id) on delete cascade,
  event_type text not null check (event_type in ('view', 'whatsapp_click')),
  created_at timestamptz not null default now()
);

create index if not exists property_events_property_id_idx
  on property_events (property_id, event_type, created_at);

alter table property_events enable row level security;

drop policy if exists "public_can_log_events" on property_events;
create policy "public_can_log_events" on property_events
  for insert
  with check (true);

drop policy if exists "authenticated_can_read_events" on property_events;
create policy "authenticated_can_read_events" on property_events
  for select
  using (auth.role() = 'authenticated');
