import { useEffect, useRef, useState, type ComponentRef } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { router } from "expo-router";
import { useReducedMotion } from "react-native-reanimated";
import { FocusPressable as Pressable } from "./FocusPressable";
import { ExportSurface } from "./ExportSurface";
import { FormatDropdown } from "./FormatDropdown";
import { DrawingPreview } from "./DrawingPreview";
import {
  FlowBackButton,
  FlowBody,
  FlowHeading,
  FlowPrimaryButton,
  FlowScreen,
  FlowTextButton,
  flowColors,
  flowRadii,
  flowShadows,
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
import {
  InlineStatus,
  OperationOverlay,
  useDelayedVisibility,
} from "@/components/feedback-ui";
import {
  hapticError,
  hapticLightImpact,
  hapticSuccess,
} from "@/services/haptics";

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
      accessibilityState={{ disabled }}
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
  const reducedMotion = useReducedMotion();
  const { height } = useWindowDimensions();
  const previewHeight =
    height < 760 ? 64 : Math.min(160, Math.max(104, (height - 600) * 0.44));
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
  const [workingMessage, setWorkingMessage] = useState("Preparing your files");
  const [destinationHintHeight, setDestinationHintHeight] = useState(0);
  const [saveModalVisible, setSaveModalVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmedKinds, setConfirmedKinds] = useState<AssetKind[]>([]);
  const signatureRef = useRef<ComponentRef<typeof View>>(null);
  const initialsRef = useRef<ComponentRef<typeof View>>(null);
  const assetCount =
    Number(hasDrawing(activeSet.signature)) +
    Number(hasDrawing(activeSet.initials));
  const allSaved = everyGeneratedFileConfirmed(generated, confirmedKinds);
  const showOperation = useDelayedVisibility(busy);

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
    setWorkingMessage("Preparing your files");
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
      void hapticError();
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
    void hapticLightImpact();
    setWorkingMessage(
      destination === "photos" ? "Saving to Photos" : "Opening sharing options",
    );
    setBusy(true);
    setError(null);
    try {
      if (destination === "photos") await saveFileToPhotos(file);
      else await shareFile(file);
      setConfirmedKinds((current) => addConfirmedKind(current, file.kind));
      void hapticSuccess();
    } catch {
      void hapticError();
      setError(
        destination === "photos"
          ? "Photo access was not granted or the image could not be saved."
          : "The share action did not finish. Your saved drawing is unchanged.",
      );
    } finally {
      setBusy(false);
    }
  };

  const finish = () => {
    recordExport();
    setSaveModalVisible(false);
    router.replace("/saved");
  };

  const chooseAnotherDestination = () => {
    setConfirmedKinds([]);
    setError(null);
  };

  const formats = purchased ? paidFormats : freeFormats;
  return (
    <>
      <FlowScreen
        contentStyle={styles.content}
        testID={purchased ? "paid-export-screen" : "free-export-screen"}
        navigation={<FlowBackButton onPress={() => router.back()} />}
        header={
          <>
            <FlowHeading style={styles.title}>
              {purchased ? "Export Transparent Set" : "White Background Export"}
            </FlowHeading>
            <FlowBody style={styles.intro}>Choose your export format.</FlowBody>
          </>
        }
      >
        <View style={[styles.card, styles.controls]}>
          {hasDrawing(activeSet.signature) ? (
            <View style={styles.assetControls}>
              <FormatDropdown
                label="Signature"
                value={signatureFormat}
                formats={formats}
                disabled={busy}
                onChange={(format) => changeFormat("signature", format)}
              />
              <View
                style={[
                  styles.exportPreview,
                  { height: previewHeight },
                  signatureFormat !== "png-transparent" && styles.whitePreview,
                ]}
              >
                <DrawingPreview
                  asset={activeSet.signature}
                  accessibilityLabel="Signature export preview"
                  style={styles.previewDrawing}
                />
              </View>
            </View>
          ) : null}
          {hasDrawing(activeSet.initials) ? (
            <View style={styles.assetControls}>
              <FormatDropdown
                label="Initials"
                value={initialsFormat}
                formats={formats}
                disabled={busy}
                onChange={(format) => changeFormat("initials", format)}
              />
              <View
                style={[
                  styles.exportPreview,
                  { height: previewHeight },
                  initialsFormat !== "png-transparent" && styles.whitePreview,
                ]}
              >
                <DrawingPreview
                  asset={activeSet.initials}
                  accessibilityLabel="Initials export preview"
                  style={styles.previewDrawing}
                />
              </View>
            </View>
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
          loading={busy}
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
          animationType={reducedMotion ? "none" : "fade"}
          transparent
          visible={saveModalVisible}
          onRequestClose={() => setSaveModalVisible(false)}
        >
          <View style={styles.modalShade}>
            <ScrollView
              accessibilityViewIsModal
              accessibilityLabel="Choose where to save"
              style={styles.modalCard}
              contentContainerStyle={styles.modalContent}
              showsVerticalScrollIndicator={false}
            >
              <Text accessibilityRole="header" style={styles.destinationTitle}>
                Choose where to save
              </Text>
              <View
                style={
                  showOperation
                    ? { minHeight: destinationHintHeight }
                    : undefined
                }
              >
                {showOperation ? (
                  <InlineStatus message={workingMessage} tone="light" />
                ) : (
                  <Text
                    onLayout={(event) =>
                      setDestinationHintHeight(event.nativeEvent.layout.height)
                    }
                    style={styles.destinationHint}
                  >
                    Save directly to Photos or open the iPhone share sheet for
                    Save to Files, AirDrop, and other apps.
                  </Text>
                )}
              </View>
              {generated.map((file) => {
                const name =
                  file.kind === "signature" ? "Signature" : "Initials";
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
                  <FlowTextButton
                    label="Back"
                    onPress={chooseAnotherDestination}
                    disabled={busy}
                    labelStyle={styles.modalSecondary}
                  />
                  <FlowPrimaryButton
                    label="Done"
                    onPress={finish}
                    disabled={busy}
                  />
                </View>
              ) : (
                <FlowTextButton
                  label="Close"
                  onPress={() => setSaveModalVisible(false)}
                  disabled={busy}
                  labelStyle={styles.modalSecondary}
                />
              )}
            </ScrollView>
          </View>
        </Modal>
        <OperationOverlay
          visible={showOperation && !saveModalVisible}
          message={workingMessage}
        />
      </FlowScreen>
      {/* Capture surfaces keep their original size/ref outside page scrolling. */}
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
    </>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 14, gap: 12, justifyContent: "center" },
  back: { position: "absolute", top: 8, left: 20, zIndex: 3 },
  title: { fontSize: 27, lineHeight: 32 },
  intro: { marginTop: 5, fontSize: 15, lineHeight: 20 },
  card: {
    borderRadius: flowRadii.card,
    borderWidth: 1,
    borderColor: "rgba(216,182,106,0.58)",
    backgroundColor: flowColors.card,
    padding: 16,
    boxShadow: flowShadows.card,
  },
  controls: { gap: 16 },
  assetControls: { gap: 8 },
  exportPreview: {
    alignItems: "center",
    padding: 8,
    borderRadius: 12,
  },
  whitePreview: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DED5BD",
  },
  previewDrawing: { width: "100%", height: "100%" },
  error: {
    color: flowColors.destructive,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "700",
  },
  modalShade: {
    flex: 1,
    backgroundColor: "rgba(2,4,10,0.78)",
    alignItems: "center",
    justifyContent: "center",
    padding: 22,
  },
  modalCard: {
    flexGrow: 0,
    width: "100%",
    maxWidth: 440,
    maxHeight: "88%",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#D8B66A",
    backgroundColor: flowColors.card,
    boxShadow: "0 12px 30px rgba(2,4,10,0.24)",
  },
  modalContent: { padding: 20, gap: 12 },
  destinationTitle: {
    color: flowColors.cardText,
    fontSize: 24,
    lineHeight: 29,
    fontWeight: "800",
  },
  destinationHint: {
    color: flowColors.cardMuted,
    fontSize: 14,
    lineHeight: 19,
  },
  file: {
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: "#DED5BD",
    paddingTop: 11,
  },
  fileTitle: {
    color: flowColors.cardText,
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "800",
  },
  destinationRow: { gap: 8 },
  destinationButton: {
    minHeight: 46,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#17386D",
    backgroundColor: "#071F5A",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  destinationButtonText: {
    color: "#FFFDF7",
    fontSize: 14,
    lineHeight: 19,
    fontWeight: "700",
    textAlign: "center",
  },
  confirmed: {
    color: flowColors.accessibleLink,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "700",
  },
  modalError: { color: flowColors.destructive, fontSize: 13, lineHeight: 18 },
  doneActions: { gap: 2 },
  modalSecondary: { color: flowColors.accessibleLink },
  pressed: { opacity: 0.74 },
  disabled: { opacity: 0.46 },
});
