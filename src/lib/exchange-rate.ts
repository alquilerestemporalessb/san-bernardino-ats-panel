import type { SupabaseClient } from "@supabase/supabase-js";
import type { Currency, Database } from "@/types/database";

/** Fallback si todavia no se cargo la cotizacion en app_settings (o quedo invalida). */
export const DEFAULT_USD_TO_PYG_RATE = 7500;

export const USD_RATE_SETTING_KEY = "usd_to_pyg_rate";

type Client = SupabaseClient<Database>;

/**
 * Cotizacion del dolar en guaranies, editable desde /admin/configuracion.
 * Nunca tira: si falta la fila o el valor no es un numero > 0, usa el fallback.
 */
export async function getUsdToPygRate(supabase: Client): Promise<number> {
  const { data } = await supabase
    .from("app_settings")
    .select("value")
    .eq("key", USD_RATE_SETTING_KEY)
    .maybeSingle();

  const parsed = Number(data?.value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_USD_TO_PYG_RATE;
}

/** Convierte `amount` de `from` a `to` usando `rate` (Gs por 1 USD). */
export function convert(amount: number, from: Currency, to: Currency, rate: number): number {
  if (from === to) return amount;
  return from === "USD" ? amount * rate : amount / rate;
}
