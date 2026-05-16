import type { TenantContext } from "@/application/context";
import { ensurePermission } from "@/lib/permissions";
import type {
  ApplicationDependencies,
  GymExerciseLogRecord,
} from "@/application/ports/repositories";
import type { LogGymExerciseInput } from "@/application/schemas";
import { NotFoundError } from "@/lib/errors";

/**
 * Registra una ejecución de ejercicio de gimnasio en una sesión.
 */
export async function logGymExercise(
  deps: ApplicationDependencies,
  context: TenantContext,
  sessionId: string,
  input: LogGymExerciseInput,
): Promise<GymExerciseLogRecord> {
  ensurePermission(context.role, "sessions.manage");
  const session = await deps.sessions.getSession(context.accountId, sessionId);
  if (!session) throw new NotFoundError("session");
  return deps.gymLogs.logExercise({
    accountId: context.accountId,
    sessionId,
    data: input,
  });
}

/**
 * Lista logs de ejercicios para una sesión de entrenamiento.
 */
export async function listGymLogs(
  deps: ApplicationDependencies,
  context: TenantContext,
  sessionId: string,
): Promise<readonly GymExerciseLogRecord[]> {
  ensurePermission(context.role, "sessions.read");
  return deps.gymLogs.listForSession(context.accountId, sessionId);
}
