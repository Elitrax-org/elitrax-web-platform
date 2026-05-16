import type { AccountRole, AccountType } from "./roles";
import {
  hasSubscriptionCapacity,
  type SubscriptionLimit,
} from "../billing/subscription-limit-policy";

type AddMemberInput = {
  accountType: AccountType;
  role: AccountRole;
  currentMemberCount: number;
};

type CapacityInput = {
  accountType: AccountType;
  currentPlayerCount: number;
  playerLimit: SubscriptionLimit;
};

type TeamCapacityInput = {
  accountType: AccountType;
  currentTeamCount: number;
  teamLimit: SubscriptionLimit;
};

export function canAddAccountMember({
  accountType,
  role,
  currentMemberCount,
}: AddMemberInput) {
  if (accountType === "individual") {
    return role === "owner" && currentMemberCount === 0;
  }

  return true;
}

export function canCreateTeamForAccount({
  accountType,
  currentTeamCount,
  teamLimit,
}: TeamCapacityInput) {
  if (accountType === "individual") {
    return false;
  }

  return hasSubscriptionCapacity(currentTeamCount, teamLimit);
}

export function canAddPlayerToAccount({
  accountType,
  currentPlayerCount,
  playerLimit,
}: CapacityInput) {
  if (accountType === "individual") {
    return currentPlayerCount < 1;
  }

  return hasSubscriptionCapacity(currentPlayerCount, playerLimit);
}
