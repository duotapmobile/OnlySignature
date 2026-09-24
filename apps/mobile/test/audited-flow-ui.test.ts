import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path: string) => readFile(new URL(path, import.meta.url), "utf8");

test("audited flow keeps one shared spacing and control system", async () => {
  const source = await read("../src/components/flow-ui.tsx");
  assert.match(source, /paddingHorizontal: 26/);
  assert.match(source, /minHeight: 60/);
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
  assert.match(clear, /clear\.bad\.white-box/);
  assert.match(clear, /obstructedDate/);
  assert.match(
    warning,
    /Removing the background later can damage your signature\./,
  );
  assert.match(warning, /purchase\.beginPurchase/);
  assert.match(warning, /white-export/);
  assert.match(exportFlow, /router\.replace\("\/saved"\)/);
  assert.match(success, /White Background Set Saved/);
  assert.match(success, /Transparent Set Unlocked/);
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
  assert.match(sample, /taylor-brooks-signature\.png/);
  assert.match(sample, /taylor-brooks-initials\.png/);
  assert.match(fixture, /label: "Alex Morgan"/);
  assert.match(fixture, /fixture !== "saved-home"/);
  assert.match(fixture, /label: "Taylor Brooks"/);
});
test("reference rendering contract contains the complete thirteen-screen flow", async () => {
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
      "07-clear-background",
      "08-diy-warning-popup",
      "09-white-confirmation-popup",
      "10-transparent-confirmation-popup",
      "11-saved-sets-home",
    ],
  );
});

test("native capture contract contains twelve in-app states matching the approved thirteen-screen flow", async () => {
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

  assert.match(nativeManifest.purpose, /twelve in-app states/);
  assert.match(nativeManifest.purpose, /thirteen-screen flow/);
  assert.deepEqual(
    nativeManifest.screenshots.map(({ id }) => id),
    [
      "02-entry",
      "03-signature-capture",
      "03a-first-name-capture",
      "03b-last-name-capture",
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
  assert.deepEqual(nativeManifest.screenshots[1]?.assertions, [
    "Write your full name",
    "Save Signature",
    "Sign First and Last Separately. More room for each name. We’ll align them for you.",
  ]);
  assert.deepEqual(nativeManifest.screenshots[7], {
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
  assert.match(actualFlowWorkflow, /Capture the twelve real in-app screens/);
  assert.match(actualFlowWorkflow, /Capture twelve asserted iPhone screens/);
  assert.match(actualFlowWorkflow, /Capture twelve asserted iPad screens/);
  assert.doesNotMatch(actualFlowWorkflow, /Capture eight/);
  assert.match(marketingWorkflow, /Capture eight asserted iPhone frames/);
  assert.match(marketingWorkflow, /Capture eight asserted iPad frames/);
  assert.match(
    auditedFullFlow,
    /tapOn: "Confirm and Choose Background"[\s\S]*tapOn: "Continue With White Background"[\s\S]*assertVisible: "See the difference"[\s\S]*tapOn: "No Thanks"[\s\S]*assertVisible: "Removing the background later can damage your signature\."[\s\S]*tapOn: "No Thanks, Download Free White Set"[\s\S]*assertVisible: "White Background Export"/,
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
  const [clear, preview] = await Promise.all([
    read("../src/app/clear-background.tsx"),
    read("../src/components/DrawingPreview.tsx"),
  ]);
  const artLayer = clear.slice(
    clear.indexOf("artLayer:"),
    clear.indexOf("whiteBox:"),
  );
  const whiteBox = clear.slice(
    clear.indexOf("whiteBox:"),
    clear.indexOf("art: {"),
  );
  assert.match(artLayer, /top: 10,/);
  assert.match(artLayer, /height: 40,/);
  assert.match(whiteBox, /top: 17,/);
  assert.match(whiteBox, /height: 48,/);
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
  assert.match(draw, /Write your full name/);
  assert.match(draw, /Sign First and Last Separately/);
  assert.match(draw, /Write your \$\{signatureMode\} name/);
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
  for (const source of [review, background])
    assert.match(source, /scroll=\{false\}/);
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
  assert.match(draw, /Math\.max\(210, windowHeight \* 0\.29\)/);
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
  assert.match(canvas, /stabilizeStrokePoint/);
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
  const [background, clear, warning, saved, purchaseHook] = await Promise.all([
    read("../src/app/purchase.tsx"),
    read("../src/app/clear-background.tsx"),
    read("../src/app/free-export.tsx"),
    read("../src/app/saved.tsx"),
    read("../src/hooks/use-transparent-purchase.ts"),
  ]);
  for (const source of [background, clear, warning, saved]) {
    assert.match(source, /Purchase Transparent/);
    assert.doesNotMatch(source, /Try Transparent Purchase/);
  }
  assert.match(purchaseHook, /temporarily unavailable/);
  assert.doesNotMatch(purchaseHook, /Sandbox Apple Account/);
  assert.doesNotMatch(purchaseHook, /United States Media & Purchases/);
  assert.ok(
    saved.indexOf('id="saved.actions"') < saved.indexOf('id="saved.list"'),
  );
  assert.match(saved, /⚙︎/);
  assert.doesNotMatch(saved, /react-native-svg/);
});

test("brand headers constrain native display scaling and keep the wordmark below system chrome", async () => {
  const [flow, draw] = await Promise.all([
    read("../src/components/flow-ui.tsx"),
    read("../src/app/draw.tsx"),
  ]);
  assert.match(flow, /maxFontSizeMultiplier=\{1\.08\}/);
  assert.match(flow, /maxFontSizeMultiplier=\{1\.18\}/);
  assert.match(flow, /flowInkStage:[\s\S]*height: 260/);
  assert.match(flow, /flowPaperStage:[\s\S]*top: 214/);
  assert.match(flow, /flowWordmark:[\s\S]*top: 42/);
  assert.match(draw, /portraitInk:[\s\S]*height: 260/);
});

test("entry has no authorization interruption and StoreKit can retry", async () => {
  const [entry, provider, purchaseHook] = await Promise.all([
    read("../src/app/index.tsx"),
    read("../src/state/AppStateProvider.tsx"),
    read("../src/hooks/use-transparent-purchase.ts"),
  ]);
  assert.doesNotMatch(entry, /confirmAuthorizedUse|Authorized use only/);
  assert.match(entry, /router\.push\("\/draw"\)/);
  assert.match(
    provider,
    /availableProduct = await withTimeout\(\s*storeKit\.loadProduct\(\),\s*15_000,\s*\)/,
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
