import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { CompareBar } from "@/components/site/CompareBar";
import { WhatsappCtaLink } from "@/components/site/WhatsappCtaLink";
import { PhotoPlaceholder } from "@/components/site/PhotoPlaceholder";
import {
  BathIcon,
  BedIcon,
  CheckIcon,
  PeopleIcon,
  PinIcon,
  WhatsappIcon,
} from "@/components/site/icons";
import { buildWhatsappLink } from "@/lib/whatsapp";
import { priceLines } from "@/lib/rental-pricing";
import { AMENITIES } from "@/lib/amenities";
import { isPropertyAvailable } from "@/lib/property-status";
import type { PropertyWithPhotos } from "@/types/database";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Comparar propiedades",
  robots: { index: false },
};

interface CompareParams {
  compare?: string | string[];
}

async function getProperties(codes: string[]): Promise<PropertyWithPhotos[]> {
  if (codes.length === 0) return [];
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("properties")
      .select("*, property_photos(*)")
      .in(
        "code",
        codes.map((c) => c.toUpperCase())
      )
      .eq("active", true)
      .order("sort_order", { referencedTable: "property_photos" });
    return data ?? [];
  } catch (err) {
    console.error("[comparar] fallo la conexion a Supabase:", err);
    return [];
  }
}

export default async function ComparePage({ searchParams }: PageProps<"/comparar">) {
  const params = (await searchParams) as CompareParams;
  const raw = params.compare;
  const codes = (Array.isArray(raw) ? raw : raw ? [raw] : []).slice(0, 3);
  const properties = await getProperties(codes);

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-6xl px-6 pb-28 pt-10 sm:pt-14">
        <Link href="/#catalogo" className="text-xs text-sb-cream-faint hover:text-sb-cream-muted">
          ← Volver al catálogo
        </Link>

        <h1 className="mt-4 font-serif text-3xl text-sb-cream">Comparar propiedades</h1>

        {properties.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-sb-border-subtle bg-sb-bg-elevated px-6 py-16 text-center">
            <p className="text-sm text-sb-cream-muted">
              No elegiste propiedades para comparar. Volvé al catálogo y marcá &quot;Comparar&quot;
              en las que te interesen.
            </p>
          </div>
        ) : (
          <div className="mt-8 overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-sm">
              <tbody>
                <tr>
                  <RowLabel />
                  {properties.map((p) => (
                    <td key={p.id} className="border-b border-sb-border-subtle px-4 py-4 align-top">
                      <div className="relative aspect-[4/3] w-48 overflow-hidden rounded-xl">
                        {p.property_photos[0] ? (
                          <Image
                            src={p.property_photos[0].url}
                            alt={p.name}
                            fill
                            sizes="192px"
                            className="object-cover"
                          />
                        ) : (
                          <PhotoPlaceholder />
                        )}
                      </div>
                      <Link
                        href={`/propiedades/${p.code.toLowerCase()}`}
                        className="mt-2 block font-serif text-base text-sb-cream hover:text-sb-accent"
                      >
                        {p.name}
                      </Link>
                      <p className="text-xs text-sb-cream-faint">{p.code}</p>
                    </td>
                  ))}
                </tr>

                <Row label="Precio">
                  {properties.map((p) => {
                    const lines = priceLines(p);
                    return (
                      <Cell key={p.id}>
                        {lines.length > 0 ? (
                          lines.map((line) => <p key={line}>{line}</p>)
                        ) : (
                          <>Consultar precio</>
                        )}
                      </Cell>
                    );
                  })}
                </Row>

                <Row label="Capacidad">
                  {properties.map((p) => (
                    <Cell key={p.id}>
                      <span className="inline-flex items-center gap-1.5">
                        <PeopleIcon className="h-4 w-4 text-sb-accent" /> Hasta {p.capacity} personas
                      </span>
                    </Cell>
                  ))}
                </Row>

                <Row label="Zona">
                  {properties.map((p) => (
                    <Cell key={p.id}>
                      <span className="inline-flex items-center gap-1.5">
                        <PinIcon className="h-4 w-4 text-sb-accent" /> {p.zone}
                      </span>
                    </Cell>
                  ))}
                </Row>

                <Row label="Dormitorios">
                  {properties.map((p) => (
                    <Cell key={p.id}>
                      <span className="inline-flex items-center gap-1.5">
                        <BedIcon className="h-4 w-4 text-sb-accent" /> {p.bedrooms ?? "—"}
                      </span>
                    </Cell>
                  ))}
                </Row>

                <Row label="Camas">
                  {properties.map((p) => (
                    <Cell key={p.id}>
                      <span className="inline-flex items-center gap-1.5">
                        <BedIcon className="h-4 w-4 text-sb-accent" /> {p.beds ?? "—"}
                      </span>
                    </Cell>
                  ))}
                </Row>

                <Row label="Baños">
                  {properties.map((p) => (
                    <Cell key={p.id}>
                      <span className="inline-flex items-center gap-1.5">
                        <BathIcon className="h-4 w-4 text-sb-accent" /> {p.bathrooms ?? "—"}
                      </span>
                    </Cell>
                  ))}
                </Row>

                <Row label="Verificada">
                  {properties.map((p) => (
                    <Cell key={p.id}>
                      {p.verified ? (
                        <CheckIcon className="h-4 w-4 text-sb-accent" />
                      ) : (
                        <span className="text-sb-cream-faint">—</span>
                      )}
                    </Cell>
                  ))}
                </Row>

                {AMENITIES.map((amenity) => (
                  <Row key={amenity.value} label={amenity.label}>
                    {properties.map((p) => (
                      <Cell key={p.id}>
                        {p.amenities.includes(amenity.value) ? (
                          <CheckIcon className="h-4 w-4 text-sb-accent" />
                        ) : (
                          <span className="text-sb-cream-faint">—</span>
                        )}
                      </Cell>
                    ))}
                  </Row>
                ))}

                <tr>
                  <RowLabel />
                  {properties.map((p) => (
                    <td key={p.id} className="px-4 py-4 align-top">
                      <WhatsappCtaLink
                        propertyId={p.id}
                        href={buildWhatsappLink(p)}
                        className="btn-press inline-flex items-center justify-center gap-2 rounded-md bg-sb-accent px-4 py-2.5 text-xs font-semibold text-sb-bg transition-colors hover:bg-sb-accent-hover"
                      >
                        <WhatsappIcon className="h-4 w-4" />
                        {isPropertyAvailable(p.status) ? "Consultar" : "Consultar disponibilidad"}
                      </WhatsappCtaLink>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </main>
      <CompareBar />
      <Footer />
    </>
  );
}

function RowLabel() {
  return (
    <td className="sticky left-0 border-b border-sb-border-subtle bg-sb-bg px-4 py-4 align-top text-xs font-medium text-sb-cream-faint" />
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <tr>
      <td className="sticky left-0 border-b border-sb-border-subtle bg-sb-bg px-4 py-4 align-top text-xs font-medium text-sb-cream-faint">
        {label}
      </td>
      {children}
    </tr>
  );
}

function Cell({ children }: { children: React.ReactNode }) {
  return (
    <td className="border-b border-sb-border-subtle px-4 py-4 align-top text-sb-cream-muted">
      {children}
    </td>
  );
}
