export const nativeExportFailurePrefix = "Native export verification failed";

export type NativeExportStage =
  | "prepare protected temporary directory"
  | "reset verification directory"
  | "create verification directory"
  | "render transparent PNG"
  | "render white PNG"
  | "render white JPEG"
  | "copy verification files";

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

export const nativeExportStatusForError = (error: unknown): string =>
  error instanceof NativeExportStageError
    ? error.message
    : `${nativeExportFailurePrefix}: unknown stage`;
