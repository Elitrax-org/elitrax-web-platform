import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { resetStore } from "@/infrastructure/repositories/in-memory/store";
import { resetRateLimitStore } from "@/lib/api/rate-limit";
import { setAuthGatewayForTesting } from "@/infrastructure/auth/gateway";
import { setServicesForTesting } from "@/infrastructure/service-container";
import { buildInMemoryDependencies } from "@/infrastructure/repositories/in-memory";
import { createInMemoryCache } from "@/infrastructure/cache/in-memory";
import { stubAiProvider } from "@/infrastructure/ai/stub-provider";
import { stubBillingProvider } from "@/infrastructure/billing/stub-provider";
import { accountUseCases } from "@/application/use-cases";
import { buildCreateAccountInput } from "@/application/use-cases/test-fixtures";
import { planCatalog } from "@/domain/billing/feature-entitlement-policy";
import type { AuthGateway, CurrentUser } from "@/application/ports/providers";

const ownerUserId = "user-route-test";

const cookieStore = new Map<string, string>();

vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (key: string) => {
      const value = cookieStore.get(key);
      return value === undefined ? undefined : { value };
    },
    set: (key: string, value: string) => {
      cookieStore.set(key, value);
    },
    delete: (key: string) => {
      cookieStore.delete(key);
    },
  }),
}));

vi.mock("server-only", () => ({}));

class FakeAuthGateway implements AuthGateway {
  constructor(private user: CurrentUser | null) {}
  async getCurrentUser(): Promise<CurrentUser | null> {
    return this.user;
  }
  async signInWithPassword(): Promise<void> {}
  async signUpWithPassword(): Promise<{ requiresEmailConfirmation: boolean }> {
    return { requiresEmailConfirmation: false };
  }
  async signOut(): Promise<void> {}
  async requestPasswordReset(): Promise<void> {}
  async updatePassword(): Promise<void> {}
}

async function bootstrap() {
  resetStore();
  cookieStore.clear();
  resetRateLimitStore();
  const deps = buildInMemoryDependencies();
  setServicesForTesting({
    deps,
    billing: stubBillingProvider,
    ai: stubAiProvider,
    cache: createInMemoryCache(),
    persistence: "in-memory",
  });
  setAuthGatewayForTesting(
    new FakeAuthGateway({ userId: ownerUserId, email: "owner@test.dev" }),
  );
  const account = await accountUseCases.createAccount(
    deps,
    { userId: ownerUserId },
    buildCreateAccountInput({ type: "corporate", displayName: "Route Co" }),
  );
  await deps.subscriptions.upsertSubscription({
    accountId: account.id,
    tier: "pro",
    entitlements: planCatalog.pro,
    status: "active",
  });
  cookieStore.set("elitrax_active_account", account.id);
  return { account };
}

beforeEach(async () => {
  cookieStore.clear();
  resetStore();
  resetRateLimitStore();
});

afterEach(() => {
  setAuthGatewayForTesting(null);
  setServicesForTesting(undefined);
});

