-- San Bernardino ATS — Panel Admin
-- Migracion 0015: modalidad y total en los eventos de WhatsApp
--
-- Para poder medir que modalidad (bloque/fin_de_semana/noche/custom) y que monto estimado
-- disparo cada clic a WhatsApp desde el calendario de tarifas, sin guardar ningun dato personal
-- del visitante. Ambas columnas nullable: los eventos 'view' y los clics del widget viejo
-- (propiedades sin property_rates) siguen insertando igual que hoy, sin estos valores.

alter table property_events add column if not exists modality text;
alter table property_events add column if not exists total_gs numeric(12, 2);
