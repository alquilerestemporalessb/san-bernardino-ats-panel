import { formatMoney } from "@/lib/currency";
import type { Property } from "@/types/database";

type PriceFields = Pick<
  Property,
  | "price_per_night"
  | "price_per_week"
  | "price_per_month"
  | "price_per_night_currency"
  | "price_per_week_currency"
  | "price_per_month_currency"
  | "min_nights"
>;

/**
 * Una linea por cada precio cargado (noche/semana/mes) — una propiedad puede ofrecer cualquier
 * combinacion, y cada precio lleva su propia moneda (Gs o USD).
 */
export function priceLines(property: PriceFields): string[] {
  const lines: string[] = [];
  if (property.price_per_night) {
    const minNightsNote = property.min_nights > 1 ? ` (mínimo ${property.min_nights} noches)` : "";
    lines.push(
      `${formatMoney(property.price_per_night, property.price_per_night_currency)} / noche${minNightsNote}`
    );
  }
  if (property.price_per_week) {
    lines.push(`${formatMoney(property.price_per_week, property.price_per_week_currency)} / semana`);
  }
  if (property.price_per_month) {
    lines.push(
      `${formatMoney(property.price_per_month, property.price_per_month_currency)} / mes`
    );
  }
  return lines;
}
