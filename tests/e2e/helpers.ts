import type { Page } from "@playwright/test";

// Firebase emulators started by `firebase emulators:exec` (see npm run test:e2e).
const PROJECT = "demo-mainbar";
const FIRESTORE = `http://127.0.0.1:8080/v1/projects/${PROJECT}/databases/(default)/documents`;
const AUTH = "http://127.0.0.1:9099";
const OWNER = { Authorization: "Bearer owner" }; // emulator admin access, bypasses rules

export const ADMIN_EMAIL = "mainbarsw@gmail.com";
export const ADMIN_PASSWORD = "e2e-test-password";

/** Empties the emulator database and accounts. */
export async function resetEmulators() {
  await fetch(`http://127.0.0.1:8080/emulator/v1/projects/${PROJECT}/databases/(default)/documents`, {
    method: "DELETE",
  });
  await fetch(`${AUTH}/emulator/v1/projects/${PROJECT}/accounts`, { method: "DELETE" });
}

type Value = string | number | boolean | Date;
const toField = (v: Value) =>
  v instanceof Date
    ? { timestampValue: v.toISOString() }
    :
  typeof v === "string"
    ? { stringValue: v }
    : typeof v === "boolean"
      ? { booleanValue: v }
      : Number.isInteger(v)
        ? { integerValue: String(v) }
        : { doubleValue: v };

/** Adds a document directly (as admin) and returns its id. */
export async function addDoc(collection: string, data: Record<string, Value>) {
  const res = await fetch(`${FIRESTORE}/${collection}`, {
    method: "POST",
    headers: { ...OWNER, "Content-Type": "application/json" },
    body: JSON.stringify({
      fields: Object.fromEntries(Object.entries(data).map(([k, v]) => [k, toField(v)])),
    }),
  });
  const json = (await res.json()) as { name: string };
  return json.name.split("/").pop()!;
}

type Field = { stringValue?: string; integerValue?: string; doubleValue?: number; booleanValue?: boolean };

/** Lists a collection as plain objects (as admin). */
export async function listDocs(collection: string) {
  const res = await fetch(`${FIRESTORE}/${collection}?pageSize=300`, { headers: OWNER });
  const json = (await res.json()) as { documents?: { name: string; fields: Record<string, Field> }[] };
  return (json.documents ?? []).map((d) => ({
    id: d.name.split("/").pop()!,
    ...Object.fromEntries(
      Object.entries(d.fields).map(([k, f]) => [
        k,
        f.stringValue ?? (f.integerValue !== undefined ? Number(f.integerValue) : f.doubleValue ?? f.booleanValue),
      ])
    ),
  })) as Record<string, unknown>[];
}

/** Creates the owner's admin account in the auth emulator. */
export async function createAdmin() {
  await fetch(`${AUTH}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=demo-key`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD, returnSecureToken: true }),
  });
}

/**
 * Marks the visitor as returning (intro already seen, cookie notice answered), so a
 * test starts on the plain page. Pass `intro: true` to keep the intro.
 */
export async function returningVisitor(page: Page, { intro = false } = {}) {
  await page.addInitScript((keepIntro) => {
    try {
      if (!keepIntro) localStorage.setItem("mb-intro-seen", "1");
      localStorage.setItem(
        "cookie-consent",
        JSON.stringify({
          necessary: true,
          version: 4,
          savedAt: Date.now(),
          consentId: "3f1c2a9e-5b7d-4c1e-9a2b-6d8e0f4a1b2c",
        })
      );
    } catch {
      // storage blocked: the test will show it
    }
  }, intro);
}

/** A date about a month ahead, as YYYY-MM-DD. */
export const futureDate = () => {
  const d = new Date(Date.now() + 30 * 24 * 3600 * 1000);
  return d.toLocaleDateString("sv-SE");
};
