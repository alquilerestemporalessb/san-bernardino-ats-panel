-- San Bernardino ATS — Panel Admin
-- Migracion 0003: galeria de fotos por propiedad
--
-- photo_url se elimina de properties (nunca se uso con datos reales). La primera foto
-- (sort_order = 0) de property_photos hace de portada en el catalogo; el resto arma la
-- galeria de la pagina de detalle.

alter table properties drop column if exists photo_url;

create table if not exists property_photos (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references properties(id) on delete cascade,
  url text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists property_photos_property_id_idx on property_photos (property_id, sort_order);

alter table property_photos enable row level security;

drop policy if exists "authenticated_full_access" on property_photos;
create policy "authenticated_full_access" on property_photos
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

drop policy if exists "public_read_active_property_photos" on property_photos;
create policy "public_read_active_property_photos" on property_photos
  for select
  using (exists (
    select 1 from properties p
    where p.id = property_photos.property_id and p.active = true
  ));
