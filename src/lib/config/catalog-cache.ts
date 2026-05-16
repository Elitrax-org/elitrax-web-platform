import { planCatalog } from "@/domain/billing/feature-entitlement-policy";
import { teamSportTypeValues } from "@/application/schemas/team";

export type PlanMetadata = {
  readonly tier: keyof typeof planCatalog;
  readonly playerLimit: number | null;
  readonly teamLimit: number | null;
  readonly features: readonly string[];
};

export type SportTemplateMetadata = {
  readonly sportType: (typeof teamSportTypeValues)[number];
  readonly supportsMatchMode: boolean;
  readonly supportsHeatmap: boolean;
};

type CatalogCache = {
  readonly expiresAt: number;
  readonly value: {
    readonly plans: readonly PlanMetadata[];
    readonly sports: readonly SportTemplateMetadata[];
  };
};

const CACHE_KEY = "__elitraxCatalogMetadataCache__" as const;
const CACHE_TTL_MS = 5 * 60 * 1000;

type GlobalWithCatalogCache = typeof globalThis & {
  [CACHE_KEY]?: CatalogCache;
};

function buildMetadata() {
  const plans: readonly PlanMetadata[] = Object.values(planCatalog).map((plan) => ({
    tier: plan.tier,
    playerLimit: plan.playerLimit,
    teamLimit: plan.teamLimit,
    features: [...plan.features].sort(),
  }));

  const sports: readonly SportTemplateMetadata[] = teamSportTypeValues.map((sportType) => ({
    sportType,
    supportsMatchMode: sportType === "football" || sportType === "hockey",
    supportsHeatmap: true,
  }));

  return { plans, sports } as const;
}

export async function getCatalogMetadata() {
  const g = globalThis as GlobalWithCatalogCache;
  const now = Date.now();
  const existing = g[CACHE_KEY];
  if (existing && existing.expiresAt > now) {
    return existing.value;
  }

  const value = buildMetadata();
  g[CACHE_KEY] = { value, expiresAt: now + CACHE_TTL_MS };
  return value;
}
