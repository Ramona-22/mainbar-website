export interface BookingData {
  seating: "inside" | "outside" | "catering";
  guests: number;
  date: string;
  state: string;
  city: string;
  phone: string;
  email: string;
}

export type BookingValidationResult =
  | { valid: true; data: BookingData }
  | { valid: false; error: string };

const SEATING_OPTIONS = new Set(["inside", "outside", "catering"]);
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_TEXT_LENGTH = 200;
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const DAY_MS = 24 * 60 * 60 * 1000;

// Event date from <input type="date">: YYYY-MM-DD, a real calendar day, from
// yesterday (timezone slack) up to two years ahead.
export function isValidEventDate(value: string, now = Date.now()): boolean {
  if (!ISO_DATE_PATTERN.test(value)) return false;
  const time = Date.parse(`${value}T00:00:00Z`);
  if (Number.isNaN(time) || new Date(time).toISOString().slice(0, 10) !== value) return false;
  return time >= now - 2 * DAY_MS && time <= now + 730 * DAY_MS;
}

export function isValidEmail(value: string): boolean {
  return value.length <= MAX_TEXT_LENGTH && EMAIL_PATTERN.test(value);
}

function isNonEmptyString(value: unknown, maxLength = MAX_TEXT_LENGTH): value is string {
  return typeof value === "string" && value.trim().length > 0 && value.length <= maxLength;
}

export function validateBooking(input: unknown): BookingValidationResult {
  if (typeof input !== "object" || input === null) {
    return { valid: false, error: "Invalid request body" };
  }

  const data = input as Record<string, unknown>;

  if (!isNonEmptyString(data.seating) || !SEATING_OPTIONS.has(data.seating as string)) {
    return { valid: false, error: "Invalid seating option" };
  }

  const guests = typeof data.guests === "number" ? data.guests : Number(data.guests);
  if (!Number.isInteger(guests) || guests < 1 || guests > 30) {
    return { valid: false, error: "Guests must be an integer between 1 and 30" };
  }

  if (typeof data.date !== "string" || !isValidEventDate(data.date.trim())) {
    return { valid: false, error: "Invalid date" };
  }

  if (!isNonEmptyString(data.state)) {
    return { valid: false, error: "Invalid state" };
  }

  if (!isNonEmptyString(data.city)) {
    return { valid: false, error: "Invalid city" };
  }

  if (!isNonEmptyString(data.phone, 40)) {
    return { valid: false, error: "Invalid phone number" };
  }

  if (!isNonEmptyString(data.email, MAX_TEXT_LENGTH) || !EMAIL_PATTERN.test(data.email as string)) {
    return { valid: false, error: "Invalid email address" };
  }

  return {
    valid: true,
    data: {
      seating: data.seating as BookingData["seating"],
      guests,
      date: (data.date as string).trim(),
      state: (data.state as string).trim(),
      city: (data.city as string).trim(),
      phone: (data.phone as string).trim(),
      email: (data.email as string).trim(),
    },
  };
}

const HTML_ESCAPE_MAP: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => HTML_ESCAPE_MAP[char]);
}
