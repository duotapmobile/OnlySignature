import { useEffect, useRef, useState, type ComponentRef } from "react";
import { Text, View } from "react-native";
import * as FileSystem from "expo-file-system/legacy";
import { useLocalSearchParams } from "expo-router";
import { ExportSurface } from "@/components/ExportSurface";
import { Heading, Screen } from "@/components/ui";
import { screenshotFixtureSet } from "@/domain/fixtures";
import { isAuthorizedScreenshotFixture } from "@/config/screenshotFixtures";
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
          const root = await appStorage.ensureTempDirectory();
          const output = `${root.replace(/\/$/, "")}/native-export-verification/`;
          await FileSystem.deleteAsync(output, { idempotent: true });
          await FileSystem.makeDirectoryAsync(output, { intermediates: true });
          const transparent = await generateExport(
            asset,
            "png-transparent",
            transparentRef,
          );
          const white = await generateExport(asset, "png-white", whiteRef);
          const jpeg = await generateExport(asset, "jpeg-white", whiteRef);
          await Promise.all([
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
          ]);
          setStatus("Native export verification files ready");
        } catch {
          setStatus("Native export verification failed");
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
