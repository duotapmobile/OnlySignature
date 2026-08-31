import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path: string) => readFile(new URL(path, import.meta.url), "utf8");

test("audited flow keeps one shared spacing and control system", async () => {
  const source = await read("../src/components/flow-ui.tsx");
  assert.match(source, /paddingHorizontal: 26/);
  assert.match(source, /minHeight: 56/);
  assert.match(source, /minHeight: 44/);
  assert.match(source, /borderRadius: 14/);
  assert.match(source, /borderTopLeftRadius: 26/);
  assert.match(source, /accessibilityViewIsModal/);
  assert.match(source, /minHeight: 96/);
  assert.doesNotMatch(source, /height: 96/);
  assert.doesNotMatch(source, /9:41|dynamic island|homebar/i);
});

test("audited routes preserve the complete white and transparent branches", async () => {
  const [entry, draw, review, background, warning, success, saved, exportFlow] =
    await Promise.all([
      read("../src/app/index.tsx"),
      read("../src/app/draw.tsx"),
      read("../src/app/preview.tsx"),
      read("../src/app/purchase.tsx"),
      read("../src/app/free-export.tsx"),
      read("../src/app/success.tsx"),
      read("../src/app/saved.tsx"),
      read("../src/components/ExportFlow.tsx"),
    ]);

  assert.match(entry, /Create My Signing Set/);
  assert.match(draw, /Save Signature/);
  assert.match(draw, /Save Initials/);
  assert.match(draw, /Skip for Now/);
  assert.match(review, /Confirm Your Signing Set/);
  assert.match(review, /Confirm and Choose Background/);
  assert.match(background, /Choose Your Background/);
  assert.match(background, /Continue With White Background/);
  assert.match(background, /purchaseActiveSet/);
  assert.match(
    warning,
    /Removing the background later can damage your signature\./,
  );
  assert.match(warning, /white-export/);
  assert.match(exportFlow, /pathname: "\/success"/);
  assert.match(success, /White Background Set Saved/);
  assert.match(success, /Transparent Set Unlocked/);
  assert.match(saved, /My Signing Sets/);
  assert.match(saved, /Create New Signing Set/);
});

test("native splash uses the approved wordmark without simulated phone chrome", async () => {
  const [config, layout] = await Promise.all([
    read("../app.config.ts"),
    read("../src/app/_layout.tsx"),
  ]);
  assert.match(config, /assets\/brand\/only-signature-wordmark\.png/);
  assert.match(config, /backgroundColor: "#020B12"/);
  assert.match(layout, /<StatusBar style="light"/);
  assert.doesNotMatch(layout, /<StatusBar hidden/);
  assert.doesNotMatch(layout, /9:41|island|homebar/i);
});

test("the exact flow uses supplied script art and professional fictional handwriting", async () => {
  const [flowUi, sample, fixture] = await Promise.all([
    read("../src/components/flow-ui.tsx"),
    read("../src/components/SampleDrawing.tsx"),
    read("../src/domain/fixtures.ts"),
  ]);
  assert.match(flowUi, /only-signature-wordmark\.png/);
  assert.doesNotMatch(flowUi, /fontFamily|SF Pro|9:41/i);
  assert.match(sample, /taylor-brooks-signature\.png/);
  assert.match(sample, /taylor-brooks-initials\.png/);
  assert.match(fixture, /label: "Taylor Brooks"/);
});

