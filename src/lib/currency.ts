import type { Currency } from "@/types/database";

// Precios y montos son siempre redondos (no se cargan centavos ni guaranies sueltos),
// asi que ambas monedas van sin decimales. es-PY para que el separador de miles sea el
// punto en las dos.
const formatters: Record<Currency, Intl.NumberFormat> = {
  PYG: new Intl.NumberFormat("es-PY", {
    style: "currency",
    currency: "PYG",
    maximumFractionDigits: 0,
  }),
  USD: new Intl.NumberFormat("es-PY", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }),
};

export function formatMoney(amount: number, currency: Currency): string {
  return formatters[currency].format(amount);
}

/** Atajo para el caso guaranies, el mas comun. */
export function formatGs(amount: number): string {
  return formatMoney(amount, "PYG");
}
