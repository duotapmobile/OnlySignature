import assert from "node:assert/strict";
import { mkdir, readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = path.resolve(import.meta.dirname, "..");
const baseUrl =
  process.env.ONLY_SIGNATURE_PREVIEW_URL ?? "http://127.0.0.1:4176";
const playwrightEntry = process.env.ONLY_SIGNATURE_PLAYWRIGHT_ENTRY;
const playwright = playwrightEntry
  ? await import(pathToFileURL(playwrightEntry).href)
  : await import("playwright");
const { chromium } = playwright;
const protectedFeedbackPaths = [
  "review-feedback.json",
  "SCREEN-FEEDBACK.md",
].map((file) => path.join(root, "artifacts", "actual-flow-preview", file));
const fingerprint = (bytes) => createHash("sha256").update(bytes).digest("hex");
const protectedFeedback = await Promise.all(
  protectedFeedbackPaths.map(async (file) => ({
    file,
    bytes: await readFile(file),
  })),
);

const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.ONLY_SIGNATURE_BROWSER_EXECUTABLE,
});
let testFeedback = { version: 1, screens: {} };
async function isolateFeedback(page) {
  await page.route("**/api/review", async (route) => {
    if (route.request().method() === "POST") {
      testFeedback = JSON.parse(route.request().postData());
      testFeedback.updatedAt = new Date().toISOString();
      await route.fulfill({ json: { feedback: testFeedback } });
    } else await route.fulfill({ json: testFeedback });
  });
  await page.route("**/api/review/export", async (route) => {
    await route.fulfill({
      contentType: "text/markdown",
      body: `# Only Signature Screen Feedback\nSubmitted: ${testFeedback.submittedAt}\n${Object.values(
        testFeedback.screens,
      )
        .map(
          (screen) =>
            screen.note +
            Object.values(screen.devices ?? {})
              .flatMap((device) => device.annotations ?? [])
              .map((item) => item.text)
              .join("\n"),
        )
        .join("\n")}`,
    });
  });
}

