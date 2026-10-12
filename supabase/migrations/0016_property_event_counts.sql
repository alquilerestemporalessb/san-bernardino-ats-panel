-- San Bernardino ATS — Panel Admin
-- Migracion 0016: conteo de eventos por propiedad vía función SQL
--
-- /admin/metrics traía todas las filas de property_events de los últimos 30 días a Next.js para
-- contarlas en memoria. Supabase corta cualquier select en 1000 filas, así que pasado ese punto
-- las métricas quedaban mal. Esta función agrega en la base (group by + count) y devuelve solo
-- los totales por propiedad. security invoker: respeta la misma RLS de property_events, así que
-- solo el equipo autenticado puede llamarla.

create or replace function property_event_counts(since timestamptz)
returns table (property_id uuid, views bigint, whatsapp_clicks bigint)
language sql
stable
security invoker
set search_path = public
as $$
  select
    property_id,
    count(*) filter (where event_type = 'view') as views,
    count(*) filter (where event_type = 'whatsapp_click') as whatsapp_clicks
  from property_events
  where created_at >= since
  group by property_id;
$$;
