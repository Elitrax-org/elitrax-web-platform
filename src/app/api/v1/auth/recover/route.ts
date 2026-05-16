import { NextResponse, type NextRequest } from "next/server";

import { mapErrorToResponse, readJson } from "@/lib/api/handler";
import { withRateLimit } from "@/lib/api/rate-limit";
import { requestPasswordResetInputSchema } from "@/application/schemas/auth";
import { getAuthGateway } from "@/infrastructure/auth/gateway";

/**
 * Solicita envío de enlace de recuperación de contraseña.
 */
export const POST = withRateLimit(
  async (request: NextRequest) => {
    try {
      // El endpoint no revela si el email existe; el gateway/proveedor decide el detalle real del flujo.
      const input = await readJson(request, requestPasswordResetInputSchema);
      await getAuthGateway().requestPasswordReset(input);
      return NextResponse.json({ ok: true });
    } catch (error) {
      return mapErrorToResponse(error);
    }
  },
  { bucket: "auth:recover", limit: 5, windowMs: 60_000 },
);
