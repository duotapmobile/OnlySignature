import assert from "node:assert/strict";
import test from "node:test";
import {
  createDebouncedHapticService,
  type HapticDriver,
  type HapticKind,
} from "../src/services/haptic-controller";

test("haptic service maps each semantic event exactly once", async () => {
  const calls: HapticKind[] = [];
  let clock = 1_000;
  const driver = Object.fromEntries(
    (["selection", "light", "success", "warning", "error"] as const).map(
      (kind) => [
        kind,
        async () => {
          calls.push(kind);
        },
      ],
    ),
  ) as HapticDriver;
  const haptics = createDebouncedHapticService(driver, {
    now: () => clock,
  });

  await haptics.selection();
  await haptics.selection();
  clock += 181;
  await haptics.lightImpact();
  clock += 181;
  await haptics.success();
  clock += 181;
  await haptics.warning();
  clock += 181;
  await haptics.error();

  assert.deepEqual(calls, [
    "selection",
    "light",
    "success",
    "warning",
    "error",
  ]);
});

test("haptic failures remain silent and recover after debounce", async () => {
  let clock = 2_000;
  let attempts = 0;
  const reject = async () => {
    attempts += 1;
    throw new Error("Haptics unavailable");
  };
  const haptics = createDebouncedHapticService(
    {
      selection: reject,
      light: reject,
      success: reject,
      warning: reject,
      error: reject,
    },
    { now: () => clock },
  );

  await assert.doesNotReject(haptics.error());
  await assert.doesNotReject(haptics.error());
  assert.equal(attempts, 1);
  clock += 181;
  await assert.doesNotReject(haptics.error());
  assert.equal(attempts, 2);
});
