import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { fileURLToPath } from "node:url";

const swiftSource = readFileSync(
  fileURLToPath(
    new URL(
      "../modules/only-signature-native/ios/OnlySignatureStorageModule.swift",
      import.meta.url,
    ),
  ),
  "utf8",
);

test("native storage uses writable FileManager protection attributes", () => {
  assert.doesNotMatch(swiftSource, /\.fileProtection\s*=/);
  const protectionWrites = swiftSource.match(
    /setAttributes\(\[\.protectionKey: FileProtectionType\.complete\]/g,
  );
  assert.ok((protectionWrites?.length ?? 0) >= 5);
  assert.match(swiftSource, /isExcludedFromBackup = true/);
});
