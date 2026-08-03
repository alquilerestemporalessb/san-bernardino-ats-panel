/**
 * Cliente de Supabase para el servidor (Server Components, Route Handlers,
 * Server Actions).
 *
 * Usa la anon key igual que el cliente browser — RLS protege los datos.
 * Las cookies de Next.js propagan la sesion del usuario autenticado.
 *
 * IMPORTANTE: este archivo usa `next/headers` y solo puede ejecutarse
 * en contexto de servidor (no importar desde codigo de cliente).
 */
import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";

export async function createClient() {
  const cookieStore = await cookies();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error("Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // En un Server Component (solo lectura) no se pueden escribir cookies.
          // El middleware se encarga de refrescar la sesion en esos casos.
        }
      },
    },
  });
}
