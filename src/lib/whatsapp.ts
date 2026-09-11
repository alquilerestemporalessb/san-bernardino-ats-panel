import type { Property } from "@/types/database";

// EDITAR ACA: numero real de WhatsApp del negocio (codigo pais + numero, sin +, sin espacios).
// Unico lugar donde vive este valor — todo el sitio lo consume desde aca.
export const WHATSAPP_NUMBER = "595981000000";

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
