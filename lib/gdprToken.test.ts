import { describe, expect, it } from "vitest";
import { createDeletionToken, verifyDeletionToken, DELETION_TOKEN_TTL_MS } from "./gdprToken";

const SECRET = "test-secret";

describe("deletion tokens", () => {
  it("round-trips the (trimmed) email", () => {
    const token = createDeletionToken(" Gast@Example.de ", SECRET);
    expect(verifyDeletionToken(token, SECRET)).toBe("Gast@Example.de");
  });

  it("rejects a token signed with a different secret", () => {
    const token = createDeletionToken("gast@example.de", "other-secret");
    expect(verifyDeletionToken(token, SECRET)).toBeNull();
  });

  it("rejects a token whose payload was swapped for another email", () => {
    const token = createDeletionToken("attacker@example.de", SECRET);
    const [, signature] = token.split(".");
    const forged = Buffer.from(JSON.stringify({ email: "victim@example.de", exp: Date.now() + 1000 })).toString("base64url");
    expect(verifyDeletionToken(`${forged}.${signature}`, SECRET)).toBeNull();
  });

  it("rejects an expired token", () => {
    const now = Date.now();
    const token = createDeletionToken("gast@example.de", SECRET, now);
    expect(verifyDeletionToken(token, SECRET, now + DELETION_TOKEN_TTL_MS + 1)).toBeNull();
  });

  it("rejects malformed input", () => {
    for (const bad of [undefined, 42, "", "abc", "a.b.c", "!!!.???"]) {
      expect(verifyDeletionToken(bad, SECRET)).toBeNull();
    }
  });
});
