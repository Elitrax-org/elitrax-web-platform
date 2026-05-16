import { z } from "zod";

import { accountTypes } from "../../domain/account/roles";
import { planTiers } from "../../domain/billing/feature-entitlement-policy";
import { billingIntervals } from "../../domain/shared/money";

export const uuidSchema = z.string().uuid();

export const localeSchema = z.enum(["en", "es"]);

export const accountTypeSchema = z.enum(accountTypes);

export const billingIntervalSchema = z.enum(billingIntervals);

export const addressSchema = z.object({
  countryCode: z
    .string()
    .trim()
    .regex(/^[A-Za-z]{2}$/, "countryCode must be ISO-3166-1 alpha-2"),
  city: z.string().trim().min(1).max(120),
  line1: z.string().trim().min(1).max(200),
  line2: z.string().trim().max(200).optional().or(z.literal("")),
  postalCode: z.string().trim().max(20).optional().or(z.literal("")),
  region: z.string().trim().max(120).optional().or(z.literal("")),
});

export const contactInfoSchema = z.object({
  email: z.string().trim().email(),
  phone: z
    .string()
    .trim()
    .min(7)
    .max(30)
    .regex(/^[+\d\s().-]+$/, "phone contains invalid characters"),
});

export const billingInfoSchema = z.object({
  legalName: z.string().trim().max(160).optional().or(z.literal("")),
  taxId: z.string().trim().max(40).optional().or(z.literal("")),
  billingEmail: z.string().trim().email().optional().or(z.literal("")),
  billingAddress: addressSchema,
});

export const createAccountInputSchema = z.object({
  type: accountTypeSchema,
  displayName: z.string().trim().min(1).max(120),
  address: addressSchema,
  contact: contactInfoSchema,
  billing: billingInfoSchema,
});

export const subscriptionChoiceSchema = z.object({
  tier: z.enum(planTiers),
  interval: billingIntervalSchema,
});

export const onboardingInputSchema = z.object({
  account: createAccountInputSchema,
  subscription: subscriptionChoiceSchema,
});

export const inviteMemberInputSchema = z.object({
  email: z.string().email(),
  role: z.enum(["administrator", "technician", "assistant", "viewer"]),
  expiresInHours: z.number().int().min(1).max(24 * 14).default(72),
});

export const switchAccountInputSchema = z.object({
  accountId: uuidSchema,
});

export type AddressInputDto = z.infer<typeof addressSchema>;
export type ContactInfoInputDto = z.infer<typeof contactInfoSchema>;
export type BillingInfoInputDto = z.infer<typeof billingInfoSchema>;
export type CreateAccountInput = z.infer<typeof createAccountInputSchema>;
export type SubscriptionChoiceInput = z.infer<typeof subscriptionChoiceSchema>;
export type OnboardingInput = z.infer<typeof onboardingInputSchema>;
export type InviteMemberInput = z.infer<typeof inviteMemberInputSchema>;
export type SwitchAccountInput = z.infer<typeof switchAccountInputSchema>;
