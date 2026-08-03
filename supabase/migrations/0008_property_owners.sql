-- San Bernardino ATS — Panel Admin
-- Migracion 0008: datos del propietario por propiedad (uso interno del equipo ATS)
--
-- Tabla separada (no columnas en `properties`) a proposito: asi un select("*") publico sobre
-- properties nunca puede filtrar el nombre/contacto del dueno por accidente. Sin politica publica.

create table if not exists property_owners (
  property_id uuid primary key references properties(id) on delete cascade,
  owner_name text not null,
  owner_contact text,
  updated_at timestamptz not null default now()
);

alter table property_owners enable row level security;

drop policy if exists "authenticated_full_access_property_owners" on property_owners;
create policy "authenticated_full_access_property_owners" on property_owners
  for all
  to authenticated
  using (true)
  with check (true);
