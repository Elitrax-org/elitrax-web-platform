import { beforeEach, describe, expect, it } from "vitest";

import { resetStore } from "@/infrastructure/repositories/in-memory/store";
import { buildInMemoryDependencies } from "@/infrastructure/repositories/in-memory";
import { stubAiProvider } from "@/infrastructure/ai/stub-provider";
import {
  accountUseCases,
  aiUseCases,
  dashboardStatsUseCases,
  injuryUseCases,
  playerUseCases,
  performanceStatsUseCases,
  sessionUseCases,
  gymUseCases,
  teamUseCases,
  telemetryUseCases,
} from "@/application/use-cases";
import { buildCreateAccountInput } from "@/application/use-cases/test-fixtures";
import {
  AuthorizationError,
  SubscriptionLimitError,
} from "@/lib/errors";
import { planCatalog } from "@/domain/billing/feature-entitlement-policy";

import type { TenantContext } from "@/application/context";

const ownerUserId = "user-owner";

async function bootstrap(tier: "basic" | "pro" | "pro_plus" = "pro") {
  resetStore();
  const deps = buildInMemoryDependencies();
  const account = await accountUseCases.createAccount(
    deps,
    { userId: ownerUserId },
    buildCreateAccountInput({ type: "corporate", displayName: "Acme FC" }),
  );
  await deps.subscriptions.upsertSubscription({
    accountId: account.id,
    tier,
    entitlements: planCatalog[tier],
    status: "active",
  });
  const context: TenantContext = {
    actor: { userId: ownerUserId },
    accountId: account.id,
    accountType: account.type,
    role: "owner",
  };
  return { deps, account, context };
}

beforeEach(() => resetStore());

