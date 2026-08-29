import { useEffect, useRef, useState, type ComponentRef } from "react";
import { Text, View } from "react-native";
import * as FileSystem from "expo-file-system/legacy";
import { useLocalSearchParams } from "expo-router";
import { ExportSurface } from "@/components/ExportSurface";
import { Heading, Screen } from "@/components/ui";
import { screenshotFixtureSet } from "@/domain/fixtures";
import { isAuthorizedScreenshotFixture } from "@/config/screenshotFixtures";
import {
  nativeExportStatusForError,
  runNativeExportStage,
} from "@/domain/nativeExportDiagnostics";
import { generateExport } from "@/services/export";
import { appStorage } from "@/services/storage";

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
          const transparent = await runNativeExportStage(
            "render transparent PNG",
            () => generateExport(asset, "png-transparent", transparentRef),
          );
          const white = await runNativeExportStage("render white PNG", () =>
            generateExport(asset, "png-white", whiteRef),
          );
          const jpeg = await runNativeExportStage("render white JPEG", () =>
            generateExport(asset, "jpeg-white", whiteRef),
          );
          await runNativeExportStage("copy verification files", () =>
            Promise.all([
              FileSystem.copyAsync({
                from: transparent.uri,
                to: `${output}signature-transparent.png`,
              }),
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
