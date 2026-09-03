const elements = {
  workspace: document.querySelector("#workspace"),
  viewport: document.querySelector("#previewViewport"),
  surface: document.querySelector("#previewSurface"),
  frame: document.querySelector("#appFrame"),
  screenSelect: document.querySelector("#screenSelect"),
  iphoneButton: document.querySelector("#iphoneButton"),
  ipadButton: document.querySelector("#ipadButton"),
  layerList: document.querySelector("#layerList"),
  selectedName: document.querySelector("#selectedName"),
  fields: document.querySelector("#propertyFields"),
  xInput: document.querySelector("#xInput"),
  yInput: document.querySelector("#yInput"),
  scaleRange: document.querySelector("#scaleRange"),
  scaleOutput: document.querySelector("#scaleOutput"),
  rotateInput: document.querySelector("#rotateInput"),
  widthInput: document.querySelector("#widthInput"),
  autoWidthButton: document.querySelector("#autoWidthButton"),
  snapInput: document.querySelector("#snapInput"),
  undoButton: document.querySelector("#undoButton"),
  redoButton: document.querySelector("#redoButton"),
  resetSelectedButton: document.querySelector("#resetSelectedButton"),
  resetScreenButton: document.querySelector("#resetScreenButton"),
  rebuildButton: document.querySelector("#rebuildButton"),
  saveStatus: document.querySelector("#saveStatus"),
};

const state = {
  screens: [],
  profiles: { iphone: {}, ipad: {} },
  device: "iphone",
  selected: null,
  visibleSlots: [],
  undo: [],
  redo: [],
  saving: false,
  saveQueued: false,
  savePromise: Promise.resolve(),
};

const deviceSizes = {
  iphone: { width: 430, height: 932 },
  ipad: { width: 1032, height: 1376 },
};

function cloneProfiles(value = state.profiles) {
  return structuredClone(value);
}

function currentScreen() {
  return state.screens.find(
    (screen) => screen.id === elements.screenSelect.value,
  );
}

function currentValue(slot = state.selected) {
  return (
    state.profiles[state.device][slot] ?? {
      x: 0,
      y: 0,
      scale: 1,
      rotate: 0,
    }
  );
}

function normalizedValue(value) {
  const clean = {
    x: Number(value.x) || 0,
    y: Number(value.y) || 0,
    scale: Math.max(0.5, Math.min(3, Number(value.scale) || 1)),
    rotate: Math.max(-180, Math.min(180, Number(value.rotate) || 0)),
  };
  const width = Number(value.width);
  if (Number.isFinite(width) && width >= 120) clean.width = width;
  return clean;
}

function saveHistory(snapshot) {
  state.undo.push(snapshot);
  if (state.undo.length > 80) state.undo.shift();
  state.redo = [];
  updateHistoryButtons();
}

function updateHistoryButtons() {
  elements.undoButton.disabled = state.undo.length === 0;
  elements.redoButton.disabled = state.redo.length === 0;
}

function snap(value) {
  return elements.snapInput.checked
    ? Math.round(value / 4) * 4
    : Math.round(value);
}

function studioElement(slot) {
  try {
    return elements.frame.contentDocument?.querySelector(
      `[data-testid="layout-slot:${CSS.escape(slot)}"]`,
    );
  } catch {
    return null;
  }
}

function applyValue(slot) {
  const target = studioElement(slot);
  if (!target) return;
  const value = normalizedValue(currentValue(slot));
  target.style.transformOrigin = "center center";
  target.style.transform = `translateX(${value.x}px) translateY(${value.y}px) rotate(${value.rotate}deg) scale(${value.scale})`;
  if (value.width) {
    target.style.width = `${value.width}px`;
    target.style.alignSelf = "center";
  } else {
    target.style.removeProperty("width");
    target.style.removeProperty("align-self");
  }
}

function applyAllValues() {
  for (const slot of state.visibleSlots) applyValue(slot);
}

function clearSelectionOutline() {
  for (const slot of state.visibleSlots) {
    const target = studioElement(slot);
    if (!target) continue;
    target.style.outline = "1px dashed transparent";
    target.style.outlineOffset = "3px";
    target.style.cursor = "grab";
  }
}

