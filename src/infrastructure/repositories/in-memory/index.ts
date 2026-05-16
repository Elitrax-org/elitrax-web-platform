import type {
  AccountRepository,
  CommentRepository,
  GymExerciseLogRepository,
  HeatmapTileRepository,
  InjuryRepository,
  PlayerMeasurementRepository,
  PlayerRepository,
  RecommendationRepository,
  SessionRepository,
  SessionPlayerMetricRepository,
  SubscriptionRepository,
  TeamPlayerRepository,
  TeamRepository,
  TelemetryRepository,
} from "../../../application/ports/repositories";
import type { ApplicationDependencies } from "../../../application/ports/repositories";
import {
  ConflictError,
  NotFoundError,
} from "@/lib/errors";

import {
  defaultEntitlementsForTier,
  getStore,
  newId,
  nowIso,
} from "./store";
import { formatInjuryCommentSummary } from "@/infrastructure/repositories/injury-comment";

/**
 * Adaptadores in-memory usados en desarrollo local y tests rápidos.
 *
 * Mantienen comportamiento equivalente a los puertos de persistencia sin
 * depender de servicios externos.
 */

export const inMemoryAccountRepository: AccountRepository = {
  async createAccount({ type, displayName, ownerUserId, address, contact, billing }) {
    const store = getStore();

    // El adaptador in-memory replica el bootstrap real: cuenta, membresía owner y suscripción base.
    const account = {
      id: newId(),
      type,
      displayName: displayName.trim(),
      ownerUserId,
      address,
      contact,
      billing,
      createdAt: nowIso(),
    };
    store.accounts.set(account.id, account);
    store.memberships.push({
      accountId: account.id,
      userId: ownerUserId,
      role: "owner",
      joinedAt: account.createdAt,
    });
    const tier = "basic";
    store.subscriptions.set(account.id, {
      accountId: account.id,
      tier,
      entitlements: defaultEntitlementsForTier(tier),
      status: "active",
    });
    return account;
  },
  async getAccount(accountId) {
    return getStore().accounts.get(accountId) ?? null;
  },
  async listMemberships(userId) {
    return getStore().memberships.filter((m) => m.userId === userId);
  },
  async getMembership(accountId, userId) {
    return (
      getStore().memberships.find(
        (m) => m.accountId === accountId && m.userId === userId,
      ) ?? null
    );
  },
  async countMembers(accountId) {
    return getStore().memberships.filter((m) => m.accountId === accountId).length;
  },
  async addMember({ accountId, userId, role }) {
    const store = getStore();
    const membership = { accountId, userId, role, joinedAt: nowIso() };
    store.memberships.push(membership);
    return membership;
  },
  async createInvitation({ accountId, email, role, expiresAt }) {
    const store = getStore();
    const invitation = {
      id: newId(),
      accountId,
      email: email.trim().toLowerCase(),
      role,
      token: newId(),
      expiresAt,
    };
    store.invitations.push(invitation);
    return invitation;
  },
};

/** Repositorio in-memory de suscripciones y contadores de cupo. */
export const inMemorySubscriptionRepository: SubscriptionRepository = {
  async getSubscription(accountId) {
    return getStore().subscriptions.get(accountId) ?? null;
  },
  async upsertSubscription(input) {
    const next = { ...input, entitlements: defaultEntitlementsForTier(input.tier) };
    getStore().subscriptions.set(input.accountId, next);
    return next;
  },
  async countTeams(accountId) {
    return getStore().teams.filter((t) => t.accountId === accountId).length;
  },
  async countPlayers(accountId) {
    return getStore().players.filter((p) => p.accountId === accountId).length;
  },
};

