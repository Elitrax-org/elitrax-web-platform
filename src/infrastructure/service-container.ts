import "server-only";

import { buildInMemoryDependencies } from "./repositories/in-memory";
import { buildPrismaDependencies } from "./repositories/prisma";
import { withCachedRepositories } from "./repositories/cached";
import { getPrismaClient } from "./prisma/client";
import { buildCache } from "./cache";
import { stubAiProvider } from "./ai/stub-provider";
import { stubBillingProvider } from "./billing/stub-provider";
import { stripeBillingProvider } from "./billing/stripe-provider";
import { openAiProvider } from "./ai/openai-provider";

import type { CachePort } from "@/application/ports/cache";
import type { ApplicationDependencies } from "../application/ports/repositories";
import type { AiProvider, BillingProvider } from "../application/ports/providers";

import {
  isAiConfigured,
  isStripeConfigured,
  isSupabaseConfigured,
} from "../lib/config/environment";

/**
 * Punto único de composición de infraestructura.
 *
 * Este contenedor conecta puertos de aplicación con adaptadores concretos
 * (repositorios, cache y proveedores externos) según el entorno activo.
 */
export type ServiceContainer = {
  readonly deps: ApplicationDependencies;
  readonly billing: BillingProvider;
  readonly ai: AiProvider;
  readonly cache: CachePort;
  readonly persistence: "in-memory" | "supabase";
};

let cachedContainer: ServiceContainer | undefined;

/**
 * Resolves the active service container.
 *
 * Persistence uses Prisma against Postgres when Supabase env vars are set,
 * and falls back to the in-memory adapter otherwise. Billing and AI providers
 * prefer real integrations when their env vars are present.
 */
export function getServices(): ServiceContainer {
  if (cachedContainer) return cachedContainer;
  const supabase = isSupabaseConfigured();
  const cache = buildCache();

  // La aplicación trabaja siempre contra puertos; este bloque decide qué adaptadores
  // concretos conectar sin que las capas superiores conozcan el entorno real.
  // Se elige la persistencia base y luego se envuelve con cache transversal.
  const baseDependencies = supabase
    ? buildPrismaDependencies(getPrismaClient())
    : buildInMemoryDependencies();
  cachedContainer = {
    deps: withCachedRepositories(baseDependencies, cache),
    billing: isStripeConfigured() ? stripeBillingProvider : stubBillingProvider,
    ai: isAiConfigured() ? openAiProvider : stubAiProvider,
    cache,
    persistence: supabase ? "supabase" : "in-memory",
  };
  return cachedContainer;
}

/**
 * Test helper. Replaces the cached container with a custom one.
 */
export function setServicesForTesting(container: ServiceContainer | undefined) {
  // Permite aislar tests sin depender del singleton compartido entre requests.
  cachedContainer = container;
}
