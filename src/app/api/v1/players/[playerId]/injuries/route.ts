import { NextResponse } from "next/server";

import { readJson, withAuth } from "@/lib/api/handler";
import { logInjuryInputSchema } from "@/application/schemas";
import { injuryUseCases } from "@/application/use-cases";
import { getServices } from "@/infrastructure/service-container";

/**
 * Lista lesiones registradas para un jugador.
 */
export const GET = withAuth<{ playerId: string }>(async ({ params, tenant }) => {
  // Las lesiones viven como subrecurso del jugador porque su semántica siempre depende de ese historial clínico.
  const injuries = await injuryUseCases.listInjuries(
    getServices().deps,
    tenant,
    params.playerId,
  );
  return { injuries };
});

/**
 * Registra una nueva lesión para el jugador.
 */
export const POST = withAuth<{ playerId: string }>(async ({ request, params, tenant }) => {
  // El use-case aplica validaciones anatómicas y permisos; la ruta sólo orquesta HTTP + schema.
  const input = await readJson(request, logInjuryInputSchema);
  const injury = await injuryUseCases.logInjury(
    getServices().deps,
    tenant,
    params.playerId,
    input,
  );
  return NextResponse.json(injury, { status: 201 });
});
