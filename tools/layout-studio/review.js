const $ = (selector) => document.querySelector(selector);

const elements = {
  screenList: $("#screenList"),
  captureDate: $("#captureDate"),
  progressLabel: $("#progressLabel"),
  progressBar: $("#progressBar"),
  screenTitle: $("#screenTitle"),
  screenPosition: $("#screenPosition"),
  previousButton: $("#previousButton"),
  nextButton: $("#nextButton"),
  deviceSwitch: $("#deviceSwitch"),
  zoomOutButton: $("#zoomOutButton"),
  zoomInButton: $("#zoomInButton"),
  zoomLabel: $("#zoomLabel"),
  fitButton: $("#fitButton"),
  refreshCapturesButton: $("#refreshCapturesButton"),
  markupVisibilityButton: $("#markupVisibilityButton"),
  markupNotice: $("#markupNotice"),
  toolSwitch: $("#toolSwitch"),
  colorInput: $("#colorInput"),
  clearMarkupButton: $("#clearMarkupButton"),
  imageViewport: $("#imageViewport"),
  imageStage: $("#imageStage"),
  screenImage: $("#screenImage"),
  markupLayer: $("#markupLayer"),
  emptyState: $("#emptyState"),
  saveState: $("#saveState"),
  statusSelect: $("#statusSelect"),
  screenNote: $("#screenNote"),
  annotationCount: $("#annotationCount"),
  annotationList: $("#annotationList"),
  addPinButton: $("#addPinButton"),
  saveButton: $("#saveButton"),
  saveNextButton: $("#saveNextButton"),
  copyButton: $("#copyButton"),
  exportButton: $("#exportButton"),
  submitButton: $("#submitButton"),
  collapseRailButton: $("#collapseRailButton"),
  focusButton: $("#focusButton"),
  feedbackToggleButton: $("#feedbackToggleButton"),
  closeFeedbackButton: $("#closeFeedbackButton"),
  implementationStatus: $("#implementationStatus"),
  implementationChanges: $("#implementationChanges"),
  toast: $("#toast"),
};

const state = {
  manifest: { screens: [], devices: [] },
  feedback: { version: 1, screens: {} },
  implementation: { screens: {} },
  markupVisible: false,
  captureRevision: Date.now(),
  editRevision: 0,
  screenIndex: 0,
  device: "iphone-small",
  tool: "pan",
  zoom: 1,
  selectedAnnotation: null,
  dirty: false,
  saving: false,
  savePromise: null,
  saveTimer: null,
  toastTimer: null,
  spaceDown: false,
  drawing: null,
  panning: null,
};

const svgNamespace = "http://www.w3.org/2000/svg";

function currentScreen() {
  return state.manifest.screens[state.screenIndex];
}

function currentDevice() {
  return (
    state.manifest.devices.find((device) => device.id === state.device) ??
    state.manifest.devices[0]
  );
}

function ensureScreenFeedback(screenId = currentScreen()?.id) {
  if (!screenId) return null;
  state.feedback.screens[screenId] ??= {
    status: "unreviewed",
    note: "",
    devices: {},
  };
  const screen = state.feedback.screens[screenId];
  screen.status ??= "unreviewed";
  screen.note ??= "";
  screen.devices ??= {};
  for (const device of state.manifest.devices) {
    screen.devices[device.id] ??= { annotations: [] };
    screen.devices[device.id].annotations ??= [];
  }
  return screen;
}

function currentAnnotations() {
  const screen = ensureScreenFeedback();
  return screen?.devices?.[state.device]?.annotations ?? [];
}

function setSaveState(label, tone = "neutral") {
  elements.saveState.textContent = label;
  elements.saveState.dataset.tone = tone;
}

function showToast(message) {
  clearTimeout(state.toastTimer);
  elements.toast.textContent = message;
  elements.toast.classList.add("visible");
  state.toastTimer = setTimeout(
    () => elements.toast.classList.remove("visible"),
    2200,
  );
}

function markDirty() {
  state.editRevision++;
  delete state.feedback.submittedAt;
  elements.submitButton.textContent = "Submit all feedback";
  state.dirty = true;
  setSaveState("Unsaved changes", "pending");
  clearTimeout(state.saveTimer);
  state.saveTimer = setTimeout(() => void saveFeedback(), 650);
  renderProgress();
  renderScreenList();
}

