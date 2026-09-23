import { useState } from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import Svg, { Path } from "react-native-svg";
import { SignatureCanvas } from "@/components/SignatureCanvas";
import { SignatureModeOption } from "@/components/signature-mode-option";
import { OperationOverlay } from "@/components/feedback-ui";
import { LayoutSlot } from "@/components/layout-slot";
import {
  FlowBackButton,
  FlowBody,
  FlowHeading,
  FlowPrimaryButton,
  FlowScreen,
  FlowTextButton,
  ScriptLabel,
  flowColors,
} from "@/components/flow-ui";
import {
  createEmptyAsset,
  hasDrawing,
  type DrawingAsset,
} from "@/domain/models";
import { fuseSignatureParts } from "@/domain/signature-composition";
import { isAuthorizedScreenshotFixture } from "@/config/screenshotFixtures";
import { useAppState } from "@/state/AppStateProvider";
import {
  hapticError,
  hapticLightImpact,
  hapticSelection,
  hapticSuccess,
} from "@/services/haptics";

type ReturnTarget = "review" | "saved" | "export";
type SignaturePart = "first" | "last";
type SignatureMode = "full" | SignaturePart;

export default function CaptureScreen() {
  const { returnTo, fixture, namePart } = useLocalSearchParams<{
    returnTo?: ReturnTarget;
    fixture?: string;
    namePart?: SignaturePart;
  }>();
  const {
    activeSet,
    data,
    setSelectedAsset,
    updateAsset,
    clearAsset,
    fillIncludedSlot,
  } = useAppState();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const landscape = windowWidth > windowHeight;
  const compactPortrait = !landscape && windowHeight <= 700;
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const kind = data.selectedAsset;
  const initial = kind === "initials";
  const splitNameFixture =
    (namePart === "first" || namePart === "last") &&
    isAuthorizedScreenshotFixture(fixture, "both");
  const [signatureMode, setSignatureMode] = useState<SignatureMode>(
    splitNameFixture ? namePart : "full",
  );
  const [fullNameAsset, setFullNameAsset] = useState<DrawingAsset>(() =>
    !returnTo && hasDrawing(activeSet.signature)
      ? activeSet.signature
      : createEmptyAsset("signature"),
  );
  const [firstNameAsset, setFirstNameAsset] = useState<DrawingAsset>(() =>
    createEmptyAsset("signature"),
  );
  const [lastNameAsset, setLastNameAsset] = useState<DrawingAsset>(() =>
    createEmptyAsset("signature"),
  );
  const layerPrefix = initial
    ? "initials"
    : signatureMode === "full"
      ? "signature"
      : `signature-${signatureMode}`;
  const persistedAsset = activeSet[kind];
  const drawableAsset = initial
    ? (persistedAsset ?? createEmptyAsset(kind))
    : signatureMode === "full"
      ? fullNameAsset
      : signatureMode === "first"
        ? firstNameAsset
        : lastNameAsset;
  const immutable =
    Boolean(activeSet.pendingPurchaseId) ||
    activeSet.transactionFinishPending ||
    (activeSet.status === "purchased" && activeSet.unclaimedSlot !== kind);
  const includedSlot =
    activeSet.status === "purchased" && activeSet.unclaimedSlot === kind;
  const primaryLabel = initial
    ? "Save Initials"
    : signatureMode === "full"
      ? "Save Signature"
      : signatureMode === "first"
        ? "Save First Name"
        : "Save Last Name and Join";
  const workingMessage = initial
    ? "Saving your initials"
    : signatureMode === "last"
      ? "Aligning your signature"
      : "Saving your signature";

  const finishCapture = async () => {
    void hapticLightImpact();
    if (!hasDrawing(drawableAsset)) {
      setMessage(
        initial
          ? "Write your initials or skip for now."
          : signatureMode === "full"
            ? "Write your full name before continuing."
            : `Write your ${signatureMode} name before continuing.`,
      );
      void hapticError();
      return;
    }
    setMessage(null);
    if (!initial && signatureMode === "first") {
      void hapticSelection();
      setSignatureMode("last");
      return;
    }
    const completedAsset = initial
      ? drawableAsset
      : signatureMode === "full"
        ? fullNameAsset
        : fuseSignatureParts(firstNameAsset, lastNameAsset);
    if (includedSlot) {
      setSaving(true);
      try {
        await fillIncludedSlot(kind, completedAsset);
      } catch {
        setMessage(
          "This included drawing could not be finalized. Your saved set is unchanged.",
        );
        setSaving(false);
        void hapticError();
        return;
      }
      setSaving(false);
    }
    if (!initial && !includedSlot) {
      updateAsset(
        "signature",
        completedAsset.strokes,
        completedAsset.canvasWidth,
        completedAsset.canvasHeight,
        completedAsset.orientation,
      );
    }
    void hapticSuccess();
    if (returnTo || includedSlot) {
      router.back();
      return;
    }
    if (!initial) {
      setSelectedAsset("initials");
      return;
    }
    router.push("/preview");
  };

  const goBack = () => {
    if (!initial && signatureMode === "last") {
      setSignatureMode("first");
      setMessage(null);
      return;
    }
    if (!initial && signatureMode === "first") {
      setSignatureMode("full");
      setMessage(null);
      return;
    }
    if (returnTo || includedSlot) router.back();
    else if (initial) setSelectedAsset("signature");
    else router.back();
  };

  const confirmRedo = () => {
    if (!hasDrawing(drawableAsset)) return;
    Alert.alert(
      initial
        ? "Redo these initials?"
        : signatureMode === "full"
          ? "Redo your signature?"
          : `Redo your ${signatureMode} name?`,
      "The drawing on this screen will be cleared.",
      [
        { text: "Keep Drawing", style: "cancel" },
        {
          text: "Redo",
          style: "destructive",
          onPress: () => {
            void hapticSelection();
            if (initial) clearAsset(kind);
            else if (signatureMode === "full")
              setFullNameAsset(createEmptyAsset("signature"));
            else if (signatureMode === "first")
              setFirstNameAsset(createEmptyAsset("signature"));
            else setLastNameAsset(createEmptyAsset("signature"));
          },
        },
      ],
    );
  };

  const updateDrawing = (
    strokes: DrawingAsset["strokes"],
    width: number,
    height: number,
    orientation: DrawingAsset["orientation"],
  ) => {
    if (initial) {
      updateAsset(kind, strokes, width, height, orientation);
      return;
    }
    const next: DrawingAsset = {
      kind: "signature",
      strokes,
      canvasWidth: width,
      canvasHeight: height,
      orientation,
      renderingVersion: 1,
      finalizedHash: null,
    };
    if (signatureMode === "full") setFullNameAsset(next);
    else if (signatureMode === "first") setFirstNameAsset(next);
    else setLastNameAsset(next);
  };

  if (landscape) {
    return (
      <FlowScreen
        chrome="none"
        scroll={false}
        contentStyle={styles.landscapeContent}
        testID={
          initial
            ? "initials-capture-screen"
            : signatureMode === "full"
              ? "signature-capture-screen"
              : signatureMode === "first"
                ? "first-name-capture-screen"
                : "last-name-capture-screen"
        }
      >
        <View style={styles.landscapeCanvas}>
          {immutable ? (
            <View style={styles.locked}>
              <Text style={styles.lockedTitle}>
                This saved drawing stays unchanged.
              </Text>
              <Text style={styles.lockedBody}>
                Duplicate the set from My Signing Sets to make a changed
                version.
              </Text>
            </View>
          ) : (
            <SignatureCanvas
              key={`${kind}-${signatureMode}-landscape-${hasDrawing(drawableAsset) ? "drawn" : "empty"}`}
              asset={drawableAsset}
              kind={kind}
              presentation="fullBleed"
              prompt={
                initial
                  ? "Write your initials"
                  : signatureMode === "full"
                    ? "Write your full name"
                    : `Write your ${signatureMode} name`
              }
              drawingAccessibilityLabel={
                initial
                  ? undefined
                  : `${signatureMode === "full" ? "Full" : signatureMode === "first" ? "First" : "Last"} name signature drawing area. Draw with one finger.`
              }
              onChange={updateDrawing}
            />
          )}
        </View>
        <View style={styles.landscapeToolbar}>
          <FlowBackButton onPress={goBack} />
          <View style={styles.landscapeMode}>
            <Text numberOfLines={1} style={styles.landscapeModeTitle}>
              {initial
                ? "Your initials"
                : signatureMode === "full"
                  ? "Your full signature"
                  : signatureMode === "first"
                    ? "First name, step 1 of 2"
                    : "Last name, step 2 of 2"}
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Clear and redraw"
            disabled={immutable || saving || !hasDrawing(drawableAsset)}
            onPress={confirmRedo}
            style={({ pressed }) => [
              styles.landscapeRedo,
              pressed && styles.pressed,
              (immutable || saving || !hasDrawing(drawableAsset)) &&
                styles.disabled,
            ]}
          >
            <RotateIcon />
            <Text style={styles.landscapeRedoText}>Redo</Text>
          </Pressable>
        </View>
        {message ? (
          <Text accessibilityRole="alert" style={styles.landscapeError}>
            {message}
          </Text>
        ) : null}
        <View style={styles.landscapeSave}>
          <FlowPrimaryButton
            label={primaryLabel}
            onPress={() => void finishCapture()}
            disabled={immutable || saving}
            loading={saving}
          />
        </View>
        <OperationOverlay visible={saving} message={workingMessage} />
      </FlowScreen>
    );
  }

  return (
    <FlowScreen
      chrome="none"
      scroll={false}
      contentStyle={[styles.content, compactPortrait && styles.compactContent]}
      testID={
        initial
          ? "initials-capture-screen"
          : signatureMode === "full"
            ? "signature-capture-screen"
            : signatureMode === "first"
              ? "first-name-capture-screen"
              : "last-name-capture-screen"
      }
    >
      <View pointerEvents="none" style={styles.portraitFrame}>
        <View style={styles.portraitPaper} />
        <View style={styles.portraitInk} />
      </View>
      <View style={styles.back}>
        <FlowBackButton
          onPress={goBack}
          layoutId={`${layerPrefix}.back.icon`}
        />
      </View>
      <LayoutSlot
        id={`${layerPrefix}.header`}
        style={[styles.header, compactPortrait && styles.compactHeader]}
      >
        <ScriptLabel
          asset={initial ? "initial" : "sign"}
          style={[
            styles.script,
            compactPortrait && styles.compactPortraitScript,
          ]}
          layoutId={`${layerPrefix}.script`}
        />
        {!initial && signatureMode !== "full" ? (
          <LayoutSlot id={`${layerPrefix}.step`} style={styles.stepRow}>
            <Text selectable style={styles.stepLabel}>
              {signatureMode === "first" ? "STEP 1 OF 2" : "STEP 2 OF 2"}
            </Text>
            <View style={styles.progressTrack}>
              <View style={styles.progressActive} />
              <View
                style={[
                  styles.progressSegment,
                  signatureMode === "last" && styles.progressActive,
                ]}
              />
            </View>
          </LayoutSlot>
        ) : null}
        <FlowHeading
          style={[styles.heroTitle, compactPortrait && styles.compactHeroTitle]}
          layoutId={`${layerPrefix}.title`}
        >
          {initial
            ? "Write your initials"
            : signatureMode === "full"
              ? "Write your full name"
              : `Write your ${signatureMode} name`}
        </FlowHeading>
        <>
          <FlowBody
            style={[styles.subtitle, compactPortrait && styles.compactSubtitle]}
            layoutId={`${layerPrefix}.subtitle`}
          >
            {initial
              ? "Write your initials along the line below."
              : signatureMode === "full"
                ? "Write your full name along the line below."
                : signatureMode === "first"
                  ? "Write only your first name. We’ll join it to your last name next."
                  : "Write only your last name. We’ll align and join both parts for you."}
          </FlowBody>
          <View
            style={[styles.rotate, compactPortrait && styles.compactRotate]}
          >
            <LayoutSlot id={`${layerPrefix}.rotate.icon`}>
              <RotateIcon />
            </LayoutSlot>
            <LayoutSlot id={`${layerPrefix}.rotate.label`}>
              <Text
                selectable
                maxFontSizeMultiplier={1.12}
                style={styles.rotateText}
              >
                Rotate for more room
              </Text>
            </LayoutSlot>
          </View>
        </>
      </LayoutSlot>
      <LayoutSlot
        id={`${layerPrefix}.canvas`}
        style={[
          styles.canvas,
          compactPortrait && styles.compactCanvas,
          {
            height: compactPortrait
              ? 156
              : Math.min(310, Math.max(210, windowHeight * 0.29)),
          },
        ]}
      >
        {immutable ? (
          <View style={styles.locked}>
            <LayoutSlot id={`${layerPrefix}.locked.title`}>
              <Text style={styles.lockedTitle}>
                This saved drawing stays unchanged.
              </Text>
            </LayoutSlot>
            <LayoutSlot id={`${layerPrefix}.locked.body`}>
              <Text style={styles.lockedBody}>
                Duplicate the set from My Signing Sets to make a changed
                version.
              </Text>
            </LayoutSlot>
          </View>
        ) : (
          <SignatureCanvas
            key={`${kind}-${signatureMode}-${hasDrawing(drawableAsset) ? "drawn" : "empty"}`}
            asset={drawableAsset}
            kind={kind}
            prompt={
              initial
                ? "Write your initials here"
                : signatureMode === "full"
                  ? "Write your full name here"
                  : `Write your ${signatureMode} name here`
            }
            drawingAccessibilityLabel={
              initial
                ? undefined
                : `${signatureMode === "full" ? "Full" : signatureMode === "first" ? "First" : "Last"} name signature drawing area. Draw with one finger.`
            }
            onChange={updateDrawing}
          />
        )}
      </LayoutSlot>
      <LayoutSlot
        id={`${layerPrefix}.redo`}
        style={[styles.redoSlot, compactPortrait && styles.compactRedoSlot]}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            initial
              ? "Clear and redraw initials"
              : signatureMode === "full"
                ? "Clear and redraw full signature"
                : `Clear and redraw ${signatureMode} name`
          }
          disabled={immutable || saving || !hasDrawing(drawableAsset)}
          onPress={confirmRedo}
          style={({ pressed }) => [
            styles.redo,
            pressed && styles.pressed,
            (immutable || saving || !hasDrawing(drawableAsset)) &&
              styles.disabled,
          ]}
        >
          <View style={styles.redoContent}>
            <LayoutSlot id={`${layerPrefix}.redo.icon`}>
              <RotateIcon />
            </LayoutSlot>
            <LayoutSlot id={`${layerPrefix}.redo.label`}>
              <Text style={styles.redoText}>Redo</Text>
            </LayoutSlot>
          </View>
        </Pressable>
      </LayoutSlot>
      {!initial && signatureMode === "full" ? (
        <SignatureModeOption
          eyebrow="Want More Room?"
          title="Sign First and Last Separately"
          detail="More room for each name. We’ll align them for you."
          onPress={() => {
            void hapticSelection();
            setSignatureMode("first");
            setMessage(null);
          }}
          disabled={immutable || saving}
          layoutId="signature.split-option"
          compact={compactPortrait}
        />
      ) : null}
      {!initial && signatureMode === "first" ? (
        <SignatureModeOption
          title="Use one full-name canvas"
          detail="Return to the original signing space."
          onPress={() => {
            void hapticSelection();
            setSignatureMode("full");
            setMessage(null);
          }}
          disabled={immutable || saving}
          layoutId="signature-first.full-option"
          compact={compactPortrait}
        />
      ) : null}
      {message ? (
        <LayoutSlot id={`${layerPrefix}.error`}>
          <Text accessibilityRole="alert" style={styles.error}>
            {message}
          </Text>
        </LayoutSlot>
      ) : null}
      <LayoutSlot
        id={`${layerPrefix}.actions`}
        style={[
          styles.actions,
          initial ? styles.initialActions : styles.signatureActions,
          compactPortrait && styles.compactActions,
        ]}
      >
        <FlowPrimaryButton
          label={primaryLabel}
          onPress={() => {
            void finishCapture();
          }}
          disabled={immutable || saving}
          loading={saving}
          layoutId={`${layerPrefix}.primary.button`}
          labelLayoutId={`${layerPrefix}.primary.label`}
        />
        {initial ? (
          <FlowTextButton
            label="Skip for Now"
            onPress={() => {
              if (returnTo || includedSlot) router.back();
              else router.push("/preview");
            }}
            disabled={immutable || saving}
            layoutId={`${layerPrefix}.skip.button`}
            labelLayoutId={`${layerPrefix}.skip.label`}
          />
        ) : null}
      </LayoutSlot>
      <OperationOverlay visible={saving} message={workingMessage} />
    </FlowScreen>
  );
}

function RotateIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 16 16">
      <Path
        d="M13 5.5V2.7l-1.4 1.4A5.3 5.3 0 1 0 13.1 10"
        fill="none"
        stroke={flowColors.white}
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 26,
    paddingTop: 26,
    paddingBottom: 18,
  },
  compactContent: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 8,
  },
  portraitFrame: {
    position: "absolute",
    left: 8,
    right: 8,
    top: 8,
    bottom: 8,
    overflow: "hidden",
    borderRadius: 42,
    borderCurve: "continuous",
    borderWidth: 1,
    borderColor: "rgba(216,182,106,0.58)",
    backgroundColor: flowColors.paper,
    boxShadow: "0 28px 58px rgba(0,0,0,0.55)",
  },
  portraitInk: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: 260,
    backgroundColor: flowColors.action,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    boxShadow: "0 20px 36px rgba(2,4,10,0.38)",
  },
  portraitPaper: {
    ...StyleSheet.absoluteFill,
    backgroundColor: flowColors.paper,
  },
  landscapeContent: {
    width: "100%",
    maxWidth: 1400,
    paddingHorizontal: 0,
    paddingTop: 0,
    paddingBottom: 0,
  },
  landscapeCanvas: {
    ...StyleSheet.absoluteFill,
    backgroundColor: flowColors.paper,
  },
  landscapeToolbar: {
    position: "absolute",
    left: 14,
    right: 14,
    top: 8,
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    zIndex: 5,
  },
  landscapeMode: {
    flex: 1,
    minHeight: 44,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 22,
    backgroundColor: "rgba(7,31,90,0.90)",
  },
  landscapeModeTitle: {
    color: flowColors.white,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "800",
    textAlign: "center",
  },
  landscapeRedo: {
    minWidth: 86,
    height: 44,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderRadius: 22,
    backgroundColor: "rgba(7,31,90,0.90)",
  },
  landscapeRedoText: {
    color: flowColors.white,
    fontSize: 14,
    lineHeight: 19,
    fontWeight: "700",
  },
  landscapeSave: {
    position: "absolute",
    right: 18,
    bottom: 14,
    width: 300,
    zIndex: 5,
  },
  landscapeError: {
    position: "absolute",
    left: 120,
    right: 334,
    bottom: 28,
    zIndex: 5,
    color: flowColors.destructive,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "700",
    textAlign: "center",
  },
  back: { position: "absolute", top: 24, left: 14, zIndex: 4 },
  header: { marginTop: 22, marginBottom: 6, zIndex: 2 },
  compactHeader: { marginTop: 18, marginBottom: 4 },
  script: { marginLeft: 48, marginBottom: 8 },
  compactPortraitScript: { width: 116, height: 42, marginBottom: 2 },
  heroTitle: { fontSize: 29, lineHeight: 34 },
  compactHeroTitle: { fontSize: 26, lineHeight: 31 },
  subtitle: { marginTop: 4, fontSize: 16, lineHeight: 22 },
  compactSubtitle: { marginTop: 2, fontSize: 14, lineHeight: 18 },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 5,
  },
  stepLabel: {
    color: flowColors.goldText,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "900",
    letterSpacing: 1.1,
  },
  progressTrack: { flexDirection: "row", gap: 5 },
  progressSegment: {
    width: 30,
    height: 3,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.24)",
  },
  progressActive: { backgroundColor: flowColors.goldText },
  rotate: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginTop: 8,
    marginBottom: 12,
  },
  compactRotate: { marginTop: 4, marginBottom: 7 },
  rotateText: {
    color: flowColors.bodyText,
    fontSize: 14,
    lineHeight: 19,
  },
  canvas: {
    minHeight: 190,
    borderRadius: 24,
    borderCurve: "continuous",
    backgroundColor: flowColors.paper,
    borderWidth: 1.5,
    borderColor: "rgba(216,182,106,0.72)",
    overflow: "hidden",
    boxShadow: "0 22px 48px rgba(2, 4, 10, 0.34)",
  },
  compactCanvas: { minHeight: 156, borderRadius: 20 },
  redoSlot: { alignItems: "flex-end" },
  compactRedoSlot: { height: 48 },
  redo: {
    minHeight: 40,
    marginTop: 10,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-end",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(216,182,106,0.54)",
    backgroundColor: flowColors.ink,
  },
  redoContent: { flexDirection: "row", alignItems: "center", gap: 6 },
  redoText: { color: flowColors.white, fontSize: 14, lineHeight: 20 },
  actions: { marginTop: "auto", paddingTop: 18, gap: 6 },
  compactActions: { paddingTop: 6, marginBottom: 0 },
  signatureActions: { marginBottom: 18 },
  initialActions: { marginBottom: 18 },
  error: {
    color: flowColors.destructive,
    fontSize: 15,
    lineHeight: 21,
    textAlign: "center",
    marginBottom: 6,
  },
  locked: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  lockedTitle: {
    color: flowColors.cardText,
    fontSize: 18,
    lineHeight: 23,
    fontWeight: "800",
    textAlign: "center",
  },
  lockedBody: {
    color: flowColors.cardMuted,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    marginTop: 8,
  },
  pressed: { opacity: 0.72 },
  disabled: { opacity: 0.42 },
});
