-- San Bernardino ATS — Panel Admin
-- Migracion 0007: estado operativo de la propiedad (Disponible / Reservada / Alquilada temporada)
--
-- Independiente de "active" (visibilidad en el catalogo) y del calendario de fechas
-- (property_blocked_dates) — es un cartel rapido a mano del equipo ATS.

alter table properties add column if not exists status text not null default 'disponible';

alter table properties drop constraint if exists properties_status_check;
alter table properties add constraint properties_status_check
  check (status in ('disponible', 'reservada', 'alquilada_temporada'));
