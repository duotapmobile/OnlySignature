export const documentComparisonAccessibilityLabel =
  "Comparison of the same sample agreement. White Background covers part of the signature line and nearby date. Transparent Professional Export keeps the line and date visible.";

export const shouldStackDocumentComparison = (
  width: number,
  fontScale: number,
): boolean => width < 360 || fontScale >= 1.3;
