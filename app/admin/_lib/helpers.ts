export const getErrorInfo = (err: unknown) => {
  const e = err as { code?: string; message?: string };
  return { code: e?.code, message: e?.message };
};

// Login errors in plain German. Never reveal whether an account exists:
// unknown user, wrong password and disabled account all get the same text.
export const loginErrorMessage = (code?: string) => {
  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
    case "auth/user-disabled":
    case "auth/invalid-email":
      return "Falsche E-Mail oder Passwort.";
    case "auth/too-many-requests":
      return "Zu viele Versuche. Bitte einige Minuten warten oder das Passwort zurücksetzen.";
    case "auth/network-request-failed":
      return "Keine Verbindung. Bitte Internetverbindung prüfen.";
    default:
      return "Anmeldung fehlgeschlagen. Bitte später erneut versuchen.";
  }
};

// Today's date as YYYY-MM-DD in the browser's local time zone (not UTC),
// so bookings move to "Vergangene Events" at local midnight.
export const localToday = () => new Date().toLocaleDateString("sv-SE");

// "2026-05-01" -> "1.5.2026" without time-zone shifts.
export const formatBookingDate = (value?: string) => {
  if (!value) return "Kein Datum";
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return value;
  return `${Number(match[3])}.${Number(match[2])}.${match[1]}`;
};

export const RESET_COOLDOWN_SECONDS = 60;
