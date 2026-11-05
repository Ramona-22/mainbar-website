import { describe, expect, it } from "vitest";
import { escapeHtml, validateBooking } from "./bookingValidation";

const validPayload = {
  seating: "inside",
  guests: 4,
  date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
  state: "Bayern",
  city: "Schweinfurt",
  phone: "+49 170 2278096",
  email: "guest@example.com",
};

describe("validateBooking", () => {
  it("accepts a well-formed payload", () => {
    const result = validateBooking(validPayload);
    expect(result.valid).toBe(true);
  });

  it("rejects a non-object body", () => {
    const result = validateBooking("not an object");
    expect(result.valid).toBe(false);
  });

  it("rejects a missing required field", () => {
    const incomplete: Partial<typeof validPayload> = { ...validPayload };
    delete incomplete.email;
    const result = validateBooking(incomplete);
    expect(result.valid).toBe(false);
  });

  it("rejects an invalid email address", () => {
    const result = validateBooking({ ...validPayload, email: "not-an-email" });
    expect(result.valid).toBe(false);
  });

  it("rejects an unrecognized seating option", () => {
    const result = validateBooking({ ...validPayload, seating: "rooftop" });
    expect(result.valid).toBe(false);
  });

  it("rejects guests below 1", () => {
    const result = validateBooking({ ...validPayload, guests: 0 });
    expect(result.valid).toBe(false);
  });

  it("rejects guests above 30", () => {
    const result = validateBooking({ ...validPayload, guests: 31 });
    expect(result.valid).toBe(false);
  });

  it("rejects a non-integer guest count", () => {
    const result = validateBooking({ ...validPayload, guests: 2.5 });
    expect(result.valid).toBe(false);
  });

  it("rejects past, impossible and non-ISO dates", () => {
    for (const date of ["2020-01-01", "2030-02-31", "01.09.2030", "2030-09-01\r\nBcc: x@y.z"]) {
      expect(validateBooking({ ...validPayload, date }).valid).toBe(false);
    }
  });

  it("rejects an invalid date", () => {
    const result = validateBooking({ ...validPayload, date: "not-a-date" });
    expect(result.valid).toBe(false);
  });

  it("trims whitespace from string fields", () => {
    const result = validateBooking({ ...validPayload, city: "  Schweinfurt  " });
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.data.city).toBe("Schweinfurt");
    }
  });
});

describe("escapeHtml", () => {
  it("escapes HTML-significant characters", () => {
    expect(escapeHtml(`<script>alert("x")</script>`)).toBe(
      "&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;"
    );
  });

  it("leaves plain text untouched", () => {
    expect(escapeHtml("Schweinfurt")).toBe("Schweinfurt");
  });
});
