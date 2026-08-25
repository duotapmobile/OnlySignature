# Performance Baseline

**Measured:** 2026-08-25 on the Windows development host, Node 22.22.0. These measurements are local engineering baselines, not iPhone performance claims.

## Observed local results

The pure export rasterizer was exercised 25 times with a deliberately large 4,800-point, 20-stroke drawing at a maximum 1200 x 600 output. Median duration was 466.89 ms, p95 was 550.90 ms, and maximum was 556.49 ms. No fake progress indicator is used.

The Expo iOS JavaScript export completed and emitted 25 bundle/assets files. The Astro site generated 9 pages in approximately 3.23 seconds during the recorded run. Saved-set parsing, drawing-frame latency, memory, startup, dropped frames, rotation, and native View Shot export require Instruments/device evidence and remain release gates.

## Implementation controls

- Canvas pointer movement updates canvas-local stroke state; application state is committed at stroke end.
- Vector strokes preserve coordinates, orientation, timing, segmentation, and renderer version.
- Export work is user initiated and uses a bounded 1200 x 600 surface.
- Saved sets load from one protected local state file; signature data is not fetched over a network.

## Required device pass

Measure on the oldest supported iPhone, a current iPhone, and a supported iPad: input-to-render latency, dropped frames, startup, protected-state load, rotation during/after a stroke, 4,800-point export time, peak export memory, share-sheet return, and cleanup. Record actual Instruments traces before changing this document from a source baseline to release evidence.
