import { fnv1aHash } from "./strokes";
import { canDeleteAll } from "./purchase";
import type { PendingPurchase, SignatureSet } from "./types";

export interface StorageAdapter {
  read(key: string): Promise<string | null>;
  writeAtomic(key: string, value: string): Promise<void>;
  remove(key: string): Promise<void>;
  protectedDataAvailable(): Promise<boolean>;
}

interface Envelope<T> {
  version: 1;
  checksum: string;
  payload: T;
}
export interface RepositoryState {
  sets: SignatureSet[];
  purchaseIntents: PendingPurchase[];
  reviewPromptValueMoments: number;
}

const emptyState = (): RepositoryState => ({
  sets: [],
  purchaseIntents: [],
  reviewPromptValueMoments: 0,
});

export class SignatureRepository {
  static readonly stateKey = "only-signature-state-v1";
  constructor(private readonly storage: StorageAdapter) {}

  async load(): Promise<RepositoryState> {
    if (!(await this.storage.protectedDataAvailable()))
      throw new ProtectedDataUnavailableError();
    const raw = await this.storage.read(SignatureRepository.stateKey);
    if (!raw) return emptyState();
    const envelope = JSON.parse(raw) as Envelope<RepositoryState>;
    if (envelope.version !== 1)
      throw new CorruptStateError("Unsupported storage version");
    const serialized = JSON.stringify(envelope.payload);
    if (fnv1aHash(serialized) !== envelope.checksum)
      throw new CorruptStateError("Storage checksum mismatch");
    return envelope.payload;
  }

  async save(state: RepositoryState): Promise<void> {
    if (!(await this.storage.protectedDataAvailable()))
      throw new ProtectedDataUnavailableError();
    const serialized = JSON.stringify(state);
    const envelope: Envelope<RepositoryState> = {
      version: 1,
      checksum: fnv1aHash(serialized),
      payload: state,
    };
    await this.storage.writeAtomic(
      SignatureRepository.stateKey,
      JSON.stringify(envelope),
    );
    const reread = await this.load();
    if (JSON.stringify(reread) !== serialized)
      throw new CorruptStateError("Atomic write read-back failed");
  }

  async deleteAll(state: RepositoryState): Promise<RepositoryState> {
    if (!canDeleteAll(state.purchaseIntents)) throw new PurchaseInFlightError();
    await this.storage.remove(SignatureRepository.stateKey);
    return emptyState();
  }
}

export class ProtectedDataUnavailableError extends Error {
  constructor() {
    super("Protected data is unavailable");
    this.name = "ProtectedDataUnavailableError";
  }
}
export class CorruptStateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CorruptStateError";
  }
}
export class PurchaseInFlightError extends Error {
  constructor() {
    super(
      "Delete All is unavailable while a purchase is pending or recovering",
    );
    this.name = "PurchaseInFlightError";
  }
}

export class MemoryStorageAdapter implements StorageAdapter {
  readonly values = new Map<string, string>();
  available = true;
  failNextWrite = false;
  read(key: string): Promise<string | null> {
    return Promise.resolve(this.values.get(key) ?? null);
  }
  writeAtomic(key: string, value: string): Promise<void> {
    if (this.failNextWrite) {
      this.failNextWrite = false;
      return Promise.reject(new Error("Simulated low-disk write failure"));
    }
    this.values.set(key, value);
    return Promise.resolve();
  }
  remove(key: string): Promise<void> {
    this.values.delete(key);
    return Promise.resolve();
  }
  protectedDataAvailable(): Promise<boolean> {
    return Promise.resolve(this.available);
  }
}
