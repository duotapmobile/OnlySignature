import assert from "node:assert/strict";
import test from "node:test";
import { isAuthorizedFixture } from "../src/domain/screenshotFixtureAuthorization";
import { screenshotFixtureSetsFor } from "../src/domain/fixtures";
import { hasDrawing } from "../src/domain/models";

test("fixture query parameters are inert when fixture mode is disabled", () => {
  assert.equal(isAuthorizedFixture("landing", "landing", false), false);
  assert.equal(isAuthorizedFixture("both", "both", false), false);
  assert.equal(isAuthorizedFixture("empty", undefined, false), false);
  assert.equal(isAuthorizedFixture("startup-loading", undefined, false), false);
  assert.equal(
    isAuthorizedFixture("startup-recovery", undefined, false),
    false,
  );
});

test("empty-list visual fixture contains no reusable ink or purchase", () => {
  const sets = screenshotFixtureSetsFor("empty");
  assert.equal(sets.length, 1);
  assert.equal(sets[0].status, "draft");
  assert.equal(hasDrawing(sets[0].signature), false);
  assert.equal(hasDrawing(sets[0].initials), false);
  assert.equal(sets[0].transactionId, null);
});

test("fixture mode accepts only recognized fixtures and expected routes", () => {
  assert.equal(isAuthorizedFixture("landing", "landing", true), true);
  assert.equal(isAuthorizedFixture("opening", "opening", true), true);
  assert.equal(
    isAuthorizedFixture("startup-loading", "startup-loading", true),
    true,
  );
  assert.equal(
    isAuthorizedFixture("startup-recovery", "startup-recovery", true),
    true,
  );
  assert.equal(
    isAuthorizedFixture("purchase-error", "purchase-error", true),
    true,
  );
  assert.equal(isAuthorizedFixture("unknown", undefined, true), false);
  assert.equal(
    isAuthorizedFixture("purchased", ["both", "signature"], true),
    false,
  );
});
