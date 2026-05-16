import { describe, expect, it } from "vitest";

import { createGeoPoint } from "../shared/geo";
import {
  computeKilometerSplits,
  summarizeRoute,
  type RouteSample,
} from "./running-route-analyzer";

function makeSample(
  latitude: number,
  longitude: number,
  isoTime: string,
): RouteSample {
  return { point: createGeoPoint(latitude, longitude), capturedAt: new Date(isoTime) };
}

describe("RunningRouteAnalyzer", () => {
  it("requires at least two samples", () => {
    expect(() => summarizeRoute([])).toThrow();
    expect(() =>
      summarizeRoute([makeSample(-34.6, -58.3, "2026-01-01T00:00:00Z")]),
    ).toThrow();
  });

  it("rejects out-of-order samples", () => {
    const samples = [
      makeSample(-34.6, -58.3, "2026-01-01T00:01:00Z"),
      makeSample(-34.61, -58.31, "2026-01-01T00:00:00Z"),
    ];
    expect(() => summarizeRoute(samples)).toThrow();
  });

  it("summarizes total distance, duration and speed", () => {
    const samples = [
      makeSample(-34.6037, -58.3816, "2026-01-01T00:00:00Z"),
      makeSample(-34.6, -58.378, "2026-01-01T00:05:00Z"),
      makeSample(-34.595, -58.374, "2026-01-01T00:10:00Z"),
    ];
    const summary = summarizeRoute(samples);
    expect(summary.totalDuration.seconds).toBe(600);
    expect(summary.totalDistance.meters).toBeGreaterThan(0);
    expect(summary.averageSpeed.metersPerSecond).toBeGreaterThan(0);
    expect(summary.averagePaceMinutesPerKilometer).toBeGreaterThan(0);
  });

  it("returns no splits when route is shorter than a kilometer", () => {
    const samples = [
      makeSample(-34.6037, -58.3816, "2026-01-01T00:00:00Z"),
      makeSample(-34.6038, -58.3817, "2026-01-01T00:00:30Z"),
    ];
    expect(computeKilometerSplits(samples).length).toBe(0);
  });

  it("computes kilometer splits when route is long enough", () => {
    const samples: RouteSample[] = [];
    const startLat = -34.6;
    const longitude = -58.4;
    const startTime = new Date("2026-01-01T00:00:00Z").getTime();
    for (let index = 0; index <= 60; index += 1) {
      samples.push({
        point: createGeoPoint(startLat + index * 0.0005, longitude),
        capturedAt: new Date(startTime + index * 30_000),
      });
    }
    const splits = computeKilometerSplits(samples);
    expect(splits.length).toBeGreaterThanOrEqual(1);
    for (const split of splits) {
      expect(split.distance.meters).toBe(1000);
      expect(split.duration.seconds).toBeGreaterThan(0);
      expect(split.paceMinutesPerKilometer).toBeGreaterThan(0);
    }
  });
});
