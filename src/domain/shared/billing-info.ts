/**
 * Billing information value object. Always carries a billing address.
 * Corporate-only constraints (legalName + taxId required) are enforced by
 * `account-profile-policy`, not here, so this VO can be reused for
 * individual accounts that opt-in to provide tax data.
 */

import { createAddress, type Address, type AddressInput } from "./address";

export type BillingInfo = {
  readonly legalName?: string;
  readonly taxId?: string;
  readonly billingEmail?: string;
  readonly billingAddress: Address;
};

export type BillingInfoInput = {
  readonly legalName?: string | null;
  readonly taxId?: string | null;
  readonly billingEmail?: string | null;
  readonly billingAddress: AddressInput;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeOptional(value: string | null | undefined): string | undefined {
  if (value === null || value === undefined) return undefined;
  const trimmed = value.trim();
  return trimmed.length === 0 ? undefined : trimmed;
}

export function createBillingInfo(input: BillingInfoInput): BillingInfo {
  const billingEmail = normalizeOptional(input.billingEmail);
  if (billingEmail !== undefined && !EMAIL_REGEX.test(billingEmail.toLowerCase())) {
    throw new RangeError("BillingInfo.billingEmail must be a valid email address");
  }
  return {
    legalName: normalizeOptional(input.legalName),
    taxId: normalizeOptional(input.taxId),
    billingEmail: billingEmail?.toLowerCase(),
    billingAddress: createAddress(input.billingAddress),
  };
}
