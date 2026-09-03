import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { describe, expect, it } from "vitest";

describe("production network scanner", () => {
  it("scans checked-in native ios modules", () => {
    const root = mkdtempSync(path.join(tmpdir(), "only-signature-network-"));
    try {
      const native = path.join(root, "modules", "example", "ios");
      mkdirSync(native, { recursive: true });
      writeFileSync(
        path.join(native, "Network.swift"),
        "let session = URLSession.shared\n",
      );
      const result = spawnSync(
        process.execPath,
        ["scripts/check-production-network.mjs", "--root", root],
        { cwd: process.cwd(), encoding: "utf8" },
      );
      expect(result.status).toBe(1);
      expect(result.stderr).toContain("URLSession");
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  }, 30_000);

  it("allows only the declared GitHub Pages privacy statement", () => {
    const root = mkdtempSync(path.join(tmpdir(), "only-signature-network-"));
    try {
      writeFileSync(
        path.join(root, "Privacy.ts"),
        'export const privacy = "https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement";\n',
      );
      const allowed = spawnSync(
        process.execPath,
        ["scripts/check-production-network.mjs", "--root", root],
        { cwd: process.cwd(), encoding: "utf8" },
      );
      expect(allowed.status).toBe(0);

      writeFileSync(
        path.join(root, "Privacy.ts"),
        'export const undeclared = "https://docs.github.com/en/another-page";\n',
      );
      const blocked = spawnSync(
        process.execPath,
        ["scripts/check-production-network.mjs", "--root", root],
        { cwd: process.cwd(), encoding: "utf8" },
      );
      expect(blocked.status).toBe(1);
      expect(blocked.stderr).toContain(
        "undeclared URL https://docs.github.com/en/another-page",
      );
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  }, 30_000);
});
