import "server-only";

import type {
  BillingProvider,
} from "@/application/ports/providers";
import {
  billingWebhookEventSchema,
  type BillingWebhookEvent,
} from "@/application/schemas/billing";
import { ValidationError } from "@/lib/errors";
import { serverEnvironment } from "@/lib/config/environment";

/**
 * Stripe-backed billing provider skeleton. The real implementation should
 * call `stripe.webhooks.constructEvent` with the raw body, signature header
 * and `STRIPE_WEBHOOK_SECRET`, then map the resulting Stripe event to a
 * `BillingWebhookEvent` shape.
 *
 * Until Stripe credentials are wired in, this provider validates the same
 * JSON contract as the stub provider but rejects requests when no signing
 * secret is configured.
 */
class StripeBillingProvider implements BillingProvider {
  readonly name = "stripe";

  async verifyWebhookSignature(input: {
    rawBody: string;
    signature: string;
  }): Promise<BillingWebhookEvent> {
    if (!serverEnvironment.STRIPE_WEBHOOK_SECRET) {
      throw new ValidationError(
        "stripe webhook secret is not configured; set STRIPE_WEBHOOK_SECRET",
      );
    }
    if (!input.signature) {
      throw new ValidationError("missing Stripe-Signature header");
    }
    // TODO: replace with stripe.webhooks.constructEvent + mapping once Stripe
    // SDK is added. For now keep parity with the stub for early integration.
    let parsed: unknown;
    try {
      parsed = JSON.parse(input.rawBody);
    } catch {
      throw new ValidationError("invalid JSON billing webhook payload");
    }
    return billingWebhookEventSchema.parse(parsed);
  }
}

export const stripeBillingProvider = new StripeBillingProvider();
