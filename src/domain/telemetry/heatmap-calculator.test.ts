import { describe, expect, it } from "vitest";

import { createGeoPoint } from "../shared/geo";

import {
  calculateTelemetryHeatmap,
  projectGeoPointToField,
} from "./heatmap-calculator";
import type { TelemetrySample } from "./telemetry-metrics-calculator";

function sampleAt(
  seconds: number,
  latitude: number,
  longitude: number,
): TelemetrySample {
  return {
    capturedAt: new Date(`2026-01-01T00:00:${seconds.toString().padStart(2, "0")}Z`),
    point: createGeoPoint(latitude, longitude),
  };
}

describe("HeatmapCalculator", () => {
  it("rejects empty sample collections", () => {
    expect(() =>
      calculateTelemetryHeatmap({
        sportType: "football",
        samples: [],
      }),
    ).toThrow();
  });

  it("projects geo points into normalized field coordinates", () => {
    const projected = projectGeoPointToField(
      createGeoPoint(-34.6, -58.4),
      {
        minLatitude: -34.7,
        maxLatitude: -34.5,
        minLongitude: -58.5,
        maxLongitude: -58.3,
      },
    );

    expect(projected.x).toBeCloseTo(0.5, 6);
    expect(projected.y).toBeCloseTo(0.5, 6);
  });

  it("accumulates intensity on repeated presence in the same tile", () => {
    const samples: TelemetrySample[] = [
      sampleAt(0, -34.60, -58.40),
      sampleAt(10, -34.6001, -58.4001),
      sampleAt(20, -34.6002, -58.4002),
      sampleAt(30, -34.69, -58.49),
    ];

    const heatmap = calculateTelemetryHeatmap({
      sportType: "football",
      samples,
      grid: { columns: 4, rows: 4 },
    });

    expect(heatmap.tiles.length).toBeGreaterThanOrEqual(2);
    const strongestTile = [...heatmap.tiles].sort(
      (left, right) => right.intensity - left.intensity,
    )[0];
    expect(strongestTile.sampleCount).toBe(3);
    expect(strongestTile.intensity).toBe(1);
  });

  it("centers flat geographic spans instead of producing invalid tiles", () => {
    const samples: TelemetrySample[] = [
      sampleAt(0, -34.6, -58.4),
      sampleAt(5, -34.6, -58.4),
    ];

    const heatmap = calculateTelemetryHeatmap({
      sportType: "rugby",
      samples,
      grid: { columns: 6, rows: 6 },
    });

    expect(heatmap.projectedSamples[0]?.point).toEqual({ x: 0.5, y: 0.5 });
    expect(heatmap.tiles).toHaveLength(1);
    expect(heatmap.tiles[0]?.tileX).toBe(3);
    expect(heatmap.tiles[0]?.tileY).toBe(3);
  });
});