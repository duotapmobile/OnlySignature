import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      provider: "v8",
      reporter: ["text", "json-summary"],
      include: ["packages/**/*.ts", "apps/mobile/src/**/*.ts"],
      exclude: ["**/*.d.ts", "**/*.test.ts", "**/fixtures/**"],
    },
    environment: "node",
    include: [
      "tests/**/*.test.ts",
      "packages/**/*.test.ts",
      "apps/mobile/src/**/*.test.ts",
    ],
  },
});
