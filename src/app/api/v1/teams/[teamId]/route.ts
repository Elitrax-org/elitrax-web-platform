import { NextResponse } from "next/server";

import { readJson, withAuth } from "@/lib/api/handler";
import { updateTeamInputSchema } from "@/application/schemas";
import { teamUseCases } from "@/application/use-cases";
import { getServices } from "@/infrastructure/service-container";

export const PATCH = withAuth<{ teamId: string }>(async ({ request, params, tenant }) => {
  const input = await readJson(request, updateTeamInputSchema);
  const team = await teamUseCases.updateTeam(getServices().deps, tenant, params.teamId, input);
  return NextResponse.json(team, { status: 200 });
});