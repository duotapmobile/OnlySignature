export type HapticKind =
  | "selection"
  | "light"
  | "success"
  | "warning"
  | "error";

export type HapticDriver = Record<HapticKind, () => Promise<void>>;

export function createDebouncedHapticService(
  driver: HapticDriver,
  {
    debounceMs = 180,
    now = Date.now,
  }: { debounceMs?: number; now?: () => number } = {},
) {
  const lastPlayed = new Map<HapticKind, number>();

  const play = async (kind: HapticKind): Promise<void> => {
    const playedAt = now();
    if (playedAt - (lastPlayed.get(kind) ?? -Infinity) < debounceMs) return;
    lastPlayed.set(kind, playedAt);
    try {
      await driver[kind]();
    } catch {
      // Haptics are optional and must never interrupt a customer action.
    }
  };

  return {
    selection: () => play("selection"),
    lightImpact: () => play("light"),
    success: () => play("success"),
    warning: () => play("warning"),
    error: () => play("error"),
  };
}
