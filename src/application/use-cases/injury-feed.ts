import { isBodyRegion, isBodyZoneDetailValidForRegion } from "@/domain/health/body-zone";

import type { TenantContext } from "@/application/context";
import { ensurePermission } from "@/lib/permissions";
import type {
  ApplicationDependencies,
  Injury,
  PlayerComment,
} from "@/application/ports/repositories";
import type {
  LogInjuryInput,
  PostCommentInput,
  UpdateInjuryInput,
  UpdateCommentInput,
} from "@/application/schemas";
import { AuthorizationError, NotFoundError, ValidationError } from "@/lib/errors";

/**
 * Registra una lesión validando región corporal y zona detallada.
 */
export async function logInjury(
  deps: ApplicationDependencies,
  context: TenantContext,
  playerId: string,
  input: LogInjuryInput,
): Promise<Injury> {
  ensurePermission(context.role, "injuries.manage");
  if (!isBodyRegion(input.bodyRegion)) {
    throw new ValidationError("invalid bodyRegion");
  }
  if (!isBodyZoneDetailValidForRegion(input.bodyRegion, input.bodyZoneDetail)) {
    throw new ValidationError("bodyZoneDetail outside allowed range for bodyRegion");
  }
  const player = await deps.players.getPlayer(context.accountId, playerId);
  if (!player) throw new NotFoundError("player");
  return deps.injuries.logInjury({
    accountId: context.accountId,
    playerId,
    authorUserId: context.actor.userId,
    data: input,
  });
}

/**
 * Actualiza lesión existente con validaciones de coherencia anatómica.
 */
export async function updateInjury(
  deps: ApplicationDependencies,
  context: TenantContext,
  playerId: string,
  injuryId: string,
  input: UpdateInjuryInput,
): Promise<Injury> {
  ensurePermission(context.role, "injuries.manage");
  if (input.bodyRegion && !isBodyRegion(input.bodyRegion)) {
    throw new ValidationError("invalid bodyRegion");
  }
  if (input.bodyRegion && input.bodyZoneDetail != null) {
    if (!isBodyZoneDetailValidForRegion(input.bodyRegion, input.bodyZoneDetail)) {
      throw new ValidationError("bodyZoneDetail outside allowed range for bodyRegion");
    }
  }
  const player = await deps.players.getPlayer(context.accountId, playerId);
  if (!player) throw new NotFoundError("player");
  return deps.injuries.updateInjury({
    accountId: context.accountId,
    playerId,
    injuryId,
    authorUserId: context.actor.userId,
    data: input,
  });
}

/**
 * Lista lesiones de un jugador.
 */
export async function listInjuries(
  deps: ApplicationDependencies,
  context: TenantContext,
  playerId: string,
): Promise<readonly Injury[]> {
  ensurePermission(context.role, "injuries.read");
  return deps.injuries.listInjuriesForPlayer(context.accountId, playerId);
}

/**
 * Elimina una lesión registrada para un jugador.
 */
export async function deleteInjury(
  deps: ApplicationDependencies,
  context: TenantContext,
  playerId: string,
  injuryId: string,
): Promise<void> {
  ensurePermission(context.role, "injuries.manage");
  const player = await deps.players.getPlayer(context.accountId, playerId);
  if (!player) throw new NotFoundError("player");
  await deps.injuries.deleteInjury({
    accountId: context.accountId,
    playerId,
    injuryId,
  });
}

/**
 * Publica un comentario asociado a un jugador.
 */
export async function postComment(
  deps: ApplicationDependencies,
  context: TenantContext,
  playerId: string,
  input: PostCommentInput,
): Promise<PlayerComment> {
  ensurePermission(context.role, "comments.create");
  const player = await deps.players.getPlayer(context.accountId, playerId);
  if (!player) throw new NotFoundError("player");
  return deps.comments.postComment({
    accountId: context.accountId,
    playerId,
    authorUserId: context.actor.userId,
    data: input,
  });
}

/**
 * Lista comentarios del feed del jugador.
 */
export async function listComments(
  deps: ApplicationDependencies,
  context: TenantContext,
  playerId: string,
): Promise<readonly PlayerComment[]> {
  ensurePermission(context.role, "players.read");
  return deps.comments.listComments(context.accountId, playerId);
}

/**
 * Edita comentario propio; restringe edición a su autor.
 */
export async function updateComment(
  deps: ApplicationDependencies,
  context: TenantContext,
  playerId: string,
  commentId: string,
  input: UpdateCommentInput,
): Promise<PlayerComment> {
  ensurePermission(context.role, "comments.create");
  const existing = await deps.comments.getComment(
    context.accountId,
    playerId,
    commentId,
  );
  if (!existing) throw new NotFoundError("comment");
  if (!existing.authorUserId || existing.authorUserId !== context.actor.userId) {
    throw new AuthorizationError("can only edit your own comments");
  }
  return deps.comments.updateComment({
    accountId: context.accountId,
    playerId,
    commentId,
    data: input,
  });
}

/**
 * Elimina comentario propio; restringe borrado a su autor.
 */
export async function deleteComment(
  deps: ApplicationDependencies,
  context: TenantContext,
  playerId: string,
  commentId: string,
): Promise<void> {
  ensurePermission(context.role, "comments.create");
  const existing = await deps.comments.getComment(
    context.accountId,
    playerId,
    commentId,
  );
  if (!existing) throw new NotFoundError("comment");
  if (!existing.authorUserId || existing.authorUserId !== context.actor.userId) {
    throw new AuthorizationError("can only delete your own comments");
  }
  await deps.comments.deleteComment(context.accountId, playerId, commentId);
}
