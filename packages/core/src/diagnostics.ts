export type DiagnosticCategory =
  | "storage_unavailable"
  | "storage_corrupt"
  | "export_failed"
  | "storekit_pending"
  | "storekit_cancelled"
  | "storekit_failed"
  | "storekit_unverified"
  | "cleanup_failed";

export interface LocalDiagnostic {
  appVersion: string;
  buildNumber: string;
  deviceModel: string;
  osVersion: string;
  category: DiagnosticCategory;
  storeKitState?: "none" | "pending" | "recovery_required" | "purchased";
  exportFormat?: "png-transparent" | "png-white" | "jpeg-white";
}

export function renderDiagnostic(diagnostic: LocalDiagnostic): string {
  return [
    `App: ${diagnostic.appVersion} (${diagnostic.buildNumber})`,
    `Device: ${diagnostic.deviceModel}`,
    `OS: ${diagnostic.osVersion}`,
    `Category: ${diagnostic.category}`,
    diagnostic.storeKitState
      ? `Store state: ${diagnostic.storeKitState}`
      : null,
    diagnostic.exportFormat
      ? `Export format: ${diagnostic.exportFormat}`
      : null,
  ]
    .filter(Boolean)
    .join("\n");
}

export function assertDiagnosticSafe(text: string): void {
  const forbidden = [
    /stroke/i,
    /signature\.png/i,
    /initials\.png/i,
    /transaction.?id/i,
    /label:/i,
    /file content/i,
  ];
  if (forbidden.some((pattern) => pattern.test(text)))
    throw new Error("Diagnostic contains a prohibited sensitive field");
}
