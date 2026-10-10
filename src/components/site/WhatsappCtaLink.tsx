"use client";

export function WhatsappCtaLink({
  propertyId,
  href,
  className,
  children,
  modality,
  totalGs,
}: {
  propertyId: string;
  href: string;
  className?: string;
  children: React.ReactNode;
  /** Modalidad de la cotizacion que disparo este clic (calendario de tarifas). Opcional: los
   * llamados sin cotizacion por bloques (widget viejo) no lo mandan. */
  modality?: "bloque" | "fin_de_semana" | "noche" | "custom";
  totalGs?: number;
}) {
  function handleClick() {
    // Fire-and-forget: no bloquea ni pausa la navegacion a WhatsApp (target="_blank",
    // la pestaña actual sigue viva igual).
    fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        property_id: propertyId,
        event_type: "whatsapp_click",
        ...(modality ? { modality } : {}),
        ...(totalGs ? { total_gs: totalGs } : {}),
      }),
      keepalive: true,
    }).catch(() => {});
  }

  return (
    <a href={href} target="_blank" rel="noopener" className={className} onClick={handleClick}>
      {children}
    </a>
  );
}
