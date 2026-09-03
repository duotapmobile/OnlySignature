import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Constants from "expo-constants";
import * as Crypto from "expo-crypto";
import {
  AccessibilityInfo,
  AppState as NativeAppState,
  Linking as NativeLinking,
} from "react-native";
import type {
  AppStateData,
  AssetKind,
  DrawingAsset,
  SignatureSet,
  Stroke,
} from "@/domain/models";
import { createDraftSet, createEmptyAsset, hasDrawing } from "@/domain/models";
import { normalizedDrawing } from "@/domain/drawing";
import { validateAndMigrateAppState } from "@/domain/appStateValidation";
import {
  canBeginPurchase,
  canEditAsset,
  canonicalPurchaseToken,
  findTransactionSet,
  hasPurchaseRecoveryInProgress,
  purchaseRequestClearsPendingIntent,
  purchasedStateForTransaction,
  statePreparedForUnboundPurchaseRecovery,
  stateWithFinalizedIncludedSlot,
  stateWithPendingPurchaseCleared,
} from "@/domain/purchaseState";
import {
  stateAfterFinishResult,
  stateAfterRecoverySnapshot,
} from "@/domain/purchaseRecovery";
import {
  screenshotFixtureSet,
  screenshotFixtureSetFor,
  screenshotFixtureSetsFor,
} from "@/domain/fixtures";
import { appStorage } from "@/services/storage";
import {
  configuredStoreKitProductId,
  storeKit,
  type ProductInfo,
  type StoreKitTransaction,
} from "@/services/storekit";
import { createSerialQueue } from "@/services/serialQueue";

interface AppActions {
  setSelectedAsset(kind: AssetKind): void;
  updateAsset(
    kind: AssetKind,
    strokes: Stroke[],
    width: number,
    height: number,
    orientation: "portrait" | "landscape",
  ): void;
  clearAsset(kind: AssetKind): void;
  selectSet(id: string): void;
  createNew(): boolean;
  renameSet(id: string, label: string): void;
  duplicateSet(id: string): boolean;
  deleteSet(id: string): void;
  deleteAll(): Promise<void>;
  purchaseActiveSet(): Promise<StoreKitTransaction>;
  recoverUnboundPurchase(): Promise<StoreKitTransaction>;
  fillIncludedSlot(kind: AssetKind, asset: DrawingAsset): Promise<void>;
  recordExport(): void;
  markReviewPrompted(): void;
  dismissError(): void;
}

interface AppContextValue extends AppActions {
  data: AppStateData;
  activeSet: SignatureSet;
  product: ProductInfo;
  productStatus: "loading" | "available" | "unavailable";
}

const initialDraft = createDraftSet("draft-initial");
const initialData: AppStateData = {
  hydrated: false,
  activeSetId: initialDraft.id,
  sets: [initialDraft],
  selectedAsset: "signature",
  unboundPurchases: [],
  reviewPrompted: false,
  lastError: null,
};

const AppContext = createContext<AppContextValue | null>(null);

const persistable = (data: AppStateData): AppStateData => ({
  ...data,
  hydrated: true,
});

const withTimeout = <T,>(
  promise: Promise<T>,
  milliseconds: number,
): Promise<T> =>
  new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error("storekit-operation-timeout")),
      milliseconds,
    );
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error: unknown) => {
        clearTimeout(timer);
        reject(
          error instanceof Error
            ? error
            : new Error("storekit-operation-failed"),
        );
      },
    );
  });

