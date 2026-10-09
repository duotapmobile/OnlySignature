import { createReadStream } from "node:fs";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import prettier from "prettier";
import { renderSplash } from "./splash-layout.mjs";

const scriptPath = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(scriptPath), "..");
const mobileRoot = path.join(repoRoot, "apps", "mobile");
const distRoot = path.join(mobileRoot, "dist-layout-studio");
const studioRoot = path.join(repoRoot, "tools", "layout-studio");
const reviewAssetRoot = path.join(repoRoot, "artifacts", "actual-flow-preview");
const reviewManifestPath = path.join(reviewAssetRoot, "manifest.json");
const reviewFeedbackPath = path.join(reviewAssetRoot, "review-feedback.json");
const reviewMarkdownPath = path.join(reviewAssetRoot, "SCREEN-FEEDBACK.md");
const splashWordmarkPath = path.join(
  mobileRoot,
  "assets",
  "brand",
  "only-signature-wordmark.png",
);
const valuesJsonPath = path.join(
  mobileRoot,
  "src",
  "design",
  "layout-studio-values.json",
);
const valuesTsPath = path.join(
  mobileRoot,
  "src",
  "design",
  "layout-studio-values.ts",
);
const port = Number(process.env.ONLY_SIGNATURE_LAYOUT_STUDIO_PORT ?? 4176);
const reviewDevices = new Set(["iphone-small", "iphone", "ipad"]);
const reviewStatuses = new Set(["unreviewed", "needs-changes", "approved"]);

const slots = new Set([
  "splash.wordmark",
  "entry.hero",
  "entry.features",
  "entry.actions",
  "signature.header",
  "signature.canvas",
  "signature.redo",
  "signature.split-option",
  "signature.actions",
  "signature-first.header",
  "signature-first.canvas",
  "signature-first.redo",
  "signature-first.actions",
  "signature-last.header",
  "signature-last.canvas",
  "signature-last.redo",
  "signature-last.actions",
  "initials.header",
  "initials.canvas",
  "initials.redo",
  "initials.actions",
  "review.header",
  "review.signature",
  "review.initials",
  "review.actions",
  "background.header",
  "background.transparent",
  "background.white",
  "background.actions",
  "clear.header",
  "clear.comparison",
  "clear.actions",
  "warning.header",
  "warning.comparison",
  "warning.actions",
  "white-confirmation.message",
  "white-confirmation.actions",
  "saved.header",
  "saved.list",
  "saved.actions",
]);

const editableSlotPattern =
  /^(splash|entry|signature|signature-first|signature-last|initials|review|background|clear|warning|white-confirmation|saved)\.[a-z0-9.-]+$/;

const screens = [
  {
    id: "splash",
    label: "Splash",
    route: "/studio/splash-preview.html",
  },
  { id: "entry", label: "Entry", route: "/?fixture=landing" },
  {
    id: "signature",
    label: "Full Name Capture",
    route: "/draw?fixture=both",
  },
  {
    id: "signature-first",
    label: "Optional First Name Capture",
    route: "/draw?fixture=both&namePart=first",
  },
  {
    id: "signature-last",
    label: "Last Name Capture",
    route: "/draw?fixture=both&namePart=last",
  },
  {
    id: "initials",
    label: "Initials Capture",
    route: "/draw?fixture=initials",
  },
  { id: "review", label: "Review Popup", route: "/preview?fixture=both" },
  {
    id: "background",
    label: "Background Popup",
    route: "/purchase?fixture=both",
  },
  {
    id: "clear",
    label: "Clear Background",
    route: "/clear-background?fixture=both",
  },
  {
    id: "warning",
    label: "DIY Warning",
    route: "/free-export?fixture=both",
  },
  {
    id: "white-confirmation",
    label: "White Confirmation",
    route: "/success?fixture=both&mode=white",
  },
  {
    id: "saved",
    label: "Saved Sets",
    route: "/saved?fixture=saved-home",
  },
];

