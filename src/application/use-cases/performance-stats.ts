import { calculateTelemetryHeatmap } from "@/domain/telemetry/heatmap-calculator";
import { getSportFieldWithOverrides, type SportType } from "@/domain/telemetry/sport-field";
import {
  deriveSessionMetrics,
  type TelemetrySample,
} from "@/domain/telemetry/telemetry-metrics-calculator";
import { createGeoPoint } from "@/domain/shared/geo";

import type { TenantContext } from "@/application/context";
import type {
  ApplicationDependencies,
  MatchEvent,
  Player,
  SessionPlayerMetric,
  Team,
  TrainingSession,
} from "@/application/ports/repositories";
import { ensurePermission, userHasPermission } from "@/lib/permissions";
import { NotFoundError } from "@/lib/errors";

export type SessionStatsSlice = {
  readonly session: TrainingSession;
  readonly sportType: SportType;
  readonly field: ReturnType<typeof getSportFieldWithOverrides>;
  readonly metric: SessionPlayerMetric | null;
  readonly heatmapTiles: Awaited<ReturnType<ApplicationDependencies["heatmaps"]["listTiles"]>>;
  readonly matchEvents: readonly MatchEvent[];
  readonly telemetryUploadIds: readonly string[];
  readonly dataStatus: "ready" | "events-only" | "empty";
  readonly loadIndex?: number;
};

export type PlayerSessionStatsView = {
  readonly player: Player;
  readonly primary: SessionStatsSlice;
  readonly comparison?: SessionStatsSlice;
};

function toZoneRecord(zoneValues: readonly number[]) {
  return Object.fromEntries(zoneValues.map((value, index) => [`zone_${index + 1}`, value]));
}

function toTelemetrySamples(
  rows: ReadonlyArray<{
    capturedAt: string;
    latitude?: number;
    longitude?: number;
    heartRate?: number;
  }>,
): TelemetrySample[] {
  return rows
    .filter(
      (sample) =>
        typeof sample.latitude === "number" && typeof sample.longitude === "number",
    )
    .map((sample) => ({
      capturedAt: new Date(sample.capturedAt),
      point: createGeoPoint(sample.latitude as number, sample.longitude as number),
      heartRate: sample.heartRate,
    }))
    .sort((left, right) => left.capturedAt.getTime() - right.capturedAt.getTime());
}

export function computeLoadIndex(metric: SessionPlayerMetric | null) {
  if (!metric) return undefined;
  const totalDistance = metric.totalDistanceMeters ?? 0;
  const maxSpeed = metric.maxSpeedMps ?? 0;
  const durationMinutes = (metric.totalDurationSeconds ?? 0) / 60;
  const highIntensityMeters = Object.entries(metric.zones ?? {}).reduce((sum, [key, value]) => {
    return key === "zone_4" || key === "zone_5" ? sum + value : sum;
  }, 0);

  const index = totalDistance / 10 + durationMinutes * 2 + maxSpeed * 8 + highIntensityMeters / 5;
  return Math.round(index);
}

async function getSessionOrThrow(
  deps: ApplicationDependencies,
  accountId: string,
  sessionId: string,
) {
  const session = await deps.sessions.getSession(accountId, sessionId);
  if (!session) throw new NotFoundError("session");
  return session;
}

async function resolveSportType(input: {
  deps: ApplicationDependencies;
  accountId: string;
  session: TrainingSession;
  sportType?: SportType;
}): Promise<{ sportType: SportType; team: Team | null }> {
  if (!input.session.teamId) {
    if (!input.sportType) {
      throw new NotFoundError("sport_type");
    }
    return { sportType: input.sportType, team: null };
  }
  const team = await input.deps.teams.getTeam(input.accountId, input.session.teamId);
  if (!team) throw new NotFoundError("team");
  return { sportType: input.sportType ?? team.sportType, team };
}

