import Image from "next/image";
import { buildGenericWhatsappLink } from "@/lib/whatsapp";
import { PinIcon, WhatsappIcon } from "./icons";
import { STOCK_IMAGES } from "@/lib/stock-images";

const stats = [
  { value: "+40", label: "familias hospedadas" },
  { value: "100%", label: "propiedades visitadas" },
  { value: "Gs. 0", label: "costo de reserva" },
];

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden bg-site-glow bg-noise-light">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-14 px-6 pb-16 pt-12 sm:pt-16 lg:grid-cols-[1.05fr_1fr] lg:gap-8 lg:pb-24 lg:pt-20">
        {/* Columna de texto */}
        <div className="relative z-10 flex flex-col items-start lg:pr-4">
          <span
            className="mb-6 inline-flex animate-fade-up items-center gap-2 rounded-full border border-site-border bg-site-bg-elevated px-4 py-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-site-terracotta"
          >
            <PinIcon className="h-3 w-3" />
            San Bernardino, Paraguay
          </span>

          <h1
            className="text-balance animate-fade-up font-display font-semibold text-site-ink"
            style={{
              fontSize: "clamp(2.75rem, 3.6vw + 1.5rem, 4.75rem)",
              lineHeight: 1.03,
              animationDelay: "80ms",
            }}
          >
            Casas de temporada, elegidas y{" "}
            <span className="italic text-site-terracotta">verificadas</span> para vos
          </h1>

          <p
            className="mt-6 max-w-md animate-fade-up text-balance text-lg leading-relaxed text-site-ink-muted"
            style={{ animationDelay: "160ms" }}
          >
            Alquiler temporal boutique en San Bernardino. Cada propiedad la visitamos nosotros
            antes de publicarla — coordinás directo por WhatsApp, sin intermediarios ni sorpresas.
          </p>

          <div
            className="mt-9 flex animate-fade-up flex-wrap items-center gap-4"
            style={{ animationDelay: "240ms" }}
          >
            <a
              href="#catalogo"
              className="btn-press rounded-full bg-site-terracotta px-8 py-4 text-sm font-semibold text-site-bg shadow-[0_14px_30px_rgba(157,101,64,0.35)] transition-all hover:-translate-y-0.5 hover:bg-site-terracotta-hover"
            >
              Ver propiedades
            </a>
            <a
              href={buildGenericWhatsappLink(
                "Hola, quiero mas info sobre San Bernardino Alquileres Temporales."
              )}
              target="_blank"
              rel="noopener"
              className="btn-press animate-pulse-glow inline-flex items-center gap-2 rounded-full border border-site-whatsapp/40 bg-site-bg-elevated px-7 py-4 text-sm font-semibold text-site-ink transition-colors hover:border-site-whatsapp"
            >
              <WhatsappIcon className="h-4 w-4 text-site-whatsapp" />
              Escribinos
            </a>
          </div>

          <dl
            className="mt-14 grid w-full animate-fade-up grid-cols-3 gap-6 border-t border-site-border pt-7 sm:gap-10"
            style={{ animationDelay: "320ms" }}
          >
            {stats.map((stat) => (
              <div key={stat.label} className="flex flex-col gap-1">
                <dt className="sr-only">{stat.label}</dt>
                <dd className="font-display text-2xl font-semibold text-site-ink sm:text-3xl">
                  {stat.value}
                </dd>
                <span className="text-[0.65rem] uppercase tracking-[0.1em] text-site-ink-faint sm:text-xs">
                  {stat.label}
                </span>
              </div>
            ))}
          </dl>
        </div>

        {/* Collage asimetrico de imagenes */}
        <div className="relative h-[340px] sm:h-[440px] lg:h-[580px]">
          <div className="absolute inset-y-0 right-0 left-10 overflow-hidden rounded-[2rem] shadow-[0_30px_70px_rgba(36,31,24,0.28)] sm:left-14">
            <Image
              src={STOCK_IMAGES.heroMain}
              alt="Casa boutique en San Bernardino, arquitectura moderna al atardecer"
              fill
              priority
              sizes="(min-width: 1024px) 620px, 80vw"
              className="object-cover"
            />
          </div>

          <div className="absolute -bottom-6 left-0 h-32 w-44 overflow-hidden rounded-2xl border-4 border-site-bg shadow-[0_20px_45px_rgba(36,31,24,0.32)] sm:h-44 sm:w-60">
            <Image
              src={STOCK_IMAGES.heroSecondary}
              alt="Interior calido de una casa boutique"
              fill
              sizes="240px"
              className="object-cover"
            />
          </div>

          <div className="absolute -top-2 right-2 flex items-center gap-3 rounded-2xl border border-site-border bg-site-bg-elevated/95 px-4 py-3 shadow-[0_16px_32px_rgba(36,31,24,0.16)] backdrop-blur-sm sm:right-6">
            <Image src="/verified-badge.svg" alt="" width={34} height={34} />
            <div className="leading-tight">
              <p className="text-xs font-semibold text-site-ink">100% verificadas</p>
              <p className="text-[0.65rem] text-site-ink-faint">visitadas en persona</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
