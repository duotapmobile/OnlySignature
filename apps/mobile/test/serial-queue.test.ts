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

test("snapshot, observer, and deletion transitions share deterministic queue order", async () => {
  const queue = createSerialQueue();
  const events: string[] = [];
  let releaseSnapshot!: () => void;
  const snapshotBarrier = new Promise<void>((resolve) => {
    releaseSnapshot = resolve;
  });
  const processTransaction = async (source: string) => {
    events.push(`transaction:${source}`);
  };
  const recovery = queue.run(async () => {
    events.push("snapshot:start");
    await snapshotBarrier;
    await processTransaction("snapshot");
    events.push("snapshot:absence");
  });
  const observer = queue.run(() => processTransaction("observer"));
  const deletion = queue.run(async () => {
    events.push("delete-all");
  });
  await Promise.resolve();
  assert.deepEqual(events, ["snapshot:start"]);
  releaseSnapshot();
  await Promise.all([recovery, observer, deletion]);
  assert.deepEqual(events, [
    "snapshot:start",
    "transaction:snapshot",
    "snapshot:absence",
    "transaction:observer",
    "delete-all",
  ]);
});
