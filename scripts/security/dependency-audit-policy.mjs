const levels = ["info", "low", "moderate", "high", "critical"];
const reviewed = {
  "node-forge": {
    version: "1.4.0",
    source: 1240912,
    range: "<=1.4.0",
    url: "https://github.com/advisories/GHSA-86w9-cpqp-85rv",
  },
  braces: {
    version: "3.0.3",
    source: 1240992,
    range: "<=3.0.3",
    url: "https://github.com/advisories/GHSA-vfj7-8cjw-p6xm",
  },
};

// This function classifies metadata only. The caller must first verify installed
// source hashes and execute the regressions; no saved receipt replaces either.
export function classifyAudit(report, verifiedPlan) {
  if (
    report?.error ||
    report?.auditReportVersion !== 2 ||
    !report.vulnerabilities ||
    typeof report.vulnerabilities !== "object" ||
    Array.isArray(report.vulnerabilities)
  ) {
    throw new Error("Dependency audit unavailable or unsupported");
  }
  const entries = report.vulnerabilities;
  const counts = Object.fromEntries(levels.map((level) => [level, 0]));
  for (const [name, entry] of Object.entries(entries)) {
    if (
      !entry ||
      entry.name !== name ||
      !levels.includes(entry.severity) ||
      !Array.isArray(entry.via) ||
      !entry.via.length ||
      !Array.isArray(entry.nodes) ||
      !entry.nodes.length ||
      !entry.nodes.every((node) => typeof node === "string")
    ) {
      throw new Error(`Invalid dependency audit entry: ${name}`);
    }
    counts[entry.severity]++;
  }
  const metadata = report.metadata?.vulnerabilities;
  if (
    !metadata ||
    !levels.every(
      (level) =>
        Number.isSafeInteger(metadata[level]) &&
        metadata[level] === counts[level],
    ) ||
    metadata.total !== Object.keys(entries).length
  ) {
    throw new Error("Dependency audit counts do not match entries");
  }

  // npm's meta-vulnerability graph can contain real dependency cycles. Resolve
  // advisory roots to a fixed point, rather than skipping a cycle or recursing.
  const resolved = new Map(
    Object.keys(entries).map((name) => [name, new Map()]),
  );
  const dependents = new Map(
    Object.keys(entries).map((name) => [name, new Set()]),
  );
  for (const [name, entry] of Object.entries(entries)) {
    entry.via.forEach((via, index) => {
      if (typeof via === "string") {
        if (!resolved.has(via))
          throw new Error(`Invalid dependency audit graph: ${via}`);
        dependents.get(via).add(name);
        return;
      }
      if (
        !via ||
        typeof via !== "object" ||
        !levels.includes(via.severity) ||
        typeof via.url !== "string" ||
        via.name !== name ||
        via.dependency !== name
      ) {
        throw new Error(`Invalid dependency advisory: ${name}`);
      }
      resolved.get(name).set(`${name}/${index}`, { name, advisory: via });
    });
  }
  const queue = [...resolved.keys()].filter((name) => resolved.get(name).size);
  for (let i = 0; i < queue.length; i++) {
    const name = queue[i];
    for (const dependent of dependents.get(name)) {
      let changed = false;
      for (const [key, leaf] of resolved.get(name)) {
        if (!resolved.get(dependent).has(key)) {
          resolved.get(dependent).set(key, leaf);
          changed = true;
        }
      }
      if (changed) queue.push(dependent);
    }
  }

  const recognized = new Set();
  const blocking = new Set();
  for (const [name, entry] of Object.entries(entries)) {
    const leaves = [...resolved.get(name).values()];
    if (!leaves.length)
      throw new Error(
        `Invalid dependency audit graph without advisory roots: ${name}`,
      );
    const rank = Math.max(
      ...leaves.map((leaf) => levels.indexOf(leaf.advisory.severity)),
    );
    if (levels.indexOf(entry.severity) !== rank) {
      throw new Error(`Inconsistent dependency advisory severity: ${name}`);
    }
    for (const leaf of leaves) {
      const advisory = leaf.advisory;
      if (levels.indexOf(advisory.severity) < 3) continue;
      const rule = reviewed[leaf.name];
      const proof = verifiedPlan.find((pkg) => pkg.name === leaf.name);
      const expectedNodes = proof?.copies.map((copy) => copy.location).sort();
      const actualNodes = [...entries[leaf.name].nodes].sort();
      if (
        rule &&
        proof?.version === rule.version &&
        advisory.source === rule.source &&
        advisory.url === rule.url &&
        advisory.range === rule.range &&
        advisory.severity === "high" &&
        proof.advisory === rule.url &&
        JSON.stringify(actualNodes) === JSON.stringify(expectedNodes)
      ) {
        recognized.add(advisory.url);
      } else
        blocking.add(`${leaf.name}: ${advisory.url} (${advisory.severity})`);
    }
  }
  return {
    raw: metadata,
    recognized: [...recognized].sort(),
    blocking: [...blocking].sort(),
  };
}
