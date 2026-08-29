import { useEffect, useRef, useState, type ComponentRef } from "react";
import { Text, View } from "react-native";
import { captureRef } from "react-native-view-shot";
import * as FileSystem from "expo-file-system/legacy";
import { useLocalSearchParams } from "expo-router";
import { ExportSurface } from "@/components/ExportSurface";
import { Heading, Screen } from "@/components/ui";
import { screenshotFixtureSet } from "@/domain/fixtures";
import { exportDimensions } from "@/domain/drawing";
import { isAuthorizedScreenshotFixture } from "@/config/screenshotFixtures";
import {
  nativeExportStatusForError,
  runNativeExportStage,
} from "@/domain/nativeExportDiagnostics";
import { generateExport } from "@/services/export";
import { appStorage } from "@/services/storage";

const diagnosticCode = (code: string) => Object.assign(new Error(), { code });

const normalizeCapturedFileUri = (value: unknown): string => {
  if (typeof value !== "string" || value.length === 0)
    throw diagnosticCode("CAPTURE_URI_INVALID");
  if (value.startsWith("file://")) return value;
  if (value.startsWith("/")) return `file://${value}`;
  throw diagnosticCode("CAPTURE_URI_UNSUPPORTED");
};

export default function NativeExportTestScreen() {
  const { fixture } = useLocalSearchParams<{ fixture?: string }>();
  const authorized = isAuthorizedScreenshotFixture(fixture, "native-export");
  const [status, setStatus] = useState("Preparing native export verification");
  const transparentRef = useRef<ComponentRef<typeof View>>(null);
  const whiteRef = useRef<ComponentRef<typeof View>>(null);
  const asset = screenshotFixtureSet.signature!;

  useEffect(() => {
    if (!authorized) return;
    const timer = setTimeout(() => {
      void (async () => {
        try {
          const root = await runNativeExportStage(
            "resolve verification container",
            () => appStorage.ensureTempDirectory(),
          );
          const output = `${root.replace(/\/$/, "")}/native-export-verification/`;
          const existing = await runNativeExportStage(
            "inspect existing target",
            () => FileSystem.getInfoAsync(output),
          );
          if (existing.exists) {
            await runNativeExportStage("remove existing target", () =>
              FileSystem.deleteAsync(output, { idempotent: false }),
            );
          }
          await runNativeExportStage("create target directory", () =>
            FileSystem.makeDirectoryAsync(output, { intermediates: true }),
          );
          await runNativeExportStage("apply target protection", () =>
            appStorage.protectTemporaryFile(output),
          );
          await runNativeExportStage(
            "verify target existence and writability",
            async () => {
              const info = await FileSystem.getInfoAsync(output);
              if (!info.exists || !info.isDirectory) {
                throw Object.assign(new Error(), {
                  code: "TARGET_NOT_DIRECTORY",
                });
              }
              const probe = `${output}.write-check`;
              await FileSystem.writeAsStringAsync(probe, "ok");
              await appStorage.protectTemporaryFile(probe);
              await FileSystem.deleteAsync(probe, { idempotent: true });
            },
          );
          const captureTarget = await runNativeExportStage(
            "resolve/capture view reference",
            async () => {
              if (!transparentRef.current)
                throw diagnosticCode("CAPTURE_VIEW_UNAVAILABLE");
              return transparentRef;
            },
          );
          let capturedSource: string | null = null;
          const transparentDestination = `${output}signature-transparent.png`;
          try {
            const dimensions = exportDimensions(asset);
            const rawSource = await runNativeExportStage(
              "invoke captureRef",
              () =>
                captureRef(captureTarget, {
                  format: "png",
                  quality: 1,
                  result: "tmpfile",
                  width: dimensions.width,
                  height: dimensions.height,
                }),
            );
            capturedSource = await runNativeExportStage(
              "validate/normalize returned source URI",
              async () => normalizeCapturedFileUri(rawSource),
            );
            await runNativeExportStage(
              "verify source existence/readability",
              async () => {
                const info = await FileSystem.getInfoAsync(capturedSource!);
                if (!info.exists || info.isDirectory)
                  throw diagnosticCode("CAPTURE_SOURCE_UNREADABLE");
                await FileSystem.readAsStringAsync(capturedSource!, {
                  encoding: FileSystem.EncodingType.Base64,
                  position: 0,
                  length: 1,
                });
              },
            );
            await runNativeExportStage(
              "prepare/remove destination",
              async () => {
                const destination = await FileSystem.getInfoAsync(
                  transparentDestination,
                );
                if (destination.exists)
                  await FileSystem.deleteAsync(transparentDestination, {
                    idempotent: false,
                  });
              },
            );
            await runNativeExportStage(
              "move/copy captured file to protected Caches target",
              () =>
                FileSystem.moveAsync({
                  from: capturedSource!,
                  to: transparentDestination,
                }),
            );
            capturedSource = null;
            await runNativeExportStage("apply Complete Protection", () =>
              appStorage.protectTemporaryFile(transparentDestination),
            );
            await runNativeExportStage("apply/verify backup exclusion", () =>
              appStorage.verifyTemporaryFileProtection(transparentDestination),
            );
            await runNativeExportStage(
              "verify final target existence/readability",
              async () => {
                const info = await FileSystem.getInfoAsync(
                  transparentDestination,
                );
                if (!info.exists || info.isDirectory)
                  throw diagnosticCode("CAPTURE_TARGET_UNREADABLE");
                await FileSystem.readAsStringAsync(transparentDestination, {
                  encoding: FileSystem.EncodingType.Base64,
                  position: 0,
                  length: 1,
                });
              },
            );
          } catch (error) {
            if (capturedSource)
              await FileSystem.deleteAsync(capturedSource, {
                idempotent: true,
              }).catch(() => undefined);
            throw error;
          }
          const white = await runNativeExportStage("render white PNG", () =>
            generateExport(asset, "png-white", whiteRef),
          );
          const jpeg = await runNativeExportStage("render white JPEG", () =>
            generateExport(asset, "jpeg-white", whiteRef),
          );
          await runNativeExportStage("copy verification files", () =>
            Promise.all([
              FileSystem.copyAsync({
                from: white.uri,
                to: `${output}signature-white.png`,
              }),
              FileSystem.copyAsync({
                from: jpeg.uri,
                to: `${output}signature-white.jpg`,
              }),
            ]).then(() => undefined),
          );
          setStatus("Native export verification files ready");
        } catch (error) {
          setStatus(nativeExportStatusForError(error));
        }
      })();
    }, 750);
    return () => clearTimeout(timer);
  }, [asset, authorized]);

  if (!authorized)
    return (
      <Screen>
        <Heading>Unavailable</Heading>
        <Text>This internal fixture is disabled.</Text>
      </Screen>
    );
  return (
    <Screen testID="native-export-test-screen">
      <Heading>Native Export Verification</Heading>
      <Text accessibilityRole="alert">{status}</Text>
      <ExportSurface ref={transparentRef} asset={asset} white={false} />
      <ExportSurface ref={whiteRef} asset={asset} white />
    </Screen>
  );
}