const contentTypes = new Map([
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".png", "image/png"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".svg", "image/svg+xml"],
  [".woff", "font/woff"],
  [".woff2", "font/woff2"],
  [".ttf", "font/ttf"],
]);

function boundedNumber(value, minimum, maximum, fallback) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.max(minimum, Math.min(maximum, number));
}

function validateProfiles(value) {
  const result = { iphone: {}, ipad: {} };
  for (const device of ["iphone", "ipad"]) {
    const profile = value?.[device];
    if (!profile || typeof profile !== "object" || Array.isArray(profile))
      continue;
    for (const [slot, raw] of Object.entries(profile)) {
      if (!editableSlotPattern.test(slot) || !raw || typeof raw !== "object")
        continue;
      const clean = {
        x: boundedNumber(raw.x, -700, 700, 0),
        y: boundedNumber(raw.y, -900, 900, 0),
        scale: boundedNumber(raw.scale, 0.5, 3, 1),
        rotate: boundedNumber(raw.rotate, -180, 180, 0),
      };
      const width = boundedNumber(raw.width, 120, 1032, 0);
      if (width > 0) clean.width = width;
      if (
        clean.x !== 0 ||
        clean.y !== 0 ||
        clean.scale !== 1 ||
        clean.rotate !== 0 ||
        clean.width
      )
        result[device][slot] = clean;
    }
  }
  const splash =
    result.iphone["splash.wordmark"] ?? result.ipad["splash.wordmark"];
  if (splash) {
    result.iphone["splash.wordmark"] = { ...splash };
    result.ipad["splash.wordmark"] = { ...splash };
  }
  return result;
}

function typescriptFor(profiles) {
  return `export type LayoutStudioValue = {
  x?: number;
  y?: number;
  scale?: number;
  rotate?: number;
  width?: number;
};

export type LayoutStudioProfiles = Record<
  "iphone" | "ipad",
  Record<string, LayoutStudioValue>
>;

export const layoutStudioValues: LayoutStudioProfiles = ${JSON.stringify(profiles, null, 2)};
`;
}

async function loadProfiles() {
  try {
    return validateProfiles(JSON.parse(await readFile(valuesJsonPath, "utf8")));
  } catch {
    return { iphone: {}, ipad: {} };
  }
}

async function saveProfiles(value) {
  const profiles = validateProfiles(value);
  await mkdir(path.dirname(valuesJsonPath), { recursive: true });
  await renderSplash(profiles);
  const typescript = await prettier.format(typescriptFor(profiles), {
    parser: "typescript",
  });
  await Promise.all([
    writeFile(valuesJsonPath, `${JSON.stringify(profiles, null, 2)}\n`, "utf8"),
    writeFile(valuesTsPath, typescript, "utf8"),
  ]);
  return profiles;
}

let buildPromise;
async function buildApp() {
  if (buildPromise) return buildPromise;
  const expoCli = path.join(repoRoot, "node_modules", "expo", "bin", "cli");
  buildPromise = new Promise((resolve, reject) => {
    const child = spawn(
      process.execPath,
      [
        expoCli,
        "export",
        "--platform",
        "web",
        // Expo Constants can retain another mode's embedded configuration.
        // Clear only the local bundler cache when generating this QA preview.
        "--clear",
        "--output-dir",
        "dist-layout-studio",
      ],
      {
        cwd: mobileRoot,
        env: {
          ...process.env,
          APP_VARIANT: "screenshot",
          EXPO_PUBLIC_SCREENSHOT_FIXTURE_MODE: "1",
          EXPO_PUBLIC_LAYOUT_STUDIO_MODE: "1",
        },
        stdio: "inherit",
      },
    );
    child.once("error", reject);
    child.once("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Expo export failed with exit code ${code}.`));
    });
  }).finally(() => {
    buildPromise = undefined;
  });
  return buildPromise;
}

