import { beforeEach, describe, expect, it, vi } from "vitest";

import { buildInMemoryDependencies } from "@/infrastructure/repositories/in-memory";
import { resetStore } from "@/infrastructure/repositories/in-memory/store";
import { withCachedRepositories } from "@/infrastructure/repositories/cached";
import { createInMemoryCache } from "@/infrastructure/cache/in-memory";
import { buildCreateAccountInput } from "@/application/use-cases/test-fixtures";

describe("infrastructure/repositories/cached", () => {
  beforeEach(() => {
    resetStore();
  });

  it("caches subscription lookups", async () => {
    const deps = buildInMemoryDependencies();
    const cache = createInMemoryCache();
    await cache.clear();
    const cachedDeps = withCachedRepositories(deps, cache);
    const fixture = buildCreateAccountInput({
      type: "corporate",
      displayName: "Cache Club",
    });

    const account = await deps.accounts.createAccount({
      type: "corporate",
      displayName: "Cache Club",
      ownerUserId: "owner-1",
      address: fixture.address,
      contact: fixture.contact,
      billing: fixture.billing,
    });

    const getSpy = vi.spyOn(deps.subscriptions, "getSubscription");

    const first = await cachedDeps.subscriptions.getSubscription(account.id);
    const second = await cachedDeps.subscriptions.getSubscription(account.id);

    expect(first?.accountId).toBe(account.id);
    expect(second?.accountId).toBe(account.id);
    expect(getSpy).toHaveBeenCalledTimes(1);
  });

  it("evicts subscription cache after upsert", async () => {
    const deps = buildInMemoryDependencies();
    const cache = createInMemoryCache();
    await cache.clear();
    const cachedDeps = withCachedRepositories(deps, cache);
    const fixture = buildCreateAccountInput({
      type: "corporate",
      displayName: "Cache Upsert",
    });

    const account = await deps.accounts.createAccount({
      type: "corporate",
      displayName: "Cache Upsert",
      ownerUserId: "owner-3",
      address: fixture.address,
      contact: fixture.contact,
      billing: fixture.billing,
    });

    const getSpy = vi.spyOn(deps.subscriptions, "getSubscription");

    await cachedDeps.subscriptions.getSubscription(account.id);
    await cachedDeps.subscriptions.getSubscription(account.id);
    const callsBeforeUpsert = getSpy.mock.calls.length;

    const current = await cachedDeps.subscriptions.getSubscription(account.id);
    if (!current) {
      throw new Error("subscription fixture missing");
    }

    await cachedDeps.subscriptions.upsertSubscription({
      ...current,
      status: "past_due",
    });

    await cachedDeps.subscriptions.getSubscription(account.id);
    expect(getSpy.mock.calls.length).toBe(callsBeforeUpsert + 1);
  });

  it("caches player lookups", async () => {
    const deps = buildInMemoryDependencies();
    const cache = createInMemoryCache();
    await cache.clear();
    const cachedDeps = withCachedRepositories(deps, cache);
    const fixture = buildCreateAccountInput({
      type: "corporate",
      displayName: "Cache FC",
    });

    const account = await deps.accounts.createAccount({
      type: "corporate",
      displayName: "Cache FC",
      ownerUserId: "owner-2",
      address: fixture.address,
      contact: fixture.contact,
      billing: fixture.billing,
    });
    const player = await deps.players.createPlayer(account.id, {
      displayName: "Player One",
    });

    const getSpy = vi.spyOn(deps.players, "getPlayer");

    const first = await cachedDeps.players.getPlayer(account.id, player.id);
    const second = await cachedDeps.players.getPlayer(account.id, player.id);

    expect(first?.id).toBe(player.id);
    expect(second?.id).toBe(player.id);
    expect(getSpy).toHaveBeenCalledTimes(1);
  });
});
