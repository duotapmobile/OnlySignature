import { createRequire } from "node:module";
import { resolve } from "node:path";
import { beforeAll, describe, expect, it } from "vitest";
import { generateCode, parseModule } from "magicast";
import {
  verifyBackports,
  classifyBytes,
  assertResolvedCopy,
  repositoryRoot,
} from "../../scripts/security-backports.mjs";

const require = createRequire(import.meta.url);
const forge = require("node-forge");
const braces = require("braces");
const micromatch = require("micromatch");
const CachePolicy = require("http-cache-semantics");
const { SourceMapConsumer } = require("source-map-js");

beforeAll(() => verifyBackports());

describe("hash-bound dependency backports", () => {
  it("rejects an unregistered resolved copy even when the locked copy is patched", () => {
    for (const pkg of verifyBackports()) {
      expect(() =>
        assertResolvedCopy(
          pkg,
          repositoryRoot,
          resolve(repositoryRoot, pkg.copies[0].location),
        ),
      ).not.toThrow();
      expect(() =>
        assertResolvedCopy(
          pkg,
          repositoryRoot,
          resolve(
            repositoryRoot,
            `node_modules/unregistered/node_modules/${pkg.name}`,
          ),
        ),
      ).toThrow(/Unreviewed resolved dependency copy/);
    }
  });
  it("rejects altered or absent patched source bytes", () => {
    for (const pkg of verifyBackports())
      for (const copy of pkg.copies)
        for (const file of copy.files) {
          expect(() =>
            classifyBytes(file, Buffer.from("unreviewed replacement")),
          ).toThrow(/Unreviewed dependency bytes/);
          if (file.original !== null)
            expect(() => classifyBytes(file, null)).toThrow();
        }
  });
});

