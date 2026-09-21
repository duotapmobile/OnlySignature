export const colors = {
  primary: "#0A3D78",
  primaryDark: "#071F5A",
  primaryLight: "#EEE8D9",
  white: "#FFFFFF",
  offWhite: "#F8F6EF",
  darkText: "#10234D",
  mutedText: "#686052",
  success: "#20714B",
  warning: "#8A5A08",
  destructive: "#A32626",
  glassBorder: "rgba(216,182,106,0.58)",
  glassFill: "rgba(255,255,255,0.18)",
  shadow: "rgba(2,4,10,0.34)",
  focus: "#D8B66A",
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;
export const radii = { sm: 10, md: 18, lg: 26, pill: 999 } as const;
export const typography = {
  hero: {
    fontFamily: "Georgia",
    fontSize: 38,
    lineHeight: 44,
    fontWeight: "700" as const,
  },
  h1: {
    fontFamily: "Georgia",
    fontSize: 32,
    lineHeight: 39,
    fontWeight: "700" as const,
  },
  h2: {
    fontFamily: "Georgia",
    fontSize: 24,
    lineHeight: 31,
    fontWeight: "700" as const,
  },
  body: { fontSize: 18, lineHeight: 27, fontWeight: "400" as const },
  label: { fontSize: 17, lineHeight: 22, fontWeight: "700" as const },
  small: { fontSize: 15, lineHeight: 21, fontWeight: "400" as const },
} as const;
export const touch = { minimum: 44, primaryHeight: 56 } as const;

export const designTokens = {
  colors,
  spacing,
  radii,
  typography,
  touch,
} as const;
