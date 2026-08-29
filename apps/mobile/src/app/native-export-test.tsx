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
            "prepare protected temporary directory",
            () => appStorage.ensureTempDirectory(),
          );
          const output = `${root.replace(/\/$/, "")}/native-export-verification/`;
          await runNativeExportStage("reset verification directory", () =>
            FileSystem.deleteAsync(output, { idempotent: true }),
          );
          await runNativeExportStage("create verification directory", () =>
            FileSystem.makeDirectoryAsync(output, { intermediates: true }),
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
