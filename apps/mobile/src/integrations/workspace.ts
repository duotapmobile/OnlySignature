import {
  assertReleaseConfig,
  developmentConfig,
  validateReleaseConfig,
} from "@only-signature/config";
import {
  brand,
  errorCopy,
  flowCopy,
  landingCopy,
  legalContentHashes,
  privacyFixtureCopy,
  privacyPolicyMarkdown,
  purchaseCopy,
  purchaseFaq,
  termsOfUseMarkdown,
} from "@only-signature/content";
import * as SharedCore from "@only-signature/core";
import {
  colors,
  designTokens,
  radii,
  spacing,
  touch,
  typography,
} from "@only-signature/design-tokens";

type UnknownRecord = Record<string, unknown>;

export const workspaceModules = {
  config: { assertReleaseConfig, developmentConfig, validateReleaseConfig },
  content: {
    brand,
    errorCopy,
    flowCopy,
    landingCopy,
    legalContentHashes,
    privacyFixtureCopy,
    privacyPolicyMarkdown,
    purchaseCopy,
    purchaseFaq,
    termsOfUseMarkdown,
  },
  core: SharedCore,
  tokens: { colors, designTokens, radii, spacing, touch, typography },
};

const tokenColors = colors as unknown as Record<string, string>;
const tokenSpacing = spacing as unknown as Record<string, number>;
const tokenRadii = radii as unknown as Record<string, number>;

export const theme = {
  colors: {
    primary: tokenColors.primary ?? "#133A50",
    primaryDark: tokenColors.primaryDark ?? "#0A2636",
    primaryLight: tokenColors.primaryLight ?? "#DCEBF0",
    white: tokenColors.white ?? "#FFFFFF",
    offWhite: tokenColors.offWhite ?? "#F5F8F7",
    text: tokenColors.darkText ?? "#102733",
    muted: tokenColors.mutedText ?? "#536873",
    success: tokenColors.success ?? "#20714B",
    warning: tokenColors.warning ?? "#8A5A08",
    destructive: tokenColors.destructive ?? "#A32626",
    glassFill: tokenColors.glassFill ?? "rgba(255,255,255,0.16)",
    glassBorder: tokenColors.glassBorder ?? "rgba(255,255,255,0.42)",
    focus: tokenColors.focusIndicator ?? "#F1C75B",
    shadow: tokenColors.shadow ?? "rgba(4,21,30,0.22)",
  },
  spacing: {
    xs: tokenSpacing.xs ?? 6,
    sm: tokenSpacing.sm ?? 10,
    md: tokenSpacing.md ?? 16,
    lg: tokenSpacing.lg ?? 24,
    xl: tokenSpacing.xl ?? 32,
  },
  radii: {
    sm: tokenRadii.sm ?? 10,
    md: tokenRadii.md ?? 18,
    lg: tokenRadii.lg ?? 28,
  },
};

export const sharedCopy = {
  brand,
  errorCopy,
  flowCopy,
  landingCopy,
  legalContentHashes,
  privacyFixtureCopy,
  privacyPolicyMarkdown,
  purchaseCopy,
  purchaseFaq,
  termsOfUseMarkdown,
};
export const sharedReleaseConfig =
  developmentConfig as unknown as UnknownRecord;
