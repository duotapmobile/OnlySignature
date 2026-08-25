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
import {
  canBeginPurchase,
  canEditAsset,
  findTransactionSet,
  hasPurchaseRecoveryInProgress,
  purchasedStateForTransaction,
  stateWithFinalizedIncludedSlot,
  stateWithPendingPurchaseCleared,
} from "@/domain/purchaseState";
import {
  screenshotFixtureSet,
  screenshotFixtureSetFor,
} from "@/domain/fixtures";
import { appStorage } from "@/services/storage";
import {
  configuredStoreKitProductId,
  storeKit,
  type ProductInfo,
  type StoreKitTransaction,
} from "@/services/storekit";

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
  createNew(): void;
  renameSet(id: string, label: string): void;
  duplicateSet(id: string): void;
  deleteSet(id: string): void;
  deleteAll(): Promise<void>;
  purchaseActiveSet(): Promise<StoreKitTransaction>;
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
  reviewPrompted: false,
  lastError: null,
};

const AppContext = createContext<AppContextValue | null>(null);

const persistable = (data: AppStateData): AppStateData => ({
  ...data,
  hydrated: true,
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
  const reconciliationQueue = useRef<Promise<void>>(Promise.resolve());
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
        const restored = await appStorage.read<AppStateData>();
        if (!mounted) return;
        if (restored?.sets.length) {
          const migrated = {
            ...restored,
            hydrated: true,
            sets: restored.sets.map((set) => ({
              ...set,
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
      const next = {
        ...initialData,
        hydrated: true,
        activeSetId: set.id,
        sets: [set],
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
          setData((value) => ({
            ...value,
            lastError:
              "A verified Apple purchase needs recovery before it can be attached to a saved set. Do not purchase again.",
          }));
          return;
        }
        const next = purchasedStateForTransaction(
          current,
          transaction,
          new Date().toISOString(),
          configuredStoreKitProductId,
        );
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
        await storeKit.finish(transaction.transactionId);
        const finished = {
          ...dataRef.current,
          sets: dataRef.current.sets.map((set) =>
            set.transactionId === transaction.transactionId
              ? { ...set, transactionFinishPending: false }
              : set,
          ),
        };
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
    (transaction: StoreKitTransaction): Promise<void> => {
      const task = reconciliationQueue.current.then(() =>
        processTransaction(transaction),
      );
      reconciliationQueue.current = task.catch(() => undefined);
      return task;
    },
    [processTransaction],
  );

  const recoverFinishedBindings = useCallback(async () => {
    const candidates = dataRef.current.sets.filter(
      (set) => set.transactionFinishPending && Boolean(set.transactionId),
    );
    for (const candidate of candidates) {
      const transactionId = candidate.transactionId;
      if (!transactionId) continue;
      if (!(await storeKit.isVerifiedTransaction(transactionId))) continue;
      const recovered = {
        ...dataRef.current,
        sets: dataRef.current.sets.map((set) =>
          set.transactionId === transactionId
            ? { ...set, transactionFinishPending: false }
            : set,
        ),
      };
      await persistData(recovered);
      const durable = await appStorage.read<AppStateData>();
      if (
        !durable?.sets.some(
          (set) =>
            set.transactionId === transactionId &&
            !set.transactionFinishPending,
        )
      )
        throw new Error("purchase-finish-recovery-durability-check-failed");
      dataRef.current = durable;
      setData(durable);
      finishedTransactions.current.add(transactionId);
    }
  }, [persistData]);

  useEffect(() => {
    if (!data.hydrated || screenshotFixtureMode) return;
    const recover = () =>
      storeKit
        .unfinishedTransactions()
        .then((transactions) => Promise.all(transactions.map(reconcile)))
        .then(recoverFinishedBindings)
        .catch(() => {
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
      setData((current) => ({
        ...current,
        sets: current.sets.map((set) => (set.id === id ? updater(set) : set)),
      }));
    },
    [],
  );

  const actions = useMemo<AppActions>(
    () => ({
      setSelectedAsset(kind) {
        setData((current) => ({ ...current, selectedAsset: kind }));
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
        setData((current) => ({ ...current, activeSetId: id }));
      },
      createNew() {
        if (hasPurchaseRecoveryInProgress(dataRef.current)) {
          setData((current) => ({
            ...current,
            lastError:
              "Finish recovering the pending Apple purchase before creating another set.",
          }));
          return;
        }
        const id = Crypto.randomUUID();
        const draft = createDraftSet(id);
        setData((current) => ({
          ...current,
          activeSetId: id,
          selectedAsset: "signature",
          sets: [draft, ...current.sets],
        }));
      },
      renameSet(id, label) {
        updateSet(id, (set) => ({
          ...set,
          label: label.trim(),
          lastUsedAt: new Date().toISOString(),
        }));
      },
      duplicateSet(id) {
        if (hasPurchaseRecoveryInProgress(dataRef.current)) {
          setData((current) => ({
            ...current,
            lastError:
              "Finish recovering the pending Apple purchase before duplicating a set.",
          }));
          return;
        }
        setData((current) => {
          const source = current.sets.find((set) => set.id === id);
          if (!source) return current;
          const copy: SignatureSet = {
            ...source,
            id: Crypto.randomUUID(),
            status: "draft",
            purchasedAt: null,
            transactionId: null,
            pendingPurchaseId: null,
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
      },
      deleteSet(id) {
        setData((current) => {
          const target = current.sets.find((set) => set.id === id);
          if (
            target?.pendingPurchaseId ||
            target?.transactionFinishPending ||
            transactionInProgress.current
          )
            return {
              ...current,
              lastError:
                "This set cannot be deleted while Apple purchase recovery is in progress.",
            };
          const remaining = current.sets.filter((set) => set.id !== id);
          if (remaining.length > 0)
            return {
              ...current,
              sets: remaining,
              activeSetId:
                current.activeSetId === id
                  ? (remaining[0]?.id ?? "")
                  : current.activeSetId,
            };
          const draft = createDraftSet(Crypto.randomUUID());
          return { ...current, sets: [draft], activeSetId: draft.id };
        });
      },
      async deleteAll() {
        if (
          transactionInProgress.current ||
          hasPurchaseRecoveryInProgress(dataRef.current)
        )
          throw new Error("purchase-recovery-in-progress");
        const draft = createDraftSet(Crypto.randomUUID());
        const clearTask = persistenceQueue.current.then(() =>
          appStorage.clear(),
        );
        persistenceQueue.current = clearTask.catch(() => undefined);
        await clearTask;
        setData({
          ...initialData,
          hydrated: true,
          activeSetId: draft.id,
          sets: [draft],
        });
        AccessibilityInfo.announceForAccessibility(
          "All saved signatures and initials were removed from this app.",
        );
      },
      async purchaseActiveSet() {
        if (purchaseSingleFlight.current)
          throw new Error("purchase-already-in-progress");
        purchaseSingleFlight.current = true;
        const currentData = dataRef.current;
        const target =
          currentData.sets.find((set) => set.id === currentData.activeSetId) ??
          activeSet;
        try {
          if (!hasDrawing(target.signature) && !hasDrawing(target.initials))
            throw new Error("no-drawing");
          if (productStatus !== "available" || !product.productId)
            throw new Error("product-unavailable");
          if (target.status === "purchased" && target.transactionId)
            return {
              transactionId: target.transactionId,
              productId: product.productId,
              appAccountToken: target.id,
              state: "purchased",
              verified: true,
            };
          if (!canBeginPurchase(target))
            throw new Error("purchase-already-in-progress");
          const pendingId = Crypto.randomUUID();
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
          dataRef.current = pendingData;
          setData(pendingData);
          let transaction: StoreKitTransaction;
          try {
            transaction = await storeKit.purchase(pendingId);
          } catch (error) {
            setData((current) => ({
              ...current,
              lastError:
                "The purchase request was interrupted. This set remains locked while Only Signature checks Apple; do not purchase it again.",
            }));
            throw error;
          }
          if (transaction.state === "purchased" && transaction.verified) {
            await reconcile(transaction);
          } else if (transaction.state === "cancelled") {
            const unlocked = stateWithPendingPurchaseCleared(
              dataRef.current,
              target.id,
            );
            await persistData(unlocked);
            dataRef.current = unlocked;
            setData({
              ...unlocked,
              lastError: null,
            });
          } else if (transaction.state === "failed") {
            setData((current) => ({
              ...current,
              lastError:
                "Apple could not verify this purchase. This set stays locked while Only Signature checks again. Do not purchase it again.",
            }));
          }
          return transaction;
        } finally {
          purchaseSingleFlight.current = false;
        }
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
        setData((current) => ({ ...current, reviewPrompted: true }));
      },
      dismissError() {
        setData((current) => ({ ...current, lastError: null }));
      },
    }),
    [
      activeSet,
      data.activeSetId,
      persistData,
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
