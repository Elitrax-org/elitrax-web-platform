import "server-only";

import type { PrismaClient } from "@prisma/client";

import type { ApplicationDependencies } from "@/application/ports/repositories";
import { createPrismaAccountRepository } from "./account.repository";
import { createPrismaCommentRepository } from "./comment.repository";
import { createPrismaGymExerciseLogRepository } from "./gym-exercise-log.repository";
import { createPrismaHeatmapTileRepository } from "./heatmap-tile.repository";
import { createPrismaInjuryRepository } from "./injury.repository";
import { createPrismaPlayerRepository } from "./player.repository";
import { createPrismaTeamPlayerRepository } from "./team-player.repository";
import { createPrismaPlayerMeasurementRepository } from "./player-measurement.repository";
import { createPrismaRecommendationRepository } from "./recommendation.repository";
import { createPrismaSessionPlayerMetricRepository } from "./session-player-metric.repository";
import { createPrismaSessionRepository } from "./session.repository";
import { createPrismaSubscriptionRepository } from "./subscription.repository";
import { createPrismaTeamRepository } from "./team.repository";
import { createPrismaTelemetryRepository } from "./telemetry.repository";

/**
 * Ensambla todos los repositorios Prisma bajo el contrato de puertos app.
 */
export function buildPrismaDependencies(
  prisma: PrismaClient,
): ApplicationDependencies {
  return {
    accounts: createPrismaAccountRepository(prisma),
    subscriptions: createPrismaSubscriptionRepository(prisma),
    teams: createPrismaTeamRepository(prisma),
    players: createPrismaPlayerRepository(prisma),
    teamPlayers: createPrismaTeamPlayerRepository(prisma),
    injuries: createPrismaInjuryRepository(prisma),
    comments: createPrismaCommentRepository(prisma),
    measurements: createPrismaPlayerMeasurementRepository(prisma),
    sessions: createPrismaSessionRepository(prisma),
    gymLogs: createPrismaGymExerciseLogRepository(prisma),
    telemetry: createPrismaTelemetryRepository(prisma),
    sessionMetrics: createPrismaSessionPlayerMetricRepository(prisma),
    heatmaps: createPrismaHeatmapTileRepository(prisma),
    recommendations: createPrismaRecommendationRepository(prisma),
  };
}
