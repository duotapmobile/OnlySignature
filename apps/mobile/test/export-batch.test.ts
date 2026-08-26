import assert from "node:assert/strict";
import test from "node:test";
import type { GeneratedFile } from "../src/services/export";
import { generateExportBatch } from "../src/services/exportBatch";

const signature: GeneratedFile = {
  uri: "file:///tmp/signature/signature.png",
  format: "png-transparent",
  kind: "signature",
};

const initials: GeneratedFile = {
  uri: "file:///tmp/initials/initials.jpg",
  format: "jpeg-white",
  kind: "initials",
};

test("export batch returns every generated file in order", async () => {
  let cleanupCalled = false;
  const files = await generateExportBatch(
    [async () => signature, async () => initials],
    async () => {
      cleanupCalled = true;
    },
  );
  assert.deepEqual(files, [signature, initials]);
  assert.equal(cleanupCalled, false);
});

test("export batch cleans completed files when a later export fails", async () => {
  const failure = new Error("second-export-failed");
  let cleaned: GeneratedFile[] = [];
  await assert.rejects(
    generateExportBatch(
      [
        async () => signature,
        async () => {
          throw failure;
        },
      ],
      async (files) => {
        cleaned = [...files];
      },
    ),
    failure,
  );
  assert.deepEqual(cleaned, [signature]);
});

test("cleanup failure cannot replace the original export failure", async () => {
  const failure = new Error("export-failed");
  await assert.rejects(
    generateExportBatch([async () => Promise.reject(failure)], async () =>
      Promise.reject(new Error("cleanup-failed")),
    ),
    failure,
  );
});
