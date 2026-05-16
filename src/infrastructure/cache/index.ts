import "server-only";

import type { CachePort } from "@/application/ports/cache";
import { getCacheProvider } from "@/lib/config/environment";
import { createInMemoryCache } from "./in-memory";

/**
 * Construye el adaptador de caché según configuración de entorno.
 */
export function buildCache(): CachePort {
  const provider = getCacheProvider();
  if (provider === "memory") {
    return createInMemoryCache();
  }

  throw new Error(
    `Cache provider '${provider}' is not implemented yet. Use ELITRAX_CACHE_PROVIDER=memory for now.`,
  );
}
