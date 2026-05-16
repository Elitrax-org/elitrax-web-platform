import { NextResponse } from "next/server";

import { readJson, withAuth } from "@/lib/api/handler";
import { createTeamInputSchema } from "@/application/schemas";
import { teamUseCases } from "@/application/use-cases";
import { getServices } from "@/infrastructure/service-container";

/**
 * Lista equipos de la cuenta activa.
 */
export const GET = withAuth(async ({ tenant }) => {
  // Teams no necesita paginación todavía; la ruta devuelve el aggregate simple de la cuenta activa.
  const teams = await teamUseCases.listTeams(getServices().deps, tenant);
  return { teams };
});

/**
 * Crea un nuevo equipo para la cuenta activa.
 */
export const POST = withAuth(async ({ request, tenant }) => {
  // La creación queda protegida por tenant y por los límites de plan dentro del use-case.
  const input = await readJson(request, createTeamInputSchema);
  const team = await teamUseCases.createTeam(getServices().deps, tenant, input);
  return NextResponse.json(team, { status: 201 });
});
