import { z } from "zod";

import { uuidSchema } from "./account";

export const planTierSchema = z.enum(["basic", "pro", "pro_plus"]);

export const subscriptionStatusSchema = z.enum([
  "trialing",
  "active",
  "past_due",
  "canceled",
  "incomplete",
]);

export const billingWebhookEventSchema = z.object({
  eventId: z.string().min(1),
  accountId: uuidSchema,
  tier: planTierSchema,
  status: subscriptionStatusSchema,
  externalProvider: z.string().min(1).default("stripe"),
  externalId: z.string().min(1),
  currentPeriodStart: z.string().datetime().optional(),
  currentPeriodEnd: z.string().datetime().optional(),
});

export type BillingWebhookEvent = z.infer<typeof billingWebhookEventSchema>;
