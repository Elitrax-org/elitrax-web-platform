import { withAuth } from "@/lib/api/handler";
import { telemetryUseCases } from "@/application/use-cases";
import { getServices } from "@/infrastructure/service-container";

/**
 * Calcula métricas derivadas para un upload de telemetría específico.
 */
export const GET = withAuth<{ uploadId: string }>(async ({ params, tenant }) => {
  // Este endpoint es de cálculo derivado: no muta uploads, sólo transforma muestras válidas en métricas útiles.
  const metrics = await telemetryUseCases.computeDerivedMetricsForUpload(
    getServices().deps,
    tenant,
    params.uploadId,
  );
  return { uploadId: params.uploadId, metrics };
});
