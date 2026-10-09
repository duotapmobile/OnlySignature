import type { SignatureSet } from "./models";

export function savedSetCreationLabel(
  set: Pick<SignatureSet, "createdAt">,
  locale?: string,
): string {
  const date = set.createdAt ? new Date(set.createdAt) : null;
  if (!date || !Number.isFinite(date.getTime()))
    return "Creation date unavailable";
  return `Created ${date.toLocaleDateString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  })}`;
}