/** Repositorio in-memory de equipos. */
export const inMemoryTeamRepository: TeamRepository = {
  async createTeam(accountId, input) {
    const store = getStore();

    // Mantiene el mismo shape que Prisma para que tests ejerzan exactamente los mismos use-cases.
    const team = {
      id: newId(),
      accountId,
      name: input.name.trim(),
      sportType: input.sportType,
      fieldLengthMeters: input.fieldLengthMeters,
      fieldWidthMeters: input.fieldWidthMeters,
      createdAt: nowIso(),
    };
    store.teams.push(team);
    return team;
  },
  async listTeams(accountId) {
    return getStore().teams.filter((t) => t.accountId === accountId);
  },
  async getTeam(accountId, teamId) {
    return (
      getStore().teams.find((t) => t.accountId === accountId && t.id === teamId) ??
      null
    );
  },
  async updateTeam(accountId, teamId, input) {
    const store = getStore();
    const index = store.teams.findIndex((t) => t.accountId === accountId && t.id === teamId);
    if (index < 0) throw new NotFoundError("team");

    const current = store.teams[index];
    const updated = {
      ...current,
      name: input.name?.trim() ?? current.name,
      sportType: input.sportType ?? current.sportType,
      fieldLengthMeters: input.fieldLengthMeters,
      fieldWidthMeters: input.fieldWidthMeters,
    };

    store.teams[index] = updated;
    return updated;
  },
};

/** Repositorio in-memory de jugadores. */
export const inMemoryPlayerRepository: PlayerRepository = {
  async createPlayer(accountId, input) {
    const store = getStore();

    // El adapter evita lógica implícita: persiste los mismos campos ya normalizados por la capa de aplicación.
    const player = {
      id: newId(),
      accountId,
      displayName: input.displayName.trim(),
      birthDate: input.birthDate,
      position: input.position,
      metadata: input.metadata ?? {},
      createdAt: nowIso(),
    };
    store.players.push(player);
    return player;
  },
  async deletePlayer(accountId, playerId) {
    const store = getStore();
    store.players = store.players.filter(
      (player) => !(player.accountId === accountId && player.id === playerId),
    );
    store.teamPlayers = store.teamPlayers.filter(
      (membership) => !(membership.accountId === accountId && membership.playerId === playerId),
    );
    store.comments = store.comments.filter(
      (comment) => !(comment.accountId === accountId && comment.playerId === playerId),
    );
    store.injuries = store.injuries.filter(
      (injury) => !(injury.accountId === accountId && injury.playerId === playerId),
    );
    store.measurements = store.measurements.filter(
      (measurement) => !(measurement.accountId === accountId && measurement.playerId === playerId),
    );
  },
  async listPlayers(accountId) {
    return getStore().players.filter((p) => p.accountId === accountId);
  },
  async getPlayer(accountId, playerId) {
    return (
      getStore().players.find(
        (p) => p.accountId === accountId && p.id === playerId,
      ) ?? null
    );
  },
};

