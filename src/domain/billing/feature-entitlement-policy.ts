import {
  hasSubscriptionCapacity,
  type SubscriptionLimit,
} from "./subscription-limit-policy";

/**
 * Niveles de plan soportados por el catálogo actual.
 */
export const planTiers = ["basic", "pro", "pro_plus"] as const;
export type PlanTier = (typeof planTiers)[number];

export const features = [
  "teams",
  "telemetry_upload",
  "ai_recommendations",
  "match_mode_realtime",
  "advanced_reports",
] as const;
export type Feature = (typeof features)[number];

export type PlanEntitlements = {
  readonly tier: PlanTier;
  readonly playerLimit: SubscriptionLimit;
  readonly teamLimit: SubscriptionLimit;
  readonly features: ReadonlySet<Feature>;
};

/**
 * Fuente de verdad de capacidades por plan.
 *
 * Cualquier cambio comercial (features o límites) debe actualizarse aquí
 * y cubrirse con tests de dominio.
 */
export const planCatalog: Readonly<Record<PlanTier, PlanEntitlements>> = {
  basic: {
    tier: "basic",
    playerLimit: 1,
    teamLimit: 0,
    features: new Set<Feature>([]),
  },
  pro: {
    tier: "pro",
    playerLimit: 50,
    teamLimit: 3,
    features: new Set<Feature>([
      "teams",
      "telemetry_upload",
      "advanced_reports",
    ]),
  },
  pro_plus: {
    tier: "pro_plus",
    playerLimit: null,
    teamLimit: null,
    features: new Set<Feature>([
      "teams",
      "telemetry_upload",
      "advanced_reports",
      "ai_recommendations",
      "match_mode_realtime",
    ]),
  },
};

export function planAllowsFeature(
  entitlements: PlanEntitlements,
  feature: Feature,
): boolean {
  return entitlements.features.has(feature);
}

/**
 * Evalúa si la suscripción admite sumar un jugador más.
 */
export function planAllowsAdditionalPlayer(
  entitlements: PlanEntitlements,
  currentPlayerCount: number,
): boolean {
  return hasSubscriptionCapacity(currentPlayerCount, entitlements.playerLimit);
}

/**
 * Evalúa si la suscripción admite sumar un equipo más.
 */
export function planAllowsAdditionalTeam(
  entitlements: PlanEntitlements,
  currentTeamCount: number,
): boolean {
  return hasSubscriptionCapacity(currentTeamCount, entitlements.teamLimit);
}
