import { describe, expect, it } from "vitest";

import { createBillingInfo } from "./billing-info";

const baseAddress = {
  countryCode: "AR",
  city: "Buenos Aires",
  line1: "Av. Corrientes 1234",
};

describe("createBillingInfo", () => {
  it("accepts minimal billing info with only address", () => {
    const b = createBillingInfo({ billingAddress: baseAddress });
    expect(b.legalName).toBeUndefined();
    expect(b.taxId).toBeUndefined();
    expect(b.billingEmail).toBeUndefined();
    expect(b.billingAddress.countryCode).toBe("AR");
  });

  it("normalizes optional fields", () => {
    const b = createBillingInfo({
      legalName: " Acme S.A. ",
      taxId: " 30-12345678-9 ",
      billingEmail: " Billing@Acme.COM ",
      billingAddress: baseAddress,
    });
    expect(b.legalName).toBe("Acme S.A.");
    expect(b.taxId).toBe("30-12345678-9");
    expect(b.billingEmail).toBe("billing@acme.com");
  });

  it("rejects invalid billing email", () => {
    expect(() =>
      createBillingInfo({
        billingEmail: "not-email",
        billingAddress: baseAddress,
      }),
    ).toThrow(/billingEmail/);
  });
});
