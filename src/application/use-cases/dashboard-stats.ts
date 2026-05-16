import type { TenantContext } from "@/application/context";
import type {
  ApplicationDependencies,
  SessionPlayerMetric,
  Team,
  TrainingSession,
} from "@/application/ports/repositories";
import { ensurePermission } from "@/lib/permissions";

import { computeLoadIndex } from "./performance-stats";

// Comparación estándar entre el periodo actual y la ventana anterior equivalente.
type MetricComparison = {
  readonly current: number;
  readonly previous: number;
  readonly delta: number;
};

// Alertas compactas para la UI; el texto final se localiza en la capa de presentación.
export type DashboardAlert = {
  readonly id: string;
  readonly level: "high" | "medium" | "info";
  readonly teamId?: string;
  readonly teamName?: string;
  readonly playerId?: string;
  readonly playerName?: string;
  readonly sessionId?: string;
  readonly sessionScheduledFor?: string;
  readonly kind: "injury" | "recovery" | "load-spike" | "telemetry-gap";
  readonly value?: number;
};

export type DashboardTrendPoint = {
  readonly label: string;
  readonly loadIndex: number;
  readonly sessionCount: number;
  readonly totalDistanceMeters: number;
};

export type DashboardTeamSummary = {
  readonly team: Team;
  readonly playerCount: number;
  readonly activePlayers: number;
  readonly sessionCount: number;
  readonly telemetrySessionCount: number;
  readonly activeInjuries: number;
  readonly recoveringPlayers: number;
  readonly averageLoadIndex: number;
  readonly deltaLoadIndex: number;
  readonly totalDistanceMeters: number;
};

export type DashboardSessionSummary = {
  readonly sessionId: string;
  readonly teamId?: string;
  readonly kind: TrainingSession["kind"];
  readonly scheduledFor: string;
  readonly playerCount: number;
  readonly telemetryPlayerCount: number;
  readonly loadIndex: number;
  readonly deltaLoadIndex: number;
  readonly totalDistanceMeters: number;
};

export type DashboardOverview = {
  readonly generatedAt: string;
  readonly range: {
    readonly from: string;
    readonly to: string;
    readonly previousFrom: string;
    readonly previousTo: string;
    readonly days: number;
  };
  readonly readiness: MetricComparison;
  readonly activePlayers: MetricComparison;
  readonly trainingLoad: MetricComparison;
  readonly riskAlerts: MetricComparison;
  readonly sessions: MetricComparison;
  readonly telemetryCoverage: MetricComparison;
  readonly totalDistance: MetricComparison;
  readonly totalTeams: number;
  readonly totalPlayers: number;
  readonly telemetry: {
    readonly processedUploads: number;
    readonly pendingUploads: number;
    readonly sessionsWithTelemetry: number;
    readonly sessionsWithoutTelemetry: number;
    readonly sampleCount: number;
  };
  readonly trend: readonly DashboardTrendPoint[];
  readonly teamSummaries: readonly DashboardTeamSummary[];
  readonly alerts: readonly DashboardAlert[];
  readonly recentSessions: readonly DashboardSessionSummary[];
};

