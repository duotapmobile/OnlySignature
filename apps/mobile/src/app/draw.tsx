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
import { createEmptyAsset, hasDrawing } from "@/domain/models";
import { useAppState } from "@/state/AppStateProvider";

type ReturnTarget = "review" | "saved" | "export";

export default function CaptureScreen() {
  const { returnTo } = useLocalSearchParams<{ returnTo?: ReturnTarget }>();
  const {
    activeSet,
    data,
    setSelectedAsset,
    updateAsset,
    clearAsset,
    fillIncludedSlot,
  } = useAppState();
  const { height: windowHeight } = useWindowDimensions();
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const kind = data.selectedAsset;
  const initial = kind === "initials";
  const layerPrefix = initial ? "initials" : "signature";
  const asset = activeSet[kind];
  const drawableAsset = asset ?? createEmptyAsset(kind);
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
          : "Add your signature before continuing.",
      );
      return;
    }
    setMessage(null);
    if (includedSlot) {
      setSaving(true);
      try {
        await fillIncludedSlot(kind, drawableAsset);
      } catch {
        setMessage(
          "This included drawing could not be finalized. Your saved set is unchanged.",
        );
        setSaving(false);
        return;
      }
      setSaving(false);
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
    if (returnTo || includedSlot) router.back();
    else if (initial) setSelectedAsset("signature");
    else router.back();
  };

  const confirmRedo = () => {
    if (!hasDrawing(drawableAsset)) return;
    Alert.alert(
      initial ? "Redo these initials?" : "Redo this signature?",
      "The drawing on this screen will be cleared.",
      [
        { text: "Keep Drawing", style: "cancel" },
        { text: "Redo", style: "destructive", onPress: () => clearAsset(kind) },
      ],
    );
  };

  return (
    <FlowScreen
      contentStyle={styles.content}
      testID={initial ? "initials-capture-screen" : "signature-capture-screen"}
    >
      <View style={styles.back}>
        <FlowBackButton
          onPress={goBack}
          layoutId={`${layerPrefix}.back.icon`}
        />
      </View>
      <LayoutSlot id={`${layerPrefix}.header`} style={styles.header}>
        <ScriptLabel
          asset={initial ? "initial" : "sign"}
          style={styles.script}
          layoutId={`${layerPrefix}.script`}
        />
        <FlowHeading style={styles.heroTitle} layoutId={`${layerPrefix}.title`}>
          {initial ? "Add your initials" : "Add your signature"}
        </FlowHeading>
        <FlowBody style={styles.subtitle} layoutId={`${layerPrefix}.subtitle`}>
          {initial ? "Write your initials" : "Sign"} in the space below.
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
      </LayoutSlot>
      <LayoutSlot
        id={`${layerPrefix}.canvas`}
        style={[
          styles.canvas,
          { height: Math.min(440, Math.max(360, windowHeight * 0.4)) },
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
            key={`${kind}-${hasDrawing(drawableAsset) ? "drawn" : "empty"}`}
            asset={drawableAsset}
            kind={kind}
            onChange={(strokes, width, height, orientation) =>
              updateAsset(kind, strokes, width, height, orientation)
            }
          />
        )}
      </LayoutSlot>
      <LayoutSlot id={`${layerPrefix}.redo`} style={styles.redoSlot}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            initial ? "Clear and redraw initials" : "Clear and redraw signature"
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
          initial ? styles.initialActions : styles.signatureActions,
        ]}
      >
        <FlowPrimaryButton
          label={initial ? "Save Initials" : "Save Signature"}
          onPress={() => {
            void finishCapture();
          }}
          disabled={immutable || saving}
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
  content: { paddingTop: 32, paddingBottom: 30 },
  back: { position: "absolute", top: 24, left: 20, zIndex: 4 },
  header: { marginTop: 36, marginBottom: 24 },
  script: { width: 152, height: 108, marginLeft: 6, marginBottom: -34 },
  compactScript: {
    width: 154,
    height: 60,
    marginTop: 22,
    marginLeft: 18,
    marginBottom: -10,
  },
  heroTitle: { fontSize: 32, lineHeight: 38 },
  subtitle: { marginTop: 51, fontSize: 17, lineHeight: 24 },
  rotate: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginTop: 12,
    marginBottom: 22,
  },
  rotateText: { color: "#E5ECEF", fontSize: 15, lineHeight: 21 },
  canvas: {
    minHeight: 360,
    borderRadius: 18,
    backgroundColor: "#F7F7F7",
    overflow: "hidden",
    boxShadow: "0 18px 38px rgba(0, 0, 0, 0.36)",
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
  signatureActions: { marginBottom: 72 },
  initialActions: { marginBottom: 26 },
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
