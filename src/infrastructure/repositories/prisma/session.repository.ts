import "server-only";

import type { PrismaClient } from "@prisma/client";

import type { SessionRepository } from "@/application/ports/repositories";
import { mapMatchEvent, mapSession } from "./mappers";

/**
 * Repositorio Prisma para sesiones de entrenamiento y eventos de partido.
 */
export function createPrismaSessionRepository(
  prisma: PrismaClient,
): SessionRepository {
  return {
    // Crea sesión y vinculaciones de jugadores en la misma transacción.
    async createSession(accountId, input) {
      const playerIds = input.playerIds ?? [];

      // La sesión y su roster inicial nacen juntas para evitar estados parciales entre tablas.
      const created = await prisma.$transaction(async (tx) => {
        const session = await tx.training_sessions.create({
          data: {
            account_id: accountId,
            team_id: input.teamId ?? null,
            kind: input.kind,
            scheduled_for: new Date(input.scheduledFor),
            duration_seconds: input.durationSeconds ?? null,
            notes: input.notes ?? null,
          },
        });
        if (playerIds.length > 0) {
          await tx.session_players.createMany({
            data: playerIds.map((pid) => ({
              session_id: session.id,
              player_id: pid,
              account_id: accountId,
            })),
            skipDuplicates: true,
          });
        }
        return session;
      });
      return mapSession({
        ...created,
        session_players: playerIds.map((player_id) => ({ player_id })),
      });
    },

    async listSessions(accountId) {
      // Se incluye session_players para devolver el aggregate completo sin consultas extra desde aplicación.
      const rows = await prisma.training_sessions.findMany({
        where: { account_id: accountId },
        orderBy: { scheduled_for: "desc" },
        include: { session_players: { select: { player_id: true } } },
      });
      return rows.map(mapSession);
    },

    async getSession(accountId, sessionId) {
      const row = await prisma.training_sessions.findFirst({
        where: { id: sessionId, account_id: accountId },
        include: { session_players: { select: { player_id: true } } },
      });
      return row ? mapSession(row) : null;
    },

    async appendMatchEvent(input) {
      // Los eventos se guardan desacoplados de la telemetría para soportar análisis aun sin GPS.
      const row = await prisma.match_events.create({
        data: {
          account_id: input.accountId,
          session_id: input.sessionId,
          occurred_at: new Date(input.occurredAt),
          match_minute: input.matchMinute ?? null,
          kind: input.kind,
          player_id: input.playerId ?? null,
          payload: (input.payload ?? {}) as object,
        },
      });
      return mapMatchEvent(row);
    },

    async listMatchEvents(accountId, sessionId) {
      const rows = await prisma.match_events.findMany({
        where: { account_id: accountId, session_id: sessionId },
        orderBy: { occurred_at: "asc" },
      });
      return rows.map(mapMatchEvent);
    },
  };
}