describe("RSA DigestAlgorithm boundary", () => {
  let keys: any;
  beforeAll(() => {
    keys = forge.pki.rsa.generateKeyPair({ bits: 1024, e: 3 });
  });
  const digest = () =>
    forge.md.sha256.create().update("fictional fixture").digest().getBytes();
  const nullNode = (value = "") =>
    forge.asn1.create(0, forge.asn1.Type.NULL, false, value);
  const octet = (value = "extra") =>
    forge.asn1.create(0, forge.asn1.Type.OCTETSTRING, false, value);
  function encoded(parameters: any[], oid = forge.oids.sha256) {
    return forge.asn1
      .toDer(
        forge.asn1.create(0, forge.asn1.Type.SEQUENCE, true, [
          forge.asn1.create(0, forge.asn1.Type.SEQUENCE, true, [
            forge.asn1.create(
              0,
              forge.asn1.Type.OID,
              false,
              forge.asn1.oidToDer(oid).getBytes(),
            ),
            ...parameters,
          ]),
          octet(digest()),
        ]),
      )
      .getBytes();
  }
  it.each([
    "extra-after-null",
    "extra-without-null",
    "duplicate-null",
    "nonempty-null",
  ])("rejects %s without relying on padding rejection", (variant) => {
    const parameters =
      variant === "extra-after-null"
        ? [nullNode(), octet()]
        : variant === "extra-without-null"
          ? [octet()]
          : variant === "duplicate-null"
            ? [nullNode(), nullNode()]
            : [nullNode("x")];
    const signature = keys.privateKey.sign(encoded(parameters), "NONE");
    expect(() => keys.publicKey.verify(digest(), signature)).toThrow(
      /DigestInfo/,
    );
    expect(() =>
      keys.publicKey.verify(digest(), signature, undefined, {
        _parseAllDigestBytes: false,
      }),
    ).toThrow(/DigestInfo/);
  });
  it.each([true, false])("preserves SHA256 optional NULL=%s", (withNull) => {
    const signature = keys.privateKey.sign(
      encoded(withNull ? [nullNode()] : []),
      "NONE",
    );
    expect(keys.publicKey.verify(digest(), signature)).toBe(true);
  });
  it.each(["md5", "sha1", "sha256", "sha384", "sha512"])(
    "preserves normal %s signatures",
    (algorithm) => {
      const md = forge.md[algorithm].create().update("ordinary signature");
      expect(
        keys.publicKey.verify(md.digest().getBytes(), keys.privateKey.sign(md)),
      ).toBe(true);
    },
  );
  it("preserves MD5's required NULL rule and unknown-algorithm rejection", () => {
    expect(() =>
      keys.publicKey.verify(
        digest(),
        keys.privateKey.sign(encoded([], forge.oids.md5), "NONE"),
      ),
    ).toThrow(/Missing algorithm identifier NULL/);
    expect(() =>
      keys.publicKey.verify(
        digest(),
        keys.privateKey.sign(encoded([nullNode()], "1.2.3.4"), "NONE"),
      ),
    ).toThrow(/Unknown/);
  });
  it.each(["NONE", "NULL", null])("preserves raw mode %s", (scheme) => {
    const bytes = "ordinary raw value";
    expect(
      keys.publicKey.verify(bytes, keys.privateKey.sign(bytes, scheme), scheme),
    ).toBe(true);
  });
  it("preserves PSS, certificate, and CSR signing callers", () => {
    const md = forge.md.sha256.create().update("ordinary PSS");
    const pss = forge.pss.create({
      md: forge.md.sha256.create(),
      mgf: forge.mgf.mgf1.create(forge.md.sha256.create()),
      saltLength: 20,
    });
    expect(
      keys.publicKey.verify(
        md.digest().getBytes(),
        keys.privateKey.sign(md, pss),
        pss,
      ),
    ).toBe(true);
    const cert = forge.pki.createCertificate();
    cert.publicKey = keys.publicKey;
    cert.serialNumber = "01";
    cert.validity.notBefore = new Date("2026-01-01T00:00:00Z");
    cert.validity.notAfter = new Date("2027-01-01T00:00:00Z");
    const attributes = [{ name: "commonName", value: "fictional.example" }];
    cert.setSubject(attributes);
    cert.setIssuer(attributes);
    cert.sign(keys.privateKey, forge.md.sha256.create());
    expect(cert.verify(cert)).toBe(true);
    const csr = forge.pki.createCertificationRequest();
    csr.publicKey = keys.publicKey;
    csr.setSubject(attributes);
    csr.sign(keys.privateKey, forge.md.sha256.create());
    expect(csr.verify()).toBe(true);
  });
});