async function saveFeedback({ notify = false } = {}) {
  clearTimeout(state.saveTimer);
  if (state.savePromise) await state.savePromise;
  if (!state.dirty && !notify) return true;
  state.saving = true;
  setSaveState("Saving", "pending");
  state.savePromise = (async () => {
    const savedRevision = state.editRevision;
    try {
      const response = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(state.feedback),
      });
      if (!response.ok) throw new Error(await response.text());
      const result = await response.json();
      // A slow save must never overwrite edits entered while it was in flight.
      if (savedRevision === state.editRevision) {
        // Keep the live annotation objects: their textareas retain references
        // across autosaves. Replacing them would silently discard later edits.
        if (result.feedback?.updatedAt)
          state.feedback.updatedAt = result.feedback.updatedAt;
        state.dirty = false;
        setSaveState("Saved", "saved");
        if (notify) showToast("Screen feedback saved");
        return true;
      }
      setSaveState("Unsaved changes", "pending");
      return false;
    } catch (error) {
      console.error(error);
      setSaveState("Save failed", "error");
      showToast("Feedback could not be saved");
      return false;
    } finally {
      state.saving = false;
      state.savePromise = null;
      if (state.dirty && savedRevision !== state.editRevision) {
        clearTimeout(state.saveTimer);
        state.saveTimer = setTimeout(() => void saveFeedback(), 100);
      }
    }
  })();
  return state.savePromise;
}

async function submitAllFeedback() {
  for (const screen of state.manifest.screens) {
    const feedback = state.feedback.screens[screen.id];
    if (!feedback || feedback.status !== "unreviewed") continue;
    if (feedback.note.trim() || annotationTotal(feedback) > 0)
      feedback.status = "needs-changes";
  }
  state.feedback.submittedAt = new Date().toISOString();
  state.editRevision++;
  state.dirty = true;
  renderProgress();
  renderScreenList();
  const saved = await saveFeedback();
  if (!saved) return;
  elements.submitButton.textContent = "Feedback submitted";
  showToast("All feedback submitted to the project");
}

function annotationTotal(screenFeedback) {
  return Object.values(screenFeedback?.devices ?? {}).reduce(
    (total, device) => total + (device.annotations?.length ?? 0),
    0,
  );
}

function renderProgress() {
  const total = state.manifest.screens.length;
  const reviewed = state.manifest.screens.filter(
    (screen) =>
      (state.feedback.screens[screen.id]?.status ?? "unreviewed") !==
      "unreviewed",
  ).length;
  elements.progressLabel.textContent = `${reviewed} of ${total} reviewed`;
  elements.progressBar.style.width = `${total ? (reviewed / total) * 100 : 0}%`;
}

function renderScreenList() {
  elements.screenList.replaceChildren();
  state.manifest.screens.forEach((screen, index) => {
    const saved = state.feedback.screens[screen.id];
    const button = document.createElement("button");
    button.type = "button";
    button.className = "screen-card";
    button.classList.toggle("active", index === state.screenIndex);
    button.dataset.status = saved?.status ?? "unreviewed";
    button.title = screen.title;

    const number = document.createElement("span");
    number.className = "screen-number";
    number.textContent = String(index + 1).padStart(2, "0");

    const copy = document.createElement("span");
    copy.className = "screen-card-copy";
    const title = document.createElement("strong");
    title.textContent = screen.title;
    const detail = document.createElement("span");
    const count = annotationTotal(saved);
    detail.textContent = count
      ? `${count} markup ${count === 1 ? "note" : "notes"}`
      : "No markup";
    copy.append(title, detail);

    const dot = document.createElement("span");
    dot.className = "status-dot";
    dot.setAttribute("aria-hidden", "true");
    button.append(number, copy, dot);
    button.addEventListener("click", () => selectScreen(index));
    elements.screenList.append(button);
  });
  elements.screenList
    .querySelector(".active")
    ?.scrollIntoView({ block: "nearest" });
}

function renderDeviceSwitch() {
  elements.deviceSwitch.replaceChildren();
  for (const device of state.manifest.devices) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = device.label;
    button.classList.toggle("active", device.id === state.device);
    button.addEventListener("click", () => selectDevice(device.id));
    elements.deviceSwitch.append(button);
  }
}

