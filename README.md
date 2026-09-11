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

## Diseño del sitio público (rediseño editorial)

El sitio público (`/`, `/propiedades/[code]`, `/comparar`) tiene su **propio sistema de diseño**,
separado del panel admin (que sigue oscuro/azul noche, es una herramienta interna, no lo ve el
huésped):

- **Paleta**: fondo crema roto (`--site-bg`), tinta casi negra cálida (`--site-ink`), terracota
  (`--site-terracotta` — el mismo bronce de marca, `#9d6540`, del logo) y verde oliva
  (`--site-olive`) como acento secundario para propietarios. Tokens en `src/app/globals.css`
  (Tailwind v4, `@theme`, prefijo `site-` — ej. `bg-site-bg`, `text-site-ink-muted`).
- **Tipografía**: Playfair Display (`font-display`) para titulares editoriales, Plus Jakarta Sans
  (`font-ui`) para el resto. Cargadas en `layout.tsx` vía `next/font/google`, no pisan
  Fraunces/Inter del panel admin.
- **Hero asimétrico** (`Hero.tsx`): collage de dos fotos + card flotante de "verificadas", no el
  bloque de texto centrado de antes.
- **Tarjetas de propiedad** (`PropertyCard.tsx` + `PropertyCardGallery.tsx`): al pasar el mouse
  rotan entre las fotos reales de la propiedad (crossfade + puntitos), con zoom sutil — las fotos
  siguen siendo 100% las que carga el equipo ATS, nunca se reemplazan por stock.
- **Imágenes decorativas** (Hero, Confianza, Propietarios) vienen de Unsplash —
  `src/lib/stock-images.ts` centraliza las URLs. Son las únicas imágenes de stock del sitio; el
  catálogo de propiedades siempre usa fotos reales de Supabase Storage.
- **CTA de WhatsApp**: además del botón del Nav, hay un boton flotante fijo (`StickyWhatsappFab.tsx`,
  con brillo pulsante) en el catálogo (`/`). En la ficha de propiedad y en el comparador ese FAB no
  se usa — en la ficha porque el `BookingWidget` ya trae su propio CTA siempre a mano, y en el
  comparador porque cada fila de la tabla ya tiene su botón de WhatsApp.
- `next.config.ts` ya permite cualquier host `https` en `images.remotePatterns` — no hizo falta
  agregar `images.unsplash.com` a mano.

### Ficha de propiedad (`/propiedades/[code]`)

- **Galería** (`Gallery.tsx`): grilla editorial (1 foto principal + 4 secundarias, "+N fotos" en la
  última si hay mas) que abre un `Lightbox.tsx` a pantalla completa al hacer clic (flechas,
  teclado, Escape). En mobile la grilla se reemplaza por una sola foto + chip "Ver las N fotos"
  (la grilla de 4 columnas se ve demasiado apretada en una pantalla angosta).
- **`BookingWidget.tsx`**: precio con equivalente aproximado en la otra moneda (usa la cotización de
  `/admin/configuracion`), selector de fechas (`react-day-picker`, respeta fechas bloqueadas) con
  estimado de noches × precio, y CTA de WhatsApp con mensaje dinámico que incluye el nombre de la
  casa y las fechas elegidas. En desktop es una tarjeta sticky en la columna derecha; en mobile se
  convierte en una barra fija abajo (`fixed bottom-0`) con el calendario en un bottom-sheet.
- **`AmenitiesGrid.tsx`**: capacidad/zona/dormitorios/camas/baños + las amenities cargadas, todo en
  una grilla de 2 columnas con ícono (`amenity-icons.tsx` mapea cada valor de `AMENITIES` a su
  ícono).
- **`TrustRulesSection.tsx`**: reexplica el sello verificado + reglas generales de check-in/pago —
  a propósito no inventa horarios ni reglas puntuales por propiedad (no hay ese dato cargado); deja
  claro que se confirman por WhatsApp.
- **`SimilarProperties.tsx`**: franja final con otras propiedades activas (prioriza la misma zona),
  reusa `PropertyCard` en una fila con scroll horizontal.

### Catálogo (`/` — filtros)