describe("braces parser and AST safety", () => {
  const methods = ["parse", "create", "compile", "expand", "stringify"];
  it.each(methods)(
    "bounds both brace and parenthesis strings in %s",
    (method) => {
      for (const [open, close] of [
        ["{", "}"],
        ["(", ")"],
        ["{", ""],
      ]) {
        const input = open.repeat(4000) + "a" + close.repeat(4000);
        expect(input.length).toBeLessThan(10000);
        expect(() => braces[method](input)).toThrow(/safety limit/);
      }
    },
  );
  function deepAst() {
    let node: any = { type: "text", value: "a" };
    for (let i = 0; i < 2000; i++) node = { type: "root", nodes: [node] };
    return node;
  }
  it.each(["compile", "expand", "stringify"])(
    "bounds direct and deep-import ASTs in %s",
    (method) => {
      const direct = require(`braces/lib/${method}`);
      expect(() => braces[method](deepAst())).toThrow(/safety limit/);
      expect(() => direct(deepAst())).toThrow(/safety limit/);
      const cyclic: any = { type: "root", nodes: [] };
      cyclic.nodes.push(cyclic);
      expect(() => direct(cyclic)).toThrow(/cycle/);
      const child: any = {
        type: "paren",
        nodes: [{ type: "text", value: "a" }],
      };
      child.parent = child;
      expect(() => direct({ type: "root", nodes: [child] })).toThrow(
        /parent cycle/,
      );
    },
  );
  it("rechecks mutated ASTs and bounds repeated DAG work", () => {
    const tree = braces.parse("{a,b}");
    expect(braces.compile(tree)).toBe("(a|b)");
    tree.nodes = [deepAst()];
    expect(() => braces.compile(tree)).toThrow(/safety limit/);
    let node: any = { type: "text", value: "x" };
    for (let i = 0; i < 20; i++) node = { type: "root", nodes: [node, node] };
    expect(() => braces.stringify(node)).toThrow(/visits/);
    const shared = { type: "text", value: "a" };
    expect(braces.stringify({ type: "root", nodes: [shared, shared] })).toBe(
      "aa",
    );
  });
  it.each(["compile", "expand", "stringify"])(
    "bounds array-valued AST text before recursive consumers in %s",
    (method) => {
      const { assertAst } = require("braces/lib/security-depth");
      const direct = require(`braces/lib/${method}`);
      const tree = (value: any) => ({
        type: "root",
        nodes: [{ type: "text", value }],
      });
      let deep: any = "x";
      for (let i = 0; i < 129; i++) deep = [deep];
      expect(() => assertAst(tree(deep))).toThrow(/safety limit/);
      expect(() => direct(tree(deep))).toThrow(/safety limit/);
      expect(() => braces[method](tree(deep))).toThrow(/safety limit/);
      const cyclic: any[] = [];
      cyclic.push(cyclic);
      expect(() => assertAst(tree(cyclic))).toThrow(/cycle/);
      expect(() => direct(tree(cyclic))).toThrow(/cycle/);
      let repeated: any = ["x"];
      for (let i = 0; i < 20; i++) repeated = [repeated, repeated];
      expect(() => assertAst(tree(repeated))).toThrow(/visits/);
      expect(() => direct(tree(repeated))).toThrow(/visits/);
      const shared = ["x"];
      expect(braces.expand(tree([shared, shared]))).toEqual(["x", "x"]);
      const external = (queue: any[]) => ({
        type: "root",
        nodes: [
          {
            type: "paren",
            parent: { type: "brace", queue },
            nodes: [{ type: "text", value: "y" }],
          },
        ],
      });
      expect(() => assertAst(external([deep]))).toThrow(/safety limit/);
      expect(() => direct(external([deep]))).toThrow(/safety limit/);
      expect(() => assertAst(external(cyclic))).toThrow(/cycle/);
      expect(() => direct(external(cyclic))).toThrow(/cycle/);
    },
  );
  it("preserves normal backreferences, nesting, literals, ranges and flags", () => {
    const pattern = "a/{b,c}/d";
    expect(braces.stringify(braces.parse(pattern))).toBe(pattern);
    expect(braces.compile(pattern)).toBe("a/(b|c)/d");
    expect(braces.expand("x/{a,b}/{1..2}")).toEqual([
      "x/a/1",
      "x/a/2",
      "x/b/1",
      "x/b/2",
    ]);
    expect(braces.expand("{a,a,,b}", { noempty: true, nodupes: true })).toEqual(
      ["a", "b"],
    );
    expect(braces.stringify(braces.parse("a/{b,c"))).toBe("a/{b,c");
    expect(braces.expand('"{a,b}"')).toEqual(["{a,b}"]);
    expect(() => braces.expand("{1..20}", { rangeLimit: 10 })).toThrow(
      /range limit/,
    );
    expect(braces.expand("{1..20}", { rangeLimit: false })).toHaveLength(20);
    expect(micromatch.braces("a/{b,c}/d")).toEqual(["a/(b|c)/d"]);
    expect(micromatch.some("src/main.ts", ["**/*.ts"])).toBe(true);
    expect(() =>
      micromatch.braceExpand("{".repeat(4000) + "a" + "}".repeat(4000)),
    ).toThrow(/safety limit/);
  });
});

