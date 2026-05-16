import { beforeEach, describe, expect, it } from "vitest";

import { buildInMemoryDependencies } from "@/infrastructure/repositories/in-memory";
import { resetStore } from "@/infrastructure/repositories/in-memory/store";
import { accountUseCases } from "@/application/use-cases";
import { buildCreateAccountInput } from "@/application/use-cases/test-fixtures";
import { ValidationError } from "@/lib/errors";

beforeEach(() => resetStore());

describe("accountUseCases.completeOnboarding", () => {
  it("creates account and activates basic subscription without checkout", async () => {
    const deps = buildInMemoryDependencies();
    const result = await accountUseCases.completeOnboarding(
      deps,
      { userId: "user-1" },
      {
        account: buildCreateAccountInput({
          type: "corporate",
          displayName: "Acme FC",
        }),
        subscription: { tier: "basic", interval: "monthly" },
      },
    );
    expect(result.account.displayName).toBe("Acme FC");
    expect(result.subscription.status).toBe("active");
    expect(result.subscription.tier).toBe("basic");
    expect(result.requiresCheckout).toBe(false);

    const memberships = await deps.accounts.listMemberships("user-1");
    expect(memberships).toHaveLength(1);
    expect(memberships[0].role).toBe("owner");
  });

  it("marks pro subscriptions as incomplete and requires checkout", async () => {
    const deps = buildInMemoryDependencies();
    const result = await accountUseCases.completeOnboarding(
      deps,
      { userId: "user-2" },
      {
        account: buildCreateAccountInput({
          type: "corporate",
          displayName: "Pro Club",
        }),
        subscription: { tier: "pro", interval: "yearly" },
      },
    );
    expect(result.subscription.status).toBe("incomplete");
    expect(result.subscription.tier).toBe("pro");
    expect(result.subscription.interval).toBe("yearly");
    expect(result.requiresCheckout).toBe(true);
  });

  it("rejects corporate accounts missing legalName/taxId", async () => {
    const deps = buildInMemoryDependencies();
    await expect(
      accountUseCases.completeOnboarding(
        deps,
        { userId: "user-3" },
        {
          account: {
            ...buildCreateAccountInput({
              type: "corporate",
              displayName: "Missing Legal",
            }),
            billing: {
              billingAddress: {
                countryCode: "AR",
                city: "Buenos Aires",
                line1: "Av. Corrientes 1234",
              },
            },
          },
          subscription: { tier: "basic", interval: "monthly" },
        },
      ),
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it("rejects users that already have a membership", async () => {
    const deps = buildInMemoryDependencies();
    await accountUseCases.completeOnboarding(
      deps,
      { userId: "user-4" },
      {
        account: buildCreateAccountInput({
          type: "individual",
          displayName: "Solo Athlete",
        }),
        subscription: { tier: "basic", interval: "monthly" },
      },
    );
    await expect(
      accountUseCases.completeOnboarding(
        deps,
        { userId: "user-4" },
        {
          account: buildCreateAccountInput({
            type: "individual",
            displayName: "Second",
          }),
          subscription: { tier: "basic", interval: "monthly" },
        },
      ),
    ).rejects.toBeInstanceOf(ValidationError);
  });
});