function setTool(tool) {
  if (tool !== "pan") setMarkupVisible(true);
  state.tool = tool;
  for (const button of elements.toolSwitch.querySelectorAll("button"))
    button.classList.toggle("active", button.dataset.tool === tool);
  elements.imageViewport.className = `image-viewport tool-${tool}`;
}

function setMarkupVisible(visible) {
  state.markupVisible = visible;
  elements.markupLayer.toggleAttribute("hidden", !visible);
  elements.markupNotice.hidden = !visible;
  elements.markupVisibilityButton.setAttribute("aria-pressed", String(visible));
  elements.markupVisibilityButton.textContent = visible
    ? "Hide saved markup"
    : "Show saved markup";
  if (!visible && state.tool !== "pan") setTool("pan");
}

function renderImplementation() {
  const check = state.implementation.screens[currentScreen()?.id];
  elements.implementationStatus.textContent =
    check?.status ?? "No implementation record for this screen yet.";
  elements.implementationChanges.replaceChildren();
  for (const change of check?.changes ?? []) {
    const item = document.createElement("li");
    item.textContent = change;
    elements.implementationChanges.append(item);
  }
}

async function refreshCaptures() {
  const previousId = currentScreen()?.id;
  elements.refreshCapturesButton.disabled = true;
  try {
    const [response, implementationResponse] = await Promise.all([
      fetch("/api/review/meta", { cache: "no-store" }),
      fetch("/studio/review-implementation.json", { cache: "no-store" }),
    ]);
    if (!response.ok) throw new Error("Captured screens are unavailable");
    state.manifest = await response.json();
    if (implementationResponse.ok)
      state.implementation = await implementationResponse.json();
    state.captureRevision = Date.now();
    state.screenIndex = Math.max(
      0,
      state.manifest.screens.findIndex((screen) => screen.id === previousId),
    );
    elements.captureDate.textContent = `Captured ${state.manifest.capturedOn || "current local capture"}`;
    // Refresh images and read-only implementation notes, never founder feedback.
    renderCurrentScreen({ fit: false });
    showToast("Latest captured screens loaded. Feedback preserved.");
  } catch (error) {
    console.error(error);
    showToast("Captured screens could not refresh");
  } finally {
    elements.refreshCapturesButton.disabled = false;
  }
}

function clampZoom(value) {
  return Math.max(0.2, Math.min(4, value));
}

function preferredMinimumZoom() {
  const isIpad = currentDevice()?.id === "ipad";
  if (document.body.classList.contains("focus-mode")) return isIpad ? 0.5 : 1.2;
  return isIpad ? 0.35 : 0.72;
}

function applyZoom(nextZoom, anchor) {
  const device = currentDevice();
  if (!device) return;
  const oldZoom = state.zoom;
  const bounds = elements.imageViewport.getBoundingClientRect();
  const anchorX = anchor?.x ?? bounds.width / 2;
  const anchorY = anchor?.y ?? bounds.height / 2;
  const logicalX = (elements.imageViewport.scrollLeft + anchorX - 32) / oldZoom;
  const logicalY = (elements.imageViewport.scrollTop + anchorY - 32) / oldZoom;
  state.zoom = clampZoom(nextZoom);
  elements.imageStage.style.width = `${device.width * state.zoom}px`;
  elements.imageStage.style.height = `${device.height * state.zoom}px`;
  elements.zoomLabel.textContent = `${Math.round(state.zoom * 100)}%`;
  requestAnimationFrame(() => {
    elements.imageViewport.scrollLeft = logicalX * state.zoom - anchorX + 32;
    elements.imageViewport.scrollTop = logicalY * state.zoom - anchorY + 32;
  });
}

function fitImage({ minimum = 0 } = {}) {
  const device = currentDevice();
  if (!device) return;
  const bounds = elements.imageViewport.getBoundingClientRect();
  const zoom = Math.min(
    (bounds.width - 72) / device.width,
    (bounds.height - 72) / device.height,
    1.35,
  );
  state.zoom = clampZoom(Math.max(zoom, minimum));
  elements.imageStage.style.width = `${device.width * state.zoom}px`;
  elements.imageStage.style.height = `${device.height * state.zoom}px`;
  elements.zoomLabel.textContent = `${Math.round(state.zoom * 100)}%`;
  elements.imageViewport.scrollTo({ left: 0, top: 0 });
}

