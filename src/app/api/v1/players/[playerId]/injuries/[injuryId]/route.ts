import { NextResponse } from "next/server";

import { readJson, withAuth } from "@/lib/api/handler";
import { updateInjuryInputSchema } from "@/application/schemas";
import { injuryUseCases } from "@/application/use-cases";
import { getServices } from "@/infrastructure/service-container";

/**
 * Actualiza una lesión puntual del jugador.
 */
export const PATCH = withAuth<{ playerId: string; injuryId: string }>(
  async ({ request, params, tenant }) => {
    // PATCH mantiene el contrato parcial de edición mientras el use-case resuelve coherencia anatómica y permisos.
    const input = await readJson(request, updateInjuryInputSchema);
    const injury = await injuryUseCases.updateInjury(
      getServices().deps,
      tenant,
      params.playerId,
      params.injuryId,
      input,
    );
    return NextResponse.json(injury);
  },
);

/**
 * Elimina una lesión puntual del jugador.
 */
export const DELETE = withAuth<{ playerId: string; injuryId: string }>(
  async ({ params, tenant }) => {
    // El borrado se responde con `{ ok: true }` para mantener un contrato simple y uniforme en UI/actions.
    await injuryUseCases.deleteInjury(
      getServices().deps,
      tenant,
      params.playerId,
      params.injuryId,
    );
    return NextResponse.json({ ok: true });
  },
);
