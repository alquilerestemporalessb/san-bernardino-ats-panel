-- San Bernardino ATS — Panel Admin
-- Migracion 0002: lectura publica de propiedades activas
--
-- La landing publica ("/") lee propiedades sin autenticacion. Esta policy es aditiva:
-- no toca "authenticated_full_access" de 0001_properties.sql (esa sigue siendo la unica
-- que permite escribir). Correr despues de 0001 en el SQL Editor de Supabase.

drop policy if exists "public_read_active" on properties;
create policy "public_read_active" on properties
  for select
  using (active = true);
