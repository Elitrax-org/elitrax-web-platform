import type { CreateAccountInput } from "@/application/schemas";
import type { AccountType } from "@/domain/account/roles";

/**
 * Returns a fully-populated `CreateAccountInput` for tests, applying any
 * overrides on top. Corporate accounts get default legalName/taxId so the
 * `account-profile-policy` is satisfied without each test having to repeat
 * the fixture.
 */
export function buildCreateAccountInput(
  overrides: Partial<CreateAccountInput> & {
    type: AccountType;
    displayName: string;
  },
): CreateAccountInput {
  const isCorporate = overrides.type === "corporate";
  return {
    type: overrides.type,
    displayName: overrides.displayName,
    address: overrides.address ?? {
      countryCode: "AR",
      city: "Buenos Aires",
      line1: "Av. Corrientes 1234",
    },
    contact: overrides.contact ?? {
      email: "owner@example.com",
      phone: "+15551234567",
    },
    billing: overrides.billing ?? {
      legalName: isCorporate ? "Test Corp S.A." : undefined,
      taxId: isCorporate ? "30-12345678-9" : undefined,
      billingAddress: {
        countryCode: "AR",
        city: "Buenos Aires",
        line1: "Av. Corrientes 1234",
      },
    },
  };
}
