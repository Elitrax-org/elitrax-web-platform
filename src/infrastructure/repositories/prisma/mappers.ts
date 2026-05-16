import type {
  account_members as AccountMemberRow,
  accounts as AccountRow,
  gym_exercise_logs as GymExerciseLogRow,
  heatmap_tiles as HeatmapTileRow,
  injuries as InjuryRow,
  invitations as InvitationRow,
  match_events as MatchEventRow,
  player_comments as PlayerCommentRow,
  player_measurements as PlayerMeasurementRow,
  players as PlayerRow,
  recommendation_candidates as RecommendationCandidateRow,
  recommendation_runs as RecommendationRunRow,
  session_player_metrics as SessionPlayerMetricRow,
  subscriptions as SubscriptionRow,
  team_players as TeamPlayerRow,
  teams as TeamRow,
  telemetry_uploads as TelemetryUploadRow,
  training_sessions as TrainingSessionRow,
} from "@prisma/client";

import type {
  AccountMembership,
  AccountSubscription,
  AccountSummary,
  GymExerciseLogRecord,
  HeatmapTileRecord,
  Injury,
  Invitation,
  MatchEvent,
  Player,
  PlayerComment,
  PlayerMeasurement,
  RecommendationRun,
  SessionPlayerMetric,
  TeamRosterPlayer,
  TelemetryUpload,
  Team,
  TrainingSession,
} from "@/application/domain-types";
import type { Address } from "@/domain/shared/address";
import type { ContactInfo } from "@/domain/shared/contact-info";
import type { BillingInfo } from "@/domain/shared/billing-info";
import { planCatalog } from "@/domain/billing/feature-entitlement-policy";

/**
 * Adaptadores de lectura Prisma -> tipos de aplicación/dominio.
 *
 * Objetivo: aislar nombres de columnas snake_case y compatibilidad histórica
 * de campos para que el resto de capas consuma contratos estables.
 */

function asString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

// Lee la dirección desde columnas normalizadas del esquema nuevo.
function rowAddress(row: AccountRow): Address {
  return {
    countryCode: row.country_code,
    city: row.city,
    line1: row.address_line1,
    line2: row.address_line2 ?? undefined,
    postalCode: row.postal_code ?? undefined,
    region: row.region ?? undefined,
  };
}

// Mantiene compatibilidad con payloads JSON heredados mientras el modelo converge al shape actual.
function jsonAddress(value: unknown): Address {
  if (!value || typeof value !== "object") {
    return {
      countryCode: "",
      city: "",
      line1: "",
    };
  }
  const v = value as Record<string, unknown>;
  return {
    countryCode: asString(v.countryCode) ?? asString(v.country_code) ?? "",
    city: asString(v.city) ?? "",
    line1: asString(v.line1) ?? asString(v.address_line1) ?? "",
    line2: asString(v.line2) ?? asString(v.address_line2),
    postalCode: asString(v.postalCode) ?? asString(v.postal_code),
    region: asString(v.region),
  };
}

export function mapAccount(row: AccountRow): AccountSummary {
  const contact: ContactInfo = {
    email: row.contact_email,
    phone: row.contact_phone,
  };
  const billing: BillingInfo = {
    legalName: row.billing_legal_name ?? undefined,
    taxId: row.billing_tax_id ?? undefined,
    billingEmail: row.billing_email ?? undefined,
    billingAddress: jsonAddress(row.billing_address),
  };
  return {
    id: row.id,
    type: row.type,
    displayName: row.display_name,
    ownerUserId: row.owner_user_id,
    address: rowAddress(row),
    contact,
    billing,
    createdAt: row.created_at.toISOString(),
  };
}

export function mapMembership(row: AccountMemberRow): AccountMembership {
  return {
    accountId: row.account_id,
    userId: row.user_id,
    role: row.role,
    joinedAt: row.joined_at?.toISOString(),
  };
}

export function mapInvitation(row: InvitationRow): Invitation {
  return {
    id: row.id,
    accountId: row.account_id,
    email: row.email ?? "",
    role: row.role,
    token: row.token,
    expiresAt: row.expires_at.toISOString(),
    acceptedAt: row.accepted_at?.toISOString(),
  };
}

