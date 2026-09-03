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
import { LayoutSlot } from "@/components/layout-slot";

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
  tone = "dark",
}: PropsWithChildren<{
  scroll?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
  testID?: string;
  tone?: "dark" | "light";
}>) {
  const light = tone === "light";
  const content = (
    <View style={[styles.screenContent, contentStyle]}>{children}</View>
  );
  return (
    <SafeAreaView
      style={[styles.safe, light && styles.lightSafe]}
      edges={["top", "right", "bottom", "left"]}
    >
      <View style={[styles.background, light && styles.lightBackground]}>
        {light ? null : (
          <>
            <View style={styles.depthGlowTop} />
            <View style={styles.depthGlowBottom} />
          </>
        )}
      </View>
      {scroll ? (
        <ScrollView
          style={styles.screenScroll}
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
  layoutId,
}: {
  asset: ScriptAsset;
  style?: StyleProp<ImageStyle>;
  layoutId?: string;
}) {
  const labels: Record<ScriptAsset, string> = {
    sign: "Sign.",
    initial: "Initial.",
    review: "Review.",
    select: "Select.",
    before: "Before You Download",
  };
  const image = (
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
  return layoutId ? <LayoutSlot id={layoutId}>{image}</LayoutSlot> : image;
}

export function FlowHeading({
  children,
  layoutId,
  style,
}: PropsWithChildren<{
  layoutId?: string;
  style?: StyleProp<TextStyle>;
}>) {
  const heading = (
    <Text accessibilityRole="header" selectable style={[styles.heading, style]}>
      {children}
    </Text>
  );
  return layoutId ? <LayoutSlot id={layoutId}>{heading}</LayoutSlot> : heading;
}

export function FlowBody({
  children,
  style,
  layoutId,
}: PropsWithChildren<{
  style?: StyleProp<TextStyle>;
  layoutId?: string;
}>) {
  const body = (
    <Text selectable style={[styles.body, style]}>
      {children}
    </Text>
  );
  return layoutId ? <LayoutSlot id={layoutId}>{body}</LayoutSlot> : body;
}

export function FlowPrimaryButton({
  label,
  onPress,
  disabled = false,
  accessibilityHint,
  testID,
  layoutId,
  labelLayoutId,
  labelStyle,
}: {
  label: string;
  onPress(): void;
  disabled?: boolean;
  accessibilityHint?: string;
  testID?: string;
  layoutId?: string;
  labelLayoutId?: string;
  labelStyle?: StyleProp<TextStyle>;
}) {
  const labelNode = (
    <Text
      adjustsFontSizeToFit
      minimumFontScale={0.6}
      numberOfLines={1}
      style={[
        styles.primaryButtonText,
        label.length > 24 && { transform: [{ scaleX: 0.91 }] },
        labelStyle,
      ]}
    >
      {label}
    </Text>
  );
  const button = (
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
      {labelLayoutId ? (
        <LayoutSlot id={labelLayoutId}>{labelNode}</LayoutSlot>
      ) : (
        labelNode
      )}
    </Pressable>
  );
  return layoutId ? <LayoutSlot id={layoutId}>{button}</LayoutSlot> : button;
}

export function FlowTextButton({
  label,
  onPress,
  disabled = false,
  testID,
  layoutId,
  labelLayoutId,
}: {
  label: string;
  onPress(): void;
  disabled?: boolean;
  testID?: string;
  layoutId?: string;
  labelLayoutId?: string;
}) {
  const labelNode = <Text style={styles.textButtonText}>{label}</Text>;
  const button = (
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
      {labelLayoutId ? (
        <LayoutSlot id={labelLayoutId}>{labelNode}</LayoutSlot>
      ) : (
        labelNode
      )}
    </Pressable>
  );
  return layoutId ? <LayoutSlot id={layoutId}>{button}</LayoutSlot> : button;
}

export function FlowBackButton({
  onPress,
  layoutId,
}: {
  onPress(): void;
  layoutId?: string;
}) {
  const button = (
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
  return layoutId ? <LayoutSlot id={layoutId}>{button}</LayoutSlot> : button;
}

export function FlowSheet({
  children,
  label,
  style,
  layoutId,
  handleLayoutId,
}: PropsWithChildren<{
  label: string;
  style?: StyleProp<ViewStyle>;
  layoutId?: string;
  handleLayoutId?: string;
}>) {
  const handle = <View accessibilityElementsHidden style={styles.handle} />;
  const content = (
    <>
      {handleLayoutId ? (
        <LayoutSlot id={handleLayoutId}>{handle}</LayoutSlot>
      ) : (
        handle
      )}
      <ScrollView
        style={styles.sheetScroll}
        contentContainerStyle={styles.sheetContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </>
  );
  return layoutId ? (
    <LayoutSlot
      id={layoutId}
      accessibilityViewIsModal
      accessibilityLabel={label}
      style={[styles.sheet, style]}
    >
      {content}
    </LayoutSlot>
  ) : (
    <View
      accessibilityViewIsModal
      accessibilityLabel={label}
      style={[styles.sheet, style]}
    >
      {content}
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

export function ReviewBackdrop() {
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={styles.backdrop}
    >
      <ScriptLabel asset="review" />
      <FlowHeading>Confirm Your Signing Set</FlowHeading>
      <FlowBody>Check carefully before choosing a background.</FlowBody>
      <View style={styles.backdropCard} />
      <View style={styles.backdropCard} />
    </View>
  );
}

export function CaptureBackdrop({ initial = false }: { initial?: boolean }) {
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={styles.backdrop}
    >
      <ScriptLabel asset={initial ? "initial" : "sign"} />
      <FlowHeading>
        {initial ? "Add your initials" : "Add your signature"}
      </FlowHeading>
      <FlowBody>Write in the space below.</FlowBody>
      <View style={styles.backdropCanvas} />
    </View>
  );
}

export function PreviewCard({
  label,
  actionLabel,
  onAction,
  children,
  labelLayoutId,
  actionLayoutId,
  contentLayoutId,
}: PropsWithChildren<{
  label: string;
  actionLabel?: string;
  onAction?(): void;
  labelLayoutId?: string;
  actionLayoutId?: string;
  contentLayoutId?: string;
}>) {
  const labelNode = (
    <Text selectable style={styles.previewLabel}>
      {label}
    </Text>
  );
  const actionNode =
    actionLabel && onAction ? (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${actionLabel} ${label.toLowerCase()}`}
        onPress={onAction}
        style={styles.previewAction}
      >
        <Text style={styles.previewActionText}>{actionLabel}</Text>
      </Pressable>
    ) : null;
  const contentNode = <View style={styles.previewContent}>{children}</View>;
  return (
    <View style={styles.previewCard}>
      {labelLayoutId ? (
        <LayoutSlot id={labelLayoutId}>{labelNode}</LayoutSlot>
      ) : (
        labelNode
      )}
      {actionNode && actionLayoutId ? (
        <LayoutSlot id={actionLayoutId}>{actionNode}</LayoutSlot>
      ) : (
        actionNode
      )}
      {contentLayoutId ? (
        <LayoutSlot id={contentLayoutId}>{contentNode}</LayoutSlot>
      ) : (
        contentNode
      )}
    </View>
  );
}

export type FeatureKind = "subscription" | "upload" | "account";

export function Feature({
  kind,
  children,
  iconLayoutId,
  labelLayoutId,
}: PropsWithChildren<{
  kind: FeatureKind;
  iconLayoutId?: string;
  labelLayoutId?: string;
}>) {
  const icon = <View style={styles.featureIcon}>{featureIcon(kind)}</View>;
  const label = (
    <Text selectable style={styles.featureText}>
      {children}
    </Text>
  );
  return (
    <View style={styles.feature}>
      {iconLayoutId ? <LayoutSlot id={iconLayoutId}>{icon}</LayoutSlot> : icon}
      {labelLayoutId ? (
        <LayoutSlot id={labelLayoutId}>{label}</LayoutSlot>
      ) : (
        label
      )}
    </View>
  );
}

function featureIcon(kind: FeatureKind): ReactNode {
  if (kind === "subscription") {
    return (
      <Svg width={40} height={40} viewBox="0 0 32 32">
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
      <Svg width={40} height={40} viewBox="0 0 32 32">
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
    <Svg width={40} height={40} viewBox="0 0 32 32">
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

export function LockLine({
  children,
  iconLayoutId,
  textLayoutId,
}: PropsWithChildren<{
  iconLayoutId?: string;
  textLayoutId?: string;
}>) {
  const icon = (
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
  );
  const text = (
    <Text selectable style={styles.lockText}>
      {children}
    </Text>
  );
  return (
    <View style={styles.lockLine}>
      {iconLayoutId ? <LayoutSlot id={iconLayoutId}>{icon}</LayoutSlot> : icon}
      {textLayoutId ? <LayoutSlot id={textLayoutId}>{text}</LayoutSlot> : text}
    </View>
  );
}

export function CheckMark({ layoutId }: { layoutId?: string } = {}) {
  const mark = (
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
  return layoutId ? <LayoutSlot id={layoutId}>{mark}</LayoutSlot> : mark;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: flowColors.night },
  lightSafe: { backgroundColor: "#FAF9F7" },
  fill: { flex: 1 },
  background: {
    ...StyleSheet.absoluteFill,
    backgroundColor: flowColors.night,
    overflow: "hidden",
  },
  lightBackground: { backgroundColor: "#FAF9F7" },
  depthGlowTop: {
    position: "absolute",
    width: 520,
    height: 520,
    borderRadius: 260,
    top: -250,
    right: -285,
    backgroundColor: "rgba(18, 87, 108, 0.24)",
  },
  depthGlowBottom: {
    position: "absolute",
    width: 560,
    height: 560,
    borderRadius: 280,
    bottom: -330,
    left: -290,
    backgroundColor: "rgba(0, 146, 176, 0.12)",
  },
  screenScroll: { flex: 1 },
  sheetScroll: { flex: 1 },
  scroll: { flexGrow: 1 },
  screenContent: {
    flexGrow: 1,
    width: "100%",
    maxWidth: 480,
    alignSelf: "center",
    paddingHorizontal: 26,
    paddingTop: 24,
    paddingBottom: 28,
  },
  wordmark: { width: 244, height: 134, alignSelf: "center" },
  scriptLabel: { alignSelf: "flex-start" },
  signLabel: { width: 152, height: 108 },
  initialLabel: { width: 154, height: 60 },
  reviewLabel: { width: 148, height: 60 },
  selectLabel: { width: 122, height: 60 },
  beforeLabel: { width: 250, height: 43, alignSelf: "flex-start" },
  heading: {
    color: flowColors.white,
    fontSize: 30,
    lineHeight: 36,
    fontWeight: "800",
    letterSpacing: -0.55,
  },
  body: { color: "#E8EEF0", fontSize: 22, lineHeight: 31 },
  primaryButton: {
    width: "100%",
    minHeight: 59,
    paddingHorizontal: 20,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: flowColors.cyan,
    backgroundColor: "#062A36",
    boxShadow:
      "0 12px 30px rgba(0, 0, 0, 0.32), inset 0 1px 0 rgba(255,255,255,0.08)",
  },
  primaryButtonText: {
    color: flowColors.white,
    fontSize: 17,
    lineHeight: 23,
    fontWeight: "700",
    textAlign: "center",
  },
  primaryButtonTextCompact: { fontSize: 22, lineHeight: 29 },
  textButton: {
    width: "100%",
    minHeight: 44,
    paddingHorizontal: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  textButtonText: {
    color: flowColors.cyanText,
    fontSize: 15,
    lineHeight: 21,
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
    borderColor: "#62808C",
    backgroundColor: "#061A24",
    boxShadow:
      "0 -22px 54px rgba(0, 0, 0, 0.5), 0 -1px 0 rgba(4, 184, 208, 0.28)",
  },
  sheetContent: {
    flexGrow: 1,
    paddingHorizontal: 30,
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
  backdropCard: {
    minHeight: 96,
    borderRadius: 14,
    backgroundColor: flowColors.card,
    marginTop: 12,
  },
  backdropCanvas: {
    height: 230,
    borderRadius: 14,
    backgroundColor: flowColors.card,
    marginTop: 18,
  },
  previewCard: {
    minHeight: 132,
    borderRadius: 18,
    backgroundColor: flowColors.card,
    paddingHorizontal: 16,
    paddingTop: 14,
    marginBottom: 18,
    boxShadow: "0 16px 34px rgba(0, 0, 0, 0.3)",
  },
  previewLabel: {
    color: flowColors.cardText,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "600",
  },
  previewAction: {
    position: "absolute",
    right: 6,
    top: 2,
    minWidth: 60,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  previewActionText: {
    color: flowColors.accessibleLink,
    fontSize: 14,
    fontWeight: "700",
  },
  previewContent: {
    flex: 1,
    minHeight: 82,
    justifyContent: "center",
    alignItems: "center",
  },
  feature: { flex: 1, minWidth: 0, alignItems: "center" },
  featureIcon: {
    width: 66,
    height: 66,
    borderRadius: 33,
    borderWidth: 1.25,
    borderColor: flowColors.cyan,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    boxShadow: "0 10px 22px rgba(0, 0, 0, 0.28)",
  },
  featureText: {
    color: flowColors.white,
    fontSize: 14,
    lineHeight: 19,
    fontWeight: "600",
    textAlign: "center",
  },
  lockLine: {
    minHeight: 44,
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  lockText: { color: "#C7D1D5", fontSize: 14, lineHeight: 20 },
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
