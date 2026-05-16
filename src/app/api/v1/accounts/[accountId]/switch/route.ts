import { NextResponse } from "next/server";

import { mapErrorToResponse } from "@/lib/api/handler";
import {
  getCurrentUserId,
  setActiveAccountId,
} from "@/lib/api/tenant-context";
import { getServices } from "@/infrastructure/service-container";

/**
 * Cambia la cuenta activa del usuario si posee membresía en ella.
 */
export async function POST(
  _request: Request,
  routeContext: { params: Promise<{ accountId: string }> },
) {
  try {
    // El cambio de tenant requiere autenticación, pero no `withAuth`, porque justamente cambia el contexto futuro.
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json(
        { error: { code: "unauthenticated", message: "Authentication required" } },
        { status: 401 },
      );
    }
    const { accountId } = await routeContext.params;
    const services = getServices();
    // Se valida membresía explícita para impedir seleccionar cuentas ajenas sólo con conocer el id.
    const membership = await services.deps.accounts.getMembership(accountId, userId);
    if (!membership) {
      return NextResponse.json(
        { error: { code: "not_found", message: "membership not found" } },
        { status: 404 },
      );
    }
    await setActiveAccountId(accountId);
    return NextResponse.json({ accountId });
  } catch (error) {
    return mapErrorToResponse(error);
  }
}
