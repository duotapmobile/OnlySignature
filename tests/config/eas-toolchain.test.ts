import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("EAS production toolchain", () => {
  it("uses the repository's engine-strict Node version", () => {
    const packageJson = JSON.parse(readFileSync("package.json", "utf8"));
    const easJson = JSON.parse(readFileSync("apps/mobile/eas.json", "utf8"));

    expect(easJson.build.production.node).toBe(packageJson.engines.node);
  });

  it("embeds and inspects the exact synchronized source revision", () => {
    const appConfig = readFileSync("apps/mobile/app.config.ts", "utf8");
    const workflow = readFileSync(
      "apps/mobile/.eas/workflows/internal-testflight.yml",
      "utf8",
    );

    expect(appConfig).toContain(
      "Production requires an exact 40-character Git source revision.",
    );
    expect(workflow).toContain("source_revision:");
    expect(workflow).toContain(
      "ONLY_SIGNATURE_SOURCE_REVISION: ${{ inputs.source_revision }}",
    );
    expect(workflow).toContain(
      "ARCHIVE_SOURCE_REVISION: ${{ inputs.source_revision }}",
    );
    expect(workflow).toContain('--source-revision "$ARCHIVE_SOURCE_REVISION"');
  });
});
