import type { PropsWithChildren, ReactNode } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "@/integrations/workspace";

export function Screen({
  children,
  scroll = true,
  dark = true,
  testID,
}: PropsWithChildren<{ scroll?: boolean; dark?: boolean; testID?: string }>) {
  const content = (
    <View style={[styles.content, !dark && styles.lightContent]}>
      {children}
    </View>
  );
  return (
    <SafeAreaView
      style={[styles.safe, dark ? styles.dark : styles.light]}
      edges={["top", "right", "bottom", "left"]}
      testID={testID}
    >
      {scroll ? (
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          {content}
        </ScrollView>
      ) : (
        content
      )}
    </SafeAreaView>
  );
}

export function GlassCard({
  children,
  style,
}: PropsWithChildren<{ style?: StyleProp<ViewStyle> }>) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Heading({
  children,
  dark = false,
  accessibilityLabel,
}: PropsWithChildren<{ dark?: boolean; accessibilityLabel?: string }>) {
  return (
    <Text
      accessibilityRole="header"
      accessibilityLabel={accessibilityLabel}
      allowFontScaling
      style={[styles.heading, dark && styles.darkText]}
    >
      {children}
    </Text>
  );
}

export function Body({
  children,
  dark = false,
  style,
}: PropsWithChildren<{ dark?: boolean; style?: StyleProp<TextStyle> }>) {
  return (
    <Text
      allowFontScaling
      style={[styles.body, dark && styles.darkText, style]}
    >
      {children}
    </Text>
  );
}

export function PrimaryButton({
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
        styles.button,
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      <Text allowFontScaling style={styles.buttonText}>
        {label}
      </Text>
    </Pressable>
  );
}

export function SecondaryButton({
  label,
  onPress,
  destructive = false,
  disabled = false,
}: {
  label: string;
  onPress(): void;
  destructive?: boolean;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.secondaryButton,
        destructive && styles.destructiveButton,
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      <Text
        allowFontScaling
        style={[
          styles.secondaryButtonText,
          destructive && styles.destructiveText,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function BackLink({ onPress }: { onPress(): void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Back"
      onPress={onPress}
      hitSlop={8}
      style={styles.back}
    >
      <Text allowFontScaling style={styles.backText}>
        ← Back
      </Text>
    </Pressable>
  );
}

export function Benefit({
  title,
  detail,
}: {
  title: string;
  detail?: ReactNode;
}) {
  return (
    <View style={styles.benefit}>
      <Text style={styles.check} accessibilityElementsHidden>
        ✓
      </Text>
      <View style={styles.flex}>
        <Text allowFontScaling style={styles.benefitTitle}>
          {title}
        </Text>
        {detail ? (
          <Text allowFontScaling style={styles.benefitDetail}>
            {detail}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  dark: { backgroundColor: theme.colors.primary },
  light: { backgroundColor: theme.colors.offWhite },
  scroll: { flexGrow: 1 },
  content: {
    width: "100%",
    maxWidth: 980,
    alignSelf: "center",
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
    flexGrow: 1,
  },
  lightContent: { backgroundColor: theme.colors.offWhite },
  card: {
    backgroundColor: "rgba(255,255,255,0.94)",
    borderColor: theme.colors.glassBorder,
    borderWidth: 1,
    borderRadius: theme.radii.lg,
    padding: theme.spacing.lg,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.24,
    shadowRadius: 22,
    elevation: 4,
  },
  heading: {
    color: theme.colors.white,
    fontSize: 34,
    fontWeight: "800",
    lineHeight: 41,
    letterSpacing: -0.6,
  },
  body: { color: "rgba(255,255,255,0.92)", fontSize: 19, lineHeight: 28 },
  darkText: { color: theme.colors.text },
  button: {
    minHeight: 58,
    paddingHorizontal: 22,
    paddingVertical: 15,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: theme.radii.md,
    backgroundColor: theme.colors.primaryDark,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 9,
    elevation: 3,
  },
  buttonText: {
    color: theme.colors.white,
    fontSize: 19,
    lineHeight: 24,
    fontWeight: "800",
    textAlign: "center",
  },
  secondaryButton: {
    minHeight: 54,
    paddingHorizontal: 18,
    paddingVertical: 13,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: theme.radii.md,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.white,
  },
  secondaryButtonText: {
    color: theme.colors.primary,
    fontSize: 18,
    lineHeight: 23,
    fontWeight: "700",
    textAlign: "center",
  },
  destructiveButton: { borderColor: theme.colors.destructive },
  destructiveText: { color: theme.colors.destructive },
  pressed: { opacity: 0.78, transform: [{ scale: 0.99 }] },
  disabled: { opacity: 0.48 },
  back: {
    minHeight: 48,
    minWidth: 88,
    alignSelf: "flex-start",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  backText: { color: theme.colors.white, fontSize: 18, fontWeight: "700" },
  benefit: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
    minHeight: 44,
    paddingVertical: 8,
  },
  check: { color: theme.colors.success, fontSize: 22, fontWeight: "900" },
  flex: { flex: 1 },
  benefitTitle: {
    color: theme.colors.text,
    fontSize: 19,
    lineHeight: 25,
    fontWeight: "700",
  },
  benefitDetail: {
    color: theme.colors.muted,
    fontSize: 16,
    lineHeight: 22,
    marginTop: 3,
  },
});