describe("security-restricted cache reuse", () => {
  const request = {
    url: "https://example.invalid/fixture",
    method: "GET",
    headers: {},
  };
  const restrictions = [
    ["private", {}],
    ["no-store", {}],
    ["no-cache", {}],
    ["max-age=0", { "set-cookie": "fictional=test" }],
    ["proxy-revalidate, max-age=0", {}],
    ["max-age=0", { vary: "*" }],
    ["must-revalidate, max-age=0", {}],
    ["s-maxage=0, max-age=0", {}],
  ] as const;
  function policy(
    cacheControl: string,
    extra = {},
    serialized = false,
    options = {},
  ) {
    let p = new CachePolicy(
      request,
      { status: 200, headers: { "cache-control": cacheControl, ...extra } },
      options,
    );
    if (serialized)
      p = CachePolicy.fromObject(JSON.parse(JSON.stringify(p.toObject())));
    const t = p.toObject().t;
    p.now = () => t + 1000;
    return p;
  }
  it.each([false, true])(
    "blocks restricted reuse across all sinks, serialized=%s",
    (serialized) => {
      for (const [directive, headers] of restrictions) {
        const p = policy(
          `${directive}, stale-while-revalidate=60, stale-if-error=60`,
          headers,
          serialized,
        );
        for (const stale of ["max-stale", "max-stale=999999"]) {
          const incoming = { ...request, headers: { "cache-control": stale } };
          expect(p.satisfiesWithoutRevalidation(incoming), directive).toBe(
            false,
          );
          const evaluated = p.evaluateRequest(incoming);
          expect(evaluated.response, directive).toBeUndefined();
          expect(evaluated.revalidation.synchronous, directive).toBe(true);
        }
        expect(p.useStaleWhileRevalidate(), directive).toBe(false);
        expect(p.timeToLive(), directive).toBe(0);
        const error = p.revalidatedPolicy(request, {
          status: 500,
          headers: {},
        });
        expect(error.modified, directive).toBe(true);
        expect(error.policy, directive).not.toBe(p);
      }
    },
  );
  it.each(["fresh", "serialized", "legacy-serialized"])(
    "normalizes equivalent cache directive encodings in %s policies",
    (representation) => {
      for (const [directive, headers] of restrictions) {
        let p = policy(
          `${directive.toUpperCase()}, MAX-AGE=0, STALE-WHILE-REVALIDATE=60, STALE-IF-ERROR=60`,
          headers,
          representation === "serialized",
        );
        if (representation === "legacy-serialized") {
          const data = JSON.parse(JSON.stringify(p.toObject()));
          for (const field of ["rescc", "reqcc"])
            data[field] = Object.fromEntries(
              Object.entries(data[field]).map(([name, value]) => [
                name.toUpperCase(),
                value,
              ]),
            );
          p = CachePolicy.fromObject(data);
          p.now = () => data.t + 1000;
        }
        expect(
          p.satisfiesWithoutRevalidation({
            ...request,
            headers: { "cache-control": "MAX-STALE=999999" },
          }),
          directive,
        ).toBe(false);
        expect(p.useStaleWhileRevalidate(), directive).toBe(false);
        expect(p.timeToLive(), directive).toBe(0);
        expect(
          p.revalidatedPolicy(request, { status: 500, headers: {} }).modified,
          directive,
        ).toBe(true);
      }
    },
  );
  it("preserves mixed-case ordinary directives and legacy request restrictions", () => {
    const stale = policy(
      "PUBLIC, MAX-AGE=0, STALE-WHILE-REVALIDATE=60, STALE-IF-ERROR=60",
    );
    expect(
      stale.satisfiesWithoutRevalidation({
        ...request,
        headers: { "cache-control": "MAX-STALE=60" },
      }),
    ).toBe(true);
    expect(stale.useStaleWhileRevalidate()).toBe(true);
    const fresh = policy("PUBLIC, MAX-AGE=3600");
    expect(fresh.satisfiesWithoutRevalidation(request)).toBe(true);
    expect(
      fresh.satisfiesWithoutRevalidation({
        ...request,
        headers: { "cache-control": "NO-CACHE" },
      }),
    ).toBe(false);
    const data = JSON.parse(JSON.stringify(fresh.toObject()));
    data.reqcc = { "No-Store": true };
    expect(CachePolicy.fromObject(data).storable()).toBe(false);
  });
  it("preserves private-cache and explicit cookie opt-ins", () => {
    for (const [directive, options] of [
      ["private, max-age=3600", { shared: false }],
      ["public, max-age=3600", {}],
      ["immutable, max-age=3600", {}],
      ["proxy-revalidate, max-age=3600", { shared: false }],
    ] as const) {
      const p = policy(
        directive,
        { "set-cookie": "fictional=test" },
        false,
        options,
      );
      expect(p.storable()).toBe(true);
      expect(p.satisfiesWithoutRevalidation(request)).toBe(true);
      expect(p.timeToLive()).toBeGreaterThan(0);
    }
  });
  it("preserves expired public max-stale, SWR and same-resource error fallback", () => {
    const p = policy(
      "public, max-age=0, stale-while-revalidate=60, stale-if-error=60",
    );
    expect(
      p.satisfiesWithoutRevalidation({
        ...request,
        headers: { "cache-control": "max-stale=60" },
      }),
    ).toBe(true);
    expect(p.useStaleWhileRevalidate()).toBe(true);
    expect(
      p.revalidatedPolicy(request, { status: 500, headers: {} }).modified,
    ).toBe(false);
    expect(
      p.revalidatedPolicy(
        { ...request, url: "https://example.invalid/other" },
        { status: 500, headers: {} },
      ).modified,
    ).toBe(true);
  });
  it("preserves no-cache validators and successful origin 304", () => {
    const p = policy("no-cache", { etag: '"fictional-etag"' });
    expect(p.revalidationHeaders(request)["if-none-match"]).toBe(
      '"fictional-etag"',
    );
    const result = p.revalidatedPolicy(request, {
      status: 304,
      headers: { etag: '"fictional-etag"' },
    });
    expect(result.matches).toBe(true);
    expect(result.modified).toBe(false);
    expect(result.policy.satisfiesWithoutRevalidation(request)).toBe(false);
  });
});

