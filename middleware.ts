import { NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";

import { routing } from "./src/i18n/routing";

const intlMiddleware = createMiddleware(routing);

// Segmentos que no requieren sesión autenticada.
const PUBLIC_SEGMENTS = new Set([
  "login",
  "sign-up",
  "recover",
  "update-password",
]);
// Cookies aceptadas para considerar una sesión activa (dev + Supabase SSR).
const AUTH_COOKIES = ["elitrax_dev_user", "sb-access-token"];

/**
 * Detecta autenticación de forma tolerante a ambos proveedores.
 *
 * Se valida primero la cookie dev local y luego las cookies de Supabase.
 * Esto permite mantener el mismo middleware en entornos con y sin Supabase.
 */
function isAuthenticated(request: NextRequest): boolean {
  if (AUTH_COOKIES.some((name) => request.cookies.get(name))) return true;
  for (const cookie of request.cookies.getAll()) {
    if (cookie.name.startsWith("sb-") && cookie.name.endsWith("-auth-token")) {
      return true;
    }
  }
  return false;
}

/**
 * Enruta i18n y protege rutas privadas por locale.
 *
 * Flujo:
 * 1) Delega el comportamiento base a next-intl.
 * 2) Si la ruta no tiene locale soportado, deja que next-intl resuelva.
 * 3) Si el segundo segmento es público, permite acceso.
 * 4) Si es privada y no hay sesión, redirige a /{locale}/login preservando redirectTo.
 */
export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const intlResponse = intlMiddleware(request);

  const segments = pathname.split("/").filter(Boolean);
  const locale = segments[0];
  if (
    !locale ||
    !routing.locales.includes(locale as (typeof routing.locales)[number])
  ) {
    return intlResponse;
  }

  const second = segments[1];
  const isPublic = second !== undefined && PUBLIC_SEGMENTS.has(second);
  if (isPublic) return intlResponse;

  if (isAuthenticated(request)) return intlResponse;

  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = `/${locale}/login`;
  loginUrl.search = `?redirectTo=${encodeURIComponent(pathname)}`;
  return NextResponse.redirect(loginUrl);
}

// El matcher mantiene el middleware acotado al root y rutas localizadas.
export const config = {
  matcher: ["/", "/(en|es)/:path*"],
};