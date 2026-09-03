import { createElement, type PropsWithChildren } from "react";
import {
  Platform,
  useWindowDimensions,
  View,
  type StyleProp,
  type ViewProps,
  type ViewStyle,
} from "react-native";
import {
  layoutStudioValues,
  type LayoutStudioValue,
} from "@/design/layout-studio-values";

type LayoutSlotProps = PropsWithChildren<
  Omit<ViewProps, "style"> & {
    id: string;
    style?: StyleProp<ViewStyle>;
  }
>;

function finite(value: number | undefined, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function normalized(value: LayoutStudioValue | undefined) {
  if (!value) return null;
  return {
    x: finite(value.x, 0),
    y: finite(value.y, 0),
    scale: Math.max(0.5, Math.min(3, finite(value.scale, 1))),
    rotate: Math.max(-180, Math.min(180, finite(value.rotate, 0))),
    width: finite(value.width, 0),
  };
}

function valueStyle(
  value: LayoutStudioValue | undefined,
): ViewStyle | undefined {
  const clean = normalized(value);
  if (!clean) return undefined;
  return {
    ...(clean.width > 0
      ? { width: clean.width, alignSelf: "center" as const }
      : null),
    transform: [
      { translateX: clean.x },
      { translateY: clean.y },
      { rotate: `${clean.rotate}deg` },
      { scale: clean.scale },
    ],
  };
}

function wideWebCss(
  id: string,
  phoneValue: LayoutStudioValue | undefined,
  ipadValue: LayoutStudioValue | undefined,
): string {
  const tablet = normalized(ipadValue);
  const phone = normalized(phoneValue);
  const transform = tablet
    ? `translate(${tablet.x}px, ${tablet.y}px) rotate(${tablet.rotate}deg) scale(${tablet.scale})`
    : "none";
  const width = tablet?.width
    ? `width:${tablet.width}px!important;align-self:center!important;`
    : phone?.width
      ? "width:auto!important;"
      : "";
  return `@media (min-width:768px){[data-testid="layout-slot:${id}"]{transform:${transform}!important;${width}}}`;
}

export function LayoutSlot({
  id,
  style,
  children,
  testID,
  ...props
}: LayoutSlotProps) {
  const { width } = useWindowDimensions();
  const device = width >= 768 ? "ipad" : "iphone";
  const phoneValue = layoutStudioValues.iphone[id];
  const ipadValue = layoutStudioValues.ipad[id];
  const slot = (
    <View
      {...props}
      collapsable={false}
      testID={testID ?? `layout-slot:${id}`}
      style={[style, valueStyle(device === "ipad" ? ipadValue : phoneValue)]}
    >
      {children}
    </View>
  );
  if (Platform.OS !== "web") return slot;
  return (
    <>
      {createElement("style", {
        dangerouslySetInnerHTML: {
          __html: wideWebCss(id, phoneValue, ipadValue),
        },
      })}
      {slot}
    </>
  );
}
