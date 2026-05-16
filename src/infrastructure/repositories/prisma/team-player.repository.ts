import "server-only";

import type { PrismaClient } from "@prisma/client";
import { Prisma } from "@prisma/client";

import type { TeamPlayerRepository } from "@/application/ports/repositories";
import { ConflictError, NotFoundError } from "@/lib/errors";
import { mapTeamRosterPlayer } from "./mappers";

/**
 * Traduce errores conocidos de Prisma a errores de dominio de aplicación.
 */
function mapPrismaError(error: unknown): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      // Prisma unifica conflictos de unique; aquí se traducen a un mensaje de dominio entendible.
      throw new ConflictError("team player already exists or jersey number is duplicated");
    }
    if (error.code === "P2025") {
      throw new NotFoundError("team_player");
    }
  }
  throw error;
}

/**
 * Repositorio Prisma para la relación roster equipo-jugador.
 */
export function createPrismaTeamPlayerRepository(
  prisma: PrismaClient,
): TeamPlayerRepository {
  return {
    async addPlayerToTeam({ accountId, teamId, playerId, data }) {
      try {
        // La consulta devuelve también el jugador para que la UI reciba el roster listo para renderizar.
        const row = await prisma.team_players.create({
          data: {
            account_id: accountId,
            team_id: teamId,
            player_id: playerId,
            jersey_number: data.jerseyNumber ?? null,
          },
          include: { players: true },
        });
        return mapTeamRosterPlayer(row);
      } catch (error) {
        mapPrismaError(error);
      }
    },

    async listTeamPlayers(accountId, teamId) {
      const rows = await prisma.team_players.findMany({
        where: {
          account_id: accountId,
          team_id: teamId,
        },
        include: { players: true },
        orderBy: { joined_at: "asc" },
      });
      return rows.map(mapTeamRosterPlayer);
    },

    async updateTeamPlayer({ accountId, teamId, playerId, data }) {
      try {
        // Se usa updateMany para mantener el filtro por tenant aunque la PK natural sea compuesta.
        const updated = await prisma.team_players.updateMany({
          where: {
            account_id: accountId,
            team_id: teamId,
            player_id: playerId,
          },
          data: {
            jersey_number: data.jerseyNumber ?? null,
          },
        });
        if (updated.count === 0) {
          throw new NotFoundError("team_player");
        }
        const row = await prisma.team_players.findFirst({
          where: {
            account_id: accountId,
            team_id: teamId,
            player_id: playerId,
          },
          include: { players: true },
        });
        if (!row) {
          throw new NotFoundError("team_player");
        }
        return mapTeamRosterPlayer(row);
      } catch (error) {
        mapPrismaError(error);
      }
    },

    async removeTeamPlayer(accountId, teamId, playerId) {
      const deleted = await prisma.team_players.deleteMany({
        where: {
          account_id: accountId,
          team_id: teamId,
          player_id: playerId,
        },
      });
      if (deleted.count === 0) {
        throw new NotFoundError("team_player");
      }
    },
  };
}
