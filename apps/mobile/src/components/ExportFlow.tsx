import { useEffect, useRef, useState, type ComponentRef } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
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
  cleanupGeneratedFiles,
  generateExport,
  saveFileToPhotos,
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

function DestinationButton({
  label,
  onPress,
  disabled,
}: {
  label: string;
  onPress(): void;
  disabled: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.destinationButton,
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      <Text style={styles.destinationButtonText}>{label}</Text>
    </Pressable>
  );
}

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
  const [saveModalVisible, setSaveModalVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmedKinds, setConfirmedKinds] = useState<AssetKind[]>([]);
  const signatureRef = useRef<ComponentRef<typeof View>>(null);
  const initialsRef = useRef<ComponentRef<typeof View>>(null);
  const assetCount =
    Number(hasDrawing(activeSet.signature)) +
    Number(hasDrawing(activeSet.initials));
  const allSaved = everyGeneratedFileConfirmed(generated, confirmedKinds);

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
      setConfirmedKinds([]);
      setSaveModalVisible(true);
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
    setConfirmedKinds((current) => current.filter((item) => item !== kind));
    void cleanupGeneratedFiles(stale);
  };

  const saveDestination = async (
    file: GeneratedFile,
    destination: "photos" | "share",
  ) => {
    setBusy(true);
    setError(null);
    try {
      if (destination === "photos") await saveFileToPhotos(file);
      else await shareFile(file);
      setConfirmedKinds((current) => addConfirmedKind(current, file.kind));
    } catch {
      setError(
        destination === "photos"
          ? "Photo access was not granted or the image could not be saved."
          : "The share action did not finish. Your saved drawing is unchanged.",
      );
    } finally {
      setBusy(false);
    }
  };

  const finish = (toSaved: boolean) => {
    recordExport();
    setSaveModalVisible(false);
    if (toSaved) router.replace("/saved");
    else {
      router.replace({
        pathname: "/success",
        params: { mode: purchased ? "purchased" : "free" },
      });
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
      <FlowPrimaryButton
        label={
          busy
            ? "Preparing..."
            : generated.length > 0
              ? "Choose Save Location"
              : "Download"
        }
        disabled={busy || assetCount === 0}
        onPress={() => {
          if (generated.length > 0) setSaveModalVisible(true);
          else void prepare();
        }}
      />
      {purchased ? (
        <FlowTextButton
          label="Create New"
          onPress={() => {
            if (createNew()) router.replace("/draw");
          }}
          disabled={busy}
        />
      ) : null}

      <Modal
        animationType="fade"
        transparent
        visible={saveModalVisible}
        onRequestClose={() => setSaveModalVisible(false)}
      >
        <View style={styles.modalShade}>
          <View
            accessibilityViewIsModal
            accessibilityLabel="Choose where to save"
            style={styles.modalCard}
          >
            <Text accessibilityRole="header" style={styles.destinationTitle}>
              Choose where to save
            </Text>
            <Text style={styles.destinationHint}>
              Save directly to Photos or open the iPhone share sheet for Save to
              Files, AirDrop, and other apps.
            </Text>
            {generated.map((file) => {
              const name = file.kind === "signature" ? "Signature" : "Initials";
              const saved = confirmedKinds.includes(file.kind);
              return (
                <View key={file.kind} style={styles.file}>
                  <Text style={styles.fileTitle}>{name}</Text>
                  {saved ? (
                    <Text accessibilityRole="alert" style={styles.confirmed}>
                      {name} saved.
                    </Text>
                  ) : (
                    <View style={styles.destinationRow}>
                      <DestinationButton
                        label={`Save ${name} to Photos`}
                        onPress={() => void saveDestination(file, "photos")}
                        disabled={busy}
                      />
                      <DestinationButton
                        label={`Save ${name} to Files or Share`}
                        onPress={() => void saveDestination(file, "share")}
                        disabled={busy}
                      />
                    </View>
                  )}
                </View>
              );
            })}
            {error ? (
              <Text accessibilityRole="alert" style={styles.modalError}>
                {error}
              </Text>
            ) : null}
            {allSaved ? (
              <View style={styles.doneActions}>
                <FlowPrimaryButton
                  label="Continue"
                  onPress={() => finish(false)}
                  disabled={busy}
                />
                <FlowTextButton
                  label="Done"
                  onPress={() => finish(true)}
                  disabled={busy}
                />
              </View>
            ) : (
              <FlowTextButton
                label="Close"
                onPress={() => setSaveModalVisible(false)}
                disabled={busy}
              />
            )}
          </View>
        </View>
      </Modal>

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
  intro: { marginTop: -8, fontSize: 17, lineHeight: 24 },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#D6E0E3",
    backgroundColor: flowColors.card,
    padding: 16,
  },
  controls: { gap: 18 },
  error: { color: "#FFD8D2", fontSize: 14, lineHeight: 20, fontWeight: "700" },
  modalShade: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.72)",
    alignItems: "center",
    justifyContent: "center",
    padding: 22,
  },
  modalCard: {
    width: "100%",
    maxWidth: 440,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#62808C",
    backgroundColor: "#061A24",
    padding: 20,
    gap: 12,
    boxShadow: "0 22px 54px rgba(0,0,0,0.5)",
  },
  destinationTitle: {
    color: flowColors.white,
    fontSize: 24,
    lineHeight: 29,
    fontWeight: "800",
  },
  destinationHint: { color: "#DCE5E8", fontSize: 14, lineHeight: 19 },
  file: {
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: "#28424D",
    paddingTop: 11,
  },
  fileTitle: {
    color: flowColors.white,
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "800",
  },
  destinationRow: { gap: 8 },
  destinationButton: {
    minHeight: 46,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: flowColors.cyan,
    backgroundColor: "#082B37",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  destinationButtonText: {
    color: flowColors.white,
    fontSize: 14,
    lineHeight: 19,
    fontWeight: "700",
    textAlign: "center",
  },
  confirmed: {
    color: flowColors.cyanText,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "700",
  },
  modalError: { color: "#FFD8D2", fontSize: 13, lineHeight: 18 },
  doneActions: { gap: 2 },
  pressed: { opacity: 0.74 },
  disabled: { opacity: 0.46 },
});