describe("embedded source-map consumer replacement", () => {
  const basic = {
    version: 3,
    file: "fictional.js",
    sources: ["fictional.ts"],
    sourcesContent: ["export const count = 1;"],
    names: [],
    mappings: "AAAA",
  };
  const section = (line: number, map: any = basic) => ({
    version: 3,
    sections: [{ offset: { line, column: 0 }, map }],
  });
  it.each(["oversized", "nested-total", "negative", "noninteger"])(
    "rejects %s offsets in external and bundled paths",
    (variant) => {
      const map =
        variant === "oversized"
          ? section(10000001)
          : variant === "nested-total"
            ? section(6000000, section(6000000))
            : variant === "negative"
              ? section(-1)
              : section(0.5);
      expect(() => new SourceMapConsumer(map)).toThrow(/offset/i);
      expect(() =>
        generateCode(parseModule("export const count = 1;"), {
          inputSourceMap: map,
          sourceMapName: "out.js.map",
        }),
      ).toThrow(/offset/i);
    },
  );
  it("preserves ordinary mapped generation", () => {
    const generated = generateCode(
      parseModule("export const count = 1;", {
        sourceFileName: "fictional.js",
      }),
      {
        inputSourceMap: section(0),
        sourceMapName: "out.js.map",
      },
    );
    expect(generated.code).toContain("count = 1");
    expect(generated.map?.sources).toContain("fictional.ts");
  });
});
