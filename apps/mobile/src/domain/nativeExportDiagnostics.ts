export const nativeExportFailurePrefix = "Native export verification failed";

export type NativeExportStage =
  | "resolve verification container"
  | "inspect existing target"
  | "remove existing target"
  | "create target directory"
  | "apply target protection"
  | "verify target existence and writability"
  | "resolve/capture view reference"
  | "invoke captureRef"
  | "validate/normalize returned source URI"
  | "verify source existence/readability"
  | "prepare/remove destination"
  | "move/copy captured file to protected Caches target"
  | "apply Complete Protection"
  | "apply/verify backup exclusion"
  | "verify final target existence/readability"
  | "render white PNG"
  | "render white JPEG"
  | "copy verification files";

type UnknownRecord = Record<string, unknown>;

interface SanitizedNativeError {
  domain?: string;
  code?: string;
  posix?: number;
}

const asRecord = (value: unknown): UnknownRecord | null =>
  typeof value === "object" && value !== null ? (value as UnknownRecord) : null;

const safeDomain = (value: unknown): string | undefined =>
  typeof value === "string" && /^[A-Za-z][A-Za-z0-9_.-]{0,63}$/.test(value)
    ? value
    : undefined;

const safeCode = (value: unknown): string | undefined => {
  if (typeof value === "number" && Number.isSafeInteger(value)) {
    return String(value);
  }
  return typeof value === "string" && /^[A-Z][A-Z0-9_.-]{0,63}$/.test(value)
    ? value
    : undefined;
};

const numericCode = (value: unknown): number | undefined => {
  if (typeof value === "number" && Number.isSafeInteger(value)) return value;
  if (typeof value !== "string" || !/^-?\d{1,10}$/.test(value))
    return undefined;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) ? parsed : undefined;
};

const underlyingCandidates = (record: UnknownRecord): unknown[] => {
  const userInfo = asRecord(record.userInfo);
  return [
    record.cause,
    record.underlyingError,
    record.NSUnderlyingError,
    userInfo?.NSUnderlyingError,
    userInfo?.underlyingError,
  ];
};

const findPosixCode = (
  value: unknown,
  seen = new Set<object>(),
  depth = 0,
): number | undefined => {
  if (depth > 4) return undefined;
  const record = asRecord(value);
  if (!record || seen.has(record)) return undefined;
  seen.add(record);
  const domain = safeDomain(record.domain ?? record.errorDomain);
  const code = numericCode(record.code ?? record.errorCode);
  if (domain === "NSPOSIXErrorDomain" && code !== undefined) return code;
  for (const candidate of underlyingCandidates(record)) {
    const nested = findPosixCode(candidate, seen, depth + 1);
    if (nested !== undefined) return nested;
  }
  return undefined;
};

export const sanitizeNativeExportError = (
  value: unknown,
): SanitizedNativeError => {
  const record = asRecord(value);
  if (!record) return {};
  const sanitized: SanitizedNativeError = {};
  const domain = safeDomain(record.domain ?? record.errorDomain);
  const code = safeCode(record.code ?? record.errorCode);
  const posix = findPosixCode(record);
  if (domain) sanitized.domain = domain;
  if (code) sanitized.code = code;
  if (posix !== undefined) sanitized.posix = posix;
  return sanitized;
};

export class NativeExportStageError extends Error {
  constructor(
    readonly stage: NativeExportStage,
    options?: ErrorOptions,
  ) {
    super(`${nativeExportFailurePrefix}: ${stage}`, options);
    this.name = "NativeExportStageError";
  }
}

export const runNativeExportStage = async <T>(
  stage: NativeExportStage,
  operation: () => Promise<T>,
): Promise<T> => {
  try {
    return await operation();
  } catch (cause) {
    throw new NativeExportStageError(stage, { cause });
  }
};

export const nativeExportStatusForError = (error: unknown): string => {
  if (!(error instanceof NativeExportStageError)) {
    return `${nativeExportFailurePrefix}: unknown stage`;
  }
  const sanitized = sanitizeNativeExportError(error.cause);
  const details = [
    sanitized.domain ? `domain=${sanitized.domain}` : null,
    sanitized.code ? `code=${sanitized.code}` : null,
    sanitized.posix !== undefined ? `posix=${sanitized.posix}` : null,
  ].filter((value): value is string => value !== null);
  return details.length > 0
    ? `${error.message} [${details.join(" ")}]`
    : error.message;
};
