import "server-only";

import type { PrismaClient } from "@prisma/client";

import type { TeamRepository } from "@/application/ports/repositories";
import { mapTeam } from "./mappers";

/**
 * Implementación Prisma del repositorio de equipos.
 */
export function createPrismaTeamRepository(prisma: PrismaClient): TeamRepository {
  return {
    async createTeam(accountId, input) {
      // Los overrides de dimensiones quedan guardados a nivel equipo para reutilizarse luego en heatmaps y análisis.
      const row = await prisma.teams.create({
        data: {
          account_id: accountId,
          name: input.name.trim(),
          sport_type: input.sportType,
          field_length_meters: input.fieldLengthMeters ?? null,
          field_width_meters: input.fieldWidthMeters ?? null,
        } as never,
      });
      return mapTeam(row);
    },

    async listTeams(accountId) {
      const rows = await prisma.teams.findMany({
        where: { account_id: accountId },
        orderBy: { created_at: "asc" },
      });
      return rows.map(mapTeam);
    },

    async getTeam(accountId, teamId) {
      const row = await prisma.teams.findFirst({
        where: { id: teamId, account_id: accountId },
      });
      return row ? mapTeam(row) : null;
    },

    async updateTeam(accountId, teamId, input) {
      // El update tolera payload parcial para que la UI pueda editar sólo nombre, deporte o medidas.
      const row = await prisma.teams.update({
        where: { id: teamId, account_id: accountId } as never,
        data: {
          ...(input.name === undefined ? {} : { name: input.name.trim() }),
          ...(input.sportType === undefined ? {} : { sport_type: input.sportType }),
          field_length_meters: input.fieldLengthMeters ?? null,
          field_width_meters: input.fieldWidthMeters ?? null,
        } as never,
      });
      return mapTeam(row);
    },
  };
}
