import { createHash } from "node:crypto";
import { createRequire } from "node:module";
import {
  existsSync,
  lstatSync,
  readFileSync,
  realpathSync,
  writeFileSync,
} from "node:fs";
import { dirname, isAbsolute, relative, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { backportRecipes } from "./security/backport-recipes.mjs";

export const repositoryRoot = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "..",
);
export const sha256 = (bytes) =>
  createHash("sha256").update(bytes).digest("hex");

function inside(root, target) {
  const rel = relative(root, target);
  if (isAbsolute(rel) || rel === ".." || rel.startsWith(`..${sep}`)) {
    throw new Error("Dependency path escaped repository boundary");
  }
}

function safeFile(root, path) {
  const absolute = resolve(root, path);
  inside(root, absolute);
  let current = root;
  for (const part of relative(root, absolute).split(sep)) {
    current = resolve(current, part);
    if (!existsSync(current)) break;
    if (lstatSync(current).isSymbolicLink())
      throw new Error(`Unexpected dependency symlink: ${path}`);
    inside(root, realpathSync(current));
  }
  return absolute;
}

export function assertResolvedCopy(pkg, root, directory) {
  const normalize = (path) =>
    process.platform === "win32" ? resolve(path).toLowerCase() : resolve(path);
  if (
    !pkg.copies.some(
      (copy) =>
        normalize(resolve(root, copy.location)) === normalize(directory),
    )
  ) {
    throw new Error(`Unreviewed resolved dependency copy: ${pkg.name}`);
  }
}

function verifyDependencyBindings(root, lock, plan) {
  for (const [location, metadata] of Object.entries(lock.packages)) {
    const owner = resolve(root, location, "package.json");
    if (!existsSync(owner)) continue; // Uninstalled platform-optional owner.
    for (const pkg of plan) {
      if (
        !metadata.dependencies?.[pkg.name] &&
        !metadata.optionalDependencies?.[pkg.name] &&
        !metadata.devDependencies?.[pkg.name]
      )
        continue;
      const entry = createRequire(pathToFileURL(owner)).resolve(pkg.name);
      inside(root, realpathSync(entry));
      let directory = dirname(entry);
      while (true) {
        inside(root, directory);
        const manifest = resolve(directory, "package.json");
        if (
          existsSync(manifest) &&
          JSON.parse(readFileSync(manifest, "utf8")).name === pkg.name
        )
          break;
        const parent = dirname(directory);
        if (parent === directory)
          throw new Error(`Missing resolved manifest: ${pkg.name}`);
        directory = parent;
      }
      assertResolvedCopy(pkg, root, directory);
    }
  }
}

export function buildBackportPlan(root = repositoryRoot) {
  root = realpathSync(root);
  const lock = JSON.parse(
    readFileSync(resolve(root, "package-lock.json"), "utf8"),
  );
  if (lock.lockfileVersion !== 3 || !lock.packages)
    throw new Error("Unsupported lockfile");
  const plan = backportRecipes.map((recipe) => {
    const locations = Object.entries(lock.packages).filter(
      ([path]) =>
        path === `node_modules/${recipe.name}` ||
        path.endsWith(`/node_modules/${recipe.name}`),
    );
    if (!locations.length)
      throw new Error(`Missing locked dependency: ${recipe.name}`);
    const copies = locations.map(([location, locked]) => {
      if (locked.version !== recipe.version)
        throw new Error(`Unreviewed locked version: ${location}`);
      const manifest = JSON.parse(
        readFileSync(safeFile(root, `${location}/package.json`), "utf8"),
      );
      if (
        manifest.name !== recipe.name ||
        manifest.version !== recipe.version
      ) {
        throw new Error(`Unreviewed installed version: ${location}`);
      }
      return {
        location,
        files: recipe.files.map((file) => ({
          ...file,
          absolute: safeFile(root, `${location}/${file.path}`),
        })),
      };
    });
    return {
      name: recipe.name,
      version: recipe.version,
      advisory: recipe.advisory,
      copies,
    };
  });
  verifyDependencyBindings(root, lock, plan);
  return plan;
}

export function classifyBytes(file, bytes) {
  const digest = bytes === null ? null : sha256(bytes);
  if (digest === file.patched) return "patched";
  if (digest === file.original) return "pristine";
  throw new Error(`Unreviewed dependency bytes: ${file.path}`);
}

export function verifyBackports(root = repositoryRoot) {
  const plan = buildBackportPlan(root);
  for (const pkg of plan)
    for (const copy of pkg.copies)
      for (const file of copy.files) {
        const bytes = existsSync(file.absolute)
          ? readFileSync(file.absolute)
          : null;
        if (classifyBytes(file, bytes) !== "patched")
          throw new Error(
            `Backport not applied: ${copy.location}/${file.path}`,
          );
      }
  return plan;
}

export function applyBackports(root = repositoryRoot) {
  const plan = buildBackportPlan(root);
  const writes = [];
  // Validate the entire transaction before changing any installed file.
  for (const pkg of plan)
    for (const copy of pkg.copies)
      for (const file of copy.files) {
        const bytes = existsSync(file.absolute)
          ? readFileSync(file.absolute)
          : null;
        if (classifyBytes(file, bytes) === "patched") continue;
        const patched = file.transform(
          bytes === null ? "" : bytes.toString("utf8"),
        );
        if (sha256(patched) !== file.patched)
          throw new Error(`Backport recipe digest mismatch: ${file.path}`);
        writes.push({ absolute: file.absolute, patched });
      }
  for (const file of writes) writeFileSync(file.absolute, file.patched);
  verifyBackports(root);
  return writes.length;
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  try {
    if (process.argv[2] === "--plan") {
      for (const pkg of buildBackportPlan())
        for (const copy of pkg.copies)
          for (const file of copy.files) {
            const bytes = existsSync(file.absolute)
              ? readFileSync(file.absolute)
              : null;
            if ((bytes === null ? null : sha256(bytes)) !== file.original)
              throw new Error("Hash planning requires pristine upstream bytes");
            console.log(
              JSON.stringify({
                name: pkg.name,
                path: file.path,
                patched: sha256(
                  file.transform(bytes === null ? "" : bytes.toString("utf8")),
                ),
              }),
            );
          }
    } else if (process.argv[2] === "--apply") {
      console.log(
        `Verified dependency backports; changed ${applyBackports()} installed files.`,
      );
    } else if (process.argv[2] === "--verify") {
      verifyBackports();
      console.log(
        "Exact dependency-backport versions and source hashes verified.",
      );
    } else throw new Error("Expected --apply or --verify");
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
