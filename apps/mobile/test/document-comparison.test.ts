import assert from "node:assert/strict";
import test from "node:test";
import {
  documentComparisonAccessibilityLabel,
  shouldStackDocumentComparison,
} from "../src/domain/documentComparison";

test("document comparison stacks for narrow windows and large Dynamic Type", () => {
  assert.equal(shouldStackDocumentComparison(699, 1), true);
  assert.equal(shouldStackDocumentComparison(900, 1.3), true);
  assert.equal(shouldStackDocumentComparison(900, 1), false);
});

test("document comparison semantics describe one fixture and both treatments", () => {
  assert.match(documentComparisonAccessibilityLabel, /same sample agreement/i);
  assert.match(documentComparisonAccessibilityLabel, /White Background/);
  assert.match(documentComparisonAccessibilityLabel, /Transparent/);
});
