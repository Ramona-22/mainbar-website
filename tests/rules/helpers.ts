import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";

// Only ever talk to the local emulator with a demo- project (offline).
export const PROJECT_ID = "demo-mainbar";
export const ADMIN_EMAIL = "mainbarsw@gmail.com";

export async function setupRulesEnv(): Promise<RulesTestEnvironment> {
  const hostPort = process.env.FIRESTORE_EMULATOR_HOST;
  if (!hostPort) {
    throw new Error("FIRESTORE_EMULATOR_HOST is not set. Run these tests with: npm run test:rules");
  }
  const [host, port] = hostPort.split(":");
  return initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: {
      host,
      port: Number(port),
      rules: readFileSync(resolve(__dirname, "../../firestore.rules"), "utf8"),
    },
  });
}

// Signed-in contexts used across the suites.
export const asAnon = (env: RulesTestEnvironment) => env.unauthenticatedContext().firestore();
export const asUser = (env: RulesTestEnvironment) =>
  env.authenticatedContext("user-1", { email: "guest@example.com" }).firestore();
export const asEmailAdmin = (env: RulesTestEnvironment) =>
  env.authenticatedContext("owner-uid", { email: ADMIN_EMAIL }).firestore();
export const asDocAdmin = (env: RulesTestEnvironment) =>
  env.authenticatedContext("helper-uid", { email: "helper@example.com" }).firestore();

// Puts helper-uid on the admins/{uid} allow-list (bypassing the rules).
export async function seedDocAdmin(env: RulesTestEnvironment) {
  await env.withSecurityRulesDisabled(async (ctx) => {
    await ctx.firestore().doc("admins/helper-uid").set({ note: "test" });
  });
}
