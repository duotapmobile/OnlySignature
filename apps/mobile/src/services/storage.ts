import * as FileSystem from "expo-file-system/legacy";
import Constants from "expo-constants";
import * as Crypto from "expo-crypto";
import { OnlySignatureStorage } from "../../modules/only-signature-native";
import {
  decodeStorageEnvelope,
  encodeStorageEnvelope,
} from "./storageEnvelope";

const STATE_FILE = `${FileSystem.documentDirectory ?? ""}only-signature-state.json`;
const BACKUP_STATE_FILE = `${STATE_FILE}.previous`;
const TEMP_DIRECTORY = `${FileSystem.cacheDirectory ?? ""}only-signature-exports/`;

interface ProtectedStorageModule {
  readState(): Promise<string | null>;
  readBackupState(): Promise<string | null>;
  writeStateAtomically(value: string): Promise<void>;
  deleteState(): Promise<void>;
  cleanupTemporaryFiles(): Promise<void>;
  protectedTemporaryDirectory(): Promise<string>;
  promoteTemporaryExport(
    sourceUri: string,
    fileExtension: "png" | "jpg",
  ): Promise<string>;
  deleteTemporaryExport(uri: string): Promise<void>;
  protectTemporaryFile(uri: string): Promise<void>;
  verifyTemporaryFileProtection(uri: string): Promise<void>;
}

const nativeStorage = OnlySignatureStorage as ProtectedStorageModule | null;
const production =
  (Constants.expoConfig?.extra as { releaseChannel?: string } | undefined)
    ?.releaseChannel === "production";

const requireProtectedStorage = (): ProtectedStorageModule | null => {
  if (nativeStorage) return nativeStorage;
  if (production) throw new Error("protected-storage-unavailable");
  return null;
};

const digest = (value: string) =>
  Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, value);

export const appStorage = {
  async read<T>(validate?: (value: unknown) => T): Promise<T | null> {
    const storage = requireProtectedStorage();
    let value: string | null;
    const readBackup = async (): Promise<string | null> => {
      if (storage) return storage.readBackupState();
      const info = await FileSystem.getInfoAsync(BACKUP_STATE_FILE);
      return info.exists
        ? FileSystem.readAsStringAsync(BACKUP_STATE_FILE)
        : null;
    };
    if (storage) value = await storage.readState();
    else {
      const info = await FileSystem.getInfoAsync(STATE_FILE);
      value = info.exists
        ? await FileSystem.readAsStringAsync(STATE_FILE)
        : null;
    }
    if (!value) {
      const backup = await readBackup();
      if (!backup) return null;
      const decoded = await decodeStorageEnvelope<unknown>(
        backup,
        digest,
        !production,
      );
      return validate ? validate(decoded) : (decoded as T);
    }
    try {
      const decoded = await decodeStorageEnvelope<unknown>(
        value,
        digest,
        !production,
      );
      return validate ? validate(decoded) : (decoded as T);
    } catch {
      const backup = await readBackup();
      if (!backup) throw new Error("local-state-corrupted-no-backup");
      const decoded = await decodeStorageEnvelope<unknown>(
        backup,
        digest,
        !production,
      );
      return validate ? validate(decoded) : (decoded as T);
    }
  },

  async write<T>(value: T): Promise<void> {
    const serialized = await encodeStorageEnvelope(value, digest);
    const storage = requireProtectedStorage();
    if (storage) {
      await storage.writeStateAtomically(serialized);
      return;
    }
    const staging = `${STATE_FILE}.staging`;
    await FileSystem.writeAsStringAsync(staging, serialized, {
      encoding: FileSystem.EncodingType.UTF8,
    });
    const current = await FileSystem.getInfoAsync(STATE_FILE);
    if (current.exists) {
      await FileSystem.deleteAsync(BACKUP_STATE_FILE, { idempotent: true });
      await FileSystem.copyAsync({ from: STATE_FILE, to: BACKUP_STATE_FILE });
      await FileSystem.deleteAsync(STATE_FILE, { idempotent: true });
    }
    await FileSystem.moveAsync({ from: staging, to: STATE_FILE });
  },

  async clear(): Promise<void> {
    const storage = requireProtectedStorage();
    if (storage) await storage.deleteState();
    else {
      await FileSystem.deleteAsync(STATE_FILE, { idempotent: true });
      await FileSystem.deleteAsync(BACKUP_STATE_FILE, { idempotent: true });
    }
    await this.cleanupTemporaryFiles();
  },

  async cleanupTemporaryFiles(): Promise<void> {
    const storage = requireProtectedStorage();
    if (storage) await storage.cleanupTemporaryFiles();
    await FileSystem.deleteAsync(TEMP_DIRECTORY, { idempotent: true });
  },

  async ensureTempDirectory(): Promise<string> {
    const storage = requireProtectedStorage();
    if (storage) return storage.protectedTemporaryDirectory();
    const info = await FileSystem.getInfoAsync(TEMP_DIRECTORY);
    if (!info.exists)
      await FileSystem.makeDirectoryAsync(TEMP_DIRECTORY, {
        intermediates: true,
      });
    return TEMP_DIRECTORY;
  },

  async promoteTemporaryExport(
    sourceUri: string,
    fileExtension: "png" | "jpg",
  ): Promise<string> {
    const storage = requireProtectedStorage();
    if (!storage) throw new Error("protected-export-promotion-unavailable");
    return storage.promoteTemporaryExport(sourceUri, fileExtension);
  },

  async deleteTemporaryExport(uri: string): Promise<void> {
    const storage = requireProtectedStorage();
    if (!storage) throw new Error("protected-export-deletion-unavailable");
    await storage.deleteTemporaryExport(uri);
  },

  async protectTemporaryFile(uri: string): Promise<void> {
    const storage = requireProtectedStorage();
    if (storage) await storage.protectTemporaryFile(uri);
  },

  async verifyTemporaryFileProtection(uri: string): Promise<void> {
    const storage = requireProtectedStorage();
    if (storage) await storage.verifyTemporaryFileProtection(uri);
  },
};