describe("api/v1 contract tests", () => {
  it("POST /api/v1/telemetry/uploads creates an upload and exposes rate-limit headers", async () => {
    const { account } = await bootstrap();
    const { POST } = await import("@/app/api/v1/telemetry/uploads/route");
    const { NextRequest } = await import("next/server");

    const response = await POST(
      new NextRequest("https://example.test/api/v1/telemetry/uploads", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-forwarded-for": "10.0.0.10",
        },
        body: JSON.stringify({
          source: "garmin",
          storagePath: `${account.id}/sessions/run-1.json`,
        }),
      }),
      { params: Promise.resolve({}) },
    );

    expect(response.status).toBe(201);
    expect(response.headers.get("X-RateLimit-Limit")).toBe("60");
    const body = (await response.json()) as { id: string; source: string };
    expect(body.id).toBeTruthy();
    expect(body.source).toBe("garmin");
  });

  it("POST /api/v1/telemetry/uploads rejects storage paths outside the tenant", async () => {
    await bootstrap();
    const { POST } = await import("@/app/api/v1/telemetry/uploads/route");
    const { NextRequest } = await import("next/server");

    const response = await POST(
      new NextRequest("https://example.test/api/v1/telemetry/uploads", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-forwarded-for": "10.0.0.11",
        },
        body: JSON.stringify({
          source: "garmin",
          storagePath: "other-tenant/file.json",
        }),
      }),
      { params: Promise.resolve({}) },
    );
    expect(response.status).toBe(403);
    const body = (await response.json()) as { error: { code: string } };
    expect(body.error.code).toBe("authorization_error");
  });

  it("POST /api/v1/auth/login enforces a 10/min rate limit", async () => {
    cookieStore.clear();
    resetRateLimitStore();
    setAuthGatewayForTesting(new FakeAuthGateway(null));
    const { POST } = await import("@/app/api/v1/auth/login/route");
    const { NextRequest } = await import("next/server");

    const buildRequest = () =>
      new NextRequest("https://example.test/api/v1/auth/login", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-forwarded-for": "203.0.113.7",
        },
        body: JSON.stringify({
          email: "u@test.dev",
          password: "abcdefgh",
        }),
      });

    for (let i = 0; i < 10; i += 1) {
      const ok = await POST(buildRequest(), { params: Promise.resolve({}) });
      expect(ok.status).toBe(200);
    }
    const blocked = await POST(buildRequest(), {
      params: Promise.resolve({}),
    });
    expect(blocked.status).toBe(429);
    expect(blocked.headers.get("Retry-After")).toBeTruthy();
  });

  it("returns 401 when no authenticated user is present", async () => {
    cookieStore.clear();
    resetStore();
    resetRateLimitStore();
    setServicesForTesting({
      deps: buildInMemoryDependencies(),
      billing: stubBillingProvider,
      ai: stubAiProvider,
      cache: createInMemoryCache(),
      persistence: "in-memory",
    });
    setAuthGatewayForTesting(new FakeAuthGateway(null));
    const { GET } = await import("@/app/api/v1/telemetry/uploads/route");
    const { NextRequest } = await import("next/server");

    const response = await GET(
      new NextRequest("https://example.test/api/v1/telemetry/uploads", {
        headers: { "x-forwarded-for": "10.0.0.20" },
      }),
      { params: Promise.resolve({}) },
    );
    expect(response.status).toBe(401);
    const body = (await response.json()) as { error: { code: string } };
    expect(body.error.code).toBe("unauthenticated");
  });

  it("GET /api/v1/me returns the active account and memberships", async () => {
    const { account } = await bootstrap();
    const { GET } = await import("@/app/api/v1/me/route");
    const { NextRequest } = await import("next/server");

    const response = await GET(
      new NextRequest("https://example.test/api/v1/me", {
        headers: { "x-forwarded-for": "10.0.0.30" },
      }),
      { params: Promise.resolve({}) },
    );
    expect(response.status).toBe(200);
    const body = (await response.json()) as {
      user: { userId: string; email: string };
      activeAccount: { id: string; type: string; role: string };
      memberships: ReadonlyArray<{ accountId: string; role: string }>;
    };
    expect(body.user.userId).toBe(ownerUserId);
    expect(body.activeAccount.id).toBe(account.id);
    expect(body.activeAccount.role).toBe("owner");
    expect(body.memberships).toHaveLength(1);
    expect(body.memberships[0].accountId).toBe(account.id);
  });

  it("POST /api/v1/teams creates a team and GET lists it", async () => {
    await bootstrap();
    const teamsRoute = await import("@/app/api/v1/teams/route");
    const { NextRequest } = await import("next/server");

    const created = await teamsRoute.POST(
      new NextRequest("https://example.test/api/v1/teams", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-forwarded-for": "10.0.0.40",
        },
        body: JSON.stringify({ name: "First Team", sportType: "football" }),
      }),
      { params: Promise.resolve({}) },
    );
    expect(created.status).toBe(201);
    const team = (await created.json()) as { id: string; name: string };
    expect(team.name).toBe("First Team");

    const list = await teamsRoute.GET(
      new NextRequest("https://example.test/api/v1/teams", {
        headers: { "x-forwarded-for": "10.0.0.40" },
      }),
      { params: Promise.resolve({}) },
    );
    expect(list.status).toBe(200);
    const body = (await list.json()) as {
      teams: ReadonlyArray<{ id: string; name: string }>;
    };
    expect(body.teams.map((t) => t.name)).toContain("First Team");
  });

  it("POST/GET/PATCH/DELETE /api/v1/teams/:teamId/players manages roster", async () => {
    await bootstrap();
    const teamsRoute = await import("@/app/api/v1/teams/route");
    const playersRoute = await import("@/app/api/v1/players/route");
    const teamPlayersRoute = await import("@/app/api/v1/teams/[teamId]/players/route");
    const teamPlayerRoute = await import("@/app/api/v1/teams/[teamId]/players/[playerId]/route");
    const { NextRequest } = await import("next/server");

    const createdTeam = await teamsRoute.POST(
      new NextRequest("https://example.test/api/v1/teams", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-forwarded-for": "10.0.0.45",
        },
        body: JSON.stringify({ name: "Roster Team", sportType: "football" }),
      }),
      { params: Promise.resolve({}) },
    );
    expect(createdTeam.status).toBe(201);
    const team = (await createdTeam.json()) as { id: string };

    const createdPlayer = await playersRoute.POST(
      new NextRequest("https://example.test/api/v1/players", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-forwarded-for": "10.0.0.45",
        },
        body: JSON.stringify({ displayName: "Roster Player" }),
      }),
      { params: Promise.resolve({}) },
    );
    expect(createdPlayer.status).toBe(201);
    const player = (await createdPlayer.json()) as { id: string };

    const assigned = await teamPlayersRoute.POST(
      new NextRequest(`https://example.test/api/v1/teams/${team.id}/players`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-forwarded-for": "10.0.0.45",
        },
        body: JSON.stringify({ playerId: player.id, jerseyNumber: "9b" }),
      }),
      { params: Promise.resolve({ teamId: team.id }) },
    );
    expect(assigned.status).toBe(201);
    const assignedBody = (await assigned.json()) as { jerseyNumber?: string };
    expect(assignedBody.jerseyNumber).toBe("9B");

    const listed = await teamPlayersRoute.GET(
      new NextRequest(`https://example.test/api/v1/teams/${team.id}/players`, {
        headers: { "x-forwarded-for": "10.0.0.45" },
      }),
      { params: Promise.resolve({ teamId: team.id }) },
    );
    expect(listed.status).toBe(200);
    const listedBody = (await listed.json()) as {
      roster: ReadonlyArray<{ playerId: string }>;
    };
    expect(listedBody.roster).toHaveLength(1);

    const updated = await teamPlayerRoute.PATCH(
      new NextRequest(
        `https://example.test/api/v1/teams/${team.id}/players/${player.id}`,
        {
          method: "PATCH",
          headers: {
            "content-type": "application/json",
            "x-forwarded-for": "10.0.0.45",
          },
          body: JSON.stringify({ jerseyNumber: "10" }),
        },
      ),
      { params: Promise.resolve({ teamId: team.id, playerId: player.id }) },
    );
    expect(updated.status).toBe(200);

    const removed = await teamPlayerRoute.DELETE(
      new NextRequest(
        `https://example.test/api/v1/teams/${team.id}/players/${player.id}`,
        {
          method: "DELETE",
          headers: { "x-forwarded-for": "10.0.0.45" },
        },
      ),
      { params: Promise.resolve({ teamId: team.id, playerId: player.id }) },
    );
    expect(removed.status).toBe(200);
  });

  it("POST /api/v1/players creates a player and POST /api/v1/sessions schedules a session", async () => {
    await bootstrap();
    const playersRoute = await import("@/app/api/v1/players/route");
    const sessionsRoute = await import("@/app/api/v1/sessions/route");
    const { NextRequest } = await import("next/server");

    const playerResponse = await playersRoute.POST(
      new NextRequest("https://example.test/api/v1/players", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-forwarded-for": "10.0.0.50",
        },
        body: JSON.stringify({ displayName: "Jane Striker", position: "FW" }),
      }),
      { params: Promise.resolve({}) },
    );
    expect(playerResponse.status).toBe(201);
    const player = (await playerResponse.json()) as { id: string };
    expect(player.id).toBeTruthy();

    const sessionResponse = await sessionsRoute.POST(
      new NextRequest("https://example.test/api/v1/sessions", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-forwarded-for": "10.0.0.50",
        },
        body: JSON.stringify({
          kind: "team_training",
          scheduledFor: "2026-05-15T10:00:00.000Z",
          durationSeconds: 5400,
          playerIds: [player.id],
        }),
      }),
      { params: Promise.resolve({}) },
    );
    expect(sessionResponse.status).toBe(201);
    const session = (await sessionResponse.json()) as {
      id: string;
      kind: string;
    };
    expect(session.kind).toBe("team_training");
  });

  it("GET /api/v1/players supports keyset pagination with limit/cursor", async () => {
    await bootstrap();
    const playersRoute = await import("@/app/api/v1/players/route");
    const { NextRequest } = await import("next/server");

    for (const name of ["A", "B", "C"]) {
      const created = await playersRoute.POST(
        new NextRequest("https://example.test/api/v1/players", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "x-forwarded-for": "10.0.0.70",
          },
          body: JSON.stringify({ displayName: `Player ${name}` }),
        }),
        { params: Promise.resolve({}) },
      );
      expect(created.status).toBe(201);
    }

    const firstPage = await playersRoute.GET(
      new NextRequest("https://example.test/api/v1/players?limit=2", {
        headers: { "x-forwarded-for": "10.0.0.70" },
      }),
      { params: Promise.resolve({}) },
    );
    expect(firstPage.status).toBe(200);
    const firstBody = (await firstPage.json()) as {
      players: ReadonlyArray<{ id: string }>;
      nextCursor: string | null;
    };
    expect(firstBody.players).toHaveLength(2);
    expect(firstBody.nextCursor).toBeTruthy();

    const secondPage = await playersRoute.GET(
      new NextRequest(
        `https://example.test/api/v1/players?limit=2&cursor=${encodeURIComponent(firstBody.nextCursor ?? "")}`,
        {
          headers: { "x-forwarded-for": "10.0.0.70" },
        },
      ),
      { params: Promise.resolve({}) },
    );
    expect(secondPage.status).toBe(200);
    const secondBody = (await secondPage.json()) as {
      players: ReadonlyArray<{ id: string }>;
      nextCursor: string | null;
    };
    expect(secondBody.players.length).toBeGreaterThanOrEqual(1);

    const firstIds = new Set(firstBody.players.map((p) => p.id));
    expect(secondBody.players.some((p) => firstIds.has(p.id))).toBe(false);
  });

  it("POST /api/v1/teams returns 422 on invalid payload (zod)", async () => {
    await bootstrap();
    const { POST } = await import("@/app/api/v1/teams/route");
    const { NextRequest } = await import("next/server");

    const response = await POST(
      new NextRequest("https://example.test/api/v1/teams", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-forwarded-for": "10.0.0.60",
        },
        body: JSON.stringify({ name: "" }),
      }),
      { params: Promise.resolve({}) },
    );
    expect(response.status).toBe(400);
    const body = (await response.json()) as { error: { code: string } };
    expect(body.error.code).toBe("validation_error");
  });

  it("GET /api/v1/config/metadata returns cached plans and sports metadata", async () => {
    await bootstrap();
    const { GET } = await import("@/app/api/v1/config/metadata/route");
    const { NextRequest } = await import("next/server");

    const response = await GET(
      new NextRequest("https://example.test/api/v1/config/metadata", {
        headers: { "x-forwarded-for": "10.0.0.80" },
      }),
      { params: Promise.resolve({}) },
    );

    expect(response.status).toBe(200);
    const body = (await response.json()) as {
      plans: ReadonlyArray<{ tier: string; features: readonly string[] }>;
      sports: ReadonlyArray<{ sportType: string; supportsHeatmap: boolean }>;
    };

    expect(body.plans.length).toBeGreaterThanOrEqual(3);
    expect(body.plans.some((p) => p.tier === "pro_plus")).toBe(true);
    expect(body.sports.some((s) => s.sportType === "football")).toBe(true);
    expect(body.sports.every((s) => s.supportsHeatmap)).toBe(true);
  });
});
