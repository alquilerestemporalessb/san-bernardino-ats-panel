import Image from "next/image";
import { Reveal } from "./Reveal";
import { STOCK_IMAGES } from "@/lib/stock-images";

const testimonials = [
  {
    quote:
      "Alquilamos la Casa del Lago para el fin de año y todo fue tal cual la descripción. Coordinar por WhatsApp directo con los dueños fue lo mejor.",
    author: "Familia Duarte, Asunción",
  },
  {
    quote:
      "Buscábamos algo de confianza para 10 personas y el sello verificado nos dio tranquilidad antes de transferir la seña.",
    author: "Marcos R., Ciudad del Este",
  },
  {
    quote:
      "Como propietaria, me gustó que no piden exclusividad. Publiqué mi casa y en dos semanas ya tenía la primera reserva.",
    author: "Liz A., propietaria en San Ber",
  },
];

export function TrustSection() {
  return (
    <section id="confianza" className="bg-site-bg-sunken py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <Reveal>
          <div className="mb-14 max-w-xl">
            <span className="mb-3 block text-xs font-semibold uppercase tracking-[0.2em] text-site-terracotta">
              Confianza
            </span>
            <h2 className="text-balance font-display text-3xl font-semibold leading-tight text-site-ink sm:text-4xl">
              Nada se publica sin que lo veamos primero
            </h2>
            <p className="mt-4 text-lg text-site-ink-muted">
              Así trabajamos: cada casa la visitamos, sacamos fotos reales y confirmamos que el
              contrato con el propietario está en regla.
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
          <Reveal className="relative aspect-[4/3] overflow-hidden rounded-3xl shadow-[0_20px_45px_rgba(36,31,24,0.14)] lg:aspect-auto">
            <Image
              src={STOCK_IMAGES.trust}
              alt="Interior luminoso de una casa boutique en San Bernardino"
              fill
              sizes="(min-width: 1024px) 560px, 90vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-site-ink/85 via-site-ink/15 to-transparent" />
            <div className="absolute inset-x-6 bottom-6 flex items-start gap-4 rounded-2xl border border-white/25 bg-white/15 p-5 backdrop-blur-md">
              <Image
                src="/verified-badge.svg"
                alt="Propiedad Verificada ATS"
                width={52}
                height={52}
                className="h-[52px] w-[52px] shrink-0"
              />
              <div>
                <h3 className="font-display text-lg font-semibold text-white">
                  Propiedad Verificada ATS
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-white/90">
                  El sello indica que visitamos la propiedad en persona, verificamos fotos y
                  comodidades, y validamos al propietario.
                </p>
              </div>
            </div>
          </Reveal>

          {/* Lista editorial, sin cards: las citas viven directo sobre el fondo, separadas solo
              por aire generoso — nada de filetes ni bloques blancos flotando. */}
          <div className="flex flex-col gap-12">
            {testimonials.map((t, index) => (
              <Reveal key={t.author} delayMs={index * 100}>
                <figure className="relative pl-8">
                  <span
                    aria-hidden
                    className="pointer-events-none absolute -left-1 -top-3 font-display text-6xl leading-none text-site-terracotta/30"
                  >
                    &ldquo;
                  </span>
                  <blockquote className="text-base italic leading-relaxed text-site-ink">
                    {t.quote}
                  </blockquote>
                  <figcaption className="mt-3 text-xs font-medium uppercase tracking-wide text-site-terracotta">
                    {t.author}
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
