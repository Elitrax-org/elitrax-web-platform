import "server-only";

import type { PrismaClient } from "@prisma/client";

import type { PlayerRepository } from "@/application/ports/repositories";
import { mapPlayer } from "./mappers";

/**
 * Implementación Prisma del repositorio de jugadores.
 */
export function createPrismaPlayerRepository(
  prisma: PrismaClient,
): PlayerRepository {
  return {
    async createPlayer(accountId, input) {
      // Normaliza datos de entrada mínimos antes de persistir para mantener consistencia entre adaptadores.
      const row = await prisma.players.create({
        data: {
          account_id: accountId,
          display_name: input.displayName.trim(),
          birth_date: input.birthDate ? new Date(input.birthDate) : null,
          position: input.position ?? null,
          metadata: (input.metadata ?? {}) as object,
        },
      });
      return mapPlayer(row);
    },

    async deletePlayer(accountId, playerId) {
      await prisma.players.deleteMany({
        where: {
          id: playerId,
          account_id: accountId,
        },
      });
    },

    async listPlayers(accountId) {
      // El orden por creación da un listado estable para la UI y para la paginación en memoria del endpoint.
      const rows = await prisma.players.findMany({
        where: { account_id: accountId },
        orderBy: { created_at: "asc" },
      });
      return rows.map(mapPlayer);
    },

    async getPlayer(accountId, playerId) {
      // Todas las lecturas quedan scopeadas por tenant desde el repositorio para evitar fugas entre cuentas.
      const row = await prisma.players.findFirst({
        where: { id: playerId, account_id: accountId },
      });
      return row ? mapPlayer(row) : null;
    },
  };
}
