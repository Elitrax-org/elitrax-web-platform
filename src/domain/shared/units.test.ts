import { describe, expect, it } from "vitest";

import {
  createDistance,
  createDuration,
  createSpeed,
  metersPerSecondToKilometersPerHour,
  metersToKilometers,
  paceMinutesPerKilometer,
  secondsToMinutes,
  speedFromDistanceAndDuration,
} from "./units";

describe("units value objects", () => {
  it("creates non-negative distance, duration and speed", () => {
    expect(createDistance(0).meters).toBe(0);
    expect(createDistance(1000).meters).toBe(1000);
    expect(createDuration(60).seconds).toBe(60);
    expect(createSpeed(5).metersPerSecond).toBe(5);
  });

  it("rejects invalid values", () => {
    expect(() => createDistance(-1)).toThrow(/distance.meters/);
    expect(() => createDuration(Number.NaN)).toThrow(/duration.seconds/);
    expect(() => createSpeed(Number.POSITIVE_INFINITY)).toThrow(
      /speed.metersPerSecond/,
    );
  });

  it("derives speed from distance and duration", () => {
    const speed = speedFromDistanceAndDuration(
      createDistance(400),
      createDuration(80),
    );
    expect(speed.metersPerSecond).toBe(5);
  });

  it("rejects zero duration when deriving speed", () => {
    expect(() =>
      speedFromDistanceAndDuration(createDistance(400), createDuration(0)),
    ).toThrow(/duration.seconds/);
  });

  it("converts units", () => {
    expect(metersToKilometers(2500)).toBeCloseTo(2.5);
    expect(secondsToMinutes(120)).toBe(2);
    expect(metersPerSecondToKilometersPerHour(10)).toBeCloseTo(36);
  });

  it("computes pace in minutes per kilometer", () => {
    expect(paceMinutesPerKilometer(createSpeed(5))).toBeCloseTo(3.333, 3);
    expect(() => paceMinutesPerKilometer(createSpeed(0))).toThrow(
      /speed.metersPerSecond/,
    );
  });
});
