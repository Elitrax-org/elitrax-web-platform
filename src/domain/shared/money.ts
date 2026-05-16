export type CurrencyCode = string;

export type Money = {
  readonly amountMinor: number;
  readonly currency: CurrencyCode;
};

export function createMoney(amountMinor: number, currency: CurrencyCode): Money {
  if (!Number.isInteger(amountMinor)) {
    throw new RangeError("Money.amountMinor must be an integer in minor units");
  }
  if (typeof currency !== "string" || currency.length !== 3) {
    throw new RangeError("Money.currency must be a 3-letter ISO 4217 code");
  }
  return { amountMinor, currency: currency.toUpperCase() };
}

function ensureSameCurrency(a: Money, b: Money) {
  if (a.currency !== b.currency) {
    throw new RangeError(
      `Money currency mismatch: ${a.currency} vs ${b.currency}`,
    );
  }
}

export function addMoney(a: Money, b: Money): Money {
  ensureSameCurrency(a, b);
  return { amountMinor: a.amountMinor + b.amountMinor, currency: a.currency };
}

export function subtractMoney(a: Money, b: Money): Money {
  ensureSameCurrency(a, b);
  return { amountMinor: a.amountMinor - b.amountMinor, currency: a.currency };
}

export function compareMoney(a: Money, b: Money): -1 | 0 | 1 {
  ensureSameCurrency(a, b);
  if (a.amountMinor < b.amountMinor) return -1;
  if (a.amountMinor > b.amountMinor) return 1;
  return 0;
}

export const billingIntervals = ["monthly", "yearly"] as const;
export type BillingInterval = (typeof billingIntervals)[number];
