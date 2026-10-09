import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { legalDisplayText } from "../src/domain/markdown-presentation";

test("legal contact labels render without raw inline Markdown markers", () => {
  assert.equal(
    legalDisplayText("**Operator:** DuoTap LLC"),
    "Operator: DuoTap LLC",
  );
  assert.equal(
    legalDisplayText("**Support email:** admin@onlysignature.app"),
    "Support email: admin@onlysignature.app",
  );
  assert.equal(
    legalDisplayText("**Website:** https://onlysignature.app/"),
    "Website: https://onlysignature.app/",
  );
});

test("legal presentation preserves wording, punctuation, and URL content", () => {
  const source =
    "Deleting a set, choosing **Delete All Saved Signatures**, or deleting the app. `Stored locally.`";
  assert.equal(
    legalDisplayText(source),
    "Deleting a set, choosing Delete All Saved Signatures, or deleting the app. Stored locally.",
  );
  assert.equal(
    legalDisplayText("https://onlysignature.app/"),
    "https://onlysignature.app/",
  );
});

test("all native legal block types use the same presentation-only formatting", async () => {
  const source = await readFile(
    new URL("../src/components/MarkdownDocument.tsx", import.meta.url),
    "utf8",
  );
  assert.match(source, /legalDisplayText\(heading\[2\]/);
  assert.match(source, /legalDisplayText\(line\.replace/);
  assert.match(source, /legalDisplayText\(line\)/);
});

test("the consolidated UI gate includes the ten-viewport route matrix", async () => {
  const [audit, gate, manifestText] = await Promise.all([
    readFile(
      new URL("../../../scripts/audit-visual-protocol.mjs", import.meta.url),
      "utf8",
    ),
    readFile(
      new URL("../../../scripts/verify-ui.mjs", import.meta.url),
      "utf8",
    ),
    readFile(
      new URL(
        "../../../artifacts/actual-flow-preview/manifest.json",
        import.meta.url,
      ),
      "utf8",
    ),
  ]);
  const manifest = JSON.parse(manifestText) as {
    screenshots: { id: string }[];
  };
  assert.equal(
    manifest.screenshots.filter((screen) => screen.id !== "01-splash").length,
    14,
  );
  for (const [width, height] of [
    [375, 667],
    [390, 844],
    [430, 932],
    [768, 1024],
    [1024, 1366],
  ])
    assert.match(audit, new RegExp(`width: ${width}, height: ${height}`));
  assert.match(audit, /portraitViewports\.flatMap/);
  assert.match(audit, /width: viewport\.height, height: viewport\.width/);
  assert.match(audit, /checkReachableContent\(page\)/);
  assert.match(audit, /report\.expected\.screens/);
  assert.match(audit, /Preview bundle changed during the audit/);
  assert.match(gate, /audit-visual-protocol\.mjs --all-sizes/);
});

test("review captures reject unpainted navigation and retain complete proportional state sheets", async () => {
  const [capture, states, gate] = await Promise.all([
    readFile(
      new URL(
        "../../../scripts/capture-local-flow-preview.mjs",
        import.meta.url,
      ),
      "utf8",
    ),
    readFile(
      new URL(
        "../../../scripts/compose-visual-audit-states.mjs",
        import.meta.url,
      ),
      "utf8",
    ),
    readFile(
      new URL("../../../scripts/verify-ui.mjs", import.meta.url),
      "utf8",
    ),
  ]);
  assert.match(capture, /capturePaintedPage\(page, outputPath\)/);
  assert.match(capture, /darkSurface >= 250 && lightIcon >= 20/);
  assert.match(capture, /attempt < 2/);
  assert.match(capture, /Back did not paint/);
  assert.match(states, /assert\(\s*report\.complete/);
  assert.match(states, /fit: "contain"/);
  assert.match(gate, /compose-visual-audit-states\.mjs/);
});
