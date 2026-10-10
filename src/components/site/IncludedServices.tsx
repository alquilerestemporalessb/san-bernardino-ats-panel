import { CheckIcon } from "./icons";

/** Solo se renderiza si la propiedad tiene included_services cargado — nunca un bloque vacio. */
export function IncludedServices({ services }: { services: string[] | null }) {
  if (!services || services.length === 0) return null;

  return (
    <div className="max-w-prose">
      <h2 className="font-display text-xl text-site-ink">Incluye</h2>
      <ul className="mt-4 flex flex-col gap-2.5">
        {services.map((service) => (
          <li key={service} className="flex items-start gap-2.5 text-sm leading-relaxed text-site-ink-muted">
            <CheckIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-site-terracotta" />
            {service}
          </li>
        ))}
      </ul>
    </div>
  );
}
