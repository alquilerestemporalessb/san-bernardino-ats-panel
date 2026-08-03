/**
 * Cliente de Supabase para el browser (componentes cliente).
 *
 * Usa SOLO variables NEXT_PUBLIC_* — nunca toca la service role key.
 * RLS en la base de datos es la barrera de seguridad real; este cliente
 * opera bajo las credenciales del usuario autenticado (anon key + JWT).
 */
import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error("Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }
  return createBrowserClient<Database>(url, anonKey);
}
