import { NextResponse } from "next/server";

import { readJson, withAuth } from "@/lib/api/handler";
import { addTeamPlayerInputSchema } from "@/application/schemas";
import { teamUseCases } from "@/application/use-cases";
import { getServices } from "@/infrastructure/service-container";

/**
 * Lista roster de jugadores de un equipo.
 */
export const GET = withAuth<{ teamId: string }>(async ({ params, tenant }) => {
  // El roster es un aggregate propio del equipo: jugador + metadata de asignación como dorsal.
  const roster = await teamUseCases.listTeamPlayers(
    getServices().deps,
    tenant,
    params.teamId,
  );
  return { roster };
});

/**
 * Agrega un jugador al roster del equipo.
 */
export const POST = withAuth<{ teamId: string }>(async ({ request, params, tenant }) => {
  // La creación del vínculo equipo-jugador se modela como subrecurso para mantener semántica REST clara.
  const input = await readJson(request, addTeamPlayerInputSchema);
  const rosterPlayer = await teamUseCases.addPlayerToTeam(
    getServices().deps,
    tenant,
    params.teamId,
    input,
  );
  return NextResponse.json(rosterPlayer, { status: 201 });
});
