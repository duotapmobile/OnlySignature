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

test("temporary exports use Expo's writable cache scope with bounded cleanup", () => {
  const exportDirectory = swiftSource.match(
    /private func exportDirectory\(\) throws -> URL \{([\s\S]*?)\n  \}/,
  )?.[1];
  assert.ok(exportDirectory, "exportDirectory implementation must exist");
  assert.match(exportDirectory, /\.cachesDirectory/);
  assert.doesNotMatch(exportDirectory, /\.temporaryDirectory/);
  assert.match(
    exportDirectory,
    /appendingPathComponent\("OnlySignatureExports", isDirectory: true\)/,
  );
  assert.match(
    exportDirectory,
    /setAttributes\(\[\.protectionKey: FileProtectionType\.complete\]/,
  );
  assert.match(exportDirectory, /isExcludedFromBackup = true/);

  assert.match(
    swiftSource,
    /AsyncFunction\("cleanupTemporaryFiles"\)[\s\S]*?contentsOfDirectory\(at: directory,[\s\S]*?removeItem\(at: child\)/,
  );
  assert.doesNotMatch(
    swiftSource,
    /AsyncFunction\("cleanupTemporaryFiles"\)[\s\S]*?removeItem\(at: directory\)/,
  );
});
