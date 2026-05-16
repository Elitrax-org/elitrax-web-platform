import { describe, expect, it } from "vitest";

import {
  canAddAccountMember,
  canAddPlayerToAccount,
  canCreateTeamForAccount,
} from "./tenancy-policy";

describe("TenancyPolicy", () => {
  it("keeps individual accounts limited to their owner membership", () => {
    expect(
      canAddAccountMember({
        accountType: "individual",
        role: "owner",
        currentMemberCount: 0,
      }),
    ).toBe(true);
    expect(
      canAddAccountMember({
        accountType: "individual",
        role: "owner",
        currentMemberCount: 1,
      }),
    ).toBe(false);
    expect(
      canAddAccountMember({
        accountType: "individual",
        role: "viewer",
        currentMemberCount: 0,
      }),
    ).toBe(false);
  });

  it("prevents team creation for individual accounts", () => {
    expect(
      canCreateTeamForAccount({
        accountType: "individual",
        currentTeamCount: 0,
        teamLimit: null,
      }),
    ).toBe(false);
  });

  it("limits individual accounts to one player", () => {
    expect(
      canAddPlayerToAccount({
        accountType: "individual",
        currentPlayerCount: 0,
        playerLimit: null,
      }),
    ).toBe(true);
    expect(
      canAddPlayerToAccount({
        accountType: "individual",
        currentPlayerCount: 1,
        playerLimit: null,
      }),
    ).toBe(false);
  });

  it("lets corporate accounts use subscription limits for teams and players", () => {
    expect(
      canCreateTeamForAccount({
        accountType: "corporate",
        currentTeamCount: 2,
        teamLimit: 3,
      }),
    ).toBe(true);
    expect(
      canCreateTeamForAccount({
        accountType: "corporate",
        currentTeamCount: 3,
        teamLimit: 3,
      }),
    ).toBe(false);

    expect(
      canAddPlayerToAccount({
        accountType: "corporate",
        currentPlayerCount: 24,
        playerLimit: 25,
      }),
    ).toBe(true);
    expect(
      canAddPlayerToAccount({
        accountType: "corporate",
        currentPlayerCount: 25,
        playerLimit: 25,
      }),
    ).toBe(false);
  });
});
