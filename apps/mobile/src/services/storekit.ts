import Constants from "expo-constants";
import { Platform } from "react-native";
import { OnlySignatureStoreKit } from "../../modules/only-signature-native";
import {
  storeKitTransaction,
  type StoreKitTransaction,
} from "./storekitContract";

export type { PurchaseState, StoreKitTransaction } from "./storekitContract";

export interface ProductInfo {
  productId: string;
  displayPrice: string;
}

export interface StoreKitAdapter {
  loadProduct(): Promise<ProductInfo>;
  purchase(appAccountToken?: string): Promise<StoreKitTransaction>;
  unfinishedSnapshot(): Promise<StoreKitTransaction[]>;
  finish(transactionId: string): Promise<boolean>;
  observe(listener: (transaction: StoreKitTransaction) => void): () => void;
}

const extra = Constants.expoConfig?.extra as
  | { storeKitMode?: string; storeKitProductId?: string }
  | undefined;
const productId =
  extra?.storeKitProductId ?? "com.duotap.onlysignature.transparent-set-v1";
export const configuredStoreKitProductId = productId;

const nativeModule = OnlySignatureStoreKit as {
  loadProduct(productIdValue: string): Promise<ProductInfo>;
  purchase(
    productIdValue: string,
    appAccountToken?: string,
  ): Promise<StoreKitTransaction>;
  unfinishedSnapshot(): Promise<StoreKitTransaction[]>;
  finish(transactionId: string): Promise<boolean>;
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
  unfinishedSnapshot() {
    return Promise.resolve([]);
  },
  finish() {
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
    return storeKitTransaction(
      await nativeModule.purchase(productId, appAccountToken),
    );
  },
  async unfinishedSnapshot() {
    if (!nativeModule || Platform.OS !== "ios")
      throw new Error("storekit-native-unavailable");
    return (await nativeModule.unfinishedSnapshot()).map(storeKitTransaction);
  },
  async finish(transactionId) {
    if (!nativeModule || Platform.OS !== "ios")
      throw new Error("storekit-native-unavailable");
    return nativeModule.finish(transactionId);
  },
  observe(listener) {
    if (!nativeModule || Platform.OS !== "ios")
      throw new Error("storekit-native-unavailable");
    const subscription = nativeModule.addListener(
      "onStoreKitTransaction",
      (transaction) => listener(storeKitTransaction(transaction)),
    );
    return () => subscription.remove();
  },
};

export const storeKit: StoreKitAdapter =
  extra?.storeKitMode === "real" ? real : mock;
export const isMockStoreKit = storeKit === mock;
