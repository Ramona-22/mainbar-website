import { getAdminDb } from "../../../lib/firebaseAdmin";

export const UNAVAILABLE_MESSAGE =
  "Löschanfragen sind derzeit nur per E-Mail an info@mainbar-sw.de möglich.";

// Both pieces of server config the deletion flow needs; null if either is missing.
export function getGdprConfig() {
  const secret = process.env.GDPR_TOKEN_SECRET;
  const db = getAdminDb();
  if (!secret || !db) {
    console.error("GDPR deletion disabled: set GDPR_TOKEN_SECRET and FIREBASE_SERVICE_ACCOUNT_KEY.");
    return null;
  }
  return { secret, db };
}

type AdminDb = NonNullable<ReturnType<typeof getAdminDb>>;

// Bookings store the email as typed, so match both the given and the lower-cased form.
export function findBookingsByEmail(db: AdminDb, email: string) {
  const variants = Array.from(new Set([email, email.toLowerCase()]));
  return db.collection("bookings").where("email", "in", variants).get();
}
