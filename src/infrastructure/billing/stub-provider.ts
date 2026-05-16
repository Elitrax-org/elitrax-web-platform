import {
  billingWebhookEventSchema,
  type BillingWebhookEvent,
} from "../../application/schemas/billing";
import type { BillingProvider } from "../../application/ports/providers";
import { ValidationError } from "../../lib/errors";

/**
 * Stub billing provider used when no Stripe credentials are configured.
 * Accepts a JSON body matching the canonical webhook envelope and skips
 * signature checks. Replace with the real Stripe adapter in Phase 7.
 */
export const stubBillingProvider: BillingProvider = {
  name: "stub",
  async verifyWebhookSignature({ rawBody, signature }) {
    if (!signature) {
      throw new ValidationError("missing webhook signature header");
    }
    let parsed: unknown;
    try {
      parsed = JSON.parse(rawBody);
    } catch {
      throw new ValidationError("webhook payload is not valid JSON");
    }
    const result = billingWebhookEventSchema.safeParse(parsed);
    if (!result.success) {
      throw new ValidationError(
        "webhook payload does not match BillingWebhookEvent schema",
      );
    }
    const event: BillingWebhookEvent = result.data;
    return event;
  },
};
