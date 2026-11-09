import { describe, expect, it } from "vitest";
import { validateReview } from "./reviewValidation";

const valid = { author: "Anna", text: "Sehr lecker!", rating: 5 };

describe("validateReview", () => {
  it("accepts a normal review and trims text", () => {
    const result = validateReview({ ...valid, author: "  Anna  " });
    expect(result).toEqual({ valid: true, data: { ...valid } });
  });

  it("rejects non-objects", () => {
    expect(validateReview(null).valid).toBe(false);
    expect(validateReview("x").valid).toBe(false);
  });

  it("rejects empty or too long names and texts", () => {
    expect(validateReview({ ...valid, author: "   " }).valid).toBe(false);
    expect(validateReview({ ...valid, author: "a".repeat(81) }).valid).toBe(false);
    expect(validateReview({ ...valid, text: "" }).valid).toBe(false);
    expect(validateReview({ ...valid, text: "a".repeat(1001) }).valid).toBe(false);
  });

  it("only accepts whole ratings from 1 to 5", () => {
    for (const rating of [0, 6, 2.5, "5", NaN]) {
      expect(validateReview({ ...valid, rating }).valid).toBe(false);
    }
  });
});
