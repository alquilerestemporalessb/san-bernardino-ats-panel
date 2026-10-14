import { formatGs } from "@/lib/currency";
import { FEATURED_MONTH } from "@/lib/stay-rules";
import type { PropertyRate } from "@/types/database";

/**
 * Precio de portada para catalogo/comparar: el bloque mensual de referencia (FEATURED_MONTH),
 * nunca precios manuales ni del propietario. Si la propiedad no tiene ese bloque activo, no hay
 * precio para mostrar (la tarjeta cae a "Consultar precio").
 */
export function catalogPrice(rates: PropertyRate[]): string | null {
  const rate = rates.find(
    (r) =>
      r.active &&
      r.kind === "bloque" &&
      r.date_from === FEATURED_MONTH.dateFrom &&
      r.date_to === FEATURED_MONTH.dateTo
  );
  return rate ? `${formatGs(Number(rate.price_gs))} / mes` : null;
}
