import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  startupPresentation,
  storageStartupError,
  visualStartupError,
} from "../src/domain/startup-presentation";

const waiting = {
  hydrated: false,
  error: null,
  assetsReady: false,
  assetsFailed: false,
  clientReady: true,
  recoveryLaidOut: false,
  navigationLaidOut: false,
};

test("startup keeps navigation and native splash blocked until storage and assets are ready", () => {
  for (const state of [
    waiting,
    { ...waiting, hydrated: true },
    { ...waiting, assetsReady: true },
  ]) {
    assert.deepEqual(startupPresentation(state), {
      phase: "loading",
      recoveryMessage: null,
      navigationReady: false,
      hideSplash: false,
    });
  }
});

test("a protected-storage failure exposes recovery only after its content and assets are ready", () => {
  const failed = { ...waiting, error: storageStartupError };
  const result = startupPresentation(failed);
  assert.equal(result.phase, "recovery");
  assert.equal(result.recoveryMessage, storageStartupError);
  assert.equal(result.navigationReady, false);
  assert.equal(result.hideSplash, false);
  assert.equal(
    startupPresentation({ ...failed, assetsReady: true }).hideSplash,
    false,
  );
  assert.equal(
    startupPresentation({ ...failed, recoveryLaidOut: true }).hideSplash,
    false,
  );
  assert.equal(
    startupPresentation({ ...failed, assetsReady: true, recoveryLaidOut: true })
      .hideSplash,
    true,
  );
});

test("failed launch artwork uses a text-safe recovery surface and never opens route actions", () => {
  const failed = { ...waiting, hydrated: true, assetsFailed: true };
  const result = startupPresentation(failed);
  assert.equal(result.recoveryMessage, visualStartupError);
  assert.equal(result.navigationReady, false);
  assert.equal(result.hideSplash, false);
  assert.equal(
    startupPresentation({ ...failed, recoveryLaidOut: true }).hideSplash,
    true,
  );
});

test("storage recovery takes precedence over an accompanying artwork failure", () => {
  const result = startupPresentation({
    ...waiting,
    error: storageStartupError,
    assetsFailed: true,
    recoveryLaidOut: true,
  });
  assert.equal(result.recoveryMessage, storageStartupError);
  assert.equal(result.hideSplash, true);
  assert.equal(result.navigationReady, false);
});

test("ready navigation lays out before splash release and the server snapshot cannot release it", () => {
  const ready = { ...waiting, hydrated: true, assetsReady: true };
  assert.equal(startupPresentation(ready).navigationReady, true);
  assert.equal(startupPresentation(ready).hideSplash, false);
  assert.equal(
    startupPresentation({ ...ready, navigationLaidOut: true }).hideSplash,
    true,
  );
  assert.equal(
    startupPresentation({
      ...ready,
      clientReady: false,
      navigationLaidOut: true,
    }).navigationReady,
    false,
  );
  assert.equal(
    startupPresentation({
      ...waiting,
      error: storageStartupError,
      assetsReady: true,
      recoveryLaidOut: true,
      clientReady: false,
    }).hideSplash,
    false,
  );
});

test("an ordinary operation error after successful hydration does not replace navigation", () => {
  const result = startupPresentation({
    ...waiting,
    hydrated: true,
    assetsReady: true,
    navigationLaidOut: true,
    error: "Export failed",
  });
  assert.equal(result.phase, "ready");
  assert.equal(result.recoveryMessage, null);
  assert.equal(result.hideSplash, true);
});

test("root recovery preserves the provider message and blocks all deep-linked controls", async () => {
  const [provider, layout, surface] = await Promise.all([
    readFile(
      new URL("../src/state/AppStateProvider.tsx", import.meta.url),
      "utf8",
    ),
    readFile(new URL("../src/app/_layout.tsx", import.meta.url), "utf8"),
    readFile(
      new URL("../src/components/startup-surface.tsx", import.meta.url),
      "utf8",
    ),
  ]);
  assert(provider.includes(storageStartupError));
  assert.match(layout, /startup\.navigationReady \? \([\s\S]*?<Stack/);
  assert.match(
    layout,
    /startup\.navigationReady \? <GlobalErrorBanner \/> : null/,
  );
  assert.match(
    layout,
    /if \(!startup\.hideSplash \|\| hideStarted\.current\) return/,
  );
  assert.match(
    layout,
    /data\.lastError === recoveredMessage\) dismissError\(\)/,
  );
  assert.match(surface, /<ScrollView/);
  assert.match(surface, /accessibilityRole="alert"/);
  assert.match(surface, /aria-hidden=\{true\}/);
  assert.match(surface, /onLoad=/);
  assert.match(surface, /onError=/);
  assert.match(surface, /10_000/);
  assert.doesNotMatch(
    surface,
    /<Pressable|<Button|allowFontScaling=\{false\}|numberOfLines=/,
  );
});
