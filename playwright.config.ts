import { defineConfig, devices } from "@playwright/test";

/*
  Browser tests for the whole site (npm run test:e2e).
  They run against a local production build that talks to the Firebase emulators
  (project demo-mainbar), never to the live database. The booking API is mocked in
  the tests and the mail settings below are invalid, so no real email is ever sent.
*/
const PORT = 3125;

export default defineConfig({
  testDir: "tests/e2e",
  // One shared emulator database, so tests run one after another.
  workers: 1,
  fullyParallel: false,
  timeout: 45_000,
  expect: { timeout: 10_000 },
  reporter: [["list"]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    locale: "de-DE",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "phone", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    command: `npm run build && npx next start -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    timeout: 240_000,
    reuseExistingServer: false,
    env: {
      NEXT_PUBLIC_USE_FIREBASE_EMULATORS: "1",
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: "demo-mainbar",
      NEXT_PUBLIC_FIREBASE_API_KEY: "demo-key",
      NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: "demo-mainbar.firebaseapp.com",
      NEXT_PUBLIC_FIREBASE_APP_ID: "demo-app",
      // Safety net: never send real mail from tests.
      GMAIL_USER: "e2e-no-mail@example.invalid",
      GMAIL_APP_PASSWORD: "invalid",
      // The server must not store bookings itself, like production without a key.
      FIRESTORE_EMULATOR_HOST: "",
    },
  },
});
