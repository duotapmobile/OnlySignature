import { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { FlowPrimaryButton, flowColors } from "./flow-ui";

export function useDelayedVisibility(active: boolean, delay = 300) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setVisible(active), active ? delay : 0);
    return () => clearTimeout(timer);
  }, [active, delay]);
  return active && visible;
}

export function LoadingMark({ compact = false }: { compact?: boolean }) {
  const progress = useSharedValue(0.22);
  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, { duration: 720, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [progress]);
  const lineStyle = useAnimatedStyle(() => ({
    opacity: 0.45 + progress.value * 0.55,
    transform: [{ scaleX: progress.value }],
  }));
  return (
    <View
      accessibilityLabel="Loading"
      accessibilityRole="progressbar"
      style={[styles.mark, compact && styles.compactMark]}
    >
      <View style={styles.dot} />
      <Animated.View style={[styles.line, lineStyle]} />
    </View>
  );
}

export function InlineStatus({
  message,
  tone = "dark",
}: {
  message: string;
  tone?: "dark" | "light";
}) {
  return (
    <View accessibilityLiveRegion="polite" style={styles.inline}>
      <LoadingMark compact />
      <Text style={[styles.inlineText, tone === "light" && styles.lightText]}>
        {message}
      </Text>
    </View>
  );
}

export function OperationOverlay({
  visible,
  message,
}: {
  visible: boolean;
  message: string;
}) {
  if (!visible) return null;
  return (
    <View
      accessibilityViewIsModal
      accessibilityLabel={message}
      style={styles.overlay}
    >
      <View style={styles.overlayCard}>
        <LoadingMark />
        <Text style={styles.overlayText}>{message}</Text>
      </View>
    </View>
  );
}

export function AsyncActionButton({
  label,
  workingLabel,
  working,
  onPress,
  disabled = false,
  style,
}: {
  label: string;
  workingLabel: string;
  working: boolean;
  onPress(): void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={style}>
      <FlowPrimaryButton
        label={working ? workingLabel : label}
        onPress={onPress}
        disabled={disabled || working}
        loading={working}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  mark: {
    width: 96,
    height: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  compactMark: { width: 42, height: 12, gap: 5 },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: flowColors.gold,
  },
  line: {
    flex: 1,
    height: 2,
    borderRadius: 2,
    backgroundColor: flowColors.gold,
    transformOrigin: "left center",
  },
  inline: {
    minHeight: 30,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  inlineText: {
    flex: 1,
    color: flowColors.bodyText,
    fontSize: 14,
    lineHeight: 19,
  },
  lightText: { color: flowColors.cardMuted },
  overlay: {
    ...StyleSheet.absoluteFill,
    zIndex: 8000,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "rgba(2,4,10,0.68)",
  },
  overlayCard: {
    width: "100%",
    maxWidth: 330,
    minHeight: 144,
    alignItems: "center",
    justifyContent: "center",
    gap: 18,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "rgba(216,182,106,0.72)",
    backgroundColor: flowColors.ink,
    boxShadow: "0 24px 60px rgba(0,0,0,0.56)",
  },
  overlayText: {
    color: flowColors.white,
    fontSize: 17,
    lineHeight: 23,
    fontWeight: "700",
  },
});