/** Repositorio in-memory de relación equipo-jugador (roster). */
export const inMemoryTeamPlayerRepository: TeamPlayerRepository = {
  async addPlayerToTeam({ accountId, teamId, playerId, data }) {
    const store = getStore();

    // Reproduce validaciones funcionales clave para que los tests detecten conflictos igual que en Prisma.
    const player = store.players.find(
      (entry) => entry.id === playerId && entry.accountId === accountId,
    );
    if (!player) throw new NotFoundError("player");

    const team = store.teams.find(
      (entry) => entry.id === teamId && entry.accountId === accountId,
    );
    if (!team) throw new NotFoundError("team");

    const existingMembership = store.teamPlayers.find(
      (entry) =>
        entry.accountId === accountId &&
        entry.teamId === teamId &&
        entry.playerId === playerId,
    );
    if (existingMembership) {
      throw new ConflictError("player is already assigned to team");
    }

    if (data.jerseyNumber) {
      const duplicatedJersey = store.teamPlayers.find(
        (entry) =>
          entry.accountId === accountId &&
          entry.teamId === teamId &&
          entry.jerseyNumber === data.jerseyNumber,
      );
      if (duplicatedJersey) {
        throw new ConflictError("jersey number already used by team");
      }
    }

    const membership = {
      accountId,
      teamId,
      playerId,
      jerseyNumber: data.jerseyNumber,
      joinedAt: nowIso(),
    };
    store.teamPlayers.push(membership);
    return {
      ...membership,
      player,
    };
  },

  async listTeamPlayers(accountId, teamId) {
    const store = getStore();
    return store.teamPlayers
      .filter((entry) => entry.accountId === accountId && entry.teamId === teamId)
      .map((entry) => {
        const player = store.players.find(
          (candidate) =>
            candidate.id === entry.playerId && candidate.accountId === accountId,
        );
        if (!player) {
          throw new NotFoundError("player");
        }
        return {
          ...entry,
          player,
        };
      })
      .sort((a, b) => (a.joinedAt < b.joinedAt ? -1 : 1));
  },

  async updateTeamPlayer({ accountId, teamId, playerId, data }) {
    const store = getStore();
    const index = store.teamPlayers.findIndex(
      (entry) =>
        entry.accountId === accountId &&
        entry.teamId === teamId &&
        entry.playerId === playerId,
    );
    if (index < 0) throw new NotFoundError("team_player");

    if (data.jerseyNumber) {
      const duplicatedJersey = store.teamPlayers.find(
        (entry) =>
          entry.accountId === accountId &&
          entry.teamId === teamId &&
          entry.playerId !== playerId &&
          entry.jerseyNumber === data.jerseyNumber,
      );
      if (duplicatedJersey) {
        throw new ConflictError("jersey number already used by team");
      }
    }

    const updated = {
      ...store.teamPlayers[index],
      jerseyNumber: data.jerseyNumber,
    };
    store.teamPlayers[index] = updated;

    const player = store.players.find(
      (entry) => entry.id === playerId && entry.accountId === accountId,
    );
    if (!player) throw new NotFoundError("player");
    return {
      ...updated,
      player,
    };
  },

  async removeTeamPlayer(accountId, teamId, playerId) {
    const store = getStore();
    const before = store.teamPlayers.length;
    store.teamPlayers = store.teamPlayers.filter(
      (entry) =>
        !(
          entry.accountId === accountId &&
          entry.teamId === teamId &&
          entry.playerId === playerId
        ),
    );
    if (store.teamPlayers.length === before) {
      throw new NotFoundError("team_player");
    }
  },
};

/** Repositorio in-memory de lesiones con bitácora en comentarios. */
export const inMemoryInjuryRepository: InjuryRepository = {
  async logInjury({ accountId, playerId, authorUserId, data }) {
    const store = getStore();
    const injuryId = newId();
    const injury = {
      id: injuryId,
      accountId,
      playerId,
      diagnosedAt: data.diagnosedAt,
      status: data.status,
      estimatedRecoveryAt: data.estimatedRecoveryAt,
      resolvedAt: data.resolvedAt,
      bodyRegion: data.bodyRegion,
      bodyZoneDetail: data.bodyZoneDetail,
      severity: data.severity,
      description: data.description,
    };
    store.injuries.push(injury);
    store.comments.push({
      id: newId(),
      accountId,
      playerId,
      injuryId,
      authorUserId,
      body: formatInjuryCommentSummary({
        description: injury.description,
        status: injury.status,
        estimatedRecoveryAt: injury.estimatedRecoveryAt,
        injuryComment: data.injuryComment,
      }),
      createdAt: nowIso(),
    });
    return injury;
  },
  async updateInjury({ accountId, playerId, injuryId, authorUserId, data }) {
    const store = getStore();
    const idx = store.injuries.findIndex(
      (injury) =>
        injury.id === injuryId &&
        injury.accountId === accountId &&
        injury.playerId === playerId,
    );
    if (idx < 0) {
      throw new Error("injury not found");
    }
    const current = store.injuries[idx];
    const updated = {
      ...current,
      diagnosedAt: data.diagnosedAt ?? current.diagnosedAt,
      status: data.status ?? current.status,
      estimatedRecoveryAt: data.estimatedRecoveryAt ?? current.estimatedRecoveryAt,
      resolvedAt: data.resolvedAt ?? current.resolvedAt,
      bodyRegion: data.bodyRegion ?? current.bodyRegion,
      bodyZoneDetail: data.bodyZoneDetail ?? current.bodyZoneDetail,
      severity: data.severity ?? current.severity,
      description: data.description ?? current.description,
    };
    store.injuries[idx] = updated;
    store.comments.push({
      id: newId(),
      accountId,
      playerId,
      injuryId,
      authorUserId,
      body: formatInjuryCommentSummary({
        description: updated.description,
        status: updated.status,
        estimatedRecoveryAt: updated.estimatedRecoveryAt,
        injuryComment: data.injuryComment,
      }),
      createdAt: nowIso(),
    });
    return updated;
  },
  async listInjuriesForPlayer(accountId, playerId) {
    return getStore().injuries.filter(
      (i) => i.accountId === accountId && i.playerId === playerId,
    );
  },

  async deleteInjury({ accountId, playerId, injuryId }) {
    const store = getStore();
    store.injuries = store.injuries.filter(
      (injury) =>
        !(
          injury.id === injuryId &&
          injury.accountId === accountId &&
          injury.playerId === playerId
        ),
    );
  },
};

