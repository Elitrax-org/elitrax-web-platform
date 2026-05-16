/**
 * Contact information value object. Validates email format and a relaxed
 * E.164-style phone format (digits and optional leading +, 7-15 digits).
 */

export type ContactInfo = {
  readonly email: string;
  readonly phone: string;
};

export type ContactInfoInput = {
  readonly email: string;
  readonly phone: string;
};

// Conservative email check: local@domain.tld with no spaces.
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// E.164-like: optional leading +, total 7..15 digits.
const PHONE_REGEX = /^\+?\d{7,15}$/;

export function createContactInfo(input: ContactInfoInput): ContactInfo {
  const email = input.email.trim().toLowerCase();
  if (!EMAIL_REGEX.test(email)) {
    throw new RangeError("ContactInfo.email must be a valid email address");
  }
  const phoneRaw = input.phone.trim().replace(/[\s().-]/g, "");
  if (!PHONE_REGEX.test(phoneRaw)) {
    throw new RangeError(
      "ContactInfo.phone must contain 7-15 digits with optional leading +",
    );
  }
  return { email, phone: phoneRaw };
}
