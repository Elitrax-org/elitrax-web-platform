import { describe, expect, it } from "vitest";

import {
  hasSubscriptionCapacity,
  normalizeSubscriptionLimit,
} from "./subscription-limit-policy";

describe("SubscriptionLimitPolicy", () => {
  it("treats null limits as unlimited capacity", () => {
    expect(hasSubscriptionCapacity(10_000, null)).toBe(true);
  });

  it("allows usage below the configured limit", () => {
    expect(hasSubscriptionCapacity(4, 5)).toBe(true);
  });

  it("denies usage at or above the configured limit", () => {
    expect(hasSubscriptionCapacity(5, 5)).toBe(false);
    expect(hasSubscriptionCapacity(6, 5)).toBe(false);
  });

  it("rejects negative current usage", () => {
    expect(() => hasSubscriptionCapacity(-1, 5)).toThrow(
      "currentCount must be zero or greater",
    );
  });

  it("normalizes finite limits and unlimited plans", () => {
    expect(normalizeSubscriptionLimit(3)).toBe(3);
    expect(normalizeSubscriptionLimit(null)).toBeNull();
    expect(normalizeSubscriptionLimit("unlimited")).toBeNull();
  });
});
