import { beforeAll, describe, expect, it } from "vitest";
import { verifyBackports } from "../../scripts/security-backports.mjs";
import { classifyAudit } from "../../scripts/security/dependency-audit-policy.mjs";

let proof: any;
beforeAll(() => {
  proof = verifyBackports();
});
function finding(name = "node-forge", overrides = {}) {
  const braces = name === "braces";
  return {
    name,
    dependency: name,
    severity: "high",
    source: braces ? 1240992 : 1240912,
    url: `https://github.com/advisories/${braces ? "GHSA-vfj7-8cjw-p6xm" : "GHSA-86w9-cpqp-85rv"}`,
    range: braces ? "<=3.0.3" : "<=1.4.0",
    ...overrides,
  };
}
function entry(
  name: string,
  via: any[],
  severity = "high",
  nodes = [`node_modules/${name}`],
) {
  return { name, via, severity, nodes };
}
function report(vulnerabilities: Record<string, any>) {
  const counts: Record<string, number> = {
    info: 0,
    low: 0,
    moderate: 0,
    high: 0,
    critical: 0,
    total: 0,
  };
  for (const entry of Object.values(vulnerabilities)) {
    counts[entry.severity]++;
    counts.total++;
  }
  return {
    auditReportVersion: 2,
    vulnerabilities,
    metadata: { vulnerabilities: counts },
  };
}

describe("narrow verified-advisory recognition", () => {
  it("recognizes only the two exact patched advisory roots and their parents", () => {
    const audit = report({
      "node-forge": entry("node-forge", [finding()]),
      braces: entry("braces", [finding("braces")]),
      parent: entry("parent", ["node-forge", "braces"]),
    });
    const result = classifyAudit(audit, proof);
    expect(result.recognized).toHaveLength(2);
    expect(result.blocking).toEqual([]);
    expect(result.raw.high).toBe(3);
  });
  it.each(["unknown-id", "critical", "different-source", "different-range"])(
    "blocks %s even in an otherwise patched package",
    (change) => {
      const changes =
        change === "unknown-id"
          ? { url: "https://github.com/advisories/GHSA-unknown" }
          : change === "critical"
            ? { severity: "critical" }
            : change === "different-source"
              ? { source: 999999 }
              : { range: "<=9.0.0" };
      const audit = report({
        "node-forge": entry(
          "node-forge",
          [finding("node-forge", changes)],
          change === "critical" ? "critical" : "high",
        ),
      });
      expect(classifyAudit(audit, proof).blocking).toHaveLength(1);
    },
  );
  it("blocks additional vulnerable installed copies and absent version proof", () => {
    const audit = report({
      "node-forge": entry("node-forge", [finding()], "high", [
        "node_modules/node-forge",
        "node_modules/extra/node_modules/node-forge",
      ]),
    });
    expect(classifyAudit(audit, proof).blocking).toHaveLength(1);
    expect(
      classifyAudit(
        report({ "node-forge": entry("node-forge", [finding()]) }),
        [],
      ).blocking,
    ).toHaveLength(1);
  });
  it("does not hide unknown high findings alongside known patches", () => {
    const audit = report({
      "node-forge": entry("node-forge", [finding()]),
      other: entry("other", [
        finding("other", { url: "https://example.invalid/advisory" }),
      ]),
    });
    expect(classifyAudit(audit, proof).blocking).toHaveLength(1);
  });
  it("resolves real cycles without losing known or unknown advisory roots", () => {
    const cyclic = {
      "node-forge": entry("node-forge", [finding()]),
      a: entry("a", ["b", "node-forge"]),
      b: entry("b", ["a"]),
    };
    expect(classifyAudit(report(cyclic), proof).blocking).toEqual([]);
    cyclic.b.via.push(finding("b", { url: "https://example.invalid/unknown" }));
    expect(classifyAudit(report(cyclic), proof).blocking).toHaveLength(1);
  });
  it("retains the existing moderate threshold and passes empty audits", () => {
    const moderate = report({
      ordinary: entry(
        "ordinary",
        [finding("ordinary", { severity: "moderate" })],
        "moderate",
      ),
    });
    expect(classifyAudit(moderate, proof).blocking).toEqual([]);
    expect(classifyAudit(report({}), proof).blocking).toEqual([]);
  });
  it("fails closed on malformed, errored, dangling, cyclic, or inconsistent audits", () => {
    const invalid = [
      { error: { code: "EUNAVAILABLE" }, ...report({}) },
      { ...report({}), auditReportVersion: 99 },
      report({ parent: entry("parent", ["missing"]) }),
      report({ a: entry("a", ["b"]), b: entry("b", ["a"]) }),
      report({ "node-forge": entry("node-forge", [finding()], "moderate") }),
      report({ "node-forge": entry("node-forge", [finding()], "critical") }),
      report({
        "node-forge": entry("node-forge", [finding()]),
        parent: entry("parent", ["node-forge"], "critical"),
      }),
      { ...report({}), metadata: { vulnerabilities: { high: 0 } } },
    ];
    for (const audit of invalid)
      expect(() => classifyAudit(audit, proof)).toThrow();
  });
});
