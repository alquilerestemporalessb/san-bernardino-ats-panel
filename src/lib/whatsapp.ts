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
