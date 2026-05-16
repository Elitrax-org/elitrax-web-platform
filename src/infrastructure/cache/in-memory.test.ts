import { beforeEach, describe, expect, it, vi } from "vitest";

import { createInMemoryCache } from "@/infrastructure/cache/in-memory";

describe("infrastructure/cache/in-memory", () => {
  const cache = createInMemoryCache();

  beforeEach(async () => {
    await cache.clear();
  });

  it("stores and retrieves values", async () => {
    await cache.set("player:1", { id: "1" });

    const result = await cache.get<{ id: string }>("player:1");

    expect(result).toEqual({ id: "1" });
  });

  it("expires values by ttl", async () => {
    vi.useFakeTimers();
    try {
      await cache.set("subscription:a1", { tier: "pro" }, { ttlMs: 1000 });
      vi.advanceTimersByTime(1001);

      const result = await cache.get("subscription:a1");

      expect(result).toBeUndefined();
    } finally {
      vi.useRealTimers();
    }
  });

  it("deletes values by prefix", async () => {
    await cache.set("players:a1", ["p1", "p2"]);
    await cache.set("player:a1:p1", { id: "p1" });
    await cache.set("player:a1:p2", { id: "p2" });

    await cache.deleteByPrefix("player:a1:");

    expect(await cache.get("players:a1")).toEqual(["p1", "p2"]);
    expect(await cache.get("player:a1:p1")).toBeUndefined();
    expect(await cache.get("player:a1:p2")).toBeUndefined();
  });
});
