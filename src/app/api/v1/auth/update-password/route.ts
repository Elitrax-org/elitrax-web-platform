import { NextResponse, type NextRequest } from "next/server";

import { mapErrorToResponse, readJson } from "@/lib/api/handler";
import { updatePasswordInputSchema } from "@/application/schemas/auth";
import { getAuthGateway } from "@/infrastructure/auth/gateway";

/**
 * Actualiza contraseña del usuario autenticado según el provider activo.
 */
export async function POST(request: NextRequest) {
  try {
    // Este endpoint opera sobre la sesión actual o sobre el contexto que el proveedor haya restaurado tras recovery.
    const input = await readJson(request, updatePasswordInputSchema);
    await getAuthGateway().updatePassword(input);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return mapErrorToResponse(error);
  }
}
