import Image from "next/image";
import { Reveal } from "./Reveal";

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
    <section id="confianza" className="bg-sb-bg-sunken py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal>
          <div className="mb-14 max-w-xl">
            <span className="mb-3 block text-xs font-semibold uppercase tracking-[0.18em] text-sb-accent">
              Confianza
            </span>
            <h2 className="text-balance font-serif text-3xl font-medium leading-tight text-sb-cream sm:text-4xl">
              Nada se publica sin que lo veamos primero
            </h2>
            <p className="mt-4 text-lg text-sb-cream-muted">
              Así trabajamos: cada casa la visitamos, sacamos fotos reales y confirmamos que el
              contrato con el propietario está en regla.
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-10">
          <Reveal className="flex items-start gap-5 rounded-2xl border border-sb-border-subtle bg-sb-bg-elevated p-8">
            <Image
              src="/verified-badge.svg"
              alt="Propiedad Verificada ATS"
              width={64}
              height={64}
              className="h-16 w-16 shrink-0"
            />
            <div>
              <h3 className="font-serif text-lg font-medium text-sb-cream">
                Propiedad Verificada ATS
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-sb-cream-muted">
                El sello indica que el equipo de San Bernardino ATS visitó la propiedad en persona,
                verificó las fotos y las comodidades, y validó al propietario. Si una casa no tiene
                el sello, está en proceso de verificación.
              </p>
            </div>
          </Reveal>

          <div className="flex flex-col gap-4">
            {testimonials.map((t, index) => (
              <Reveal key={t.author} delayMs={index * 100}>
                <figure className="relative rounded-2xl border border-sb-border-subtle bg-sb-bg-elevated p-6">
                  <span
                    aria-hidden
                    className="pointer-events-none absolute -top-2 left-5 font-serif text-5xl text-sb-accent/25"
                  >
                    &ldquo;
                  </span>
                  <blockquote className="relative text-sm italic leading-relaxed text-sb-cream">
                    {t.quote}
                  </blockquote>
                  <figcaption className="mt-3 text-xs tracking-wide text-sb-accent">
                    — {t.author}
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
