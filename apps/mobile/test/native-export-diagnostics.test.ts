import assert from "node:assert/strict";
import test from "node:test";
import {
  nativeExportFailurePrefix,
  nativeExportStatusForError,
  runNativeExportStage,
} from "../src/domain/nativeExportDiagnostics";

test("native export diagnostics identify the failed operation without leaking the cause", async () => {
  const sensitiveCause = "private simulator path and file contents";
  let observed: unknown;

  try {
    await runNativeExportStage("render transparent PNG", async () => {
      throw new Error(sensitiveCause);
    });
  } catch (error) {
    observed = error;
  }

  const status = nativeExportStatusForError(observed);
  assert.equal(status, `${nativeExportFailurePrefix}: render transparent PNG`);
  assert.doesNotMatch(status, new RegExp(sensitiveCause));
});

test("native export diagnostics fail closed on unclassified errors", () => {
  assert.equal(
    nativeExportStatusForError(new Error("unclassified private detail")),
    `${nativeExportFailurePrefix}: unknown stage`,
  );
});
