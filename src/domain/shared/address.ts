/**
 * Postal address value object. Country is stored as ISO-3166-1 alpha-2
 * (uppercase). Trims all string inputs and rejects empty required fields.
 */

export type Address = {
  readonly countryCode: string;
  readonly city: string;
  readonly line1: string;
  readonly line2?: string;
  readonly postalCode?: string;
  readonly region?: string;
};

export type AddressInput = {
  readonly countryCode: string;
  readonly city: string;
  readonly line1: string;
  readonly line2?: string | null;
  readonly postalCode?: string | null;
  readonly region?: string | null;
};

const COUNTRY_CODE_REGEX = /^[A-Za-z]{2}$/;

function normalizeOptional(value: string | null | undefined): string | undefined {
  if (value === null || value === undefined) return undefined;
  const trimmed = value.trim();
  return trimmed.length === 0 ? undefined : trimmed;
}

export function createAddress(input: AddressInput): Address {
  const countryCode = input.countryCode.trim();
  if (!COUNTRY_CODE_REGEX.test(countryCode)) {
    throw new RangeError(
      "Address.countryCode must be a 2-letter ISO-3166-1 alpha-2 code",
    );
  }
  const city = input.city.trim();
  if (city.length === 0) {
    throw new RangeError("Address.city is required");
  }
  const line1 = input.line1.trim();
  if (line1.length === 0) {
    throw new RangeError("Address.line1 is required");
  }
  return {
    countryCode: countryCode.toUpperCase(),
    city,
    line1,
    line2: normalizeOptional(input.line2),
    postalCode: normalizeOptional(input.postalCode),
    region: normalizeOptional(input.region),
  };
}
