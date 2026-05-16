import { describe, expect, it } from "vitest";

import {
  createSportFieldGrid,
  getSportFieldPreset,
} from "./sport-field";

describe("SportField", () => {
  it("returns standard presets by sport", () => {
    expect(getSportFieldPreset("football")).toMatchObject({
      widthMeters: 105,
      heightMeters: 68,
    });
    expect(getSportFieldPreset("hockey")).toMatchObject({
      widthMeters: 91.4,
      heightMeters: 55,
    });
    expect(getSportFieldPreset("rugby")).toMatchObject({
      widthMeters: 100,
      heightMeters: 70,
    });
  });

  it("rejects invalid heatmap grids", () => {
    expect(() => createSportFieldGrid(0, 10)).toThrow();
    expect(() => createSportFieldGrid(10, 0)).toThrow();
    expect(() => createSportFieldGrid(10.5, 8)).toThrow();
  });
});
