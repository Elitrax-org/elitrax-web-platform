import { NextResponse } from "next/server";

import { readJson, withAuth } from "@/lib/api/handler";
import { inviteMemberInputSchema } from "@/application/schemas";
import { accountUseCases } from "@/application/use-cases";
import { getServices } from "@/infrastructure/service-container";
import { AuthorizationError } from "@/lib/errors";

/**
 * Crea invitaciones de miembros para la cuenta activa autenticada.
 */
export const POST = withAuth<{ accountId: string }>(async ({ request, params, tenant }) => {
  // La invitación se limita a la cuenta activa para evitar operar sobre otra membresía del usuario por URL directa.
  if (params.accountId !== tenant.accountId) {
    throw new AuthorizationError("active account mismatch");
  }
  const input = await readJson(request, inviteMemberInputSchema);
  const invitation = await accountUseCases.inviteMember(
    getServices().deps,
    tenant,
    input,
  );
  return NextResponse.json(invitation, { status: 201 });
});
