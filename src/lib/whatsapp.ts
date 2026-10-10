import type { Property } from "@/types/database";

// EDITAR ACA: numero real de WhatsApp del negocio (codigo pais + numero, sin +, sin espacios).
// Unico lugar donde vive este valor — todo el sitio lo consume desde aca.
export const WHATSAPP_NUMBER = "595982348289";

export function buildWhatsappLink(property: Pick<Property, "code" | "name" | "whatsapp_message">) {
  const message =
    property.whatsapp_message?.trim() ||
    `Hola, me interesa la propiedad ${property.code} (${property.name}), ¿sigue disponible?`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function buildGenericWhatsappLink(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

/**
 * Link de WhatsApp para el widget de reserva de la ficha: si el visitante eligio fechas en el
 * calendario, el mensaje las incluye (formateadas es-PY) para que el equipo ya arranque la
 * conversacion sabiendo que consulta. Sin fechas, cae al mensaje generico de siempre.
 */
export function buildBookingWhatsappLink(
  property: Pick<Property, "code" | "name" | "whatsapp_message">,
  dateRangeLabel?: string
) {
  if (!dateRangeLabel) return buildWhatsappLink(property);
  const message = `Hola, quiero consultar disponibilidad de ${property.name} (${property.code}) del ${dateRangeLabel}, ¿sigue disponible?`;
  return buildGenericWhatsappLink(message);
}

/**
 * Link de WhatsApp para una cotizacion exacta/calculada del calendario de tarifas: incluye
 * fechas, noches y el total ya calculado por quoteStay() para que el equipo arranque la
 * conversacion con el mismo numero que ve el huesped.
 */
export function buildQuoteWhatsappLink(
  property: Pick<Property, "code" | "name">,
  params: { dateRangeLabel: string; nights: number; totalLabel: string }
) {
  const { dateRangeLabel, nights, totalLabel } = params;
  const message = `Hola, quiero consultar disponibilidad de ${property.name} (${property.code}) del ${dateRangeLabel} (${nights} noche${nights === 1 ? "" : "s"}). Total: ${totalLabel}. ¿Confirmamos?`;
  return buildGenericWhatsappLink(message);
}

/** Link de WhatsApp para fechas que no encajan en ninguna tarifa cargada: cotizacion a medida. */
export function buildCustomQuoteWhatsappLink(
  property: Pick<Property, "code" | "name">,
  params: { dateRangeLabel: string; nights: number }
) {
  const { dateRangeLabel, nights } = params;
  const message = `Hola, quiero una cotización a medida para ${property.name} (${property.code}) del ${dateRangeLabel} (${nights} noche${nights === 1 ? "" : "s"}), ¿me ayudan?`;
  return buildGenericWhatsappLink(message);
}
