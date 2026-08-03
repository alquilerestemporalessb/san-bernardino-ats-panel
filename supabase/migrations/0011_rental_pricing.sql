-- San Bernardino ATS — Panel Admin
-- Migracion 0011: modalidades de alquiler (noche / semana / mes) + minimo de noches
--
-- Sin campo de "modalidad" aparte: que precios esten cargados define implicitamente que
-- modalidades ofrece la propiedad. min_nights solo aplica al alquiler por noche.

alter table properties add column if not exists price_per_week numeric(12, 2);
alter table properties add column if not exists price_per_month numeric(12, 2);
alter table properties add column if not exists min_nights integer not null default 1;
