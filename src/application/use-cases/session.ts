import type { TenantContext } from "@/application/context";
import { ensurePermission } from "@/lib/permissions";
import type {
  ApplicationDependencies,
  MatchEvent,
  TrainingSession,
} from "@/application/ports/repositories";
import type {
  AppendMatchEventInput,
  CreateSessionInput,
} from "@/application/schemas";
import { NotFoundError } from "@/lib/errors";

/**
 * Crea una sesión de entrenamiento en la cuenta activa.
 */
export async function createSession(
  deps: ApplicationDependencies,
  context: TenantContext,
  input: CreateSessionInput,
): Promise<TrainingSession> {
  ensurePermission(context.role, "sessions.manage");
  // La transacción real vive en el repositorio; el use-case concentra permisos y contexto tenant.
  return deps.sessions.createSession(context.accountId, input);
}

/**
 * Lista sesiones de entrenamiento para la cuenta actual.
 */
export async function listSessions(
  deps: ApplicationDependencies,
  context: TenantContext,
): Promise<readonly TrainingSession[]> {
  ensurePermission(context.role, "sessions.read");
  return deps.sessions.listSessions(context.accountId);
}

/**
 * Agrega un evento de partido vinculado a una sesión existente.
 */
export async function appendMatchEvent(
  deps: ApplicationDependencies,
  context: TenantContext,
  sessionId: string,
  input: AppendMatchEventInput,
): Promise<MatchEvent> {
  ensurePermission(context.role, "sessions.manage");
  // Se verifica primero la sesión para evitar crear eventos huérfanos.
  const session = await deps.sessions.getSession(context.accountId, sessionId);
  if (!session) throw new NotFoundError("session");
  return deps.sessions.appendMatchEvent({
    accountId: context.accountId,
    sessionId,
    occurredAt: input.occurredAt ?? new Date().toISOString(),
    matchMinute: input.matchMinute,
    kind: input.kind,
    playerId: input.playerId,
    payload: input.payload,
  });
}

/**
 * Lista eventos de partido registrados para una sesión.
 */
export async function listMatchEvents(
  deps: ApplicationDependencies,
  context: TenantContext,
  sessionId: string,
): Promise<readonly MatchEvent[]> {
  ensurePermission(context.role, "sessions.read");
  return deps.sessions.listMatchEvents(context.accountId, sessionId);
}
