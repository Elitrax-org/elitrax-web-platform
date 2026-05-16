import { beforeEach, describe, expect, it } from "vitest";

import { buildInMemoryDependencies } from "@/infrastructure/repositories/in-memory";
import { resetStore } from "@/infrastructure/repositories/in-memory/store";
import { stubBillingProvider } from "@/infrastructure/billing/stub-provider";
import { billingUseCases, accountUseCases } from "@/application/use-cases";
import { buildCreateAccountInput } from "@/application/use-cases/test-fixtures";
import { ValidationError } from "@/lib/errors";

beforeEach(() => resetStore());

describe("billing webhook stub provider", () => {
  it("upserts a subscription matching the webhook event", async () => {
    const deps = buildInMemoryDependencies();
    const account = await accountUseCases.createAccount(
      deps,
      { userId: "user-1" },
      buildCreateAccountInput({ type: "corporate", displayName: "Stripe Co" }),
    );
    const event = {
      eventId: "evt_1",
      accountId: account.id,
      tier: "pro_plus",
      status: "active",
      externalProvider: "stripe",
      externalId: "sub_123",
    };
    const result = await billingUseCases.processBillingWebhook(
      deps,
      stubBillingProvider,
      JSON.stringify(event),
      "test-signature",
    );
    expect(result.tier).toBe("pro_plus");
    const subscription = await deps.subscriptions.getSubscription(account.id);
    expect(subscription?.tier).toBe("pro_plus");
    expect(subscription?.externalId).toBe("sub_123");
  });

  it("rejects malformed payload", async () => {
    const deps = buildInMemoryDependencies();
    await expect(
      billingUseCases.processBillingWebhook(
        deps,
        stubBillingProvider,
        "{not json}",
        "x",
      ),
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it("requires a signature", async () => {
    const deps = buildInMemoryDependencies();
    await expect(
      billingUseCases.processBillingWebhook(deps, stubBillingProvider, "{}", ""),
    ).rejects.toBeInstanceOf(ValidationError);
  });
});