async function readBody(request) {
  const chunks = [];
  let length = 0;
  for await (const chunk of request) {
    length += chunk.length;
    if (length > 1_000_000) throw new Error("request-too-large");
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString("utf8");
}

function json(response, statusCode, value) {
  response.statusCode = statusCode;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("Cache-Control", "no-store");
  response.end(JSON.stringify(value));
}

async function loadReviewManifest() {
  const manifest = JSON.parse(await readFile(reviewManifestPath, "utf8"));
  const outputs = manifest?.outputs ?? {};
  const devices = [...reviewDevices]
    .filter((device) => outputs[device])
    .map((device) => ({
      id: device,
      label:
        device === "iphone-small"
          ? "Small iPhone"
          : device === "iphone"
            ? "Large iPhone"
            : "iPad",
      width: Number(outputs[device].width),
      height: Number(outputs[device].height),
    }));
  const reviewScreens = Array.isArray(manifest?.screenshots)
    ? manifest.screenshots.map((screen, index) => ({
        id: String(screen.id),
        index: index + 1,
        title: String(screen.headline ?? screen.id),
        route: String(screen.route ?? ""),
        assertions: Array.isArray(screen.assertions)
          ? screen.assertions.map(String)
          : [],
        images: Object.fromEntries(
          devices.map((device) => [
            device.id,
            `/review-assets/${encodeURIComponent(device.id)}/${encodeURIComponent(screen.id)}.png`,
          ]),
        ),
      }))
    : [];
  return {
    capturedOn: String(manifest?.capturedOn ?? ""),
    classification: String(manifest?.classification ?? ""),
    devices,
    screens: reviewScreens,
  };
}

function cleanText(value, maximum = 10_000) {
  return typeof value === "string" ? value.slice(0, maximum) : "";
}

function cleanPoint(raw) {
  return {
    x: boundedNumber(raw?.x, 0, 1, 0),
    y: boundedNumber(raw?.y, 0, 1, 0),
  };
}

function validateReviewFeedback(value, manifest) {
  const validScreenIds = new Set(manifest.screens.map((screen) => screen.id));
  // Keep founder feedback on the retired confirmation route when saving a
  // refreshed fifteen-screen review. Its removal must not delete the note.
  validScreenIds.add("10-transparent-confirmation-popup");
  const result = {
    version: 1,
    updatedAt: new Date().toISOString(),
    submittedAt:
      typeof value?.submittedAt === "string" &&
      !Number.isNaN(Date.parse(value.submittedAt))
        ? new Date(value.submittedAt).toISOString()
        : null,
    screens: {},
  };
  const rawScreens = value?.screens;
  if (
    !rawScreens ||
    typeof rawScreens !== "object" ||
    Array.isArray(rawScreens)
  )
    return result;
  for (const [screenId, rawScreen] of Object.entries(rawScreens)) {
    if (
      !validScreenIds.has(screenId) ||
      !rawScreen ||
      typeof rawScreen !== "object"
    )
      continue;
    const cleanScreen = {
      status: reviewStatuses.has(rawScreen.status)
        ? rawScreen.status
        : "unreviewed",
      note: cleanText(rawScreen.note),
      devices: {},
    };
    for (const device of reviewDevices) {
      const rawAnnotations = rawScreen.devices?.[device]?.annotations;
      if (!Array.isArray(rawAnnotations)) continue;
      const annotations = [];
      for (const raw of rawAnnotations.slice(0, 250)) {
        if (!raw || typeof raw !== "object") continue;
        const type = ["pin", "box", "stroke"].includes(raw.type)
          ? raw.type
          : null;
        if (!type) continue;
        const annotation = {
          id: cleanText(raw.id, 120) || crypto.randomUUID(),
          type,
          text: cleanText(raw.text, 2_000),
          color: /^#[0-9a-f]{6}$/i.test(raw.color) ? raw.color : "#ff3b30",
        };
        if (type === "stroke") {
          annotation.points = Array.isArray(raw.points)
            ? raw.points.slice(0, 2_000).map(cleanPoint)
            : [];
          annotation.width = boundedNumber(raw.width, 1, 18, 4);
          if (annotation.points.length < 2) continue;
        } else {
          Object.assign(annotation, cleanPoint(raw));
          if (type === "box") {
            annotation.width = boundedNumber(raw.width, 0.002, 1, 0.1);
            annotation.height = boundedNumber(raw.height, 0.002, 1, 0.1);
          }
        }
        annotations.push(annotation);
      }
      cleanScreen.devices[device] = { annotations };
    }
    result.screens[screenId] = cleanScreen;
  }
  return result;
}

async function loadReviewFeedback(manifest) {
  try {
    return validateReviewFeedback(
      JSON.parse(await readFile(reviewFeedbackPath, "utf8")),
      manifest,
    );
  } catch {
    return validateReviewFeedback({}, manifest);
  }
}

function reviewMarkdown(feedback, manifest) {
  const statusLabel = {
    unreviewed: "Not reviewed",
    "needs-changes": "Needs changes",
    approved: "Approved",
  };
  const lines = [
    "# Only Signature Screen Feedback",
    "",
    `Updated: ${feedback.updatedAt}`,
    `Submitted: ${feedback.submittedAt ?? "Not submitted"}`,
    `Screenshot source: ${manifest.capturedOn || "current local capture"}`,
    "",
  ];
  const renderedScreens = [...manifest.screens];
  if (feedback.screens["10-transparent-confirmation-popup"])
    renderedScreens.push({
      id: "10-transparent-confirmation-popup",
      index: "Archived",
      title: "Transparent confirmation (removed from the current flow)",
    });
  for (const screen of renderedScreens) {
    const saved = feedback.screens[screen.id] ?? {
      status: "unreviewed",
      note: "",
      devices: {},
    };
    const annotations = [...reviewDevices].flatMap((device) =>
      (saved.devices?.[device]?.annotations ?? [])
        .filter((annotation) => annotation.text.trim())
        .map((annotation) => ({ device, annotation })),
    );
    lines.push(`## ${screen.index}. ${screen.title}`);
    lines.push("");
    lines.push(`Status: ${statusLabel[saved.status] ?? "Not reviewed"}`);
    lines.push("");
    if (saved.note.trim()) {
      lines.push(saved.note.trim());
      lines.push("");
    }
    if (annotations.length) {
      lines.push("### Markup notes");
      lines.push("");
      annotations.forEach(({ device, annotation }, index) => {
        const deviceLabel =
          manifest.devices.find((item) => item.id === device)?.label ?? device;
        lines.push(`${index + 1}. [${deviceLabel}] ${annotation.text.trim()}`);
      });
      lines.push("");
    }
  }
  return `${lines.join("\n").trim()}\n`;
}

async function saveReviewFeedback(value) {
  const manifest = await loadReviewManifest();
  const feedback = validateReviewFeedback(value, manifest);
  await mkdir(reviewAssetRoot, { recursive: true });
  await Promise.all([
    writeFile(
      reviewFeedbackPath,
      `${JSON.stringify(feedback, null, 2)}\n`,
      "utf8",
    ),
    writeFile(reviewMarkdownPath, reviewMarkdown(feedback, manifest), "utf8"),
  ]);
  return { feedback, manifest };
}

async function resolveStatic(root, urlPath) {
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
  return candidate;
}

if (!process.argv.includes("--no-build")) await buildApp();

createServer(async (request, response) => {
  try {
    const url = new URL(request.url ?? "/", "http://127.0.0.1");
    const urlPath = decodeURIComponent(url.pathname);
    if (urlPath === "/studio") {
      response.statusCode = 302;
      response.setHeader("Location", "/studio/");
      response.end();
      return;
    }
    if (urlPath === "/api/meta" && request.method === "GET") {
      json(response, 200, { screens, slots: [...slots] });
      return;
    }
    if (urlPath === "/api/layout" && request.method === "GET") {
      json(response, 200, await loadProfiles());
      return;
    }
    if (urlPath === "/api/layout" && request.method === "POST") {
      const profiles = await saveProfiles(JSON.parse(await readBody(request)));
      await buildApp();
      json(response, 200, { ok: true, built: true, profiles });
      return;
    }
    if (urlPath === "/api/review/meta" && request.method === "GET") {
      json(response, 200, await loadReviewManifest());
      return;
    }
    if (urlPath === "/api/review" && request.method === "GET") {
      const manifest = await loadReviewManifest();
      json(response, 200, await loadReviewFeedback(manifest));
      return;
    }
    if (urlPath === "/api/review" && request.method === "POST") {
      const result = await saveReviewFeedback(
        JSON.parse(await readBody(request)),
      );
      json(response, 200, {
        ok: true,
        feedback: result.feedback,
        markdownPath: "artifacts/actual-flow-preview/SCREEN-FEEDBACK.md",
      });
      return;
    }
    if (urlPath === "/api/review/export" && request.method === "GET") {
      const manifest = await loadReviewManifest();
      const feedback = await loadReviewFeedback(manifest);
      const format = url.searchParams.get("format") === "json" ? "json" : "md";
      if (format === "json") {
        response.setHeader("Content-Type", "application/json; charset=utf-8");
        response.setHeader(
          "Content-Disposition",
          'attachment; filename="only-signature-screen-feedback.json"',
        );
        response.end(`${JSON.stringify(feedback, null, 2)}\n`);
      } else {
        response.setHeader("Content-Type", "text/markdown; charset=utf-8");
        response.setHeader(
          "Content-Disposition",
          'attachment; filename="only-signature-screen-feedback.md"',
        );
        response.end(reviewMarkdown(feedback, manifest));
      }
      return;
    }
    if (urlPath === "/api/rebuild" && request.method === "POST") {
      await buildApp();
      json(response, 200, { ok: true });
      return;
    }
    if (urlPath === "/studio-assets/only-signature-wordmark.png") {
      response.setHeader("Content-Type", "image/png");
      response.setHeader("Cache-Control", "no-store");
      createReadStream(splashWordmarkPath).pipe(response);
      return;
    }
    if (urlPath.startsWith("/review-assets/")) {
      const reviewPath = urlPath.slice("/review-assets".length);
      const candidate = await resolveStatic(reviewAssetRoot, reviewPath);
      response.setHeader(
        "Content-Type",
        contentTypes.get(path.extname(candidate)) ?? "application/octet-stream",
      );
      response.setHeader("Cache-Control", "no-store");
      createReadStream(candidate).pipe(response);
      return;
    }
    const studioRequest = urlPath.startsWith("/studio/");
    const staticRoot = studioRequest ? studioRoot : distRoot;
    const staticPath = studioRequest
      ? urlPath.slice("/studio".length) || "/index.html"
      : urlPath;
    const candidate = await resolveStatic(staticRoot, staticPath);
    response.setHeader(
      "Content-Type",
      contentTypes.get(path.extname(candidate)) ?? "application/octet-stream",
    );
    if (studioRequest || path.extname(candidate) === ".html")
      response.setHeader("Cache-Control", "no-store");
    createReadStream(candidate).pipe(response);
  } catch (error) {
    if (String(error).includes("ENOENT")) {
      response.statusCode = 404;
      response.end("Not found");
      return;
    }
    json(response, 500, { ok: false, error: String(error) });
  }
}).listen(port, "127.0.0.1", () => {
  process.stdout.write(
    `Only Signature Layout Studio: http://127.0.0.1:${port}/studio/\n`,
  );
});
