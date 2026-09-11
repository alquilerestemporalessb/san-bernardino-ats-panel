import Image from "next/image";
import { buildGenericWhatsappLink } from "@/lib/whatsapp";
import { CheckIcon, WhatsappIcon } from "./icons";
import { Reveal } from "./Reveal";
import { STOCK_IMAGES } from "@/lib/stock-images";

const benefits = [
  "Publicación sin costo, sin comisión de entrada",
  "Sin exclusividad: seguís alquilando por tu cuenta también",
  "Fotos y verificación ATS incluidas",
  "Consultas directas por WhatsApp, vos decidís a quién alquilar",
];

export function OwnersSection() {
  return (
    <section id="propietarios" className="border-y border-site-border bg-site-bg py-20 sm:py-28">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 lg:grid-cols-2 lg:items-center lg:gap-16">
        <Reveal className="order-2 lg:order-1">
          <span className="mb-3 block text-xs font-semibold uppercase tracking-[0.2em] text-site-olive">
            Para propietarios
          </span>
          <h2 className="text-balance font-display text-3xl font-semibold leading-tight text-site-ink sm:text-4xl">
            Sumá tu casa gratis, sin exclusividad
          </h2>
          <p className="mt-4 max-w-md text-lg text-site-ink-muted">
            Publicamos tu propiedad en nuestro catálogo y la promocionamos en Instagram y TikTok.
            Vos seguís decidiendo con quién más trabajar.
          </p>

          <ul className="mt-8 flex flex-col gap-3">
            {benefits.map((benefit) => (
              <li key={benefit} className="flex items-start gap-3 text-sm text-site-ink">
                <CheckIcon className="mt-0.5 h-5 w-5 shrink-0 text-site-olive" />
                {benefit}
              </li>
            ))}
          </ul>

          <a
            href={buildGenericWhatsappLink(
              "Hola, tengo una casa en San Bernardino y quiero sumarla al catálogo de ATS."
            )}
            target="_blank"
            rel="noopener"
            className="btn-press mt-9 inline-flex items-center justify-center gap-2 rounded-full bg-site-olive px-7 py-3.5 text-sm font-semibold text-site-bg transition-colors hover:bg-site-olive-hover"
          >
            <WhatsappIcon className="h-[18px] w-[18px]" />
            Sumar mi propiedad, es gratis
          </a>
        </Reveal>

        <Reveal
          delayMs={120}
          className="relative order-1 aspect-[4/3] overflow-hidden rounded-3xl shadow-[0_24px_54px_rgba(36,31,24,0.16)] lg:order-2"
        >
          <Image
            src={STOCK_IMAGES.owners}
            alt="Villa moderna con pileta, del tipo que suma propietarios al catálogo"
            fill
            sizes="(min-width: 1024px) 560px, 90vw"
            className="object-cover"
          />
        </Reveal>
      </div>
    </section>
  );
}