function logicalPoint(event) {
  const bounds = elements.markupLayer.getBoundingClientRect();
  return {
    x: Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width)),
    y: Math.max(0, Math.min(1, (event.clientY - bounds.top) / bounds.height)),
  };
}

function svgElement(name, attributes = {}) {
  const element = document.createElementNS(svgNamespace, name);
  for (const [key, value] of Object.entries(attributes))
    element.setAttribute(key, String(value));
  return element;
}

function renderMarkup() {
  const device = currentDevice();
  elements.markupLayer.replaceChildren();
  if (!device) return;
  elements.markupLayer.setAttribute(
    "viewBox",
    `0 0 ${device.width} ${device.height}`,
  );
  const annotations = currentAnnotations();
  const pinRadius = Math.max(13, device.width * 0.033);

  annotations.forEach((annotation, index) => {
    let element;
    if (annotation.type === "pin") {
      element = svgElement("g", { class: "pin" });
      const circle = svgElement("circle", {
        cx: annotation.x * device.width,
        cy: annotation.y * device.height,
        r: pinRadius,
      });
      const label = svgElement("text", {
        x: annotation.x * device.width,
        y: annotation.y * device.height,
        "font-size": pinRadius * 0.9,
      });
      label.textContent = String(index + 1);
      element.append(circle, label);
    } else if (annotation.type === "box") {
      element = svgElement("rect", {
        class: "box",
        x: annotation.x * device.width,
        y: annotation.y * device.height,
        width: annotation.width * device.width,
        height: annotation.height * device.height,
        rx: Math.max(4, device.width * 0.012),
      });
    } else {
      const points = annotation.points
        .map((point) => `${point.x * device.width},${point.y * device.height}`)
        .join(" ");
      element = svgElement("polyline", {
        class: "stroke",
        points,
        "stroke-width": annotation.width ?? 4,
      });
    }
    element.dataset.annotationId = annotation.id;
    element.setAttribute("aria-label", `Saved review markup ${index + 1}`);
    element.style.setProperty("--annotation-color", annotation.color);
    element.classList.toggle(
      "selected",
      annotation.id === state.selectedAnnotation,
    );
    element.addEventListener("pointerdown", (event) => {
      if (state.tool === "erase") {
        event.stopPropagation();
        removeAnnotation(annotation.id);
        return;
      }
      state.selectedAnnotation = annotation.id;
      renderMarkup();
      renderAnnotations();
    });
    elements.markupLayer.append(element);
  });
}

function annotationLabel(annotation, index) {
  if (annotation.type === "pin") return String(index + 1);
  if (annotation.type === "box") return "□";
  return "✎";
}

function renderAnnotations() {
  const annotations = currentAnnotations();
  elements.annotationCount.textContent = `${annotations.length} ${annotations.length === 1 ? "note" : "notes"}`;
  elements.annotationList.replaceChildren();
  if (!annotations.length) {
    const empty = document.createElement("div");
    empty.className = "annotation-empty";
    empty.textContent =
      "Add a pin, box, or drawing on the screen. Each markup can have its own note.";
    elements.annotationList.append(empty);
    return;
  }
  annotations.forEach((annotation, index) => {
    const card = document.createElement("div");
    card.className = "annotation-card";
    card.classList.toggle(
      "selected",
      annotation.id === state.selectedAnnotation,
    );
    card.style.setProperty("--annotation-color", annotation.color);
    card.addEventListener("click", () => {
      setMarkupVisible(true);
      state.selectedAnnotation = annotation.id;
      renderMarkup();
      renderAnnotations();
    });

    const badge = document.createElement("span");
    badge.className = "annotation-badge";
    badge.textContent = annotationLabel(annotation, index);

    const note = document.createElement("textarea");
    note.rows = 2;
    note.placeholder = "What should change here?";
    note.value = annotation.text ?? "";
    note.addEventListener("click", (event) => event.stopPropagation());
    note.addEventListener("input", () => {
      annotation.text = note.value;
      markDirty();
    });

    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "annotation-delete";
    remove.setAttribute("aria-label", "Delete markup");
    remove.textContent = "×";
    remove.addEventListener("click", (event) => {
      event.stopPropagation();
      removeAnnotation(annotation.id);
    });
    card.append(badge, note, remove);
    elements.annotationList.append(card);
  });
}

