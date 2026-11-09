import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase only if it hasn't been initialized already
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);

// Test builds only (npm run test:e2e): talk to the local Firebase emulators
// instead of the real project. Never set this variable in production.
const g = globalThis as { __mainbarFirestoreEmulator?: boolean };
if (process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === "1" && !g.__mainbarFirestoreEmulator) {
  connectFirestoreEmulator(db, "127.0.0.1", 8080);
  g.__mainbarFirestoreEmulator = true;
}
// Firebase Auth lives in lib/firebaseAuth.ts (admin only).