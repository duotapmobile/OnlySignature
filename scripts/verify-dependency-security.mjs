import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { verifyBackports, repositoryRoot } from "./security-backports.mjs";
import { classifyAudit } from "./security/dependency-audit-policy.mjs";

try {
  if (process.versions.node !== "22.22.0" || process.argv.length !== 2) {
    throw new Error(
      "Dependency verification requires pinned Node 22.22.0 and no bypass arguments",
    );
  }
  verifyBackports();
  const tests = spawnSync(
    process.execPath,
    [
      resolve(repositoryRoot, "node_modules/vitest/vitest.mjs"),
      "run",
      "tests/security",
    ],
    {
      cwd: repositoryRoot,
      stdio: "inherit",
      timeout: 120_000,
    },
  );
  if (tests.error || tests.status !== 0)
    throw new Error("Dependency security regressions failed");
  // Verify again after execution, and obtain a fresh registry audit every run.
  const plan = verifyBackports();
  const npm =
    process.env.npm_execpath ||
    resolve(dirname(process.execPath), "node_modules/npm/bin/npm-cli.js");
  const audit = spawnSync(process.execPath, [npm, "audit", "--json"], {
    cwd: repositoryRoot,
    encoding: "utf8",
    maxBuffer: 16 * 1024 * 1024,
    timeout: 120_000,
  });
  if (audit.error || ![0, 1].includes(audit.status))
    throw new Error("Fresh dependency audit could not complete");
  const result = classifyAudit(JSON.parse(audit.stdout), plan);
  console.log(JSON.stringify(result, null, 2));
  if (result.blocking.length)
    throw new Error(
      "Unremediated high/critical dependency findings block release",
    );
  console.log(
    "Dependency security gate passed: exact reviewed backports verified; no other high/critical findings accepted.",
  );
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
