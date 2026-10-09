import type { PressableProps } from "react-native";

type WebControlState = Pick<
  PressableProps,
  | "aria-busy"
  | "aria-checked"
  | "aria-disabled"
  | "aria-expanded"
  | "aria-selected"
>;

// The installed React Native Web exposes individual ARIA props, rather than
// React Native's accessibilityState object. Keep explicit caller props first.
export function webControlState(
  state: PressableProps["accessibilityState"],
  overrides: WebControlState = {},
): WebControlState {
  return {
    "aria-busy": overrides["aria-busy"] ?? state?.busy,
    "aria-checked": overrides["aria-checked"] ?? state?.checked,
    "aria-disabled": overrides["aria-disabled"] ?? state?.disabled,
    "aria-expanded": overrides["aria-expanded"] ?? state?.expanded,
    "aria-selected": overrides["aria-selected"] ?? state?.selected,
  };
}
