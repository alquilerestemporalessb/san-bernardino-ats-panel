import Link from "next/link";
import Image from "next/image";
import type { PropertyWithPhotos } from "@/types/database";
import { buildWhatsappLink } from "@/lib/whatsapp";
import { STATUS_BADGE_LABELS, isPropertyAvailable } from "@/lib/property-status";
import { priceLines } from "@/lib/rental-pricing";
import { BathIcon, BedIcon, PeopleIcon, PinIcon, WhatsappIcon } from "./icons";
import { PhotoPlaceholder } from "./PhotoPlaceholder";
import { PropertyCardGallery } from "./PropertyCardGallery";
import { WhatsappCtaLink } from "./WhatsappCtaLink";
import { CompareToggle } from "./CompareToggle";

export function PropertyCard({ property }: { property: PropertyWithPhotos }) {
  const detailHref = `/propiedades/${property.code.toLowerCase()}`;
  const available = isPropertyAvailable(property.status);
  const statusLabel = STATUS_BADGE_LABELS[property.status];
  const prices = priceLines(property);

  return (
    <article className="group flex flex-col overflow-hidden rounded-3xl border border-site-border bg-site-bg-elevated shadow-[0_10px_28px_rgba(36,31,24,0.07)] transition-all duration-300 hover:-translate-y-1.5 hover:border-site-terracotta/40 hover:shadow-[0_26px_54px_rgba(36,31,24,0.16)]">
      <Link href={detailHref} className="relative block aspect-[4/3] overflow-hidden">
        {property.property_photos.length > 0 ? (
          <PropertyCardGallery photos={property.property_photos} alt={property.name} />
        ) : (
          <PhotoPlaceholder />
        )}

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

        <span className="absolute left-3 top-3 rounded-full border border-white/25 bg-site-ink/70 px-3 py-1 text-xs font-semibold tracking-wide text-white backdrop-blur-sm">
          {property.code}
        </span>

        {statusLabel && (
          <span className="absolute bottom-3 left-3 rounded-full border border-white/25 bg-site-ink/70 px-3 py-1 text-xs font-semibold tracking-wide text-white backdrop-blur-sm">
            {statusLabel}
          </span>
        )}

        {property.verified && (
          <Image
            src="/verified-badge.svg"
            alt="Propiedad Verificada ATS"
            width={42}
            height={42}
            className="absolute right-3 top-3 drop-shadow-[0_2px_6px_rgba(0,0,0,0.45)]"
          />
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <Link href={detailHref}>
          <h3 className="font-display text-xl font-semibold leading-snug text-site-ink transition-colors group-hover:text-site-terracotta">
            {property.name}
          </h3>
        </Link>

        <ul className="flex flex-wrap gap-x-4 gap-y-2">
          <li className="inline-flex items-center gap-1.5 text-sm text-site-ink-muted">
            <PeopleIcon className="h-4 w-4 text-site-terracotta" />
            Hasta {property.capacity} personas
          </li>
          <li className="inline-flex items-center gap-1.5 text-sm text-site-ink-muted">
            <PinIcon className="h-4 w-4 text-site-terracotta" />
            {property.zone}
          </li>
          {property.bedrooms !== null && (
            <li className="inline-flex items-center gap-1.5 text-sm text-site-ink-muted">
              <BedIcon className="h-4 w-4 text-site-terracotta" />
              {property.bedrooms} dorm.
            </li>
          )}
          {property.bathrooms !== null && (
            <li className="inline-flex items-center gap-1.5 text-sm text-site-ink-muted">
              <BathIcon className="h-4 w-4 text-site-terracotta" />
              {property.bathrooms} baños
            </li>
          )}
        </ul>

        <div className="text-sm font-medium text-site-ink">
          {prices.length > 0 ? (
            prices.map((line) => <p key={line}>{line}</p>)
          ) : (
            <p className="text-site-ink-muted">Consultar precio</p>
          )}
        </div>

        <CompareToggle code={property.code.toLowerCase()} />

        <WhatsappCtaLink
          propertyId={property.id}
          href={buildWhatsappLink(property)}
          className="btn-press mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-site-terracotta px-4 py-2.5 text-sm font-semibold text-site-bg transition-colors hover:bg-site-terracotta-hover"
        >
          <WhatsappIcon className="h-[18px] w-[18px]" />
          {available ? "Consultar por WhatsApp" : "Consultar disponibilidad"}
        </WhatsappCtaLink>
      </div>
    </article>
  );
}
