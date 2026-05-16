import { describe, expect, it } from "vitest";

import {
  bestEstimatedOneRepMax,
  computeProgressionTrend,
  estimatedOneRepMax,
  exerciseTotalVolume,
  setVolumeKilograms,
} from "./gym-progression-calculator";

describe("GymProgressionCalculator", () => {
  it("computes set volume", () => {
    expect(
      setVolumeKilograms({ weightKilograms: 80, repetitions: 5 }),
    ).toBe(400);
  });

  it("rejects invalid sets", () => {
    expect(() =>
      setVolumeKilograms({ weightKilograms: -1, repetitions: 5 }),
    ).toThrow();
    expect(() =>
      setVolumeKilograms({ weightKilograms: 80, repetitions: 0 }),
    ).toThrow();
    expect(() =>
      setVolumeKilograms({ weightKilograms: 80, repetitions: 5, rpe: 11 }),
    ).toThrow();
  });

  it("computes total exercise volume", () => {
    const total = exerciseTotalVolume({
      exerciseId: "squat",
      performedAt: new Date(),
      sets: [
        { weightKilograms: 80, repetitions: 5 },
        { weightKilograms: 90, repetitions: 3 },
        { weightKilograms: 100, repetitions: 1 },
      ],
    });
    expect(total).toBe(400 + 270 + 100);
  });

  it("estimates one-rep max with the Epley formula", () => {
    expect(
      estimatedOneRepMax({ weightKilograms: 100, repetitions: 1 }),
    ).toBe(100);
    expect(
      estimatedOneRepMax({ weightKilograms: 100, repetitions: 5 }),
    ).toBeCloseTo(116.667, 3);
  });

  it("returns the best estimated one-rep max from a session", () => {
    const best = bestEstimatedOneRepMax({
      exerciseId: "bench",
      performedAt: new Date(),
      sets: [
        { weightKilograms: 80, repetitions: 8 },
        { weightKilograms: 90, repetitions: 5 },
        { weightKilograms: 100, repetitions: 2 },
      ],
    });
    expect(best).toBeCloseTo(106.667, 3);
  });

  it("classifies progression trends with tolerance", () => {
    expect(computeProgressionTrend(100, 102)).toBe("improving");
    expect(computeProgressionTrend(100, 99.5)).toBe("stable");
    expect(computeProgressionTrend(100, 95)).toBe("regressing");
    expect(() => computeProgressionTrend(-1, 100)).toThrow();
  });
});
