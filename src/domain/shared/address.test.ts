import { describe, expect, it } from "vitest";

import { createAddress } from "./address";

describe("createAddress", () => {
  it("normalizes country code and trims fields", () => {
    const a = createAddress({
      countryCode: " ar ",
      city: "  Buenos Aires ",
      line1: " Av. Corrientes 1234 ",
      line2: "  ",
      postalCode: " C1043 ",
      region: " CABA ",
    });
    expect(a).toEqual({
      countryCode: "AR",
      city: "Buenos Aires",
      line1: "Av. Corrientes 1234",
      line2: undefined,
      postalCode: "C1043",
      region: "CABA",
    });
  });

  it("rejects invalid country codes", () => {
    expect(() =>
      createAddress({ countryCode: "ARG", city: "x", line1: "y" }),
    ).toThrow(/countryCode/);
    expect(() =>
      createAddress({ countryCode: "1A", city: "x", line1: "y" }),
    ).toThrow(/countryCode/);
  });

  it("rejects empty city or line1", () => {
    expect(() =>
      createAddress({ countryCode: "us", city: " ", line1: "y" }),
    ).toThrow(/city/);
    expect(() =>
      createAddress({ countryCode: "us", city: "x", line1: "" }),
    ).toThrow(/line1/);
  });
});
