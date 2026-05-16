import { canAddPlayerToAccount } from "@/domain/account/tenancy-policy";

import type { TenantContext } from "@/application/context";
import { ensurePermission } from "@/lib/permissions";
import type {
  ApplicationDependencies,
  Player,
  PlayerMeasurement,
} from "@/application/ports/repositories";
import type {
  CreatePlayerInput,
  PlayerMeasurementInput,
} from "@/application/schemas";
import {
  NotFoundError,
  SubscriptionLimitError,
} from "@/lib/errors";

/**
 * Crea un jugador validando permisos y cupo disponible del plan actual.
 */
export async function addPlayer(
  deps: ApplicationDependencies,
  context: TenantContext,
  input: CreatePlayerInput,
): Promise<Player> {
  ensurePermission(context.role, "players.manage");

  // El límite de jugadores depende de la cuenta y del plan, por eso se valida
  // antes de delegar al repositorio y no en la capa de persistencia.
  const subscription = await deps.subscriptions.getSubscription(context.accountId);
  if (!subscription) {
    throw new SubscriptionLimitError("subscription not found for account");
  }
  const currentPlayerCount = await deps.subscriptions.countPlayers(
    context.accountId,
  );
  const allowed = canAddPlayerToAccount({
    accountType: context.accountType,
    currentPlayerCount,
    playerLimit: subscription.entitlements.playerLimit,
  });
  if (!allowed) {
    throw new SubscriptionLimitError("player limit reached for current plan");
  }
  return deps.players.createPlayer(context.accountId, input);
}

/**
 * Lista jugadores visibles para la cuenta activa.
 */
export async function listPlayers(
  deps: ApplicationDependencies,
  context: TenantContext,
): Promise<readonly Player[]> {
  ensurePermission(context.role, "players.read");
  return deps.players.listPlayers(context.accountId);
}

/**
 * Obtiene un jugador y falla con NotFoundError si no existe.
 */
export async function getPlayerOrThrow(
  deps: ApplicationDependencies,
  context: TenantContext,
  playerId: string,
): Promise<Player> {
  ensurePermission(context.role, "players.read");
  const player = await deps.players.getPlayer(context.accountId, playerId);
  if (!player) throw new NotFoundError("player");
  return player;
}

/**
 * Registra una medición antropométrica para un jugador existente.
 */
export async function recordMeasurement(
  deps: ApplicationDependencies,
  context: TenantContext,
  playerId: string,
  input: PlayerMeasurementInput,
): Promise<PlayerMeasurement> {
  ensurePermission(context.role, "players.manage");
  // La medición siempre se ancla a un jugador ya existente para mantener integridad funcional.
  const player = await deps.players.getPlayer(context.accountId, playerId);
  if (!player) throw new NotFoundError("player");
  return deps.measurements.recordMeasurement({
    accountId: context.accountId,
    playerId,
    data: input,
  });
}

/**
 * Lista historial de mediciones de un jugador.
 */
export async function listMeasurements(
  deps: ApplicationDependencies,
  context: TenantContext,
  playerId: string,
): Promise<readonly PlayerMeasurement[]> {
  ensurePermission(context.role, "players.read");
  return deps.measurements.listMeasurements(context.accountId, playerId);
}
