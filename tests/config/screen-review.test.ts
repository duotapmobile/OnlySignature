import { readFileSync } from "node:fs";
import vm from "node:vm";
import { describe, expect, it } from "vitest";

class Element {
  textContent = "";
  value = "";
  hidden = false;
  disabled = false;
  dataset: Record<string, string> = {};
  attributes = new Map<string, string>();
  children: Element[] = [];
  events: Record<string, (...args: unknown[]) => unknown> = {};
  classes = new Set<string>();
  classList = {
    toggle: (name: string, enabled = !this.classes.has(name)) => {
      if (enabled) this.classes.add(name);
      else this.classes.delete(name);
      return enabled;
    },
    contains: (name: string) => this.classes.has(name),
    add: (name: string) => this.classes.add(name),
    remove: (name: string) => this.classes.delete(name),
  };
  style = { setProperty() {} };
  addEventListener(name: string, callback: Element["events"][string]) {
    this.events[name] = callback;
  }
  setAttribute(name: string, value: string) {
    this.attributes.set(name, value);
  }
  toggleAttribute(name: string, enabled: boolean) {
    if (enabled) this.attributes.set(name, "");
    else this.attributes.delete(name);
  }
  append(...children: Element[]) {
    this.children.push(...children);
  }
  replaceChildren() {
    this.children = [];
  }
  querySelectorAll() {
    return [];
  }
  querySelector() {
    return null;
  }
}

const source = readFileSync("tools/layout-studio/review.js", "utf8");
function harness() {
  const elements = new Map<string, Element>();
  const get = (id: string) => {
    if (!elements.has(id)) elements.set(id, new Element());
    return elements.get(id)!;
  };
  const document = {
    querySelector: get,
    createElement: () => new Element(),
    createElementNS: () => new Element(),
    body: new Element(),
  };
  const context = vm.createContext({
    document,
    window: {
      location: { origin: "http://127.0.0.1:4176", assign() {} },
      addEventListener() {},
    },
    navigator: {},
    URL,
    console: { error() {} },
    setTimeout: () => 1,
    clearTimeout() {},
    requestAnimationFrame() {},
    // Startup stays pending. Individual tests provide read-only or mock responses.
    fetch: () => new Promise(() => {}),
  });
  vm.runInContext(source, context);
  const run = (code: string) => vm.runInContext(code, context);
  run(`state.manifest = {
    devices: [{ id: "iphone-small", label: "Small iPhone", width: 375, height: 667 }],
    screens: [{ id: "01-splash", title: "Animated opening", images: { "iphone-small": "/review-assets/iphone-small/01-splash.png" } }]
  };
  state.feedback.screens["01-splash"] = { status: "needs-changes", note: "Keep my note", devices: { "iphone-small": { annotations: [{id: "pin-1", type: "pin", x: 0.6, y: 0.8, color: "#ff3b30", text: "Align this"}] } } };`);
  return { get, context, run };
}

