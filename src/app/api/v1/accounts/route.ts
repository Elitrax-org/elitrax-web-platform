import { NextResponse, type NextRequest } from "next/server";

import { mapErrorToResponse, readJson } from "@/lib/api/handler";
import { getCurrentUserId } from "@/lib/api/tenant-context";
import { createAccountInputSchema } from "@/application/schemas";
import { accountUseCases } from "@/application/use-cases";
import { getServices } from "@/infrastructure/service-container";

/**
 * Crea una cuenta para el usuario autenticado actual.
 */
export async function POST(request: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json(
        { error: { code: "unauthenticated", message: "Authentication required" } },
        { status: 401 },
      );
    }

    // La cuenta se crea fuera de `withAuth` porque onboarding y alta inicial ocurren antes de tener tenant activo.
    const input = await readJson(request, createAccountInputSchema);
    const account = await accountUseCases.createAccount(
      getServices().deps,
      { userId },
      input,
    );
    return NextResponse.json(account, { status: 201 });
  } catch (error) {
    return mapErrorToResponse(error);
  }
}
