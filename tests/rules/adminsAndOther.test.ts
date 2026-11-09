import { afterAll, beforeAll, beforeEach, describe, it } from "vitest";
import { assertFails, assertSucceeds, type RulesTestEnvironment } from "@firebase/rules-unit-testing";
import { collection, deleteDoc, doc, getDoc, getDocs, setDoc } from "firebase/firestore";
import { asAnon, asDocAdmin, asEmailAdmin, asUser, seedDocAdmin, setupRulesEnv } from "./helpers";

let env: RulesTestEnvironment;

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
    await ctx.firestore().doc("secrets/s1").set({ value: 1 });
  });
});

describe("admins", () => {
  it("denies writes for everyone (managed only in the console)", async () => {
    await assertFails(setDoc(doc(asUser(env), "admins/user-1"), { self: true }));
    await assertFails(setDoc(doc(asEmailAdmin(env), "admins/someone"), { added: true }));
    await assertFails(setDoc(doc(asDocAdmin(env), "admins/helper-uid"), { changed: true }));
    await assertFails(deleteDoc(doc(asDocAdmin(env), "admins/helper-uid")));
  });

  it("lets a user read only their own admins doc", async () => {
    await assertSucceeds(getDoc(doc(asDocAdmin(env), "admins/helper-uid")));
    await assertFails(getDoc(doc(asUser(env), "admins/helper-uid")));
    await assertFails(getDoc(doc(asAnon(env), "admins/helper-uid")));
    await assertFails(getDocs(collection(asEmailAdmin(env), "admins")));
  });
});

describe("unknown collections", () => {
  it("are closed for reads and writes, even for admins", async () => {
    for (const db of [asAnon(env), asUser(env), asEmailAdmin(env), asDocAdmin(env)]) {
      await assertFails(getDoc(doc(db, "secrets/s1")));
      await assertFails(getDocs(collection(db, "secrets")));
      await assertFails(setDoc(doc(db, "secrets/s2"), { value: 2 }));
      await assertFails(setDoc(doc(db, "bookings/b1/notes/n1"), { text: "x" }));
    }
  });
});
