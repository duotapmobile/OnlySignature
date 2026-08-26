import type { GeneratedFile } from "./export";

export async function generateExportBatch(
  producers: (() => Promise<GeneratedFile>)[],
  cleanup: (files: GeneratedFile[]) => Promise<void>,
): Promise<GeneratedFile[]> {
  const generated: GeneratedFile[] = [];
  try {
    for (const produce of producers) generated.push(await produce());
    return generated;
  } catch (error) {
    await cleanup(generated).catch(() => undefined);
    throw error;
  }
}
