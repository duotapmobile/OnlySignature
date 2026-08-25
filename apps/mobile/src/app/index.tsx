import { useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Link, router, useLocalSearchParams } from "expo-router";
import {
  Benefit,
  GlassCard,
  Heading,
  PrimaryButton,
  Screen,
} from "@/components/ui";
import { hasDrawing } from "@/domain/models";
import { theme } from "@/integrations/workspace";
import { useAppState } from "@/state/AppStateProvider";
import { confirmAuthorizedUse } from "@/services/authorizedUse";

export default function LandingScreen() {
  const { data } = useAppState();
  const { fixture } = useLocalSearchParams<{ fixture?: string }>();
  const hasSavedWork = data.sets.some(
    (set) =>
      set.status === "purchased" ||
      hasDrawing(set.signature) ||
      hasDrawing(set.initials),
  );
  useEffect(() => {
    if (data.hydrated && hasSavedWork && fixture !== "landing")
      router.replace("/saved");
  }, [data.hydrated, fixture, hasSavedWork]);
  return (
    <Screen testID="landing-screen">
      <View style={styles.brandRow}>
        <View style={styles.miniLens}>
          <Text style={styles.mark}>OS</Text>
        </View>
        <Text style={styles.brand}>Only Signature</Text>
      </View>
      <View style={styles.hero}>
        <Heading>Signature and Initials</Heading>
        <Text allowFontScaling style={styles.support}>
          Export in the format you need.
        </Text>
        <Text
          accessibilityRole="header"
          allowFontScaling
          style={styles.statement}
        >
          EXPORT WITH A{`\n`}TRANSPARENT BACKGROUND
        </Text>
      </View>
      <GlassCard>
        <Benefit title="No white box" />
        <Benefit title="No editing or cropping" />
        <Benefit title="Created on your device. We do not upload it." />
        <Benefit title="No login. No subscription." />
      </GlassCard>
      <PrimaryButton
        label="Get Started"
        onPress={() => confirmAuthorizedUse(() => router.push("/draw"))}
        accessibilityHint="Opens the signature drawing screen"
        testID="get-started"
      />
      <View style={styles.footer}>
        <Link href="/privacy" asChild>
          <Pressable accessibilityRole="link">
            <Text style={styles.link}>Privacy</Text>
          </Pressable>
        </Link>
        <Text style={styles.dot}>•</Text>
        <Link href="/terms" asChild>
          <Pressable accessibilityRole="link">
            <Text style={styles.link}>Terms</Text>
          </Pressable>
        </Link>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  brandRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  miniLens: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 1,
    borderColor: theme.colors.glassBorder,
    backgroundColor: theme.colors.glassFill,
    alignItems: "center",
    justifyContent: "center",
  },
  mark: { color: theme.colors.white, fontSize: 14, fontWeight: "900" },
  brand: { color: theme.colors.white, fontSize: 20, fontWeight: "800" },
  hero: { paddingVertical: 16, gap: 12 },
  support: { color: "rgba(255,255,255,0.86)", fontSize: 20, lineHeight: 28 },
  statement: {
    color: theme.colors.white,
    fontSize: 30,
    lineHeight: 36,
    fontWeight: "900",
    letterSpacing: 0.4,
  },
  footer: {
    marginTop: "auto",
    paddingTop: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  link: {
    color: theme.colors.white,
    fontSize: 16,
    textDecorationLine: "underline",
    minHeight: 44,
    paddingVertical: 12,
  },
  dot: { color: theme.colors.white },
});
