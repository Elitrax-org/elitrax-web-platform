import { z } from "zod";

/**
 * Configuración tipada de entorno para app y servidor.
 *
 * Este módulo valida variables al cargar y ofrece helpers de decisión
 * (persistencia, proveedores externos, rate limit y cache) usados en toda
 * la composición de infraestructura.
 */

// Treat empty strings the same as undefined so callers can opt out of
// optional env vars by setting them to "" (handy in CI / Playwright).
function emptyToUndefined(value: unknown): unknown {
  return typeof value === "string" && value.length === 0 ? undefined : value;
}

const publicEnvironmentSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.preprocess(emptyToUndefined, z.string().url().optional()),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.preprocess(
    emptyToUndefined,
    z.string().optional(),
  ),
  NEXT_PUBLIC_APP_URL: z.preprocess(emptyToUndefined, z.string().url().optional()),
  NEXT_PUBLIC_POSTHOG_KEY: z.preprocess(emptyToUndefined, z.string().optional()),
  NEXT_PUBLIC_POSTHOG_HOST: z.preprocess(
    emptyToUndefined,
    z.string().url().optional(),
  ),
});

export const publicEnvironment = publicEnvironmentSchema.parse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
  NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST,
});

const serverEnvironmentSchema = z.object({
  ELITRAX_PERSISTENCE: z.preprocess(
    emptyToUndefined,
    z.enum(["in-memory", "supabase"]).optional(),
  ),
  ELITRAX_CACHE_PROVIDER: z.preprocess(
    emptyToUndefined,
    z.enum(["memory", "redis", "valkey"]).optional(),
  ),
  REDIS_URL: z.preprocess(emptyToUndefined, z.string().optional()),
  VALKEY_URL: z.preprocess(emptyToUndefined, z.string().optional()),
  UPSTASH_REDIS_REST_URL: z.preprocess(emptyToUndefined, z.string().url().optional()),
  UPSTASH_REDIS_REST_TOKEN: z.preprocess(emptyToUndefined, z.string().optional()),
  ELITRAX_DISABLE_RATE_LIMIT: z.preprocess(emptyToUndefined, z.string().optional()),
  SUPABASE_PROJECT_REF: z.preprocess(emptyToUndefined, z.string().optional()),
  SUPABASE_SERVICE_ROLE_KEY: z.preprocess(emptyToUndefined, z.string().optional()),
  DATABASE_URL: z.preprocess(emptyToUndefined, z.string().optional()),
  STRIPE_SECRET_KEY: z.preprocess(emptyToUndefined, z.string().optional()),
  STRIPE_WEBHOOK_SECRET: z.preprocess(emptyToUndefined, z.string().optional()),
  AI_PROVIDER: z.preprocess(
    emptyToUndefined,
    z.enum(["openai", "anthropic", "stub"]).optional(),
  ),
  AI_API_KEY: z.preprocess(emptyToUndefined, z.string().optional()),
  AI_MODEL: z.preprocess(emptyToUndefined, z.string().optional()),
  SENTRY_DSN: z.preprocess(emptyToUndefined, z.string().optional()),
});

export const serverEnvironment = serverEnvironmentSchema.parse({
  ELITRAX_PERSISTENCE: process.env.ELITRAX_PERSISTENCE,
  ELITRAX_CACHE_PROVIDER: process.env.ELITRAX_CACHE_PROVIDER,
  REDIS_URL: process.env.REDIS_URL,
  VALKEY_URL: process.env.VALKEY_URL,
  UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
  UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
  ELITRAX_DISABLE_RATE_LIMIT: process.env.ELITRAX_DISABLE_RATE_LIMIT,
  SUPABASE_PROJECT_REF: process.env.SUPABASE_PROJECT_REF,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  DATABASE_URL: process.env.DATABASE_URL,
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
  AI_PROVIDER: process.env.AI_PROVIDER,
  AI_API_KEY: process.env.AI_API_KEY,
  AI_MODEL: process.env.AI_MODEL,
  SENTRY_DSN: process.env.SENTRY_DSN,
});

/**
 * Determina si la persistencia principal debe usar Supabase.
 *
 * Prioridad:
 * 1) ELITRAX_PERSISTENCE forzado
 * 2) detección automática por claves públicas de Supabase
 */
export function isSupabaseConfigured(): boolean {
  if (serverEnvironment.ELITRAX_PERSISTENCE === "in-memory") {
    return false;
  }
  if (serverEnvironment.ELITRAX_PERSISTENCE === "supabase") {
    return true;
  }
  return Boolean(
    publicEnvironment.NEXT_PUBLIC_SUPABASE_URL &&
      publicEnvironment.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
}

/**
 * Stripe solo se considera activo cuando hay clave secreta y webhook secret.
 */
export function isStripeConfigured(): boolean {
  return Boolean(
    serverEnvironment.STRIPE_SECRET_KEY &&
      serverEnvironment.STRIPE_WEBHOOK_SECRET,
  );
}

/**
 * Marca AI como configurable solo si existe proveedor + credenciales + modelo.
 */
export function isAiConfigured(): boolean {
  return Boolean(
    serverEnvironment.AI_PROVIDER &&
      serverEnvironment.AI_API_KEY &&
      serverEnvironment.AI_MODEL,
  );
}

/**
 * PostHog cliente se habilita con su public key.
 */
export function isPostHogConfigured(): boolean {
  return Boolean(publicEnvironment.NEXT_PUBLIC_POSTHOG_KEY);
}

/**
 * Bypass explícito de rate limiting para tests e2e.
 */
export function isRateLimitDisabled(): boolean {
  return serverEnvironment.ELITRAX_DISABLE_RATE_LIMIT === "1";
}

/**
 * Upstash REST permite rate limiting compartido en runtimes serverless.
 */
export function isUpstashRateLimitConfigured(): boolean {
  return Boolean(
    serverEnvironment.UPSTASH_REDIS_REST_URL &&
      serverEnvironment.UPSTASH_REDIS_REST_TOKEN,
  );
}

/**
 * Proveedor de cache efectivo con fallback seguro a memoria.
 */
export function getCacheProvider(): "memory" | "redis" | "valkey" {
  return serverEnvironment.ELITRAX_CACHE_PROVIDER ?? "memory";
}