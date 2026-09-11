import Image from "next/image";
import { CheckIcon, ClockIcon, ShieldCheckIcon } from "./icons";

const rules = [
  "Horarios de check-in y check-out se coordinan directo con el equipo al confirmar la reserva.",
  "El monto y la forma de pago (seña + saldo) se acuerdan por WhatsApp antes de viajar.",
  "Cada casa tiene sus propias reglas de uso (mascotas, eventos) — se confirman antes de reservar.",
];

/**
 * Reduce la incertidumbre antes de escribir: reexplica el sello de verificacion en el contexto de
 * ESTA ficha, y deja en claro que horarios/reglas puntuales de la casa se confirman por WhatsApp
 * (no se inventan datos que no estan cargados por el equipo).
 */
export function TrustRulesSection() {
  return (
    <div className="grid grid-cols-1 gap-8 rounded-3xl bg-site-bg-elevated p-6 shadow-[0_30px_70px_rgba(36,31,24,0.05)] sm:grid-cols-2 sm:gap-6 sm:p-8">
      <div className="flex items-start gap-4">
        <Image
          src="/verified-badge.svg"
          alt="Propiedad Verificada ATS"
          width={44}
          height={44}
          className="h-11 w-11 shrink-0"
        />
        <div>
          <h3 className="font-display text-base font-semibold text-site-ink">
            Propiedad Verificada ATS
          </h3>
          <p className="mt-1.5 text-sm leading-relaxed text-site-ink-muted">
            El equipo visitó esta casa en persona, verificó las fotos y las comodidades, y validó
            al propietario antes de publicarla.
          </p>
        </div>
      </div>

      <div className="flex items-start gap-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-site-olive-muted text-site-olive">
          <ClockIcon className="h-5 w-5" />
        </span>
        <div>
          <h3 className="font-display text-base font-semibold text-site-ink">
            Check-in y reglas de la casa
          </h3>
          <ul className="mt-1.5 flex flex-col gap-1.5">
            {rules.map((rule) => (
              <li key={rule} className="flex items-start gap-2 text-sm leading-relaxed text-site-ink-muted">
                <CheckIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-site-olive" />
                {rule}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex items-start gap-4 sm:col-span-2">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-site-terracotta-muted text-site-terracotta">
          <ShieldCheckIcon className="h-5 w-5" />
        </span>
        <div>
          <h3 className="font-display text-base font-semibold text-site-ink">Sin costo de reserva</h3>
          <p className="mt-1.5 text-sm leading-relaxed text-site-ink-muted">
            Consultar disponibilidad y coordinar por WhatsApp no tiene costo. La comisión de ATS
            la paga el propietario, no el huésped.
          </p>
        </div>
      </div>
    </div>
  );
}