function selectSlot(slot) {
  state.selected = slot;
  clearSelectionOutline();
  const target = studioElement(slot);
  if (target) {
    target.style.outline = "3px solid #00d8ef";
    target.style.outlineOffset = "4px";
  }
  for (const button of elements.layerList.querySelectorAll("button"))
    button.classList.toggle("active", button.dataset.slot === slot);
  elements.selectedName.textContent = slot || "Select a layer";
  elements.fields.disabled = !slot;
  elements.resetSelectedButton.disabled = !slot;
  updatePropertyFields();
}

function updatePropertyFields() {
  if (!state.selected) return;
  const value = normalizedValue(currentValue());
  elements.xInput.value = String(value.x);
  elements.yInput.value = String(value.y);
  elements.scaleRange.value = String(value.scale);
  elements.scaleOutput.textContent = `${Math.round(value.scale * 100)}%`;
  elements.rotateInput.value = String(value.rotate);
  elements.widthInput.value = value.width ? String(value.width) : "";
}

function setValue(slot, value) {
  const clean = normalizedValue(value);
  const devices = slot.startsWith("splash.")
    ? ["iphone", "ipad"]
    : [state.device];
  for (const device of devices) {
    const profile = state.profiles[device];
    if (
      clean.x === 0 &&
      clean.y === 0 &&
      clean.scale === 1 &&
      clean.rotate === 0 &&
      !clean.width
    )
      delete profile[slot];
    else profile[slot] = { ...clean };
  }
  applyValue(slot);
  if (slot === state.selected) updatePropertyFields();
}

async function persist() {
  if (state.saving) {
    state.saveQueued = true;
    return state.savePromise;
  }

  state.saving = true;
  state.savePromise = (async () => {
    do {
      state.saveQueued = false;
      elements.saveStatus.textContent = "Saving & rebuilding…";
      try {
        const response = await fetch("/api/layout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(state.profiles),
        });
        if (!response.ok) throw new Error(await response.text());
        const result = await response.json();
        state.profiles = result.profiles;
        elements.saveStatus.textContent = "Built & saved";
      } catch (error) {
        elements.saveStatus.textContent = "Save or build failed";
        console.error(error);
        state.saveQueued = false;
      }
    } while (state.saveQueued);
    state.saving = false;
  })();

  return state.savePromise;
}

function commitSelected(patch) {
  if (!state.selected) return;
  saveHistory(cloneProfiles());
  setValue(state.selected, { ...currentValue(), ...patch });
  void persist();
}

function renderLayers() {
  elements.layerList.replaceChildren();
  for (const slot of state.visibleSlots) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "layer-button";
    button.dataset.slot = slot;
    button.textContent = slot
      .split(".")
      .slice(1)
      .join(" › ")
      .replaceAll("-", " ");
    button.addEventListener("click", () => selectSlot(slot));
    elements.layerList.append(button);
  }
}

