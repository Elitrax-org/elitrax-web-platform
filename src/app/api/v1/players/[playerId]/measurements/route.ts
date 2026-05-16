import { NextResponse } from "next/server";

import { readJson, withAuth } from "@/lib/api/handler";
import { playerMeasurementInputSchema } from "@/application/schemas";
import { playerUseCases } from "@/application/use-cases";
import { getServices } from "@/infrastructure/service-container";

/**
 * Lista mediciones físicas del jugador indicado.
 */
export const GET = withAuth<{ playerId: string }>(async ({ params, tenant }) => {
  // El subrecurso cuelga del jugador para dejar explícito el scope del historial de mediciones.
  const measurements = await playerUseCases.listMeasurements(
    getServices().deps,
    tenant,
    params.playerId,
  );
  return { measurements };
});

/**
 * Registra una nueva medición física para el jugador.
 */
export const POST = withAuth<{ playerId: string }>(async ({ request, params, tenant }) => {
  // La ruta valida el body y delega al use-case la verificación de existencia del jugador.
  const input = await readJson(request, playerMeasurementInputSchema);
  const measurement = await playerUseCases.recordMeasurement(
    getServices().deps,
    tenant,
    params.playerId,
    input,
  );
  return NextResponse.json(measurement, { status: 201 });
});
