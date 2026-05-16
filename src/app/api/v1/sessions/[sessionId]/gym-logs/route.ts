import { NextResponse } from "next/server";

import { readJson, withAuth } from "@/lib/api/handler";
import { logGymExerciseInputSchema } from "@/application/schemas";
import { gymUseCases } from "@/application/use-cases";
import { getServices } from "@/infrastructure/service-container";

/**
 * Lista logs de ejercicios de gimnasio para la sesión.
 */
export const GET = withAuth<{ sessionId: string }>(async ({ params, tenant }) => {
  // Gym logs se exponen como subrecurso para separar trabajo de fuerza del resto de eventos de sesión.
  const logs = await gymUseCases.listGymLogs(
    getServices().deps,
    tenant,
    params.sessionId,
  );
  return { logs };
});

/**
 * Registra un log de ejercicio de gimnasio en la sesión.
 */
export const POST = withAuth<{ sessionId: string }>(async ({ request, params, tenant }) => {
  // Cada log describe una ejecución concreta de ejercicio y queda bajo la sesión como contenedor temporal.
  const input = await readJson(request, logGymExerciseInputSchema);
  const log = await gymUseCases.logGymExercise(
    getServices().deps,
    tenant,
    params.sessionId,
    input,
  );
  return NextResponse.json(log, { status: 201 });
});
