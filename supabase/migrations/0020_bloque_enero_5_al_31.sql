-- San Bernardino ATS — Panel Admin
-- Migracion 0020: el bloque mensual de enero pasa a ser del 5 al 31 de enero,
-- para todas las casas. Precios sin cambios, solo fecha de inicio y etiqueta.
-- Idempotente: solo toca filas que todavia tengan el bloque viejo (1 ene - 1 feb).

update property_rates
set date_from = '2027-01-05', label = 'Mes de enero (5 al 31 de enero)'
where kind = 'bloque' and date_from = '2027-01-01' and date_to = '2027-02-01';
