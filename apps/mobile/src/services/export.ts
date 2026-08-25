import type { ComponentRef, RefObject } from "react";
import { AccessibilityInfo, View } from "react-native";
import { captureRef } from "react-native-view-shot";
import * as FileSystem from "expo-file-system/legacy";
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
  const root = await appStorage.ensureTempDirectory();
  const directory = `${root.replace(/\/$/, "")}/${Math.random().toString(36).slice(2)}-${Date.now()}/`;
  await FileSystem.makeDirectoryAsync(directory, { intermediates: true });
  const destination = `${directory}${asset.kind}.${extensionFor(format)}`;
  if (!surfaceRef.current) throw new Error("export-surface-unavailable");
  const dimensions = exportDimensions(asset);
  const temporary = await captureRef(surfaceRef, {
    format: format === "jpeg-white" ? "jpg" : "png",
    quality: 1,
    result: "tmpfile",
    width: dimensions.width,
    height: dimensions.height,
  });
  await FileSystem.moveAsync({ from: temporary, to: destination });
  await appStorage.protectTemporaryFile(destination);
  return { uri: destination, format, kind: asset.kind };
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
