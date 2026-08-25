export interface StorageEnvelope {
  schema: 1;
  checksum: string;
  payload: string;
}

export type Digest = (value: string) => Promise<string>;

export const encodeStorageEnvelope = async <T>(
  value: T,
  digest: Digest,
): Promise<string> => {
  const payload = JSON.stringify(value);
  return JSON.stringify({
    schema: 1,
    checksum: await digest(payload),
    payload,
  } satisfies StorageEnvelope);
};

export const decodeStorageEnvelope = async <T>(
  value: string,
  digest: Digest,
  allowLegacy = false,
): Promise<T> => {
  let parsed: unknown;
  try {
    parsed = JSON.parse(value);
  } catch {
    throw new Error("local-state-corrupted");
  }
  if (
    !parsed ||
    typeof parsed !== "object" ||
    (parsed as Partial<StorageEnvelope>).schema !== 1 ||
    typeof (parsed as Partial<StorageEnvelope>).payload !== "string" ||
    typeof (parsed as Partial<StorageEnvelope>).checksum !== "string"
  ) {
    if (allowLegacy) return parsed as T;
    throw new Error("local-state-corrupted");
  }
  const envelope = parsed as StorageEnvelope;
  if ((await digest(envelope.payload)) !== envelope.checksum)
    throw new Error("local-state-corrupted");
  try {
    return JSON.parse(envelope.payload) as T;
  } catch {
    throw new Error("local-state-corrupted");
  }
};