function bindFrameHover(frameDocument) {
  const layerAt = (event) => {
    const view = frameDocument.defaultView;
    return view && event.target instanceof view.Element
      ? event.target.closest('[data-testid^="layout-slot:"]')
      : null;
  };
  frameDocument.addEventListener("pointerover", (event) => {
    const target = layerAt(event);
    if (!target) return;
    const slot = target
      .getAttribute("data-testid")
      .slice("layout-slot:".length);
    if (slot !== state.selected)
      target.style.outline = "1px dashed rgba(0, 216, 239, 0.8)";
  });
  frameDocument.addEventListener("pointerout", (event) => {
    const target = layerAt(event);
    if (!target) return;
    const slot = target
      .getAttribute("data-testid")
      .slice("layout-slot:".length);
    if (slot !== state.selected)
      target.style.outline = "1px dashed transparent";
  });
}
function bindFrameDrag(frameDocument) {
  frameDocument.addEventListener(
    "pointerdown",
    (event) => {
      const originTarget = event.target;
      const target =
        originTarget instanceof frameDocument.defaultView.Element
          ? originTarget.closest('[data-testid^="layout-slot:"]')
          : null;
      if (!target) return;
      const slot = target
        .getAttribute("data-testid")
        .slice("layout-slot:".length);
      event.preventDefault();
      event.stopPropagation();
      selectSlot(slot);
      const before = cloneProfiles();
      const value = normalizedValue(currentValue(slot));
      const origin = { x: event.clientX, y: event.clientY };
      target.style.cursor = "grabbing";
      const updateGuides = () => {
        const bounds = target.getBoundingClientRect();
        elements.surface.style.setProperty(
          "--guide-x",
          `${bounds.left + bounds.width / 2}px`,
        );
        elements.surface.style.setProperty(
          "--guide-y",
          `${bounds.top + bounds.height / 2}px`,
        );
      };
      elements.surface.classList.add("show-guides");
      updateGuides();
      const move = (moveEvent) => {
        moveEvent.preventDefault();
        setValue(slot, {
          ...value,
          x: snap(value.x + moveEvent.clientX - origin.x),
          y: snap(value.y + moveEvent.clientY - origin.y),
        });
        updateGuides();
      };
      const end = () => {
        frameDocument.removeEventListener("pointermove", move, true);
        frameDocument.removeEventListener("pointerup", end, true);
        frameDocument.removeEventListener("pointercancel", end, true);
        target.style.cursor = "grab";
        elements.surface.classList.remove("show-guides");
        saveHistory(before);
        void persist();
      };
      frameDocument.addEventListener("pointermove", move, true);
      frameDocument.addEventListener("pointerup", end, true);
      frameDocument.addEventListener("pointercancel", end, true);
    },
    true,
  );
}

function attachFrame() {
  const frameDocument = elements.frame.contentDocument;
  if (!frameDocument) return;
  const nodes = [
    ...frameDocument.querySelectorAll('[data-testid^="layout-slot:"]'),
  ];
  const slotFor = (node) =>
    node.getAttribute("data-testid").slice("layout-slot:".length);
  state.visibleSlots = [...new Set(nodes.map(slotFor))];
  bindFrameHover(frameDocument);
  bindFrameDrag(frameDocument);
  applyAllValues();
  renderLayers();
  clearSelectionOutline();
  selectSlot(state.visibleSlots[0] ?? null);
}

function fitPreview() {
  const size = deviceSizes[state.device];
  const bounds = elements.workspace.getBoundingClientRect();
  const scale = Math.min(
    (bounds.width - 70) / size.width,
    (bounds.height - 60) / size.height,
    1,
  );
  elements.viewport.style.width = `${size.width * scale}px`;
  elements.viewport.style.height = `${size.height * scale}px`;
  elements.surface.style.width = `${size.width}px`;
  elements.surface.style.height = `${size.height}px`;
  elements.surface.style.transform = `scale(${scale})`;
}

function loadScreen() {
  state.selected = null;
  state.visibleSlots = [];
  renderLayers();
  const screen = currentScreen();
  if (!screen) return;
  elements.frame.src = `${screen.route}${screen.route.includes("?") ? "&" : "?"}layoutStudio=1&device=${state.device}`;
}

function setDevice(device) {
  state.device = device;
  elements.iphoneButton.classList.toggle("active", device === "iphone");
  elements.ipadButton.classList.toggle("active", device === "ipad");
  const size = deviceSizes[device];
  elements.frame.width = size.width;
  elements.frame.height = size.height;
  fitPreview();
  loadScreen();
}

function restoreProfiles(next, pushRedo) {
  const current = cloneProfiles();
  if (pushRedo) state.redo.push(current);
  else state.undo.push(current);
  state.profiles = next;
  applyAllValues();
  updatePropertyFields();
  updateHistoryButtons();
  void persist();
}

