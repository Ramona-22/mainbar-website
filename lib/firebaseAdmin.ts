import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

// Server-only Firestore access (API routes). Writes made here bypass the
// Firestore rules, so bookings and reviews are validated and rate-limited on
// the server before they are stored.
//
// Configure FIREBASE_SERVICE_ACCOUNT (the whole service-account JSON) in the
// hosting environment. Without it this returns null and the browser falls
// back to writing directly (still checked by firestore.rules). In tests,
// FIRESTORE_EMULATOR_HOST points it at the local emulator instead.
let cached: Firestore | null | undefined;

export function getAdminDb(): Firestore | null {
  if (cached !== undefined) return cached;

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  const emulator = process.env.FIRESTORE_EMULATOR_HOST;
  if (!raw && !emulator) {
    cached = null;
    return cached;
  }

  try {
    const app =
      getApps()[0] ??
      (raw
        ? initializeApp({ credential: cert(JSON.parse(raw)) })
        : initializeApp({ projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID }));
    cached = getFirestore(app);
  } catch (error) {
    console.error("[firebaseAdmin] FIREBASE_SERVICE_ACCOUNT is invalid:", error);
    cached = null;
  }
  return cached;
}
