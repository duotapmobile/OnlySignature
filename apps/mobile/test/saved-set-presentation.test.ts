import assert from "node:assert/strict";
import test from "node:test";
import { createDraftSet } from "../src/domain/models";
import { savedSetCreationLabel } from "../src/domain/saved-set-presentation";
import { validateAndMigrateAppState } from "../src/domain/appStateValidation";

const state = (set = createDraftSet("draft", "2026-10-04T12:00:00.000Z")) => ({
  hydrated: true,
  activeSetId: set.id,
  sets: [set],
  selectedAsset: "signature",
  reviewPrompted: false,
  lastError: null,
});

test("new sets retain their original creation date through editing and persistence", () => {
  const set = createDraftSet("draft", "2026-10-04T12:00:00.000Z");
  set.lastUsedAt = "2026-10-06T12:00:00.000Z";
  const restored = validateAndMigrateAppState(
    JSON.parse(JSON.stringify(state(set))),
  );
  assert.equal(restored.sets[0]?.createdAt, "2026-10-04T12:00:00.000Z");
  assert.equal(
    savedSetCreationLabel(restored.sets[0]!, "en-US"),
    "Created Oct 4, 2026",
  );
});

test("legacy sets never present mutable usage or purchase dates as creation dates", () => {
  const set = createDraftSet("draft", "2026-10-04T12:00:00.000Z");
  delete set.createdAt;
  set.purchasedAt = "2026-10-05T12:00:00.000Z";
  const restored = validateAndMigrateAppState(state(set));
  assert.equal(restored.sets[0]?.createdAt, null);
  assert.equal(
    savedSetCreationLabel(restored.sets[0]!),
    "Creation date unavailable",
  );
});

test("invalid optional metadata does not corrupt an otherwise valid legacy set", () => {
  const set = createDraftSet("draft", "2026-10-04T12:00:00.000Z");
  set.createdAt = "invalid";
  assert.equal(validateAndMigrateAppState(state(set)).sets[0]?.createdAt, null);
  assert.equal(savedSetCreationLabel(set), "Creation date unavailable");
});

test("creation dates follow the display locale, without altering stored metadata", () => {
  const set = createDraftSet("draft", "2026-10-04T12:00:00.000Z");
  assert.equal(savedSetCreationLabel(set, "en-GB"), "Created 4 Oct 2026");
  assert.equal(set.createdAt, "2026-10-04T12:00:00.000Z");
});
