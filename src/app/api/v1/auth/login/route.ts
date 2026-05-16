import { NextResponse, type NextRequest } from "next/server";

import { mapErrorToResponse, readJson } from "@/lib/api/handler";
import { withRateLimit } from "@/lib/api/rate-limit";
import { signInInputSchema } from "@/application/schemas/auth";
import { getAuthGateway } from "@/infrastructure/auth/gateway";

/**
 * Inicia sesión con email/password a través del gateway de auth activo.
 */
export const POST = withRateLimit(
  async (request: NextRequest) => {
    try {
      // Login no usa `withAuth` porque justamente crea la sesión inicial del usuario.
      const input = await readJson(request, signInInputSchema);
      await getAuthGateway().signInWithPassword(input);
      return NextResponse.json({ ok: true });
    } catch (error) {
      return mapErrorToResponse(error);
    }
  },
  { bucket: "auth:login", limit: 10, windowMs: 60_000 },
);
