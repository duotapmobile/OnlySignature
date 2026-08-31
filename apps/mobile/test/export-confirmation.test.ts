import assert from "node:assert/strict";
import test from "node:test";
import {
  addConfirmedKind,
  everyGeneratedFileConfirmed,
} from "../src/services/exportConfirmation";

const signature = {
  uri: "file:///signature.png",
  format: "png-transparent" as const,
  kind: "signature" as const,
};
const initials = {
  uri: "file:///initials.jpg",
  format: "jpeg-white" as const,
  kind: "initials" as const,
};

test("two-asset export requires confirmation for each asset", () => {
  const one = addConfirmedKind([], "signature");
  assert.equal(everyGeneratedFileConfirmed([signature, initials], one), false);
  const both = addConfirmedKind(one, "initials");
  assert.equal(everyGeneratedFileConfirmed([signature, initials], both), true);
});

test("single-asset export completes after its own confirmation", () => {
  assert.equal(everyGeneratedFileConfirmed([signature], ["signature"]), true);
  assert.equal(everyGeneratedFileConfirmed([initials], ["signature"]), false);
});