export function mapSubscription(
  row: SubscriptionRow & {
    plans: {
      tier: AccountSubscription["tier"];
      player_limit: number | null;
      team_limit: number | null;
    };
  },
): AccountSubscription {
  const tier = row.plans.tier;
  const defaults = planCatalog[tier];
  return {
    accountId: row.account_id,
    tier,
    entitlements: {
      tier,
      playerLimit: row.plans.player_limit,
      teamLimit: row.plans.team_limit,
      // Features siguen viviendo en catálogo porque la DB sólo parametriza límites cuantitativos.
      // Features siguen siendo tier-based por ahora; DB solo define límites numéricos.
      features: defaults.features,
    },
    status: row.status,
    interval: row.billing_interval ?? undefined,
    externalProvider: row.external_provider ?? undefined,
    externalId: row.external_id ?? undefined,
  };
}

export function mapTeam(row: TeamRow): Team {
  // `sport_type` tuvo variantes históricas; aquí se normaliza a los valores del dominio actual.
  const compatRow = row as unknown as {
    field_length_meters?: number | null;
    field_width_meters?: number | null;
  };
  const normalized = row.sport_type?.toLowerCase();
  const sportType: Team["sportType"] =
    normalized === "rugby"
      ? "rugby"
      : normalized === "hockey" || normalized === "jockey"
        ? "hockey"
        : "football";

  return {
    id: row.id,
    accountId: row.account_id,
    name: row.name,
    sportType,
    fieldLengthMeters: compatRow.field_length_meters ?? undefined,
    fieldWidthMeters: compatRow.field_width_meters ?? undefined,
    createdAt: row.created_at.toISOString(),
  };
}

export function mapPlayer(row: PlayerRow): Player {
  return {
    id: row.id,
    accountId: row.account_id,
    displayName: row.display_name,
    birthDate: row.birth_date?.toISOString().slice(0, 10),
    position: row.position ?? undefined,
    metadata: (row.metadata ?? {}) as Readonly<Record<string, unknown>>,
    createdAt: row.created_at.toISOString(),
  };
}

export function mapTeamRosterPlayer(
  row: TeamPlayerRow & { players: PlayerRow },
): TeamRosterPlayer {
  return {
    teamId: row.team_id,
    playerId: row.player_id,
    accountId: row.account_id,
    jerseyNumber: row.jersey_number ?? undefined,
    joinedAt: row.joined_at.toISOString(),
    player: mapPlayer(row.players),
  };
}

export function mapInjury(row: InjuryRow): Injury {
  // Compatibilidad temporal con esquemas antiguos que no tenían `status`.
  const compatRow = row as unknown as {
    status?: Injury["status"];
    estimated_recovery_at?: Date | null;
  };
  const status = compatRow.status ?? (row.resolved_at ? "recovered" : "injured");
  const estimatedRecoveryAt = compatRow.estimated_recovery_at
    ?? row.resolved_at
    ?? row.diagnosed_at;

  return {
    id: row.id,
    accountId: row.account_id,
    playerId: row.player_id,
    diagnosedAt: row.diagnosed_at.toISOString(),
    status,
    estimatedRecoveryAt: estimatedRecoveryAt.toISOString(),
    resolvedAt: row.resolved_at?.toISOString(),
    bodyRegion: row.body_region as Injury["bodyRegion"],
    bodyZoneDetail: row.body_zone_detail,
    severity: (row.severity ?? undefined) as Injury["severity"],
    description: row.description ?? undefined,
  };
}

export function mapComment(row: PlayerCommentRow): PlayerComment {
  return {
    id: row.id,
    accountId: row.account_id,
    playerId: row.player_id,
    injuryId: row.injury_id ?? undefined,
    authorUserId: row.author_user_id ?? undefined,
    body: row.body,
    createdAt: row.created_at.toISOString(),
  };
}

export function mapPlayerMeasurement(row: PlayerMeasurementRow): PlayerMeasurement {
  return {
    id: row.id,
    accountId: row.account_id,
    playerId: row.player_id,
    takenAt: row.taken_at.toISOString(),
    heightCentimeters: row.height_centimeters == null
      ? undefined
      : Number(row.height_centimeters),
    weightKilograms: row.weight_kilograms == null
      ? undefined
      : Number(row.weight_kilograms),
    bodyFatPercentage: row.body_fat_percentage == null
      ? undefined
      : Number(row.body_fat_percentage),
    notes: row.notes ?? undefined,
  };
}