- `FilterBar` es `sticky` bajo el Nav con `backdrop-blur-md` mientras se scrollea el catálogo.
- Cambiar un filtro no recarga la página (ya era navegación soft de Next.js) y ahora además
  desvanece la grilla de resultados mientras carga la nueva, en vez de reemplazarla de golpe —
  `CatalogTransition.tsx` comparte el `isPending` de un `useTransition` entre `FilterBar` (que
  dispara la navegación) y la grilla (que se atenúa con `CatalogFade`).

Cada propiedad tiene una página propia (`/propiedades/[code]`) con galería de fotos, subidas como
archivos reales desde `/admin` (Supabase Storage), dormitorios/camas/baños, amenities y un link
opcional a un tour virtual externo (ej. Polycam) o video. El precio admite cualquier combinación de
modalidades — por noche (con mínimo de noches opcional), por semana y/o por mes (para el caso típico
de "solo alquilo enero completo") — sin un campo de "modalidad" aparte: la modalidad la define qué
precio está cargado. Cada precio lleva su propia moneda (guaraníes o dólares), así que una misma
propiedad puede cotizar la noche en Gs y el mes en USD. El filtro de "precio máximo" del catálogo
tiene su propio selector Gs/USD y convierte con la cotización cargada en `/admin/configuracion`
(tabla `app_settings`) — una casa en Gs aparece si su equivalente en USD entra en el rango, y
viceversa. Desde el catálogo se pueden marcar hasta 3 propiedades para comparar lado a lado
en `/comparar`. El equipo ATS opera como agencia curadora: carga las propiedades, y registra reservas
formales (huésped, fechas, monto —en Gs o USD— y comisión) en `/admin/reservas`; el resumen del mes
muestra los totales por moneda y un combinado en Gs de referencia. El modelo de negocio es comisión
por reserva cerrada, cobrada por transferencia, no un marketplace de pagos online. Ver
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
5. Contenido completo de `supabase/migrations/0005_property_events.sql` (tracking de vistas/clics para el dashboard de métricas).
6. Contenido completo de `supabase/migrations/0006_property_photos_storage.sql` (bucket de Storage para fotos reales).
7. Contenido completo de `supabase/migrations/0007_property_status.sql` (estado operativo: disponible/reservada/alquilada temporada).
8. Contenido completo de `supabase/migrations/0008_property_owners.sql` (datos del propietario, uso interno).
9. Contenido completo de `supabase/migrations/0009_property_bookings.sql` (reservas formales + comisión).
10. Contenido completo de `supabase/migrations/0010_property_details.sql` (precio, dormitorios/camas/baños, amenities, tour virtual).
11. Contenido completo de `supabase/migrations/0011_rental_pricing.sql` (precio por semana/mes, minimo de noches).
12. Contenido completo de `supabase/migrations/0012_multi_currency.sql` (moneda por precio Gs/USD, moneda en reservas, `app_settings` con la cotización del dólar).

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
        properties/[id]/bookings/page.tsx -> reservas de una propiedad (alta + lista + cancelar)
        reservas/page.tsx             -> dashboard global de reservas (resumen del mes por moneda + combinado en Gs + tabla)
        metrics/page.tsx              -> dashboard de vistas/clics por propiedad (ultimos 30 dias)
        configuracion/page.tsx       -> cotizacion del dolar editable (app_settings)
    propiedades/[code]/page.tsx       -> pagina publica de detalle por propiedad (galeria, SEO, JSON-LD)
    comparar/page.tsx                 -> comparador publico (tabla lado a lado, hasta 3 propiedades)
    api/events/route.ts               -> registra clics a WhatsApp (fetch keepalive desde el cliente)
    sitemap.ts / robots.ts            -> SEO
  components/
    PropertyForm.tsx                  -> form compartido entre alta y edicion (admin), fotos + lat/lng + datos del propietario
    PhotoUploader.tsx                 -> upload de fotos directo del navegador a Supabase Storage (sin pasar por el servidor) + reordenar/quitar (admin)
    StatusSelect.tsx                  -> selector de estado (disponible/reservada/alquilada temporada) (admin)
    BookingForm.tsx                   -> alta de reserva (calendario de rango + huesped/monto/comision) (admin)
    CancelBookingButton.tsx           -> cancela una reserva y libera sus fechas (admin)
    DeleteButton.tsx                  -> boton de borrado con confirmacion (admin)
    AvailabilityCalendar.tsx          -> calendario de bloqueo de fechas (admin)
    site/                             -> componentes de la landing publica
      Nav.tsx, Hero.tsx, PropertyCard.tsx, TrustSection.tsx, OwnersSection.tsx, Footer.tsx, icons.tsx
      Gallery.tsx                     -> galeria con miniaturas (pagina de detalle)
      PhotoPlaceholder.tsx            -> placeholder compartido cuando una propiedad no tiene fotos
      FilterBar.tsx                   -> filtro publico (capacidad, zona, fechas, precio maximo con selector Gs/USD, dormitorios, amenities)
      PropertiesMap.tsx / PropertiesMapLoader.tsx -> mapa Leaflet (el Loader hace el dynamic import ssr:false)
      WhatsappCtaLink.tsx             -> link de WhatsApp que registra el clic (fetch keepalive a /api/events)
      CompareToggle.tsx               -> checkbox "Comparar" en cada card (estado vive en la URL, param compare)
      CompareBar.tsx                  -> barra fija con las propiedades marcadas para comparar
  lib/
    supabase/client.ts                -> cliente browser
    supabase/server.ts                -> cliente server (Server Components/Actions), respeta RLS
    supabase/anon.ts                  -> cliente sin cookies, para escrituras publicas dentro de after()
    actions/auth.ts                   -> login, logout
    actions/properties.ts             -> create/update/delete/toggleVerified/toggleActive/updatePropertyStatus + fotos + lat/lng + propietario + moneda por precio
    actions/availability.ts           -> blockDates, unblockDates
    actions/bookings.ts               -> createBooking (valida, chequea solapamiento, bloquea fechas, guarda moneda), cancelBooking
    actions/settings.ts               -> updateUsdRate: guarda la cotizacion del dolar en app_settings
    whatsapp.ts                       -> numero + armado de mensajes prearmados (un solo lugar)
    dates.ts                          -> helpers de fecha compartidos (ISO <-> Date, formato es-PY, datesInRange)
    currency.ts                       -> formatMoney(monto, moneda) + formatGs (atajo para guaranies)
    exchange-rate.ts                  -> getUsdToPygRate (lee app_settings, con fallback) + convert(monto, de, a, rate)
    site-url.ts                       -> URL base del sitio (VERCEL_PROJECT_PRODUCTION_URL)
    property-status.ts                -> labels del badge de estado + helper isPropertyAvailable
    amenities.ts                      -> lista fija de amenities + helper amenityLabel
    rental-pricing.ts                 -> priceLines: arma las lineas de precio (noche/semana/mes, cada una en su moneda) de una propiedad
  types/database.ts                   -> tipos de properties (precio/moneda/detalles/amenities/tour_url), property_photos, property_blocked_dates, property_events, property_owners, property_bookings, app_settings
  proxy.ts                            -> protege /admin/* excepto /admin/login (Next 16 renombro "middleware" a "proxy")
supabase/migrations/
  0001_properties.sql                 -> tabla + escritura autenticada
  0002_public_read_active.sql         -> lectura publica de propiedades activas
  0003_property_photos.sql            -> galeria de fotos por propiedad
  0004_search_and_map.sql             -> lat/lng + calendario de disponibilidad
  0005_property_events.sql            -> tracking de vistas/clics (escritura publica, lectura solo admin)
  0006_property_photos_storage.sql    -> bucket de Storage para fotos reales
  0007_property_status.sql            -> estado operativo (disponible/reservada/alquilada temporada)
  0008_property_owners.sql            -> datos del propietario (uso interno, sin politica publica)
  0009_property_bookings.sql          -> reservas formales + comision (uso interno, sin politica publica)
  0010_property_details.sql           -> precio, dormitorios/camas/banos, amenities, tour_url (publico)
  0011_rental_pricing.sql             -> precio por semana/mes, minimo de noches (publico)
  0012_multi_currency.sql             -> moneda (PYG/USD) por cada precio y por reserva + app_settings (cotizacion del dolar, lectura publica)
```

## Por qué este stack

Mismo patrón que `GES` (Next.js App Router + TypeScript + Tailwind v4 + Supabase + Vercel), pero
simplificado: un solo tipo de usuario autenticado (equipo ATS), sin tabla `profiles` ni roles. Se
agrega esa complejidad el día que haga falta (por ejemplo, si se suma un portal de propietarios).
