import { useEffect, useRef, useState, type ComponentRef } from "react";
import { StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { ExportSurface } from "./ExportSurface";
import { FormatDropdown } from "./FormatDropdown";
import {
  FlowBackButton,
  FlowBody,
  FlowHeading,
  FlowPrimaryButton,
  FlowScreen,
  FlowTextButton,
  flowColors,
} from "./flow-ui";
import { hasDrawing, type AssetKind, type ExportFormat } from "@/domain/models";
import {
  generateExport,
  cleanupGeneratedFiles,
  shareFile,
  type GeneratedFile,
} from "@/services/export";
import { generateExportBatch } from "@/services/exportBatch";
import { useAppState } from "@/state/AppStateProvider";
import {
  addConfirmedKind,
  everyGeneratedFileConfirmed,
} from "@/services/exportConfirmation";

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
  const [sharedKinds, setSharedKinds] = useState<AssetKind[]>([]);
  const [confirmedKinds, setConfirmedKinds] = useState<AssetKind[]>([]);
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
    setSharedKinds((current) => current.filter((item) => item !== kind));
    setConfirmedKinds((current) => current.filter((item) => item !== kind));
  };
  const completeDestination = async (file: GeneratedFile) => {
    setBusy(true);
    setError(null);
    try {
      await shareFile(file);
      setSharedKinds((current) => addConfirmedKind(current, file.kind));
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
    <FlowScreen
      contentStyle={styles.content}
      testID={purchased ? "paid-export-screen" : "free-export-screen"}
    >
      <View style={styles.back}>
        <FlowBackButton onPress={() => router.back()} />
      </View>
      <FlowHeading>
        {purchased ? "Export Transparent Set" : "White Background Export"}
      </FlowHeading>
      <FlowBody style={styles.intro}>Choose your export format.</FlowBody>
      <View style={[styles.card, styles.controls]}>
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
          <FlowTextButton
            label={`Add ${activeSet.unclaimedSlot === "initials" ? "Initials" : "Signature"}, Included`}
            onPress={() => {
              setSelectedAsset(activeSet.unclaimedSlot!);
              router.push({
                pathname: "/draw",
                params: { returnTo: "export" },
              });
            }}
          />
        ) : null}
      </View>
      {error ? (
        <Text accessibilityRole="alert" style={styles.error}>
          {error}
        </Text>
      ) : null}
      {generated.length === 0 ? (
        <FlowPrimaryButton
          label={busy ? "Preparing…" : "Export"}
          disabled={busy || assetCount === 0}
          onPress={() => {
            void prepare();
          }}
        />
      ) : (
        <View style={[styles.card, styles.destinations]}>
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
              <FlowPrimaryButton
                label="Share / Save to Files"
                onPress={() => {
                  void completeDestination(file);
                }}
                disabled={busy}
              />
              {sharedKinds.includes(file.kind) &&
              !confirmedKinds.includes(file.kind) ? (
                <FlowTextButton
                  label={`I Saved ${file.kind === "signature" ? "Signature" : "Initials"}`}
                  onPress={() =>
                    setConfirmedKinds((current) =>
                      addConfirmedKind(current, file.kind),
                    )
                  }
                />
              ) : null}
              {confirmedKinds.includes(file.kind) ? (
                <Text accessibilityRole="alert" style={styles.confirmed}>
                  {file.kind === "signature" ? "Signature" : "Initials"} save
                  confirmed.
                </Text>
              ) : null}
            </View>
          ))}
        </View>
      )}
      {everyGeneratedFileConfirmed(generated, confirmedKinds) ? (
        <View style={[styles.card, styles.completion]}>
          <Text accessibilityRole="alert" style={styles.shareStatus}>
            You confirmed every prepared file. Only Signature cannot inspect the
            destination you selected.
          </Text>
          <FlowPrimaryButton
            label="Continue"
            onPress={() => {
              recordExport();
              router.replace({
                pathname: "/success",
                params: { mode: purchased ? "purchased" : "free" },
              });
            }}
          />
          <FlowTextButton
            label="Done"
            onPress={() => {
              recordExport();
              router.replace("/saved");
            }}
          />
        </View>
      ) : null}
      {purchased ? (
        <FlowTextButton
          label="Create New"
          onPress={() => {
            if (createNew()) router.replace("/draw");
          }}
          disabled={busy}
        />
      ) : null}
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
    </FlowScreen>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 28, gap: 16 },
  back: { height: 32, alignSelf: "flex-start" },
  intro: { marginTop: -8 },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#D6E0E3",
    backgroundColor: flowColors.card,
    padding: 16,
  },
  controls: { gap: 18 },
  error: {
    color: "#FFD8D2",
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "700",
  },
  destinations: { gap: 14 },
  completion: { gap: 12 },
  destinationTitle: {
    color: flowColors.cardText,
    fontSize: 20,
    lineHeight: 25,
    fontWeight: "800",
  },
  destinationHint: {
    color: flowColors.cardMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  shareStatus: {
    color: flowColors.cardText,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
  },
  confirmed: {
    color: flowColors.accessibleLink,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "700",
  },
  file: {
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: "#D6E0E3",
    paddingTop: 14,
  },
  fileTitle: { color: flowColors.cardText, fontSize: 16, fontWeight: "800" },
});
