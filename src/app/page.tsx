import { createClient } from "@/lib/supabase/server";
import { Nav } from "@/components/site/Nav";
import { Hero } from "@/components/site/Hero";
import { PropertyCard } from "@/components/site/PropertyCard";
import { TrustSection } from "@/components/site/TrustSection";
import { OwnersSection } from "@/components/site/OwnersSection";
import { Footer } from "@/components/site/Footer";
import { HouseGlyph } from "@/components/site/icons";
import type { PropertyWithPhotos } from "@/types/database";

// Depende de datos en vivo (lo que se carga en /admin tiene que verse aca al instante) — nunca
// pre-renderizar estatico. Tambien evita que el build intente prerenderizarla contra Supabase.
export const dynamic = "force-dynamic";

async function getActiveProperties(): Promise<PropertyWithPhotos[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("properties")
      .select("*, property_photos(*)")
      .eq("active", true)
      .order("code", { ascending: true })
      .order("sort_order", { referencedTable: "property_photos" });

    if (error) {
      console.error("[landing] error cargando propiedades:", error.message);
      return [];
    }
    return data ?? [];
  } catch (err) {
    // Supabase sin configurar todavia (env vars de placeholder) — no debe tirar abajo la landing.
    console.error("[landing] fallo la conexion a Supabase:", err);
    return [];
  }
}

export default async function HomePage() {
  const properties = await getActiveProperties();

  return (
    <>
      <Nav />
      <main>
        <Hero />

        <section id="catalogo" className="bg-sb-bg py-20 sm:py-28">
          <div className="mx-auto max-w-6xl px-6">
            <div className="mb-12 max-w-xl">
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

            {properties.length === 0 ? (
              <div className="flex flex-col items-center gap-4 rounded-2xl border border-sb-border-subtle bg-sb-bg-elevated px-6 py-16 text-center">
                <HouseGlyph className="h-12 w-12 text-sb-cream-faint" />
                <p className="max-w-sm text-sm text-sb-cream-muted">
                  Estamos sumando las primeras propiedades verificadas. Muy pronto vas a poder verlas
                  acá — mientras tanto, escribinos por WhatsApp y te contamos qué tenemos disponible.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {properties.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            )}
          </div>
        </section>

        <TrustSection />
        <OwnersSection />
      </main>
      <Footer />
    </>
  );
}
