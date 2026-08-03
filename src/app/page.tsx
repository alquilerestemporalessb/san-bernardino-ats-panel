import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { Nav } from "@/components/site/Nav";
import { Hero } from "@/components/site/Hero";
import { PropertyCard } from "@/components/site/PropertyCard";
import { FilterBar } from "@/components/site/FilterBar";
import { CompareBar } from "@/components/site/CompareBar";
import { PropertiesMapLoader } from "@/components/site/PropertiesMapLoader";
import { Reveal } from "@/components/site/Reveal";
import { TrustSection } from "@/components/site/TrustSection";
import { OwnersSection } from "@/components/site/OwnersSection";
import { Footer } from "@/components/site/Footer";
import { HouseGlyph } from "@/components/site/icons";
import { getSiteUrl } from "@/lib/site-url";
import type { PropertyWithPhotos } from "@/types/database";

// Depende de datos en vivo (lo que se carga en /admin tiene que verse aca al instante) — nunca
// pre-renderizar estatico. Tambien evita que el build intente prerenderizarla contra Supabase.
export const dynamic = "force-dynamic";

interface Filters {
  capacity?: string;
  zone?: string;
  checkin?: string;
  checkout?: string;
  maxPrice?: string;
  bedrooms?: string;
  amenities?: string | string[];
}

async function getZones(): Promise<string[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase.from("properties").select("zone").eq("active", true);
    const zones = new Set((data ?? []).map((p) => p.zone));
    return [...zones].sort();
  } catch {
    return [];
  }
}

async function getFilteredProperties(filters: Filters): Promise<PropertyWithPhotos[]> {
  try {
    const supabase = await createClient();
    let query = supabase
      .from("properties")
      .select("*, property_photos(*)")
      .eq("active", true)
      .order("code", { ascending: true })
      .order("sort_order", { referencedTable: "property_photos" });

    if (filters.capacity) query = query.gte("capacity", Number(filters.capacity));
    if (filters.zone) query = query.eq("zone", filters.zone);
    if (filters.maxPrice) query = query.lte("price_per_night", Number(filters.maxPrice));
    if (filters.bedrooms) query = query.gte("bedrooms", Number(filters.bedrooms));
    if (filters.amenities) {
      const amenities = Array.isArray(filters.amenities) ? filters.amenities : [filters.amenities];
      if (amenities.length > 0) query = query.contains("amenities", amenities);
    }

    const { data, error } = await query;
    if (error) {
      console.error("[landing] error cargando propiedades:", error.message);
      return [];
    }
    let properties = data ?? [];

    if (filters.checkin && filters.checkout && properties.length > 0) {
      const { data: blocked } = await supabase
        .from("property_blocked_dates")
        .select("property_id")
        .in(
          "property_id",
          properties.map((p) => p.id)
        )
        .gte("date", filters.checkin)
        .lte("date", filters.checkout);

      const blockedPropertyIds = new Set((blocked ?? []).map((b) => b.property_id));
      properties = properties.filter((p) => !blockedPropertyIds.has(p.id));
    }

    return properties;
  } catch (err) {
    // Supabase sin configurar todavia (env vars de placeholder) — no debe tirar abajo la landing.
    console.error("[landing] fallo la conexion a Supabase:", err);
    return [];
  }
}

export default async function HomePage({
  searchParams,
}: PageProps<"/">) {
  const filters = (await searchParams) as Filters;
  const [properties, zones] = await Promise.all([
    getFilteredProperties(filters),
    getZones(),
  ]);
  const hasActiveFilters = Boolean(
    filters.capacity || filters.zone || filters.checkin || filters.maxPrice || filters.bedrooms || filters.amenities
  );
  const propertiesWithLocation = properties.filter(
    (p): p is PropertyWithPhotos & { latitude: number; longitude: number } =>
      p.latitude !== null && p.longitude !== null
  );

  const siteUrl = getSiteUrl();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    name: "San Bernardino — Alquileres Temporales",
    description:
      "Alquiler temporal de casas en San Bernardino, Paraguay. Propiedades verificadas, atención directa por WhatsApp.",
    url: siteUrl,
    logo: `${siteUrl}/isotype.png`,
    image: `${siteUrl}/isotype.png`,
    address: {
      "@type": "PostalAddress",
      addressLocality: "San Bernardino",
      addressRegion: "Cordillera",
      addressCountry: "PY",
    },
    sameAs: [
      "https://www.instagram.com/alquilertemporal_sanber",
      "https://www.tiktok.com/@alquiler.temporal.san.bernardino",
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Nav />
      <main>
        <Hero />

        <section id="catalogo" className="bg-sb-bg py-20 sm:py-28">
          <div className="mx-auto max-w-6xl px-6">
            <div className="mb-8 max-w-xl">
              <span className="mb-3 block text-xs font-semibold uppercase tracking-[0.18em] text-sb-accent">
                Catálogo
              </span>
              <h2 className="text-balance font-serif text-3xl font-medium leading-tight text-sb-cream sm:text-4xl">
                Propiedades disponibles
              </h2>
              <p className="mt-4 text-lg text-sb-cream-muted">
                Una selección curada de casas en San Ber, para cada tipo de grupo y presupuesto.
              </p>
            </div>

            <div className="mb-10">
              <Suspense fallback={null}>
                <FilterBar zones={zones} />
              </Suspense>
            </div>

            {properties.length === 0 ? (
              <div className="flex flex-col items-center gap-4 rounded-2xl border border-sb-border-subtle bg-sb-bg-elevated px-6 py-16 text-center">
                <HouseGlyph className="h-12 w-12 text-sb-cream-faint" />
                <p className="max-w-sm text-sm text-sb-cream-muted">
                  {hasActiveFilters
                    ? "No encontramos propiedades con esos filtros — probá con otras fechas, capacidad o zona."
                    : "Estamos sumando las primeras propiedades verificadas. Muy pronto vas a poder verlas acá — mientras tanto, escribinos por WhatsApp y te contamos qué tenemos disponible."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {properties.map((property, index) => (
                  <Reveal key={property.id} delayMs={(index % 3) * 80}>
                    <PropertyCard property={property} />
                  </Reveal>
                ))}
              </div>
            )}
          </div>
        </section>

        {propertiesWithLocation.length > 0 && (
          <section id="ubicacion" className="bg-sb-bg-sunken py-20 sm:py-28">
            <div className="mx-auto max-w-6xl px-6">
              <Reveal>
                <div className="mb-8 max-w-xl">
                  <span className="mb-3 block text-xs font-semibold uppercase tracking-[0.18em] text-sb-accent">
                    Ubicación
                  </span>
                  <h2 className="text-balance font-serif text-3xl font-medium leading-tight text-sb-cream sm:text-4xl">
                    Dónde están las propiedades
                  </h2>
                </div>
                <PropertiesMapLoader properties={propertiesWithLocation} />
              </Reveal>
            </div>
          </section>
        )}

        <TrustSection />
        <OwnersSection />
      </main>
      <CompareBar />
      <Footer />
    </>
  );
}
