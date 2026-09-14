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

  const finishCapture = async () => {
    if (!hasDrawing(drawableAsset)) {
      setMessage(
        initial
          ? "Add your initials or skip for now."
          : signatureMode === "full"
            ? "Sign your full name before continuing."
            : `Sign your ${signatureMode} name before continuing.`,
      );
      return;
    }
    setMessage(null);
    if (!initial && signatureMode === "first") {
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

  return (
    <FlowScreen
      scroll={false}
      contentStyle={[styles.content, landscape && styles.landscapeContent]}
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
      <View style={[styles.back, landscape && styles.landscapeBack]}>
        <FlowBackButton
          onPress={goBack}
          layoutId={`${layerPrefix}.back.icon`}
        />
      </View>
      <LayoutSlot
        id={`${layerPrefix}.header`}
        style={[styles.header, landscape && styles.landscapeHeader]}
      >
        {landscape ? null : (
          <ScriptLabel
            asset={initial ? "initial" : "sign"}
            style={styles.script}
            layoutId={`${layerPrefix}.script`}
          />
        )}
        <FlowHeading
          style={[styles.heroTitle, landscape && styles.landscapeTitle]}
          layoutId={`${layerPrefix}.title`}
        >
          {initial
            ? "Add your initials"
            : signatureMode === "full"
              ? "Add your signature"
              : `Add your ${signatureMode} name`}
        </FlowHeading>
        {!initial && signatureMode !== "full" ? (
          <LayoutSlot id={`${layerPrefix}.step`}>
            <Text selectable style={styles.stepPill}>
              {signatureMode === "first" ? "Step 1 of 2" : "Step 2 of 2"}
            </Text>
          </LayoutSlot>
        ) : null}
        {landscape ? (
          <Text selectable style={styles.landscapeInstruction}>
            Fine ink follows the center of your fingertip across the canvas.
          </Text>
        ) : (
          <>
            <FlowBody
              style={styles.subtitle}
              layoutId={`${layerPrefix}.subtitle`}
            >
              {initial
                ? "Write your initials in the space below."
                : signatureMode === "full"
                  ? "Sign your full name on the line below."
                  : signatureMode === "first"
                    ? "Sign only your first name. We’ll join it to your last name next."
                    : "Sign only your last name. We’ll align and join both parts for you."}
            </FlowBody>
            <View style={styles.rotate}>
              <LayoutSlot id={`${layerPrefix}.rotate.icon`}>
                <RotateIcon />
              </LayoutSlot>
              <LayoutSlot id={`${layerPrefix}.rotate.label`}>
                <Text selectable style={styles.rotateText}>
                  Rotate for more room
                </Text>
              </LayoutSlot>
            </View>
          </>
        )}
      </LayoutSlot>
      <LayoutSlot
        id={`${layerPrefix}.canvas`}
        style={[
          styles.canvas,
          landscape
            ? {
                height: Math.min(230, Math.max(190, windowHeight - 195)),
              }
            : {
                height: Math.min(250, Math.max(190, windowHeight * 0.26)),
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
                ? "Initial here"
                : signatureMode === "full"
                  ? "Sign your full name here"
                  : `Sign your ${signatureMode} name here`
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
      <LayoutSlot id={`${layerPrefix}.redo`} style={styles.redoSlot}>
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
          landscape && styles.landscapeActions,
          initial ? styles.initialActions : styles.signatureActions,
        ]}
      >
        <FlowPrimaryButton
          label={
            initial
              ? "Save Initials"
              : signatureMode === "full"
                ? "Save Signature"
                : signatureMode === "first"
                  ? "Save First Name"
                  : "Save Last Name and Join"
          }
          onPress={() => {
            void finishCapture();
          }}
          disabled={immutable || saving}
          layoutId={`${layerPrefix}.primary.button`}
          labelLayoutId={`${layerPrefix}.primary.label`}
        />
        {!initial && signatureMode === "full" ? (
          <FlowTextButton
            label="Sign First and Last Separately"
            onPress={() => {
              setSignatureMode("first");
              setMessage(null);
            }}
            disabled={immutable || saving}
            layoutId="signature.split.button"
            labelLayoutId="signature.split.label"
          />
        ) : null}
        {!initial && signatureMode === "first" ? (
          <FlowTextButton
            label="Sign Full Name Instead"
            onPress={() => {
              setSignatureMode("full");
              setMessage(null);
            }}
            disabled={immutable || saving}
            layoutId="signature-first.full.button"
            labelLayoutId="signature-first.full.label"
          />
        ) : null}
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
  content: { paddingHorizontal: 12, paddingTop: 32, paddingBottom: 24 },
  landscapeContent: {
    maxWidth: 1100,
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 14,
  },
  back: { position: "absolute", top: 24, left: 14, zIndex: 4 },
  landscapeBack: { top: 2, left: 24 },
  header: { marginTop: 36, marginBottom: 16 },
  landscapeHeader: {
    minHeight: 44,
    marginTop: 0,
    marginBottom: 8,
    paddingLeft: 48,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  script: { width: 152, height: 72, marginLeft: 6, marginBottom: -12 },
  compactScript: {
    width: 154,
    height: 60,
    marginTop: 22,
    marginLeft: 18,
    marginBottom: -10,
  },
  heroTitle: { fontSize: 32, lineHeight: 38 },
  landscapeTitle: { fontSize: 24, lineHeight: 30 },
  landscapeInstruction: {
    flex: 1,
    color: "#E5ECEF",
    fontSize: 14,
    lineHeight: 20,
  },
  subtitle: { marginTop: 6, fontSize: 17, lineHeight: 24 },
  stepPill: {
    alignSelf: "flex-start",
    color: "#071F5A",
    backgroundColor: "#FFE2A0",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "800",
    marginTop: 7,
  },
  rotate: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginTop: 12,
    marginBottom: 22,
  },
  rotateText: { color: "#E5ECEF", fontSize: 15, lineHeight: 21 },
  canvas: {
    minHeight: 190,
    borderRadius: 18,
    backgroundColor: "#F7F7F7",
    borderWidth: 1,
    borderColor: "rgba(216,182,106,0.72)",
    overflow: "hidden",
    boxShadow: "0 18px 38px rgba(0, 38, 43, 0.38)",
  },
  redoSlot: { alignItems: "center" },
  redo: {
    minHeight: 40,
    marginTop: 12,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },
  redoContent: { flexDirection: "row", alignItems: "center", gap: 6 },
  redoText: { color: flowColors.white, fontSize: 14, lineHeight: 20 },
  actions: { marginTop: "auto", paddingTop: 28, gap: 6 },
  landscapeActions: { paddingTop: 4 },
  signatureActions: { marginBottom: 18 },
  initialActions: { marginBottom: 18 },
  error: {
    color: "#FFD8D2",
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
