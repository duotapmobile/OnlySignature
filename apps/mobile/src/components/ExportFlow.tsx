import { useEffect, useRef, useState, type ComponentRef } from "react";
import { StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { ExportSurface } from "./ExportSurface";
import { FormatDropdown } from "./FormatDropdown";
import {
  BackLink,
  Body,
  GlassCard,
  Heading,
  PrimaryButton,
  Screen,
  SecondaryButton,
} from "./ui";
import { hasDrawing, type AssetKind, type ExportFormat } from "@/domain/models";
import { theme } from "@/integrations/workspace";
import {
  generateExport,
  cleanupGeneratedFiles,
  shareFile,
  type GeneratedFile,
} from "@/services/export";
import { generateExportBatch } from "@/services/exportBatch";
import { useAppState } from "@/state/AppStateProvider";
import { confirmAuthorizedUse } from "@/services/authorizedUse";

const paidFormats: ExportFormat[] = [
  "png-transparent",
  "png-white",
  "jpeg-white",
];
const freeFormats: ExportFormat[] = ["png-white", "jpeg-white"];

export function ExportFlow({ purchased }: { purchased: boolean }) {
  const { activeSet, createNew, recordExport, setSelectedAsset } =
    useAppState();
  const [signatureFormat, setSignatureFormat] = useState<ExportFormat>(
    purchased ? "png-transparent" : "png-white",
  );
  const [initialsFormat, setInitialsFormat] = useState<ExportFormat>(
    purchased ? "png-transparent" : "png-white",
  );
  const [generated, setGenerated] = useState<GeneratedFile[]>([]);
  const generatedRef = useRef<GeneratedFile[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shareClosed, setShareClosed] = useState(false);
  const signatureRef = useRef<ComponentRef<typeof View>>(null);
  const initialsRef = useRef<ComponentRef<typeof View>>(null);
  const assetCount =
    Number(hasDrawing(activeSet.signature)) +
    Number(hasDrawing(activeSet.initials));

  useEffect(() => {
    generatedRef.current = generated;
  }, [generated]);

  useEffect(
    () => () => {
      void cleanupGeneratedFiles(generatedRef.current);
    },
    [],
  );

  const prepare = async () => {
    setBusy(true);
    setError(null);
    try {
      await cleanupGeneratedFiles(generatedRef.current);
      generatedRef.current = [];
      const producers: (() => Promise<GeneratedFile>)[] = [];
      if (hasDrawing(activeSet.signature)) {
        const signature = activeSet.signature;
        producers.push(() =>
          generateExport(signature, signatureFormat, signatureRef),
        );
      }
      if (hasDrawing(activeSet.initials)) {
        const initials = activeSet.initials;
        producers.push(() =>
          generateExport(initials, initialsFormat, initialsRef),
        );
      }
      const files = await generateExportBatch(producers, cleanupGeneratedFiles);
      setGenerated(files);
    } catch {
      setError(
        "We could not create the export file. Your saved drawing is unchanged.",
      );
    } finally {
      setBusy(false);
    }
  };
  const changeFormat = (kind: AssetKind, format: ExportFormat): void => {
    if (kind === "signature") setSignatureFormat(format);
    else setInitialsFormat(format);
    const stale = generatedRef.current;
    generatedRef.current = [];
    setGenerated([]);
    void cleanupGeneratedFiles(stale);
    setShareClosed(false);
  };
  const completeDestination = async (file: GeneratedFile) => {
    setBusy(true);
    setError(null);
    try {
      await shareFile(file);
      setShareClosed(true);
      return;
    } catch {
      setError(
        "That export action did not finish. Your saved drawing is unchanged.",
      );
    } finally {
      setBusy(false);
    }
  };

  const formats = purchased ? paidFormats : freeFormats;
  return (
    <Screen testID={purchased ? "paid-export-screen" : "free-export-screen"}>
      <Heading>
        {purchased ? "Thanks for your purchase" : "White Background Export"}
      </Heading>
      <Body>Choose your export format.</Body>
      <GlassCard style={styles.controls}>
        {hasDrawing(activeSet.signature) ? (
          <FormatDropdown
            label="Signature"
            value={signatureFormat}
            formats={formats}
            onChange={(format) => changeFormat("signature", format)}
          />
        ) : null}
        {hasDrawing(activeSet.initials) ? (
          <FormatDropdown
            label="Initials"
            value={initialsFormat}
            formats={formats}
            onChange={(format) => changeFormat("initials", format)}
          />
        ) : null}
        {purchased &&
        activeSet.unclaimedSlot &&
        !activeSet.transactionFinishPending ? (
          <SecondaryButton
            label={`Add ${activeSet.unclaimedSlot === "initials" ? "Initials" : "Signature"}, Included`}
            onPress={() => {
              setSelectedAsset(activeSet.unclaimedSlot!);
              router.push("/draw");
            }}
          />
        ) : null}
      </GlassCard>
      {error ? (
        <Text accessibilityRole="alert" style={styles.error}>
          {error}
        </Text>
      ) : null}
      {generated.length === 0 ? (
        <PrimaryButton
          label={busy ? "Preparing…" : "Export"}
          disabled={busy || assetCount === 0}
          onPress={() => {
            void prepare();
          }}
        />
      ) : (
        <GlassCard style={styles.destinations}>
          <Text accessibilityRole="header" style={styles.destinationTitle}>
            Choose where to save
          </Text>
          <Text style={styles.destinationHint}>
            Share includes Save to Files and AirDrop. What you choose next is
            handled by that app or service under its own terms.
          </Text>
          {generated.map((file) => (
            <View key={file.kind} style={styles.file}>
              <Text style={styles.fileTitle}>
                {file.kind === "signature" ? "Signature" : "Initials"}
              </Text>
              <PrimaryButton
                label="Share / Save to Files"
                onPress={() => {
                  void completeDestination(file);
                }}
                disabled={busy}
              />
            </View>
          ))}
        </GlassCard>
      )}
      {shareClosed ? (
        <GlassCard>
          <Text accessibilityRole="alert" style={styles.shareStatus}>
            Sharing closed. If you selected a destination, check that location
            for the file. Only Signature cannot see which action you chose.
          </Text>
          <PrimaryButton
            label="I Saved It"
            onPress={() => {
              recordExport();
              router.replace({
                pathname: "/success",
                params: { mode: purchased ? "purchased" : "free" },
              });
            }}
          />
          <SecondaryButton
            label="Done"
            onPress={() => router.replace("/saved")}
          />
        </GlassCard>
      ) : null}
      {purchased ? (
        <SecondaryButton
          label="Create New"
          onPress={() => {
            confirmAuthorizedUse(() => {
              if (createNew()) router.replace("/draw");
            });
          }}
          disabled={busy}
        />
      ) : null}
      <BackLink onPress={() => router.back()} />
      {hasDrawing(activeSet.signature) ? (
        <ExportSurface
          ref={signatureRef}
          asset={activeSet.signature}
          white={signatureFormat !== "png-transparent"}
        />
      ) : null}
      {hasDrawing(activeSet.initials) ? (
        <ExportSurface
          ref={initialsRef}
          asset={activeSet.initials}
          white={initialsFormat !== "png-transparent"}
        />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  controls: { gap: 22 },
  error: { color: "#FFE0DB", fontSize: 17, lineHeight: 24, fontWeight: "700" },
  destinations: { gap: 14 },
  destinationTitle: {
    color: theme.colors.text,
    fontSize: 23,
    fontWeight: "800",
  },
  destinationHint: { color: theme.colors.muted, fontSize: 16, lineHeight: 23 },
  shareStatus: {
    color: theme.colors.text,
    fontSize: 17,
    lineHeight: 24,
    fontWeight: "600",
  },
  file: {
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: "#D6E0E3",
    paddingTop: 14,
  },
  fileTitle: { color: theme.colors.text, fontSize: 19, fontWeight: "800" },
});
