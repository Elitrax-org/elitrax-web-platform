import { NextResponse } from "next/server";

import { mapErrorToResponse } from "@/lib/api/handler";
import { getAuthGateway } from "@/infrastructure/auth/gateway";

/**
 * Cierra sesión del usuario actual y limpia estado de autenticación.
 */
export async function POST() {
  try {
    // Logout también limpia la cuenta activa porque el tenant seleccionado depende de la sesión del usuario.
    await getAuthGateway().signOut();
    return NextResponse.json({ ok: true });
  } catch (error) {
    return mapErrorToResponse(error);
  }
}
