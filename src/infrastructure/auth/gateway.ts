import "server-only";

import { cookies } from "next/headers";

import { isSupabaseConfigured } from "@/lib/config/environment";
import { createSupabaseServerClient } from "@/infrastructure/supabase/client/server";
import type {
  AuthGateway,
  CurrentUser,
} from "@/application/ports/providers";
import { AuthorizationError, ValidationError } from "@/lib/errors";

const DEV_USER_COOKIE = "elitrax_dev_user";
const DEV_EMAIL_COOKIE = "elitrax_dev_email";
const DEV_FULL_NAME_COOKIE = "elitrax_dev_full_name";

/**
 * Adaptador de autenticación para modo desarrollo/in-memory.
 *
 * No valida credenciales reales: simula una sesión estable para habilitar
 * flujos funcionales de onboarding y app shell sin proveedor externo.
 */
class DevAuthGateway implements AuthGateway {
  async getCurrentUser(): Promise<CurrentUser | null> {
    const store = await cookies();
    const userId = store.get(DEV_USER_COOKIE)?.value;
    if (!userId) return null;
    const email = store.get(DEV_EMAIL_COOKIE)?.value;
    const fullName = store.get(DEV_FULL_NAME_COOKIE)?.value;
    return {
      userId,
      ...(email ? { email } : {}),
      ...(fullName ? { fullName } : {}),
    };
  }

  async signInWithPassword(input: { email: string; password: string }): Promise<void> {
    if (input.password.length < 8) {
      throw new ValidationError("password too short");
    }

    // En modo dev la “sesión” se materializa sólo con cookies estables para poder
    // recorrer onboarding, tenant switching y app shell sin backend externo.
    const store = await cookies();
    const existingId = store.get(DEV_USER_COOKIE)?.value;
    const userId = existingId ?? crypto.randomUUID();
    store.set(DEV_USER_COOKIE, userId, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });
    store.set(DEV_EMAIL_COOKIE, input.email, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });
  }

  async signUpWithPassword(input: {
    email: string;
    password: string;
    fullName?: string;
  }): Promise<{ requiresEmailConfirmation: boolean }> {
    await this.signInWithPassword({ email: input.email, password: input.password });
    if (input.fullName?.trim()) {
      const store = await cookies();
      store.set(DEV_FULL_NAME_COOKIE, input.fullName.trim(), {
        httpOnly: true,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30,
        path: "/",
      });
    }
    return { requiresEmailConfirmation: false };
  }

  async signOut(): Promise<void> {
    const store = await cookies();
    store.delete(DEV_USER_COOKIE);
    store.delete(DEV_EMAIL_COOKIE);
    store.delete(DEV_FULL_NAME_COOKIE);
    store.delete("elitrax_active_account");
  }

  async requestPasswordReset(): Promise<void> {
    // dev-mode no-op; real provider sends an email link.
  }

  async updatePassword(input: { password: string }): Promise<void> {
    if (input.password.length < 8) {
      throw new ValidationError("password too short");
    }
  }
}

/**
 * Adaptador real de autenticación basado en Supabase Auth.
 *
 * Traduce errores del SDK a errores de aplicación para mantener un contrato
 * uniforme en la capa de use cases y route handlers.
 */
class SupabaseAuthGateway implements AuthGateway {
  async getCurrentUser(): Promise<CurrentUser | null> {
    const client = await createSupabaseServerClient();
    const { data } = await client.auth.getUser();
    if (!data.user) return null;
    const fullName =
      typeof data.user.user_metadata?.full_name === "string"
        ? data.user.user_metadata.full_name.trim() || undefined
        : undefined;
    return {
      userId: data.user.id,
      email: data.user.email ?? undefined,
      fullName,
    };
  }

  async signInWithPassword(input: { email: string; password: string }): Promise<void> {
    const client = await createSupabaseServerClient();
    // El gateway encapsula el SDK para que el resto del sistema no dependa del shape de Supabase.
    const { error } = await client.auth.signInWithPassword(input);
    if (error) throw new AuthorizationError(error.message);
  }

  async signUpWithPassword(input: {
    email: string;
    password: string;
    fullName?: string;
  }): Promise<{ requiresEmailConfirmation: boolean }> {
    const client = await createSupabaseServerClient();
    const { data, error } = await client.auth.signUp({
      email: input.email,
      password: input.password,
      options: input.fullName
        ? { data: { full_name: input.fullName } }
        : undefined,
    });
    if (error) throw new ValidationError(error.message);
    const requiresEmailConfirmation = !data.session;
    return { requiresEmailConfirmation };
  }

  async signOut(): Promise<void> {
    const client = await createSupabaseServerClient();
    await client.auth.signOut();
  }

  async requestPasswordReset(input: {
    email: string;
    redirectTo?: string;
  }): Promise<void> {
    const client = await createSupabaseServerClient();
    const { error } = await client.auth.resetPasswordForEmail(input.email, {
      redirectTo: input.redirectTo,
    });
    if (error) throw new ValidationError(error.message);
  }

  async updatePassword(input: { password: string }): Promise<void> {
    const client = await createSupabaseServerClient();
    const { error } = await client.auth.updateUser({ password: input.password });
    if (error) throw new ValidationError(error.message);
  }
}

let cached: AuthGateway | null = null;

/**
 * Resuelve el gateway activo según configuración de entorno.
 *
 * Se cachea por proceso para evitar reinstanciar clientes y mantener
 * comportamiento consistente durante el ciclo de vida del servidor.
 */
export function getAuthGateway(): AuthGateway {
  if (cached) return cached;

  // La elección del proveedor se hace una vez por proceso y se reutiliza en toda la request graph.
  cached = isSupabaseConfigured()
    ? new SupabaseAuthGateway()
    : new DevAuthGateway();
  return cached;
}

/**
 * Hook de test para inyectar dobles y resetear caché de gateway.
 */
export function setAuthGatewayForTesting(gateway: AuthGateway | null): void {
  cached = gateway;
}
