import { describe, expect, it } from "vitest";

import { createGeoPoint } from "../shared/geo";
import {
  defaultRunningSpeedZones,
  deriveSessionMetrics,
  type TelemetrySample,
} from "./telemetry-metrics-calculator";

function buildLinearSession(): TelemetrySample[] {
  const startTime = new Date("2026-01-01T00:00:00Z").getTime();
  const samples: TelemetrySample[] = [];
  for (let index = 0; index <= 30; index += 1) {
    samples.push({
      capturedAt: new Date(startTime + index * 1000),
      point: createGeoPoint(-34.6 + index * 0.00005, -58.4),
      heartRate: 140 + index,
    });
  }
  return samples;
}

describe("TelemetryMetricsCalculator", () => {
  it("requires at least two samples", () => {
    expect(() => deriveSessionMetrics([])).toThrow();
  });

  it("rejects out-of-order samples", () => {
    const samples: TelemetrySample[] = [
      {
        capturedAt: new Date("2026-01-01T00:01:00Z"),
        point: createGeoPoint(-34.6, -58.4),
      },
      {
        capturedAt: new Date("2026-01-01T00:00:00Z"),
        point: createGeoPoint(-34.6, -58.4),
      },
    ];
    expect(() => deriveSessionMetrics(samples)).toThrow();
  });

  it("rejects invalid zone thresholds", () => {
    const samples = buildLinearSession();
    expect(() =>
      deriveSessionMetrics(samples, { lowerBoundsMetersPerSecond: [] }),
    ).toThrow();
    expect(() =>
      deriveSessionMetrics(samples, {
        lowerBoundsMetersPerSecond: [0, 0],
      }),
    ).toThrow();
    expect(() =>
      deriveSessionMetrics(samples, {
        lowerBoundsMetersPerSecond: [-1, 1],
      }),
    ).toThrow();
  });

  it("derives totals, average and zones", () => {
    const samples = buildLinearSession();
    const metrics = deriveSessionMetrics(samples, defaultRunningSpeedZones);
    expect(metrics.totalDurationSeconds).toBe(30);
    expect(metrics.totalDistanceMeters).toBeGreaterThan(0);
    expect(metrics.averageSpeedMetersPerSecond).toBeCloseTo(
      metrics.totalDistanceMeters / metrics.totalDurationSeconds,
      6,
    );
    expect(metrics.maxSpeedMetersPerSecond).toBeGreaterThan(0);
    const sumZoneMeters = metrics.distancePerZoneMeters.reduce(
      (sum, value) => sum + value,
      0,
    );
    expect(sumZoneMeters).toBeCloseTo(metrics.totalDistanceMeters, 6);
    expect(metrics.averageHeartRate).toBeCloseTo(155, 0);
    expect(metrics.maxHeartRate).toBe(170);
  });
});
