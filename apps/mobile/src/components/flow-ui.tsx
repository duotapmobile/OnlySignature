import type { PropsWithChildren, ReactNode } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type ImageStyle,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle, Path, Rect } from "react-native-svg";

export const flowColors = {
  night: "#020B12",
  ink: "#061721",
  inkRaised: "#0A2530",
  cyan: "#04B8D0",
  cyanText: "#42C9DA",
  white: "#F7FBFD",
  muted: "#AEBBC2",
  card: "#FBFBFB",
  cardText: "#111820",
  cardMuted: "#4C5B63",
  outline: "#71838D",
  accessibleLink: "#006B83",
} as const;

const brandSources = {
  wordmark: require("../../assets/brand/only-signature-wordmark.png"),
  sign: require("../../assets/brand/sign-label.png"),
  initial: require("../../assets/brand/initial-label.png"),
  review: require("../../assets/brand/review-label.png"),
  select: require("../../assets/brand/select-label.png"),
  before: require("../../assets/brand/before-label.png"),
} as const;

export type ScriptAsset = keyof Omit<typeof brandSources, "wordmark">;

export function FlowScreen({
  children,
  scroll = true,
  contentStyle,
  testID,
}: PropsWithChildren<{
  scroll?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
  testID?: string;
}>) {
  const content = (
    <View style={[styles.screenContent, contentStyle]}>{children}</View>
  );
  return (
    <SafeAreaView
      style={styles.safe}
      edges={["top", "right", "bottom", "left"]}
    >
      <View style={styles.background} />
      {scroll ? (
        <ScrollView
          testID={testID}
          contentInsetAdjustmentBehavior="automatic"
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {content}
        </ScrollView>
      ) : (
        <View testID={testID} style={styles.fill}>
          {content}
        </View>
      )}
    </SafeAreaView>
  );
}

export function Wordmark({
  accessibilityLabel = "Only Signature",
  style,
}: {
  accessibilityLabel?: string;
  style?: StyleProp<ImageStyle>;
}) {
  return (
    <Image
      source={brandSources.wordmark}
      accessibilityLabel={accessibilityLabel}
      resizeMode="contain"
      style={[styles.wordmark, style]}
    />
  );
}

export function ScriptLabel({
  asset,
  style,
}: {
  asset: ScriptAsset;
  style?: StyleProp<ImageStyle>;
}) {
  const labels: Record<ScriptAsset, string> = {
    sign: "Sign.",
    initial: "Initial.",
    review: "Review.",
    select: "Select.",
    before: "Before You Download",
  };
  return (
    <Image
      source={brandSources[asset]}
      accessibilityLabel={labels[asset]}
      resizeMode="contain"
      style={[
        styles.scriptLabel,
        asset === "sign" && styles.signLabel,
        asset === "initial" && styles.initialLabel,
        asset === "review" && styles.reviewLabel,
        asset === "select" && styles.selectLabel,
        asset === "before" && styles.beforeLabel,
        style,
      ]}
    />
  );
}

export function FlowHeading({ children }: PropsWithChildren) {
  return (
    <Text accessibilityRole="header" selectable style={styles.heading}>
      {children}
    </Text>
  );
}

export function FlowBody({
  children,
  style,
}: PropsWithChildren<{ style?: StyleProp<TextStyle> }>) {
  return (
    <Text selectable style={[styles.body, style]}>
      {children}
    </Text>
  );
}

