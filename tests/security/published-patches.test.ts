import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { describe, expect, it } from "vitest";
import { parse, stringify, uneval } from "devalue";
import sharp from "sharp";

const require = createRequire(import.meta.url);
const quote = require("shell-quote").quote;
const CachePolicy = require("http-cache-semantics");
const lock = JSON.parse(readFileSync("package-lock.json", "utf8"));

describe("published dependency-security patches", () => {
  it("locks every affected occurrence to the reviewed compatible release", () => {
    const versions: Record<string, string[]> = {
      "brace-expansion": ["1.1.21", "5.0.12"],
      devalue: ["5.9.4"],
      "fast-uri": ["3.1.8"],
      "http-cache-semantics": ["4.3.0"],
      "shell-quote": ["1.12.0"],
      "smol-toml": ["1.9.0"],
      "source-map-js": ["1.2.2"],
      sharp: ["0.35.5"],
    };
    for (const [name, allowed] of Object.entries(versions)) {
      const copies = Object.entries(lock.packages).filter(([location]) =>
        location.endsWith(`node_modules/${name}`),
      );
      expect(copies.length, name).toBeGreaterThan(0);
      for (const [location, metadata] of copies) {
        expect(allowed, location).toContain(
          (metadata as { version: string }).version,
        );
      }
    }
    expect(lock.packages["apps/mobile"].dependencies.expo).toBe("~57.0.24");
    expect(lock.packages["apps/mobile"].dependencies["react-native"]).toBe(
      "0.86.3",
    );
  });

  it.each(["\n", "\r", "\u2028", "\u2029"])(
    "rejects a line terminator after a shell comment without executing a shell",
    (terminator) => {
      expect(() =>
        quote([
          "echo",
          "ok",
          { comment: "example" },
          `a${terminator}untrusted`,
        ]),
      ).toThrow(TypeError);
    },
  );

  it("keeps ordinary quoted shell arguments intact", () => {
    expect(quote(["echo", "hello world"])).toBe("echo 'hello world'");
    expect(quote(["echo", "ok", { comment: "example" }])).toBe(
      "echo ok #example",
    );
  });

  it("does not serialize unrelated bytes from a Node Buffer backing store", () => {
    const backing = new Uint8Array(32);
    backing.fill(77);
    backing.set([1, 2], 10);
    const view = Buffer.from(backing.buffer, 10, 2);
    const revived = parse(stringify(view));
    expect(Array.from(revived)).toEqual([1, 2]);
    expect(revived.buffer.byteLength).toBe(2);
    expect(uneval(view)).not.toContain("77,77");
    expect(parse(stringify({ value: "ordinary" }))).toEqual({
      value: "ordinary",
    });
  });

  it.each(["private", "no-store", "no-cache"])(
    "does not serve a %s cookie response through max-stale",
    (cacheControl) => {
      const request = {
        url: "https://example.invalid/private",
        method: "GET",
        headers: {},
      };
      const policy = new CachePolicy(request, {
        status: 200,
        headers: {
          "cache-control": cacheControl,
          "set-cookie": "fictional=test",
        },
      });
      if (cacheControl !== "no-cache") {
        expect(policy.storable()).toBe(false);
      }
      expect(
        policy.satisfiesWithoutRevalidation({
          ...request,
          headers: { "cache-control": "max-stale=999999" },
        }),
      ).toBe(false);
    },
  );

  it("retains ordinary public cache reuse", () => {
    const request = {
      url: "https://example.invalid/private",
      method: "GET",
      headers: {},
    };
    const publicPolicy = new CachePolicy(request, {
      status: 200,
      headers: { "cache-control": "public, max-age=3600" },
    });
    expect(publicPolicy.storable()).toBe(true);
    expect(publicPolicy.satisfiesWithoutRevalidation(request)).toBe(true);
  });

  it("retains the existing PNG image-processing path on the patched sharp release", async () => {
    const png = await sharp({
      create: {
        width: 8,
        height: 6,
        channels: 4,
        background: { r: 10, g: 20, b: 30, alpha: 1 },
      },
    })
      .png()
      .toBuffer();
    const metadata = await sharp(png).metadata();
    expect(metadata.width).toBe(8);
    expect(metadata.height).toBe(6);
    expect(metadata.format).toBe("png");
  });
});
