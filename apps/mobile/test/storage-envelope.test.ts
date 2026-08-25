import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import test from "node:test";
import {
  decodeStorageEnvelope,
  encodeStorageEnvelope,
} from "../src/services/storageEnvelope";

const digest = async (value: string) =>
  createHash("sha256").update(value).digest("hex");

test("storage envelope round-trips a versioned checksummed payload", async () => {
  const source = { activeSetId: "set-1", count: 2 };
  const encoded = await encodeStorageEnvelope(source, digest);
  assert.deepEqual(
    await decodeStorageEnvelope<typeof source>(encoded, digest),
    source,
  );
});

test("storage envelope rejects tampered or malformed state", async () => {
  const encoded = await encodeStorageEnvelope({ count: 2 }, digest);
  const envelope = JSON.parse(encoded) as { payload: string };
  envelope.payload = JSON.stringify({ count: 3 });
  await assert.rejects(
    decodeStorageEnvelope(JSON.stringify(envelope), digest),
    /local-state-corrupted/,
  );
  await assert.rejects(
    decodeStorageEnvelope("not-json", digest),
    /local-state-corrupted/,
  );
});

test("legacy raw state is accepted only when explicitly allowed", async () => {
  const legacy = JSON.stringify({ activeSetId: "legacy" });
  await assert.rejects(
    decodeStorageEnvelope(legacy, digest),
    /local-state-corrupted/,
  );
  assert.deepEqual(await decodeStorageEnvelope(legacy, digest, true), {
    activeSetId: "legacy",
  });
});
