import { describe, expect, it } from "vitest";

import { createGeoPoint, haversineDistance } from "./geo";

describe("geo helpers", () => {
  it("creates a valid GeoPoint", () => {
    const point = createGeoPoint(-34.6037, -58.3816);
    expect(point.latitude).toBeCloseTo(-34.6037);
    expect(point.longitude).toBeCloseTo(-58.3816);
  });

  it("rejects out-of-range coordinates", () => {
    expect(() => createGeoPoint(91, 0)).toThrow(/GeoPoint/);
    expect(() => createGeoPoint(0, -181)).toThrow(/GeoPoint/);
    expect(() => createGeoPoint(Number.NaN, 0)).toThrow(/GeoPoint/);
  });

  it("returns zero distance for the same point", () => {
    const a = createGeoPoint(40.7128, -74.006);
    expect(haversineDistance(a, a).meters).toBeCloseTo(0, 3);
  });

  it("computes Buenos Aires to Montevideo distance within tolerance", () => {
    const buenosAires = createGeoPoint(-34.6037, -58.3816);
    const montevideo = createGeoPoint(-34.9011, -56.1645);
    const meters = haversineDistance(buenosAires, montevideo).meters;
    expect(meters).toBeGreaterThan(195_000);
    expect(meters).toBeLessThan(215_000);
  });
});
