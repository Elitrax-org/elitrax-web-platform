import { planAllowsFeature } from "@/domain/billing/feature-entitlement-policy";
import { rankPlayerSelections } from "@/domain/ai/player-selection-policy";

import type { TenantContext } from "@/application/context";
import { ensurePermission } from "@/lib/permissions";
import { AuthorizationError } from "@/lib/errors";
import type {
  AiProvider,
  ApplicationDependencies,
} from "@/application/ports";
import type { RecommendationRun } from "@/application/ports/repositories";
import type { RequestRecommendationInput } from "@/application/schemas/ai";

/**
 * Ejecuta una corrida de recomendación de jugadores.
 *
 * Flujo:
 * 1) valida permiso y entitlement del plan
 * 2) pre-ranquea candidatos con política de dominio
 * 3) delega ranking final al proveedor AI
 * 4) persiste el resultado para auditoría y trazabilidad
 */
export async function requestRecommendation(
  deps: ApplicationDependencies,
  provider: AiProvider,
  context: TenantContext,
  input: RequestRecommendationInput,
): Promise<RecommendationRun> {
  ensurePermission(context.role, "performance.manage");

  const subscription = await deps.subscriptions.getSubscription(context.accountId);
  if (!subscription) {
    throw new AuthorizationError("subscription not found for account");
  }
  if (!planAllowsFeature(subscription.entitlements, "ai_recommendations")) {
    throw new AuthorizationError("plan does not include AI recommendations");
  }

  const ranked = rankPlayerSelections(input.candidates);

  const result = await provider.rankCandidates({
    accountId: context.accountId,
    requestedBy: context.actor.userId,
    candidates: ranked.map((r) => ({
      playerId: r.playerId,
      score: r.score,
      reasons: r.reasons,
      excluded: r.excluded,
    })),
    prompt: input.prompt,
  });

  return deps.recommendations.recordRun({
    accountId: context.accountId,
    requestedBy: context.actor.userId,
    model: result.model,
    candidates: result.ranking,
  });
}
