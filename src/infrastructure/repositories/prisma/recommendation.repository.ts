import "server-only";

import type { PrismaClient } from "@prisma/client";

import type { RecommendationRepository } from "@/application/ports/repositories";
import { mapRecommendationRun } from "./mappers";

/**
 * Persistencia Prisma para ejecuciones de recomendación AI y candidatos.
 */
export function createPrismaRecommendationRepository(
  prisma: PrismaClient,
): RecommendationRepository {
  return {
    // Guarda corrida y ranking asociado dentro de una transacción.
    async recordRun({ accountId, requestedBy, model, candidates }) {
      const now = new Date();
      const created = await prisma.$transaction(async (tx) => {
        const run = await tx.recommendation_runs.create({
          data: {
            account_id: accountId,
            requested_by: requestedBy,
            status: "succeeded",
            model: model ?? null,
            completed_at: now,
          },
        });
        if (candidates.length > 0) {
          await tx.recommendation_candidates.createMany({
            data: candidates.map((c) => ({
              account_id: accountId,
              run_id: run.id,
              player_id: c.playerId,
              rank: c.rank,
              score: c.score,
              reasons: c.reasons as unknown as object,
            })),
          });
        }
        return tx.recommendation_runs.findUniqueOrThrow({
          where: { id: run.id },
          include: { recommendation_candidates: true },
        });
      });
      return mapRecommendationRun(created);
    },

    async listRuns(accountId) {
      const rows = await prisma.recommendation_runs.findMany({
        where: { account_id: accountId },
        orderBy: { created_at: "desc" },
        include: { recommendation_candidates: true },
      });
      return rows.map(mapRecommendationRun);
    },
  };
}
