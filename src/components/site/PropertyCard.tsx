import Image from "next/image";
import Link from "next/link";
import type { PropertyWithPhotos } from "@/types/database";
import { buildWhatsappLink } from "@/lib/whatsapp";
import { PeopleIcon, PinIcon, WhatsappIcon } from "./icons";
import { PhotoPlaceholder } from "./PhotoPlaceholder";
import { WhatsappCtaLink } from "./WhatsappCtaLink";

export function PropertyCard({ property }: { property: PropertyWithPhotos }) {
  const cover = property.property_photos[0]?.url;
  const detailHref = `/propiedades/${property.code.toLowerCase()}`;

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-sb-border-subtle bg-sb-bg-elevated shadow-[0_8px_24px_rgba(0,0,0,0.35)] transition-all duration-300 hover:-translate-y-1 hover:border-sb-border-accent hover:shadow-[0_16px_36px_rgba(0,0,0,0.45)]">
      <Link href={detailHref} className="relative block aspect-[4/3] overflow-hidden">
        {cover ? (
          <Image
            src={cover}
            alt={property.name}
            fill
            sizes="(min-width: 1024px) 360px, (min-width: 640px) 45vw, 90vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <PhotoPlaceholder />
        )}

        <span className="absolute left-3 top-3 rounded-full border border-sb-border-accent bg-sb-bg/80 px-3 py-1 text-xs font-semibold tracking-wide text-sb-cream backdrop-blur-sm">
          {property.code}
        </span>

        {property.verified && (
          <Image
            src="/verified-badge.svg"
            alt="Propiedad Verificada ATS"
            width={44}
            height={44}
            className="absolute right-3 top-3 drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)]"
          />
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <Link href={detailHref}>
          <h3 className="font-serif text-lg font-medium leading-snug text-sb-cream transition-colors group-hover:text-sb-accent">
            {property.name}
          </h3>
        </Link>

        <ul className="flex flex-wrap gap-x-4 gap-y-2">
          <li className="inline-flex items-center gap-1.5 text-sm text-sb-cream-muted">
            <PeopleIcon className="h-4 w-4 text-sb-accent" />
            Hasta {property.capacity} personas
          </li>
          <li className="inline-flex items-center gap-1.5 text-sm text-sb-cream-muted">
            <PinIcon className="h-4 w-4 text-sb-accent" />
            {property.zone}
          </li>
        </ul>

        <WhatsappCtaLink
          propertyId={property.id}
          href={buildWhatsappLink(property)}
          className="btn-press mt-2 inline-flex items-center justify-center gap-2 rounded-md bg-sb-accent px-4 py-2.5 text-sm font-semibold text-sb-bg transition-colors hover:bg-sb-accent-hover"
        >
          <WhatsappIcon className="h-[18px] w-[18px]" />
          Consultar por WhatsApp
        </WhatsappCtaLink>
      </div>
    </article>
  );
}
