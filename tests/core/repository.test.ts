import { describe, expect, it } from "vitest";
import {
  CorruptStateError,
  MemoryStorageAdapter,
  ProtectedDataUnavailableError,
  PurchaseInFlightError,
  SignatureRepository,
  createDraftSet,
  preparePurchase,
} from "../../packages/core/src/index";

describe("protected repository", () => {
  it("round-trips an atomically checksummed state", async () => {
    const storage = new MemoryStorageAdapter();
    const repository = new SignatureRepository(storage);
    const set = createDraftSet("set-1", "Signature Set 1", "now");
    const state = {
      sets: [set],
      purchaseIntents: [],
      reviewPromptValueMoments: 0,
    };
    await repository.save(state);
    await expect(repository.load()).resolves.toEqual(state);
  });

  it("fails closed while protected data is unavailable", async () => {
    const storage = new MemoryStorageAdapter();
    storage.available = false;
    await expect(
      new SignatureRepository(storage).load(),
    ).rejects.toBeInstanceOf(ProtectedDataUnavailableError);
  });

  it("detects corrupted state", async () => {
    const storage = new MemoryStorageAdapter();
    storage.values.set(
      SignatureRepository.stateKey,
      JSON.stringify({
        version: 1,
        checksum: "wrong",
        payload: { sets: [], purchaseIntents: [], reviewPromptValueMoments: 0 },
      }),
    );
    await expect(
      new SignatureRepository(storage).load(),
    ).rejects.toBeInstanceOf(CorruptStateError);
  });

  it("does not erase local state during a prepared purchase", async () => {
    const storage = new MemoryStorageAdapter();
    const repository = new SignatureRepository(storage);
    const set = {
      ...createDraftSet("set-1", "Signature Set 1", "now"),
      signature: {
        kind: "signature" as const,
        state: "draft" as const,
        drawing: {
          renderingVersion: 1 as const,
          width: 10,
          height: 10,
          orientation: "portrait" as const,
          strokes: [{ id: "s", points: [{ x: 1, y: 1, t: 0 }] }],
        },
        normalizedHash: "h",
        finalizedAt: null,
      },
    };
    const intent = preparePurchase(
      set,
      "intent",
      "com.example.onlysignature.transparent-set-v1",
      "now",
    );
    const state = {
      sets: [set],
      purchaseIntents: [intent],
      reviewPromptValueMoments: 0,
    };
    await repository.save(state);
    await expect(repository.deleteAll(state)).rejects.toBeInstanceOf(
      PurchaseInFlightError,
    );
    await expect(repository.load()).resolves.toEqual(state);
  });

  it("preserves the previous generation when an atomic write fails", async () => {
    const storage = new MemoryStorageAdapter();
    const repository = new SignatureRepository(storage);
    const state = {
      sets: [],
      purchaseIntents: [],
      reviewPromptValueMoments: 0,
    };
    await repository.save(state);
    storage.failNextWrite = true;
    await expect(
      repository.save({ ...state, reviewPromptValueMoments: 1 }),
    ).rejects.toThrow(/low-disk/);
    await expect(repository.load()).resolves.toEqual(state);
  });
});
