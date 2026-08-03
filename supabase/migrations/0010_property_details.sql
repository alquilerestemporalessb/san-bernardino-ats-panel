-- San Bernardino ATS — Panel Admin
-- Migracion 0010: catalogo rico (Etapa 2) — precio, detalles tipo Airbnb, amenities, tour externo
--
-- A diferencia de property_owners/property_bookings, estas columnas son publicas a proposito: es
-- informacion que el huesped necesita ver en el catalogo. La policy publica existente de
-- properties ya las cubre, no hace falta tocar RLS.

alter table properties add column if not exists price_per_night numeric(12, 2);
alter table properties add column if not exists bedrooms integer;
alter table properties add column if not exists beds integer;
alter table properties add column if not exists bathrooms integer;
alter table properties add column if not exists amenities text[] not null default '{}';
alter table properties add column if not exists tour_url text;
