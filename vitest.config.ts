import { defineConfig } from "vitest/config";

// Unit tests only (npm test). Firestore rules tests live in tests/rules and
// need the emulator: see vitest.rules.config.ts / npm run test:rules.
// Playwright specs in tests/e2e run with npm run test:e2e.
export default defineConfig({
  test: {
    include: ["lib/**/*.test.ts", "app/**/*.test.ts"],
    exclude: ["node_modules/**", ".next/**", "tests/**"],
  },
});
