import "server-only";

import type { CachePort, CacheSetOptions } from "@/application/ports/cache";

type CacheEntry = {
  readonly value: unknown;
  readonly expiresAt?: number;
};

const GLOBAL_KEY = "__elitraxDataCacheStore__" as const;

type GlobalWithCacheStore = typeof globalThis & {
  [GLOBAL_KEY]?: Map<string, CacheEntry>;
};

// Store singleton por proceso para soportar hot-reload en desarrollo.
function getStore(): Map<string, CacheEntry> {
  const g = globalThis as GlobalWithCacheStore;
  if (!g[GLOBAL_KEY]) {
    g[GLOBAL_KEY] = new Map();
  }
  return g[GLOBAL_KEY]!;
}

function isExpired(entry: CacheEntry, now: number): boolean {
  return entry.expiresAt !== undefined && entry.expiresAt <= now;
}

/**
 * Implementación mínima de CachePort basada en Map con TTL opcional.
 */
export function createInMemoryCache(): CachePort {
  const store = getStore();

  return {
    async get<T>(key: string): Promise<T | undefined> {
      const entry = store.get(key);
      if (!entry) return undefined;
      const now = Date.now();
      if (isExpired(entry, now)) {
        store.delete(key);
        return undefined;
      }
      return entry.value as T;
    },

    async set<T>(key: string, value: T, options?: CacheSetOptions): Promise<void> {
      const ttlMs = options?.ttlMs;
      if (ttlMs !== undefined && ttlMs <= 0) {
        store.delete(key);
        return;
      }
      const expiresAt = ttlMs === undefined ? undefined : Date.now() + ttlMs;
      store.set(key, { value, expiresAt });
    },

    async delete(key: string): Promise<void> {
      store.delete(key);
    },

    async deleteByPrefix(prefix: string): Promise<void> {
      for (const key of store.keys()) {
        if (key.startsWith(prefix)) {
          store.delete(key);
        }
      }
    },

    async clear(): Promise<void> {
      store.clear();
    },
  };
}
