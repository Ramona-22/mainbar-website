import { afterAll, beforeAll, beforeEach, describe, it } from "vitest";
import { assertFails, assertSucceeds, type RulesTestEnvironment } from "@firebase/rules-unit-testing";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { asAnon, asEmailAdmin, asUser, seedDocAdmin, setupRulesEnv } from "./helpers";

let env: RulesTestEnvironment;
const DAY_MS = 24 * 60 * 60 * 1000;
const THREE_YEARS_MS = 3 * 365 * DAY_MS; // same as lib/consentLog.ts

const validConsent = () => ({
  consentId: "3f1c2b4a-9d8e-4f7a-8b6c-1a2b3c4d5e6f",
  necessary: true,
  version: 4,
  createdAt: serverTimestamp(),
  expireAt: Timestamp.fromMillis(Date.now() + THREE_YEARS_MS),
});

beforeAll(async () => {
  env = await setupRulesEnv();
});
afterAll(async () => {
  await env.cleanup();
});
beforeEach(async () => {
  await env.clearFirestore();
  await seedDocAdmin(env);
  await env.withSecurityRulesDisabled(async (ctx) => {
    await ctx.firestore().doc("cookieConsents/c1").set({ ...validConsent(), createdAt: Timestamp.now() });
  });
});

describe("cookieConsents: create", () => {
  it("allows the record written by lib/consentLog.ts (expireAt ~3 years)", async () => {
    await assertSucceeds(addDoc(collection(asAnon(env), "cookieConsents"), validConsent()));
  });

  it.each([
    ["an uppercase / non-v4 uuid", { consentId: "3F1C2B4A-9D8E-1F7A-8B6C-1A2B3C4D5E6F" }],
    ["a non-uuid id", { consentId: "abc" }],
    ["necessary false", { necessary: false }],
    ["version 0", { version: 0 }],
    ["version as string", { version: "4" }],
    ["expireAt 1 year", { expireAt: Timestamp.fromMillis(Date.now() + 365 * DAY_MS) }],
    ["expireAt 4 years", { expireAt: Timestamp.fromMillis(Date.now() + 4 * 365 * DAY_MS) }],
    ["expireAt as number", { expireAt: Date.now() + THREE_YEARS_MS }],
    ["client createdAt", { createdAt: Timestamp.now() }],
    ["an extra key (ip)", { ip: "203.0.113.5" }],
  ])("denies a record with %s", async (_label, patch) => {
    await assertFails(
      addDoc(collection(asAnon(env), "cookieConsents"), { ...validConsent(), ...patch })
    );
  });

  it("denies a record with a missing key", async () => {
    const data: Record<string, unknown> = validConsent();
    delete data.version;
    await assertFails(addDoc(collection(asAnon(env), "cookieConsents"), data));
  });
});

describe("cookieConsents: read, update, delete", () => {
  it("denies public and non-admin reads", async () => {
    await assertFails(getDoc(doc(asAnon(env), "cookieConsents/c1")));
    await assertFails(getDocs(collection(asAnon(env), "cookieConsents")));
    await assertFails(getDocs(collection(asUser(env), "cookieConsents")));
  });

  it("allows admin reads", async () => {
    await assertSucceeds(getDocs(collection(asEmailAdmin(env), "cookieConsents")));
  });

  it("denies updates for everyone, including admins", async () => {
    await assertFails(updateDoc(doc(asAnon(env), "cookieConsents/c1"), { version: 5 }));
    await assertFails(updateDoc(doc(asEmailAdmin(env), "cookieConsents/c1"), { version: 5 }));
  });

  it("allows only admins to delete", async () => {
    await assertFails(deleteDoc(doc(asAnon(env), "cookieConsents/c1")));
    await assertSucceeds(deleteDoc(doc(asEmailAdmin(env), "cookieConsents/c1")));
  });
});
