import { Redis } from "@upstash/redis";
import { NextResponse, type NextRequest } from "next/server";

import { logger } from "@/lib/logging";
import {
  isRateLimitDisabled,
  isUpstashRateLimitConfigured,
} from "@/lib/config/environment";

/**
 * Lightweight fixed-window rate limiter for route handlers.
 *
 * - Stores counters in a process-wide `Map` keyed by `${bucket}:${identifier}`.
 * - Identifier defaults to the requester's IP (`x-forwarded-for` first hop,
 *   then `x-real-ip`, fallback `"anonymous"`); callers may override via
 *   `identify` to scope per user/account.
 * - Suitable for single-instance deployments and tests. For multi-instance
 *   production deployments, replace `store` with a Redis/Upstash adapter.
 */
export type RateLimitOptions = {
  readonly bucket: string;
  /** Maximum requests allowed within the window. */
  readonly limit: number;
  /** Window size in milliseconds. */
  readonly windowMs: number;
  readonly identify?: (request: NextRequest) => string;
};

type Counter = {
  count: number;
  resetAt: number;
};

type RateLimitStore = {
  consume(key: string, options: RateLimitOptions): Promise<RateLimitResult>;
};

const GLOBAL_KEY = "__elitraxRateLimitStore__" as const;

type GlobalWithStore = typeof globalThis & {
  [GLOBAL_KEY]?: Map<string, Counter>;
};

function getStore(): Map<string, Counter> {
  const g = globalThis as GlobalWithStore;
  if (!g[GLOBAL_KEY]) {
    g[GLOBAL_KEY] = new Map();
  }
  return g[GLOBAL_KEY]!;
}

function defaultIdentifier(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const [first] = forwardedFor.split(",");
    if (first) return first.trim();
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;
  return "anonymous";
}

export type RateLimitResult = {
  readonly allowed: boolean;
  readonly limit: number;
  readonly remaining: number;
  readonly resetAt: number;
};

function createInMemoryRateLimitStore(): RateLimitStore {
  return {
    async consume(key, options) {
      const store = getStore();
      const now = Date.now();
      const existing = store.get(key);
      if (!existing || existing.resetAt <= now) {
        const counter = { count: 1, resetAt: now + options.windowMs };
        store.set(key, counter);
        return {
          allowed: true,
          limit: options.limit,
          remaining: options.limit - 1,
          resetAt: counter.resetAt,
        };
      }
      existing.count += 1;
      const remaining = options.limit - existing.count;
      return {
        allowed: existing.count <= options.limit,
        limit: options.limit,
        remaining: remaining < 0 ? 0 : remaining,
        resetAt: existing.resetAt,
      };
    },
  };
}

class UpstashRateLimitStore implements RateLimitStore {
  constructor(private readonly redis: Redis) {}

  async consume(key: string, options: RateLimitOptions): Promise<RateLimitResult> {
    const windowSeconds = Math.max(1, Math.ceil(options.windowMs / 1000));
    const count = await this.redis.incr(key);

    if (count === 1) {
      await this.redis.expire(key, windowSeconds);
    }

    const ttlSeconds = await this.redis.ttl(key);
    const safeTtlSeconds = ttlSeconds > 0 ? ttlSeconds : windowSeconds;

    return {
      allowed: count <= options.limit,
      limit: options.limit,
      remaining: Math.max(0, options.limit - count),
      resetAt: Date.now() + safeTtlSeconds * 1000,
    };
  }
}

const inMemoryStore = createInMemoryRateLimitStore();
let configuredStore: RateLimitStore | null = null;

function getConfiguredStore(): RateLimitStore {
  if (configuredStore) {
    return configuredStore;
  }

  configuredStore = isUpstashRateLimitConfigured()
    ? new UpstashRateLimitStore(Redis.fromEnv())
    : inMemoryStore;

  return configuredStore;
}

export async function checkRateLimit(
  request: NextRequest,
  options: RateLimitOptions,
): Promise<RateLimitResult> {
  const id = (options.identify ?? defaultIdentifier)(request);
  const key = `${options.bucket}:${id}`;

  try {
    return await getConfiguredStore().consume(key, options);
  } catch (error) {
    logger.error("api.rate_limit_backend_failed", {
      provider: isUpstashRateLimitConfigured() ? "upstash" : "memory",
      error: error instanceof Error ? error.message : "unknown",
    });
    return inMemoryStore.consume(key, options);
  }
}

/** Test-only: clear the in-memory rate-limit store. */
export function resetRateLimitStore(): void {
  getStore().clear();
  configuredStore = null;
}

/** Test-only: inject a store to validate fallback and wrapper behavior. */
export function setRateLimitStoreForTesting(store: RateLimitStore | null): void {
  configuredStore = store;
}

function buildHeaders(result: RateLimitResult): Headers {
  const headers = new Headers();
  headers.set("X-RateLimit-Limit", String(result.limit));
  headers.set("X-RateLimit-Remaining", String(result.remaining));
  headers.set("X-RateLimit-Reset", String(Math.ceil(result.resetAt / 1000)));
  if (!result.allowed) {
    const retryAfterSec = Math.max(
      1,
      Math.ceil((result.resetAt - Date.now()) / 1000),
    );
    headers.set("Retry-After", String(retryAfterSec));
  }
  return headers;
}

/**
 * Wraps a route handler so that requests exceeding the configured budget
 * receive HTTP 429 with `Retry-After` and `X-RateLimit-*` headers.
 *
 * Compatible with both `withAuth(...)`-wrapped handlers and plain
 * `(request: NextRequest, ctx: { params: Promise<...> }) => Response` handlers.
 * The returned function always accepts the Next.js route-handler signature
 * `(request, ctx)` so it can be exported directly as a `POST`/`GET` handler.
 */
export function withRateLimit<TParams extends Record<string, string> = Record<string, string>>(
  handler: (
    request: NextRequest,
    context: { params: Promise<TParams> },
  ) => Promise<Response> | Response,
  options: RateLimitOptions,
): (
  request: NextRequest,
  context: { params: Promise<TParams> },
) => Promise<Response> {
  return async (request, context) => {
    if (isRateLimitDisabled()) {
      return handler(request, context);
    }

    const result = await checkRateLimit(request, options);
    if (!result.allowed) {
      logger.warn("api.rate_limited", {
        bucket: options.bucket,
        path: request.nextUrl?.pathname,
      });
      const headers = buildHeaders(result);
      return NextResponse.json(
        {
          error: {
            code: "rate_limited",
            message: "Too many requests; please retry later.",
          },
        },
        { status: 429, headers },
      );
    }
    const response = await handler(request, context);
    const headers = buildHeaders(result);
    headers.forEach((value, name) => response.headers.set(name, value));
    return response;
  };
}
