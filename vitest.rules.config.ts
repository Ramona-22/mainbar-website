import { defineConfig } from "vitest/config";

// Firestore security rules tests. Run through the emulator:
//   npm run test:rules
export default defineConfig({
  test: {
    include: ["tests/rules/**/*.test.ts"],
    // All files share one emulator project, so run them one after another.
    fileParallelism: false,
    testTimeout: 20_000,
    hookTimeout: 30_000,
  },
});
