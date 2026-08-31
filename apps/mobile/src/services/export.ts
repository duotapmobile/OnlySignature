import type { ComponentRef, RefObject } from "react";
import { AccessibilityInfo, View } from "react-native";
import { captureRef, releaseCapture } from "react-native-view-shot";
import * as Sharing from "expo-sharing";
import type { AssetKind, DrawingAsset, ExportFormat } from "@/domain/models";
import { exportDimensions } from "@/domain/drawing";
import { appStorage } from "./storage";

export interface GeneratedFile {
  uri: string;
  format: ExportFormat;
  kind: AssetKind;
}

const extensionFor = (format: ExportFormat): "png" | "jpg" =>
  format === "jpeg-white" ? "jpg" : "png";

export async function generateExport(
  asset: DrawingAsset,
  format: ExportFormat,
  surfaceRef: RefObject<ComponentRef<typeof View> | null>,
): Promise<GeneratedFile> {
  let temporary: string | null = null;
  try {
    if (!surfaceRef.current) throw new Error("export-surface-unavailable");
    const dimensions = exportDimensions(asset);
    temporary = await captureRef(surfaceRef, {
      format: format === "jpeg-white" ? "jpg" : "png",
      quality: 1,
      result: "tmpfile",
      width: dimensions.width,
      height: dimensions.height,
    });
    const destination = await appStorage.promoteTemporaryExport(
      temporary,
      extensionFor(format),
    );
    temporary = null;
    return { uri: destination, format, kind: asset.kind };
  } catch (error) {
    if (temporary) releaseCapture(temporary);
    throw error;
  }
}

export async function shareFile(file: GeneratedFile): Promise<void> {
  if (!(await Sharing.isAvailableAsync()))
    throw new Error("sharing-unavailable");
  await Sharing.shareAsync(file.uri, {
    mimeType: file.format === "jpeg-white" ? "image/jpeg" : "image/png",
    UTI: file.format === "jpeg-white" ? "public.jpeg" : "public.png",
  });
  AccessibilityInfo.announceForAccessibility("Share sheet closed.");
}

export async function cleanupGeneratedFiles(
  files: GeneratedFile[],
): Promise<void> {
  const uris = new Set(files.map((file) => file.uri));
  await Promise.all(
    [...uris].map((uri) => appStorage.deleteTemporaryExport(uri)),
  );
}
