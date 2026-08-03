"use client";

export function WhatsappCtaLink({
  propertyId,
  href,
  className,
  children,
}: {
  propertyId: string;
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  function handleClick() {
    // Fire-and-forget: no bloquea ni pausa la navegacion a WhatsApp (target="_blank",
    // la pestaña actual sigue viva igual).
    fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ property_id: propertyId, event_type: "whatsapp_click" }),
      keepalive: true,
    }).catch(() => {});
  }

  return (
    <a href={href} target="_blank" rel="noopener" className={className} onClick={handleClick}>
      {children}
    </a>
  );
}
