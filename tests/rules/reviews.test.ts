import { afterAll, beforeAll, beforeEach, describe, it } from "vitest";
import { assertFails, assertSucceeds, type RulesTestEnvironment } from "@firebase/rules-unit-testing";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { asAnon, asDocAdmin, asEmailAdmin, asUser, seedDocAdmin, setupRulesEnv } from "./helpers";

let env: RulesTestEnvironment;

const validReview = () => ({
  author: "Anna",
  text: "Sehr lecker!",
  rating: 5,
  approved: false,
  createdAt: serverTimestamp(),
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
    const db = ctx.firestore();
    await db.doc("reviews/public").set({ ...validReview(), approved: true, createdAt: Timestamp.now() });
    await db.doc("reviews/pending").set({ ...validReview(), createdAt: Timestamp.now() });
  });
});

describe("reviews: create", () => {
  it("allows a valid unapproved review from an anonymous visitor", async () => {
    await assertSucceeds(addDoc(collection(asAnon(env), "reviews"), validReview()));
  });

  it("forces approved: false (self-approval is denied, even for admins)", async () => {
    await assertFails(addDoc(collection(asAnon(env), "reviews"), { ...validReview(), approved: true }));
    await assertFails(
      addDoc(collection(asEmailAdmin(env), "reviews"), { ...validReview(), approved: true })
    );
  });

  it.each([
    ["missing approved", { approved: undefined }],
    ["empty author", { author: "" }],
    ["author over 80 chars", { author: "a".repeat(81) }],
    ["text over 1000 chars", { text: "t".repeat(1001) }],
    ["rating 0", { rating: 0 }],
    ["rating 6", { rating: 6 }],
    ["rating as string", { rating: "5" }],
    ["client createdAt", { createdAt: Timestamp.fromMillis(Date.now() - 60_000) }],
    ["extra key", { email: "a@example.com" }],
  ])("denies a review with %s", async (_label, patch) => {
    const data: Record<string, unknown> = { ...validReview(), ...patch };
    for (const key of Object.keys(data)) if (data[key] === undefined) delete data[key];
    await assertFails(addDoc(collection(asAnon(env), "reviews"), data));
  });
});

describe("reviews: read", () => {
  it("allows the public to query approved reviews only", async () => {
    const db = asAnon(env);
    await assertSucceeds(
      getDocs(query(collection(db, "reviews"), where("approved", "==", true), limit(50)))
    );
    await assertSucceeds(getDoc(doc(db, "reviews/public")));
  });

  it("denies unfiltered lists and unapproved docs to the public", async () => {
    const db = asAnon(env);
    await assertFails(getDocs(collection(db, "reviews")));
    await assertFails(getDocs(query(collection(db, "reviews"), where("approved", "==", false))));
    await assertFails(getDoc(doc(db, "reviews/pending")));
    await assertFails(getDoc(doc(asUser(env), "reviews/pending")));
  });

  it("allows admins to read everything", async () => {
    await assertSucceeds(getDocs(collection(asEmailAdmin(env), "reviews")));
    await assertSucceeds(getDoc(doc(asDocAdmin(env), "reviews/pending")));
  });
});

describe("reviews: moderation", () => {
  it("lets admins approve and hide a review", async () => {
    await assertSucceeds(updateDoc(doc(asEmailAdmin(env), "reviews/pending"), { approved: true }));
    await assertSucceeds(updateDoc(doc(asDocAdmin(env), "reviews/public"), { approved: false }));
  });

  it("denies admins editing the review text or a non-boolean approved", async () => {
    const db = asEmailAdmin(env);
    await assertFails(updateDoc(doc(db, "reviews/pending"), { text: "Geändert" }));
    await assertFails(updateDoc(doc(db, "reviews/pending"), { approved: "yes" }));
  });

  it("denies approval by visitors and non-admins", async () => {
    await assertFails(updateDoc(doc(asAnon(env), "reviews/pending"), { approved: true }));
    await assertFails(updateDoc(doc(asUser(env), "reviews/pending"), { approved: true }));
  });

  it("allows only admins to delete", async () => {
    await assertFails(deleteDoc(doc(asAnon(env), "reviews/public")));
    await assertFails(deleteDoc(doc(asUser(env), "reviews/public")));
    await assertSucceeds(deleteDoc(doc(asEmailAdmin(env), "reviews/public")));
  });
});
