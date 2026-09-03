import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path: string) => readFile(new URL(path, import.meta.url), "utf8");

test("audited flow keeps one shared spacing and control system", async () => {
  const source = await read("../src/components/flow-ui.tsx");
  assert.match(source, /paddingHorizontal: 26/);
  assert.match(source, /minHeight: 59/);
  assert.match(source, /minHeight: 44/);
  assert.match(source, /borderRadius: 14/);
  assert.match(source, /borderTopLeftRadius: 26/);
  assert.match(source, /accessibilityViewIsModal/);
  assert.match(source, /minHeight: 96/);
  assert.doesNotMatch(source, /height: 96/);
  assert.doesNotMatch(source, /9:41|dynamic island|homebar/i);
});

test("audited routes preserve the complete white and transparent branches", async () => {
  const [
    entry,
    draw,
    review,
    background,
    clear,
    warning,
    success,
    saved,
    exportFlow,
  ] = await Promise.all([
    read("../src/app/index.tsx"),
    read("../src/app/draw.tsx"),
    read("../src/app/preview.tsx"),
    read("../src/app/purchase.tsx"),
    read("../src/app/clear-background.tsx"),
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
  assert.match(background, /clear-background/);
  assert.match(background, /useTransparentPurchase/);
  assert.match(clear, /Clear Background/);
  assert.match(clear, /Looks natural on any document\./);
  assert.match(clear, /router\.push\("\/free-export"\)/);
  assert.match(clear, /purchase\.beginPurchase/);
  assert.match(clear, /clear\.bad\.white-box/);
  assert.match(clear, /obstructedDate/);
  assert.match(
    warning,
    /Removing the background later can damage your signature\./,
  );
  assert.match(warning, /purchase\.beginPurchase/);
  assert.match(warning, /white-export/);
  assert.match(exportFlow, /pathname: "\/success"/);
  assert.match(success, /White Background Set Saved/);
  assert.match(success, /Transparent Set Unlocked/);
  assert.match(saved, /My Signing Sets/);
  assert.match(saved, /Create New Signing Set/);
});

test("native splash uses the raised full-screen brand composition without simulated phone chrome", async () => {
  const [config, layout] = await Promise.all([
    read("../app.config.ts"),
    read("../src/app/_layout.tsx"),
  ]);
  assert.match(config, /assets\/brand\/only-signature-splash\.png/);
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
  assert.match(fixture, /label: "Alex Morgan"/);
  assert.match(fixture, /fixture !== "saved-home"/);
  assert.match(fixture, /label: "Taylor Brooks"/);
});
test("reference rendering contract contains the complete eleven-screen flow", async () => {
  const manifest = JSON.parse(
    await read("../../../artifacts/actual-flow-preview/manifest.json"),
  ) as { screenshots: { id: string }[] };
  assert.deepEqual(
    manifest.screenshots.map(({ id }) => id),
    [
      "01-splash",
      "02-entry",
      "03-signature-capture",
      "04-initials-capture",
      "05-review-popup",
      "06-background-popup",
      "07-clear-background",
      "08-diy-warning-popup",
      "09-white-confirmation-popup",
      "10-transparent-confirmation-popup",
      "11-saved-sets-home",
    ],
  );
});

test("native capture contract contains ten in-app states matching the approved eleven-screen flow", async () => {
  const [
    nativeManifestSource,
    actualFlowWorkflow,
    marketingWorkflow,
    auditedFullFlow,
  ] = await Promise.all([
    read("../e2e/native-actual-flow-manifest.json"),
    read("../.eas/workflows/native-ios-actual-flow.yml"),
    read("../.eas/workflows/native-ios-screenshots.yml"),
    read("../e2e/audited-full-flow.yml"),
  ]);
  const nativeManifest = JSON.parse(nativeManifestSource) as {
    purpose: string;
    screenshots: {
      id: string;
      route: string;
      headline: string;
      assertions: string[];
    }[];
  };

  assert.match(nativeManifest.purpose, /ten in-app states/);
  assert.match(nativeManifest.purpose, /eleven-screen flow/);
  assert.deepEqual(
    nativeManifest.screenshots.map(({ id }) => id),
    [
      "02-entry",
      "03-signature-capture",
      "04-initials-capture",
      "05-review-popup",
      "06-background-popup",
      "07-clear-background",
      "08-diy-warning-popup",
      "09-white-confirmation-popup",
      "10-transparent-confirmation-popup",
      "11-saved-sets-home",
    ],
  );
  assert.deepEqual(nativeManifest.screenshots[5], {
    id: "07-clear-background",
    route: "/clear-background?fixture=both",
    headline: "Clear Background",
    assertions: [
      "Clear Background",
      "Looks natural on any document.",
      "White box",
      "No Thanks",
    ],
  });
  assert.match(actualFlowWorkflow, /Capture the ten real in-app screens/);
  assert.match(actualFlowWorkflow, /Capture ten asserted iPhone screens/);
  assert.match(actualFlowWorkflow, /Capture ten asserted iPad screens/);
  assert.doesNotMatch(actualFlowWorkflow, /Capture eight/);
  assert.match(marketingWorkflow, /Capture eight asserted iPhone frames/);
  assert.match(marketingWorkflow, /Capture eight asserted iPad frames/);
  assert.match(
    auditedFullFlow,
    /tapOn: "Confirm and Choose Background"[\s\S]*tapOn: "Continue With White Background"[\s\S]*assertVisible: "Clear Background"[\s\S]*tapOn: "No Thanks"[\s\S]*assertVisible: "Removing the background later can damage your signature\."[\s\S]*tapOn: "No Thanks, Download Free White Set"[\s\S]*assertVisible: "White Background Export"/,
  );
  assert.doesNotMatch(auditedFullFlow, /tapOn: "Continue to Background"/);
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
  const [purchaseHook, paidExport, saved] = await Promise.all([
    read("../src/hooks/use-transparent-purchase.ts"),
    read("../src/app/export.tsx"),
    read("../src/app/saved.tsx"),
  ]);
  const purchaseHandler = purchaseHook.slice(
    purchaseHook.indexOf("const beginPurchase ="),
    purchaseHook.indexOf("return {"),
  );
  assert.doesNotMatch(purchaseHandler, /pathname: "\/success"/);
  assert.match(purchaseHook, /!activeSet\.transactionFinishPending/);
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
  assert.match(
    saved,
    /<LayoutSlot id=\{`\$\{layerPrefix\}\.group`\} style=\{styles\.card\}>/,
  );
  assert.doesNotMatch(
    saved,
    /<View\s+accessible\s+accessibilityLabel=\{`\$\{title\}[\s\S]*?style=\{styles\.card\}/,
  );
  assert.match(saved, /style=\{styles\.cardActions\}/);
});

test("capture geometry and controls use deterministic audited primitives", async () => {
  const draw = await read("../src/app/draw.tsx");
  assert.match(draw, /windowHeight \* 0\.4/);
  assert.match(draw, /Math\.min\(440, Math\.max\(360/);
  assert.match(draw, /function RotateIcon\(\)/);
  assert.doesNotMatch(draw, /↻/);
  assert.match(draw, /back: \{ position: "absolute"/);
});

test("layout studio slots are backed by persisted device profiles", async () => {
  const [
    slot,
    values,
    entry,
    draw,
    review,
    purchase,
    clear,
    freeExport,
    success,
    saved,
  ] = await Promise.all([
    read("../src/components/layout-slot.tsx"),
    read("../src/design/layout-studio-values.ts"),
    read("../src/app/index.tsx"),
    read("../src/app/draw.tsx"),
    read("../src/app/preview.tsx"),
    read("../src/app/purchase.tsx"),
    read("../src/app/clear-background.tsx"),
    read("../src/app/free-export.tsx"),
    read("../src/app/success.tsx"),
    read("../src/app/saved.tsx"),
  ]);

  assert.match(slot, /useWindowDimensions\(\)/);
  assert.match(slot, /width >= 768 \? "ipad" : "iphone"/);
  assert.match(slot, /`layout-slot:\$\{id\}`/);
  assert.match(values, /(?:["']iphone["']|iphone):/);
  assert.match(values, /(?:["']ipad["']|ipad):/);
  assert.match(values, /rotate\?: number/);
  assert.match(slot, /rotate: `\$\{clean\.rotate\}deg`/);
  assert.doesNotMatch(values, /["']capture\./);
  assert.doesNotMatch(values, /["']confirmation\./);
  for (const [source, expected] of [
    [entry, /id="entry\.hero"/],
    [draw, /\$\{layerPrefix\}\.canvas/],
    [review, /id="review\.signature"/],
    [purchase, /id="background\.transparent"/],
    [clear, /id="clear\.comparison"/],
    [freeExport, /id="warning\.comparison"/],
    [success, /\$\{layerPrefix\}\.message/],
    [saved, /id="saved\.list"/],
  ])
    assert.match(source, expected);
});

test("native splash is editable and regenerates the configured launch asset", async () => {
  const [server, generator, preview] = await Promise.all([
    read("../../../scripts/layout-studio.mjs"),
    read("../../../scripts/splash-layout.mjs"),
    read("../../../tools/layout-studio/splash-preview.html"),
  ]);
  assert.match(server, /id: "splash"/);
  assert.match(server, /"splash\.wordmark"/);
  assert.match(server, /await renderSplash\(profiles\)/);
  assert.match(generator, /only-signature-splash\.png/);
  assert.match(generator, /profiles\?\.iphone\?\.\["splash\.wordmark"\]/);
  assert.match(preview, /data-testid="layout-slot:splash\.wordmark"/);
});

test("layout studio exposes individual text, icon, artwork, and action layers", async () => {
  const [
    flow,
    entry,
    draw,
    review,
    background,
    clear,
    warning,
    confirmation,
    saved,
    studio,
  ] = await Promise.all([
    read("../src/components/flow-ui.tsx"),
    read("../src/app/index.tsx"),
    read("../src/app/draw.tsx"),
    read("../src/app/preview.tsx"),
    read("../src/app/purchase.tsx"),
    read("../src/app/clear-background.tsx"),
    read("../src/app/free-export.tsx"),
    read("../src/app/success.tsx"),
    read("../src/app/saved.tsx"),
    read("../../../tools/layout-studio/studio.js"),
  ]);

  assert.match(flow, /layoutId\?: string/);
  assert.match(flow, /labelLayoutId\?: string/);
  assert.match(flow, /iconLayoutId\?: string/);
  for (const [sourceName, screen, markers] of [
    [
      "entry",
      entry,
      [
        "entry.sign",
        "entry.title",
        "entry.subscription.icon",
        "entry.privacy.icon",
      ],
    ],
    [
      "capture",
      draw,
      [
        "${layerPrefix}.script",
        "${layerPrefix}.title",
        "${layerPrefix}.rotate.icon",
        "${layerPrefix}.redo.label",
      ],
    ],
    [
      "review",
      review,
      [
        "review.handle",
        "review.signature.label",
        "review.signature.edit",
        "review.signature.art",
      ],
    ],
    [
      "background",
      background,
      [
        "background.handle",
        "${layerPrefix}.swatch",
        "${layerPrefix}.title",
        "${layerPrefix}.radio",
        'layerPrefix="background.transparent"',
      ],
    ],
    [
      "clear",
      clear,
      [
        "clear.title",
        'prefix + ".icon"',
        'prefix + ".signature-line"',
        'prefix + ".signature-art"',
        "clear.primary.label",
      ],
    ],
    [
      "warning",
      warning,
      [
        "warning.original.label",
        "warning.original.art",
        "warning.diy.art",
        "warning.diy.damage-one",
      ],
    ],
    [
      "confirmation",
      confirmation,
      [
        "${layerPrefix}.handle",
        "${layerPrefix}.check.icon",
        "${layerPrefix}.title",
        "${layerPrefix}.primary.label",
      ],
    ],
    [
      "saved",
      saved,
      [
        "saved.title",
        "saved.settings.icon",
        "saved.card-${index + 1}",
        "saved.create.label",
      ],
    ],
  ] as const) {
    for (const marker of markers)
      assert.ok(
        screen.includes(marker),
        `${sourceName} is missing editable layer ${marker}`,
      );
  }
  assert.ok(studio.includes(`closest('[data-testid^="layout-slot:"]')`));
  assert.ok(studio.includes("1px dashed transparent"));
});
