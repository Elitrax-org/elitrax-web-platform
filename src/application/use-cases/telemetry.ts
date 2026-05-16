import { planAllowsFeature } from "@/domain/billing/feature-entitlement-policy";
import {
  deriveSessionMetrics,
  type TelemetrySample,
} from "@/domain/telemetry/telemetry-metrics-calculator";
import { createGeoPoint } from "@/domain/shared/geo";

import type { TenantContext } from "@/application/context";
import { ensurePermission } from "@/lib/permissions";
import {
  AuthorizationError,
  NotFoundError,
} from "@/lib/errors";
import type {
  ApplicationDependencies,
  TelemetryUpload,
} from "@/application/ports/repositories";
import type {
  IngestTelemetryBatchInput,
  RegisterTelemetryUploadInput,
} from "@/application/schemas";

/**
 * Verifica que la cuenta tenga suscripción y feature de telemetría habilitada.
 */
async function ensureTelemetryEntitlement(
  deps: ApplicationDependencies,
  context: TenantContext,
) {
  // Telemetría es una feature contractual del plan, no sólo un permiso de rol.
  const subscription = await deps.subscriptions.getSubscription(context.accountId);
  if (!subscription) {
    throw new AuthorizationError("subscription not found for account");
  }
  if (!planAllowsFeature(subscription.entitlements, "telemetry_upload")) {
    throw new AuthorizationError("plan does not include telemetry uploads");
  }
}

/**
 * Registra metadata de un upload de telemetría.
 *
 * El storagePath debe pertenecer al namespace de la cuenta activa.
 */
export async function registerTelemetryUpload(
  deps: ApplicationDependencies,
  context: TenantContext,
  input: RegisterTelemetryUploadInput,
): Promise<TelemetryUpload> {
  ensurePermission(context.role, "performance.manage");
  await ensureTelemetryEntitlement(deps, context);

  if (!input.storagePath.startsWith(`${context.accountId}/`)) {
    throw new AuthorizationError(
      "storage path must be scoped under the current account id",
    );
  }
  return deps.telemetry.registerUpload(context.accountId, input);
}

/**
 * Ingresa un batch de muestras crudas asociado a una cuenta.
 */
export async function ingestTelemetryBatch(
  deps: ApplicationDependencies,
  context: TenantContext,
  input: IngestTelemetryBatchInput,
): Promise<TelemetryUpload> {
  ensurePermission(context.role, "performance.manage");
  await ensureTelemetryEntitlement(deps, context);
  // La persistencia del batch también marca el upload como procesado cuando corresponde.
  return deps.telemetry.ingestBatch({ accountId: context.accountId, data: input });
}

export type DerivedMetricsResult = ReturnType<typeof deriveSessionMetrics>;

/**
 * Calcula métricas derivadas para un upload existente.
 *
 * Solo usa muestras con coordenadas válidas y exige al menos dos puntos
 * para calcular distancias/velocidades significativas.
 */
export async function computeDerivedMetricsForUpload(
  deps: ApplicationDependencies,
  context: TenantContext,
  uploadId: string,
): Promise<DerivedMetricsResult> {
  ensurePermission(context.role, "performance.manage");
  const samples = await deps.telemetry.getRawSamples(context.accountId, uploadId);
  if (samples.length === 0) throw new NotFoundError("telemetry samples");

  // Las métricas sólo se derivan desde puntos geoposicionados válidos; el resto se descarta.
  const usable: TelemetrySample[] = samples
    .filter(
      (s) =>
        typeof s.latitude === "number" && typeof s.longitude === "number",
    )
    .map((s) => ({
      capturedAt: new Date(s.capturedAt),
      point: createGeoPoint(s.latitude as number, s.longitude as number),
      heartRate: s.heartRate,
    }));
  if (usable.length < 2) {
    throw new NotFoundError("usable telemetry samples");
  }
  return deriveSessionMetrics(usable);
}
