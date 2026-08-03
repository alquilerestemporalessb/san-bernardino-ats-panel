import { buildGenericWhatsappLink } from "@/lib/whatsapp";
import { CheckIcon, WhatsappIcon } from "./icons";
import { Reveal } from "./Reveal";

const benefits = [
  "Publicación sin costo, sin comisión de entrada",
  "Sin exclusividad: seguís alquilando por tu cuenta también",
  "Fotos y verificación ATS incluidas",
  "Consultas directas por WhatsApp, vos decidís a quién alquilar",
];

export function OwnersSection() {
  return (
    <section
      id="propietarios"
      className="border-y border-sb-border-subtle bg-noise py-20 sm:py-28"
      style={{
        backgroundImage:
          "linear-gradient(160deg, rgba(157,101,64,0.14) 0%, rgba(157,101,64,0) 55%)",
      }}
    >
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 px-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center lg:gap-16">
        <Reveal>
          <span className="mb-3 block text-xs font-semibold uppercase tracking-[0.18em] text-sb-accent">
            Para propietarios
          </span>
          <h2 className="text-balance font-serif text-3xl font-medium leading-tight text-sb-cream sm:text-4xl">
            Sumá tu casa gratis, sin exclusividad
          </h2>
          <p className="mt-4 max-w-md text-lg text-sb-cream-muted">
            Publicamos tu propiedad en nuestro catálogo y la promocionamos en Instagram y TikTok.
            Vos seguís decidiendo con quién más trabajar.
          </p>

          <ul className="mt-8 flex flex-col gap-3">
            {benefits.map((benefit) => (
              <li key={benefit} className="flex items-start gap-3 text-sm text-sb-cream">
                <CheckIcon className="mt-0.5 h-5 w-5 shrink-0 text-sb-accent" />
                {benefit}
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal
          delayMs={120}
          className="rounded-2xl border border-sb-border-accent bg-sb-bg-elevated p-8 text-center shadow-[0_0_0_1px_rgba(157,101,64,0.15),0_20px_45px_rgba(0,0,0,0.35)] sm:p-10"
        >
          <span className="mb-3 block text-xs font-semibold uppercase tracking-[0.18em] text-sb-accent">
            Es gratis
          </span>
          <p className="mb-6 text-sm text-sb-cream-muted">
            Contanos sobre tu propiedad y coordinamos una visita para sumarla al catálogo.
          </p>
          <a
            href={buildGenericWhatsappLink(
              "Hola, tengo una casa en San Bernardino y quiero sumarla al catálogo de ATS."
            )}
            target="_blank"
            rel="noopener"
            className="btn-press inline-flex items-center justify-center gap-2 rounded-md bg-sb-accent px-6 py-3 text-sm font-semibold text-sb-bg transition-colors hover:bg-sb-accent-hover"
          >
            <WhatsappIcon className="h-[18px] w-[18px]" />
            Sumar mi propiedad
          </a>
        </Reveal>
      </div>
    </section>
  );
}
