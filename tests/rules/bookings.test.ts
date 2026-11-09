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
  setDoc,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { asAnon, asDocAdmin, asEmailAdmin, asUser, seedDocAdmin, setupRulesEnv } from "./helpers";

let env: RulesTestEnvironment;

const validBooking = () => ({
  seating: "inside",
  guests: 4,
  date: "2030-05-01",
  state: "Bayern",
  city: "Schweinfurt",
  phone: "+49 170 0000000",
  email: "gast@example.com",
  status: "Neu",
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
    await ctx.firestore().doc("bookings/b1").set({ ...validBooking(), createdAt: Timestamp.now() });
  });
});

describe("bookings: create", () => {
  it("allows a valid booking from an anonymous visitor", async () => {
    await assertSucceeds(addDoc(collection(asAnon(env), "bookings"), validBooking()));
  });

  it("allows every seating option and the guest limits 1 and 30", async () => {
    const db = asAnon(env);
    for (const seating of ["inside", "outside", "catering"]) {
      await assertSucceeds(addDoc(collection(db, "bookings"), { ...validBooking(), seating }));
    }
    await assertSucceeds(addDoc(collection(db, "bookings"), { ...validBooking(), guests: 1 }));
    await assertSucceeds(addDoc(collection(db, "bookings"), { ...validBooking(), guests: 30 }));
  });

  it.each([
    ["unknown seating", { seating: "roof" }],
    ["0 guests", { guests: 0 }],
    ["31 guests", { guests: 31 }],
    ["guests as string", { guests: "4" }],
    ["guests as float", { guests: 2.5 }],
    ["German date format", { date: "01.05.2030" }],
    ["date with time", { date: "2030-05-01T10" }],
    ["empty city", { city: "" }],
    ["state too long", { state: "x".repeat(201) }],
    ["phone too long", { phone: "1".repeat(41) }],
    ["invalid email", { email: "not-an-email" }],
    ["status other than Neu", { status: "Bestätigt" }],
    ["client createdAt", { createdAt: Timestamp.fromMillis(Date.now() - 60_000) }],
    ["extra key", { approved: true }],
  ])("denies a booking with %s", async (_label, patch) => {
    await assertFails(addDoc(collection(asAnon(env), "bookings"), { ...validBooking(), ...patch }));
  });

  it("denies a booking with a missing required field", async () => {
    const data: Record<string, unknown> = validBooking();
    delete data.email;
    await assertFails(addDoc(collection(asAnon(env), "bookings"), data));
  });
});

describe("bookings: read", () => {
  it("denies reads to anonymous visitors (single doc and list)", async () => {
    const db = asAnon(env);
    await assertFails(getDoc(doc(db, "bookings/b1")));
    await assertFails(getDocs(collection(db, "bookings")));
  });

  it("denies reads to a signed-in non-admin", async () => {
    const db = asUser(env);
    await assertFails(getDoc(doc(db, "bookings/b1")));
    await assertFails(getDocs(collection(db, "bookings")));
  });

  it("allows the admin by email", async () => {
    const db = asEmailAdmin(env);
    await assertSucceeds(getDoc(doc(db, "bookings/b1")));
    await assertSucceeds(getDocs(collection(db, "bookings")));
  });

  it("allows an admin listed in admins/{uid}", async () => {
    const db = asDocAdmin(env);
    await assertSucceeds(getDoc(doc(db, "bookings/b1")));
    await assertSucceeds(getDocs(collection(db, "bookings")));
  });

  it("does not treat an unverified look-alike email as admin", async () => {
    const db = env.authenticatedContext("x", { email: "MAINBARSW@gmail.com.evil.test" }).firestore();
    await assertFails(getDocs(collection(db, "bookings")));
  });
});

describe("bookings: update and delete", () => {
  it("lets an admin change only the status", async () => {
    await assertSucceeds(updateDoc(doc(asEmailAdmin(env), "bookings/b1"), { status: "Bestätigt" }));
    await assertSucceeds(updateDoc(doc(asDocAdmin(env), "bookings/b1"), { status: "Storniert" }));
  });

  it("denies an admin changing other fields", async () => {
    const db = asEmailAdmin(env);
    await assertFails(updateDoc(doc(db, "bookings/b1"), { guests: 10 }));
    await assertFails(updateDoc(doc(db, "bookings/b1"), { status: "Bestätigt", email: "x@example.com" }));
  });

  it("denies updates by visitors and non-admins", async () => {
    await assertFails(updateDoc(doc(asAnon(env), "bookings/b1"), { status: "Bestätigt" }));
    await assertFails(updateDoc(doc(asUser(env), "bookings/b1"), { status: "Bestätigt" }));
  });

  it("denies overwriting an existing booking with a fresh valid one", async () => {
    await assertFails(setDoc(doc(asAnon(env), "bookings/b1"), validBooking()));
  });

  it("allows only admins to delete", async () => {
    await assertFails(deleteDoc(doc(asAnon(env), "bookings/b1")));
    await assertFails(deleteDoc(doc(asUser(env), "bookings/b1")));
    await assertSucceeds(deleteDoc(doc(asDocAdmin(env), "bookings/b1")));
  });
});