test("reachable export and information surfaces keep the audited visual system", async () => {
  const [exportFlow, settings, infoPage] = await Promise.all([
    read("../src/components/ExportFlow.tsx"),
    read("../src/app/settings.tsx"),
    read("../src/components/InfoPage.tsx"),
  ]);

  assert.match(exportFlow, /FlowScreen/);
  assert.match(exportFlow, /FlowPrimaryButton/);
  assert.match(exportFlow, /FlowTextButton/);
  assert.doesNotMatch(exportFlow, /from "\.\/ui"/);
  assert.match(
    exportFlow,
    /router\.push\(\{[\s\S]*?pathname: "\/draw",[\s\S]*?returnTo: "export"/,
  );
  assert.match(
    exportFlow,
    /label="Done"[\s\S]*?recordExport\(\);[\s\S]*?router\.replace\("\/saved"\)/,
  );

  assert.match(settings, /FlowScreen/);
  assert.match(settings, /borderRadius: 16/);
  assert.doesNotMatch(settings, /components\/ui/);
  assert.match(infoPage, /FlowScreen/);
  assert.match(infoPage, /borderRadius: 16/);
  assert.doesNotMatch(infoPage, /from "\.\/ui"/);
});

test("shared native controls expose correct radio state and preview labels", async () => {
  const [formats, preview] = await Promise.all([
    read("../src/components/FormatDropdown.tsx"),
    read("../src/components/DrawingPreview.tsx"),
  ]);
  assert.match(formats, /accessibilityState={{ checked:/);
  assert.doesNotMatch(formats, /accessibilityState={{ selected:/);
  assert.match(preview, /accessibilityLabel\?: string/);
  assert.match(preview, /accessibilityLabel \?\?/);
});

test("included purchased slots finalize once and return to their source route", async () => {
  const draw = await read("../src/app/draw.tsx");
  assert.match(draw, /type ReturnTarget = "review" \| "saved" \| "export"/);
  assert.match(draw, /activeSet\.unclaimedSlot === kind/);
  assert.match(draw, /await fillIncludedSlot\(kind, drawableAsset\)/);
  assert.match(draw, /if \(returnTo \|\| includedSlot\) \{\s*router\.back\(\)/);
  assert.doesNotMatch(draw, /router\.replace\("\/(preview|saved|export)"\)/);
});

test("finish-pending purchases cannot announce success or export", async () => {
  const [background, paidExport, saved] = await Promise.all([
    read("../src/app/purchase.tsx"),
    read("../src/app/export.tsx"),
    read("../src/app/saved.tsx"),
  ]);
  const purchaseHandler = background.slice(
    background.indexOf("const purchase ="),
    background.indexOf("const continueFlow ="),
  );
  assert.doesNotMatch(purchaseHandler, /pathname: "\/success"/);
  assert.match(background, /!activeSet\.transactionFinishPending/);
  assert.match(paidExport, /activeSet\.transactionFinishPending/);
  assert.match(
    saved,
    /Boolean\(item\.pendingPurchaseId\) \|\| item\.transactionFinishPending/,
  );
  assert.match(saved, /&& !purchaseLocked/);
});

test("returning-user hydration and terminal navigation fail closed", async () => {
  const [entry, success] = await Promise.all([
    read("../src/app/index.tsx"),
    read("../src/app/success.tsx"),
  ]);
  assert.match(entry, /if \(!data\.hydrated\) return/);
  assert.match(entry, /disabled=\{!data\.hydrated\}/);
  assert.match(success, /router\.dismissAll\(\)/);
  assert.match(success, /router\.replace\("\/saved"\)/);
});

test("sheet content scrolls and saved card actions remain individually accessible", async () => {
  const [review, background, success, saved] = await Promise.all([
    read("../src/app/preview.tsx"),
    read("../src/app/purchase.tsx"),
    read("../src/app/success.tsx"),
    read("../src/app/saved.tsx"),
  ]);
  for (const source of [review, background, success])
    assert.doesNotMatch(source, /scroll=\{false\}/);
  assert.match(saved, /<View style=\{styles\.card\}>/);
  assert.doesNotMatch(
    saved,
    /<View\s+accessible\s+accessibilityLabel=\{`\$\{title\}[\s\S]*?style=\{styles\.card\}/,
  );
  assert.match(saved, /style=\{styles\.cardActions\}/);
});

test("capture geometry and controls use deterministic audited primitives", async () => {
  const draw = await read("../src/app/draw.tsx");
  assert.match(draw, /windowHeight \* 0\.255/);
  assert.match(draw, /Math\.min\(260, Math\.max\(190/);
  assert.match(draw, /function RotateIcon\(\)/);
  assert.doesNotMatch(draw, /↻/);
  assert.match(draw, /back: \{ position: "absolute"/);
});
