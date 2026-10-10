-- San Bernardino ATS — Panel Admin
-- Seed 0014: tarifas de Casa Roma (SB-006) en property_rates
--
-- Precios publicos en Gs, sin comision (ese dato es interno y no vive aca).
-- Idempotente: borra las tarifas existentes de SB-006 antes de insertar, asi
-- se puede re-correr este archivo sin duplicar filas.
-- Convencion de bloques: el check-out de un bloque es el check-in del
-- siguiente. Las ventanas de 'fin_de_semana'/'noche' usan [date_from,
-- date_to) como vigencia de temporada (date_to exclusivo).

delete from property_rates
where property_id = (select id from properties where code = 'SB-006');

insert into property_rates
  (property_id, kind, label, date_from, date_to, price_gs, extra_night_gs, min_nights, deposit_gs, sort_order, active)
values
  -- Bloques Dic 2026
  ((select id from properties where code = 'SB-006'), 'bloque', 'Quincena 1 al 16 de diciembre', '2026-12-01', '2026-12-16', 13900000, null, null, 2500000, 10, true),
  ((select id from properties where code = 'SB-006'), 'bloque', 'Quincena 16 de diciembre al 1 de enero', '2026-12-16', '2027-01-01', 22500000, null, null, 2500000, 11, true),
  ((select id from properties where code = 'SB-006'), 'bloque', 'Mes de diciembre', '2026-12-01', '2027-01-01', 33700000, null, null, 3500000, 12, true),
  ((select id from properties where code = 'SB-006'), 'bloque', 'Navidad (23 al 25 de diciembre)', '2026-12-23', '2026-12-25', 5100000, null, null, 1000000, 13, true),
  ((select id from properties where code = 'SB-006'), 'bloque', 'Año Nuevo (30 de diciembre al 1 de enero)', '2026-12-30', '2027-01-01', 5100000, null, null, 1000000, 14, true),

  -- Bloques Ene 2027
  ((select id from properties where code = 'SB-006'), 'bloque', 'Quincena 1 al 16 de enero', '2027-01-01', '2027-01-16', 20300000, null, null, 2500000, 20, true),
  ((select id from properties where code = 'SB-006'), 'bloque', 'Quincena 16 de enero al 1 de febrero', '2027-01-16', '2027-02-01', 20300000, null, null, 2500000, 21, true),
  ((select id from properties where code = 'SB-006'), 'bloque', 'Mes de enero', '2027-01-01', '2027-02-01', 37500000, null, null, 3500000, 22, true),

  -- Bloques Feb 2027
  ((select id from properties where code = 'SB-006'), 'bloque', 'Quincena 1 al 15 de febrero', '2027-02-01', '2027-02-15', 17100000, null, null, 2500000, 30, true),
  ((select id from properties where code = 'SB-006'), 'bloque', 'Quincena 15 de febrero al 1 de marzo', '2027-02-15', '2027-03-01', 17100000, null, null, 2500000, 31, true),
  ((select id from properties where code = 'SB-006'), 'bloque', 'Mes de febrero', '2027-02-01', '2027-03-01', 32100000, null, null, 3500000, 32, true),

  -- Fin de semana y noche: 1 oct a 30 nov 2026
  ((select id from properties where code = 'SB-006'), 'fin_de_semana', 'Fin de semana (oct-nov 2026)', '2026-10-01', '2026-12-01', 3700000, 900000, null, 1000000, 40, true),
  ((select id from properties where code = 'SB-006'), 'noche', 'Noche suelta (oct-nov 2026)', '2026-10-01', '2026-12-01', 1600000, null, 2, 1000000, 41, true),

  -- Fin de semana y noche: diciembre 2026
  ((select id from properties where code = 'SB-006'), 'fin_de_semana', 'Fin de semana (dic 2026)', '2026-12-01', '2027-01-01', 4800000, 1100000, null, 1000000, 42, true),
  ((select id from properties where code = 'SB-006'), 'noche', 'Noche suelta (dic 2026)', '2026-12-01', '2027-01-01', 1900000, null, 2, 1000000, 43, true),

  -- Noche: 1 mar a 30 sep 2027
  ((select id from properties where code = 'SB-006'), 'noche', 'Noche suelta (mar-sep 2027)', '2027-03-01', '2027-10-01', 1300000, null, 2, 1000000, 44, true),

  -- Extension de fiestas al fin de semana completo siguiente
  ((select id from properties where code = 'SB-006'), 'extension', 'Extensión fin de semana (Navidad)', '2026-12-25', '2026-12-27', 4300000, null, null, null, 50, true),
  ((select id from properties where code = 'SB-006'), 'extension', 'Extensión fin de semana (Año Nuevo)', '2027-01-01', '2027-01-03', 4300000, null, null, null, 51, true);
