import { NextResponse } from "next/server";

import { readJson, withAuth } from "@/lib/api/handler";
import { paginateByKeyset, parseLimit } from "@/lib/api/pagination";
import { withRateLimit } from "@/lib/api/rate-limit";
import { registerTelemetryUploadInputSchema } from "@/application/schemas";
import { telemetryUseCases } from "@/application/use-cases";
import { getServices } from "@/infrastructure/service-container";

/**
 * Lista uploads de telemetría de la cuenta activa.
 *
 * Usa paginación keyset con cursor estable (timestamp + id).
 */
export const GET = withAuth(async ({ request, tenant }) => {
  const services = getServices();

  // Se lista metadata de uploads, no muestras crudas, para mantener el endpoint liviano.
  const uploads = await services.deps.telemetry.listUploads(tenant.accountId);
  const params = request.nextUrl.searchParams;
  const page = paginateByKeyset(uploads, {
    limit: parseLimit(params.get("limit")),
    cursor: params.get("cursor"),
    getTimestamp: (upload) => upload.uploadedAt,
    getId: (upload) => upload.id,
  });
  return { uploads: page.items, nextCursor: page.nextCursor };
});

/**
 * Registra un nuevo upload de telemetría.
 *
 * Protegido por autenticación + rate limit para evitar abuso del endpoint.
 */
export const POST = withRateLimit(
  withAuth(async ({ request, tenant }) => {
    // La ingesta empieza registrando el upload; los batches de muestras llegan después por otro endpoint.
    const input = await readJson(request, registerTelemetryUploadInputSchema);
    const upload = await telemetryUseCases.registerTelemetryUpload(
      getServices().deps,
      tenant,
      input,
    );
    return NextResponse.json(upload, { status: 201 });
  }),
  { bucket: "telemetry:uploads", limit: 60, windowMs: 60_000 },
);
