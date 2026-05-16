import type { AccountRole, AccountType } from "@/domain/account/roles";
import type {
  PlanTier,
  PlanEntitlements,
} from "@/domain/billing/feature-entitlement-policy";
import type { Address } from "@/domain/shared/address";
import type { ContactInfo } from "@/domain/shared/contact-info";
import type { BillingInfo } from "@/domain/shared/billing-info";
import type { BillingInterval } from "@/domain/shared/money";
import type { BodyRegion } from "@/domain/health/body-zone";

export type AccountSummary = {
  readonly id: string;
  readonly type: AccountType;
  readonly displayName: string;
  readonly ownerUserId: string;
  readonly address: Address;
  readonly contact: ContactInfo;
  readonly billing: BillingInfo;
  readonly createdAt: string;
};

export type AccountMembership = {
  readonly accountId: string;
  readonly userId: string;
  readonly role: AccountRole;
  readonly joinedAt?: string;
};

export type Invitation = {
  readonly id: string;
  readonly accountId: string;
  readonly email: string;
  readonly role: AccountRole;
  readonly token: string;
  readonly expiresAt: string;
  readonly acceptedAt?: string;
};

export type AccountSubscription = {
  readonly accountId: string;
  readonly tier: PlanTier;
  readonly entitlements: PlanEntitlements;
  readonly status:
    | "trialing"
    | "active"
    | "past_due"
    | "canceled"
    | "incomplete";
  readonly interval?: BillingInterval;
  readonly externalProvider?: string;
  readonly externalId?: string;
};

export type Team = {
  readonly id: string;
  readonly accountId: string;
  readonly name: string;
  readonly sportType: "football" | "hockey" | "rugby";
  readonly fieldLengthMeters?: number;
  readonly fieldWidthMeters?: number;
  readonly createdAt: string;
};

export type Player = {
  readonly id: string;
  readonly accountId: string;
  readonly displayName: string;
  readonly birthDate?: string;
  readonly position?: string;
  readonly metadata: Readonly<Record<string, unknown>>;
  readonly createdAt: string;
};

export type TeamPlayer = {
  readonly teamId: string;
  readonly playerId: string;
  readonly accountId: string;
  readonly jerseyNumber?: string;
  readonly joinedAt: string;
};

export type TeamRosterPlayer = TeamPlayer & {
  readonly player: Player;
};

export type Injury = {
  readonly id: string;
  readonly accountId: string;
  readonly playerId: string;
  readonly diagnosedAt: string;
  readonly status: "injured" | "recovering" | "recovered";
  readonly estimatedRecoveryAt: string;
  readonly resolvedAt?: string;
  readonly bodyRegion: BodyRegion;
  readonly bodyZoneDetail: number;
  readonly severity?: "mild" | "moderate" | "severe";
  readonly description?: string;
};

export type PlayerMeasurement = {
  readonly id: string;
  readonly accountId: string;
  readonly playerId: string;
  readonly takenAt: string;
  readonly heightCentimeters?: number;
  readonly weightKilograms?: number;
  readonly bodyFatPercentage?: number;
  readonly notes?: string;
};

export type PlayerComment = {
  readonly id: string;
  readonly accountId: string;
  readonly playerId: string;
  readonly injuryId?: string;
  readonly authorUserId?: string;
  readonly body: string;
  readonly createdAt: string;
};

export type TrainingSession = {
  readonly id: string;
  readonly accountId: string;
  readonly teamId?: string;
  readonly kind:
    | "team_training"
    | "gym"
    | "running"
    | "match"
    | "recovery"
    | "other";
  readonly scheduledFor: string;
  readonly durationSeconds?: number;
  readonly notes?: string;
  readonly createdAt: string;
  readonly playerIds: readonly string[];
};

export type MatchEvent = {
  readonly id: string;
  readonly accountId: string;
  readonly sessionId: string;
  readonly occurredAt: string;
  readonly matchMinute?: number;
  readonly kind:
    | "goal"
    | "assist"
    | "shot"
    | "foul"
    | "yellow_card"
    | "red_card"
    | "substitution"
    | "injury"
    | "note";
  readonly playerId?: string;
  readonly payload: Readonly<Record<string, unknown>>;
};

export type GymExerciseSet = {
  readonly weightKilograms: number;
  readonly repetitions: number;
  readonly rpe?: number;
};

export type GymExerciseLogRecord = {
  readonly id: string;
  readonly accountId: string;
  readonly sessionId: string;
  readonly playerId: string;
  readonly exerciseId: string;
  readonly performedAt: string;
  readonly sets: readonly GymExerciseSet[];
};

export type TelemetryUpload = {
  readonly id: string;
  readonly accountId: string;
  readonly source:
    | "garmin"
    | "polar"
    | "apple_health"
    | "manual"
    | "other";
  readonly storagePath: string;
  readonly sessionId?: string;
  readonly playerId?: string;
  readonly uploadedAt: string;
  readonly processedAt?: string;
  readonly sampleCount: number;
};

export type SessionPlayerMetric = {
  readonly id: string;
  readonly accountId: string;
  readonly sessionId: string;
  readonly playerId: string;
  readonly totalDistanceMeters?: number;
  readonly totalDurationSeconds?: number;
  readonly averageSpeedMps?: number;
  readonly maxSpeedMps?: number;
  readonly zones?: Readonly<Record<string, number>>;
  readonly computedAt: string;
};

export type HeatmapTileRecord = {
  readonly id: string;
  readonly accountId: string;
  readonly sessionId: string;
  readonly playerId?: string;
  readonly tileX: number;
  readonly tileY: number;
  readonly intensity: number;
  readonly computedAt: string;
};

export type RecommendationRun = {
  readonly id: string;
  readonly accountId: string;
  readonly requestedBy?: string;
  readonly status: "queued" | "running" | "succeeded" | "failed";
  readonly model?: string;
  readonly createdAt: string;
  readonly completedAt?: string;
  readonly candidates: ReadonlyArray<{
    readonly playerId: string;
    readonly rank: number;
    readonly score: number;
    readonly reasons: readonly string[];
  }>;
};