export function AppStateProvider({ children }: PropsWithChildren) {
  const [data, setData] = useState<AppStateData>(initialData);
  const [product, setProduct] = useState<ProductInfo>({
    productId: "",
    displayPrice: "",
  });
  const [productStatus, setProductStatus] = useState<
    "loading" | "available" | "unavailable"
  >("loading");
  const dataRef = useRef<AppStateData>(initialData);
  const reconciliationQueue = useRef(createSerialQueue());
  const persistenceQueue = useRef<Promise<void>>(Promise.resolve());
  const purchaseSingleFlight = useRef(false);
  const transactionInProgress = useRef(false);
  const finishedTransactions = useRef(new Set<string>());
  const screenshotFixtureMode = Boolean(
    (
      Constants.expoConfig?.extra as
        | { screenshotFixtureMode?: boolean }
        | undefined
    )?.screenshotFixtureMode,
  );

  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  const persistData = useCallback((next: AppStateData): Promise<void> => {
    const task = persistenceQueue.current.then(() =>
      appStorage.write(persistable(next)),
    );
    persistenceQueue.current = task.catch(() => undefined);
    return task;
  }, []);

  const enqueueOperation = useCallback(
    <T,>(operation: () => Promise<T>): Promise<T> => {
      return reconciliationQueue.current.run(operation);
    },
    [],
  );

  const mutateData = useCallback(
    (updater: (current: AppStateData) => AppStateData): AppStateData => {
      const next = updater(dataRef.current);
      dataRef.current = next;
      setData(next);
      return next;
    },
    [],
  );

  useEffect(() => {
    let mounted = true;
    let hydrating = false;
    const hydrate = async () => {
      if (hydrating || dataRef.current.hydrated) return;
      hydrating = true;
      if (screenshotFixtureMode) {
        const fixtureData = {
          ...initialData,
          hydrated: true,
          activeSetId: screenshotFixtureSet.id,
          sets: [screenshotFixtureSet],
        };
        dataRef.current = fixtureData;
        if (mounted) setData(fixtureData);
        if (mounted) {
          setProduct(await storeKit.loadProduct());
          setProductStatus("available");
        }
        hydrating = false;
        return;
      }
      try {
        await appStorage.cleanupTemporaryFiles();
        const restored = await appStorage.read(validateAndMigrateAppState);
        if (!mounted) return;
        if (restored?.sets.length) {
          const migrated = {
            ...restored,
            hydrated: true,
            sets: restored.sets.map((set) => ({
              ...set,
              purchaseIntentState: set.pendingPurchaseId
                ? (set.purchaseIntentState ?? "pending")
                : null,
              transactionFinishPending: Boolean(set.transactionFinishPending),
            })),
          };
          dataRef.current = migrated;
          setData(migrated);
        } else setData((current) => ({ ...current, hydrated: true }));
      } catch {
        if (mounted)
          setData((current) => ({
            ...current,
            lastError:
              "Saved signatures are temporarily unavailable. Unlock this device and reopen Only Signature. No purchase will be finished until storage is available.",
          }));
        hydrating = false;
        return;
      }
      try {
        setProduct(await storeKit.loadProduct());
        setProductStatus("available");
      } catch {
        setProductStatus("unavailable");
        setData((current) => ({
          ...current,
          lastError:
            "The transparent export product is temporarily unavailable.",
        }));
      }
      hydrating = false;
    };
    void hydrate();
    const subscription = NativeAppState.addEventListener("change", (state) => {
      if (state === "active") void hydrate();
    });
    return () => {
      mounted = false;
      subscription.remove();
    };
  }, [screenshotFixtureMode]);

  useEffect(() => {
    if (!screenshotFixtureMode) return;
    const applyFixtureUrl = (url: string | null | undefined) => {
      if (!url) return;
      const parsed = new URL(url);
      const fixture = parsed.searchParams.get("fixture") ?? undefined;
      const set = screenshotFixtureSetFor(fixture);
      const sets = screenshotFixtureSetsFor(fixture);
      const next = {
        ...initialData,
        hydrated: true,
        activeSetId: sets[0]?.id ?? set.id,
        selectedAsset:
          fixture === "initials"
            ? ("initials" as const)
            : ("signature" as const),
        sets,
      };
      dataRef.current = next;
      setData(next);
    };
    void NativeLinking.getInitialURL().then(applyFixtureUrl);
    const subscription = NativeLinking.addEventListener("url", ({ url }) =>
      applyFixtureUrl(url),
    );
    return () => subscription.remove();
  }, [screenshotFixtureMode]);

  useEffect(() => {
    if (!data.hydrated || screenshotFixtureMode) return;
    void persistData(data).catch(() => {
      setData((current) => ({
        ...current,
        lastError:
          "Only Signature could not save the latest change. Keep the app open and check available storage.",
      }));
    });
  }, [data, persistData, screenshotFixtureMode]);

  const processTransaction = useCallback(
    async (transaction: StoreKitTransaction) => {
      if (transaction.state !== "purchased" || !transaction.verified) {
        if (transaction.state === "failed" && !transaction.verified)
          setData((current) => ({
            ...current,
            lastError:
              "Apple could not verify this transaction. The set remains locked.",
          }));
        return;
      }
      if (
        !transaction.transactionId ||
        transaction.productId !== configuredStoreKitProductId
      ) {
        setData((current) => ({
          ...current,
          lastError:
            "Apple returned a purchase that does not match this transparent export product. It was not applied or finished.",
        }));
        return;
      }
      if (finishedTransactions.current.has(transaction.transactionId)) return;
      transactionInProgress.current = true;
      try {
        const current = dataRef.current;
        const matching = findTransactionSet(current, transaction);
        if (!matching) {
          const held = {
            ...current,
            unboundPurchases: current.unboundPurchases.some(
              (purchase) =>
                purchase.transactionId === transaction.transactionId,
            )
              ? current.unboundPurchases
              : [
                  ...current.unboundPurchases,
                  {
                    transactionId: transaction.transactionId,
                    productId: transaction.productId,
                    appAccountToken: transaction.appAccountToken ?? null,
                    detectedAt: new Date().toISOString(),
                  },
                ],
            lastError:
              "A verified Apple purchase needs recovery before it can be attached to a saved set. Do not purchase again.",
          };
          await persistData(held);
          const durableHeld = await appStorage.read<AppStateData>();
          if (
            !durableHeld?.unboundPurchases.some(
              (purchase) =>
                purchase.transactionId === transaction.transactionId,
            )
          )
            throw new Error("unbound-purchase-durability-check-failed");
          dataRef.current = durableHeld;
          setData(durableHeld);
          return;
        }
        const purchased = purchasedStateForTransaction(
          current,
          transaction,
          new Date().toISOString(),
          configuredStoreKitProductId,
        );
        const next = purchased
          ? {
              ...purchased,
              unboundPurchases: purchased.unboundPurchases.filter(
                (purchase) =>
                  purchase.transactionId !== transaction.transactionId,
              ),
            }
          : null;
        if (!next) return;
        if (next !== current) {
          await persistData(next);
          const durable = await appStorage.read<AppStateData>();
          const durableSet = durable?.sets.find(
            (set) => set.transactionId === transaction.transactionId,
          );
          if (
            !durable ||
            !durableSet ||
            durableSet.transactionId !== transaction.transactionId ||
            !durableSet.transactionFinishPending
          )
            throw new Error("purchase-durability-check-failed");
          dataRef.current = durable;
          setData(durable);
        }
        const finishSucceeded = await withTimeout(
          storeKit.finish(transaction.transactionId),
          15_000,
        );
        if (!finishSucceeded) {
          setData((currentData) => ({
            ...currentData,
            lastError:
              "Apple purchase finishing is still being checked. This purchased set remains saved and locked until recovery completes.",
          }));
          return;
        }
        const finished = stateAfterFinishResult(
          dataRef.current,
          transaction.transactionId,
          finishSucceeded,
        );
        await persistData(finished);
        const durableFinished = await appStorage.read<AppStateData>();
        if (
          !durableFinished?.sets.some(
            (set) =>
              set.transactionId === transaction.transactionId &&
              !set.transactionFinishPending,
          )
        )
          throw new Error("purchase-finish-durability-check-failed");
        dataRef.current = durableFinished;
        setData(durableFinished);
        finishedTransactions.current.add(transaction.transactionId);
      } finally {
        transactionInProgress.current = false;
      }
    },
    [persistData],
  );

  const reconcile = useCallback(
    (transaction: StoreKitTransaction): Promise<void> =>
      enqueueOperation(() => processTransaction(transaction)),
    [enqueueOperation, processTransaction],
  );

  const recoverFinishedBindings = useCallback(
    async (snapshot: StoreKitTransaction[]) => {
      const current = dataRef.current;
      const resolved = stateAfterRecoverySnapshot(
        current,
        snapshot,
        purchaseSingleFlight.current,
      );
      if (
        resolved.sets.every(
          (set, index) =>
            set.transactionFinishPending ===
              current.sets[index]?.transactionFinishPending &&
            set.purchaseIntentState ===
              current.sets[index]?.purchaseIntentState,
        )
      )
        return;
      await persistData(resolved);
      const durable = await appStorage.read<AppStateData>();
      if (!durable)
        throw new Error("purchase-finish-recovery-durability-check-failed");
      dataRef.current = durable;
      setData(durable);
      for (const set of durable.sets)
        if (set.transactionId && !set.transactionFinishPending)
          finishedTransactions.current.add(set.transactionId);
    },
    [persistData],
  );

  useEffect(() => {
    if (!data.hydrated || screenshotFixtureMode) return;
    const recover = () =>
      enqueueOperation(async () => {
        const transactions = await withTimeout(
          storeKit.unfinishedSnapshot(),
          15_000,
        );
        for (const transaction of transactions)
          await processTransaction(transaction);
        await recoverFinishedBindings(transactions);
      }).catch(() => {
        setData((current) => ({
          ...current,
          lastError:
            "A purchase is waiting for secure recovery. Keep this set saved; Only Signature will check again automatically.",
        }));
      });
    let remove: () => void = () => undefined;
    try {
      remove = storeKit.observe((transaction) => {
        void reconcile(transaction).catch(() => {
          setData((current) => ({
            ...current,
            lastError:
              "A verified purchase is waiting for secure local storage. Do not purchase this set again.",
          }));
        });
      });
    } catch {
      queueMicrotask(() =>
        setData((current) => ({
          ...current,
          lastError:
            "Apple purchase recovery is unavailable in this build. Transparent purchases are disabled.",
        })),
      );
    }
    void recover();
    const appStateSubscription = NativeAppState.addEventListener(
      "change",
      (state) => {
        if (state === "active") {
          void recover();
          void storeKit
            .loadProduct()
            .then((loaded) => {
              setProduct(loaded);
              setProductStatus("available");
            })
            .catch(() => setProductStatus("unavailable"));
        }
      },
    );
    return () => {
      remove();
      appStateSubscription.remove();
    };
  }, [
    data.hydrated,
    enqueueOperation,
    processTransaction,
    reconcile,
    recoverFinishedBindings,
    screenshotFixtureMode,
  ]);

  const activeSet =
    data.sets.find((set) => set.id === data.activeSetId) ??
    data.sets[0] ??
    initialDraft;

  const updateSet = useCallback(
    (id: string, updater: (set: SignatureSet) => SignatureSet) => {
      mutateData((current) => ({
        ...current,
        sets: current.sets.map((set) => (set.id === id ? updater(set) : set)),
      }));
    },
    [mutateData],
  );

  const actions = useMemo<AppActions>(
    () => ({
      setSelectedAsset(kind) {
        mutateData((current) => ({ ...current, selectedAsset: kind }));
      },
      updateAsset(kind, strokes, width, height, orientation) {
        updateSet(data.activeSetId, (set) =>
          !canEditAsset(set, kind)
            ? set
            : {
                ...set,
                [kind]: {
                  kind,
                  strokes,
                  canvasWidth: width,
                  canvasHeight: height,
                  orientation,
                  renderingVersion: 1,
                  finalizedHash: null,
                },
                lastUsedAt: new Date().toISOString(),
              },
        );
      },
      clearAsset(kind) {
        updateSet(data.activeSetId, (set) =>
          !canEditAsset(set, kind)
            ? set
            : {
                ...set,
                [kind]: createEmptyAsset(kind),
                lastUsedAt: new Date().toISOString(),
              },
        );
        AccessibilityInfo.announceForAccessibility(
          `${kind === "signature" ? "Signature" : "Initials"} drawing cleared.`,
        );
      },
      selectSet(id) {
        mutateData((current) => ({ ...current, activeSetId: id }));
      },
      createNew() {
        if (purchaseSingleFlight.current) {
          mutateData((current) => ({
            ...current,
            lastError:
              "Wait for the current Apple purchase request to close before creating another set.",
          }));
          return false;
        }
        const id = Crypto.randomUUID();
        const draft = createDraftSet(id);
        mutateData((current) => ({
          ...current,
          activeSetId: id,
          selectedAsset: "signature",
          sets: [draft, ...current.sets],
        }));
        return true;
      },
      renameSet(id, label) {
        updateSet(id, (set) => ({
          ...set,
          label: label.trim(),
          lastUsedAt: new Date().toISOString(),
        }));
      },
      duplicateSet(id) {
        if (purchaseSingleFlight.current) {
          mutateData((current) => ({
            ...current,
            lastError:
              "Wait for the current Apple purchase request to close before duplicating a set.",
          }));
          return false;
        }
        if (!dataRef.current.sets.some((set) => set.id === id)) return false;
        mutateData((current) => {
          const source = current.sets.find((set) => set.id === id);
          if (!source) return current;
          const copy: SignatureSet = {
            ...source,
            id: Crypto.randomUUID(),
            status: "draft",
            purchasedAt: null,
            transactionId: null,
            pendingPurchaseId: null,
            purchaseIntentState: null,
            transactionFinishPending: false,
            unclaimedSlot: null,
            label: source.label ? `${source.label} copy` : "",
            lastUsedAt: new Date().toISOString(),
            exportCount: 0,
            signature: source.signature
              ? { ...source.signature, finalizedHash: null }
              : null,
            initials: source.initials
              ? { ...source.initials, finalizedHash: null }
              : null,
          };
          return {
            ...current,
            activeSetId: copy.id,
            sets: [copy, ...current.sets],
          };
        });
        return true;
      },
      deleteSet(id) {
        void enqueueOperation(async () => {
          const current = dataRef.current;
          const target = current.sets.find((set) => set.id === id);
          if (
            target?.pendingPurchaseId ||
            target?.transactionFinishPending ||
            current.unboundPurchases.length > 0 ||
            purchaseSingleFlight.current ||
            transactionInProgress.current
          ) {
            setData({
              ...current,
              lastError:
                "This set cannot be deleted while Apple purchase recovery is in progress.",
            });
            return;
          }
          const remaining = current.sets.filter((set) => set.id !== id);
          const next =
            remaining.length > 0
              ? {
                  ...current,
                  sets: remaining,
                  activeSetId:
                    current.activeSetId === id
                      ? (remaining[0]?.id ?? "")
                      : current.activeSetId,
                }
              : (() => {
                  const draft = createDraftSet(Crypto.randomUUID());
                  return { ...current, sets: [draft], activeSetId: draft.id };
                })();
          await persistData(next);
          dataRef.current = next;
          setData(next);
        });
      },
      async deleteAll() {
        await enqueueOperation(async () => {
          if (
            transactionInProgress.current ||
            purchaseSingleFlight.current ||
            hasPurchaseRecoveryInProgress(dataRef.current)
          )
            throw new Error("purchase-recovery-in-progress");
          const draft = createDraftSet(Crypto.randomUUID());
          const clearTask = persistenceQueue.current.then(() =>
            appStorage.clear(),
          );
          persistenceQueue.current = clearTask.catch(() => undefined);
          await clearTask;
          const next = {
            ...initialData,
            hydrated: true,
            activeSetId: draft.id,
            sets: [draft],
          };
          dataRef.current = next;
          setData(next);
        });
        AccessibilityInfo.announceForAccessibility(
          "All saved signatures and initials were removed from this app.",
        );
      },
      async purchaseActiveSet() {
        if (purchaseSingleFlight.current)
          throw new Error("purchase-already-in-progress");
        const initialData = dataRef.current;
        const initialTarget =
          initialData.sets.find((set) => set.id === initialData.activeSetId) ??
          activeSet;
        if (initialTarget.status === "purchased" && initialTarget.transactionId)
          return {
            transactionId: initialTarget.transactionId,
            productId: product.productId,
            appAccountToken: initialTarget.id,
            state: "purchased",
            verified: true,
          };
        purchaseSingleFlight.current = true;
        try {
          let target!: SignatureSet;
          let pendingId = "";
          await enqueueOperation(async () => {
            const currentData = dataRef.current;
            target =
              currentData.sets.find(
                (set) => set.id === currentData.activeSetId,
              ) ?? initialTarget;
            if (!hasDrawing(target.signature) && !hasDrawing(target.initials))
              throw new Error("no-drawing");
            if (productStatus !== "available" || !product.productId)
              throw new Error("product-unavailable");
            if (hasPurchaseRecoveryInProgress(currentData))
              throw new Error("purchase-recovery-in-progress");
            if (!canBeginPurchase(target))
              throw new Error("purchase-already-in-progress");
            pendingId = canonicalPurchaseToken(Crypto.randomUUID()) ?? "";
            if (!pendingId) throw new Error("purchase-token-generation-failed");
            const signatureHash = hasDrawing(target.signature)
              ? await Crypto.digestStringAsync(
                  Crypto.CryptoDigestAlgorithm.SHA256,
                  normalizedDrawing(target.signature),
                )
              : null;
            const initialsHash = hasDrawing(target.initials)
              ? await Crypto.digestStringAsync(
                  Crypto.CryptoDigestAlgorithm.SHA256,
                  normalizedDrawing(target.initials),
                )
              : null;
            const frozen: SignatureSet = {
              ...target,
              pendingPurchaseId: pendingId,
              purchaseIntentState: "presenting",
              signature: target.signature
                ? { ...target.signature, finalizedHash: signatureHash }
                : null,
              initials: target.initials
                ? { ...target.initials, finalizedHash: initialsHash }
                : null,
            };
            const pendingData = {
              ...currentData,
              sets: currentData.sets.map((set) =>
                set.id === frozen.id ? frozen : set,
              ),
            };
            await persistData(pendingData);
            const durable = await appStorage.read<AppStateData>();
            const durableTarget = durable?.sets.find(
              (set) =>
                set.id === target.id &&
                canonicalPurchaseToken(set.pendingPurchaseId) === pendingId,
            );
            if (!durable || !durableTarget)
              throw new Error("purchase-intent-durability-check-failed");
            dataRef.current = durable;
            setData(durable);
          });
          let transaction: StoreKitTransaction;
          try {
            transaction = await storeKit.purchase(pendingId);
          } catch (error) {
            const recovered = await enqueueOperation(async () => {
              let snapshot: StoreKitTransaction[];
              try {
                snapshot = await withTimeout(
                  storeKit.unfinishedSnapshot(),
                  15_000,
                );
              } catch {
                snapshot = [];
              }
              for (const candidate of snapshot)
                await processTransaction(candidate);
              const current = dataRef.current;
              const recoveredSet = current.sets.find(
                (set) =>
                  set.id === target.id &&
                  set.status === "purchased" &&
                  Boolean(set.transactionId),
              );
              if (recoveredSet?.transactionId)
                return {
                  transactionId: recoveredSet.transactionId,
                  productId: configuredStoreKitProductId,
                  appAccountToken: pendingId,
                  state: "purchased" as const,
                  verified: true,
                };
              const interrupted = {
                ...current,
                sets: current.sets.map((set) =>
                  set.id === target.id &&
                  canonicalPurchaseToken(set.pendingPurchaseId) === pendingId
                    ? { ...set, purchaseIntentState: "interrupted" as const }
                    : set,
                ),
                lastError:
                  "Apple did not report a completed purchase. This frozen set stays saved while Only Signature checks again. Do not purchase again.",
              };
              await persistData(interrupted);
              dataRef.current = interrupted;
              setData(interrupted);
              return null;
            });
            if (recovered) return recovered;
            throw error;
          }
          if (transaction.state === "purchased" && transaction.verified) {
            await reconcile(transaction);
          } else if (purchaseRequestClearsPendingIntent(transaction.state)) {
            await enqueueOperation(async () => {
              const unlocked = stateWithPendingPurchaseCleared(
                dataRef.current,
                target.id,
                pendingId,
              );
              const terminal = {
                ...unlocked,
                lastError:
                  transaction.state === "cancelled"
                    ? null
                    : "Apple did not complete the purchase request. Your drawing is unchanged and you can try again.",
              };
              await persistData(terminal);
              dataRef.current = terminal;
              setData(terminal);
            });
          } else if (transaction.state === "failed") {
            await enqueueOperation(async () => {
              const current = dataRef.current;
              const failed = {
                ...current,
                sets: current.sets.map((set) =>
                  set.id === target.id && set.pendingPurchaseId
                    ? { ...set, purchaseIntentState: "interrupted" as const }
                    : set,
                ),
                lastError:
                  "Apple could not verify this purchase. This set stays locked while Only Signature checks again. Do not purchase it again.",
              };
              await persistData(failed);
              dataRef.current = failed;
              setData(failed);
            });
          } else if (transaction.state === "pending") {
            await enqueueOperation(async () => {
              const current = dataRef.current;
              const pending = {
                ...current,
                sets: current.sets.map((set) =>
                  set.id === target.id && set.pendingPurchaseId
                    ? { ...set, purchaseIntentState: "pending" as const }
                    : set,
                ),
              };
              await persistData(pending);
              dataRef.current = pending;
              setData(pending);
            });
          } else if (transaction.state === "request-interrupted") {
            const recovered = await enqueueOperation(async () => {
              const snapshot = await withTimeout(
                storeKit.unfinishedSnapshot(),
                15_000,
              );
              for (const candidate of snapshot)
                await processTransaction(candidate);
              const current = dataRef.current;
              const recoveredSet = current.sets.find(
                (set) =>
                  set.id === target.id &&
                  set.status === "purchased" &&
                  Boolean(set.transactionId),
              );
              if (recoveredSet?.transactionId)
                return {
                  transactionId: recoveredSet.transactionId,
                  productId: configuredStoreKitProductId,
                  appAccountToken: pendingId,
                  state: "purchased" as const,
                  verified: true,
                };
              const interrupted = {
                ...current,
                sets: current.sets.map((set) =>
                  set.id === target.id &&
                  canonicalPurchaseToken(set.pendingPurchaseId) === pendingId
                    ? { ...set, purchaseIntentState: "interrupted" as const }
                    : set,
                ),
                lastError:
                  "Apple did not report a completed purchase. This frozen set stays saved while Only Signature checks again. Do not purchase again.",
              };
              await persistData(interrupted);
              dataRef.current = interrupted;
              setData(interrupted);
              return null;
            });
            if (recovered) return recovered;
          }
          return transaction;
        } finally {
          purchaseSingleFlight.current = false;
        }
      },
      async recoverUnboundPurchase() {
        return enqueueOperation(async () => {
          const current = dataRef.current;
          const hold = current.unboundPurchases[0];
          const target = current.sets.find(
            (set) => set.id === current.activeSetId,
          );
          if (!hold || !target)
            throw new Error("unbound-purchase-recovery-unavailable");
          const signatureHash = hasDrawing(target.signature)
            ? await Crypto.digestStringAsync(
                Crypto.CryptoDigestAlgorithm.SHA256,
                normalizedDrawing(target.signature),
              )
            : null;
          const initialsHash = hasDrawing(target.initials)
            ? await Crypto.digestStringAsync(
                Crypto.CryptoDigestAlgorithm.SHA256,
                normalizedDrawing(target.initials),
              )
            : null;
          const fallbackToken =
            canonicalPurchaseToken(Crypto.randomUUID()) ?? "";
          const prepared = statePreparedForUnboundPurchaseRecovery(
            current,
            target.id,
            hold.transactionId,
            fallbackToken,
            signatureHash,
            initialsHash,
          );
          await persistData(prepared);
          const durable = await appStorage.read<AppStateData>();
          const durableTarget = durable?.sets.find(
            (set) =>
              set.id === target.id &&
              Boolean(canonicalPurchaseToken(set.pendingPurchaseId)),
          );
          if (!durable || !durableTarget)
            throw new Error("unbound-recovery-durability-check-failed");
          dataRef.current = durable;
          setData(durable);
          const transaction: StoreKitTransaction = {
            transactionId: hold.transactionId,
            productId: hold.productId,
            ...(hold.appAccountToken
              ? { appAccountToken: hold.appAccountToken }
              : {}),
            state: "purchased",
            verified: true,
          };
          await processTransaction(transaction);
          const recovered = dataRef.current.sets.find(
            (set) =>
              set.id === target.id &&
              set.status === "purchased" &&
              set.transactionId === hold.transactionId,
          );
          if (!recovered)
            throw new Error("unbound-purchase-recovery-incomplete");
          return transaction;
        });
      },
      async fillIncludedSlot(kind, asset) {
        const hash = await Crypto.digestStringAsync(
          Crypto.CryptoDigestAlgorithm.SHA256,
          normalizedDrawing(asset),
        );
        const current = dataRef.current;
        const next = stateWithFinalizedIncludedSlot(
          current,
          current.activeSetId,
          kind,
          asset,
          hash,
          new Date().toISOString(),
        );
        await persistData(next);
        dataRef.current = next;
        setData(next);
      },
      recordExport() {
        updateSet(data.activeSetId, (set) => ({
          ...set,
          exportCount: set.exportCount + 1,
          lastUsedAt: new Date().toISOString(),
        }));
      },
      markReviewPrompted() {
        mutateData((current) => ({ ...current, reviewPrompted: true }));
      },
      dismissError() {
        mutateData((current) => ({ ...current, lastError: null }));
      },
    }),
    [
      activeSet,
      data.activeSetId,
      enqueueOperation,
      mutateData,
      persistData,
      processTransaction,
      product.productId,
      productStatus,
      reconcile,
      updateSet,
    ],
  );

  return (
    <AppContext.Provider
      value={{ data, activeSet, product, productStatus, ...actions }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useAppState = (): AppContextValue => {
  const value = useContext(AppContext);
  if (!value)
    throw new Error("useAppState must be used inside AppStateProvider");
  return value;
};