try {
  // Real persistence endpoints are inspected read-only; all interactive
  // saves below are intercepted and cannot change founder-owned feedback.
  const founderFeedback = JSON.parse(
    protectedFeedback[0].bytes.toString("utf8"),
  );
  const liveFeedback = await fetch(`${baseUrl}/api/review`).then((response) =>
    response.json(),
  );
  for (const [id, screen] of Object.entries(founderFeedback.screens)) {
    assert.equal(
      liveFeedback.screens[id]?.note,
      screen.note,
      `${id} note was discarded`,
    );
    assert.equal(
      liveFeedback.screens[id]?.status,
      screen.status,
      `${id} status was changed`,
    );
  }
  const archived = founderFeedback.screens["10-transparent-confirmation-popup"];
  if (archived?.note) {
    const liveExport = await fetch(`${baseUrl}/api/review/export`).then(
      (response) => response.text(),
    );
    assert(
      liveExport.includes(archived.note.trim()),
      "Removed-screen feedback is missing from consolidated export",
    );
  }
  const page = await browser.newPage({
    viewport: { width: 1512, height: 982 },
  });
  await isolateFeedback(page);
  await page.goto(`${baseUrl}/studio/review.html`, {
    waitUntil: "networkidle",
    timeout: 60_000,
  });

  await page.locator(".screen-card").first().waitFor({ state: "visible" });
  await page.evaluate(async () => {
    await fetch("/api/review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ version: 1, screens: {} }),
    });
  });
  await page.reload({ waitUntil: "networkidle" });
  await page.locator(".screen-card").first().waitFor({ state: "visible" });
  assert.equal(await page.locator(".screen-card").count(), 15);
  assert.equal(await page.locator("#deviceSwitch button").count(), 3);
  await page.locator("#screenImage").waitFor({ state: "visible" });
  assert(!(await page.locator("#markupLayer").isVisible()));
  await page.locator("#markupVisibilityButton").click();
  assert(await page.locator("#markupLayer").isVisible());
  assert(await page.locator("#markupNotice").isVisible());
  await page.locator("#markupVisibilityButton").click();
  assert(!(await page.locator("#markupLayer").isVisible()));
  assert.match(
    await page.locator("#implementationStatus").textContent(),
    /pending/,
  );

  const initialZoom = await page.locator("#zoomLabel").textContent();
  await page.locator("#zoomInButton").click();
  assert.notEqual(await page.locator("#zoomLabel").textContent(), initialZoom);
  await page.locator("#fitButton").click();

  await page.locator('[data-tool="pin"]').click();
  await page.locator("#markupLayer").click({ position: { x: 210, y: 300 } });
  await page
    .locator(".annotation-card textarea")
    .fill("Keep the headline clear of the signature artwork.");
  await page
    .locator("#screenNote")
    .fill("Example review note used to verify the local feedback workflow.");
  await page.locator("#saveButton").click();
  await page.getByText("Screen feedback saved").waitFor({ state: "visible" });
  await page.locator("#refreshCapturesButton").click();
  await page
    .getByText("Latest captured screens loaded. Feedback preserved.")
    .waitFor({ state: "visible" });
  assert.match(
    await page.locator("#screenNote").inputValue(),
    /Example review note/,
  );

  await page.locator("#submitButton").click();
  await page
    .getByText("All feedback submitted to the project")
    .waitFor({ state: "visible" });

  const saved = await page.evaluate(async () =>
    fetch("/api/review").then((response) => response.json()),
  );
  assert.equal(saved.screens["01-splash"].status, "needs-changes");
  assert.match(saved.submittedAt, /^\d{4}-\d{2}-\d{2}T/);
  assert.equal(
    saved.screens["01-splash"].devices["iphone-small"].annotations.length,
    1,
  );

  const markdown = await page.evaluate(async () =>
    fetch("/api/review/export").then((response) => response.text()),
  );
  assert.match(markdown, /# Only Signature Screen Feedback/);
  assert.match(markdown, /Submitted: \d{4}-\d{2}-\d{2}T/);
  assert.match(markdown, /Keep the headline clear/);

  const outputDirectory = path.join(root, "artifacts", "actual-flow-preview");
  await mkdir(outputDirectory, { recursive: true });
  await page.screenshot({
    path: path.join(outputDirectory, "screen-review-workspace.png"),
    fullPage: true,
  });

  const narrowPage = await browser.newPage({
    viewport: { width: 660, height: 586 },
  });
  await isolateFeedback(narrowPage);
  await narrowPage.goto(`${baseUrl}/studio/review.html`, {
    waitUntil: "networkidle",
    timeout: 60_000,
  });
  await narrowPage.locator("#screenImage").waitFor({ state: "visible" });
  assert.equal(await narrowPage.locator("#zoomLabel").textContent(), "120%");
  assert(
    await narrowPage.evaluate(() =>
      document.body.classList.contains("focus-mode"),
    ),
  );
  const narrowLayout = await narrowPage.evaluate(() => {
    const viewport = document
      .querySelector("#imageViewport")
      .getBoundingClientRect();
    const panel = document
      .querySelector(".feedback-panel")
      .getBoundingClientRect();
    return { viewportWidth: viewport.width, panelLeft: panel.left };
  });
  assert(narrowLayout.viewportWidth > 580);
  assert(narrowLayout.panelLeft >= 650);
  await narrowPage.locator("#feedbackToggleButton").click();
  await narrowPage.waitForTimeout(220);
  assert(
    await narrowPage.evaluate(
      () =>
        document.querySelector(".feedback-panel").getBoundingClientRect().left <
        660,
    ),
  );
  await narrowPage.locator("#closeFeedbackButton").click();
  await narrowPage.waitForTimeout(240);
  assert(
    await narrowPage.evaluate(
      () =>
        document.querySelector(".feedback-panel").getBoundingClientRect()
          .left >= 658,
    ),
  );
  await narrowPage.screenshot({
    path: path.join(outputDirectory, "screen-review-workspace-narrow.png"),
    fullPage: true,
  });
  await narrowPage.close();

  process.stdout.write(
    "Screen Review UI verified with isolated feedback: 15 screens, 3 devices, zoom, markup, autosave, consolidated export, and narrow focus layout. User feedback was not modified.\n",
  );
} finally {
  for (const { file, bytes } of protectedFeedback)
    assert.equal(
      fingerprint(await readFile(file)),
      fingerprint(bytes),
      "User feedback was modified by validation",
    );
  await browser.close();
}
