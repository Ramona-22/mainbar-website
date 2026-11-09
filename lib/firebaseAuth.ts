import { getAuth, connectAuthEmulator } from "firebase/auth";
import { app } from "./firebase";

// Kept separate from lib/firebase.ts so the Firebase Auth SDK is only bundled
// into the admin page, not the public pages.
export const auth = getAuth(app);

// Test builds only (npm run test:e2e): use the local Auth emulator.
const g = globalThis as { __mainbarAuthEmulator?: boolean };
if (process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === "1" && !g.__mainbarAuthEmulator) {
  connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
  g.__mainbarAuthEmulator = true;
}
