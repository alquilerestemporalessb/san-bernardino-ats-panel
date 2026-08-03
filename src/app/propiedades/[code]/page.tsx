import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { buildWhatsappLink } from "@/lib/whatsapp";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { Gallery } from "@/components/site/Gallery";
import { PeopleIcon, PinIcon, WhatsappIcon } from "@/components/site/icons";
import type { PropertyWithPhotos } from "@/types/database";

export const dynamic = "force-dynamic";

async function getProperty(code: string): Promise<PropertyWithPhotos | null> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("properties")
      .select("*, property_photos(*)")
      .ilike("code", code)
      .eq("active", true)
      .order("sort_order", { referencedTable: "property_photos" })
      .maybeSingle();
    return data;
  } catch (err) {
    console.error("[propiedad] fallo la conexion a Supabase:", err);
    return null;
  }
}

export async function generateMetadata(
  props: PageProps<"/propiedades/[code]">
): Promise<Metadata> {
  const { code } = await props.params;
  const property = await getProperty(code);

  if (!property) return { title: "Propiedad no encontrada" };

  const description = property.description ?? `${property.name} en ${property.zone}, San Bernardino. Hasta ${property.capacity} personas.`;
  const image = property.property_photos[0]?.url ?? "/isotype.png";

  return {
    title: property.name,
    description,
    openGraph: { title: property.name, description, images: [image] },
  };
}

export default async function PropertyDetailPage(props: PageProps<"/propiedades/[code]">) {
  const { code } = await props.params;
  const property = await getProperty(code);

  if (!property) notFound();

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-6xl px-6 py-10 sm:py-14">
        <Link href="/#catalogo" className="text-xs text-sb-cream-faint hover:text-sb-cream-muted">
          ← Volver al catálogo
        </Link>

        <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-[1.4fr_1fr] lg:items-start">
          <Gallery photos={property.property_photos} name={property.name} />

          <div className="flex flex-col gap-6 lg:sticky lg:top-24">
            <div>
              <div className="mb-3 flex items-center gap-3">
                <span className="rounded-full border border-sb-border-accent bg-sb-accent-muted px-3 py-1 text-xs font-semibold tracking-wide text-sb-accent">
                  {property.code}
                </span>
                {property.verified && (
                  <Image
                    src="/verified-badge.svg"
                    alt="Propiedad Verificada ATS"
                    width={32}
                    height={32}
                  />
                )}
              </div>

              <h1 className="text-balance font-serif text-3xl font-medium leading-tight text-sb-cream sm:text-4xl">
                {property.name}
              </h1>

              <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
                <li className="inline-flex items-center gap-1.5 text-sm text-sb-cream-muted">
                  <PeopleIcon className="h-4 w-4 text-sb-accent" />
                  Hasta {property.capacity} personas
                </li>
                <li className="inline-flex items-center gap-1.5 text-sm text-sb-cream-muted">
                  <PinIcon className="h-4 w-4 text-sb-accent" />
                  {property.zone}
                </li>
              </ul>
            </div>

            {property.description && (
              <p className="text-sm leading-relaxed text-sb-cream-muted">{property.description}</p>
            )}

            <a
              href={buildWhatsappLink(property)}
              target="_blank"
              rel="noopener"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-sb-accent px-6 py-3.5 text-sm font-semibold text-sb-bg transition-colors hover:bg-sb-accent-hover"
            >
              <WhatsappIcon className="h-[18px] w-[18px]" />
              Consultar por WhatsApp
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
