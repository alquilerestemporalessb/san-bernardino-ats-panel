# San Bernardino ATS — sitio público + panel admin

Este proyecto Next.js sirve **las dos cosas**:

- **`/`** — landing pública, la que ven los huéspedes. Lee las propiedades activas directo de
  Supabase (Server Component, sin JS de cliente para el catálogo).
- **`/admin`** — panel interno del equipo ATS (login propio, sin señal pública de signup). Cargar,
  editar, verificar y activar/ocultar propiedades ahí se refleja al instante en `/`.

**Separado por completo del proyecto GES** (otro Supabase, otro Vercel, ningún dato compartido).

`../landing`, `../design-system`, `../badge`, `../social-templates` **siguen existiendo** pero ya no
son "el sitio" — quedan como material de referencia para handoff a Canva/diseñador (ver
`../landing/README.md`). El sitio real es este proyecto.

Cada propiedad tiene una página propia (`/propiedades/[code]`) con galería de fotos (varias URLs por
propiedad, gestionadas desde `/admin`). Todavía no hay upload de archivos (las fotos son URLs pegadas
a mano) ni captura de leads más allá de los links de WhatsApp. Ver
`C:\Users\HP\.claude\plans\dynamic-snacking-dahl.md` para el detalle de alcance y las decisiones de
arquitectura de la iteración más reciente.

## Setup (primera vez)

### 1. Crear el proyecto de Supabase

1. Ir a [supabase.com](https://supabase.com) → **New project**.
2. Nombre sugerido: `san-bernardino-ats` (o similar). Elegir una región cercana (ej. São Paulo).
3. Guardar la contraseña de la base que pide al crear el proyecto (no hace falta para esto, pero conviene guardarla).

### 2. Correr las migraciones

En el dashboard del proyecto: **SQL Editor** → **New query**. Correr, en orden:

1. Contenido completo de `supabase/migrations/0001_properties.sql` (tabla + escritura para el equipo ATS).
2. Contenido completo de `supabase/migrations/0002_public_read_active.sql` (lectura pública de propiedades activas — esto es lo que alimenta `/`).
3. Contenido completo de `supabase/migrations/0003_property_photos.sql` (galería de fotos por propiedad).
4. Contenido completo de `supabase/migrations/0004_search_and_map.sql` (coordenadas + calendario de disponibilidad).

Confirmar en **Table Editor** que la tabla `properties` se creó.

### 3. Variables de entorno

1. En el dashboard: **Project Settings** → **API**.
2. Copiar **Project URL** y **anon public key**.
3. Copiar `.env.local.example` a `.env.local` y completar:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

### 4. Crear el primer usuario (equipo ATS)

No hay pantalla de registro. Crear usuarios a mano:

1. Dashboard → **Authentication** → **Users** → **Add user** → **Create new user**.
2. Cargar email y contraseña, tildar **Auto Confirm User**.
3. Repetir por cada persona del equipo que necesite acceso.

### 5. Correr el proyecto

```bash
npm install
npm run dev
```

- `http://localhost:3000` → landing pública (vacía hasta que cargues la primera propiedad activa).
- `http://localhost:3000/admin` → redirige a `/admin/login` → entrar con el usuario del paso 4.

### 6. Número de WhatsApp real

Todos los botones de WhatsApp del sitio público arman el link desde un solo lugar:
`src/lib/whatsapp.ts` → constante `WHATSAPP_NUMBER`. Reemplazar ahí el número de placeholder por el
real del negocio.

## Deploy

Ya está en producción: https://panel-admin-phi-nine.vercel.app (cuenta y proyecto de Vercel propios
de `alquilerestemporalessb`, sin relación con GES). El repo
(`github.com/alquilerestemporalessb/san-bernardino-ats-panel`) está conectado a Vercel — cualquier
`git push` a `main` dispara un deploy automático a producción. Variables de entorno
(`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) ya cargadas en Vercel → Project
Settings → Environment Variables (production + development).

## Estructura

```
src/
  app/
    page.tsx                          -> landing publica ("/")
    icon.png                          -> favicon (isotipo)
    layout.tsx                        -> fuentes, metadata/OG
    admin/
      login/page.tsx                  -> login (sin registro publico, sin shell del panel)
      (dashboard)/
        layout.tsx                    -> topbar + logout, envuelve el panel
        page.tsx                      -> listado de propiedades ("/admin")
        properties/new/page.tsx       -> alta
        properties/[id]/edit/page.tsx -> edicion
        properties/[id]/availability/page.tsx -> calendario de disponibilidad
    propiedades/[code]/page.tsx       -> pagina publica de detalle por propiedad (galeria, SEO propio)
  components/
    PropertyForm.tsx                  -> form compartido entre alta y edicion (admin), fotos + lat/lng dinamicos
    DeleteButton.tsx                  -> boton de borrado con confirmacion (admin)
    AvailabilityCalendar.tsx          -> calendario de bloqueo de fechas (admin)
    site/                             -> componentes de la landing publica
      Nav.tsx, Hero.tsx, PropertyCard.tsx, TrustSection.tsx, OwnersSection.tsx, Footer.tsx, icons.tsx
      Gallery.tsx                     -> galeria con miniaturas (pagina de detalle)
      PhotoPlaceholder.tsx            -> placeholder compartido cuando una propiedad no tiene fotos
      FilterBar.tsx                   -> filtro publico (capacidad, zona, fechas)
      PropertiesMap.tsx / PropertiesMapLoader.tsx -> mapa Leaflet (el Loader hace el dynamic import ssr:false)
  lib/
    supabase/client.ts                -> cliente browser
    supabase/server.ts                -> cliente server (Server Components/Actions), respeta RLS
    actions/auth.ts                   -> login, logout
    actions/properties.ts             -> create/update/delete/toggleVerified/toggleActive + fotos + lat/lng
    actions/availability.ts           -> blockDates, unblockDates
    whatsapp.ts                       -> numero + armado de mensajes prearmados (un solo lugar)
    dates.ts                          -> helpers de fecha compartidos (ISO <-> Date, formato es-PY)
  types/database.ts                   -> tipos de properties, property_photos, property_blocked_dates
  proxy.ts                            -> protege /admin/* excepto /admin/login (Next 16 renombro "middleware" a "proxy")
supabase/migrations/
  0001_properties.sql                 -> tabla + escritura autenticada
  0002_public_read_active.sql         -> lectura publica de propiedades activas
  0003_property_photos.sql            -> galeria de fotos por propiedad
  0004_search_and_map.sql             -> lat/lng + calendario de disponibilidad
```

## Por qué este stack

Mismo patrón que `GES` (Next.js App Router + TypeScript + Tailwind v4 + Supabase + Vercel), pero
simplificado: un solo tipo de usuario autenticado (equipo ATS), sin tabla `profiles` ni roles. Se
agrega esa complejidad el día que haga falta (por ejemplo, si se suma un portal de propietarios).
