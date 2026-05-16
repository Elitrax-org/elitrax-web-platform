import { cookies } from "next/headers";

import { getServices } from "@/infrastructure/service-container";
import { getAuthGateway } from "@/infrastructure/auth/gateway";
import type { TenantContext } from "@/application/context";

const ACCOUNT_COOKIE = "elitrax_active_account";

/**
 * Obtiene el identificador del usuario autenticado actual.
 *
 * Abstrae el proveedor de autenticación para que el resto de la capa API
 * no dependa de detalles de Supabase ni del modo dev.
 */
export async function getCurrentUserId(): Promise<string | null> {
  const user = await getAuthGateway().getCurrentUser();
  return user?.userId ?? null;
}

/**
 * Lee la cuenta activa seleccionada por el usuario desde cookie httpOnly.
 */
export async function getActiveAccountId(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(ACCOUNT_COOKIE)?.value ?? null;
}

/**
 * Persiste la cuenta activa para próximas requests.
 *
 * Es best-effort porque en algunos contextos de renderizado de Server
 * Components Next.js no permite escribir cookies.
 */
export async function setActiveAccountId(accountId: string): Promise<void> {
  const cookieStore = await cookies();
  try {
    cookieStore.set(ACCOUNT_COOKIE, accountId, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
    });
  } catch {
    // `cookies().set()` throws when invoked from a Server Component render
    // (e.g. the app layout bootstrapping the demo tenant). The write is
    // best-effort here: a subsequent Server Action / Route Handler will
    // persist the active account on the next interaction.
  }
}

/**
 * Resolves the active tenant context for the current request. Returns null
 * when the user is not authenticated, has no memberships, or the active
 * account cookie does not match any of their memberships.
 *
 * Callers that need to distinguish those cases (e.g. to redirect to login
 * vs onboarding) should use {@link getUserOnboardingState} instead.
 */
export async function resolveTenantContext(): Promise<TenantContext | null> {
  // La resolución del tenant ocurre en el borde HTTP y produce el contexto
  // canónico que luego consumen todos los use-cases de aplicación.
  const userId = await getCurrentUserId();
  if (!userId) return null;

  const services = getServices();
  const memberships = await services.deps.accounts.listMemberships(userId);
  if (memberships.length === 0) return null;

  // Si no hay cookie válida, se toma la primera membresía disponible como cuenta activa.
  const requestedAccountId = await getActiveAccountId();
  const membership =
    memberships.find((m) => m.accountId === requestedAccountId) ??
    memberships[0];

  if (!membership) return null;

  const account = await services.deps.accounts.getAccount(membership.accountId);
  if (!account) return null;

  // Se corrige la cookie en segundo plano cuando el usuario cambió de cuenta
  // o la cookie apunta a una membresía que ya no existe.
  if (membership.accountId !== requestedAccountId) {
    await setActiveAccountId(membership.accountId);
  }

  return {
    actor: { userId },
    accountId: account.id,
    accountType: account.type,
    role: membership.role,
  };
}

export type OnboardingState =
  | { readonly status: "unauthenticated" }
  | { readonly status: "needs_onboarding"; readonly userId: string }
  | { readonly status: "ready"; readonly tenant: TenantContext };

/**
 * Returns whether the current user is authenticated, needs to complete
 * onboarding (logged in but no account), or has a usable tenant context.
 * Used by route layouts to choose between /login, /onboarding and the app.
 */
export async function getUserOnboardingState(): Promise<OnboardingState> {
  const userId = await getCurrentUserId();
  if (!userId) return { status: "unauthenticated" };

  const services = getServices();
  // Este chequeo separa “usuario logueado sin cuenta” del caso “sesión completa”.
  const memberships = await services.deps.accounts.listMemberships(userId);
  if (memberships.length === 0) {
    return { status: "needs_onboarding", userId };
  }

  const tenant = await resolveTenantContext();
  if (!tenant) return { status: "needs_onboarding", userId };
  return { status: "ready", tenant };
}
