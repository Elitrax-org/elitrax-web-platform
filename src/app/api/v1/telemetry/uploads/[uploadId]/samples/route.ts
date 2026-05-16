import { NextResponse } from "next/server";

import { readJson, withAuth } from "@/lib/api/handler";
import { ingestTelemetryBatchInputSchema } from "@/application/schemas";
import { telemetryUseCases } from "@/application/use-cases";
import { getServices } from "@/infrastructure/service-container";
import { ValidationError } from "@/lib/errors";

/**
 * Ingresa muestras crudas para un upload específico de telemetría.
 * Valida coherencia entre uploadId de URL y cuerpo.
 */
export const POST = withAuth<{ uploadId: string }>(async ({ request, params, tenant }) => {
  // El guard de coherencia URL/body evita asociar batches al upload equivocado por error del cliente.
  const input = await readJson(request, ingestTelemetryBatchInputSchema);
  if (input.uploadId !== params.uploadId) {
    throw new ValidationError("uploadId in body does not match URL");
  }
  const upload = await telemetryUseCases.ingestTelemetryBatch(
    getServices().deps,
    tenant,
    input,
  );
  return NextResponse.json(upload, { status: 202 });
});
