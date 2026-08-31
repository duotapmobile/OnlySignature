import { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import Svg, { Path } from "react-native-svg";
import { SignatureCanvas } from "@/components/SignatureCanvas";
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
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const kind = data.selectedAsset;
  const initial = kind === "initials";
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
        <FlowBackButton onPress={goBack} />
      </View>
      <View style={styles.header}>
        <ScriptLabel
          asset={initial ? "initial" : "sign"}
          style={initial ? styles.compactScript : undefined}
        />
        <FlowHeading>
          {initial ? "Add your initials" : "Add your signature"}
        </FlowHeading>
        <FlowBody>
          {initial ? "Write your initials" : "Sign"} in the space below.
        </FlowBody>
        <View style={styles.rotate}>
          <RotateIcon />
          <Text selectable style={styles.rotateText}>
            Rotate for more room
          </Text>
        </View>
      </View>
      <View style={styles.canvas}>
        {immutable ? (
          <View style={styles.locked}>
            <Text style={styles.lockedTitle}>
              This saved drawing stays unchanged.
            </Text>
            <Text style={styles.lockedBody}>
              Duplicate the set from My Signing Sets to make a changed version.
            </Text>
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
      </View>
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
          <RotateIcon />
          <Text style={styles.redoText}>Redo</Text>
        </View>
      </Pressable>
      {message ? (
        <Text accessibilityRole="alert" style={styles.error}>
          {message}
        </Text>
      ) : null}
      <View style={styles.actions}>
        <FlowPrimaryButton
          label={initial ? "Save Initials" : "Save Signature"}
          onPress={() => {
            void finishCapture();
          }}
          disabled={immutable || saving}
        />
        {initial ? (
          <FlowTextButton
            label="Skip for Now"
            onPress={() => {
              if (returnTo || includedSlot) router.back();
              else router.push("/preview");
            }}
            disabled={immutable || saving}
          />
        ) : null}
      </View>
    </FlowScreen>
  );
}

function RotateIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 16 16" accessibilityElementsHidden>
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
  content: { paddingTop: 28 },
  back: { position: "absolute", top: 28, left: 27, zIndex: 4 },
  header: { marginTop: -1 },
  compactScript: { width: 92, height: 30, marginBottom: 2 },
  rotate: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 6,
    marginBottom: 22,
  },
  rotateText: { color: "#E5ECEF", fontSize: 12, lineHeight: 18 },
  canvas: {
    height: 230,
    borderRadius: 16,
    backgroundColor: "#F7F7F7",
    overflow: "hidden",
  },
  redo: {
    minHeight: 44,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },
  redoContent: { flexDirection: "row", alignItems: "center", gap: 6 },
  redoText: { color: flowColors.white, fontSize: 12, lineHeight: 18 },
  actions: { marginTop: 2 },
  error: {
    color: "#FFD8D2",
    fontSize: 13,
    lineHeight: 18,
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
