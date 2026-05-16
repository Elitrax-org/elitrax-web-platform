import { describe, expect, it } from "vitest";

import { createBillingInfo } from "../shared/billing-info";
import {
  isBillingInfoValidForAccountType,
  validateBillingInfoForAccountType,
} from "./account-profile-policy";

const address = {
  countryCode: "AR",
  city: "Buenos Aires",
  line1: "Av. Corrientes 1234",
};

describe("account-profile-policy", () => {
  it("requires legalName and taxId for corporate accounts", () => {
    const billing = createBillingInfo({ billingAddress: address });
    const violations = validateBillingInfoForAccountType("corporate", billing);
    expect(violations).toEqual([
      "corporate_requires_legal_name",
      "corporate_requires_tax_id",
    ]);
    expect(isBillingInfoValidForAccountType("corporate", billing)).toBe(false);
  });

  it("accepts corporate with both fields filled", () => {
    const billing = createBillingInfo({
      legalName: "Acme S.A.",
      taxId: "30-12345678-9",
      billingAddress: address,
    });
    expect(validateBillingInfoForAccountType("corporate", billing)).toEqual([]);
    expect(isBillingInfoValidForAccountType("corporate", billing)).toBe(true);
  });

  it("does not require legalName/taxId for individual accounts", () => {
    const billing = createBillingInfo({ billingAddress: address });
    expect(validateBillingInfoForAccountType("individual", billing)).toEqual([]);
    expect(isBillingInfoValidForAccountType("individual", billing)).toBe(true);
  });
});
