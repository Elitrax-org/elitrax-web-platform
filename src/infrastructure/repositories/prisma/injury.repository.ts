import "server-only";

import type { PrismaClient } from "@prisma/client";

import type { InjuryRepository } from "@/application/ports/repositories";
import { formatInjuryCommentSummary } from "@/infrastructure/repositories/injury-comment";
import { mapInjury } from "./mappers";

/**
 * Repositorio Prisma para lesiones.
 *
 * Cada alta/actualización de lesión agrega automáticamente una entrada
 * de comentario resumido para mantener trazabilidad clínica.
 */
export function createPrismaInjuryRepository(
  prisma: PrismaClient,
): InjuryRepository {
  return {
    async logInjury({ accountId, playerId, authorUserId, data }) {
      const row = await prisma.$transaction(async (tx) => {
        const created = await tx.injuries.create({
          data: {
            account_id: accountId,
            player_id: playerId,
            diagnosed_at: new Date(data.diagnosedAt),
            status: data.status,
            estimated_recovery_at: new Date(data.estimatedRecoveryAt),
            resolved_at: data.resolvedAt ? new Date(data.resolvedAt) : null,
            body_region: data.bodyRegion,
            body_zone_detail: data.bodyZoneDetail,
            severity: data.severity ?? null,
            description: data.description ?? null,
          },
        });
        await tx.player_comments.create({
          data: {
            account_id: accountId,
            player_id: playerId,
            injury_id: created.id,
            author_user_id: authorUserId,
            body: formatInjuryCommentSummary({
              description: created.description ?? undefined,
              status: data.status,
              estimatedRecoveryAt: data.estimatedRecoveryAt,
              injuryComment: data.injuryComment,
            }),
          },
        });
        return created;
      });
      return mapInjury(row);
    },

    async updateInjury({ accountId, playerId, injuryId, authorUserId, data }) {
      const row = await prisma.$transaction(async (tx) => {
        const existing = await tx.injuries.findFirst({
          where: {
            id: injuryId,
            account_id: accountId,
            player_id: playerId,
          },
        });
        if (!existing) {
          throw new Error("injury not found");
        }
        const existingCompat = existing as unknown as {
          status?: "injured" | "recovering" | "recovered";
          estimated_recovery_at?: Date | null;
        };
        const statusForComment =
          data.status ??
          existingCompat.status ??
          (existing.resolved_at ? "recovered" : "injured");
        const estimatedRecoveryAtForComment =
          data.estimatedRecoveryAt ??
          existingCompat.estimated_recovery_at?.toISOString() ??
          existing.resolved_at?.toISOString() ??
          existing.diagnosed_at.toISOString();
        const updated = await tx.injuries.update({
          where: { id: injuryId },
          data: {
            diagnosed_at: data.diagnosedAt ? new Date(data.diagnosedAt) : undefined,
            status: data.status,
            estimated_recovery_at: data.estimatedRecoveryAt
              ? new Date(data.estimatedRecoveryAt)
              : undefined,
            resolved_at: data.resolvedAt ? new Date(data.resolvedAt) : undefined,
            body_region: data.bodyRegion,
            body_zone_detail: data.bodyZoneDetail,
            severity: data.severity,
            description: data.description,
          },
        });
        await tx.player_comments.create({
          data: {
            account_id: accountId,
            player_id: playerId,
            injury_id: injuryId,
            author_user_id: authorUserId,
            body: formatInjuryCommentSummary({
              description: (data.description ?? updated.description) ?? undefined,
              status: statusForComment,
              estimatedRecoveryAt: estimatedRecoveryAtForComment,
              injuryComment: data.injuryComment,
            }),
          },
        });
        return updated;
      });
      return mapInjury(row);
    },

    async listInjuriesForPlayer(accountId, playerId) {
      const rows = await prisma.injuries.findMany({
        where: { account_id: accountId, player_id: playerId },
        orderBy: { diagnosed_at: "desc" },
      });
      return rows.map(mapInjury);
    },

    async deleteInjury({ accountId, playerId, injuryId }) {
      await prisma.injuries.deleteMany({
        where: {
          id: injuryId,
          account_id: accountId,
          player_id: playerId,
        },
      });
    },
  };
}