describe("application/use-cases", () => {
  it("creates an account, seeds a basic subscription and lists membership", async () => {
    const deps = buildInMemoryDependencies();
    const account = await accountUseCases.createAccount(
      deps,
      { userId: ownerUserId },
      buildCreateAccountInput({ type: "individual", displayName: " Solo Athlete " }),
    );
    expect(account.displayName).toBe("Solo Athlete");

    const memberships = await accountUseCases.listMyAccounts(deps, { userId: ownerUserId });
    expect(memberships).toHaveLength(1);
    expect(memberships[0]).toMatchObject({ role: "owner", accountId: account.id });

    const subscription = await deps.subscriptions.getSubscription(account.id);
    expect(subscription?.tier).toBe("basic");
  });

  it("rejects team creation on individual accounts", async () => {
    const { deps, context } = await bootstrap("basic");
    const individualContext: TenantContext = { ...context, accountType: "individual" };
    await expect(
      teamUseCases.createTeam(deps, individualContext, {
        name: "Reserves",
        sportType: "football",
      }),
    ).rejects.toBeInstanceOf(SubscriptionLimitError);
  });

  it("enforces player limit", async () => {
    const { deps, context } = await bootstrap("basic");
    const individualContext: TenantContext = { ...context, accountType: "individual" };
    await playerUseCases.addPlayer(deps, individualContext, { displayName: "P1" });
    await expect(
      playerUseCases.addPlayer(deps, individualContext, { displayName: "P2" }),
    ).rejects.toBeInstanceOf(SubscriptionLimitError);
  });

  it("assigns players to team with text jersey numbers and manages roster", async () => {
    const { deps, context } = await bootstrap("pro");
    const team = await teamUseCases.createTeam(deps, context, {
      name: "First Team",
      sportType: "football",
    });
    const player = await playerUseCases.addPlayer(deps, context, {
      displayName: "Jordan Wing",
    });

    const assigned = await teamUseCases.addPlayerToTeam(deps, context, team.id, {
      playerId: player.id,
      jerseyNumber: "7a",
    });
    expect(assigned.jerseyNumber).toBe("7A");

    const roster = await teamUseCases.listTeamPlayers(deps, context, team.id);
    expect(roster).toHaveLength(1);
    expect(roster[0].player.displayName).toBe("Jordan Wing");

    const updated = await teamUseCases.updateTeamPlayer(
      deps,
      context,
      team.id,
      player.id,
      { jerseyNumber: "10B" },
    );
    expect(updated.jerseyNumber).toBe("10B");

    await teamUseCases.removePlayerFromTeam(deps, context, team.id, player.id);
    const emptyRoster = await teamUseCases.listTeamPlayers(deps, context, team.id);
    expect(emptyRoster).toHaveLength(0);
  });

  it("rolls back created player when create-and-assign fails", async () => {
    const { deps, context } = await bootstrap("pro");
    const team = await teamUseCases.createTeam(deps, context, {
      name: "Rollback FC",
      sportType: "football",
    });

    await teamUseCases.createPlayerAndAddToTeam(deps, context, team.id, {
      displayName: "Existing Jersey",
      jerseyNumber: "10",
    });

    await expect(
      teamUseCases.createPlayerAndAddToTeam(deps, context, team.id, {
        displayName: "Should Rollback",
        jerseyNumber: "10",
      }),
    ).rejects.toThrow();

    const players = await playerUseCases.listPlayers(deps, context);
    expect(players.map((player) => player.displayName)).toEqual(["Existing Jersey"]);
  });

  it("updates custom field dimensions on teams", async () => {
    const { deps, context } = await bootstrap("pro");
    const team = await teamUseCases.createTeam(deps, context, {
      name: "Field Config FC",
      sportType: "football",
      fieldLengthMeters: 110,
      fieldWidthMeters: 72,
    });

    const updated = await teamUseCases.updateTeam(deps, context, team.id, {
      fieldLengthMeters: 102,
      fieldWidthMeters: 65,
    });

    expect(updated.fieldLengthMeters).toBe(102);
    expect(updated.fieldWidthMeters).toBe(65);
  });

  it("logs an injury and lists it back", async () => {
    const { deps, context } = await bootstrap("pro");
    const player = await playerUseCases.addPlayer(deps, context, {
      displayName: "Lionel",
    });
    const injury = await injuryUseCases.logInjury(deps, context, player.id, {
      diagnosedAt: new Date().toISOString(),
      status: "injured",
      estimatedRecoveryAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      bodyRegion: "leftLeg",
      bodyZoneDetail: 9,
      severity: "moderate",
      injuryComment: "Initial diagnosis note",
    });
    const injuries = await injuryUseCases.listInjuries(deps, context, player.id);
    expect(injuries).toHaveLength(1);
    expect(injuries[0].id).toBe(injury.id);
  });

  it("creates a session and appends a match event", async () => {
    const { deps, context } = await bootstrap("pro_plus");
    const session = await sessionUseCases.createSession(deps, context, {
      kind: "match",
      scheduledFor: new Date().toISOString(),
    });
    await sessionUseCases.appendMatchEvent(deps, context, session.id, {
      kind: "goal",
      matchMinute: 33,
    });
    const events = await sessionUseCases.listMatchEvents(deps, context, session.id);
    expect(events).toHaveLength(1);
    expect(events[0].kind).toBe("goal");
  });

  it("logs gym exercises against an existing session", async () => {
    const { deps, context } = await bootstrap("pro_plus");
    const session = await sessionUseCases.createSession(deps, context, {
      kind: "gym",
      scheduledFor: new Date().toISOString(),
    });
    const player = await deps.players.createPlayer(context.accountId, {
      displayName: "Lifter",
    });
    const log = await gymUseCases.logGymExercise(deps, context, session.id, {
      playerId: player.id,
      exerciseId: "back_squat",
      sets: [
        { weightKilograms: 100, repetitions: 5, rpe: 8 },
        { weightKilograms: 100, repetitions: 5 },
      ],
    });
    expect(log.sets).toHaveLength(2);
    const logs = await gymUseCases.listGymLogs(deps, context, session.id);
    expect(logs).toHaveLength(1);
    expect(logs[0].exerciseId).toBe("back_squat");
  });

  it("requires telemetry storage path scoped under the account", async () => {
    const { deps, context } = await bootstrap("pro");
    await expect(
      telemetryUseCases.registerTelemetryUpload(deps, context, {
        source: "garmin",
        storagePath: "other/123/file.json",
      }),
    ).rejects.toBeInstanceOf(AuthorizationError);

    const upload = await telemetryUseCases.registerTelemetryUpload(deps, context, {
      source: "garmin",
      storagePath: `${context.accountId}/sessions/x.json`,
    });
    expect(upload.id).toBeTruthy();
  });

  it("builds session stats from team sport and recomputes telemetry-derived data", async () => {
    const { deps, context } = await bootstrap("pro_plus");
    const team = await teamUseCases.createTeam(deps, context, {
      name: "First Team",
      sportType: "football",
    });
    const player = await playerUseCases.addPlayer(deps, context, {
      displayName: "Midfielder",
    });
    const session = await sessionUseCases.createSession(deps, context, {
      teamId: team.id,
      kind: "match",
      scheduledFor: new Date().toISOString(),
      playerIds: [player.id],
    });
    const upload = await telemetryUseCases.registerTelemetryUpload(deps, context, {
      source: "garmin",
      storagePath: `${context.accountId}/sessions/${session.id}/midfielder.fit`,
      sessionId: session.id,
      playerId: player.id,
    });
    await telemetryUseCases.ingestTelemetryBatch(deps, context, {
      uploadId: upload.id,
      samples: [
        {
          capturedAt: "2026-01-01T00:00:00Z",
          latitude: -34.6,
          longitude: -58.4,
          heartRate: 140,
        },
        {
          capturedAt: "2026-01-01T00:00:10Z",
          latitude: -34.6005,
          longitude: -58.4005,
          heartRate: 146,
        },
        {
          capturedAt: "2026-01-01T00:00:20Z",
          latitude: -34.601,
          longitude: -58.401,
          heartRate: 150,
        },
      ],
    });
    await sessionUseCases.appendMatchEvent(deps, context, session.id, {
      kind: "goal",
      playerId: player.id,
      matchMinute: 12,
    });

    const stats = await performanceStatsUseCases.getPlayerSessionStats(deps, context, {
      playerId: player.id,
      sessionId: session.id,
    });

    expect(stats.primary.sportType).toBe("football");
    expect(stats.primary.metric?.totalDistanceMeters).toBeGreaterThan(0);
    expect(stats.primary.heatmapTiles.length).toBeGreaterThan(0);
    expect(stats.primary.matchEvents).toHaveLength(1);
    expect(stats.primary.dataStatus).toBe("ready");
    expect(stats.primary.loadIndex).toBeGreaterThan(0);
  });

  it("allows manual sport selection when session has no team and can compare sessions", async () => {
    const { deps, context } = await bootstrap("pro_plus");
    const player = await playerUseCases.addPlayer(deps, context, {
      displayName: "Utility Back",
    });
    const firstSession = await sessionUseCases.createSession(deps, context, {
      kind: "running",
      scheduledFor: new Date().toISOString(),
      playerIds: [player.id],
    });
    const secondSession = await sessionUseCases.createSession(deps, context, {
      kind: "running",
      scheduledFor: new Date(Date.now() + 60_000).toISOString(),
      playerIds: [player.id],
    });

    const firstUpload = await telemetryUseCases.registerTelemetryUpload(deps, context, {
      source: "manual",
      storagePath: `${context.accountId}/sessions/${firstSession.id}/first.json`,
      sessionId: firstSession.id,
      playerId: player.id,
    });
    const secondUpload = await telemetryUseCases.registerTelemetryUpload(deps, context, {
      source: "manual",
      storagePath: `${context.accountId}/sessions/${secondSession.id}/second.json`,
      sessionId: secondSession.id,
      playerId: player.id,
    });

    await telemetryUseCases.ingestTelemetryBatch(deps, context, {
      uploadId: firstUpload.id,
      samples: [
        { capturedAt: "2026-01-01T00:00:00Z", latitude: -34.6, longitude: -58.4 },
        { capturedAt: "2026-01-01T00:00:10Z", latitude: -34.61, longitude: -58.41 },
      ],
    });
    await telemetryUseCases.ingestTelemetryBatch(deps, context, {
      uploadId: secondUpload.id,
      samples: [
        { capturedAt: "2026-01-01T01:00:00Z", latitude: -34.7, longitude: -58.5 },
        { capturedAt: "2026-01-01T01:00:10Z", latitude: -34.71, longitude: -58.51 },
      ],
    });

    const stats = await performanceStatsUseCases.getPlayerSessionStats(deps, context, {
      playerId: player.id,
      sessionId: firstSession.id,
      sportType: "rugby",
      compareSessionId: secondSession.id,
      compareSportType: "hockey",
    });

    expect(stats.primary.sportType).toBe("rugby");
    expect(stats.comparison?.sportType).toBe("hockey");
    expect(stats.comparison?.metric?.totalDistanceMeters).toBeGreaterThan(0);
    expect(stats.comparison?.heatmapTiles.length).toBeGreaterThan(0);

    const sessionsForPlayer = await performanceStatsUseCases.listSessionsForPlayerStats(
      deps,
      context,
      player.id,
    );
    expect(sessionsForPlayer.map((session) => session.id)).toEqual([
      secondSession.id,
      firstSession.id,
    ]);

    const playersForSession = await performanceStatsUseCases.listPlayersForSessionStats(
      deps,
      context,
      firstSession.id,
    );
    expect(playersForSession.map((candidate) => candidate.id)).toContain(player.id);
  });

  it("builds aggregated dashboard stats for the last 30 days", async () => {
    const { deps, context } = await bootstrap("pro_plus");
    const now = new Date("2026-02-15T12:00:00Z");

    // Arrange: roster, sesiones y telemetría en dos ventanas equivalentes.
    const team = await teamUseCases.createTeam(deps, context, {
      name: "Performance XI",
      sportType: "football",
    });
    const playerOne = await playerUseCases.addPlayer(deps, context, {
      displayName: "Alex Runner",
    });
    const playerTwo = await playerUseCases.addPlayer(deps, context, {
      displayName: "Marco Sprint",
    });
    await teamUseCases.addPlayerToTeam(deps, context, team.id, {
      playerId: playerOne.id,
    });
    await teamUseCases.addPlayerToTeam(deps, context, team.id, {
      playerId: playerTwo.id,
    });

    const currentSession = await sessionUseCases.createSession(deps, context, {
      kind: "team_training",
      teamId: team.id,
      scheduledFor: "2026-02-10T10:00:00Z",
      playerIds: [playerOne.id, playerTwo.id],
      durationSeconds: 5400,
    });
    const previousSession = await sessionUseCases.createSession(deps, context, {
      kind: "team_training",
      teamId: team.id,
      scheduledFor: "2026-01-12T10:00:00Z",
      playerIds: [playerOne.id],
      durationSeconds: 3600,
    });

    const currentUpload = await telemetryUseCases.registerTelemetryUpload(deps, context, {
      source: "manual",
      storagePath: `${context.accountId}/sessions/${currentSession.id}/player-one.json`,
      sessionId: currentSession.id,
      playerId: playerOne.id,
    });
    const previousUpload = await telemetryUseCases.registerTelemetryUpload(deps, context, {
      source: "manual",
      storagePath: `${context.accountId}/sessions/${previousSession.id}/player-one.json`,
      sessionId: previousSession.id,
      playerId: playerOne.id,
    });

    await telemetryUseCases.ingestTelemetryBatch(deps, context, {
      uploadId: currentUpload.id,
      samples: [
        { capturedAt: "2026-02-10T10:00:00Z", latitude: -34.6, longitude: -58.4, heartRate: 145 },
        { capturedAt: "2026-02-10T10:00:10Z", latitude: -34.6007, longitude: -58.4008, heartRate: 151 },
        { capturedAt: "2026-02-10T10:00:20Z", latitude: -34.6014, longitude: -58.4015, heartRate: 154 },
      ],
    });
    await telemetryUseCases.ingestTelemetryBatch(deps, context, {
      uploadId: previousUpload.id,
      samples: [
        { capturedAt: "2026-01-12T10:00:00Z", latitude: -34.62, longitude: -58.42, heartRate: 138 },
        { capturedAt: "2026-01-12T10:00:10Z", latitude: -34.6204, longitude: -58.4205, heartRate: 142 },
        { capturedAt: "2026-01-12T10:00:20Z", latitude: -34.6208, longitude: -58.421, heartRate: 144 },
      ],
    });

    await performanceStatsUseCases.getPlayerSessionStats(deps, context, {
      playerId: playerOne.id,
      sessionId: currentSession.id,
    });
    await performanceStatsUseCases.getPlayerSessionStats(deps, context, {
      playerId: playerOne.id,
      sessionId: previousSession.id,
    });

    await injuryUseCases.logInjury(deps, context, playerTwo.id, {
      diagnosedAt: "2026-02-11T10:00:00Z",
      status: "recovering",
      estimatedRecoveryAt: "2026-02-22T10:00:00Z",
      bodyRegion: "leftLeg",
      bodyZoneDetail: 9,
      severity: "moderate",
      injuryComment: "Hamstring recovery",
    });

    // Act: el dashboard resume el estado global de la cuenta para la ventana activa.
    const overview = await dashboardStatsUseCases.getDashboardOverview(deps, context, { now });

    // Assert: el agregado combina volumen, telemetría, comparativa temporal y alertas de salud.
    expect(overview.totalTeams).toBe(1);
    expect(overview.totalPlayers).toBe(2);
    expect(overview.sessions.current).toBe(1);
    expect(overview.sessions.previous).toBe(1);
    expect(overview.telemetry.processedUploads).toBe(2);
    expect(overview.trainingLoad.current).toBeGreaterThan(0);
    expect(overview.trainingLoad.previous).toBeGreaterThan(0);
    expect(overview.teamSummaries).toHaveLength(1);
    expect(overview.teamSummaries[0].team.name).toBe("Performance XI");
    expect(overview.teamSummaries[0].playerCount).toBe(2);
    expect(overview.recentSessions[0].sessionId).toBe(currentSession.id);
    expect(overview.alerts.some((alert) => alert.kind === "recovery" && alert.playerName === "Marco Sprint")).toBe(true);
  });

  it("blocks AI recommendations on plans that don't include the feature", async () => {
    const { deps, context } = await bootstrap("pro");
    await expect(
      aiUseCases.requestRecommendation(deps, stubAiProvider, context, {
        candidates: [
          {
            playerId: "p1",
            availability: "available",
            performanceScore: 0.8,
            fatigueScore: 0.2,
          },
        ],
      }),
    ).rejects.toBeInstanceOf(AuthorizationError);
  });

  it("ranks AI recommendations on pro_plus", async () => {
    const { deps, context } = await bootstrap("pro_plus");
    const run = await aiUseCases.requestRecommendation(deps, stubAiProvider, context, {
      candidates: [
        { playerId: "p1", availability: "available", performanceScore: 0.9, fatigueScore: 0.1 },
        { playerId: "p2", availability: "limited", performanceScore: 0.6, fatigueScore: 0.4 },
      ],
    });
    expect(run.candidates).toHaveLength(2);
    expect(run.candidates[0].rank).toBe(1);
    expect(run.candidates[0].playerId).toBe("p1");
  });
});
