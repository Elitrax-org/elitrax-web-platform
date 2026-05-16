/**
 * Policies that gate Account profile completion. Corporate accounts must
 * declare a legal name and tax id (used for invoicing); individual accounts
 * may leave both blank.
 */

import type { AccountType } from "./roles";
import type { BillingInfo } from "../shared/billing-info";

export type AccountProfileViolation =
  | "corporate_requires_legal_name"
  | "corporate_requires_tax_id";

export function validateBillingInfoForAccountType(
  accountType: AccountType,
  billing: BillingInfo,
): readonly AccountProfileViolation[] {
  if (accountType !== "corporate") return [];
  const violations: AccountProfileViolation[] = [];
  if (!billing.legalName) violations.push("corporate_requires_legal_name");
  if (!billing.taxId) violations.push("corporate_requires_tax_id");
  return violations;
}

export function isBillingInfoValidForAccountType(
  accountType: AccountType,
  billing: BillingInfo,
): boolean {
  return validateBillingInfoForAccountType(accountType, billing).length === 0;
}
