import { cert, getApp, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

// Server-only Firestore access with a service account. Unlike the browser SDK in
// lib/firebase.ts it bypasses Firestore security rules, so it must never be
// imported from client components.
// Returns null when FIREBASE_SERVICE_ACCOUNT_KEY isn't configured.
export function getAdminDb(): Firestore | null {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!raw) return null;

  const app = getApps().length
    ? getApp()
    : initializeApp({ credential: cert(JSON.parse(raw)) });
  return getFirestore(app);
}