export function FlowPrimaryButton({
  label,
  onPress,
  disabled = false,
  accessibilityHint,
  testID,
}: {
  label: string;
  onPress(): void;
  disabled?: boolean;
  accessibilityHint?: string;
  testID?: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      testID={testID}
      style={({ pressed }) => [
        styles.primaryButton,
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      <Text style={styles.primaryButtonText}>{label}</Text>
    </Pressable>
  );
}

export function FlowTextButton({
  label,
  onPress,
  disabled = false,
  testID,
}: {
  label: string;
  onPress(): void;
  disabled?: boolean;
  testID?: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      testID={testID}
      style={({ pressed }) => [
        styles.textButton,
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      <Text style={styles.textButtonText}>{label}</Text>
    </Pressable>
  );
}

export function FlowBackButton({ onPress }: { onPress(): void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Go back"
      hitSlop={8}
      onPress={onPress}
      style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
    >
      <Svg width={23} height={23} viewBox="0 0 24 24">
        <Path
          d="m15 5-7 7 7 7"
          fill="none"
          stroke={flowColors.white}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </Pressable>
  );
}

export function FlowSheet({
  children,
  label,
  style,
}: PropsWithChildren<{ label: string; style?: StyleProp<ViewStyle> }>) {
  return (
    <View
      accessibilityViewIsModal
      accessibilityLabel={label}
      style={[styles.sheet, style]}
    >
      <View accessibilityElementsHidden style={styles.handle} />
      <ScrollView
        contentContainerStyle={styles.sheetContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </View>
  );
}

export function EntryBackdrop() {
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={styles.backdrop}
    >
      <ScriptLabel asset="sign" />
      <FlowHeading>Without the sign-up.</FlowHeading>
      <FlowBody>Create your reusable signature + initials.</FlowBody>
    </View>
  );
}

export function PreviewCard({
  label,
  actionLabel,
  onAction,
  children,
}: PropsWithChildren<{
  label: string;
  actionLabel?: string;
  onAction?(): void;
}>) {
  return (
    <View style={styles.previewCard}>
      <Text selectable style={styles.previewLabel}>
        {label}
      </Text>
      {actionLabel && onAction ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${actionLabel} ${label.toLowerCase()}`}
          onPress={onAction}
          style={styles.previewAction}
        >
          <Text style={styles.previewActionText}>{actionLabel}</Text>
        </Pressable>
      ) : null}
      <View style={styles.previewContent}>{children}</View>
    </View>
  );
}

export type FeatureKind = "subscription" | "upload" | "account";

export function Feature({
  kind,
  children,
}: PropsWithChildren<{ kind: FeatureKind }>) {
  return (
    <View style={styles.feature}>
      <View style={styles.featureIcon}>{featureIcon(kind)}</View>
      <Text selectable style={styles.featureText}>
        {children}
      </Text>
    </View>
  );
}

function featureIcon(kind: FeatureKind): ReactNode {
  if (kind === "subscription") {
    return (
      <Svg width={36} height={36} viewBox="0 0 32 32">
        <Path
          d="M17 5v22M21 9c-1.2-1.1-2.7-1.7-4.5-1.7-2.7 0-4.7 1.5-4.7 3.8 0 5.8 9.4 2.7 9.4 8.4 0 2.7-2.1 4.4-5.1 4.4-2.1 0-3.9-.8-5.3-2.1M6 6l20 20"
          fill="none"
          stroke="#fff"
          strokeWidth={1.7}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    );
  }
  if (kind === "upload") {
    return (
      <Svg width={36} height={36} viewBox="0 0 32 32">
        <Path
          d="M7 3.5h12l6 6V28H7zM19 3.5v6h6M16 23V12M11.5 16.5 16 12l4.5 4.5"
          fill="none"
          stroke="#fff"
          strokeWidth={1.7}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    );
  }
  return (
    <Svg width={36} height={36} viewBox="0 0 32 32">
      <Circle
        cx={16}
        cy={10}
        r={5}
        fill="none"
        stroke="#fff"
        strokeWidth={1.7}
      />
      <Path
        d="M6.5 28c.8-7 4.2-10.5 9.5-10.5S24.7 21 25.5 28"
        fill="none"
        stroke="#fff"
        strokeWidth={1.7}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function LockLine({ children }: PropsWithChildren) {
  return (
    <View style={styles.lockLine}>
      <Svg width={18} height={18} viewBox="0 0 20 20">
        <Rect
          x={4}
          y={8}
          width={12}
          height={9}
          rx={1.5}
          fill="none"
          stroke={flowColors.cyan}
          strokeWidth={1.8}
        />
        <Path
          d="M6.5 8V5.7a3.5 3.5 0 0 1 7 0V8M10 11v3"
          fill="none"
          stroke={flowColors.cyan}
          strokeWidth={1.8}
        />
      </Svg>
      <Text selectable style={styles.lockText}>
        {children}
      </Text>
    </View>
  );
}

export function CheckMark() {
  return (
    <View accessible accessibilityLabel="Success" style={styles.checkMark}>
      <Svg width={29} height={29} viewBox="0 0 24 24">
        <Path
          d="m6 12 4 4 8-9"
          fill="none"
          stroke={flowColors.cyan}
          strokeWidth={2.1}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: flowColors.night },
  fill: { flex: 1 },
  background: { ...StyleSheet.absoluteFill, backgroundColor: flowColors.night },
  scroll: { flexGrow: 1 },
  screenContent: {
    flexGrow: 1,
    width: "100%",
    maxWidth: 480,
    alignSelf: "center",
    paddingHorizontal: 26,
    paddingTop: 24,
    paddingBottom: 20,
  },
  wordmark: { width: 230, height: 126, alignSelf: "center" },
  scriptLabel: { alignSelf: "flex-start" },
  signLabel: { width: 76, height: 56 },
  initialLabel: { width: 77, height: 34 },
  reviewLabel: { width: 66, height: 28 },
  selectLabel: { width: 72, height: 36 },
  beforeLabel: { width: 164, height: 28, alignSelf: "flex-start" },
  heading: {
    color: flowColors.white,
    fontSize: 27,
    lineHeight: 32,
    fontWeight: "800",
    letterSpacing: -0.45,
  },
  body: { color: "#E8EEF0", fontSize: 14, lineHeight: 20 },
  primaryButton: {
    width: "100%",
    minHeight: 56,
    paddingHorizontal: 20,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: flowColors.cyan,
    backgroundColor: "#06212B",
  },
  primaryButtonText: {
    color: flowColors.white,
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "700",
    textAlign: "center",
  },
  textButton: {
    width: "100%",
    minHeight: 44,
    paddingHorizontal: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  textButtonText: {
    color: flowColors.cyanText,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
    textAlign: "center",
  },
  pressed: { opacity: 0.76, transform: [{ scale: 0.99 }] },
  disabled: { opacity: 0.46 },
  backButton: {
    width: 44,
    height: 44,
    marginLeft: -12,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    maxHeight: "88%",
    paddingTop: 12,
    paddingBottom: 8,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: "#6D7E87",
    backgroundColor: flowColors.ink,
  },
  sheetContent: {
    flexGrow: 1,
    paddingHorizontal: 26,
    paddingBottom: 16,
  },
  handle: {
    width: 45,
    height: 4,
    borderRadius: 5,
    backgroundColor: "#9CA8AD",
    alignSelf: "center",
    marginBottom: 10,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    paddingHorizontal: 26,
    paddingTop: 46,
    opacity: 0.25,
  },
  previewCard: {
    minHeight: 96,
    borderRadius: 14,
    backgroundColor: flowColors.card,
    paddingHorizontal: 12,
    paddingTop: 10,
    marginBottom: 12,
  },
  previewLabel: { color: flowColors.cardText, fontSize: 12, lineHeight: 15 },
  previewAction: {
    position: "absolute",
    right: 4,
    top: 0,
    minWidth: 54,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  previewActionText: {
    color: flowColors.accessibleLink,
    fontSize: 12,
    fontWeight: "700",
  },
  previewContent: {
    flex: 1,
    minHeight: 54,
    justifyContent: "center",
    alignItems: "center",
  },
  feature: { flex: 1, minWidth: 0, alignItems: "center" },
  featureIcon: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 1.25,
    borderColor: flowColors.cyan,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  featureText: {
    color: flowColors.white,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "500",
    textAlign: "center",
  },
  lockLine: {
    minHeight: 44,
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  lockText: { color: "#C7D1D5", fontSize: 12, lineHeight: 17 },
  checkMark: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: flowColors.cyan,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
  },
});
