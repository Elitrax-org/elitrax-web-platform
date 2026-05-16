import { NextRequest, NextResponse } from "next/server";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  checkRateLimit,
  resetRateLimitStore,
  setRateLimitStoreForTesting,
  withRateLimit,
} from "@/lib/api/rate-limit";

function makeRequest(headers: Record<string, string> = {}): NextRequest {
  return new NextRequest("https://example.test/api/v1/test", { headers });
}

beforeEach(() => {
  setRateLimitStoreForTesting(null);
  resetRateLimitStore();
});
afterEach(() => {
  setRateLimitStoreForTesting(null);
  resetRateLimitStore();
});

describe("lib/api/rate-limit", () => {
  it("allows requests under the limit and reports remaining quota", async () => {
    const request = makeRequest({ "x-forwarded-for": "10.0.0.1" });
    const first = await checkRateLimit(request, {
      bucket: "test",
      limit: 3,
      windowMs: 1_000,
    });
    expect(first.allowed).toBe(true);
    expect(first.remaining).toBe(2);

    const second = await checkRateLimit(request, {
      bucket: "test",
      limit: 3,
      windowMs: 1_000,
    });
    expect(second.allowed).toBe(true);
    expect(second.remaining).toBe(1);
  });

  it("blocks requests once the limit is reached and resets after the window", async () => {
    const request = makeRequest({ "x-forwarded-for": "10.0.0.2" });
    for (let i = 0; i < 2; i += 1) {
      await checkRateLimit(request, { bucket: "burst", limit: 2, windowMs: 50 });
    }
    const blocked = await checkRateLimit(request, {
      bucket: "burst",
      limit: 2,
      windowMs: 50,
    });
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);

    await new Promise((resolve) => setTimeout(resolve, 60));
    const recovered = await checkRateLimit(request, {
      bucket: "burst",
      limit: 2,
      windowMs: 50,
    });
    expect(recovered.allowed).toBe(true);
    expect(recovered.remaining).toBe(1);
  });

  it("scopes counters per identifier", async () => {
    const a = makeRequest({ "x-forwarded-for": "1.1.1.1" });
    const b = makeRequest({ "x-forwarded-for": "2.2.2.2" });
    const opts = { bucket: "scope", limit: 1, windowMs: 1_000 } as const;
    expect((await checkRateLimit(a, opts)).allowed).toBe(true);
    expect((await checkRateLimit(a, opts)).allowed).toBe(false);
    expect((await checkRateLimit(b, opts)).allowed).toBe(true);
  });

  it("falls back to in-memory when the shared backend fails", async () => {
    setRateLimitStoreForTesting({
      async consume() {
        throw new Error("backend unavailable");
      },
    });

    const request = makeRequest({ "x-forwarded-for": "7.7.7.7" });
    const first = await checkRateLimit(request, {
      bucket: "fallback",
      limit: 1,
      windowMs: 1_000,
    });
    const second = await checkRateLimit(request, {
      bucket: "fallback",
      limit: 1,
      windowMs: 1_000,
    });

    expect(first.allowed).toBe(true);
    expect(second.allowed).toBe(false);
  });

  it("withRateLimit returns 429 with Retry-After once exceeded", async () => {
    const handler = withRateLimit(
      async (_request: NextRequest, _ctx: { params: Promise<Record<string, string>> }) =>
        NextResponse.json({ ok: true }),
      { bucket: "wrap", limit: 1, windowMs: 1_000 },
    );
    const ctx = { params: Promise.resolve({}) };
    const okResponse = await handler(
      makeRequest({ "x-forwarded-for": "9.9.9.9" }),
      ctx,
    );
    expect(okResponse.status).toBe(200);
    expect(okResponse.headers.get("X-RateLimit-Limit")).toBe("1");
    expect(okResponse.headers.get("X-RateLimit-Remaining")).toBe("0");

    const blockedResponse = await handler(
      makeRequest({ "x-forwarded-for": "9.9.9.9" }),
      ctx,
    );
    expect(blockedResponse.status).toBe(429);
    expect(blockedResponse.headers.get("Retry-After")).toBeTruthy();
    const body = (await blockedResponse.json()) as {
      error: { code: string };
    };
    expect(body.error.code).toBe("rate_limited");
  });
});
