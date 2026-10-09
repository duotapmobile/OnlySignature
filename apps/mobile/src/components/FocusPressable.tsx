import { forwardRef, useState } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  type PressableProps,
  type View,
} from "react-native";
import { webControlState } from "@/domain/control-accessibility";

// Keep React Native's input, keyboard, and accessibility behavior. This wrapper
// only makes its focus state visible without resizing or moving the control.
export const FocusPressable = forwardRef<
  View,
  PressableProps & { focusTone?: "paper" | "navy" }
>(function FocusPressable(
  { style, onFocus, onBlur, focusTone = "paper", disabled, ...props },
  ref,
) {
  const [focused, setFocused] = useState(false);
  return (
    <Pressable
      {...props}
      {...(Platform.OS === "web"
        ? webControlState(props.accessibilityState, props)
        : {})}
      ref={ref}
      disabled={disabled}
      onFocus={(event) => {
        setFocused(true);
        onFocus?.(event);
      }}
      onBlur={(event) => {
        setFocused(false);
        onBlur?.(event);
      }}
      style={(state) => [
        typeof style === "function" ? style(state) : style,
        focused && !disabled && styles.focused,
        focused && !disabled && focusTone === "navy" && styles.onNavy,
      ]}
    />
  );
});

const styles = StyleSheet.create({
  focused: {
    outlineStyle: "solid",
    outlineWidth: 2,
    outlineOffset: 3,
    outlineColor: "#17386D",
  },
  onNavy: { outlineColor: "#FFE2A0" },
});
