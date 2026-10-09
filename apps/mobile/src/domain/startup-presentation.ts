export const storageStartupError =
  "Saved signatures are temporarily unavailable. Unlock this device and reopen Only Signature. No purchase will be finished until storage is available.";

// New UI-only fallback copy, not a storage or purchase classification.
export const visualStartupError =
  "The opening visuals could not load. Reopen Only Signature to try again. Your saved signing sets are unchanged.";

export function startupPresentation({
  hydrated,
  error,
  assetsReady,
  assetsFailed,
  clientReady,
  recoveryLaidOut,
  navigationLaidOut,
}: {
  hydrated: boolean;
  error: string | null;
  assetsReady: boolean;
  assetsFailed: boolean;
  clientReady: boolean;
  recoveryLaidOut: boolean;
  navigationLaidOut: boolean;
}) {
  const recoveryMessage =
    !hydrated && error ? error : assetsFailed ? visualStartupError : null;
  const phase = recoveryMessage
    ? "recovery"
    : hydrated && assetsReady && clientReady
      ? "ready"
      : "loading";
  return {
    phase,
    recoveryMessage,
    navigationReady: phase === "ready",
    hideSplash:
      clientReady &&
      (phase === "ready"
        ? navigationLaidOut
        : phase === "recovery" &&
          recoveryLaidOut &&
          (assetsReady || assetsFailed)),
  } as const;
}
