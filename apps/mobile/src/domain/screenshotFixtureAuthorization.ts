const recognizedFixtures = new Set([
  "both",
  "comparison",
  "signature",
  "landing",
  "privacy",
  "purchased",
  "native-export",
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
