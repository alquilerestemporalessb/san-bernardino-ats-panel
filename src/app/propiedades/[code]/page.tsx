import type { Metadata } from "next";
import { after } from "next/server";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAnonClient } from "@/lib/supabase/anon";
import { buildWhatsappLink } from "@/lib/whatsapp";
import { STATUS_BADGE_LABELS, isPropertyAvailable } from "@/lib/property-status";
import { priceLines } from "@/lib/rental-pricing";
import { amenityLabel } from "@/lib/amenities";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { Gallery } from "@/components/site/Gallery";
import { BathIcon, BedIcon, PeopleIcon, PinIcon, WhatsappIcon } from "@/components/site/icons";
import { WhatsappCtaLink } from "@/components/site/WhatsappCtaLink";
import { getSiteUrl } from "@/lib/site-url";
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

  const available = isPropertyAvailable(property.status);
  const statusLabel = STATUS_BADGE_LABELS[property.status];
  const prices = priceLines(property);

  // Registra la vista despues de mandar la respuesta — no suma latencia a la carga de la pagina.
  // Cliente sin cookies: cookies() no esta disponible dentro de after() en un Server Component.
  after(async () => {
    try {
      const supabase = createAnonClient();
      await supabase
        .from("property_events")
        .insert({ property_id: property.id, event_type: "view" });
    } catch (err) {
      console.error("[propiedad] fallo al registrar la vista:", err);
    }
  });

  const siteUrl = getSiteUrl();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "House",
    name: property.name,
    description:
      property.description ??
      `${property.name} en ${property.zone}, San Bernardino. Hasta ${property.capacity} personas.`,
    url: `${siteUrl}/propiedades/${property.code.toLowerCase()}`,
    image: property.property_photos.map((p) => p.url),
    address: {
      "@type": "PostalAddress",
      addressLocality: property.zone,
      addressRegion: "Cordillera",
      addressCountry: "PY",
    },
    ...(property.latitude !== null && property.longitude !== null
      ? {
          geo: {
            "@type": "GeoCoordinates",
            latitude: property.latitude,
            longitude: property.longitude,
          },
        }
      : {}),
    occupancy: {
      "@type": "QuantitativeValue",
      maxValue: property.capacity,
    },
    ...(property.price_per_night !== null ||
    property.price_per_week !== null ||
    property.price_per_month !== null
      ? {
          offers: {
            "@type": "Offer",
            priceCurrency: "PYG",
            price: property.price_per_night ?? property.price_per_week ?? property.price_per_month,
            priceSpecification: [
              ...(property.price_per_night !== null
                ? [
                    {
                      "@type": "UnitPriceSpecification",
                      price: property.price_per_night,
                      priceCurrency: "PYG",
                      unitText: "NIGHT",
                    },
                  ]
                : []),
              ...(property.price_per_week !== null
                ? [
                    {
                      "@type": "UnitPriceSpecification",
                      price: property.price_per_week,
                      priceCurrency: "PYG",
                      unitText: "WEEK",
                    },
                  ]
                : []),
              ...(property.price_per_month !== null
                ? [
                    {
                      "@type": "UnitPriceSpecification",
                      price: property.price_per_month,
                      priceCurrency: "PYG",
                      unitText: "MONTH",
                    },
                  ]
                : []),
            ],
          },
        }
      : {}),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
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
                {statusLabel && (
                  <span className="rounded-full border border-sb-border-accent bg-sb-bg px-3 py-1 text-xs font-semibold tracking-wide text-sb-accent">
                    {statusLabel}
                  </span>
                )}
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
                {property.bedrooms !== null && (
                  <li className="inline-flex items-center gap-1.5 text-sm text-sb-cream-muted">
                    <BedIcon className="h-4 w-4 text-sb-accent" />
                    {property.bedrooms} dormitorio{property.bedrooms === 1 ? "" : "s"}
                  </li>
                )}
                {property.beds !== null && (
                  <li className="inline-flex items-center gap-1.5 text-sm text-sb-cream-muted">
                    <BedIcon className="h-4 w-4 text-sb-accent" />
                    {property.beds} cama{property.beds === 1 ? "" : "s"}
                  </li>
                )}
                {property.bathrooms !== null && (
                  <li className="inline-flex items-center gap-1.5 text-sm text-sb-cream-muted">
                    <BathIcon className="h-4 w-4 text-sb-accent" />
                    {property.bathrooms} baño{property.bathrooms === 1 ? "" : "s"}
                  </li>
                )}
              </ul>

              {property.amenities.length > 0 && (
                <ul className="mt-4 flex flex-wrap gap-2">
                  {property.amenities.map((amenity) => (
                    <li
                      key={amenity}
                      className="rounded-full border border-sb-border-subtle px-3 py-1 text-xs text-sb-cream-muted"
                    >
                      {amenityLabel(amenity)}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {property.description && (
              <p className="text-justify text-sm leading-relaxed text-sb-cream-muted">
                {property.description}
              </p>
            )}

            <div className="flex flex-col gap-1 text-lg font-medium text-sb-cream">
              {prices.length > 0 ? (
                prices.map((line) => <p key={line}>{line}</p>)
              ) : (
                <p className="text-sm font-normal text-sb-cream-muted">Consultar precio</p>
              )}
            </div>

            <WhatsappCtaLink
              propertyId={property.id}
              href={buildWhatsappLink(property)}
              className="btn-press inline-flex items-center justify-center gap-2 rounded-md bg-sb-accent px-6 py-3.5 text-sm font-semibold text-sb-bg transition-colors hover:bg-sb-accent-hover"
            >
              <WhatsappIcon className="h-[18px] w-[18px]" />
              {available ? "Consultar por WhatsApp" : "Consultar disponibilidad"}
            </WhatsappCtaLink>
          </div>
        </div>

        {property.tour_url && (
          <div className="mt-12">
            <h2 className="mb-4 font-serif text-xl text-sb-cream">Tour virtual</h2>
            <div className="aspect-video w-full overflow-hidden rounded-2xl border border-sb-border-subtle bg-sb-bg-elevated">
              <iframe
                src={property.tour_url}
                title={`Tour virtual — ${property.name}`}
                className="h-full w-full"
                sandbox="allow-scripts allow-same-origin allow-popups allow-storage-access-by-user-activation allow-top-navigation-by-user-activation"
                loading="lazy"
                allow="xr-spatial-tracking; gyroscope; accelerometer; autoplay; fullscreen; encrypted-media; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
