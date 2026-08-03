import Image from "next/image";
import { buildGenericWhatsappLink } from "@/lib/whatsapp";
import { WhatsappIcon } from "./icons";

const stats = [
  { value: "+40", label: "familias hospedadas" },
  { value: "100%", label: "propiedades visitadas" },
  { value: "Gs. 0", label: "costo de reserva" },
];

export function Hero() {
  return (
    <section id="top" className="bg-hero-glow bg-noise">
      <div className="mx-auto flex max-w-4xl flex-col items-center px-6 pb-20 pt-20 text-center sm:pt-28">
        <Image
          src="/isotype.png"
          alt="San Bernardino — Alquileres Temporales"
          width={64}
          height={64}
          className="mb-8 h-14 w-14 animate-fade-up opacity-90 sm:h-16 sm:w-16"
        />

        <h1
          className="text-balance animate-fade-up font-serif font-medium text-sb-cream"
          style={{ fontSize: "clamp(2.25rem, 5vw + 1rem, 4rem)", lineHeight: 1.08, animationDelay: "80ms" }}
        >
          Casas de temporada en San Ber,{" "}
          <em className="text-sb-accent not-italic">elegidas y verificadas</em> para vos
        </h1>

        <p
          className="mt-6 max-w-xl animate-fade-up text-balance text-lg text-sb-cream-muted"
          style={{ animationDelay: "160ms" }}
        >
          Alquiler temporal boutique en San Bernardino. Cada propiedad la visitamos nosotros antes de
          publicarla — coordinás directo por WhatsApp, sin intermediarios ni sorpresas.
        </p>

        <div
          className="mt-10 flex animate-fade-up flex-wrap items-center justify-center gap-4"
          style={{ animationDelay: "240ms" }}
        >
          <a
            href="#catalogo"
            className="btn-press rounded-md bg-sb-accent px-7 py-3.5 text-sm font-semibold text-sb-bg shadow-[0_8px_24px_rgba(157,101,64,0.35)] transition-all hover:-translate-y-0.5 hover:bg-sb-accent-hover"
          >
            Ver propiedades
          </a>
          <a
            href={buildGenericWhatsappLink("Hola, quiero mas info sobre San Bernardino Alquileres Temporales.")}
            target="_blank"
            rel="noopener"
            className="btn-press inline-flex items-center gap-2 rounded-md border border-sb-border-subtle px-7 py-3.5 text-sm font-semibold text-sb-cream transition-colors hover:border-sb-border-accent"
          >
            <WhatsappIcon className="h-4 w-4" />
            Escribinos
          </a>
        </div>

        <dl
          className="mt-16 grid animate-fade-up grid-cols-3 gap-6 border-t border-sb-border-subtle pt-8 sm:gap-12"
          style={{ animationDelay: "320ms" }}
        >
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col items-center gap-1">
              <dt className="sr-only">{stat.label}</dt>
              <dd className="font-serif text-2xl text-sb-cream sm:text-3xl">{stat.value}</dd>
              <span className="text-center text-[0.65rem] uppercase tracking-[0.1em] text-sb-cream-faint sm:text-xs">
                {stat.label}
              </span>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
