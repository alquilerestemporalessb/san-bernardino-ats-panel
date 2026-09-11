import { buildGenericWhatsappLink } from "@/lib/whatsapp";
import { WhatsappIcon } from "./icons";

/**
 * CTA de WhatsApp fijo, siempre a mano mientras se scrollea (aparte del boton del Nav y el del
 * Hero) — en Paraguay el cierre es por WhatsApp, tiene que ser imposible de perder de vista.
 * bottom-24 (no bottom-6) a proposito: deja lugar para que no choque con la CompareBar cuando
 * hay propiedades marcadas para comparar (esa barra tambien es fixed-bottom).
 */
export function StickyWhatsappFab() {
  return (
    <a
      href={buildGenericWhatsappLink("Hola, quiero consultar por una casa en San Bernardino.")}
      target="_blank"
      rel="noopener"
      aria-label="Consultar por WhatsApp"
      className="btn-press animate-pulse-glow fixed bottom-24 right-5 z-40 inline-flex h-14 w-14 items-center justify-center rounded-full bg-site-whatsapp text-white shadow-[0_14px_30px_rgba(37,211,102,0.45)] transition-colors hover:bg-site-whatsapp-hover"
    >
      <WhatsappIcon className="h-6 w-6" />
    </a>
  );
}
