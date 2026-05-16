import "server-only";

import type { PrismaClient } from "@prisma/client";

import type { CommentRepository } from "@/application/ports/repositories";
import { mapComment } from "./mappers";

/**
 * Persistencia Prisma para comentarios de jugadores.
 */
export function createPrismaCommentRepository(
  prisma: PrismaClient,
): CommentRepository {
  return {
    async postComment({ accountId, playerId, authorUserId, injuryId, data }) {
      const row = await prisma.player_comments.create({
        data: {
          account_id: accountId,
          player_id: playerId,
          injury_id: injuryId ?? null,
          author_user_id: authorUserId,
          body: data.body.trim(),
        },
      });
      return mapComment(row);
    },

    async listComments(accountId, playerId) {
      const rows = await prisma.player_comments.findMany({
        where: { account_id: accountId, player_id: playerId },
        orderBy: { created_at: "desc" },
      });
      return rows.map(mapComment);
    },

    async getComment(accountId, playerId, commentId) {
      const row = await prisma.player_comments.findFirst({
        where: {
          id: commentId,
          account_id: accountId,
          player_id: playerId,
        },
      });
      return row ? mapComment(row) : null;
    },

    async updateComment({ accountId, playerId, commentId, data }) {
      const row = await prisma.player_comments.update({
        where: { id: commentId },
        data: { body: data.body.trim() },
      });
      if (row.account_id !== accountId || row.player_id !== playerId) {
        throw new Error("comment scope mismatch");
      }
      return mapComment(row);
    },

    async deleteComment(accountId, playerId, commentId) {
      await prisma.player_comments.deleteMany({
        where: {
          id: commentId,
          account_id: accountId,
          player_id: playerId,
        },
      });
    },
  };
}
