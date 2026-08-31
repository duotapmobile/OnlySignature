import assert from "node:assert/strict";
import test from "node:test";
import { isAuthorizedFixture } from "../src/domain/screenshotFixtureAuthorization";

test("fixture query parameters are inert when fixture mode is disabled", () => {
  assert.equal(isAuthorizedFixture("landing", "landing", false), false);
  assert.equal(isAuthorizedFixture("both", "both", false), false);
});

test("fixture mode accepts only recognized fixtures and expected routes", () => {
  assert.equal(isAuthorizedFixture("landing", "landing", true), true);
  assert.equal(isAuthorizedFixture("unknown", undefined, true), false);
  assert.equal(
    isAuthorizedFixture("purchased", ["both", "signature"], true),
    false,
  );
});
