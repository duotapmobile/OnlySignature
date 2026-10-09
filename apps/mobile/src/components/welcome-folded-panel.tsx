import { StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { LayoutSlot } from "@/components/layout-slot";
import { PaperSurface } from "@/components/paper-ui";
import { Wordmark, flowShadows } from "@/components/flow-ui";
import { SampleDrawing } from "./SampleDrawing";
import { screenshotFixtureSet } from "@/domain/fixtures";
import { FocusPressable as Pressable } from "./FocusPressable";

const benefits = [
  {
    label: "No Account",
    iconLayoutId: "entry.account.icon",
    labelLayoutId: "entry.account.label",
  },
  {
    label: "No Subscription",
    iconLayoutId: "entry.subscription.icon",
    labelLayoutId: "entry.subscription.label",
  },
  {
    label: "No Document Upload",
    iconLayoutId: "entry.upload.icon",
    labelLayoutId: "entry.upload.label",
  },
] as const;

export function WelcomeFoldedPanel({
  disabled,
  onBegin,
  onOpenSaved,
}: {
  disabled: boolean;
  onBegin(): void;
  onOpenSaved(): void;
}) {
  const { width, height, fontScale } = useWindowDimensions();
  const largeType = fontScale > 1.15;
  const landscape = width > height;
  const compact = height < 740 || width < 370;
  const tablet = width >= 768;
  const inkHeight = compact
    ? Math.min(292, Math.max(270, height * 0.41))
    : Math.min(350, Math.max(324, height * 0.38));
  return (
    <View
      style={[
        styles.shell,
        compact && styles.compactShell,
        tablet && !largeType && styles.tabletShell,
        landscape && !largeType && styles.landscapeShell,
        largeType && styles.intrinsicLayout,
      ]}
    >
      <View pointerEvents="none" style={styles.rearPlate} />
      <View
        style={[
          styles.deviceFrame,
          landscape && styles.landscapeFrame,
          largeType && styles.intrinsicLayout,
        ]}
      >
        <View
          style={[
            styles.inkPanel,
            { height: landscape ? "100%" : inkHeight },
            compact && styles.compactInkPanel,
            largeType && { height: "auto", minHeight: inkHeight },
            landscape && styles.landscapeInkPanel,
          ]}
        >
          <View pointerEvents="none" style={styles.topEdgeHighlight} />
          <View style={styles.wordmarkStack}>
            <Wordmark style={styles.wordmark} />
          </View>

          <View style={[styles.copy, compact && styles.compactCopy]}>
            <LayoutSlot id="entry.sign">
              <Text
                accessibilityRole="header"
                selectable
                style={[styles.sign, compact && styles.compactSign]}
              >
                Sign.
              </Text>
            </LayoutSlot>
            <LayoutSlot id="entry.title">
              <Text
                adjustsFontSizeToFit={!largeType}
                minimumFontScale={0.88}
                numberOfLines={largeType ? undefined : 1}
                selectable
                style={[styles.title, compact && styles.compactTitle]}
              >
                Without the sign-up.
              </Text>
            </LayoutSlot>
            <LayoutSlot id="entry.subtitle">
              <Text
                adjustsFontSizeToFit={!largeType}
                minimumFontScale={0.9}
                numberOfLines={largeType ? undefined : 1}
                selectable
                style={[styles.subtitle, compact && styles.compactSubtitle]}
              >
                Create your signature and initials.
              </Text>
            </LayoutSlot>
          </View>

          <View
            accessibilityLabel="Sample signature"
            style={[
              styles.signatureTicket,
              compact && styles.compactSignatureTicket,
            ]}
          >
            <View pointerEvents="none" style={styles.ticketBaseline} />
            <SampleDrawing
              asset={screenshotFixtureSet.signature!}
              accessibilityLabel="Sample signature"
              align="baseline"
              baselineRatio={0.7}
              style={[
                styles.sampleSignature,
                compact && styles.compactSampleSignature,
              ]}
            />
          </View>
          <View pointerEvents="none" style={styles.signatureMotif}>
            <View style={styles.signatureDot} />
            <View style={styles.signatureLine} />
          </View>
        </View>

        <PaperSurface
          style={[
            styles.whitePanel,
            compact && styles.compactWhitePanel,
            landscape && styles.landscapeWhitePanel,
            largeType && styles.intrinsicLayout,
          ]}
        >
          <View
            pointerEvents="none"
            style={[styles.paperLip, landscape && styles.hiddenLip]}
          >
            <View style={styles.paperLipHighlight} />
          </View>
          <LayoutSlot
            id="entry.features"
            style={[
              styles.benefits,
              compact && styles.compactBenefits,
              landscape && styles.landscapeBenefits,
              largeType && styles.intrinsicLayout,
            ]}
            accessibilityLabel="Privacy benefits"
          >
            <Text selectable style={styles.benefitsEyebrow}>
              SIMPLE BY DESIGN
            </Text>
            {benefits.map((benefit) => (
              <View
                key={benefit.label}
                style={[styles.benefitRow, compact && styles.compactBenefitRow]}
              >
                <LayoutSlot id={benefit.iconLayoutId}>
                  <View style={styles.checkCircle}>
                    <Text selectable style={styles.checkMark}>
                      ✓
                    </Text>
                  </View>
                </LayoutSlot>
                <LayoutSlot
                  id={benefit.labelLayoutId}
                  style={styles.benefitLabelSlot}
                >
                  <Text
                    selectable
                    style={[
                      styles.benefitLabel,
                      compact && styles.compactBenefitLabel,
                    ]}
                  >
                    {benefit.label}
                  </Text>
                </LayoutSlot>
              </View>
            ))}

            <View style={styles.privacyLine}>
              <LayoutSlot id="entry.privacy.icon">
                <Text selectable style={styles.lock}>
                  ●
                </Text>
              </LayoutSlot>
              <LayoutSlot id="entry.privacy.label" style={styles.privacyLabel}>
                <Text selectable style={styles.privacyText}>
                  Saved privately on your device.
                </Text>
              </LayoutSlot>
            </View>
          </LayoutSlot>

          <LayoutSlot id="entry.actions" style={styles.actions}>
            <LayoutSlot id="entry.create.button">
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Create My FREE Signing Set"
                accessibilityHint="Opens the signature drawing screen"
                accessibilityState={{ disabled }}
                disabled={disabled}
                onPress={onBegin}
                testID="create-signing-set"
                style={({ pressed }) => [
                  styles.primaryButton,
                  pressed && styles.primaryPressed,
                  disabled && styles.buttonDisabled,
                ]}
              >
                <LayoutSlot
                  id="entry.create.label"
                  style={styles.primaryLabelSlot}
                >
                  <Text
                    adjustsFontSizeToFit={!largeType}
                    minimumFontScale={0.82}
                    numberOfLines={largeType ? undefined : 1}
                    selectable
                    style={styles.primaryLabel}
                  >
                    Create My FREE Signing Set
                  </Text>
                </LayoutSlot>
              </Pressable>
            </LayoutSlot>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="View my Signing Sets"
              testID="view-signing-sets"
              accessibilityState={{ disabled }}
              disabled={disabled}
              onPress={onOpenSaved}
              style={({ pressed }) => [
                styles.savedButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <Text selectable style={styles.savedButtonText}>
                View my Signing Sets
              </Text>
            </Pressable>
          </LayoutSlot>
        </PaperSurface>
      </View>
      <View pointerEvents="none" style={styles.bottomEdgeHighlight} />
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    width: "100%",
    alignSelf: "center",
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: 8,
  },
  compactShell: { paddingHorizontal: 8, paddingTop: 5, paddingBottom: 5 },
  tabletShell: { maxHeight: 860 },
  landscapeShell: { minHeight: 350, maxHeight: 440 },
  landscapeFrame: { flexDirection: "row", gap: 8 },
  landscapeInkPanel: { width: "42%", borderRadius: 28 },
  landscapeWhitePanel: { marginTop: 0, paddingTop: 18, borderRadius: 28 },
  landscapeBenefits: { justifyContent: "flex-start" },
  hiddenLip: { display: "none" },
  intrinsicLayout: {
    flexGrow: 0,
    flexShrink: 0,
    flexBasis: "auto",
    maxHeight: undefined,
  },
  rearPlate: {
    position: "absolute",
    left: 13,
    right: 3,
    top: 22,
    bottom: 8,
    borderRadius: 50,
    borderCurve: "continuous",
    borderWidth: 1,
    borderColor: "rgba(216,182,106,0.34)",
    backgroundColor: "#081A35",
    boxShadow: "0 16px 34px rgba(2,12,32,0.20), 0 4px 12px rgba(2,12,32,0.12)",
  },
  deviceFrame: {
    flex: 1,
    width: "100%",
    borderRadius: 48,
    borderCurve: "continuous",
    boxShadow: "0 1px 0 rgba(255,255,255,0.12)",
  },
  inkPanel: {
    paddingHorizontal: 27,
    paddingTop: 18,
    paddingBottom: 48,
    overflow: "hidden",
    borderRadius: 48,
    borderCurve: "continuous",
    borderWidth: 1,
    borderColor: "rgba(216, 182, 106, 0.58)",
    backgroundColor: "#0A3D78",
    boxShadow: flowShadows.panel,
    zIndex: 5,
  },
  compactInkPanel: {
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 38,
    borderRadius: 38,
  },
  topEdgeHighlight: {
    position: "absolute",
    left: 35,
    right: 35,
    top: 1,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.32)",
  },
  wordmarkStack: {
    width: 132,
    height: 50,
    alignSelf: "flex-end",
    zIndex: 3,
  },
  wordmark: {
    width: 132,
    height: 50,
  },
  copy: { paddingTop: 24, zIndex: 3 },
  compactCopy: { paddingTop: 4 },
  sign: {
    color: "#FFFFFF",
    fontFamily: "Georgia",
    fontSize: 54,
    lineHeight: 59,
    fontWeight: "700",
    letterSpacing: -2.4,
  },
  compactSign: { fontSize: 42, lineHeight: 45 },
  title: {
    color: "#FFFFFF",
    fontSize: 27,
    lineHeight: 36,
    fontWeight: "800",
    letterSpacing: -0.9,
    marginTop: 5,
  },
  compactTitle: { fontSize: 22, lineHeight: 27, marginTop: 1 },
  subtitle: {
    maxWidth: 360,
    color: "#E9E6DC",
    fontSize: 18,
    lineHeight: 25,
    marginTop: 9,
  },
  compactSubtitle: { fontSize: 15, lineHeight: 20, marginTop: 3 },
  signatureTicket: {
    width: "100%",
    height: 80,
    marginTop: "auto",
    marginBottom: -15,
    overflow: "hidden",
    borderRadius: 19,
    borderWidth: 1,
    borderColor: "rgba(216,182,106,0.62)",
    backgroundColor: "#F8F6EF",
    boxShadow:
      "0 6px 16px rgba(7,31,90,0.12), inset 0 1px 0 rgba(255,255,255,0.98)",
    zIndex: 2,
  },
  compactSignatureTicket: {
    height: 58,
    marginBottom: -11,
    borderRadius: 15,
  },
  ticketBaseline: {
    position: "absolute",
    left: 18,
    right: 18,
    top: "70%",
    height: 1,
    backgroundColor: "rgba(7,31,90,0.42)",
  },
  sampleSignature: {
    position: "absolute",
    top: 0,
    width: "90%",
    height: "100%",
    alignSelf: "center",
  },
  compactSampleSignature: {},
  signatureMotif: {
    position: "absolute",
    left: 28,
    right: 28,
    bottom: 26,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  signatureDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#D8B66A",
    boxShadow: "0 0 12px rgba(216,182,106,0.72)",
  },
  signatureLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(216,182,106,0.48)",
  },
  whitePanel: {
    flex: 1,
    justifyContent: "space-evenly",
    paddingHorizontal: 28,
    paddingTop: 62,
    paddingBottom: 14,
    marginTop: -42,
    borderRadius: 48,
    borderCurve: "continuous",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.96)",
    backgroundColor: "#F8F6EF",
    boxShadow:
      "0 12px 28px rgba(7,31,90,0.14), inset 0 2px 0 rgba(255,255,255,0.98), inset 0 -2px 0 rgba(7,31,90,0.08)",
    zIndex: 2,
  },
  compactWhitePanel: {
    paddingHorizontal: 22,
    paddingTop: 50,
    paddingBottom: 8,
    marginTop: -34,
    borderRadius: 38,
  },
  paperLip: {
    position: "absolute",
    left: 47,
    right: 47,
    top: 39,
    height: 5,
    borderRadius: 3,
    backgroundColor: "rgba(7,31,90,0.14)",
    boxShadow:
      "0 2px 5px rgba(7,31,90,0.18), inset 0 1px 0 rgba(255,255,255,0.82)",
  },
  paperLipHighlight: {
    width: "58%",
    height: 1,
    alignSelf: "center",
    backgroundColor: "rgba(216,182,106,0.66)",
  },
  bottomEdgeHighlight: {
    position: "absolute",
    left: 58,
    right: 58,
    bottom: 24,
    height: 2,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.62)",
    boxShadow: "0 2px 8px rgba(216,182,106,0.22)",
  },
  benefits: { flexGrow: 0, justifyContent: "flex-start", gap: 12 },
  compactBenefits: { justifyContent: "center", gap: 10 },
  benefitsEyebrow: {
    color: "#766B55",
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "800",
    letterSpacing: 1.35,
    marginBottom: 1,
  },
  benefitRow: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: "rgba(7,31,90,0.10)",
    backgroundColor: "rgba(255,255,255,0.66)",
    boxShadow:
      "0 8px 18px rgba(7,31,90,0.10), inset 0 1px 0 rgba(255,255,255,0.92)",
  },
  compactBenefitRow: {
    minHeight: 42,
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: 15,
  },
  checkCircle: {
    width: 27,
    height: 27,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(7,31,90,0.20)",
    backgroundColor: "#EEE8D9",
    boxShadow: "0 5px 12px rgba(7,31,90,0.10)",
  },
  checkMark: {
    color: "#071F5A",
    fontSize: 13,
    lineHeight: 16,
    fontWeight: "800",
  },
  benefitLabelSlot: { flex: 1 },
  benefitLabel: {
    color: "#10234D",
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  compactBenefitLabel: { fontSize: 15, lineHeight: 19 },
  actions: { gap: 2, paddingTop: 10 },
  primaryButton: {
    minWidth: 272,
    maxWidth: "100%",
    minHeight: 56,
    paddingHorizontal: 24,
    paddingVertical: 12,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.22)",
    backgroundColor: "#0A3D78",
    boxShadow: flowShadows.control,
  },
  primaryLabelSlot: { flexShrink: 1 },
  primaryLabel: {
    color: "#FFFFFF",
    fontSize: 19,
    lineHeight: 24,
    fontWeight: "800",
    textAlign: "center",
  },
  primaryPressed: {
    backgroundColor: "#083367",
    boxShadow: flowShadows.controlPressed,
  },
  buttonPressed: { opacity: 0.8 },
  buttonDisabled: { opacity: 0.52 },
  savedButton: {
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  savedButtonText: {
    color: "#17386D",
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "700",
  },
  privacyLine: {
    minHeight: 28,
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 4,
    gap: 7,
  },
  lock: {
    color: "#806739",
    fontSize: 7,
    lineHeight: 9,
  },
  privacyText: {
    color: "#686052",
    fontSize: 12,
    lineHeight: 16,
  },
  privacyLabel: { flex: 1 },
});