async function buildSessionStatsSlice(input: {
  deps: ApplicationDependencies;
  context: TenantContext;
  session: TrainingSession;
  playerId: string;
  sportType?: SportType;
}): Promise<SessionStatsSlice> {
  const { deps, context, session, playerId } = input;
  const accountId = context.accountId;
  const resolved = await resolveSportType({
    deps,
    accountId,
    session,
    sportType: input.sportType,
  });
  const sportType = resolved.sportType;

  const [events, uploads, existingMetric, existingTiles] = await Promise.all([
    deps.sessions.listMatchEvents(accountId, session.id),
    deps.telemetry.listUploadsForSessionPlayer({
      accountId,
      sessionId: session.id,
      playerId,
    }),
    deps.sessionMetrics.getMetric({ accountId, sessionId: session.id, playerId }),
    deps.heatmaps.listTiles({ accountId, sessionId: session.id, playerId }),
  ]);

  const playerEvents = events.filter((event) => event.playerId === undefined || event.playerId === playerId);

  let metric = existingMetric;
  let heatmapTiles = existingTiles;

  if ((metric === null || heatmapTiles.length === 0) && uploads.length > 0) {
    const rawBatches = await Promise.all(
      uploads.map((upload) => deps.telemetry.getRawSamples(accountId, upload.id)),
    );
    const telemetrySamples = toTelemetrySamples(rawBatches.flat());

    if (telemetrySamples.length >= 2) {
      const derivedMetrics = deriveSessionMetrics(telemetrySamples);
      const heatmap = calculateTelemetryHeatmap({
        sportType,
        samples: telemetrySamples,
      });

      if (userHasPermission(context.role, "performance.manage")) {
        metric = await deps.sessionMetrics.upsertMetric({
          accountId,
          sessionId: session.id,
          playerId,
          totalDistanceMeters: derivedMetrics.totalDistanceMeters,
          totalDurationSeconds: derivedMetrics.totalDurationSeconds,
          averageSpeedMps: derivedMetrics.averageSpeedMetersPerSecond,
          maxSpeedMps: derivedMetrics.maxSpeedMetersPerSecond,
          zones: toZoneRecord(derivedMetrics.distancePerZoneMeters),
        });
        heatmapTiles = await deps.heatmaps.replaceTiles({
          accountId,
          sessionId: session.id,
          playerId,
          tiles: heatmap.tiles.map((tile) => ({
            tileX: tile.tileX,
            tileY: tile.tileY,
            intensity: tile.intensity,
          })),
        });
      } else {
        metric = {
          id: `${session.id}:${playerId}:ephemeral`,
          accountId,
          sessionId: session.id,
          playerId,
          totalDistanceMeters: derivedMetrics.totalDistanceMeters,
          totalDurationSeconds: derivedMetrics.totalDurationSeconds,
          averageSpeedMps: derivedMetrics.averageSpeedMetersPerSecond,
          maxSpeedMps: derivedMetrics.maxSpeedMetersPerSecond,
          zones: toZoneRecord(derivedMetrics.distancePerZoneMeters),
          computedAt: new Date().toISOString(),
        };
        heatmapTiles = heatmap.tiles.map((tile) => ({
          id: `${session.id}:${playerId}:${tile.tileX}:${tile.tileY}`,
          accountId,
          sessionId: session.id,
          playerId,
          tileX: tile.tileX,
          tileY: tile.tileY,
          intensity: tile.intensity,
          computedAt: new Date().toISOString(),
        }));
      }
    }
  }

  const dataStatus = metric || heatmapTiles.length > 0
    ? "ready"
    : playerEvents.length > 0
      ? "events-only"
      : "empty";

  return {
    session,
    sportType,
    field: getSportFieldWithOverrides(sportType, {
      widthMeters: resolved.team?.fieldLengthMeters,
      heightMeters: resolved.team?.fieldWidthMeters,
    }),
    metric,
    heatmapTiles,
    matchEvents: playerEvents,
    telemetryUploadIds: uploads.map((upload) => upload.id),
    dataStatus,
    loadIndex: computeLoadIndex(metric),
  };
}

export async function getPlayerSessionStats(
  deps: ApplicationDependencies,
  context: TenantContext,
  input: {
    playerId: string;
    sessionId: string;
    sportType?: SportType;
    compareSessionId?: string;
    compareSportType?: SportType;
  },
): Promise<PlayerSessionStatsView> {
  ensurePermission(context.role, "reports.read");

  const player = await deps.players.getPlayer(context.accountId, input.playerId);
  if (!player) throw new NotFoundError("player");

  const primarySession = await getSessionOrThrow(deps, context.accountId, input.sessionId);
  const primary = await buildSessionStatsSlice({
    deps,
    context,
    session: primarySession,
    playerId: input.playerId,
    sportType: input.sportType,
  });

  const comparison = input.compareSessionId
    ? await buildSessionStatsSlice({
        deps,
        context,
        session: await getSessionOrThrow(deps, context.accountId, input.compareSessionId),
        playerId: input.playerId,
        sportType: input.compareSportType ?? input.sportType,
      })
    : undefined;

  return {
    player,
    primary,
    comparison,
  };
}

export async function listSessionsForPlayerStats(
  deps: ApplicationDependencies,
  context: TenantContext,
  playerId: string,
): Promise<readonly TrainingSession[]> {
  ensurePermission(context.role, "reports.read");

  const [sessions, uploads] = await Promise.all([
    deps.sessions.listSessions(context.accountId),
    deps.telemetry.listUploads(context.accountId),
  ]);

  const sessionIds = new Set<string>();
  for (const session of sessions) {
    if (session.playerIds.includes(playerId)) {
      sessionIds.add(session.id);
    }
  }
  for (const upload of uploads) {
    if (upload.playerId === playerId && upload.sessionId) {
      sessionIds.add(upload.sessionId);
    }
  }

  return sessions
    .filter((session) => sessionIds.has(session.id))
    .sort((left, right) => (left.scheduledFor < right.scheduledFor ? 1 : -1));
}

export async function listPlayersForSessionStats(
  deps: ApplicationDependencies,
  context: TenantContext,
  sessionId: string,
): Promise<readonly Player[]> {
  ensurePermission(context.role, "reports.read");

  const [session, allPlayers, events, uploads, gymLogs] = await Promise.all([
    getSessionOrThrow(deps, context.accountId, sessionId),
    deps.players.listPlayers(context.accountId),
    deps.sessions.listMatchEvents(context.accountId, sessionId),
    deps.telemetry.listUploadsForSessionPlayer({
      accountId: context.accountId,
      sessionId,
    }),
    deps.gymLogs.listForSession(context.accountId, sessionId),
  ]);

  const playerIds = new Set<string>(session.playerIds);
  for (const event of events) {
    if (event.playerId) playerIds.add(event.playerId);
  }
  for (const upload of uploads) {
    if (upload.playerId) playerIds.add(upload.playerId);
  }
  for (const log of gymLogs) {
    playerIds.add(log.playerId);
  }

  return allPlayers.filter((player) => playerIds.has(player.id));
}
