import "server-only";

import type { PrismaClient, plan_tier } from "@prisma/client";

import type { SubscriptionRepository } from "@/application/ports/repositories";
import { mapSubscription } from "./mappers";

const ACTIVE_STATUSES = ["trialing", "active", "past_due"] as const;

/**
 * Repositorio Prisma para suscripciones y contadores asociados.
 *
 * Mantiene una única suscripción activa por cuenta actualizando la más reciente
 * en estado activo/trial/past_due cuando llega un nuevo evento.
 */
export function createPrismaSubscriptionRepository(
  prisma: PrismaClient,
): SubscriptionRepository {
  async function planIdFor(tier: plan_tier): Promise<string> {
    const plan = await prisma.plans.findUnique({ where: { tier } });
    if (!plan) {
      throw new Error(`plan not found for tier ${tier}`);
    }
    return plan.id;
  }

  return {
    async getSubscription(accountId) {
      const row = await prisma.subscriptions.findFirst({
        where: { account_id: accountId },
        orderBy: { created_at: "desc" },
        include: { plans: true },
      });
      return row ? mapSubscription(row) : null;
    },

    // Upsert orientado a estado activo: evita crear duplicados funcionales.
    async upsertSubscription(input) {
      const planId = await planIdFor(input.tier);
      const existingActive = await prisma.subscriptions.findFirst({
        where: {
          account_id: input.accountId,
          status: { in: [...ACTIVE_STATUSES] },
        },
        orderBy: { created_at: "desc" },
      });

      const data = {
        plan_id: planId,
        status: input.status,
        billing_interval: input.interval ?? null,
        external_provider: input.externalProvider ?? null,
        external_id: input.externalId ?? null,
      };

      const saved = existingActive
        ? await prisma.subscriptions.update({
            where: { id: existingActive.id },
            data,
            include: { plans: true },
          })
        : await prisma.subscriptions.create({
            data: { account_id: input.accountId, ...data },
            include: { plans: true },
          });

      return mapSubscription(saved);
    },

    async countTeams(accountId) {
      return prisma.teams.count({ where: { account_id: accountId } });
    },

    async countPlayers(accountId) {
      return prisma.players.count({ where: { account_id: accountId } });
    },
  };
}
