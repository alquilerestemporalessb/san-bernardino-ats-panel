import { createClient } from "@/lib/supabase/server";
import { PropertyCard } from "./PropertyCard";
import { Reveal } from "./Reveal";
import type { PropertyWithPhotos } from "@/types/database";

/**
 * Otras propiedades activas para cerrar la ficha — prioriza la misma zona (mas relevante para
 * quien ya eligio San Ber/zona), completa con el resto del catalogo si faltan.
 */
async function getSimilarProperties(
  excludeId: string,
  zone: string
): Promise<PropertyWithPhotos[]> {
  try {
    const supabase = await createClient();

    const { data: sameZone } = await supabase
      .from("properties")
      .select("*, property_photos(*)")
      .eq("active", true)
      .eq("zone", zone)
      .neq("id", excludeId)
      .order("sort_order", { referencedTable: "property_photos" })
      .limit(4);

    const results = sameZone ?? [];
    if (results.length >= 4) return results;

    const { data: rest } = await supabase
      .from("properties")
      .select("*, property_photos(*)")
      .eq("active", true)
      .neq("id", excludeId)
      .not("zone", "eq", zone)
      .order("code")
      .order("sort_order", { referencedTable: "property_photos" })
      .limit(4 - results.length);

    return [...results, ...(rest ?? [])];
  } catch (err) {
    console.error("[propiedad] fallo cargando propiedades similares:", err);
    return [];
  }
}

export async function SimilarProperties({ excludeId, zone }: { excludeId: string; zone: string }) {
  const properties = await getSimilarProperties(excludeId, zone);
  if (properties.length === 0) return null;

  return (
    <section className="mt-16 border-t border-site-border pt-12">
      <Reveal>
        <h2 className="font-display text-2xl font-semibold text-site-ink sm:text-3xl">
          Otras casas en San Ber que te pueden interesar
        </h2>
      </Reveal>

      <div className="mt-6 flex snap-x gap-5 overflow-x-auto pb-4">
        {properties.map((property, index) => (
          <Reveal
            key={property.id}
            delayMs={index * 80}
            className="w-[85vw] shrink-0 snap-start sm:w-[340px]"
          >
            <PropertyCard property={property} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
