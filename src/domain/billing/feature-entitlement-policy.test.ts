import { describe, expect, it } from "vitest";

import {
  planAllowsAdditionalPlayer,
  planAllowsAdditionalTeam,
  planAllowsFeature,
  planCatalog,
} from "./feature-entitlement-policy";

describe("FeatureEntitlementPolicy", () => {
  it("basic plan blocks teams and pro features", () => {
    const basic = planCatalog.basic;
    expect(planAllowsAdditionalTeam(basic, 0)).toBe(false);
    expect(planAllowsAdditionalPlayer(basic, 0)).toBe(true);
    expect(planAllowsAdditionalPlayer(basic, 1)).toBe(false);
    expect(planAllowsFeature(basic, "telemetry_upload")).toBe(false);
    expect(planAllowsFeature(basic, "ai_recommendations")).toBe(false);
  });

  it("pro plan unlocks teams, telemetry and reports with limits", () => {
    const pro = planCatalog.pro;
    expect(planAllowsAdditionalTeam(pro, 2)).toBe(true);
    expect(planAllowsAdditionalTeam(pro, 3)).toBe(false);
    expect(planAllowsAdditionalPlayer(pro, 49)).toBe(true);
    expect(planAllowsAdditionalPlayer(pro, 50)).toBe(false);
    expect(planAllowsFeature(pro, "telemetry_upload")).toBe(true);
    expect(planAllowsFeature(pro, "ai_recommendations")).toBe(false);
  });

  it("pro_plus unlocks AI and Match Mode with unlimited capacity", () => {
    const proPlus = planCatalog.pro_plus;
    expect(planAllowsAdditionalPlayer(proPlus, 10_000)).toBe(true);
    expect(planAllowsAdditionalTeam(proPlus, 100)).toBe(true);
    expect(planAllowsFeature(proPlus, "ai_recommendations")).toBe(true);
    expect(planAllowsFeature(proPlus, "match_mode_realtime")).toBe(true);
  });
});
