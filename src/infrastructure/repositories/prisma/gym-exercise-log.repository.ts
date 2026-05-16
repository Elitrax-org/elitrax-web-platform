import "server-only";

import type { PrismaClient } from "@prisma/client";

import type { GymExerciseLogRepository } from "@/application/ports/repositories";
import { mapGymLog } from "./mappers";

/**
 * Persistencia Prisma para ejercicios de gimnasio por sesión.
 */
export function createPrismaGymExerciseLogRepository(
  prisma: PrismaClient,
): GymExerciseLogRepository {
  return {
    async logExercise({ accountId, sessionId, data }) {
      const row = await prisma.gym_exercise_logs.create({
        data: {
          account_id: accountId,
          session_id: sessionId,
          player_id: data.playerId,
          exercise_id: data.exerciseId.trim(),
          performed_at: data.performedAt ? new Date(data.performedAt) : new Date(),
          sets: data.sets.map((s) => ({
            weightKilograms: s.weightKilograms,
            repetitions: s.repetitions,
            rpe: s.rpe ?? null,
          })) as unknown as object,
        },
      });
      return mapGymLog(row);
    },

    async listForSession(accountId, sessionId) {
      const rows = await prisma.gym_exercise_logs.findMany({
        where: { account_id: accountId, session_id: sessionId },
        orderBy: { performed_at: "asc" },
      });
      return rows.map(mapGymLog);
    },
  };
}