export function mapSession(
  row: TrainingSessionRow & { session_players?: { player_id: string }[] },
): TrainingSession {
  // El aggregate de aplicación expone playerIds embebidos para evitar lookups extra en pantallas y use-cases.
  return {
    id: row.id,
    accountId: row.account_id,
    teamId: row.team_id ?? undefined,
    kind: row.kind,
    scheduledFor: row.scheduled_for.toISOString(),
    durationSeconds: row.duration_seconds ?? undefined,
    notes: row.notes ?? undefined,
    createdAt: row.created_at.toISOString(),
    playerIds: (row.session_players ?? []).map((sp) => sp.player_id),
  };
}

export function mapMatchEvent(row: MatchEventRow): MatchEvent {
  return {
    id: row.id,
    accountId: row.account_id,
    sessionId: row.session_id,
    occurredAt: row.occurred_at.toISOString(),
    matchMinute: row.match_minute ?? undefined,
    kind: row.kind,
    playerId: row.player_id ?? undefined,
    payload: (row.payload ?? {}) as Readonly<Record<string, unknown>>,
  };
}

export function mapGymLog(row: GymExerciseLogRow): GymExerciseLogRecord {
  // `sets` llega como JSON heterogéneo; aquí se tipa y normaliza al contrato de aplicación.
  const sets = Array.isArray(row.sets)
    ? (row.sets as Array<Record<string, unknown>>)
    : [];
  return {
    id: row.id,
    accountId: row.account_id,
    sessionId: row.session_id,
    playerId: row.player_id,
    exerciseId: row.exercise_id,
    performedAt: row.performed_at.toISOString(),
    sets: sets.map((s) => ({
      weightKilograms: Number(s.weightKilograms ?? 0),
      repetitions: Number(s.repetitions ?? 0),
      rpe: s.rpe == null ? undefined : Number(s.rpe),
    })),
  };
}

export function mapTelemetryUpload(
  row: TelemetryUploadRow,
  sampleCount: number,
): TelemetryUpload {
  // `sampleCount` se inyecta desde queries agregadas porque no vive denormalizado en la tabla principal.
  return {
    id: row.id,
    accountId: row.account_id,
    source: row.source,
    storagePath: row.storage_path,
    sessionId: row.session_id ?? undefined,
    playerId: row.player_id ?? undefined,
    uploadedAt: row.uploaded_at.toISOString(),
    processedAt: row.processed_at?.toISOString(),
    sampleCount,
  };
}

export function mapSessionPlayerMetric(row: SessionPlayerMetricRow): SessionPlayerMetric {
  const zones = row.zones && typeof row.zones === "object"
    ? Object.fromEntries(
        Object.entries(row.zones as Record<string, unknown>).flatMap(([key, value]) =>
          typeof value === "number" ? [[key, value]] : [],
        ),
      )
    : undefined;

  return {
    id: row.id,
    accountId: row.account_id,
    sessionId: row.session_id,
    playerId: row.player_id,
    totalDistanceMeters: row.total_distance_meters == null
      ? undefined
      : Number(row.total_distance_meters),
    totalDurationSeconds: row.total_duration_seconds ?? undefined,
    averageSpeedMps: row.average_speed_mps == null
      ? undefined
      : Number(row.average_speed_mps),
    maxSpeedMps: row.max_speed_mps == null
      ? undefined
      : Number(row.max_speed_mps),
    zones,
    computedAt: row.computed_at.toISOString(),
  };
}

export function mapHeatmapTile(row: HeatmapTileRow): HeatmapTileRecord {
  return {
    id: row.id,
    accountId: row.account_id,
    sessionId: row.session_id,
    playerId: row.player_id ?? undefined,
    tileX: row.tile_x,
    tileY: row.tile_y,
    intensity: Number(row.intensity),
    computedAt: row.computed_at.toISOString(),
  };
}

export function mapRecommendationRun(
  row: RecommendationRunRow & {
    recommendation_candidates: RecommendationCandidateRow[];
  },
): RecommendationRun {
  return {
    id: row.id,
    accountId: row.account_id,
    requestedBy: row.requested_by ?? undefined,
    status: row.status,
    model: row.model ?? undefined,
    createdAt: row.created_at.toISOString(),
    completedAt: row.completed_at?.toISOString(),
    candidates: row.recommendation_candidates
      .sort((a, b) => a.rank - b.rank)
      .map((c) => ({
        playerId: c.player_id,
        rank: c.rank,
        score: Number(c.score),
        reasons: Array.isArray(c.reasons) ? (c.reasons as string[]) : [],
      })),
  };
}
