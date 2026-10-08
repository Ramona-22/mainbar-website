import { createHmac, timingSafeEqual } from "node:crypto";

// Signed, expiring tokens for confirming GDPR deletion requests by email.
// Format: base64url(JSON payload) + "." + base64url(HMAC-SHA256 of the payload).
// Stateless — nothing is stored; the signature proves the link came from us and
// that whoever opens it has access to the mailbox.

export const DELETION_TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

type DeletionPayload = { email: string; exp: number };

const sign = (data: string, secret: string) =>
  createHmac("sha256", secret).update(data).digest("base64url");

export function createDeletionToken(email: string, secret: string, now = Date.now()): string {
  const payload: DeletionPayload = { email: email.trim(), exp: now + DELETION_TOKEN_TTL_MS };
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${data}.${sign(data, secret)}`;
}

export function verifyDeletionToken(token: unknown, secret: string, now = Date.now()): string | null {
  if (typeof token !== "string") return null;
  const [data, signature, extra] = token.split(".");
  if (!data || !signature || extra !== undefined) return null;

  const expected = Buffer.from(sign(data, secret));
  const actual = Buffer.from(signature);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;

  try {
    const payload = JSON.parse(Buffer.from(data, "base64url").toString()) as Partial<DeletionPayload>;
    if (typeof payload.email !== "string" || typeof payload.exp !== "number") return null;
    if (payload.exp < now) return null;
    return payload.email;
  } catch {
    return null;
  }
}