describe("screen review preserves founder feedback", () => {
  it("defaults to clean images without deleting the saved pin", () => {
    const { get, run } = harness();
    run("renderMarkup(); setMarkupVisible(state.markupVisible)");
    expect(get("#markupLayer").attributes.has("hidden")).toBe(true);
    expect(get("#markupLayer").children).toHaveLength(1);
    expect(run("currentAnnotations().length")).toBe(1);
    expect(run("state.feedback.screens['01-splash'].status")).toBe(
      "needs-changes",
    );
  });

  it("shows and hides original markup with an explanatory notice", () => {
    const { get, run } = harness();
    run("setMarkupVisible(true)");
    expect(get("#markupLayer").attributes.has("hidden")).toBe(false);
    expect(get("#markupNotice").hidden).toBe(false);
    expect(get("#markupVisibilityButton").attributes.get("aria-pressed")).toBe(
      "true",
    );
    run("setTool('pin'); setMarkupVisible(false)");
    expect(run("state.tool")).toBe("pan");
    expect(run("currentAnnotations()[0].text")).toBe("Align this");
  });

  it("drawing a new annotation explicitly reveals the markup layer", () => {
    const { get, run } = harness();
    run("setTool('draw')");
    expect(get("#markupLayer").attributes.has("hidden")).toBe(false);
    expect(run("state.markupVisible")).toBe(true);
  });

  it("does not overwrite new edits with a slow save response", async () => {
    const { context, run } = harness();
    let resolveSave!: (value: unknown) => void;
    context.fetch = () =>
      new Promise((resolve) => {
        resolveSave = resolve;
      });
    const saving = run("state.dirty = true; saveFeedback()");
    run("state.feedback.screens['01-splash'].note = 'Newer edit'; markDirty()");
    resolveSave({
      ok: true,
      json: async () => ({ feedback: { version: 1, screens: {} } }),
    });
    expect(await saving).toBe(false);
    expect(run("state.feedback.screens['01-splash'].note")).toBe("Newer edit");
    expect(run("state.dirty")).toBe(true);
  });

  it("does not leave a screen when Save and next fails", async () => {
    const { get, context, run } = harness();
    context.fetch = async () => ({ ok: false, text: async () => "offline" });
    run("state.dirty = true");
    await get("#saveNextButton").events.click();
    expect(run("state.screenIndex")).toBe(0);
    expect(run("state.feedback.screens['01-splash'].note")).toBe(
      "Keep my note",
    );
    expect(get("#saveState").textContent).toBe("Save failed");
  });

  it("retains live annotation references after an autosave", async () => {
    const { context, run } = harness();
    context.fetch = async () => ({
      ok: true,
      json: async () => ({
        feedback: { version: 1, updatedAt: "server-time", screens: {} },
      }),
    });
    run("const liveAnnotation = currentAnnotations()[0]; state.dirty = true");
    expect(await run("saveFeedback()")).toBe(true);
    run("liveAnnotation.text = 'Edit after autosave'; markDirty()");
    expect(run("currentAnnotations()[0].text")).toBe("Edit after autosave");
    expect(run("state.feedback.updatedAt")).toBe("server-time");
  });

  it("does not export after a failed save", async () => {
    const { context, get, run } = harness();
    let navigated = false;
    context.window.location.assign = () => {
      navigated = true;
    };
    context.fetch = async () => ({ ok: false, text: async () => "offline" });
    run("state.dirty = true");
    await get("#exportButton").events.click();
    expect(navigated).toBe(false);
  });

  it("refreshes images and implementation notes without overwriting feedback", async () => {
    const { context, get, run } = harness();
    const manifest = run("state.manifest");
    context.fetch = async (url: string) => ({
      ok: true,
      json: async () =>
        url.includes("review-implementation")
          ? {
              screens: {
                "01-splash": {
                  status: "Browser inspected; founder review pending",
                  changes: [],
                },
              },
            }
          : manifest,
    });
    run("state.dirty = true");
    await run("refreshCaptures()");
    expect(run("state.dirty")).toBe(true);
    expect(run("state.feedback.screens['01-splash'].note")).toBe(
      "Keep my note",
    );
    expect((get("#screenImage") as Element & { src: string }).src).toMatch(
      /revision=\d+/,
    );
    expect(get("#implementationStatus").textContent).toBe(
      "Browser inspected; founder review pending",
    );
  });

  it("accounts for every saved screen and pin separately from approval", () => {
    const feedback = JSON.parse(
      readFileSync("tests/fixtures/screen-review-feedback.json", "utf8"),
    );
    const implementation = JSON.parse(
      readFileSync("tools/layout-studio/review-implementation.json", "utf8"),
    );
    const records = {
      ...implementation.screens,
      ...implementation.archivedScreens,
    };
    expect(Object.keys(implementation.screens)).toHaveLength(15);
    for (const [id, screen] of Object.entries(feedback.screens) as [
      string,
      { devices: Record<string, { annotations: unknown[] }> },
    ][]) {
      expect(records[id], id).toBeDefined();
      expect(records[id].markupCount, id).toBe(
        Object.values(screen.devices).reduce(
          (count, device) => count + device.annotations.length,
          0,
        ),
      );
      for (const file of records[id].sources)
        expect(readFileSync(file, "utf8").length).toBeGreaterThan(0);
    }
    expect(implementation.evidence).toContain(
      "Founder feedback and approval statuses are unchanged",
    );
  });
});
