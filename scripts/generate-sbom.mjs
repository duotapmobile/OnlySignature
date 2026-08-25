import { mkdir, readFile, writeFile } from "node:fs/promises";

await mkdir("artifacts", { recursive: true });
const lock = JSON.parse(await readFile("package-lock.json", "utf8"));
const components = [];
const seen = new Set();
function packageName(packagePath, metadata) {
  if (metadata.name) return metadata.name;
  const normalized = packagePath.replaceAll("\\", "/");
  const marker = "node_modules/";
  const index = normalized.lastIndexOf(marker);
  return index >= 0 ? normalized.slice(index + marker.length) : null;
}
for (const [packagePath, metadata] of Object.entries(lock.packages ?? {})) {
  if (!packagePath.includes("node_modules/") || !metadata.version) continue;
  const name = packageName(packagePath, metadata);
  if (!name) continue;
  const key = `${name}@${metadata.version}`;
  if (seen.has(key)) continue;
  seen.add(key);
  const component = {
    type: "library",
    name,
    version: metadata.version,
    purl: `pkg:npm/${encodeURIComponent(name)}@${metadata.version}`,
  };
  if (metadata.license)
    component.licenses = [{ license: { id: metadata.license } }];
  if (metadata.integrity?.startsWith("sha512-")) {
    component.hashes = [
      { alg: "SHA-512", content: metadata.integrity.slice("sha512-".length) },
    ];
  }
  components.push(component);
}
const sbom = {
  bomFormat: "CycloneDX",
  specVersion: "1.5",
  version: 1,
  metadata: {
    timestamp: new Date().toISOString(),
    component: {
      type: "application",
      name: "only-signature",
      version: "1.0.0",
    },
    tools: {
      components: [
        {
          type: "application",
          name: "Only Signature lockfile SBOM generator",
          version: "1.0.0",
        },
      ],
    },
  },
  components: components.sort((a, b) => a.purl.localeCompare(b.purl)),
};
await writeFile(
  "artifacts/sbom.cdx.json",
  `${JSON.stringify(sbom, null, 2)}\n`,
);
process.stdout.write(
  `Wrote artifacts/sbom.cdx.json with ${components.length} components.\n`,
);
