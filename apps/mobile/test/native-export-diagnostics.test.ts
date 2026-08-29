import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  nativeExportFailurePrefix,
  nativeExportStatusForError,
  runNativeExportStage,
} from "../src/domain/nativeExportDiagnostics";

test("native export diagnostics identify the failed operation without leaking the cause", async () => {
  const sensitiveCause = "/private/simulator/signature.png";
  let observed: unknown;

  try {
    await runNativeExportStage("render transparent PNG", async () => {
      throw {
        domain: "NSCocoaErrorDomain",
        code: 4,
        message: sensitiveCause,
        userInfo: {
          NSUnderlyingError: {
            domain: "NSPOSIXErrorDomain",
            code: 2,
            message: sensitiveCause,
          },
        },
      };
    });
  } catch (error) {
    observed = error;
  }

  const status = nativeExportStatusForError(observed);
  assert.equal(
    status,
    `${nativeExportFailurePrefix}: render transparent PNG [domain=NSCocoaErrorDomain code=4 posix=2]`,
  );
  assert.doesNotMatch(status, new RegExp(sensitiveCause));
});

test("native export diagnostics discard unsafe domain and code strings", async () => {
  let observed: unknown;
  try {
    await runNativeExportStage("inspect existing target", async () => {
      throw {
        domain: "/private/simulator",
        code: "signature contents",
      };
    });
  } catch (error) {
    observed = error;
  }
  assert.equal(
    nativeExportStatusForError(observed),
    `${nativeExportFailurePrefix}: inspect existing target`,
  );
});

test("native export diagnostics fail closed on unclassified errors", () => {
  assert.equal(
    nativeExportStatusForError(new Error("unclassified private detail")),
    `${nativeExportFailurePrefix}: unknown stage`,
  );
});

test("native export fixture narrows reset stages without changing production export services", () => {
  const source = readFileSync(
    new URL("../src/app/native-export-test.tsx", import.meta.url),
    "utf8",
  );
  assert.match(
    source,
    /isAuthorizedScreenshotFixture\(fixture, "native-export"\)/,
  );
  const orderedStages = [
    "resolve verification container",
    "inspect existing target",
    "remove existing target",
    "create target directory",
    "apply target protection",
    "verify target existence and writability",
  ];
  let offset = -1;
  for (const stage of orderedStages) {
    const next = source.indexOf(`"${stage}"`);
    assert.ok(next > offset, `${stage} must follow the preceding stage`);
    offset = next;
  }
  assert.match(source, /if \(existing\.exists\)/);
  assert.match(source, /protectTemporaryFile\(output\)/);
  assert.match(source, /writeAsStringAsync\(probe, "ok"\)/);
  assert.doesNotMatch(source, /reset verification directory/);
});
