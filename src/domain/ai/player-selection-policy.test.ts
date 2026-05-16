import { describe, expect, it } from "vitest";

import {
  rankPlayerSelections,
  scorePlayerSelection,
} from "./player-selection-policy";

describe("PlayerSelectionPolicy", () => {
  it("excludes unavailable players", () => {
    const result = scorePlayerSelection({
      playerId: "p1",
      availability: "unavailable",
      performanceScore: 0.9,
      fatigueScore: 0.1,
    });
    expect(result.excluded).toBe(true);
    expect(result.reasons).toContain("availability:unavailable");
    expect(result.score).toBe(0);
  });

  it("flags recent injuries within the cooldown window", () => {
    const result = scorePlayerSelection({
      playerId: "p2",
      availability: "available",
      performanceScore: 0.8,
      fatigueScore: 0.2,
      daysSinceLastInjury: 3,
    });
    expect(result.excluded).toBe(true);
    expect(result.reasons).toContain("recent-injury");
  });

  it("scores available players using performance and fatigue", () => {
    const a = scorePlayerSelection({
      playerId: "a",
      availability: "available",
      performanceScore: 0.9,
      fatigueScore: 0.1,
    });
    const b = scorePlayerSelection({
      playerId: "b",
      availability: "available",
      performanceScore: 0.5,
      fatigueScore: 0.5,
    });
    expect(a.excluded).toBe(false);
    expect(b.excluded).toBe(false);
    expect(a.score).toBeGreaterThan(b.score);
  });

  it("penalizes limited availability", () => {
    const limited = scorePlayerSelection({
      playerId: "lim",
      availability: "limited",
      performanceScore: 0.9,
      fatigueScore: 0.1,
    });
    const full = scorePlayerSelection({
      playerId: "full",
      availability: "available",
      performanceScore: 0.9,
      fatigueScore: 0.1,
    });
    expect(limited.score).toBeLessThan(full.score);
  });

  it("ranks players placing eligible top scorers first and exclusions last", () => {
    const ranked = rankPlayerSelections([
      {
        playerId: "out",
        availability: "unavailable",
        performanceScore: 1,
        fatigueScore: 0,
      },
      {
        playerId: "best",
        availability: "available",
        performanceScore: 0.95,
        fatigueScore: 0.1,
      },
      {
        playerId: "mid",
        availability: "available",
        performanceScore: 0.6,
        fatigueScore: 0.4,
      },
    ]);
    expect(ranked[0].playerId).toBe("best");
    expect(ranked[1].playerId).toBe("mid");
    expect(ranked[2].playerId).toBe("out");
    expect(ranked[2].excluded).toBe(true);
  });

  it("rejects invalid input ranges", () => {
    expect(() =>
      scorePlayerSelection({
        playerId: "p",
        availability: "available",
        performanceScore: 1.5,
        fatigueScore: 0,
      }),
    ).toThrow();
    expect(() =>
      scorePlayerSelection({
        playerId: "p",
        availability: "available",
        performanceScore: 0.5,
        fatigueScore: -0.1,
      }),
    ).toThrow();
  });
});
