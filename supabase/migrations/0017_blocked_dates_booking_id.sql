-- San Bernardino ATS — Panel Admin
-- Migracion 0017: trazabilidad de que reserva bloqueo cada fecha
--
-- cancelBooking liberaba todo el rango de fechas de la reserva, incluyendo dias que el equipo
-- hubiera bloqueado a mano por otro motivo dentro de ese mismo rango. Con booking_id, cancelar
-- una reserva solo libera las fechas que esa reserva bloqueo. Nullable: los bloqueos manuales
-- del calendario de disponibilidad no tienen reserva asociada.

alter table property_blocked_dates
  add column if not exists booking_id uuid references property_bookings(id) on delete set null;

create index if not exists property_blocked_dates_booking_id_idx
  on property_blocked_dates (booking_id);
