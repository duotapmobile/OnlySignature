import * as Haptics from "expo-haptics";
import { createDebouncedHapticService } from "./haptic-controller";

const DEBOUNCE_MS = 180;
const haptics = createDebouncedHapticService(
  {
    selection: () => Haptics.selectionAsync(),
    light: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
    success: () =>
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
    warning: () =>
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning),
    error: () =>
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error),
  },
  { debounceMs: DEBOUNCE_MS },
);

export const hapticSelection = haptics.selection;
export const hapticLightImpact = haptics.lightImpact;
export const hapticSuccess = haptics.success;
export const hapticWarning = haptics.warning;
export const hapticError = haptics.error;
