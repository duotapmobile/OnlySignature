import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const swiftSource = readFileSync(
  new URL(
    "../modules/only-signature-native/ios/OnlySignatureStorageModule.swift",
    import.meta.url,
  ),
  "utf8",
);
const exportSource = readFileSync(
  new URL("../src/services/export.ts", import.meta.url),
  "utf8",
);
const storageSource = readFileSync(
  new URL("../src/services/storage.ts", import.meta.url),
  "utf8",
);
const fixtureSource = readFileSync(
  new URL("../src/app/native-export-test.tsx", import.meta.url),
  "utf8",
);
const reactNativeUtilsSource = readFileSync(
  new URL(
    "../../../node_modules/react-native/React/Base/RCTUtils.mm",
    import.meta.url,
  ),
  "utf8",
);
const viewShotSource = readFileSync(
  new URL(
    "../../../node_modules/react-native-view-shot/ios/RNViewShot.mm",
    import.meta.url,
  ),
  "utf8",
);

test("view-shot tmpfile captures are generated inside the app temporary ReactNative directory", () => {
  assert.match(
    reactNativeUtilsSource,
    /NSTemporaryDirectory\(\)[\s\S]*stringByAppendingPathComponent:@"ReactNative"/,
  );
  assert.match(
    reactNativeUtilsSource,
    /NSString \*filename = \[NSUUID new\]\.UUIDString/,
  );
  assert.match(
    viewShotSource,
    /NSString \*path = RCTTempFilePath\(format, &error\)/,
  );
  assert.match(viewShotSource, /\[data writeToFile:path/);
  assert.match(viewShotSource, /resolve\(res\)/);
});

test("native promotion validates app-owned roots, extensions, symlinks, and generated destinations", () => {
  assert.match(
    swiftSource,
    /NSTemporaryDirectory\(\)[\s\S]*appendingPathComponent\("ReactNative", isDirectory: true\)/,
  );
  assert.match(swiftSource, /private func isStrictDescendant/);
  assert.match(swiftSource, /child\.pathComponents/);
  assert.match(swiftSource, /resolvingSymlinksInPath\(\)/);
  assert.match(
    swiftSource,
    /rawRelativeComponents == canonicalRelativeComponents/,
  );
  assert.match(swiftSource, /sourceValues\.isSymbolicLink != true/);
  assert.match(swiftSource, /sourceValues\.isRegularFile == true/);
  assert.match(swiftSource, /isReadableFile\(atPath: canonicalSource\.path\)/);
  assert.match(swiftSource, /normalized == "png" \|\| normalized == "jpg"/);
  assert.match(
    swiftSource,
    /source\.pathExtension\.lowercased\(\) == normalizedExtension/,
  );
  assert.match(swiftSource, /UUID\(\)\.uuidString/);
  assert.match(
    swiftSource,
    /private func exportDirectory[\s\S]*?\.cachesDirectory/,
  );
  assert.match(swiftSource, /directoryValues\.isSymbolicLink != true/);
  assert.match(
    swiftSource,
    /validatedExportURL\(destination, inside: directory\)/,
  );
  assert.doesNotMatch(
    swiftSource,
    /sourceURI[\s\S]*appendingPathComponent\(sourceURI/,
  );
});

test("native promotion copies, verifies protection and backup exclusion, then cleans bounded files", () => {
  assert.match(
    swiftSource,
    /AsyncFunction\("promoteTemporaryExport"\)[\s\S]*promoteTemporaryExport\(sourceURI:/,
  );
  assert.match(swiftSource, /copyItem\(at: source, to: validatedDestination\)/);
  assert.match(
    swiftSource,
    /setAttributes\([\s\S]*\.protectionKey: FileProtectionType\.complete/,
  );
  assert.match(swiftSource, /values\.isExcludedFromBackup = true/);
  assert.match(swiftSource, /values\.isExcludedFromBackup == true/);
  assert.match(swiftSource, /removeOwnedFileIfPresent\(source\)/);
  assert.match(swiftSource, /removeOwnedFileIfPresent\(partialDestination\)/);
  assert.match(swiftSource, /removeOwnedFileIfPresent\(validatedSource\)/);
  assert.match(
    swiftSource,
    /AsyncFunction\("deleteTemporaryExport"\)[\s\S]*deleteTemporaryExport\(uri:/,
  );
  assert.match(
    swiftSource,
    /deleteTemporaryExport[\s\S]*validatedExportURL\(requested, inside: directory\)/,
  );
  assert.doesNotMatch(
    swiftSource,
    /localizedDescription|debugDescription|NSUnderlyingErrorKey/,
  );
  assert.match(
    swiftSource,
    /userInfo: \[NSLocalizedDescriptionKey: "Protected export operation failed"\]/,
  );
});

test("production export and cleanup use only the protected native promotion boundary", () => {
  assert.match(exportSource, /appStorage\.promoteTemporaryExport\(/);
  assert.match(exportSource, /releaseCapture\(temporary\)/);
  assert.match(exportSource, /appStorage\.deleteTemporaryExport\(uri\)/);
  assert.doesNotMatch(
    exportSource,
    /expo-file-system|FileSystem\.(moveAsync|copyAsync)/,
  );
  assert.match(storageSource, /promoteTemporaryExport\([\s\S]*sourceUri/);
  assert.match(storageSource, /protected-export-promotion-unavailable/);
  assert.match(storageSource, /deleteTemporaryExport\(uri/);
  assert.match(fixtureSource, /appStorage\.promoteTemporaryExport\(/);
  assert.doesNotMatch(fixtureSource, /FileSystem\.moveAsync\(\{/);
});
