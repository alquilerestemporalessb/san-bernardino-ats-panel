import { formatGs } from "@/lib/currency";
import type { Property } from "@/types/database";

type PriceFields = Pick<
  Property,
  "price_per_night" | "price_per_week" | "price_per_month" | "min_nights"
>;

/** Una linea por cada precio cargado (noche/semana/mes) — una propiedad puede ofrecer cualquier combinacion. */
export function priceLines(property: PriceFields): string[] {
  const lines: string[] = [];
  if (property.price_per_night) {
    const minNightsNote = property.min_nights > 1 ? ` (mínimo ${property.min_nights} noches)` : "";
    lines.push(`${formatGs(property.price_per_night)} / noche${minNightsNote}`);
  }
  if (property.price_per_week) {
    lines.push(`${formatGs(property.price_per_week)} / semana`);
  }
  if (property.price_per_month) {
    lines.push(`${formatGs(property.price_per_month)} / mes`);
  }
  return lines;
}
