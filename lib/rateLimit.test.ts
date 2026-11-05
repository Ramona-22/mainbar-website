import { describe, expect, it } from "vitest";
import { checkRateLimit } from "./rateLimit";

describe("checkRateLimit (in-memory fallback, Upstash not configured)", () => {
  it("allows the first 5 booking requests per client, then blocks", async () => {
    for (let i = 0; i < 5; i++) {
      expect((await checkRateLimit("client-a")).allowed).toBe(true);
    }
    const blocked = await checkRateLimit("client-a");
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("counts clients and endpoints separately", async () => {
    expect((await checkRateLimit("client-b")).allowed).toBe(true);
    expect((await checkRateLimit("client-a", "gdpr-delete")).allowed).toBe(true);
  });
});