function addAnnotation(annotation) {
  currentAnnotations().push({
    id: crypto.randomUUID(),
    text: "",
    color: elements.colorInput.value,
    ...annotation,
  });
  state.selectedAnnotation = currentAnnotations().at(-1).id;
  markDirty();
  renderMarkup();
  renderAnnotations();
  requestAnimationFrame(() => {
    const selected =
      elements.annotationList.querySelector(".selected textarea");
    selected?.focus();
  });
}

function removeAnnotation(id) {
  const annotations = currentAnnotations();
  const index = annotations.findIndex((annotation) => annotation.id === id);
  if (index < 0) return;
  annotations.splice(index, 1);
  if (state.selectedAnnotation === id) state.selectedAnnotation = null;
  markDirty();
  renderMarkup();
  renderAnnotations();
}

function renderFeedback() {
  const saved = ensureScreenFeedback();
  elements.statusSelect.value = saved?.status ?? "unreviewed";
  elements.screenNote.value = saved?.note ?? "";
  renderAnnotations();
}

function renderCurrentScreen({ fit = true } = {}) {
  const screen = currentScreen();
  const device = currentDevice();
  if (!screen || !device) return;
  ensureScreenFeedback(screen.id);
  state.selectedAnnotation = null;
  elements.screenTitle.textContent = screen.title;
  elements.screenPosition.textContent = `Screen ${state.screenIndex + 1} of ${state.manifest.screens.length} · ${device.width} × ${device.height}`;
  elements.previousButton.disabled = state.screenIndex === 0;
  elements.nextButton.disabled =
    state.screenIndex === state.manifest.screens.length - 1;
  elements.screenImage.alt = `${screen.title}, ${device.label} screenshot`;
  const imageUrl = new URL(screen.images[device.id], window.location.origin);
  imageUrl.searchParams.set("revision", String(state.captureRevision));
  elements.screenImage.src = imageUrl.href;
  elements.emptyState.hidden = true;
  elements.imageStage.hidden = false;
  elements.screenImage.onerror = () => {
    elements.imageStage.hidden = true;
    elements.emptyState.hidden = false;
  };
  elements.screenImage.onload = () => {
    elements.imageStage.hidden = false;
    elements.emptyState.hidden = true;
    if (fit) fitImage({ minimum: preferredMinimumZoom() });
    renderMarkup();
  };
  renderDeviceSwitch();
  renderScreenList();
  renderFeedback();
  renderProgress();
  renderImplementation();
  setMarkupVisible(state.markupVisible);
}

function selectScreen(index) {
  if (index < 0 || index >= state.manifest.screens.length) return;
  state.screenIndex = index;
  renderCurrentScreen();
}

function selectDevice(device) {
  if (!state.manifest.devices.some((item) => item.id === device)) return;
  state.device = device;
  renderCurrentScreen();
}

function moveScreen(amount) {
  selectScreen(state.screenIndex + amount);
}

function startPan(event) {
  state.panning = {
    pointerId: event.pointerId,
    x: event.clientX,
    y: event.clientY,
    left: elements.imageViewport.scrollLeft,
    top: elements.imageViewport.scrollTop,
  };
  elements.imageViewport.classList.add("dragging");
  elements.imageViewport.setPointerCapture?.(event.pointerId);
}

function finishPointer() {
  if (state.drawing?.type === "box") {
    const annotation = state.drawing.annotation;
    if (annotation.width < 0.008 || annotation.height < 0.008)
      removeAnnotation(annotation.id);
  }
  state.drawing = null;
  state.panning = null;
  elements.imageViewport.classList.remove("dragging");
}

elements.markupLayer.addEventListener("pointerdown", (event) => {
  const targetAnnotation = event.target.closest?.("[data-annotation-id]");
  if (targetAnnotation && state.tool !== "erase") return;
  if (state.tool === "pan" || state.spaceDown) return;
  event.preventDefault();
  event.stopPropagation();
  const point = logicalPoint(event);
  if (state.tool === "pin") {
    addAnnotation({ type: "pin", ...point });
    return;
  }
  if (state.tool === "erase") return;
  const annotation =
    state.tool === "box"
      ? {
          id: crypto.randomUUID(),
          type: "box",
          text: "",
          color: elements.colorInput.value,
          ...point,
          width: 0.002,
          height: 0.002,
        }
      : {
          id: crypto.randomUUID(),
          type: "stroke",
          text: "",
          color: elements.colorInput.value,
          width: 4,
          points: [point, point],
        };
  currentAnnotations().push(annotation);
  state.selectedAnnotation = annotation.id;
  state.drawing = { type: state.tool, origin: point, annotation };
  elements.markupLayer.setPointerCapture?.(event.pointerId);
  markDirty();
  renderMarkup();
  renderAnnotations();
});

