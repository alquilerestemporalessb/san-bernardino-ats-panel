-- San Bernardino ATS — Panel Admin
-- Migracion 0006: bucket de Storage para fotos reales de propiedades
--
-- Bucket publico (las fotos son contenido publico del catalogo). Lectura abierta, escritura y
-- borrado solo para el equipo ATS autenticado.

insert into storage.buckets (id, name, public)
values ('property-photos', 'property-photos', true)
on conflict (id) do nothing;

drop policy if exists "public_read_property_photos" on storage.objects;
create policy "public_read_property_photos" on storage.objects
  for select
  using (bucket_id = 'property-photos');

drop policy if exists "authenticated_write_property_photos" on storage.objects;
create policy "authenticated_write_property_photos" on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'property-photos');

drop policy if exists "authenticated_delete_property_photos" on storage.objects;
create policy "authenticated_delete_property_photos" on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'property-photos');
