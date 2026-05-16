import { canAddAccountMember } from "@/domain/account/tenancy-policy";
import { validateBillingInfoForAccountType } from "@/domain/account/account-profile-policy";
import { createAddress } from "@/domain/shared/address";
import { createContactInfo } from "@/domain/shared/contact-info";
import { createBillingInfo } from "@/domain/shared/billing-info";
import { planCatalog } from "@/domain/billing/feature-entitlement-policy";

import type { TenantContext } from "@/application/context";
import { ensurePermission } from "@/lib/permissions";
import type {
  AccountSubscription,
  AccountSummary,
  AccountMembership,
  Invitation,
  ApplicationDependencies,
} from "@/application/ports/repositories";
import type {
  CreateAccountInput,
  InviteMemberInput,
  OnboardingInput,
} from "@/application/schemas";
import { ValidationError } from "@/lib/errors";

/**
 * Construye y valida el perfil completo de cuenta a partir del input.
 *
 * Centraliza value objects y reglas de consistencia por tipo de cuenta.
 */
function buildProfile(input: CreateAccountInput) {
  const address = createAddress(input.address);
  const contact = createContactInfo(input.contact);
  const billing = createBillingInfo({
    legalName: input.billing.legalName ?? null,
    taxId: input.billing.taxId ?? null,
    billingEmail: input.billing.billingEmail ?? null,
    billingAddress: input.billing.billingAddress,
  });
  const violations = validateBillingInfoForAccountType(input.type, billing);
  if (violations.length > 0) {
    throw new ValidationError(
      `account profile invalid: ${violations.join(", ")}`,
    );
  }
  return { address, contact, billing };
}

/**
 * Crea una cuenta inicial para el usuario actor.
 *
 * No aplica validaciones de membresía previa (eso lo hace completeOnboarding).
 */
export async function createAccount(
  deps: ApplicationDependencies,
  actor: { userId: string },
  input: CreateAccountInput,
): Promise<AccountSummary> {
  const profile = buildProfile(input);
  return deps.accounts.createAccount({
    type: input.type,
    displayName: input.displayName,
    ownerUserId: actor.userId,
    ...profile,
  });
}

export type OnboardingResult = {
  readonly account: AccountSummary;
  readonly subscription: AccountSubscription;
  readonly requiresCheckout: boolean;
};

/**
 * Completa el onboarding de un usuario nuevo.
 *
 * Reglas:
 * - El usuario no debe pertenecer previamente a otra cuenta.
 * - Plan basic queda activo inmediatamente.
 * - Planes pagos quedan incompletos hasta completar checkout.
 */
export async function completeOnboarding(
  deps: ApplicationDependencies,
  actor: { userId: string },
  input: OnboardingInput,
): Promise<OnboardingResult> {
  const existing = await deps.accounts.listMemberships(actor.userId);
  if (existing.length > 0) {
    throw new ValidationError("user already belongs to an account");
  }

  const profile = buildProfile(input.account);
  const account = await deps.accounts.createAccount({
    type: input.account.type,
    displayName: input.account.displayName,
    ownerUserId: actor.userId,
    ...profile,
  });

  const tier = input.subscription.tier;
  const status = tier === "basic" ? "active" : "incomplete";
  const subscription = await deps.subscriptions.upsertSubscription({
    accountId: account.id,
    tier,
    entitlements: planCatalog[tier],
    status,
    interval: input.subscription.interval,
  });

  return {
    account,
    subscription,
    requiresCheckout: tier !== "basic",
  };
}

/**
 * Lista membresías de cuentas del usuario autenticado.
 */
export async function listMyAccounts(
  deps: ApplicationDependencies,
  actor: { userId: string },
): Promise<readonly AccountMembership[]> {
  return deps.accounts.listMemberships(actor.userId);
}

/**
 * Invita un miembro a la cuenta activa validando permiso y capacidad.
 */
export async function inviteMember(
  deps: ApplicationDependencies,
  context: TenantContext,
  input: InviteMemberInput,
): Promise<Invitation> {
  ensurePermission(context.role, "members.manage");

  const memberCount = await deps.accounts.countMembers(context.accountId);
  const allowed = canAddAccountMember({
    accountType: context.accountType,
    role: input.role,
    currentMemberCount: memberCount,
  });
  if (!allowed) {
    throw new ValidationError(
      "account-type does not allow additional members for this role",
    );
  }

  const expiresAt = new Date(
    Date.now() + input.expiresInHours * 60 * 60 * 1000,
  ).toISOString();

  return deps.accounts.createInvitation({
    accountId: context.accountId,
    email: input.email,
    role: input.role,
    expiresAt,
  });
}