/** Repositorio in-memory de comentarios de jugadores. */
export const inMemoryCommentRepository: CommentRepository = {
  async postComment({ accountId, playerId, authorUserId, injuryId, data }) {
    const store = getStore();
    const comment = {
      id: newId(),
      accountId,
      playerId,
      injuryId,
      authorUserId,
      body: data.body.trim(),
      createdAt: nowIso(),
    };
    store.comments.push(comment);
    return comment;
  },
  async listComments(accountId, playerId) {
    return getStore()
      .comments.filter(
        (c) => c.accountId === accountId && c.playerId === playerId,
      )
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  },
  async getComment(accountId, playerId, commentId) {
    return (
      getStore().comments.find(
        (c) =>
          c.accountId === accountId &&
          c.playerId === playerId &&
          c.id === commentId,
      ) ?? null
    );
  },
  async updateComment({ accountId, playerId, commentId, data }) {
    const store = getStore();
    const idx = store.comments.findIndex(
      (c) =>
        c.accountId === accountId &&
        c.playerId === playerId &&
        c.id === commentId,
    );
    if (idx < 0) {
      throw new Error("comment not found");
    }
    const updated = {
      ...store.comments[idx],
      body: data.body.trim(),
    };
    store.comments[idx] = updated;
    return updated;
  },
  async deleteComment(accountId, playerId, commentId) {
    const store = getStore();
    store.comments = store.comments.filter(
      (c) =>
        !(
          c.accountId === accountId &&
          c.playerId === playerId &&
          c.id === commentId
        ),
    );
  },
};

/** Repositorio in-memory de mediciones físicas. */
export const inMemoryPlayerMeasurementRepository: PlayerMeasurementRepository = {
  async recordMeasurement({ accountId, playerId, data }) {
    const store = getStore();
    const measurement = {
      id: newId(),
      accountId,
      playerId,
      takenAt: data.takenAt ?? nowIso(),
      heightCentimeters: data.heightCentimeters,
      weightKilograms: data.weightKilograms,
      bodyFatPercentage: data.bodyFatPercentage,
      notes: data.notes,
    };
    store.measurements.push(measurement);
    return measurement;
  },
  async listMeasurements(accountId, playerId) {
    return getStore()
      .measurements.filter(
        (m) => m.accountId === accountId && m.playerId === playerId,
      )
      .sort((a, b) => (a.takenAt < b.takenAt ? -1 : 1));
  },
};

/** Repositorio in-memory de sesiones y eventos de partido. */
export const inMemorySessionRepository: SessionRepository = {
  async createSession(accountId, input) {
    const store = getStore();
    const session = {
      id: newId(),
      accountId,
      teamId: input.teamId,
      kind: input.kind,
      scheduledFor: input.scheduledFor,
      durationSeconds: input.durationSeconds,
      notes: input.notes,
      createdAt: nowIso(),
      playerIds: input.playerIds ?? [],
    };
    store.sessions.push(session);
    return session;
  },
  async listSessions(accountId) {
    return getStore()
      .sessions.filter((s) => s.accountId === accountId)
      .sort((a, b) => (a.scheduledFor < b.scheduledFor ? 1 : -1));
  },
  async getSession(accountId, sessionId) {
    return (
      getStore().sessions.find(
        (s) => s.accountId === accountId && s.id === sessionId,
      ) ?? null
    );
  },
  async appendMatchEvent(input) {
    const store = getStore();
    const event = {
      id: newId(),
      accountId: input.accountId,
      sessionId: input.sessionId,
      occurredAt: input.occurredAt,
      matchMinute: input.matchMinute,
      kind: input.kind,
      playerId: input.playerId,
      payload: input.payload ?? {},
    };
    store.matchEvents.push(event);
    return event;
  },
  async listMatchEvents(accountId, sessionId) {
    return getStore()
      .matchEvents.filter(
        (e) => e.accountId === accountId && e.sessionId === sessionId,
      )
      .sort((a, b) => (a.occurredAt < b.occurredAt ? -1 : 1));
  },
};

