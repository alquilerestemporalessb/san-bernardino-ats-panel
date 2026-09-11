import type { Metadata } from "next";
import { after } from "next/server";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAnonClient } from "@/lib/supabase/anon";
import { STATUS_BADGE_LABELS } from "@/lib/property-status";
import { getUsdToPygRate } from "@/lib/exchange-rate";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { ScrollToTop } from "@/components/site/ScrollToTop";
import { Gallery } from "@/components/site/Gallery";
import { AmenitiesGrid } from "@/components/site/AmenitiesGrid";
import { DescriptionSections } from "@/components/site/DescriptionSections";
import { TrustRulesSection } from "@/components/site/TrustRulesSection";
import { BookingWidget } from "@/components/site/BookingWidget";
import { SimilarProperties } from "@/components/site/SimilarProperties";
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

async function getBlockedDates(propertyId: string): Promise<string[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("property_blocked_dates")
      .select("date")
      .eq("property_id", propertyId);
    return (data ?? []).map((d) => d.date);
  } catch (err) {
    console.error("[propiedad] fallo cargando fechas bloqueadas:", err);
    return [];
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

  const statusLabel = STATUS_BADGE_LABELS[property.status];

  const supabase = await createClient();
  const [blockedDates, usdRate] = await Promise.all([
    getBlockedDates(property.id),
    getUsdToPygRate(supabase),
  ]);

  // Registra la vista despues de mandar la respuesta — no suma latencia a la carga de la pagina.
  // Cliente sin cookies: cookies() no esta disponible dentro de after() en un Server Component.
  after(async () => {
    try {
      const anon = createAnonClient();
      await anon.from("property_events").insert({ property_id: property.id, event_type: "view" });
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
            priceCurrency:
              property.price_per_night !== null
                ? property.price_per_night_currency
                : property.price_per_week !== null
                  ? property.price_per_week_currency
                  : property.price_per_month_currency,
            price:
              property.price_per_night ?? property.price_per_week ?? property.price_per_month,
            priceSpecification: [
              ...(property.price_per_night !== null
                ? [
                    {
                      "@type": "UnitPriceSpecification",
                      price: property.price_per_night,
                      priceCurrency: property.price_per_night_currency,
                      unitText: "NIGHT",
                    },
                  ]
                : []),
              ...(property.price_per_week !== null
                ? [
                    {
                      "@type": "UnitPriceSpecification",
                      price: property.price_per_week,
                      priceCurrency: property.price_per_week_currency,
                      unitText: "WEEK",
                    },
                  ]
                : []),
              ...(property.price_per_month !== null
                ? [
                    {
                      "@type": "UnitPriceSpecification",
                      price: property.price_per_month,
                      priceCurrency: property.price_per_month_currency,
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
    <div className="bg-site-bg font-ui text-site-ink">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ScrollToTop />
      <Nav />
      {/* pb-24 hasta lg: deja lugar a la barra fija del BookingWidget (solo visible <lg) para que no tape el contenido */}
      <main className="mx-auto max-w-7xl px-6 pb-24 pt-10 sm:pt-14 lg:pb-14">
        <Link href="/#catalogo" className="text-xs text-site-ink-faint hover:text-site-ink-muted">
          ← Volver al catálogo
        </Link>

        <div className="mt-5">
          <Gallery photos={property.property_photos} name={property.name} />
        </div>

        {/* Sin items-start a proposito: la columna del widget necesita estirarse para que su
            "sticky" tenga contenedor suficiente y quede pegado durante todo el scroll de la
            columna izquierda (mas larga ahora, con la descripcion estructurada) — con items-start
            el sticky se quedaba sin alto donde pegarse y el widget desaparecia a mitad de pagina. */}
        <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-3 lg:gap-12">
          <div className="min-w-0 flex flex-col gap-8 lg:col-span-2">
            <div>
              <div className="mb-3 flex items-center gap-3">
                <span className="rounded-full border border-site-terracotta bg-site-terracotta-muted px-3 py-1 text-xs font-semibold tracking-wide text-site-terracotta">
                  {property.code}
                </span>
                {statusLabel && (
                  <span className="rounded-full border border-site-terracotta bg-site-bg px-3 py-1 text-xs font-semibold tracking-wide text-site-terracotta">
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

              <h1 className="text-balance font-display text-3xl font-semibold leading-tight text-site-ink sm:text-4xl">
                {property.name}
              </h1>
            </div>

            <AmenitiesGrid property={property} />

            <DescriptionSections description={property.description} />

            <TrustRulesSection />

            {property.tour_url && (
              <div>
                <h2 className="mb-4 font-display text-xl text-site-ink">Tour virtual</h2>
                <div className="rounded-2xl border border-stone-200/60 shadow-sm overflow-hidden">
                  <div className="aspect-video w-full bg-site-bg-elevated">
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
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <BookingWidget property={property} usdRate={usdRate} blockedDates={blockedDates} />
          </div>
        </div>

        <SimilarProperties excludeId={property.id} zone={property.zone} />
      </main>
      <Footer />
    </div>
  );
}
