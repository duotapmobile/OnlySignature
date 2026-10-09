import { spawnSync } from "node:child_process";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const base = process.env.ONLY_SIGNATURE_PREVIEW_URL ?? "http://127.0.0.1:4176";
try {
  const response = await fetch(new URL("/studio/review.html", base), {
    signal: AbortSignal.timeout(5000),
  });
  if (!response.ok) throw new Error(`Preview returned HTTP ${response.status}`);
} catch {
  process.stderr.write(
    `Local preview unavailable at ${base}. Start npm run review:screens after exporting the current local bundle. No build or upload was started.\n`,
  );
  process.exit(1);
}

// UI evidence is a separate gate from TypeScript/unit/security checks. This
// runner neither starts a binary build nor changes founder review statuses.
for (const script of [
  "verify-flow-geometry.mjs",
  "verify-responsive-layouts.mjs",
  "verify-visual-cohesion.mjs",
  "verify-async-feedback.mjs",
  "verify-startup-feedback.mjs",
  "verify-purchase-recovery.mjs",
  "verify-payment-ui.mjs",
  "audit-visual-protocol.mjs",
  "audit-visual-protocol.mjs --all-sizes",
  "compose-visual-audit-states.mjs",
  "verify-review-workspace.mjs",
  "capture-local-flow-preview.mjs",
  "compose-founder-comparison.mjs",
]) {
  process.stdout.write(`UI gate: ${script}\n`);
  const result = spawnSync(
    process.execPath,
    [
      path.join(root, "scripts", script.split(" ")[0]),
      ...script.split(" ").slice(1),
    ],
    {
      cwd: root,
      env: { ...process.env, ONLY_SIGNATURE_PREVIEW_URL: base },
      stdio: "inherit",
    },
  );
  if (result.error) {
    process.stderr.write(`${result.error.message}\n`);
    process.exit(1);
  }
  if (result.status !== 0) process.exit(result.status ?? 1);
}
process.stdout.write(
  "Local browser UI gates passed and current captures were regenerated. Inspect the contact sheet; native/device and release gates remain separate.\n",
);
