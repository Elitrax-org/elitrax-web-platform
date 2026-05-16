import { describe, expect, it } from "vitest";

import { addMoney, compareMoney, createMoney, subtractMoney } from "./money";

describe("Money value object", () => {
  it("creates money in minor units with normalized currency", () => {
    const money = createMoney(1999, "usd");
    expect(money).toEqual({ amountMinor: 1999, currency: "USD" });
  });

  it("rejects fractional or invalid input", () => {
    expect(() => createMoney(1.5, "USD")).toThrow(/amountMinor/);
    expect(() => createMoney(100, "US")).toThrow(/currency/);
  });

  it("adds and subtracts amounts of the same currency", () => {
    const a = createMoney(2000, "USD");
    const b = createMoney(1500, "USD");
    expect(addMoney(a, b).amountMinor).toBe(3500);
    expect(subtractMoney(a, b).amountMinor).toBe(500);
  });

  it("rejects mixed currency arithmetic", () => {
    const usd = createMoney(2000, "USD");
    const ars = createMoney(2000, "ARS");
    expect(() => addMoney(usd, ars)).toThrow(/currency mismatch/);
  });

  it("compares money values", () => {
    const a = createMoney(500, "USD");
    const b = createMoney(1000, "USD");
    expect(compareMoney(a, b)).toBe(-1);
    expect(compareMoney(b, a)).toBe(1);
    expect(compareMoney(a, a)).toBe(0);
  });
});
