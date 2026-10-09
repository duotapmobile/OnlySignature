import { readFileSync } from "node:fs";

function replaceExactly(source, before, after, count = 1) {
  if (source.split(before).length - 1 !== count) {
    throw new Error("Unexpected upstream patch boundary");
  }
  return source.split(before).join(after);
}

export const backportRecipes = [
  {
    name: "node-forge",
    version: "1.4.0",
    advisory: "https://github.com/advisories/GHSA-86w9-cpqp-85rv",
    files: [
      {
        path: "lib/rsa.js",
        original:
          "fd4740238145ec26470eb3f06a627c72039538ce1307dbdce40521f94dfd0a50",
        patched:
          "96c154db17c611f81eeb48aed2c064c80d87517df2fff24cf574fbd1ac050492",
        transform: (source) =>
          replaceExactly(
            source,
            "            obj.value.length !== 2) {",
            "            obj.value.length !== 2 ||\n" +
              "            obj.value[0].value.length !== ('parameters' in capture ? 2 : 1) ||\n" +
              "            ('parameters' in capture && capture.parameters !== '')) {",
          ),
      },
    ],
  },
  {
    name: "braces",
    version: "3.0.3",
    advisory: "https://github.com/advisories/GHSA-vfj7-8cjw-p6xm",
    files: [
      {
        path: "lib/parse.js",
        original:
          "e572166565f15fa6ad9865ae49d678218e32aabfd1b3720f6d0d43d39800d310",
        patched:
          "ceb259408302f0574147cb952e11cb246f35a884db9ea1e1cb26fba063362564",
        transform: (source) =>
          replaceExactly(
            replaceExactly(
              source,
              "const stringify = require('./stringify');",
              "const stringify = require('./stringify');\nconst { MAX_DEPTH } = require('./security-depth');",
            ),
            "      stack.push(block);",
            "      if (stack.length >= MAX_DEPTH) {\n        throw new SyntaxError('Braces nesting exceeds safety limit');\n      }\n      stack.push(block);",
            2,
          ),
      },
      ...[
        [
          "compile",
          "dc98f22eee3d511785d92a00758d5f0d48efed5f5813bdecc2de430c529b5c9f",
          "const compile = (ast, options = {}) => {",
        ],
        [
          "expand",
          "41ccc196ebfa7b7781a634e721eb744e4e7bcb54cba427a7e3d6806a1b9e58f7",
          "const expand = (ast, options = {}) => {",
        ],
        [
          "stringify",
          "379f22d77bfa1478341ccd49c5e4267464aabcbba03558bab332aac23fc6f23a",
          "module.exports = (ast, options = {}) => {",
        ],
      ].map(([name, original, boundary]) => ({
        path: `lib/${name}.js`,
        original,
        patched: {
          compile:
            "c075b9af9087d9e6520cab29d9b9516989afe5555046909f5b4edf72e1bb3188",
          expand:
            "1670e73c93ee1c99484f3823f911bc90be7a7e6e6bb48024288ffa654878d314",
          stringify:
            "a252a18231134551ce2b4270f8e9a36a9dea6bdbda78d653d4299aff604de92e",
        }[name],
        transform: (source) =>
          replaceExactly(
            replaceExactly(
              source,
              "'use strict';",
              "'use strict';\n\nconst { assertAst } = require('./security-depth');",
            ),
            boundary,
            `${boundary}\n  assertAst(ast);`,
          ),
      })),
      {
        path: "lib/security-depth.js",
        original: null,
        patched:
          "e7537049464b08c08ded03f9cf147438777d97f19e9f5a5bf60db3ea1e9afa16",
        transform: () =>
          readFileSync(
            new URL("./braces-security-depth.cjs", import.meta.url),
            "utf8",
          ),
      },
    ],
  },
  {
    name: "http-cache-semantics",
    version: "4.3.0",
    files: [
      {
        path: "index.js",
        original:
          "ede1cc404a492fa348eb9d97a3007a0d72aa717bd22cd86a56bd0824c19729ca",
        patched:
          "0ab0c5bd95d3f6b240ab1bac435923628ffa26197f3392987bd05c3807a033b9",
        transform: (source) => {
          source = replaceExactly(
            source,
            "cc[k.trim()] =",
            "cc[k.trim().toLowerCase()] =",
          );
          source = replaceExactly(
            source,
            "function formatCacheControl(cc) {",
            "function normalizeCacheControl(cc) {\n    return Object.fromEntries(Object.entries(cc).map(([name, value]) => [name.toLowerCase(), value]));\n}\n\nfunction formatCacheControl(cc) {",
          );
          for (const field of ["rescc", "reqcc"]) {
            source = replaceExactly(
              source,
              `this._${field} = obj.${field};`,
              `this._${field} = normalizeCacheControl(obj.${field});`,
            );
          }
          source = replaceExactly(
            source,
            "    evaluateRequest(req) {\n        this._assertRequestHasHeaders(req);",
            "    evaluateRequest(req) {\n        this._assertRequestHasHeaders(req);\n        if (this._reuseRequiresRevalidation()) {\n            return this._evaluateRequestMissResult(req);\n        }",
          );
          source = replaceExactly(
            source,
            "const allowsStaleWithoutRevalidation = 'max-stale' in requestCC &&",
            "const allowsStaleWithoutRevalidation = !this._staleReuseRequiresRevalidation() && 'max-stale' in requestCC &&",
          );
          source = replaceExactly(
            source,
            "    maxAge() {",
            `    // Explicit security restrictions, distinct from ordinary expiration.
    _reuseRequiresRevalidation() {
        return !this.storable() || !!this._rescc['no-cache'] ||
            this._resHeaders.vary === '*' ||
            (this._isShared && (!!this._rescc['proxy-revalidate'] ||
                (this._resHeaders['set-cookie'] && !this._rescc.public && !this._rescc.immutable)));
    }

    _staleReuseRequiresRevalidation() {
        return this._reuseRequiresRevalidation() || !!this._rescc['must-revalidate'] ||
            (this._isShared && 's-maxage' in this._rescc);
    }

    maxAge() {`,
          );
          source = replaceExactly(
            source,
            "    timeToLive() {\n        const age = this.maxAge() - this.age();",
            "    timeToLive() {\n        if (this._reuseRequiresRevalidation()) return 0;\n        const age = this.maxAge() - this.age();\n        if (this._staleReuseRequiresRevalidation()) return Math.round(Math.max(0, age) * 1000);",
          );
          source = replaceExactly(
            source,
            "    _useStaleIfError() {",
            "    _useStaleIfError() {\n        if (this._staleReuseRequiresRevalidation()) return false;",
          );
          source = replaceExactly(
            source,
            "    useStaleWhileRevalidate() {",
            "    useStaleWhileRevalidate() {\n        if (this._staleReuseRequiresRevalidation()) return false;",
          );
          return replaceExactly(
            source,
            "if (this._useStaleIfError() && isErrorResponse(response)) {",
            "if (this._requestMatches(request, true) && this._useStaleIfError() && isErrorResponse(response)) {",
          );
        },
      },
    ],
  },
  {
    name: "magicast",
    version: "0.5.4",
    files: [
      {
        path: "dist/builders-pgs2P7Vh.js",
        original:
          "902c0f65dc812bb5377af6b61efc981de5abe21c625b908022ff8b6362b52605",
        patched:
          "368e549daa6e72850afa05ddca5fff0a5f18b2529a7728320cfc8abd91bbf2e1",
        transform: (source) => {
          const start = source.indexOf("var require_source_map_consumer =");
          const end = source.indexOf("\n}));\n//#endregion", start);
          if (
            start < 0 ||
            end < 0 ||
            source.indexOf("var require_source_map_consumer =", start + 1) >= 0
          ) {
            throw new Error("Unexpected bundled source-map boundary");
          }
          return (
            'import onlySignatureSourceMapConsumer from "source-map-js/lib/source-map-consumer.js";\n' +
            source.slice(0, start) +
            "var require_source_map_consumer = () => onlySignatureSourceMapConsumer;" +
            source.slice(end + "\n}));".length)
          );
        },
      },
    ],
  },
  {
    name: "source-map-js",
    version: "1.2.2",
    files: [
      {
        path: "lib/source-map-consumer.js",
        original:
          "9ad10db386da13c1f95e6a680d6298dbb306c77f57a9a3539e4595b723a7654b",
        patched:
          "9ad10db386da13c1f95e6a680d6298dbb306c77f57a9a3539e4595b723a7654b",
        transform: (source) => source,
      },
    ],
  },
];
