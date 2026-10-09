import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import {
  AccessibilityInfo,
  AppState,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Stack, useGlobalSearchParams } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { AppStateProvider, useAppState } from "@/state/AppStateProvider";
import { theme } from "@/integrations/workspace";
import { FocusPressable as Pressable } from "@/components/FocusPressable";
import {
  LaunchAssetWarmup,
  StartupSurface,
} from "@/components/startup-surface";
import { isAuthorizedScreenshotFixture } from "@/config/screenshotFixtures";
import {
  startupPresentation,
  storageStartupError,
} from "@/domain/startup-presentation";

const subscribeHydration = () => () => undefined;
const clientSnapshot = () => true;
const serverSnapshot = () => false;

void SplashScreen.preventAutoHideAsync().catch(() => undefined);
SplashScreen.setOptions({ duration: 250, fade: true });

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
  const insets = useSafeAreaInsets();
  const { data, dismissError } = useAppState();
  if (!data.lastError) return null;
  return (
    <View
      accessibilityLiveRegion="assertive"
      style={[styles.errorBanner, { top: Math.max(24, insets.top + 8) }]}
    >
      <ScrollView
        style={styles.errorScroll}
        contentContainerStyle={styles.errorContent}
        keyboardShouldPersistTaps="handled"
      >
        <Text accessibilityRole="alert" selectable style={styles.errorText}>
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
      </ScrollView>
    </View>
  );
}

function ApplicationShell({ reduceMotion }: { reduceMotion: boolean }) {
  const { data, dismissError } = useAppState();
  const [assetsReady, setAssetsReady] = useState(false);
  const [assetsFailed, setAssetsFailed] = useState(false);
  const [recoveryLaidOut, setRecoveryLaidOut] = useState(false);
  const [navigationLaidOut, setNavigationLaidOut] = useState(false);
  const hideStarted = useRef(false);
  const previousRecovery = useRef<string | null>(null);
  const markAssetsReady = useCallback(() => setAssetsReady(true), []);
  const markAssetsFailed = useCallback(() => setAssetsFailed(true), []);
  const markRecoveryLaidOut = useCallback(() => setRecoveryLaidOut(true), []);
  const markNavigationLaidOut = useCallback(
    () => setNavigationLaidOut(true),
    [],
  );
  const { fixture } = useGlobalSearchParams<{ fixture?: string | string[] }>();
  const fixtureName = Array.isArray(fixture) ? fixture[0] : fixture;
  const webHydrated = useSyncExternalStore(
    subscribeHydration,
    clientSnapshot,
    serverSnapshot,
  );
  const clientReady = Platform.OS !== "web" || webHydrated;
  // Authorized web fixtures affect presentation only, never stored app state.
  const recoveryFixture =
    Platform.OS === "web" &&
    webHydrated &&
    isAuthorizedScreenshotFixture(fixtureName, "startup-recovery");
  const loadingFixture =
    Platform.OS === "web" &&
    webHydrated &&
    isAuthorizedScreenshotFixture(fixtureName, "startup-loading");
  const startup = startupPresentation({
    hydrated: !recoveryFixture && !loadingFixture && data.hydrated,
    error: recoveryFixture ? storageStartupError : data.lastError,
    assetsReady,
    assetsFailed,
    clientReady,
    recoveryLaidOut,
    navigationLaidOut,
  });

  useEffect(() => {
    if (!data.hydrated && data.lastError)
      previousRecovery.current = data.lastError;
    else if (data.hydrated && previousRecovery.current) {
      const recoveredMessage = previousRecovery.current;
      previousRecovery.current = null;
      if (data.lastError === recoveredMessage) dismissError();
    }
  }, [data.hydrated, data.lastError, dismissError]);

  useEffect(() => {
    if (!startup.hideSplash || hideStarted.current) return;
    let active = true;
    let secondFrame: number | undefined;
    const firstFrame = requestAnimationFrame(() => {
      secondFrame = requestAnimationFrame(() => {
        hideStarted.current = true;
        void SplashScreen.hideAsync()
          .then(() => {
            if (active && startup.recoveryMessage && Platform.OS !== "web")
              AccessibilityInfo.announceForAccessibility(
                startup.recoveryMessage,
              );
          })
          .catch(() => {
            hideStarted.current = false;
          });
      });
    });
    return () => {
      active = false;
      cancelAnimationFrame(firstFrame);
      if (secondFrame !== undefined) cancelAnimationFrame(secondFrame);
    };
  }, [startup.hideSplash, startup.recoveryMessage]);
  return (
    <View
      style={styles.application}
      testID={startup.navigationReady ? "app-ready" : undefined}
    >
      <StatusBar style="light" />
      {!assetsReady && !assetsFailed ? (
        <LaunchAssetWarmup
          onReady={markAssetsReady}
          onFailed={markAssetsFailed}
        />
      ) : null}
      {startup.navigationReady ? (
        <View style={styles.application} onLayout={markNavigationLaidOut}>
          <Stack
            screenOptions={{
              headerShown: false,
              animation: reduceMotion ? "none" : "slide_from_right",
              contentStyle: { backgroundColor: "#02040A" },
            }}
          >
            <Stack.Screen
              name="draw"
              options={{
                gestureEnabled: false,
                fullScreenGestureEnabled: false,
              }}
            />
          </Stack>
        </View>
      ) : (
        <StartupSurface
          key={startup.phase}
          message={startup.recoveryMessage}
          assetFallback={assetsFailed}
          onLayout={
            startup.phase === "recovery" ? markRecoveryLaidOut : undefined
          }
        />
      )}
      {startup.navigationReady ? <GlobalErrorBanner /> : null}
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
    <GestureHandlerRootView style={styles.application}>
      <SafeAreaProvider>
        <AppStateProvider>
          <ApplicationShell reduceMotion={reduceMotion} />
        </AppStateProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  application: { flex: 1 },
  cover: {
    ...StyleSheet.absoluteFill,
    zIndex: 9999,
    backgroundColor: "#02040A",
    justifyContent: "center",
    alignItems: "center",
    padding: 28,
  },
  errorBanner: {
    position: "absolute",
    left: 16,
    right: 16,
    top: 24,
    zIndex: 9000,
    backgroundColor: "#FFF4D6",
    borderColor: theme.colors.warning,
    borderWidth: 2,
    borderRadius: 14,
    maxHeight: "85%",
  },
  errorScroll: { flexGrow: 0 },
  errorContent: { padding: 14, gap: 8 },
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
    backgroundColor: "#FBFAF5",
    borderColor: "#D8B66A",
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  coverTitle: {
    color: "#071F5A",
    fontSize: 30,
    fontWeight: "800",
    textAlign: "center",
  },
  coverText: {
    color: "#425269",
    opacity: 0.86,
    fontSize: 17,
    lineHeight: 24,
    textAlign: "center",
    marginTop: 8,
  },
});