elements.markupLayer.addEventListener("pointermove", (event) => {
  if (!state.drawing) return;
  event.preventDefault();
  const point = logicalPoint(event);
  const { annotation, origin, type } = state.drawing;
  if (type === "box") {
    annotation.x = Math.min(origin.x, point.x);
    annotation.y = Math.min(origin.y, point.y);
    annotation.width = Math.abs(point.x - origin.x);
    annotation.height = Math.abs(point.y - origin.y);
  } else {
    const previous = annotation.points.at(-1);
    const distance = Math.hypot(point.x - previous.x, point.y - previous.y);
    if (distance > 0.002) annotation.points.push(point);
  }
  renderMarkup();
});

elements.markupLayer.addEventListener("pointerup", finishPointer);
elements.markupLayer.addEventListener("pointercancel", finishPointer);

elements.imageViewport.addEventListener("pointerdown", (event) => {
  if (state.tool !== "pan" && !state.spaceDown) return;
  event.preventDefault();
  startPan(event);
});

elements.imageViewport.addEventListener("pointermove", (event) => {
  if (!state.panning || state.panning.pointerId !== event.pointerId) return;
  elements.imageViewport.scrollLeft =
    state.panning.left - (event.clientX - state.panning.x);
  elements.imageViewport.scrollTop =
    state.panning.top - (event.clientY - state.panning.y);
});

elements.imageViewport.addEventListener("pointerup", finishPointer);
elements.imageViewport.addEventListener("pointercancel", finishPointer);
elements.imageViewport.addEventListener(
  "wheel",
  (event) => {
    if (!event.ctrlKey && !event.metaKey) return;
    event.preventDefault();
    const bounds = elements.imageViewport.getBoundingClientRect();
    applyZoom(state.zoom * (event.deltaY < 0 ? 1.12 : 0.89), {
      x: event.clientX - bounds.left,
      y: event.clientY - bounds.top,
    });
  },
  { passive: false },
);

elements.statusSelect.addEventListener("change", () => {
  ensureScreenFeedback().status = elements.statusSelect.value;
  markDirty();
});

elements.screenNote.addEventListener("input", () => {
  ensureScreenFeedback().note = elements.screenNote.value;
  markDirty();
});

