import { NextResponse, type NextRequest } from "next/server";

import { mapErrorToResponse, readJson } from "@/lib/api/handler";
import { withRateLimit } from "@/lib/api/rate-limit";
import { signUpInputSchema } from "@/application/schemas/auth";
import { getAuthGateway } from "@/infrastructure/auth/gateway";

/**
 * Registra una cuenta de usuario y devuelve si requiere confirmación por email.
 */
export const POST = withRateLimit(
  async (request: NextRequest) => {
    try {
      // El endpoint devuelve explícitamente si hay confirmación por email para que la UI decida el siguiente paso.
      const input = await readJson(request, signUpInputSchema);
      const result = await getAuthGateway().signUpWithPassword(input);
      return NextResponse.json({ ok: true, ...result });
    } catch (error) {
      return mapErrorToResponse(error);
    }
  },
  { bucket: "auth:sign-up", limit: 5, windowMs: 60_000 },
);
