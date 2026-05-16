import { NextResponse } from "next/server";

import { readJson, withAuth } from "@/lib/api/handler";
import { withRateLimit } from "@/lib/api/rate-limit";
import { requestRecommendationInputSchema } from "@/application/schemas";
import { aiUseCases } from "@/application/use-cases";
import { getServices } from "@/infrastructure/service-container";

/**
 * Ejecuta una corrida de recomendaciones AI para la cuenta autenticada.
 */
export const POST = withRateLimit(
  withAuth(async ({ request, tenant }) => {
    const services = getServices();
    // La ruta ensambla dependencias del proveedor AI activo, pero el ranking/validación vive en el use-case.
    const input = await readJson(request, requestRecommendationInputSchema);
    const run = await aiUseCases.requestRecommendation(
      services.deps,
      services.ai,
      tenant,
      input,
    );
    return NextResponse.json(run, { status: 201 });
  }),
  { bucket: "ai:recommendations", limit: 30, windowMs: 60_000 },
);
