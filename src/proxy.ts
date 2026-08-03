/**
 * Proxy de autenticacion del panel ATS (antes "middleware" — renombrado en Next.js 16,
 * misma funcion).
 *
 * Version simplificada del patron de GES: aca hay un solo tipo de usuario
 * (equipo interno ATS), asi que "autenticado" alcanza como chequeo de acceso.
 * No hay tabla de roles ni rutas separadas por rol.
 *
 * Solo corre sobre /admin/* (matcher abajo) — la landing publica en "/" no pasa
 * por auth, no la necesita.
 *
 * 1. Refresca el token de sesion en cada request (patron oficial Supabase SSR).
 * 2. Sin sesion + ruta de /admin protegida -> redirige a /admin/login.
 * 3. Con sesion + /admin/login -> redirige a /admin.
 *
 * IMPORTANTE: se usa getUser() — NO getSession() — porque getUser() valida
 * el token contra el servidor de Supabase, mientras que getSession() confia
 * solo en la cookie local (potencialmente manipulable).
 */
import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { Database } from "@/types/database";

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isLoginPage = pathname === "/admin/login";

  const redirectWith = (url: string) => {
    const res = NextResponse.redirect(new URL(url, request.url));
    supabaseResponse.cookies.getAll().forEach((c) => res.cookies.set(c.name, c.value));
    return res;
  };

  if (!user && !isLoginPage) {
    return redirectWith("/admin/login");
  }

  if (user && isLoginPage) {
    return redirectWith("/admin");
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/admin/:path*"],
};
