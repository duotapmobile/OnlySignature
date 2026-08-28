import { useEffect, useState } from "react";
import {
  AccessibilityInfo,
  AppState,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AppStateProvider, useAppState } from "@/state/AppStateProvider";
import { theme } from "@/integrations/workspace";

function PrivacyCover() {
  const [covered, setCovered] = useState(false);
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) =>
      setCovered(state !== "active"),
    );
    return () => subscription.remove();
  }, []);
  if (!covered) return null;
  return (
    <View
      importantForAccessibility="no-hide-descendants"
      accessibilityElementsHidden
      style={styles.cover}
    >
      <View style={styles.lens}>
        <Text style={styles.coverTitle}>Only Signature</Text>
        <Text style={styles.coverText}>Your saved drawings are hidden.</Text>
      </View>
    </View>
  );
}

function GlobalErrorBanner() {
  const { data, dismissError } = useAppState();
  if (!data.lastError) return null;
  return (
    <View accessibilityLiveRegion="assertive" style={styles.errorBanner}>
      <Text accessibilityRole="alert" style={styles.errorText}>
        {data.lastError}
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Dismiss message"
        onPress={dismissError}
        style={styles.dismiss}
      >
        <Text style={styles.dismissText}>Dismiss</Text>
      </Pressable>
    </View>
  );
}

function ApplicationShell({ reduceMotion }: { reduceMotion: boolean }) {
  const { data } = useAppState();
  return (
    <View
      style={styles.application}
      testID={data.hydrated ? "app-ready" : undefined}
    >
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: reduceMotion ? "none" : "slide_from_right",
          contentStyle: { backgroundColor: theme.colors.primary },
        }}
      />
      <GlobalErrorBanner />
      <PrivacyCover />
    </View>
  );
}

export default function RootLayout() {
  const [reduceMotion, setReduceMotion] = useState(false);
  useEffect(() => {
    void AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
    const subscription = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      setReduceMotion,
    );
    return () => subscription.remove();
  }, []);
  return (
    <SafeAreaProvider>
      <AppStateProvider>
        <ApplicationShell reduceMotion={reduceMotion} />
      </AppStateProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  application: { flex: 1 },
  cover: {
    ...StyleSheet.absoluteFill,
    zIndex: 9999,
    backgroundColor: theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
    padding: 28,
  },
  errorBanner: {
    position: "absolute",
    left: 16,
    right: 16,
    top: 56,
    zIndex: 9000,
    backgroundColor: "#FFF4D6",
    borderColor: theme.colors.warning,
    borderWidth: 2,
    borderRadius: 14,
    padding: 14,
    gap: 8,
  },
  errorText: { color: theme.colors.text, fontSize: 17, lineHeight: 24 },
  dismiss: { minHeight: 44, justifyContent: "center", alignSelf: "flex-start" },
  dismissText: {
    color: theme.colors.primary,
    fontSize: 17,
    fontWeight: "800",
    textDecorationLine: "underline",
  },
  lens: {
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: theme.colors.glassFill,
    borderColor: theme.colors.glassBorder,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  coverTitle: {
    color: theme.colors.white,
    fontSize: 30,
    fontWeight: "800",
    textAlign: "center",
  },
  coverText: {
    color: theme.colors.white,
    opacity: 0.86,
    fontSize: 17,
    lineHeight: 24,
    textAlign: "center",
    marginTop: 8,
  },
});
