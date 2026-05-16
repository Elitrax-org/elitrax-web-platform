/**
 * Tenant-aware execution context passed to every application use case.
 * Authentication and account resolution happen at the API boundary; use
 * cases never trust caller-provided account/role values.
 */

import type { AccountRole, AccountType } from "@/domain/account/roles";

export type AuthenticatedActor = {
  readonly userId: string;
};

export type TenantContext = {
  readonly actor: AuthenticatedActor;
  readonly accountId: string;
  readonly accountType: AccountType;
  readonly role: AccountRole;
};
