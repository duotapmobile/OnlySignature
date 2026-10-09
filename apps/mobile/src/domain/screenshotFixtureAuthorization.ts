const recognizedFixtures = new Set([
  "both",
  "comparison",
  "signature",
  "landing",
  "opening",
  "privacy",
  "purchased",
  "purchase-error",
  "saved-home",
  "empty",
  "native-export",
  "startup-loading",
  "startup-recovery",
  "purchase-pending",
  "purchase-interrupted",
  "purchase-finishing",
  "purchase-other-set",
  "product-loading",
  "product-unavailable",
]);

export function isAuthorizedFixture(
  fixture: string | undefined,
  expected: string | readonly string[] | undefined,
  enabled: boolean,
): boolean {
  if (!enabled || !fixture || !recognizedFixtures.has(fixture)) return false;
  if (!expected) return true;
  return Array.isArray(expected)
    ? expected.includes(fixture)
    : fixture === expected;
}
