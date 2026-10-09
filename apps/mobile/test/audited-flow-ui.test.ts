import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path: string) => readFile(new URL(path, import.meta.url), "utf8");

test("hidden export capture surfaces do not extend the user-facing scroll content", async () => {
  const source = await read("../src/components/ExportFlow.tsx");
  const screenEnd = source.indexOf("</FlowScreen>");
  assert(screenEnd > 0);
  assert(source.indexOf("<ExportSurface") > screenEnd);
  assert.equal((source.match(/<ExportSurface/g) ?? []).length, 2);
  assert.match(
    source,
    /ref=\{signatureRef\}[\s\S]*asset=\{activeSet.signature\}/,
  );
  assert.match(
    source,
    /ref=\{initialsRef\}[\s\S]*asset=\{activeSet.initials\}/,
  );
  assert.match(source, /white=\{signatureFormat !== "png-transparent"\}/);
  assert.match(source, /white=\{initialsFormat !== "png-transparent"\}/);
});

test("matrix corrections preserve readable Home text and light capture semantics", async () => {
  const [home, draw, saved] = await Promise.all([
    read("../src/components/welcome-folded-panel.tsx"),
    read("../src/app/draw.tsx"),
    read("../src/app/saved.tsx"),
  ]);
  assert.match(home, /rearPlate: \{[\s\S]*?right: 3,/);
  assert.match(home, /title: \{[\s\S]*?fontSize: 27,[\s\S]*?lineHeight: 36/);
  assert.match(draw, /chrome="none"\s+tone="light"/);
  assert.match(saved, /<Text accessibilityElementsHidden aria-hidden/);
});

test("opening adapts composition to short landscape without changing animation timing", async () => {
  const source = await read("../src/components/animated-opening.tsx");
  assert.match(source, /landscape = width > height/);
  assert.match(source, /landscapeComposition: \{[\s\S]*?flexDirection: "row"/);
  assert.match(source, /landscape && styles.landscapeCopy/);
  assert.match(source, /landscape && styles.landscapeStage/);
  assert.match(source, /copy: \{ marginTop: 0 \}/);
  assert.match(
    source,
    /composition: \{ flex: 1, justifyContent: "center", gap: 28 \}/,
  );
  assert.doesNotMatch(source, /marginTop: "18%"/);
  assert.match(source, /openingDurationMs = 2_200/);
  assert.match(source, /returningOpeningDurationMs = 650/);
});

test("landscape ink reserves space for navigation and Save instead of sitting under controls", async () => {
  const source = await read("../src/app/draw.tsx");
  assert.match(source, /testID="landscape-drawing-region"/);
  assert.match(source, /testID="landscape-drawing-toolbar"/);
  assert.match(source, /testID="landscape-drawing-save"/);
  assert.match(
    source,
    /landscapeCanvas: \{[\s\S]*?top: 72,[\s\S]*?bottom: 84,/,
  );
});

test("tall-screen density stays content-driven without reducing readable controls", async () => {
  const [opening, home, exports, warning] = await Promise.all([
    read("../src/components/animated-opening.tsx"),
    read("../src/components/welcome-folded-panel.tsx"),
    read("../src/components/ExportFlow.tsx"),
    read("../src/app/free-export.tsx"),
  ]);
  assert.match(opening, /tabletOpening: \{ maxWidth: 620, maxHeight: 860 \}/);
  assert.match(home, /tabletShell: \{ maxHeight: 860 \}/);
  assert.match(
    home,
    /benefits: \{ flexGrow: 0, justifyContent: "flex-start", gap: 12 \}/,
  );
  assert.match(exports, /height < 760 \? 64 : Math\.min\(160, Math\.max\(104,/);
  assert.match(exports, /boxShadow: flowShadows\.card/);
  assert.doesNotMatch(warning, /align="baseline"/);
  assert.match(home, /minHeight: 56/);
  assert.match(home, /savedButton: \{[\s\S]*?minHeight: 44/);
});

test("export destination progress stays inside the modal without shifting its controls", async () => {
  const source = await read("../src/components/ExportFlow.tsx");
  assert.match(source, /destinationHintHeight, setDestinationHintHeight/);
  assert.match(source, /minHeight: destinationHintHeight/);
  assert.match(source, /<InlineStatus message=\{workingMessage\} tone="light"/);
  assert.match(source, /visible=\{showOperation && !saveModalVisible\}/);
  assert.match(source, /event\.nativeEvent\.layout\.height/);
  assert.match(
    source,
    /label="Back"[\s\S]*onPress=\{chooseAnotherDestination\}/,
  );
  assert.match(source, /label="Done"[\s\S]*onPress=\{finish\}/);
});

test("purchase price stays visible while Apple purchase presentation is busy", async () => {
  const source = await read("../src/components/purchase-action.tsx");
  assert.match(source, /\{!unboundPurchase \? \(/);
  assert.doesNotMatch(source, /!busy && !unboundPurchase/);
  assert.match(source, /styles\.priceAmount\}>\{displayPrice\}/);
  assert.match(source, / • One-time purchase/);
});

test("minor founder notes preserve scoped copy, price emphasis and text-only saved rows", async () => {
  const [opening, price, warning, success, saved, provider] = await Promise.all(
    [
      read("../src/components/animated-opening.tsx"),
      read("../src/components/purchase-action.tsx"),
      read("../src/app/free-export.tsx"),
      read("../src/app/success.tsx"),
      read("../src/app/saved.tsx"),
      read("../src/state/AppStateProvider.tsx"),
    ],
  );
  assert.match(opening, /Your signature and initials\.\\nReady to reuse\./);
  assert.match(
    price,
    /priceAmount: \{ fontSize: 21, lineHeight: 27, fontWeight: "800" \}/,
  );
  assert.match(warning, /styles\.damageGapThree/);
  assert.match(warning, /damageGapOne: \{[\s\S]*?width: "7%"/);
  assert.match(success, /device\.\\nYou can return/);
  assert.doesNotMatch(saved, /DrawingPreview|signatureSlot|initialsSlot/);
  assert.match(saved, /savedSetCreationLabel\(item\)/);
  assert.match(saved, /\{title\}/);
  assert.match(
    provider,
    /label: source\.label[\s\S]*?createdAt: new Date\(\)\.toISOString\(\)/,
  );
});

test("background choice controls cannot change selection during purchase presentation", async () => {
  const source = await read("../src/app/purchase.tsx");
  assert.match(
    source,
    /accessibilityState=\{\{ checked: selected, disabled \}\}/,
  );
  assert.match(source, /disabled=\{disabled\}/);
  for (const value of ["transparent", "white"]) {
    assert.match(
      source,
      new RegExp(
        `<BackgroundChoice\\s+value="${value}"[\\s\\S]*?disabled=\\{busy\\}[\\s\\S]*?/>`,
      ),
    );
  }
  assert.equal((source.match(/disabled=\{busy\}/g) ?? []).length, 4);
});

test("short landscape and enlarged text keep navigation and actions reachable", async () => {
  const [flow, home, draw, layout, responsive] = await Promise.all([
    read("../src/components/flow-ui.tsx"),
    read("../src/components/welcome-folded-panel.tsx"),
    read("../src/app/draw.tsx"),
    read("../src/app/_layout.tsx"),
    read("../../../scripts/verify-responsive-layouts.mjs"),
  ]);
  assert.match(
    flow,
    /scrollHeader = scrollContainer === "screen" && fontScale > 1\.15/,
  );
  assert.match(flow, /\{shouldScroll \? \(/);
  assert.match(home, /landscapeFrame: \{ flexDirection: "row"/);
  assert.match(home, /landscapeShell: \{ minHeight: 350, maxHeight: 440 \}/);
  assert.match(home, /landscapeBenefits: \{ justifyContent: "flex-start" \}/);
  assert.match(home, /accessibilityRole="header"/);
  assert.match(draw, /scrollContainer="child"/);
  assert.match(draw, /styles\.landscapeSkip/);
  assert.match(layout, /<ScrollView[\s\S]*styles\.errorScroll/);
  assert.match(layout, /maxHeight: "85%"/);
  assert.match(responsive, /portraitDevices\.map/);
});

test("centered sample artwork uses measured dimensions instead of intrinsic raster size", async () => {
  const sample = await read("../src/components/SampleDrawing.tsx");
  assert.match(sample, /width: imageFrame\.width/);
  assert.match(sample, /height: imageFrame\.height/);
  assert.match(sample, /testID="sample-drawing-frame"/);
  assert.doesNotMatch(sample, /absoluteFill/);
});

test("opening sample keeps its light ink tint on the image, not its measuring frame", async () => {
  const [opening, sample, canvas] = await Promise.all([
    read("../src/components/animated-opening.tsx"),
    read("../src/components/SampleDrawing.tsx"),
    read("../src/components/SignatureCanvas.tsx"),
  ]);
  assert.match(opening, /tintColor="#F8F6EF"/);
  assert.match(sample, /<Image[\s\S]*tintColor \? \{ tintColor \}/);
  assert.match(
    canvas,
    /<SampleDrawing[\s\S]*align="baseline"[\s\S]*baselineRatio=\{0\.69\}/,
  );
});

test("audited flow keeps one shared spacing and control system", async () => {
  const source = await read("../src/components/flow-ui.tsx");
  assert.match(source, /paddingHorizontal: 26/);
  assert.match(source, /minWidth: 0/);
  assert.match(source, /minHeight: 56/);
  assert.match(source, /fontSize: 19/);
  assert.match(source, /minHeight: 44/);
  assert.match(source, /borderRadius: 14/);
  assert.match(source, /borderTopLeftRadius: 26/);
  assert.match(source, /accessibilityViewIsModal/);
  assert.match(source, /minHeight: 96/);
  assert.doesNotMatch(source, /height: 96/);
  assert.doesNotMatch(source, /primaryArrow|→/);
  assert.doesNotMatch(source, /9:41|dynamic island|homebar/i);
});

test("primary and row buttons do not add decorative right arrows", async () => {
  const [welcome, signatureMode, settings] = await Promise.all([
    read("../src/components/welcome-folded-panel.tsx"),
    read("../src/components/signature-mode-option.tsx"),
    read("../src/app/settings.tsx"),
  ]);

  assert.doesNotMatch(welcome, /buttonArrow|→/);
  assert.doesNotMatch(signatureMode, /chevron|m6\.75/i);
  assert.doesNotMatch(settings, /chevron|m9 5 7 7/i);
});

test("audited routes preserve the complete white and transparent branches", async () => {
  const [
    entry,
    welcome,
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
    read("../src/components/welcome-folded-panel.tsx"),
    read("../src/app/draw.tsx"),
    read("../src/app/preview.tsx"),
    read("../src/app/purchase.tsx"),
    read("../src/app/clear-background.tsx"),
    read("../src/app/free-export.tsx"),
    read("../src/app/success.tsx"),
    read("../src/app/saved.tsx"),
    read("../src/components/ExportFlow.tsx"),
  ]);

  assert.match(entry + welcome, /Create My FREE Signing Set/);
  assert.match(entry + welcome, /View my Signing Sets/);
  assert.match(draw, /Save Signature/);
  assert.match(draw, /Sign First and Last Separately/);
  assert.match(draw, /Want More Room\?/);
  assert.match(draw, /Save First Name/);
  assert.match(draw, /Save Last Name and Join/);
  assert.match(draw, /Save Initials/);
  assert.match(draw, /Skip for Now/);
  assert.match(review, /Review your signing set/);
  assert.match(review, /Confirm and Choose Background/);
  assert.match(background, /Choose a background/);
  assert.match(background, /Continue With White Background/);
  assert.match(background, /clear-background/);
  assert.match(background, /useTransparentPurchase/);
  assert.match(clear, /See the difference/);
  assert.match(
    clear,
    /A transparent signature sits naturally on any document\./,
  );
  assert.match(clear, /router\.push\("\/free-export"\)/);
  assert.match(clear, /purchase\.beginPurchase/);
  assert.match(clear, /DocumentSignaturePreview/);
  assert.match(clear, /background=\{positive \? "transparent" : "white"\}/);
  assert.match(
    warning,
    /Removing the background later can damage your signature\./,
  );
  assert.match(warning, /purchase\.beginPurchase/);
  assert.match(warning, /white-export/);
  assert.match(exportFlow, /router\.replace\("\/saved"\)/);
  assert.match(success, /White Background Set Saved/);
  assert.doesNotMatch(success, /Transparent Set Unlocked/);
  assert.match(saved, /My Signing Sets/);
  assert.match(saved, /Create New Signing Set/);
});

test("native launch frame flows directly into the dark home without simulated phone chrome", async () => {
  const [config, layout] = await Promise.all([
    read("../app.config.ts"),
    read("../src/app/_layout.tsx"),
  ]);
  assert.match(config, /assets\/brand\/only-signature-wordmark\.png/);
  assert.match(config, /backgroundColor: "#02040A"/);
  assert.match(layout, /<StatusBar style="light"/);
  assert.doesNotMatch(layout, /<StatusBar hidden/);
  assert.doesNotMatch(layout, /9:41|island|homebar/i);
});

test("the exact flow uses native editorial labels and professional fictional handwriting", async () => {
  const [flowUi, sample, fixture] = await Promise.all([
    read("../src/components/flow-ui.tsx"),
    read("../src/components/SampleDrawing.tsx"),
    read("../src/domain/fixtures.ts"),
  ]);
  assert.match(flowUi, /only-signature-wordmark\.png/);
  assert.match(flowUi, /YOUR SIGNATURE/);
  assert.match(flowUi, /YOUR INITIALS/);
  assert.match(flowUi, /REVIEW YOUR SET/);
  assert.doesNotMatch(
    flowUi,
    /sign-label\.png|initial-label\.png|review-label\.png/,
  );
  assert.doesNotMatch(flowUi, /Snell Roundhand/);
  assert.match(sample, /taylor-brooks-signature-clean\.png/);
  assert.match(sample, /taylor-brooks-initials\.png/);
  assert.match(fixture, /label: "Alex Morgan"/);
  assert.match(fixture, /fixture !== "saved-home"/);
  assert.match(fixture, /label: "Taylor Brooks"/);
});
test("reference rendering contract contains the complete fifteen-screen flow", async () => {
  const manifest = JSON.parse(
    await read("../../../artifacts/actual-flow-preview/manifest.json"),
  ) as { screenshots: { id: string }[] };
  assert.deepEqual(
    manifest.screenshots.map(({ id }) => id),
    [
      "01-splash",
      "02-entry",
      "03-signature-capture",
      "03a-first-name-capture",
      "03b-last-name-capture",
      "04-initials-capture",
      "05-review-popup",
      "06-background-popup",
      "06a-purchase-error",
      "07-clear-background",
      "08-diy-warning-popup",
      "08a-white-export",
      "08b-transparent-export",
      "09-white-confirmation-popup",
      "11-saved-sets-home",
    ],
  );
});

test("native capture contract matches all fifteen redesigned preview states", async () => {
  const [
    nativeManifestSource,
    actualFlowWorkflow,
    marketingWorkflow,
    auditedFullFlow,
    previewManifestSource,
  ] = await Promise.all([
    read("../e2e/native-actual-flow-manifest.json"),
    read("../.eas/workflows/native-ios-actual-flow.yml"),
    read("../.eas/workflows/native-ios-screenshots.yml"),
    read("../e2e/audited-full-flow.yml"),
    read("../../../artifacts/actual-flow-preview/manifest.json"),
  ]);
  const nativeManifest = JSON.parse(nativeManifestSource) as {
    purpose: string;
    screenshots: {
      id: string;
      route: string;
      headline: string;
      assertions: string[];
      assertionIds?: string[];
    }[];
  };

  assert.match(nativeManifest.purpose, /complete fifteen-state/);
  assert.match(nativeManifest.purpose, /not evidence of native splash/);
  assert.deepEqual(
    nativeManifest.screenshots.map(({ id }) => id),
    [
      "01-splash",
      "02-entry",
      "03-signature-capture",
      "03a-first-name-capture",
      "03b-last-name-capture",
      "04-initials-capture",
      "05-review-popup",
      "06-background-popup",
      "06a-purchase-error",
      "07-clear-background",
      "08-diy-warning-popup",
      "08a-white-export",
      "08b-transparent-export",
      "09-white-confirmation-popup",
      "11-saved-sets-home",
    ],
  );
  const previewManifest = JSON.parse(previewManifestSource) as {
    screenshots: { id: string; route: string }[];
  };
  assert.deepEqual(
    nativeManifest.screenshots.map(({ id, route }) => ({ id, route })),
    previewManifest.screenshots.map(({ id, route }) => ({ id, route })),
  );
  const byId = (id: string) =>
    nativeManifest.screenshots.find((shot) => shot.id === id);
  assert.deepEqual(byId("01-splash")?.assertionIds, ["opening-splash-screen"]);
  assert.deepEqual(byId("03-signature-capture")?.assertions, [
    "Sign",
    "Save Signature",
    "Sign First and Last Separately. More room for each name. We’ll align them for you.",
  ]);
  assert.deepEqual(byId("03a-first-name-capture")?.assertions, [
    "First name",
    "Save First Name",
  ]);
  assert.deepEqual(byId("03b-last-name-capture")?.assertions, [
    "Last name",
    "Save Last Name and Join",
  ]);
  assert.deepEqual(byId("04-initials-capture")?.assertions, [
    "Initials",
    "Save Initials",
    "Skip for Now",
  ]);
  assert.deepEqual(byId("07-clear-background"), {
    id: "07-clear-background",
    route: "/clear-background?fixture=both",
    headline: "See the difference",
    assertions: [
      "See the difference",
      "A transparent signature sits naturally on any document.",
      "White box",
      "No Thanks",
    ],
  });
  assert.match(actualFlowWorkflow, /Capture the fifteen redesigned app states/);
  assert.match(actualFlowWorkflow, /Capture fifteen asserted iPhone states/);
  assert.match(actualFlowWorkflow, /Capture fifteen asserted iPad states/);
  assert.doesNotMatch(actualFlowWorkflow, /Capture eight|Capture twelve/);
  assert.match(marketingWorkflow, /Capture eight asserted iPhone frames/);
  assert.match(marketingWorkflow, /Capture eight asserted iPad frames/);
  let previousStep = -1;
  for (const step of [
    'tapOn: "Confirm and Choose Background"',
    'tapOn: "Continue With White Background"',
    'assertVisible: "See the difference"',
    'tapOn: "No Thanks"',
    'assertVisible: "Download a Quality Signature"',
    'tapOn: "No Thanks, Download Free White Set"',
    'assertVisible: "White Background Export"',
  ]) {
    const index = auditedFullFlow.indexOf(step);
    assert(
      index > previousStep,
      `Missing or reordered native flow step: ${step}`,
    );
    previousStep = index;
  }
  assert.match(auditedFullFlow, /export\?fixture=purchased/);
  assert.match(auditedFullFlow, /assertVisible: "Export Transparent Set"/);
  assert.doesNotMatch(
    auditedFullFlow,
    /Transparent Set Unlocked|success\?mode=transparent|assertVisible: "Write your full name"/,
  );
  assert.doesNotMatch(auditedFullFlow, /tapOn: "Continue to Background"/);
});

test("native split capture draws before saving and does not submit an empty first name", async () => {
  const [fullFlowSource, screenshots] = await Promise.all([
    read("../e2e/audited-full-flow.yml"),
    read("../e2e/screenshot-flow.yml"),
  ]);
  const fullFlow = fullFlowSource.replace(/\r\n/g, "\n");
  for (const save of [
    "Save First Name",
    "Save Last Name and Join",
    "Save Initials",
  ]) {
    const disabled = fullFlow.indexOf(`text: "${save}"\n    enabled: false`);
    const swipe = fullFlow.indexOf("- swipe:", disabled);
    const enabled = fullFlow.indexOf(
      `text: "${save}"\n    enabled: true`,
      swipe,
    );
    const tap = fullFlow.indexOf(`- tapOn: "${save}"`, enabled);
    assert(
      disabled > 0 && swipe > disabled && enabled > swipe && tap > enabled,
    );
  }
  assert.match(
    screenshots,
    /assertVisible: "First name"[\s\S]*takeScreenshot: "02a-first-name-capture"[\s\S]*swipe:[\s\S]*tapOn: "Save First Name"[\s\S]*assertVisible: "Last name"/,
  );
  assert.doesNotMatch(
    screenshots,
    /Transparent Set Unlocked|transparent-unlocked|assertVisible: "Write your full name"/,
  );
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
  assert.match(exportFlow, /<Modal/);
  assert.match(exportFlow, /Choose where to save/);
  assert.match(exportFlow, /saveFileToPhotos/);
  assert.match(exportFlow, /label="Back"/);
  assert.match(exportFlow, /setConfirmedKinds\(\[\]\)/);
  assert.match(exportFlow, /label="Done"/);
  assert.match(exportFlow, /router\.replace\("\/saved"\)/);
  assert.doesNotMatch(exportFlow, /label="Continue"/);
  assert.doesNotMatch(exportFlow, /pathname: "\/success"/);

  assert.match(settings, /FlowScreen/);
  assert.match(settings, /borderRadius: 20/);
  assert.doesNotMatch(settings, /components\/ui/);
  assert.match(infoPage, /FlowScreen/);
  assert.match(infoPage, /borderRadius: 20/);
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

test("clear-background comparison keeps ink on the line and the white box compact", async () => {
  const [documentPreview, preview] = await Promise.all([
    read("../src/components/document-signature-preview.tsx"),
    read("../src/components/DrawingPreview.tsx"),
  ]);
  const artLayer = documentPreview.slice(
    documentPreview.indexOf("signature: {"),
  );
  const whiteBox = documentPreview.slice(
    documentPreview.indexOf("whiteBox:"),
    documentPreview.indexOf("signature: {"),
  );
  assert.match(artLayer, /top: "8%",/);
  assert.match(artLayer, /height: "58%",/);
  assert.match(whiteBox, /top: "16%",/);
  assert.match(whiteBox, /bottom: 5,/);
  assert.doesNotMatch(preview, /baselineSample|translateY: 9/);
});
test("included purchased slots finalize once and return to their source route", async () => {
  const draw = await read("../src/app/draw.tsx");
  assert.match(draw, /type ReturnTarget = "review" \| "saved" \| "export"/);
  assert.match(draw, /activeSet\.unclaimedSlot === kind/);
  assert.match(draw, /await fillIncludedSlot\(kind, completedAsset\)/);
  assert.match(draw, /if \(returnTo \|\| includedSlot\) \{\s*router\.back\(\)/);
  assert.doesNotMatch(draw, /router\.replace\("\/(preview|saved|export)"\)/);
});

test("signature capture defaults to full name and offers baseline-aligned split capture", async () => {
  const [draw, composition, canvas] = await Promise.all([
    read("../src/app/draw.tsx"),
    read("../src/domain/signature-composition.ts"),
    read("../src/components/SignatureCanvas.tsx"),
  ]);
  assert.match(draw, /type SignaturePart = "first" \| "last"/);
  assert.match(draw, /type SignatureMode = "full" \| SignaturePart/);
  assert.match(draw, /splitNameFixture \? namePart : "full"/);
  assert.match(draw, /setSignatureMode\("last"\)/);
  assert.match(draw, /signatureMode === "full"[\s\S]*\? "Sign"/);
  assert.match(draw, /Sign First and Last Separately/);
  assert.doesNotMatch(draw, /Use one full-name canvas/);
  assert.match(draw, /Save Signature/);
  assert.match(draw, /Save First Name/);
  assert.match(draw, /Save Last Name and Join/);
  assert.match(draw, /fuseSignatureParts\(firstNameAsset, lastNameAsset\)/);
  assert.match(draw, /last-name-capture-screen/);
  assert.match(composition, /GUIDE_LINE_RATIO = 0\.69/);
  assert.match(composition, /targetBaseline/);
  assert.match(composition, /firstStrokes, \.\.\.lastStrokes/);
  assert.match(canvas, /bottom: "31%"/);
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

test("entry hydration and terminal navigation fail closed", async () => {
  const [entry, opening, layout, provider, welcome, success] =
    await Promise.all([
      read("../src/app/index.tsx"),
      read("../src/components/animated-opening.tsx"),
      read("../src/app/_layout.tsx"),
      read("../src/state/AppStateProvider.tsx"),
      read("../src/components/welcome-folded-panel.tsx"),
      read("../src/app/success.tsx"),
    ]);
  assert.match(entry, /if \(!data\.hydrated\) return/);
  assert.match(entry, /disabled=\{!data\.hydrated\}/);
  assert.match(entry, /AnimatedOpening/);
  assert.match(entry, /openingFixture/);
  assert.match(entry, /compact=\{data\.hasSeenFullOpening/);
  assert.match(entry, /markOpeningSeen\(\)/);
  assert.match(opening, /openingDurationMs = 2_200/);
  assert.match(opening, /returningOpeningDurationMs = 650/);
  assert.match(opening, /useSharedValue/);
  assert.match(opening, /withTiming/);
  assert.match(opening, /reducedMotion\s*\? 250/);
  assert.match(opening, /setTimeout\(\(\) => setSkipReady\(true\), 300\)/);
  assert.match(opening, /scaleX: interpolate/);
  assert.match(opening, /Private by design\. Ready when you are\./);
  assert.match(layout, /SplashScreen\.preventAutoHideAsync\(\)/);
  assert.match(layout, /SplashScreen\.hideAsync\(\)/);
  assert.match(provider, /hasSeenFullOpening: false/);
  assert.match(provider, /hasSeenFullOpening: true/);
  assert.match(welcome, /<Wordmark style=\{styles\.wordmark\} \/>/);
  assert.doesNotMatch(entry, /router\.replace\("\/saved"\)/);
  assert.match(success, /router\.dismissAll\(\)/);
  assert.match(success, /router\.replace\("\/saved"\)/);
});

test("review and background are fixed full screens while saved actions remain individually accessible", async () => {
  const [review, background, success, saved] = await Promise.all([
    read("../src/app/preview.tsx"),
    read("../src/app/purchase.tsx"),
    read("../src/app/success.tsx"),
    read("../src/app/saved.tsx"),
  ]);
  assert.match(review, /scroll=\{false\}/);
  // Normal purchase remains fixed; lengthy recovery feedback may scroll.
  assert.match(background, /scroll=\{Boolean\(feedback\)\}/);
  assert.match(success, /scroll=\{false\}/);
  assert.doesNotMatch(success, /FlowSheet|CaptureBackdrop/);
  assert.doesNotMatch(review, /FlowSheet|EntryBackdrop/);
  assert.doesNotMatch(background, /FlowSheet|ReviewBackdrop/);
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

test("capture geometry responds to iPhone portrait and landscape", async () => {
  const draw = await read("../src/app/draw.tsx");
  assert.match(draw, /landscape = windowWidth > windowHeight/);
  assert.match(draw, /presentation="fullBleed"/);
  assert.match(draw, /styles\.landscapeCanvas/);
  assert.match(draw, /chrome="none"/);
  assert.match(draw, /minHeight: compactPortrait \? 180 : 300/);
  assert.match(draw, /maxWidth: 1400/);
  assert.match(draw, /function RotateIcon\(\)/);
  assert.doesNotMatch(draw, /↻/);
  assert.match(draw, /landscapeToolbar/);
  assert.match(draw, /landscapeSave/);
});

test("loading and haptics use shared failure-safe native feedback", async () => {
  const [feedback, haptics, controller, canvas, saved, exportFlow] =
    await Promise.all([
      read("../src/components/feedback-ui.tsx"),
      read("../src/services/haptics.ts"),
      read("../src/services/haptic-controller.ts"),
      read("../src/components/SignatureCanvas.tsx"),
      read("../src/app/saved.tsx"),
      read("../src/components/ExportFlow.tsx"),
    ]);
  assert.match(feedback, /function AsyncActionButton/);
  assert.match(feedback, /function OperationOverlay/);
  assert.match(feedback, /function InlineStatus/);
  assert.match(feedback, /function LoadingMark/);
  assert.match(feedback, /delay = 300/);
  assert.match(haptics, /DEBOUNCE_MS = 180/);
  assert.match(haptics, /Haptics\.selectionAsync\(\)/);
  assert.match(haptics, /ImpactFeedbackStyle\.Light/);
  assert.match(haptics, /NotificationFeedbackType\.Success/);
  assert.match(haptics, /NotificationFeedbackType\.Warning/);
  assert.match(haptics, /NotificationFeedbackType\.Error/);
  assert.match(controller, /createDebouncedHapticService/);
  assert.match(controller, /lastPlayed/);
  assert.doesNotMatch(canvas, /expo-haptics|selectionAsync|impactAsync/);
  assert.match(saved, /FlatList/);
  assert.match(exportFlow, /Preparing your files/);
  assert.match(exportFlow, /Saving to Photos/);
  assert.match(exportFlow, /Opening sharing options/);
});

test("drawing responder owns one continuous finger gesture", async () => {
  const canvas = await read("../src/components/SignatureCanvas.tsx");
  assert.match(canvas, /Gesture\.Pan\(\)/);
  assert.match(canvas, /\.minDistance\(0\)/);
  assert.match(canvas, /\.shouldCancelWhenOutside\(false\)/);
  assert.match(canvas, /<GestureDetector gesture=\{drawingGesture\}>/);
  assert.match(canvas, /collapsable=\{false\}/);
  const draw = await read("../src/app/draw.tsx");
  const layout = await read("../src/app/_layout.tsx");
  assert.match(draw, /<FlowScreen[\s\S]*scroll=\{false\}/);
  assert.match(layout, /name="draw"[\s\S]*gestureEnabled: false/);
  assert.match(layout, /fullScreenGestureEnabled: false/);
  assert.match(layout, /GestureHandlerRootView/);
  assert.match(canvas, /Math\.max\(plane\.width, nextSize\.width\)/);
  assert.match(canvas, /Math\.max\(plane\.height, nextSize\.height\)/);
  assert.match(canvas, /prompt \?\? "Sign here"/);
  assert.match(canvas, /stabilizeDrawingTouch/);
  assert.match(
    canvas,
    /shouldRecordStrokePoint\(\s*previous,\s*stabilized\.point,\s*displayScale/,
  );
  assert.match(canvas, /shouldRecordStrokePoint/);
  assert.match(canvas, /move\(event\.x, event\.y, true\);\s*release\(\)/);
  assert.match(canvas, /style=\{styles\.guideLineLayer\}/);
  assert.ok(
    canvas.indexOf("style={styles.guideLineLayer}") <
      canvas.indexOf("{sampleSource ?"),
  );
  assert.doesNotMatch(canvas, /Sign naturally/);
});

test("DIY warning keeps the missing-strokes pill outside the signature preview", async () => {
  const warning = await read("../src/app/free-export.tsx");
  const diyStart = warning.indexOf('id="warning.diy.label"');
  const previewStart = warning.indexOf(
    "<View style={styles.compareCard}>",
    diyStart,
  );
  const heading = warning.slice(diyStart, previewStart);
  const preview = warning.slice(
    previewStart,
    warning.indexOf("</LayoutSlot>", previewStart),
  );
  assert.match(heading, /Missing strokes/);
  assert.match(heading, /styles\.damagePill/);
  assert.doesNotMatch(heading, /Fine strokes get erased/);
  assert.doesNotMatch(preview, /Missing strokes|damagePill/);
});

test("purchase actions use stable customer copy and saved actions stay above the list", async () => {
  const [
    background,
    clear,
    warning,
    saved,
    purchaseHook,
    purchaseAction,
    catalog,
    resultFeedback,
  ] = await Promise.all([
    read("../src/app/purchase.tsx"),
    read("../src/app/clear-background.tsx"),
    read("../src/app/free-export.tsx"),
    read("../src/app/saved.tsx"),
    read("../src/hooks/use-transparent-purchase.ts"),
    read("../src/components/purchase-action.tsx"),
    read("../src/services/productCatalog.ts"),
    read("../src/domain/purchase-result-feedback.ts"),
  ]);
  for (const source of [background, clear, warning]) {
    assert.match(source, /PurchaseAction/);
    assert.doesNotMatch(source, /Try Transparent Purchase/);
  }
  assert.match(purchaseAction, /purchaseActionState/);
  assert.match(catalog, /Purchase Transparent Signature/);
  assert.match(purchaseAction, /One-time purchase/);
  assert.match(saved, /Purchase Transparent Signature/);
  assert.match(purchaseHook, /purchaseErrorCopy/);
  assert.match(resultFeedback, /temporarily unavailable/);
  assert.match(resultFeedback, /product-unavailable/);
  assert.match(resultFeedback, /Your signing set is safe/);
  assert.doesNotMatch(purchaseHook, /Sandbox Apple Account/);
  assert.doesNotMatch(purchaseHook, /United States Media & Purchases/);
  assert.ok(
    saved.indexOf('id="saved.actions"') < saved.indexOf('id="saved.list"'),
  );
  assert.match(saved, /⚙︎/);
  assert.doesNotMatch(saved, /react-native-svg/);
});

test("brand headers and paper bodies use normal layout and support enlarged text", async () => {
  const [flow, draw] = await Promise.all([
    read("../src/components/flow-ui.tsx"),
    read("../src/app/draw.tsx"),
  ]);
  assert.match(flow, /header\?: ReactNode/);
  assert.match(flow, /style=\{styles\.flowHeader\}/);
  assert.match(flow, /styles\.paperContent/);
  assert.match(flow, /fontScale > 1\.15/);
  assert.doesNotMatch(flow, /maxFontSizeMultiplier=\{1\.08\}|scaleX: 0\.91/);
  assert.match(draw, /navigation=\{/);
  assert.match(draw, /header=\{/);
});

test("control feedback compresses elevation without moving quiet links", async () => {
  const [flow, welcome, split] = await Promise.all([
    read("../src/components/flow-ui.tsx"),
    read("../src/components/welcome-folded-panel.tsx"),
    read("../src/components/signature-mode-option.tsx"),
  ]);
  for (const source of [flow, welcome, split]) {
    assert.doesNotMatch(source, /scale: 0\.98[25]|scale: 0\.992/);
    assert.match(source, /flowShadows\.controlPressed/);
  }
});

test("focus styling keeps the native pressable primitive and disabled semantics", async () => {
  const [focus, dropdown, exportFlow, background] = await Promise.all([
    read("../src/components/FocusPressable.tsx"),
    read("../src/components/FormatDropdown.tsx"),
    read("../src/components/ExportFlow.tsx"),
    read("../src/app/purchase.tsx"),
  ]);
  assert.match(focus, /<Pressable/);
  assert.match(focus, /onFocus\?\.\(event\)/);
  assert.match(focus, /onBlur\?\.\(event\)/);
  assert.match(focus, /focused && !disabled/);
  assert.match(focus, /outlineWidth: 2/);
  assert.doesNotMatch(focus, /onKeyDown|preventDefault|transform:/);
  for (const source of [dropdown, exportFlow])
    assert.match(source, /animationType=\{reducedMotion \? "none" : "fade"\}/);
  assert.match(
    dropdown,
    /accessibilityState=\{\{ expanded: open, disabled \}\}/,
  );
  assert.match(exportFlow, /formats=\{formats\}\s+disabled=\{busy\}/);
  assert.match(exportFlow, /accessibilityState=\{\{ disabled \}\}/);
  assert.match(background, /radioSelected: \{ borderColor: flowColors\.ink \}/);
});

test("static web previews avoid hydrating viewport-dependent navigation prematurely", async () => {
  const layout = await read("../src/app/_layout.tsx");
  assert.match(layout, /useSyncExternalStore/);
  assert.match(layout, /const serverSnapshot = \(\) => false/);
  assert.match(layout, /Platform\.OS !== "web" \|\| webHydrated/);
  assert.match(layout, /navigationReady \? \(/);
  assert.doesNotMatch(layout, /suppressHydrationWarning/);
});

test("export and white confirmation share the header system and real artwork", async () => {
  const [exportFlow, success, saved, flow] = await Promise.all([
    read("../src/components/ExportFlow.tsx"),
    read("../src/app/success.tsx"),
    read("../src/app/saved.tsx"),
    read("../src/components/flow-ui.tsx"),
  ]);
  assert.match(exportFlow, /Signature export preview/);
  assert.match(exportFlow, /Initials export preview/);
  assert.match(success, /header=\{/);
  assert.doesNotMatch(success, /styles\.actionPanel|chrome="none"/);
  assert.match(success, /baselineRatio=\{0\.72\}/);
  assert.match(saved, /scrollContainer="child"/);
  assert.match(flow, /busy: loading/);
  assert.match(flow, /const blocked = disabled \|\| loading/);
});

test("entry has no authorization interruption and StoreKit can retry", async () => {
  const [entry, provider, purchaseHook] = await Promise.all([
    read("../src/app/index.tsx"),
    read("../src/state/AppStateProvider.tsx"),
    read("../src/hooks/use-transparent-purchase.ts"),
  ]);
  assert.doesNotMatch(entry, /confirmAuthorizedUse|Authorized use only/);
  assert.match(entry, /router\.push\("\/draw"\)/);
  assert.match(provider, /availableProduct = await refreshProduct\(\)/);
  assert.match(
    provider,
    /createProductRequest\(\s*\(\) => storeKit\.loadProduct\(\),\s*configuredStoreKitProductId/,
  );
  assert.match(
    purchaseHook,
    /transparentUnavailable: !unboundPurchase && purchasePending/,
  );
});

test("layout studio slots are backed by persisted device profiles", async () => {
  const [
    slot,
    values,
    entry,
    welcome,
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
    read("../src/components/welcome-folded-panel.tsx"),
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
  assert.match(slot, /Platform\.OS !== "web"/);
  assert.match(slot, /layoutStudioMode && layoutStudioRequested\(\)/);
  assert.match(slot, /if \(!studioEnabled\) return slot/);
  assert.match(slot, /`layout-slot:\$\{id\}`/);
  assert.match(values, /(?:["']iphone["']|iphone):/);
  assert.match(values, /(?:["']ipad["']|ipad):/);
  assert.match(values, /rotate\?: number/);
  assert.match(slot, /rotate: `\$\{clean\.rotate\}deg`/);
  assert.doesNotMatch(values, /["']capture\./);
  assert.doesNotMatch(values, /["']confirmation\./);
  for (const [source, expected] of [
    [entry + welcome, /id="entry\.hero"/],
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

test("home uses the ink, paper, and gold material system without legacy teal or purple", async () => {
  const [paper, welcome, config] = await Promise.all([
    read("../src/components/paper-ui.tsx"),
    read("../src/components/welcome-folded-panel.tsx"),
    read("../app.config.ts"),
  ]);
  assert.match(paper, /backgroundColor: "#02040A"/);
  assert.match(paper, /warm-paper-texture\.png/);
  assert.match(welcome, /backgroundColor: "#0A3D78"/);
  assert.match(welcome, /backgroundColor: "#D8B66A"/);
  assert.match(config, /backgroundColor: "#02040A"/);
  assert.doesNotMatch(
    `${paper}\n${welcome}\n${config}`,
    /purple|teal|#006971|#302B67|#DEDDF5|#B9B5FF|#ECEAFA/i,
  );
  assert.ok(welcome.indexOf("No Account") < welcome.indexOf("No Subscription"));
  assert.ok(
    welcome.indexOf("No Subscription") < welcome.indexOf("No Document Upload"),
  );
});

test("shared visual tokens keep every control family on the navy paper and gold system", async () => {
  const [tokens, flow, legacyUi, segmented, settings, draw, clear] =
    await Promise.all([
      read("../../../packages/design-tokens/src/index.ts"),
      read("../src/components/flow-ui.tsx"),
      read("../src/components/ui.tsx"),
      read("../src/components/SegmentedControl.tsx"),
      read("../src/app/settings.tsx"),
      read("../src/app/draw.tsx"),
      read("../src/app/clear-background.tsx"),
    ]);
  const system = [
    tokens,
    flow,
    legacyUi,
    segmented,
    settings,
    draw,
    clear,
  ].join("\n");

  assert.match(tokens, /primary: "#0A3D78"/);
  assert.match(tokens, /primaryDark: "#071F5A"/);
  assert.match(tokens, /offWhite: "#F8F6EF"/);
  assert.match(tokens, /focus: "#D8B66A"/);
  assert.match(tokens, /fontFamily: "Georgia"/);
  assert.match(flow, /action: "#0A3D78"/);
  assert.match(flow, /gold: "#D8B66A"/);
  assert.match(flow, /bodyText: "#E9E6DC"/);
  assert.doesNotMatch(
    system,
    /#133A50|#0A2637|#3B6478|#DCE7EA|#DCE5E8|#DDE5E8|#E5ECEF|fontFamily: "serif"|shadowColor:|elevation:/,
  );
});

test("layout studio exposes individual text, icon, artwork, and action layers", async () => {
  const [
    flow,
    entry,
    welcome,
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
    read("../src/components/welcome-folded-panel.tsx"),
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
      entry + welcome,
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
        "${layerPrefix}.title",
        "${layerPrefix}.rotate.icon",
        "${layerPrefix}.redo.label",
      ],
    ],
    [
      "review",
      review,
      [
        "review.back.icon",
        "review.signature.label",
        "review.signature.edit",
        "review.signature.art",
      ],
    ],
    [
      "background",
      background,
      [
        "background.back.icon",
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
        "clear.subtitle",
        'background={positive ? "transparent" : "white"}',
        'layoutPrefix="clear.primary"',
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

test("layout studio can present the live app inside a coded device mockup", async () => {
  const [markup, styles, studio, slot] = await Promise.all([
    read("../../../tools/layout-studio/index.html"),
    read("../../../tools/layout-studio/studio.css"),
    read("../../../tools/layout-studio/studio.js"),
    read("../src/components/layout-slot.tsx"),
  ]);

  assert.match(markup, /id="deviceShell" class="device-shell iphone-shell"/);
  assert.match(markup, /id="appFrame"/);
  assert.match(markup, /class="dynamic-island"/);
  assert.match(markup, /Live code · Interactive/);
  assert.match(styles, /body\.present-mode \.studio/);
  assert.match(styles, /\.device-shell/);
  assert.match(studio, /query\.get\("present"\) === "1"/);
  assert.match(studio, /elements\.deviceShell\.style\.transform/);
  assert.match(studio, /presentMode\s*\?\s*screen\.route/);
  assert.match(
    studio,
    /state\.visibleSlots[\s\S]*if \(presentMode\) return;[\s\S]*applyAllValues\(\)/,
  );
  assert.match(slot, /get\("layoutStudio"\) === "1"/);
});
