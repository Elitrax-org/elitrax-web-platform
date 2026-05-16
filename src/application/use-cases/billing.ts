import type {
  ApplicationDependencies,
} from "@/application/ports/repositories";
import type { BillingProvider, SubscriptionSyncResult } from "@/application/ports/providers";
import type { BillingWebhookEvent } from "@/application/schemas/billing";
import { defaultEntitlementsForTier } from "@/infrastructure/repositories/in-memory/store";

/**
 * Procesa un webhook de facturación y sincroniza la suscripción local.
 *
 * La verificación criptográfica del payload queda delegada al proveedor.
 */
export async function processBillingWebhook(
  deps: ApplicationDependencies,
  provider: BillingProvider,
  rawBody: string,
  signature: string,
): Promise<SubscriptionSyncResult> {
  const event: BillingWebhookEvent = await provider.verifyWebhookSignature({
    rawBody,
    signature,
  });

  const entitlements = defaultEntitlementsForTier(event.tier);
  await deps.subscriptions.upsertSubscription({
    accountId: event.accountId,
    tier: event.tier,
    entitlements,
    status: event.status,
    externalProvider: event.externalProvider,
    externalId: event.externalId,
  });

  return {
    accountId: event.accountId,
    tier: event.tier,
    status: event.status,
  };
}
