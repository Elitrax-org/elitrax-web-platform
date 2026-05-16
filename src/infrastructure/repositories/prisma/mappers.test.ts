import { describe, expect, it } from "vitest";

import { mapSubscription, mapTeam } from "./mappers";

describe("prisma mappers", () => {
  it("maps subscription limits from plan row", () => {
    const row = {
      id: "sub-1",
      account_id: "acc-1",
      plan_id: "plan-basic",
      status: "active",
      current_period_start: null,
      current_period_end: null,
      external_provider: null,
      external_id: null,
      created_at: new Date("2026-01-01T00:00:00.000Z"),
      updated_at: new Date("2026-01-01T00:00:00.000Z"),
      billing_interval: "monthly",
      plans: {
        tier: "basic",
        player_limit: 22,
        team_limit: 1,
      },
    } as const;

    const mapped = mapSubscription(row as never);

    expect(mapped.tier).toBe("basic");
    expect(mapped.entitlements.teamLimit).toBe(1);
    expect(mapped.entitlements.playerLimit).toBe(22);
    expect(mapped.entitlements.features.has("teams")).toBe(false);
  });

  it("maps team field dimensions when present", () => {
    const mapped = mapTeam({
      id: "team-1",
      account_id: "acc-1",
      name: "Phoenix FC",
      sport_type: "football",
      field_length_meters: 102,
      field_width_meters: 65,
      created_at: new Date("2026-01-01T00:00:00.000Z"),
    } as never);

    expect(mapped.fieldLengthMeters).toBe(102);
    expect(mapped.fieldWidthMeters).toBe(65);
  });
});
