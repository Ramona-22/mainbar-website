import { useState, useEffect, type FormEvent } from "react";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../../lib/firebaseAuth";
import { getErrorInfo, loginErrorMessage, RESET_COOLDOWN_SECONDS } from "./helpers";

// Login + password-reset state. Lives in the page (not in LoginForm) so the
// email, messages and reset cooldown survive a login/logout cycle.
export function useLoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [info, setInfo] = useState("");
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [resetCooldown, setResetCooldown] = useState(0);

  // Countdown so the reset email cannot be requested over and over.
  useEffect(() => {
    if (resetCooldown <= 0) return;
    const timer = setTimeout(() => setResetCooldown((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [resetCooldown]);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setError("");
    setInfo("");
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      setPassword("");
    } catch (err) {
      const { code } = getErrorInfo(err);
      if (!code?.startsWith("auth/") || code === "auth/internal-error") {
        console.error(err);
      }
      setError(loginErrorMessage(code));
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handlePasswordReset = async () => {
    setError("");
    setInfo("");
    if (resetCooldown > 0) return;
    const target = email.trim();
    if (!target) {
      setError("Bitte zuerst oben die E-Mail-Adresse eingeben.");
      return;
    }
    setIsSendingReset(true);
    auth.languageCode = "de";
    try {
      // After setting a new password, the email's button leads back here.
      await sendPasswordResetEmail(auth, target, {
        url: `${window.location.origin}/admin`,
      });
    } catch (err) {
      const { code } = getErrorInfo(err);
      if (code === "auth/invalid-email" || code === "auth/missing-email") {
        setError("Bitte eine gültige E-Mail-Adresse eingeben.");
        setIsSendingReset(false);
        return;
      }
      if (code === "auth/unauthorized-continue-uri" || code === "auth/invalid-continue-uri") {
        // Domain not on Firebase's authorized list: send the plain link instead.
        try {
          await sendPasswordResetEmail(auth, target);
        } catch (retryErr) {
          console.error(retryErr);
        }
      } else if (code === "auth/too-many-requests") {
        setError("Zu viele Anfragen. Bitte später erneut versuchen.");
        setIsSendingReset(false);
        return;
      } else if (code !== "auth/user-not-found") {
        console.error(err);
      }
    }
    // Same message whether or not the account exists.
    setInfo(
      "Falls ein Admin-Konto mit dieser E-Mail existiert, wurde ein Link zum Zurücksetzen des Passworts gesendet. Bitte auch den Spam-Ordner prüfen."
    );
    setResetCooldown(RESET_COOLDOWN_SECONDS);
    setIsSendingReset(false);
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    error,
    info,
    isLoggingIn,
    isSendingReset,
    resetCooldown,
    handleLogin,
    handlePasswordReset,
  };
}

export type LoginFormState = ReturnType<typeof useLoginForm>;
