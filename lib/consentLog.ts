// Stores an anonymous record of the visitor's cookie choice in Firestore
// (collection "cookieConsents") as proof of consent (Art. 7 Abs. 1 DSGVO).
// The record holds only a random ID, the notice version and the time; no IP
// address, user agent or other personal data. Firebase is imported lazily so
// pages without the banner action do not load it.

const RETENTION_MS = 3 * 365 * 24 * 60 * 60 * 1000; // 3 years, see Datenschutz §9

export async function logConsent(consentId: string, version: number): Promise<void> {
  const [{ db }, { addDoc, collection, serverTimestamp, Timestamp }] = await Promise.all([
    import("./firebase"),
    import("firebase/firestore"),
  ]);
  await addDoc(collection(db, "cookieConsents"), {
    consentId,
    necessary: true,
    version,
    createdAt: serverTimestamp(),
    // Records past this date are deleted by the admin dashboard
    // (app/admin/_lib/useAdminData.ts) on the next admin login.
    expireAt: Timestamp.fromMillis(Date.now() + RETENTION_MS),
  });
}

export function newConsentId(): string {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  // Fallback for very old browsers: RFC 4122 v4 from getRandomValues.
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
