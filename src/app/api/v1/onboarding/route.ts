import { NextResponse, type NextRequest } from "next/server";

import { mapErrorToResponse, readJson } from "@/lib/api/handler";
import {
  getCurrentUserId,
  setActiveAccountId,
} from "@/lib/api/tenant-context";
import { onboardingInputSchema } from "@/application/schemas";
import { accountUseCases } from "@/application/use-cases";
import { getServices } from "@/infrastructure/service-container";

/**
 * Completa onboarding inicial y fija la nueva cuenta como activa.
 */
export async function POST(request: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json(
        {
          error: {
            code: "unauthenticated",
            message: "Authentication required",
          },
        },
        { status: 401 },
      );
    }

    // Onboarding crea la cuenta inicial y deja la cookie de tenant lista para entrar al app shell sin paso extra.
    const input = await readJson(request, onboardingInputSchema);
    const result = await accountUseCases.completeOnboarding(
      getServices().deps,
      { userId },
      input,
    );
    await setActiveAccountId(result.account.id);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return mapErrorToResponse(error);
  }
}
