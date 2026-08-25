import Constants from "expo-constants";
import { Platform } from "react-native";
import { OnlySignatureStoreKit } from "../../modules/only-signature-native";

export type PurchaseState = "purchased" | "cancelled" | "pending" | "failed";

export interface ProductInfo {
  productId: string;
  displayPrice: string;
}

export interface StoreKitTransaction {
  transactionId: string;
  productId: string;
  appAccountToken?: string;
  state: PurchaseState;
  verified: boolean;
  errorCategory?: string;
}

export interface StoreKitAdapter {
  loadProduct(): Promise<ProductInfo>;
  purchase(appAccountToken?: string): Promise<StoreKitTransaction>;
  unfinishedTransactions(): Promise<StoreKitTransaction[]>;
  finish(transactionId: string): Promise<void>;
  isVerifiedTransaction(transactionId: string): Promise<boolean>;
  observe(listener: (transaction: StoreKitTransaction) => void): () => void;
}

const extra = Constants.expoConfig?.extra as
  | { storeKitMode?: string; storeKitProductId?: string }
  | undefined;
const productId =
  extra?.storeKitProductId ?? "com.onlysignature.preview.transparent-set-v1";
export const configuredStoreKitProductId = productId;

const nativeModule = OnlySignatureStoreKit as {
  loadProduct(productIdValue: string): Promise<ProductInfo>;
  purchase(
    productIdValue: string,
    appAccountToken?: string,
  ): Promise<StoreKitTransaction>;
  unfinishedTransactions(): Promise<StoreKitTransaction[]>;
  finish(transactionId: string): Promise<void>;
  isVerifiedTransaction(
    transactionId: string,
    productIdValue: string,
  ): Promise<boolean>;
  addListener(
    eventName: "onStoreKitTransaction",
    listener: (transaction: StoreKitTransaction) => void,
  ): { remove(): void };
} | null;

const mock: StoreKitAdapter = {
  loadProduct() {
    return Promise.resolve({ productId, displayPrice: "$1.99" });
  },
  async purchase(appAccountToken) {
    await new Promise((resolve) => setTimeout(resolve, 350));
    return {
      transactionId: `mock-${Date.now()}`,
      productId,
      ...(appAccountToken ? { appAccountToken } : {}),
      state: "purchased",
      verified: true,
    };
  },
  unfinishedTransactions() {
    return Promise.resolve([]);
  },
  finish() {
    return Promise.resolve();
  },
  isVerifiedTransaction() {
    return Promise.resolve(true);
  },
  observe() {
    return () => undefined;
  },
};

const real: StoreKitAdapter = {
  async loadProduct() {
    if (!nativeModule || Platform.OS !== "ios")
      throw new Error("product-unavailable");
    return nativeModule.loadProduct(productId);
  },
  async purchase(appAccountToken) {
    if (!nativeModule || Platform.OS !== "ios")
      throw new Error("product-unavailable");
    return nativeModule.purchase(productId, appAccountToken);
  },
  async unfinishedTransactions() {
    if (!nativeModule || Platform.OS !== "ios")
      throw new Error("storekit-native-unavailable");
    return nativeModule.unfinishedTransactions();
  },
  async finish(transactionId) {
    if (!nativeModule || Platform.OS !== "ios")
      throw new Error("storekit-native-unavailable");
    await nativeModule.finish(transactionId);
  },
  async isVerifiedTransaction(transactionId) {
    if (!nativeModule || Platform.OS !== "ios")
      throw new Error("storekit-native-unavailable");
    return nativeModule.isVerifiedTransaction(transactionId, productId);
  },
  observe(listener) {
    if (!nativeModule || Platform.OS !== "ios")
      throw new Error("storekit-native-unavailable");
    const subscription = nativeModule.addListener(
      "onStoreKitTransaction",
      listener,
    );
    return () => subscription.remove();
  },
};

export const storeKit: StoreKitAdapter =
  extra?.storeKitMode === "real" ? real : mock;
export const isMockStoreKit = storeKit === mock;
