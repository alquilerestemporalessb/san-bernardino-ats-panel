-- San Bernardino ATS — Panel Admin
-- Migracion 0019: bloqueo manual de Casa Roma (SB-006), 3 ene al 1 feb 2027
--
-- Reserva real confirmada por Lucas. Checkout 1 de feb -> ultima noche ocupada
-- 31 de enero. No hay fila en property_bookings para esta reserva (bloqueo
-- manual), por eso booking_id queda null. Idempotente via on conflict.

insert into property_blocked_dates (property_id, date, booking_id)
select
  (select id from properties where code = 'SB-006'),
  d::date,
  null
from generate_series('2027-01-03'::date, '2027-01-31'::date, interval '1 day') as d
on conflict (property_id, date) do nothing;