/** Repositorio in-memory de logs de gimnasio. */
export const inMemoryGymLogRepository: GymExerciseLogRepository = {
  async logExercise({ accountId, sessionId, data }) {
    const store = getStore();
    const record = {
      id: newId(),
      accountId,
      sessionId,
      playerId: data.playerId,
      exerciseId: data.exerciseId.trim(),
      performedAt: data.performedAt ?? nowIso(),
      sets: data.sets.map((s) => ({
        weightKilograms: s.weightKilograms,
        repetitions: s.repetitions,
        rpe: s.rpe,
      })),
    };
    store.gymLogs.push(record);
    return record;
  },
  async listForSession(accountId, sessionId) {
    return getStore()
      .gymLogs.filter(
        (g) => g.accountId === accountId && g.sessionId === sessionId,
      )
      .sort((a, b) => (a.performedAt < b.performedAt ? -1 : 1));
  },
};

/** Repositorio in-memory de uploads/muestras de telemetría. */
export const inMemoryTelemetryRepository: TelemetryRepository = {
  async registerUpload(accountId, input) {
    const store = getStore();
    const upload = {
      id: newId(),
      accountId,
      source: input.source,
      storagePath: input.storagePath,
      sessionId: input.sessionId,
      playerId: input.playerId,
      uploadedAt: nowIso(),
      processedAt: undefined,
      sampleCount: 0,
    };
    store.uploads.push(upload);
    return upload;
  },
  async ingestBatch({ accountId, data }) {
    const store = getStore();
    const upload = store.uploads.find(
      (u) => u.accountId === accountId && u.id === data.uploadId,
    );
    if (!upload) {
      throw new Error("upload not found");
    }
    const persisted = data.samples.map((sample) => ({
      capturedAt: sample.capturedAt,
      latitude: sample.latitude,
      longitude: sample.longitude,
      heartRate: sample.heartRate,
      speedMps: sample.speedMps,
    }));
    const existing = store.samples.get(upload.id) ?? [];
    store.samples.set(upload.id, [...existing, ...persisted]);
    const updated = {
      ...upload,
      processedAt: nowIso(),
      sampleCount: existing.length + persisted.length,
    };
    const idx = store.uploads.findIndex((u) => u.id === upload.id);
    store.uploads[idx] = updated;
    return updated;
  },
  async listUploads(accountId) {
    return getStore()
      .uploads.filter((u) => u.accountId === accountId)
      .sort((a, b) => (a.uploadedAt < b.uploadedAt ? 1 : -1));
  },
  async getRawSamples(accountId, uploadId) {
    const store = getStore();
    const upload = store.uploads.find(
      (u) => u.accountId === accountId && u.id === uploadId,
    );
    if (!upload) return [];
    return store.samples.get(uploadId) ?? [];
  },
  async listUploadsForSessionPlayer({ accountId, sessionId, playerId }) {
    return getStore()
      .uploads.filter(
        (upload) =>
          upload.accountId === accountId &&
          upload.sessionId === sessionId &&
          (playerId === undefined || upload.playerId === playerId),
      )
      .sort((a, b) => (a.uploadedAt < b.uploadedAt ? 1 : -1));
  },
};

