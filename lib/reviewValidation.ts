export interface ReviewData {
  author: string;
  text: string;
  rating: number;
}

export type ReviewValidationResult =
  | { valid: true; data: ReviewData }
  | { valid: false; error: string };

// Same limits as firestore.rules (reviews create rule).
export const MAX_AUTHOR_LENGTH = 80;
export const MAX_TEXT_LENGTH = 1000;

export function validateReview(input: unknown): ReviewValidationResult {
  if (typeof input !== "object" || input === null) {
    return { valid: false, error: "Invalid request body" };
  }
  const { author, text, rating } = input as Record<string, unknown>;

  if (typeof author !== "string" || !author.trim() || author.trim().length > MAX_AUTHOR_LENGTH) {
    return { valid: false, error: "Bitte einen Vornamen angeben (max. 80 Zeichen)." };
  }
  if (typeof text !== "string" || !text.trim() || text.trim().length > MAX_TEXT_LENGTH) {
    return { valid: false, error: "Bitte eine Bewertung schreiben (max. 1000 Zeichen)." };
  }
  if (typeof rating !== "number" || !Number.isInteger(rating) || rating < 1 || rating > 5) {
    return { valid: false, error: "Bitte 1 bis 5 Sterne vergeben." };
  }
  return { valid: true, data: { author: author.trim(), text: text.trim(), rating } };
}
