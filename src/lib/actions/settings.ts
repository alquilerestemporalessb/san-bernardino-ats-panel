"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { USD_RATE_SETTING_KEY } from "@/lib/exchange-rate";

export interface SettingsFormState {
  error?: string;
  ok?: boolean;
}

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");
  return supabase;
}

export async function updateUsdRate(
  _prevState: SettingsFormState,
  formData: FormData
): Promise<SettingsFormState> {
  const supabase = await requireUser();

  const rate = Number(String(formData.get("usd_to_pyg_rate") ?? "").trim().replace(/\./g, ""));
  if (!Number.isFinite(rate) || rate <= 0) {
    return { error: "La cotización tiene que ser un número mayor a 0 (en guaraníes por 1 USD)." };
  }

  const { error } = await supabase.from("app_settings").upsert({
    key: USD_RATE_SETTING_KEY,
    value: String(Math.round(rate)),
    updated_at: new Date().toISOString(),
  });
  if (error) return { error: error.message };

  // La cotizacion afecta el filtro de precio del sitio publico y el resumen de reservas.
  revalidatePath("/");
  revalidatePath("/admin/configuracion");
  revalidatePath("/admin/reservas");
  return { ok: true };
}
