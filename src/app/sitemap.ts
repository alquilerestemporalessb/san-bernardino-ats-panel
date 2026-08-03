import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/site-url";

// Depende de datos en vivo (catalogo puede cambiar) — evita el intento de prerender estatico
// (que igual fallaria por el uso de cookies() adentro de createClient() y solo generaria ruido).
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();

  const entries: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];

  try {
    const supabase = await createClient();
    const { data: properties } = await supabase
      .from("properties")
      .select("code, updated_at")
      .eq("active", true);

    for (const property of properties ?? []) {
      entries.push({
        url: `${siteUrl}/propiedades/${property.code.toLowerCase()}`,
        lastModified: new Date(property.updated_at),
        changeFrequency: "weekly",
        priority: 0.8,
      });
    }
  } catch (err) {
    console.error("[sitemap] fallo la conexion a Supabase:", err);
  }

  return entries;
}