// Resultado intermedio por sesión para evitar recalcular agregados varias veces.
type SessionAggregate = {
  readonly session: TrainingSession;
  readonly metrics: readonly SessionPlayerMetric[];
  readonly loadIndex: number;
  readonly totalDistanceMeters: number;
  readonly telemetryPlayerCount: number;
};

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function clampPercent(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function createMetricComparison(current: number, previous: number): MetricComparison {
  return {
    current,
    previous,
    delta: current - previous,
  };
}

function sumMetricLoad(metrics: readonly SessionPlayerMetric[]) {
  return metrics.reduce((sum, metric) => sum + (computeLoadIndex(metric) ?? 0), 0);
}

function sumMetricDistance(metrics: readonly SessionPlayerMetric[]) {
  return metrics.reduce((sum, metric) => sum + (metric.totalDistanceMeters ?? 0), 0);
}

function average(numbers: readonly number[]) {
  if (numbers.length === 0) return 0;
  return numbers.reduce((sum, value) => sum + value, 0) / numbers.length;
}

function asDate(input: string) {
  return new Date(input);
}

function groupMetricsBySession(metrics: readonly SessionPlayerMetric[]) {
  const map = new Map<string, SessionPlayerMetric[]>();
  for (const metric of metrics) {
    const bucket = map.get(metric.sessionId);
    if (bucket) {
      bucket.push(metric);
    } else {
      map.set(metric.sessionId, [metric]);
    }
  }
  return map;
}

// Normaliza la información por sesión para que los cálculos posteriores trabajen
// con una estructura única, tanto si hubo telemetría como si sólo existen métricas persistidas.
function createSessionAggregates(input: {
  sessions: readonly TrainingSession[];
  metricsBySession: Map<string, SessionPlayerMetric[]>;
  uploadsBySession: Map<string, number>;
}) {
  return input.sessions.map<SessionAggregate>((session) => {
    const metrics = input.metricsBySession.get(session.id) ?? [];
    return {
      session,
      metrics,
      loadIndex: sumMetricLoad(metrics),
      totalDistanceMeters: sumMetricDistance(metrics),
      telemetryPlayerCount: input.uploadsBySession.get(session.id) ?? 0,
    };
  });
}

// La tendencia se presenta en 12 buckets fijos para mantener una visual estable
// en el dashboard aunque el volumen real de sesiones cambie entre cuentas.
function toTrend(input: {
  from: Date;
  sessions: readonly SessionAggregate[];
}) {
  const buckets = new Map<string, { loadIndex: number; totalDistanceMeters: number; sessionCount: number }>();
  for (let index = 0; index < 12; index += 1) {
    const bucketDate = addDays(input.from, Math.floor((index * 30) / 12));
    const label = bucketDate.toISOString().slice(5, 10);
    buckets.set(label, { loadIndex: 0, totalDistanceMeters: 0, sessionCount: 0 });
  }

  for (const aggregate of input.sessions) {
    const scheduledAt = asDate(aggregate.session.scheduledFor).getTime();
    const index = Math.min(
      11,
      Math.max(
        0,
        Math.floor((scheduledAt - input.from.getTime()) / (30 * 24 * 60 * 60 * 1000 / 12)),
      ),
    );
    const bucketDate = addDays(input.from, Math.floor((index * 30) / 12));
    const label = bucketDate.toISOString().slice(5, 10);
    const bucket = buckets.get(label);
    if (!bucket) continue;
    bucket.loadIndex += aggregate.loadIndex;
    bucket.totalDistanceMeters += aggregate.totalDistanceMeters;
    bucket.sessionCount += 1;
  }

  return Array.from(buckets.entries()).map(([label, bucket]) => ({
    label,
    loadIndex: Math.round(bucket.loadIndex),
    totalDistanceMeters: Math.round(bucket.totalDistanceMeters),
    sessionCount: bucket.sessionCount,
  }));
}

export async function getDashboardOverview(
  deps: ApplicationDependencies,
  context: TenantContext,
  input?: { readonly days?: number; readonly now?: Date },
): Promise<DashboardOverview> {
  // El dashboard resume información sensible de rendimiento y salud.
  ensurePermission(context.role, "reports.read");

  // Se comparan siempre dos ventanas equivalentes: la actual y la inmediatamente anterior.
  const days = input?.days ?? 30;
  const now = input?.now ?? new Date();
  const end = now;
  const start = startOfDay(addDays(end, -(days - 1)));
  const previousEnd = addDays(start, -1);
  const previousStart = startOfDay(addDays(previousEnd, -(days - 1)));

  const [teams, players, sessions, uploads] = await Promise.all([
    deps.teams.listTeams(context.accountId),
    deps.players.listPlayers(context.accountId),
    deps.sessions.listSessions(context.accountId),
    deps.telemetry.listUploads(context.accountId),
  ]);
  const playersById = new Map(players.map((player) => [player.id, player]));
  const teamsById = new Map(teams.map((team) => [team.id, team]));
  const sessionsById = new Map(sessions.map((session) => [session.id, session]));

  const sessionsInWindow = sessions.filter((session) => {
    const scheduledAt = asDate(session.scheduledFor);
    return scheduledAt >= previousStart && scheduledAt <= end;
  });

  // Las métricas se leen por lote para evitar una consulta por jugador/sesión en el dashboard.
  const allRelevantMetrics = await deps.sessionMetrics.listMetrics({
    accountId: context.accountId,
    sessionIds: sessionsInWindow.map((session) => session.id),
  });

  // El dashboard mezcla roster actual con lesiones por jugador para producir estado operativo por equipo.
  const [rosters, injuriesByPlayer] = await Promise.all([
    Promise.all(teams.map((team) => deps.teamPlayers.listTeamPlayers(context.accountId, team.id))),
    Promise.all(players.map(async (player) => ({
      playerId: player.id,
      injuries: await deps.injuries.listInjuriesForPlayer(context.accountId, player.id),
    }))),
  ]);

  const rosterPlayerIdsByTeam = new Map<string, Set<string>>();
  for (let index = 0; index < teams.length; index += 1) {
    rosterPlayerIdsByTeam.set(teams[index].id, new Set(rosters[index].map((entry) => entry.playerId)));
  }

  const currentSessions = sessionsInWindow.filter((session) => {
    const scheduledAt = asDate(session.scheduledFor);
    return scheduledAt >= start && scheduledAt <= end;
  });
  const previousSessions = sessionsInWindow.filter((session) => {
    const scheduledAt = asDate(session.scheduledFor);
    return scheduledAt >= previousStart && scheduledAt <= previousEnd;
  });

  const metricsBySession = groupMetricsBySession(allRelevantMetrics);
  const uploadPlayerSetsBySession = new Map<string, Set<string>>();
  let processedUploads = 0;
  let pendingUploads = 0;
  let sampleCount = 0;

  // Se resume la telemetría por sesión y jugador para medir cobertura, no sólo volumen de uploads.
  for (const upload of uploads) {
    sampleCount += upload.sampleCount;
    if (upload.processedAt) {
      processedUploads += 1;
    } else {
      pendingUploads += 1;
    }
    if (!upload.sessionId || !upload.playerId) continue;
    const playerSet = uploadPlayerSetsBySession.get(upload.sessionId) ?? new Set<string>();
    playerSet.add(upload.playerId);
    uploadPlayerSetsBySession.set(upload.sessionId, playerSet);
  }
  const uploadCountsBySession = new Map<string, number>();
  for (const [sessionId, playerSet] of uploadPlayerSetsBySession.entries()) {
    uploadCountsBySession.set(sessionId, playerSet.size);
  }

  const currentAggregates = createSessionAggregates({
    sessions: currentSessions,
    metricsBySession,
    uploadsBySession: uploadCountsBySession,
  });
  const previousAggregates = createSessionAggregates({
    sessions: previousSessions,
    metricsBySession,
    uploadsBySession: uploadCountsBySession,
  });

  const activePlayersCurrent = new Set<string>();
  const activePlayersPrevious = new Set<string>();
  for (const session of currentSessions) {
    for (const playerId of session.playerIds) activePlayersCurrent.add(playerId);
  }
  for (const session of previousSessions) {
    for (const playerId of session.playerIds) activePlayersPrevious.add(playerId);
  }
  for (const upload of uploads) {
    if (!upload.playerId || !upload.sessionId) continue;
    const session = sessionsById.get(upload.sessionId);
    if (!session) continue;
    const scheduledAt = asDate(session.scheduledFor);
    if (scheduledAt >= start && scheduledAt <= end) {
      activePlayersCurrent.add(upload.playerId);
    }
    if (scheduledAt >= previousStart && scheduledAt <= previousEnd) {
      activePlayersPrevious.add(upload.playerId);
    }
  }

  const allInjuries = injuriesByPlayer.flatMap(({ playerId, injuries }) =>
    injuries.map((injury) => ({ playerId, injury })),
  );
  const activeInjuries = allInjuries.filter(({ injury }) => injury.status === "injured");
  const recoveringInjuries = allInjuries.filter(({ injury }) => injury.status === "recovering");

  const playerLoadsCurrent = new Map<string, number>();
  const playerLoadsPrevious = new Map<string, number>();

  // La carga se agrega por jugador para detectar picos relativos frente a la ventana anterior.
  for (const metric of allRelevantMetrics) {
    const session = sessionsInWindow.find((candidate) => candidate.id === metric.sessionId);
    if (!session) continue;
    const loadIndex = computeLoadIndex(metric) ?? 0;
    const scheduledAt = asDate(session.scheduledFor);
    if (scheduledAt >= start && scheduledAt <= end) {
      playerLoadsCurrent.set(metric.playerId, (playerLoadsCurrent.get(metric.playerId) ?? 0) + loadIndex);
    }
    if (scheduledAt >= previousStart && scheduledAt <= previousEnd) {
      playerLoadsPrevious.set(metric.playerId, (playerLoadsPrevious.get(metric.playerId) ?? 0) + loadIndex);
    }
  }

  const currentLoadValues = Array.from(playerLoadsCurrent.values());
  const loadThreshold = average(currentLoadValues) * 1.35;
  const alerts: DashboardAlert[] = [];

  // Las alertas se priorizan por salud, luego por picos de carga y por último por huecos de telemetría.
  for (const { playerId, injury } of activeInjuries) {
    const playerName = playersById.get(playerId)?.displayName;
    alerts.push({
      id: `injury:${injury.id}`,
      level: "high",
      playerId,
      playerName,
      kind: "injury",
    });
  }
  for (const { playerId, injury } of recoveringInjuries) {
    const playerName = playersById.get(playerId)?.displayName;
    alerts.push({
      id: `recovery:${injury.id}`,
      level: "medium",
      playerId,
      playerName,
      kind: "recovery",
    });
  }
  for (const [playerId, currentLoad] of playerLoadsCurrent.entries()) {
    const previousLoad = playerLoadsPrevious.get(playerId) ?? 0;
    if (currentLoad > loadThreshold || (previousLoad > 0 && currentLoad > previousLoad * 1.4)) {
      const playerName = playersById.get(playerId)?.displayName;
      alerts.push({
        id: `load:${playerId}`,
        level: currentLoad > loadThreshold * 1.2 ? "high" : "medium",
        playerId,
        playerName,
        kind: "load-spike",
        value: Math.round(currentLoad),
      });
    }
  }

  for (const session of currentSessions) {
    const telemetryPlayers = uploadPlayerSetsBySession.get(session.id)?.size ?? 0;
    if (session.playerIds.length > 0 && telemetryPlayers === 0) {
      const teamName = session.teamId ? teamsById.get(session.teamId)?.name : undefined;
      alerts.push({
        id: `telemetry-gap:${session.id}`,
        level: "info",
        teamId: session.teamId,
        teamName,
        sessionId: session.id,
        sessionScheduledFor: session.scheduledFor,
        kind: "telemetry-gap",
      });
    }
  }

  const teamSummaries = teams.map<DashboardTeamSummary>((team) => {
    const roster = rosterPlayerIdsByTeam.get(team.id) ?? new Set<string>();
    const teamCurrent = currentAggregates.filter((aggregate) => aggregate.session.teamId === team.id);
    const teamPrevious = previousAggregates.filter((aggregate) => aggregate.session.teamId === team.id);
    const activePlayers = new Set<string>();
    for (const aggregate of teamCurrent) {
      for (const playerId of aggregate.session.playerIds) activePlayers.add(playerId);
    }

    const activeInjuryCount = activeInjuries.filter(({ playerId }) => roster.has(playerId)).length;
    const recoveringCount = recoveringInjuries.filter(({ playerId }) => roster.has(playerId)).length;
    const teamCurrentLoads = teamCurrent.map((aggregate) => aggregate.loadIndex);

    return {
      team,
      playerCount: roster.size,
      activePlayers: activePlayers.size,
      sessionCount: teamCurrent.length,
      telemetrySessionCount: teamCurrent.filter((aggregate) => aggregate.telemetryPlayerCount > 0).length,
      activeInjuries: activeInjuryCount,
      recoveringPlayers: recoveringCount,
      averageLoadIndex: Math.round(average(teamCurrentLoads)),
      deltaLoadIndex: Math.round(sumMetricLoad(teamCurrent.flatMap((aggregate) => aggregate.metrics)) - sumMetricLoad(teamPrevious.flatMap((aggregate) => aggregate.metrics))),
      totalDistanceMeters: Math.round(teamCurrent.reduce((sum, aggregate) => sum + aggregate.totalDistanceMeters, 0)),
    };
  }).sort((left, right) => right.averageLoadIndex - left.averageLoadIndex);

  // Se limita el detalle de sesiones para mantener el panel ejecutivo compacto.
  const recentSessions = currentAggregates
    .slice()
    .sort((left, right) => (left.session.scheduledFor < right.session.scheduledFor ? 1 : -1))
    .slice(0, 6)
    .map<DashboardSessionSummary>((aggregate) => {
      const previousComparable = previousAggregates.find(
        (candidate) => candidate.session.teamId === aggregate.session.teamId && candidate.session.kind === aggregate.session.kind,
      );
      return {
        sessionId: aggregate.session.id,
        teamId: aggregate.session.teamId,
        kind: aggregate.session.kind,
        scheduledFor: aggregate.session.scheduledFor,
        playerCount: aggregate.session.playerIds.length,
        telemetryPlayerCount: aggregate.telemetryPlayerCount,
        loadIndex: aggregate.loadIndex,
        deltaLoadIndex: aggregate.loadIndex - (previousComparable?.loadIndex ?? 0),
        totalDistanceMeters: Math.round(aggregate.totalDistanceMeters),
      };
    });

  const sessionsWithTelemetry = currentSessions.filter(
    (session) => (uploadPlayerSetsBySession.get(session.id)?.size ?? 0) > 0,
  ).length;

  // Readiness es una heurística operativa simple, no un score médico formal.
  const readinessCurrent = players.length === 0
    ? 0
    : ((players.length - activeInjuries.length - recoveringInjuries.length * 0.5) / players.length) * 100;
  const readinessPrevious = players.length === 0
    ? 0
    : ((players.length - recoveringInjuries.length * 0.25) / players.length) * 100;

  return {
    generatedAt: now.toISOString(),
    range: {
      from: start.toISOString(),
      to: end.toISOString(),
      previousFrom: previousStart.toISOString(),
      previousTo: previousEnd.toISOString(),
      days,
    },
    readiness: createMetricComparison(clampPercent(readinessCurrent), clampPercent(readinessPrevious)),
    activePlayers: createMetricComparison(activePlayersCurrent.size, activePlayersPrevious.size),
    trainingLoad: createMetricComparison(
      Math.round(currentAggregates.reduce((sum, aggregate) => sum + aggregate.loadIndex, 0)),
      Math.round(previousAggregates.reduce((sum, aggregate) => sum + aggregate.loadIndex, 0)),
    ),
    riskAlerts: createMetricComparison(alerts.length, Math.max(0, recoveringInjuries.length)),
    sessions: createMetricComparison(currentSessions.length, previousSessions.length),
    telemetryCoverage: createMetricComparison(
      currentSessions.length === 0 ? 0 : clampPercent((sessionsWithTelemetry / currentSessions.length) * 100),
      previousSessions.length === 0
        ? 0
        : clampPercent((previousSessions.filter((session) => (uploadPlayerSetsBySession.get(session.id)?.size ?? 0) > 0).length / previousSessions.length) * 100),
    ),
    totalDistance: createMetricComparison(
      Math.round(currentAggregates.reduce((sum, aggregate) => sum + aggregate.totalDistanceMeters, 0)),
      Math.round(previousAggregates.reduce((sum, aggregate) => sum + aggregate.totalDistanceMeters, 0)),
    ),
    totalTeams: teams.length,
    totalPlayers: players.length,
    telemetry: {
      processedUploads,
      pendingUploads,
      sessionsWithTelemetry,
      sessionsWithoutTelemetry: Math.max(0, currentSessions.length - sessionsWithTelemetry),
      sampleCount,
    },
    trend: toTrend({ from: start, sessions: currentAggregates }),
    teamSummaries,
    alerts: alerts.slice(0, 6),
    recentSessions,
  };
}