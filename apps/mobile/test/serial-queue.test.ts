import assert from "node:assert/strict";
import test from "node:test";
import { createSerialQueue } from "../src/services/serialQueue";

test("purchase transitions run serially and a rejection does not poison the queue", async () => {
  const queue = createSerialQueue();
  const events: string[] = [];
  let releaseFirst!: () => void;
  const barrier = new Promise<void>((resolve) => {
    releaseFirst = resolve;
  });
  const first = queue.run(async () => {
    events.push("first-start");
    await barrier;
    events.push("first-end");
    throw new Error("injected-failure");
  });
  const second = queue.run(async () => {
    events.push("second");
    return 2;
  });
  await Promise.resolve();
  assert.deepEqual(events, ["first-start"]);
  releaseFirst();
  await assert.rejects(first);
  assert.equal(await second, 2);
  assert.deepEqual(events, ["first-start", "first-end", "second"]);
});