elements.previousButton.addEventListener("click", () => moveScreen(-1));
elements.nextButton.addEventListener("click", () => moveScreen(1));
elements.zoomOutButton.addEventListener("click", () =>
  applyZoom(state.zoom / 1.2),
);
elements.zoomInButton.addEventListener("click", () =>
  applyZoom(state.zoom * 1.2),
);
elements.zoomLabel.addEventListener("click", fitImage);
elements.fitButton.addEventListener("click", fitImage);
elements.refreshCapturesButton.addEventListener(
  "click",
  () => void refreshCaptures(),
);
elements.markupVisibilityButton.addEventListener("click", () =>
  setMarkupVisible(!state.markupVisible),
);
elements.addPinButton.addEventListener("click", () => {
  setTool("pin");
  showToast("Click the screen where you want the note");
});
elements.clearMarkupButton.addEventListener("click", () => {
  if (!currentAnnotations().length) return;
  currentAnnotations().splice(0);
  state.selectedAnnotation = null;
  markDirty();
  renderMarkup();
  renderAnnotations();
});
elements.toolSwitch.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-tool]");
  if (button) setTool(button.dataset.tool);
});
elements.saveButton.addEventListener(
  "click",
  () => void saveFeedback({ notify: true }),
);
elements.saveNextButton.addEventListener("click", async () => {
  if (await saveFeedback({ notify: true })) moveScreen(1);
});
elements.copyButton.addEventListener("click", async () => {
  if (!(await saveFeedback())) return;
  try {
    const response = await fetch("/api/review/export");
    if (!response.ok) throw new Error(await response.text());
    await navigator.clipboard.writeText(await response.text());
    showToast("All feedback copied");
  } catch (error) {
    console.error(error);
    showToast("Could not copy feedback");
  }
});
elements.exportButton.addEventListener("click", async () => {
  if (!(await saveFeedback())) return;
  window.location.assign("/api/review/export");
});
elements.submitButton.addEventListener("click", () => void submitAllFeedback());
elements.collapseRailButton.addEventListener("click", () =>
  document.body.classList.toggle("rail-collapsed"),
);
elements.focusButton.addEventListener("click", () => {
  const enabled = document.body.classList.toggle("focus-mode");
  elements.focusButton.textContent = enabled ? "Exit focus" : "Focus";
  setTimeout(() => fitImage({ minimum: preferredMinimumZoom() }), 200);
});
elements.feedbackToggleButton.addEventListener("click", () => {
  const enabled = document.body.classList.toggle("feedback-open");
  elements.feedbackToggleButton.classList.toggle("active", enabled);
  elements.feedbackToggleButton.textContent = enabled
    ? "Close feedback"
    : "Feedback";
});
elements.closeFeedbackButton.addEventListener("click", () => {
  document.body.classList.remove("feedback-open");
  elements.feedbackToggleButton.classList.remove("active");
  elements.feedbackToggleButton.textContent = "Feedback";
  setTimeout(() => fitImage({ minimum: preferredMinimumZoom() }), 200);
});

window.addEventListener("resize", () => {
  clearTimeout(window.reviewResizeTimer);
  window.reviewResizeTimer = setTimeout(fitImage, 120);
});

window.addEventListener("keydown", (event) => {
  const editing = ["INPUT", "TEXTAREA", "SELECT"].includes(
    document.activeElement?.tagName,
  );
  if (event.code === "Space" && !editing) {
    state.spaceDown = true;
    elements.imageViewport.classList.add("tool-pan");
  }
  if (editing) return;
  if (event.key === "ArrowLeft") moveScreen(-1);
  if (event.key === "ArrowRight") moveScreen(1);
  if (event.key === "+" || event.key === "=") applyZoom(state.zoom * 1.2);
  if (event.key === "-") applyZoom(state.zoom / 1.2);
  if (event.key.toLowerCase() === "f") fitImage();
  if (event.key.toLowerCase() === "p") setTool("pin");
  if (event.key.toLowerCase() === "b") setTool("box");
  if (event.key.toLowerCase() === "d") setTool("draw");
});

window.addEventListener("keyup", (event) => {
  if (event.code !== "Space") return;
  state.spaceDown = false;
  setTool(state.tool);
});

window.addEventListener("beforeunload", () => {
  if (state.dirty)
    navigator.sendBeacon?.("/api/review", JSON.stringify(state.feedback));
});

async function initialize() {
  try {
    const [manifestResponse, feedbackResponse, implementationResponse] =
      await Promise.all([
        fetch("/api/review/meta"),
        fetch("/api/review"),
        fetch("/studio/review-implementation.json", { cache: "no-store" }),
      ]);
    if (!manifestResponse.ok || !feedbackResponse.ok)
      throw new Error("Review data is unavailable");
    state.manifest = await manifestResponse.json();
    state.feedback = await feedbackResponse.json();
    if (implementationResponse.ok)
      state.implementation = await implementationResponse.json();
    if (state.feedback.submittedAt)
      elements.submitButton.textContent = "Feedback submitted";
    state.device = state.manifest.devices[0]?.id ?? "iphone-small";
    if (window.matchMedia("(max-width: 1000px)").matches) {
      document.body.classList.add("focus-mode");
      elements.focusButton.textContent = "Exit focus";
    }
    elements.captureDate.textContent = state.manifest.capturedOn
      ? `Captured ${state.manifest.capturedOn}`
      : "Current capture";
    setTool("pan");
    renderCurrentScreen();
    setSaveState("Saved", "saved");
  } catch (error) {
    console.error(error);
    elements.screenTitle.textContent = "Review workspace could not load";
    elements.screenPosition.textContent =
      "Regenerate the local flow screenshots and restart the studio.";
    setSaveState("Unavailable", "error");
  }
}

void initialize();
