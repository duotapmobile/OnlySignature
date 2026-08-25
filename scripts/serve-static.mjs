import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";

const root = path.resolve(process.argv[2] ?? ".");
const port = Number(process.argv[3] ?? 4174);
const types = new Map([
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".json", "application/json"],
  [".png", "image/png"],
  [".svg", "image/svg+xml"],
]);

createServer(async (request, response) => {
  try {
    const urlPath = decodeURIComponent(
      new URL(request.url ?? "/", "http://localhost").pathname,
    );
    let candidate = path.resolve(root, `.${urlPath}`);
    if (!candidate.startsWith(root + path.sep) && candidate !== root)
      throw new Error("outside-root");
    let info;
    try {
      info = await stat(candidate);
    } catch {
      try {
        candidate = `${candidate}.html`;
        info = await stat(candidate);
      } catch {
        candidate = path.join(candidate.replace(/\.html$/, ""), "index.html");
        info = await stat(candidate);
      }
    }
    if (info.isDirectory()) candidate = path.join(candidate, "index.html");
    response.setHeader(
      "Content-Type",
      types.get(path.extname(candidate)) ?? "application/octet-stream",
    );
    createReadStream(candidate).pipe(response);
  } catch {
    response.statusCode = 404;
    response.end("Not found");
  }
}).listen(port, "127.0.0.1", () =>
  process.stdout.write(`Serving ${root} on ${port}\n`),
);
