import "server-only";

import { Prisma } from "@prisma/client";
import type { PrismaClient } from "@prisma/client";

import type { SessionPlayerMetricRepository } from "@/application/ports/repositories";
import { mapSessionPlayerMetric } from "./mappers";

export function createPrismaSessionPlayerMetricRepository(
  prisma: PrismaClient,
): SessionPlayerMetricRepository {
  return {
    async getMetric({ accountId, sessionId, playerId }) {
      const row = await prisma.session_player_metrics.findFirst({
        where: {
          account_id: accountId,
          session_id: sessionId,
          player_id: playerId,
        },
      });
      return row ? mapSessionPlayerMetric(row) : null;
    },

    // Consulta pensada para dashboards y resúmenes agregados; evita resolver una métrica por vez.
    async listMetrics({ accountId, sessionIds, playerIds }) {
      if (sessionIds && sessionIds.length === 0) {
        return [];
      }
      if (playerIds && playerIds.length === 0) {
        return [];
      }

      const rows = await prisma.session_player_metrics.findMany({
        where: {
          account_id: accountId,
          session_id: sessionIds ? { in: [...sessionIds] } : undefined,
          player_id: playerIds ? { in: [...playerIds] } : undefined,
        },
        orderBy: [
          { computed_at: "desc" },
          { session_id: "asc" },
          { player_id: "asc" },
        ],
      });

      return rows.map(mapSessionPlayerMetric);
    },

    async upsertMetric(input) {
      const row = await prisma.session_player_metrics.upsert({
        where: {
          session_id_player_id: {
            session_id: input.sessionId,
            player_id: input.playerId,
          },
        },
        create: {
          account_id: input.accountId,
          session_id: input.sessionId,
          player_id: input.playerId,
          total_distance_meters: input.totalDistanceMeters == null
            ? null
            : new Prisma.Decimal(input.totalDistanceMeters),
          total_duration_seconds: input.totalDurationSeconds ?? null,
          average_speed_mps: input.averageSpeedMps == null
            ? null
            : new Prisma.Decimal(input.averageSpeedMps),
          max_speed_mps: input.maxSpeedMps == null
            ? null
            : new Prisma.Decimal(input.maxSpeedMps),
          zones: input.zones === undefined
            ? Prisma.JsonNull
            : (input.zones as Prisma.InputJsonValue),
        },
        update: {
          total_distance_meters: input.totalDistanceMeters == null
            ? null
            : new Prisma.Decimal(input.totalDistanceMeters),
          total_duration_seconds: input.totalDurationSeconds ?? null,
          average_speed_mps: input.averageSpeedMps == null
            ? null
            : new Prisma.Decimal(input.averageSpeedMps),
          max_speed_mps: input.maxSpeedMps == null
            ? null
            : new Prisma.Decimal(input.maxSpeedMps),
          zones: input.zones === undefined
            ? Prisma.JsonNull
            : (input.zones as Prisma.InputJsonValue),
          computed_at: new Date(),
        },
      });
      return mapSessionPlayerMetric(row);
    },
  };
}
