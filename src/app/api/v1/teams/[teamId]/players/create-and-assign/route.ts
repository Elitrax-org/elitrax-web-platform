import { NextResponse } from "next/server";
import { z } from "zod";

import { readJson, withAuth } from "@/lib/api/handler";
import { createPlayerInputSchema, jerseyNumberSchema } from "@/application/schemas";
import { teamUseCases } from "@/application/use-cases";
import { getServices } from "@/infrastructure/service-container";

const createAndAssignInputSchema = createPlayerInputSchema.extend({
  jerseyNumber: jerseyNumberSchema,
});

type CreateAndAssignInput = z.infer<typeof createAndAssignInputSchema>;

export const POST = withAuth<{ teamId: string }>(async ({ request, params, tenant }) => {
  const input = await readJson<CreateAndAssignInput>(request, createAndAssignInputSchema);
  const rosterPlayer = await teamUseCases.createPlayerAndAddToTeam(
    getServices().deps,
    tenant,
    params.teamId,
    input,
  );
  return NextResponse.json(rosterPlayer, { status: 201 });
});