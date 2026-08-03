/**
 * Cliente de Supabase sin cookies — para escrituras publicas anonimas que no necesitan
 * sesion (ej. registrar un evento de tracking dentro de after(), donde cookies() no esta
 * disponible: https://nextjs.org/docs/app/api-reference/functions/after).
 *
 * No usar para nada que dependa del usuario autenticado — para eso, lib/supabase/server.ts.
 */
import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export function createAnonClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error("Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }
  return createSupabaseClient<Database>(url, anonKey);
}