elements.frame.addEventListener("load", () => setTimeout(attachFrame, 350));
elements.screenSelect.addEventListener("change", loadScreen);
elements.iphoneButton.addEventListener("click", () => setDevice("iphone"));
elements.ipadButton.addEventListener("click", () => setDevice("ipad"));
elements.xInput.addEventListener("change", () =>
  commitSelected({ x: snap(elements.xInput.valueAsNumber) }),
);
elements.yInput.addEventListener("change", () =>
  commitSelected({ y: snap(elements.yInput.valueAsNumber) }),
);
elements.rotateInput.addEventListener("change", () =>
  commitSelected({ rotate: elements.rotateInput.valueAsNumber || 0 }),
);
let scaleSnapshot;
elements.scaleRange.addEventListener("pointerdown", () => {
  scaleSnapshot = cloneProfiles();
});
elements.scaleRange.addEventListener("input", () => {
  if (!state.selected) return;
  setValue(state.selected, {
    ...currentValue(),
    scale: elements.scaleRange.valueAsNumber,
  });
});
elements.scaleRange.addEventListener("change", () => {
  if (!state.selected) return;
  saveHistory(scaleSnapshot ?? cloneProfiles());
  scaleSnapshot = undefined;
  setValue(state.selected, {
    ...currentValue(),
    scale: elements.scaleRange.valueAsNumber,
  });
  void persist();
});
elements.widthInput.addEventListener("change", () =>
  commitSelected({ width: elements.widthInput.valueAsNumber || undefined }),
);
elements.autoWidthButton.addEventListener("click", () =>
  commitSelected({ width: undefined }),
);
elements.resetSelectedButton.addEventListener("click", () => {
  if (!state.selected) return;
  saveHistory(cloneProfiles());
  if (state.selected.startsWith("splash.")) {
    delete state.profiles.iphone[state.selected];
    delete state.profiles.ipad[state.selected];
  } else delete state.profiles[state.device][state.selected];
  applyValue(state.selected);
  updatePropertyFields();
  void persist();
});
elements.resetScreenButton.addEventListener("click", () => {
  saveHistory(cloneProfiles());
  for (const slot of state.visibleSlots) {
    delete state.profiles[state.device][slot];
    if (slot.startsWith("splash.")) {
      delete state.profiles.iphone[slot];
      delete state.profiles.ipad[slot];
    }
  }
  applyAllValues();
  updatePropertyFields();
  void persist();
});
elements.undoButton.addEventListener("click", () => {
  const previous = state.undo.pop();
  if (previous) restoreProfiles(previous, true);
});
elements.redoButton.addEventListener("click", () => {
  const next = state.redo.pop();
  if (next) restoreProfiles(next, false);
});
elements.rebuildButton.addEventListener("click", async () => {
  await persist();
  elements.rebuildButton.disabled = true;
  elements.rebuildButton.textContent = "Rebuilding…";
  elements.saveStatus.textContent = "Building app";
  try {
    const response = await fetch("/api/rebuild", { method: "POST" });
    if (!response.ok) throw new Error(await response.text());
    elements.saveStatus.textContent = "Built & saved";
    loadScreen();
  } catch (error) {
    elements.saveStatus.textContent = "Build failed";
    console.error(error);
  } finally {
    elements.rebuildButton.disabled = false;
    elements.rebuildButton.textContent = "Save & rebuild app";
  }
});

window.addEventListener("resize", fitPreview);
window.addEventListener("keydown", (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z") {
    event.preventDefault();
    if (event.shiftKey) elements.redoButton.click();
    else elements.undoButton.click();
    return;
  }
  if (!state.selected || !event.key.startsWith("Arrow")) return;
  event.preventDefault();
  const amount = event.shiftKey ? 10 : 1;
  const value = currentValue();
  const patch = { x: value.x ?? 0, y: value.y ?? 0 };
  if (event.key === "ArrowLeft") patch.x -= amount;
  if (event.key === "ArrowRight") patch.x += amount;
  if (event.key === "ArrowUp") patch.y -= amount;
  if (event.key === "ArrowDown") patch.y += amount;
  commitSelected(patch);
});

const [metaResponse, layoutResponse] = await Promise.all([
  fetch("/api/meta"),
  fetch("/api/layout"),
]);
const meta = await metaResponse.json();
state.screens = meta.screens;
state.profiles = await layoutResponse.json();
for (const screen of state.screens) {
  const option = document.createElement("option");
  option.value = screen.id;
  option.textContent = screen.label;
  elements.screenSelect.append(option);
}
const requestedScreen = new URLSearchParams(window.location.search).get(
  "screen",
);
if (state.screens.some((screen) => screen.id === requestedScreen))
  elements.screenSelect.value = requestedScreen;
elements.saveStatus.textContent = "Saved";
updateHistoryButtons();
setDevice("iphone");
