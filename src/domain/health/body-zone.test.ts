import { describe, expect, it } from "vitest";

import {
  bodyZoneDetail,
  combineBodyZoneFlags,
  hasBodyZoneFlag,
  isValidBodyZoneDetail,
} from "./body-zone";

describe("hasBodyZoneFlag", () => {
  it("detects combined injury zone flags", () => {
    const value = bodyZoneDetail.zone2 | bodyZoneDetail.zone5;

    expect(hasBodyZoneFlag(value, bodyZoneDetail.zone2)).toBe(true);
    expect(hasBodyZoneFlag(value, bodyZoneDetail.zone5)).toBe(true);
    expect(hasBodyZoneFlag(value, bodyZoneDetail.zone3)).toBe(false);
  });

  it("treats none as an exact empty value", () => {
    expect(hasBodyZoneFlag(bodyZoneDetail.none, bodyZoneDetail.none)).toBe(
      true,
    );
    expect(hasBodyZoneFlag(bodyZoneDetail.zone1, bodyZoneDetail.none)).toBe(
      false,
    );
  });

  it("combines injury zone flags into a valid bitmask", () => {
    const value = combineBodyZoneFlags([
      bodyZoneDetail.zone1,
      bodyZoneDetail.zone4,
      bodyZoneDetail.zone7,
    ]);

    expect(value).toBe(73);
    expect(isValidBodyZoneDetail(value)).toBe(true);
  });

  it("validates allowed injury zone bitmasks", () => {
    expect(isValidBodyZoneDetail(0)).toBe(true);
    expect(isValidBodyZoneDetail(127)).toBe(true);
    expect(isValidBodyZoneDetail(128)).toBe(false);
    expect(isValidBodyZoneDetail(1.5)).toBe(false);
    expect(isValidBodyZoneDetail(-1)).toBe(false);
  });
});
