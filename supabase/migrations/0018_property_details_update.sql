-- San Bernardino ATS — Panel Admin
-- Migracion 0018: capacidad/dormitorios/banos de Casa Atardecer y Casa Serena
--
-- Datos confirmados por Lucas (dueño). No se tocan fotos ni otros campos.

update properties
set capacity = 14, bedrooms = 6, bathrooms = 4
where code = 'SB-002';

update properties
set capacity = 8,
    bedrooms = 3,
    description = case
      when description is null or trim(description) = '' then
        'Cuenta ademas con una dependencia de servicio independiente.'
      when description not like '%dependencia de servicio%' then
        description || E'\n\nCuenta ademas con una dependencia de servicio independiente.'
      else description
    end
where code = 'SB-005';
