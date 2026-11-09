import { afterAll, beforeAll, beforeEach, describe, it } from "vitest";
import { assertFails, assertSucceeds, type RulesTestEnvironment } from "@firebase/rules-unit-testing";
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, updateDoc } from "firebase/firestore";
import { asAnon, asDocAdmin, asEmailAdmin, asUser, seedDocAdmin, setupRulesEnv } from "./helpers";

let env: RulesTestEnvironment;
const item = { category: "FRÜHSTÜCK", name: "Rührei", price: "8,50", description: "", isExtra: false };

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
    await ctx.firestore().doc("menu/m1").set(item);
  });
});

describe("menu", () => {
  it("is publicly readable", async () => {
    await assertSucceeds(getDocs(collection(asAnon(env), "menu")));
    await assertSucceeds(getDoc(doc(asAnon(env), "menu/m1")));
  });

  it("denies writes by visitors and signed-in non-admins", async () => {
    for (const db of [asAnon(env), asUser(env)]) {
      await assertFails(addDoc(collection(db, "menu"), item));
      await assertFails(updateDoc(doc(db, "menu/m1"), { price: "0,01" }));
      await assertFails(deleteDoc(doc(db, "menu/m1")));
    }
  });

  it("allows admins (by email and by admins doc) to create, edit and delete", async () => {
    for (const db of [asEmailAdmin(env), asDocAdmin(env)]) {
      const ref = await assertSucceeds(
        addDoc(collection(db, "menu"), { ...item, sizes: [{ label: "Groß", price: "9,50" }] })
      );
      await assertSucceeds(updateDoc(ref, { name: "Rührei Spezial" }));
      await assertSucceeds(deleteDoc(ref));
    }
  });
});