export const inMemorySessionPlayerMetricRepository: SessionPlayerMetricRepository = {
  async getMetric({ accountId, sessionId, playerId }) {
    return (
      getStore().sessionMetrics.find(
        (metric) =>
          metric.accountId === accountId &&
          metric.sessionId === sessionId &&
          metric.playerId === playerId,
      ) ?? null
    );
  },
  // Mantiene la misma semántica del repositorio Prisma para que tests y modo dev ejerciten el mismo caso de uso.
  async listMetrics({ accountId, sessionIds, playerIds }) {
    if (sessionIds && sessionIds.length === 0) {
      return [];
    }
    if (playerIds && playerIds.length === 0) {
      return [];
    }

    const sessionIdSet = sessionIds ? new Set(sessionIds) : null;
    const playerIdSet = playerIds ? new Set(playerIds) : null;

    return getStore()
      .sessionMetrics.filter(
        (metric) =>
          metric.accountId === accountId &&
          (sessionIdSet === null || sessionIdSet.has(metric.sessionId)) &&
          (playerIdSet === null || playerIdSet.has(metric.playerId)),
      )
      .sort((left, right) => (left.computedAt < right.computedAt ? 1 : -1));
  },
  async upsertMetric(input) {
    const store = getStore();
    const index = store.sessionMetrics.findIndex(
      (metric) =>
        metric.accountId === input.accountId &&
        metric.sessionId === input.sessionId &&
        metric.playerId === input.playerId,
    );
    const next = {
      id: index >= 0 ? store.sessionMetrics[index].id : newId(),
      accountId: input.accountId,
      sessionId: input.sessionId,
      playerId: input.playerId,
      totalDistanceMeters: input.totalDistanceMeters,
      totalDurationSeconds: input.totalDurationSeconds,
      averageSpeedMps: input.averageSpeedMps,
      maxSpeedMps: input.maxSpeedMps,
      zones: input.zones,
      computedAt: nowIso(),
    };
    if (index >= 0) {
      store.sessionMetrics[index] = next;
    } else {
      store.sessionMetrics.push(next);
    }
    return next;
  },
};

export const inMemoryHeatmapTileRepository: HeatmapTileRepository = {
  async listTiles({ accountId, sessionId, playerId }) {
    return getStore()
      .heatmapTiles.filter(
        (tile) =>
          tile.accountId === accountId &&
          tile.sessionId === sessionId &&
          (playerId === undefined ? tile.playerId === undefined : tile.playerId === playerId),
      )
      .sort((a, b) => {
        if (a.tileY !== b.tileY) return a.tileY - b.tileY;
        return a.tileX - b.tileX;
      });
  },
  async replaceTiles(input) {
    const store = getStore();
    store.heatmapTiles = store.heatmapTiles.filter(
      (tile) =>
        !(
          tile.accountId === input.accountId &&
          tile.sessionId === input.sessionId &&
          (input.playerId === undefined ? tile.playerId === undefined : tile.playerId === input.playerId)
        ),
    );
    const next = input.tiles.map((tile) => ({
      id: newId(),
      accountId: input.accountId,
      sessionId: input.sessionId,
      playerId: input.playerId,
      tileX: tile.tileX,
      tileY: tile.tileY,
      intensity: tile.intensity,
      computedAt: nowIso(),
    }));
    store.heatmapTiles.push(...next);
    return next;
  },
};

/** Repositorio in-memory de corridas de recomendación AI. */
export const inMemoryRecommendationRepository: RecommendationRepository = {
  async recordRun({ accountId, requestedBy, model, candidates }) {
    const store = getStore();
    const run = {
      id: newId(),
      accountId,
      requestedBy,
      status: "succeeded" as const,
      model,
      createdAt: nowIso(),
      completedAt: nowIso(),
      candidates,
    };
    store.recommendations.push(run);
    return run;
  },
  async listRuns(accountId) {
    return getStore()
      .recommendations.filter((r) => r.accountId === accountId)
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  },
};

/** Ensambla todas las dependencias de persistencia en modo in-memory. */
export function buildInMemoryDependencies(): ApplicationDependencies {
  return {
    accounts: inMemoryAccountRepository,
    subscriptions: inMemorySubscriptionRepository,
    teams: inMemoryTeamRepository,
    players: inMemoryPlayerRepository,
    teamPlayers: inMemoryTeamPlayerRepository,
    injuries: inMemoryInjuryRepository,
    comments: inMemoryCommentRepository,
    measurements: inMemoryPlayerMeasurementRepository,
    sessions: inMemorySessionRepository,
    gymLogs: inMemoryGymLogRepository,
    telemetry: inMemoryTelemetryRepository,
    sessionMetrics: inMemorySessionPlayerMetricRepository,
    heatmaps: inMemoryHeatmapTileRepository,
    recommendations: inMemoryRecommendationRepository,
  };
}
