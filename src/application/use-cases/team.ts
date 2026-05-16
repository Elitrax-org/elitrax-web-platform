import { canCreateTeamForAccount } from "@/domain/account/tenancy-policy";

import type { TenantContext } from "@/application/context";
import { ensurePermission } from "@/lib/permissions";
import type {
  ApplicationDependencies,
  Team,
  TeamRosterPlayer,
} from "@/application/ports/repositories";
import type {
  AddTeamPlayerInput,
  CreateTeamInput,
  CreatePlayerInput,
  UpdateTeamInput,
  UpdateTeamPlayerInput,
} from "@/application/schemas";
import { NotFoundError, SubscriptionLimitError } from "@/lib/errors";
import { logger } from "@/lib/logging";
import { addPlayer as addPlayerUseCase } from "@/application/use-cases/player";

/**
 * Crea un equipo validando permisos y límites del plan vigente.
 */
export async function createTeam(
  deps: ApplicationDependencies,
  context: TenantContext,
  input: CreateTeamInput,
): Promise<Team> {
  ensurePermission(context.role, "teams.manage");

  const subscription = await deps.subscriptions.getSubscription(context.accountId);
  if (!subscription) {
    throw new SubscriptionLimitError("subscription not found for account");
  }

  const currentTeamCount = await deps.subscriptions.countTeams(context.accountId);
  const allowed = canCreateTeamForAccount({
    accountType: context.accountType,
    currentTeamCount,
    teamLimit: subscription.entitlements.teamLimit,
  });
  if (!allowed) {
    throw new SubscriptionLimitError("team limit reached for current plan");
  }

  return deps.teams.createTeam(context.accountId, input);
}

/**
 * Lista equipos de la cuenta activa.
 */
export async function listTeams(
  deps: ApplicationDependencies,
  context: TenantContext,
): Promise<readonly Team[]> {
  ensurePermission(context.role, "roster.read");
  return deps.teams.listTeams(context.accountId);
}

/**
 * Obtiene equipo por id o lanza NotFoundError.
 */
export async function getTeamOrThrow(
  deps: ApplicationDependencies,
  context: TenantContext,
  teamId: string,
): Promise<Team> {
  ensurePermission(context.role, "roster.read");
  const team = await deps.teams.getTeam(context.accountId, teamId);
  if (!team) throw new NotFoundError("team");
  return team;
}

/**
 * Actualiza la configuración de un equipo existente.
 */
export async function updateTeam(
  deps: ApplicationDependencies,
  context: TenantContext,
  teamId: string,
  input: UpdateTeamInput,
): Promise<Team> {
  ensurePermission(context.role, "teams.manage");
  const team = await deps.teams.getTeam(context.accountId, teamId);
  if (!team) throw new NotFoundError("team");
  return deps.teams.updateTeam(context.accountId, teamId, input);
}

/**
 * Asocia un jugador a un equipo y normaliza número de camiseta.
 */
export async function addPlayerToTeam(
  deps: ApplicationDependencies,
  context: TenantContext,
  teamId: string,
  input: AddTeamPlayerInput,
): Promise<TeamRosterPlayer> {
  ensurePermission(context.role, "players.manage");

  const [team, player] = await Promise.all([
    deps.teams.getTeam(context.accountId, teamId),
    deps.players.getPlayer(context.accountId, input.playerId),
  ]);
  if (!team) throw new NotFoundError("team");
  if (!player) throw new NotFoundError("player");

  const normalizedJerseyNumber = input.jerseyNumber?.trim().toUpperCase();

  return deps.teamPlayers.addPlayerToTeam({
    accountId: context.accountId,
    teamId,
    playerId: input.playerId,
    data: {
      ...input,
      jerseyNumber: normalizedJerseyNumber,
    },
  });
}

/**
 * Crea un jugador y lo agrega al roster como una sola operación lógica.
 * Si falla la asignación al equipo, intenta revertir la creación del jugador.
 */
export async function createPlayerAndAddToTeam(
  deps: ApplicationDependencies,
  context: TenantContext,
  teamId: string,
  input: CreatePlayerInput & { jerseyNumber?: string },
): Promise<TeamRosterPlayer> {
  ensurePermission(context.role, "players.manage");

  const player = await addPlayerUseCase(deps, context, {
    displayName: input.displayName,
    birthDate: input.birthDate,
    position: input.position,
    metadata: input.metadata,
  });

  try {
    return await addPlayerToTeam(deps, context, teamId, {
      playerId: player.id,
      jerseyNumber: input.jerseyNumber,
    });
  } catch (error) {
    try {
      await deps.players.deletePlayer(context.accountId, player.id);
    } catch (rollbackError) {
      logger.error("failed to rollback player creation after roster assignment error", {
        accountId: context.accountId,
        teamId,
        playerId: player.id,
        error: rollbackError instanceof Error ? rollbackError.message : String(rollbackError),
      });
    }
    throw error;
  }
}

/**
 * Lista jugadores vinculados a un equipo.
 */
export async function listTeamPlayers(
  deps: ApplicationDependencies,
  context: TenantContext,
  teamId: string,
): Promise<readonly TeamRosterPlayer[]> {
  ensurePermission(context.role, "roster.read");
  const team = await deps.teams.getTeam(context.accountId, teamId);
  if (!team) throw new NotFoundError("team");
  return deps.teamPlayers.listTeamPlayers(context.accountId, teamId);
}

/**
 * Actualiza metadatos de un jugador dentro de un equipo.
 */
export async function updateTeamPlayer(
  deps: ApplicationDependencies,
  context: TenantContext,
  teamId: string,
  playerId: string,
  input: UpdateTeamPlayerInput,
): Promise<TeamRosterPlayer> {
  ensurePermission(context.role, "players.manage");
  const [team, player] = await Promise.all([
    deps.teams.getTeam(context.accountId, teamId),
    deps.players.getPlayer(context.accountId, playerId),
  ]);
  if (!team) throw new NotFoundError("team");
  if (!player) throw new NotFoundError("player");

  const normalizedJerseyNumber = input.jerseyNumber?.trim().toUpperCase();

  return deps.teamPlayers.updateTeamPlayer({
    accountId: context.accountId,
    teamId,
    playerId,
    data: {
      ...input,
      jerseyNumber: normalizedJerseyNumber,
    },
  });
}

/**
 * Quita un jugador de un equipo existente.
 */
export async function removePlayerFromTeam(
  deps: ApplicationDependencies,
  context: TenantContext,
  teamId: string,
  playerId: string,
): Promise<void> {
  ensurePermission(context.role, "players.manage");
  const [team, player] = await Promise.all([
    deps.teams.getTeam(context.accountId, teamId),
    deps.players.getPlayer(context.accountId, playerId),
  ]);
  if (!team) throw new NotFoundError("team");
  if (!player) throw new NotFoundError("player");

  await deps.teamPlayers.removeTeamPlayer(context.accountId, teamId, playerId);
}
