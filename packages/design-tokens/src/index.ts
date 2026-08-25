export const colors = {
  primary: "#133A50",
  primaryDark: "#0A2637",
  primaryLight: "#3B6478",
  white: "#FFFFFF",
  offWhite: "#F5F3EE",
  darkText: "#102A3A",
  mutedText: "#4B626E",
  success: "#1F6B4F",
  warning: "#8A5B12",
  destructive: "#A53A3A",
  glassBorder: "rgba(255,255,255,0.46)",
  glassFill: "rgba(255,255,255,0.18)",
  shadow: "rgba(4,20,30,0.24)",
  focus: "#F3B544",
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
  hero: { fontSize: 38, lineHeight: 44, fontWeight: "800" as const },
  h1: { fontSize: 32, lineHeight: 39, fontWeight: "800" as const },
  h2: { fontSize: 24, lineHeight: 31, fontWeight: "700" as const },
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
