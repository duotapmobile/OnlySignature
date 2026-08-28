import type { AssetKind } from "@/domain/models";
import type { GeneratedFile } from "./export";

export function addConfirmedKind(
  current: readonly AssetKind[],
  kind: AssetKind,
): AssetKind[] {
  return current.includes(kind) ? [...current] : [...current, kind];
}

export function everyGeneratedFileConfirmed(
  generated: readonly GeneratedFile[],
  confirmed: readonly AssetKind[],
): boolean {
  return (
    generated.length > 0 &&
    generated.every((file) => confirmed.includes(file.kind))
  );
}
