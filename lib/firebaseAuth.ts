import { getAuth } from "firebase/auth";
import { app } from "./firebase";

// Kept separate from lib/firebase.ts so the Firebase Auth SDK is only bundled
// into the admin page, not the public pages.
export const auth = getAuth(app);
