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
  purchase(appAccountToken: string): Promise<StoreKitTransaction>;
  unfinishedSnapshot(): Promise<StoreKitTransaction[]>;
  finish(transactionId: string): Promise<boolean>;
  observe(listener: (transaction: StoreKitTransaction) => void): () => void;
}

const extra = Constants.expoConfig?.extra as
  | {
      releaseChannel?: string;
      screenshotFixtureMode?: boolean;
      storeKitMode?: string;
      storeKitProductId?: string;
    }
  | undefined;
const productId =
  extra?.storeKitProductId ?? "com.duotap.onlysignature.transparent_set_v1";
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
    if (
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        appAccountToken,
      )
    )
      throw new Error("storekit-invalid-app-account-token");
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

const disabled: StoreKitAdapter = {
  loadProduct: () => Promise.reject(new Error("storekit-mode-disabled")),
  purchase: () => Promise.reject(new Error("storekit-mode-disabled")),
  unfinishedSnapshot: () => Promise.reject(new Error("storekit-mode-disabled")),
  finish: () => Promise.reject(new Error("storekit-mode-disabled")),
  observe: () => {
    throw new Error("storekit-mode-disabled");
  },
};
const mockAllowed =
  extra?.storeKitMode === "mock" &&
  (extra.releaseChannel === "development" ||
    extra.releaseChannel === "preview" ||
    extra.screenshotFixtureMode === true);
export const storeKit: StoreKitAdapter =
  extra?.storeKitMode === "real" ? real : mockAllowed ? mock : disabled;
export const isMockStoreKit = storeKit === mock;
