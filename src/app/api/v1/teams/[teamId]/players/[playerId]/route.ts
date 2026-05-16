import { NextResponse } from "next/server";

import { readJson, withAuth } from "@/lib/api/handler";
import { updateTeamPlayerInputSchema } from "@/application/schemas";
import { teamUseCases } from "@/application/use-cases";
import { getServices } from "@/infrastructure/service-container";

/**
 * Actualiza la asignación de un jugador dentro del equipo.
 */
export const PATCH = withAuth<{ teamId: string; playerId: string }>(
  async ({ request, params, tenant }) => {
    const input = await readJson(request, updateTeamPlayerInputSchema);
    const rosterPlayer = await teamUseCases.updateTeamPlayer(
      getServices().deps,
      tenant,
      params.teamId,
      params.playerId,
      input,
    );
    return NextResponse.json(rosterPlayer, { status: 200 });
  },
);

/**
 * Quita un jugador del roster del equipo.
 */
export const DELETE = withAuth<{ teamId: string; playerId: string }>(
  async ({ params, tenant }) => {
    await teamUseCases.removePlayerFromTeam(
      getServices().deps,
      tenant,
      params.teamId,
      params.playerId,
    );
    return NextResponse.json({ ok: true }, { status: 200 });
  },
);
