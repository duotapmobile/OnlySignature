import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("EAS production toolchain", () => {
  it("uses the repository's engine-strict Node version", () => {
    const packageJson = JSON.parse(readFileSync("package.json", "utf8"));
    const easJson = JSON.parse(readFileSync("apps/mobile/eas.json", "utf8"));

    expect(easJson.build.production.node).toBe(packageJson.engines.node);
  });
});
