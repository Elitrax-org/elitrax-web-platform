import "server-only";

import type { PrismaClient } from "@prisma/client";

import type { PlayerMeasurementRepository } from "@/application/ports/repositories";
import { mapPlayerMeasurement } from "./mappers";

/**
 * Repositorio Prisma para mediciones físicas de jugadores.
 */
export function createPrismaPlayerMeasurementRepository(
  prisma: PrismaClient,
): PlayerMeasurementRepository {
  return {
    async recordMeasurement({ accountId, playerId, data }) {
      const row = await prisma.player_measurements.create({
        data: {
          account_id: accountId,
          player_id: playerId,
          taken_at: data.takenAt ? new Date(data.takenAt) : new Date(),
          height_centimeters: data.heightCentimeters ?? null,
          weight_kilograms: data.weightKilograms ?? null,
          body_fat_percentage: data.bodyFatPercentage ?? null,
          notes: data.notes ?? null,
        },
      });
      return mapPlayerMeasurement(row);
    },

    async listMeasurements(accountId, playerId) {
      const rows = await prisma.player_measurements.findMany({
        where: { account_id: accountId, player_id: playerId },
        orderBy: { taken_at: "asc" },
      });
      return rows.map(mapPlayerMeasurement);
    },
  };
}
