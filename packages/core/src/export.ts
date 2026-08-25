import type { ExportFormat } from "./types";

export interface FormatDefinition {
  id: ExportFormat;
  label: string;
  mime: string;
  extension: "png" | "jpg";
  transparent: boolean;
}

export const formats: readonly FormatDefinition[] = [
  {
    id: "png-transparent",
    label: "PNG, Transparent",
    mime: "image/png",
    extension: "png",
    transparent: true,
  },
  {
    id: "png-white",
    label: "PNG, White Background",
    mime: "image/png",
    extension: "png",
    transparent: false,
  },
  {
    id: "jpeg-white",
    label: "JPEG, White Background",
    mime: "image/jpeg",
    extension: "jpg",
    transparent: false,
  },
] as const;

export function formatById(id: ExportFormat): FormatDefinition {
  const format = formats.find((candidate) => candidate.id === id);
  if (!format) throw new Error(`Unsupported export format: ${String(id)}`);
  return format;
}

export function safeExportFilename(
  kind: "signature" | "initials",
  format: ExportFormat,
  used: ReadonlySet<string>,
): string {
  const extension = formatById(format).extension;
  let counter = 1;
  let name = `${kind}.${extension}`;
  while (used.has(name)) {
    counter += 1;
    name = `${kind}-${counter}.${extension}`;
  }
  return name;
}

export function assertTransparencyTruth(
  format: ExportFormat,
  requestedTransparent: boolean,
): void {
  if (requestedTransparent && !formatById(format).transparent)
    throw new Error("Selected format does not support transparency");
}
