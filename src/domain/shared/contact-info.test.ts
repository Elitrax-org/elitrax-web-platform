import { describe, expect, it } from "vitest";

import { createContactInfo } from "./contact-info";

describe("createContactInfo", () => {
  it("normalizes email and strips phone formatting", () => {
    const c = createContactInfo({
      email: "  Owner@Example.COM ",
      phone: " +1 (555) 123-4567 ",
    });
    expect(c).toEqual({ email: "owner@example.com", phone: "+15551234567" });
  });

  it("rejects invalid email", () => {
    expect(() =>
      createContactInfo({ email: "not-an-email", phone: "+15551234567" }),
    ).toThrow(/email/);
  });

  it("rejects phones outside 7-15 digits", () => {
    expect(() =>
      createContactInfo({ email: "a@b.co", phone: "12345" }),
    ).toThrow(/phone/);
    expect(() =>
      createContactInfo({ email: "a@b.co", phone: "1234567890123456" }),
    ).toThrow(/phone/);
  });
});
