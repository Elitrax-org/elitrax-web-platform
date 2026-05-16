/**
 * Single in-memory store backing the in-memory adapters.
 *
 * Used by tests, the UI scaffold without Supabase env, and as a reference
 * implementation for the real Supabase repositories. The store is a module
 * singleton scoped to the current process so it survives between hot
 * reloads in dev.
 */

import { randomUUID } from "node:crypto";

import {
  planCatalog,
  type PlanTier,
} from "@/domain/billing/feature-entitlement-policy";

import type {
  AccountMembership,
  AccountSubscription,
  AccountSummary,
  GymExerciseLogRecord,
  Injury,
  Invitation,
  MatchEvent,
  Player,
  PlayerComment,
  HeatmapTileRecord,
  PlayerMeasurement,
  RecommendationRun,
  SessionPlayerMetric,
  TeamPlayer,
  TelemetryUpload,
  Team,
  TrainingSession,
} from "@/application/domain-types";

type TelemetrySamplePersisted = {
  readonly capturedAt: string;
  readonly latitude?: number;
  readonly longitude?: number;
  readonly heartRate?: number;
  readonly speedMps?: number;
};

type Store = {
  accounts: Map<string, AccountSummary>;
  memberships: AccountMembership[];
  invitations: Invitation[];
  subscriptions: Map<string, AccountSubscription>;
  teams: Team[];
  players: Player[];
  teamPlayers: TeamPlayer[];
  injuries: Injury[];
  comments: PlayerComment[];
  measurements: PlayerMeasurement[];
  sessions: TrainingSession[];
  matchEvents: MatchEvent[];
  gymLogs: GymExerciseLogRecord[];
  uploads: TelemetryUpload[];
  samples: Map<string, TelemetrySamplePersisted[]>;
  sessionMetrics: SessionPlayerMetric[];
  heatmapTiles: HeatmapTileRecord[];
  recommendations: RecommendationRun[];
};

const globalKey = "__elitraxInMemoryStore__";

function makeFreshStore(): Store {
  return {
    accounts: new Map(),
    memberships: [],
    invitations: [],
    subscriptions: new Map(),
    teams: [],
    players: [],
    teamPlayers: [],
    injuries: [],
    comments: [],
    measurements: [],
    sessions: [],
    matchEvents: [],
    gymLogs: [],
    uploads: [],
    samples: new Map(),
    sessionMetrics: [],
    heatmapTiles: [],
    recommendations: [],
  };
}

export function getStore(): Store {
  const globalAny = globalThis as Record<string, unknown>;
  if (!globalAny[globalKey]) {
    globalAny[globalKey] = makeFreshStore();
  }
  return globalAny[globalKey] as Store;
}

export function resetStore(): void {
  const globalAny = globalThis as Record<string, unknown>;
  globalAny[globalKey] = makeFreshStore();
}

export function newId(): string {
  return randomUUID();
}

export function nowIso(): string {
  return new Date().toISOString();
}

export function defaultEntitlementsForTier(tier: PlanTier) {
  return planCatalog[tier];
}
