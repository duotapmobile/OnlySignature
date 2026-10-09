import assert from "node:assert/strict";
import test from "node:test";
import { webControlState } from "../src/domain/control-accessibility";

test("web controls expose all native accessibility state fields", () => {
  assert.deepEqual(
    webControlState({
      busy: true,
      checked: "mixed",
      disabled: true,
      expanded: true,
      selected: true,
    }),
    {
      "aria-busy": true,
      "aria-checked": "mixed",
      "aria-disabled": true,
      "aria-expanded": true,
      "aria-selected": true,
    },
  );
});

test("unchecked and collapsed web controls retain explicit false states", () => {
  assert.deepEqual(
    webControlState({
      busy: false,
      checked: false,
      disabled: false,
      expanded: false,
      selected: false,
    }),
    {
      "aria-busy": false,
      "aria-checked": false,
      "aria-disabled": false,
      "aria-expanded": false,
      "aria-selected": false,
    },
  );
});

test("explicit web accessibility props take precedence over native state defaults", () => {
  assert.deepEqual(
    webControlState(
      { checked: true, expanded: true },
      { "aria-checked": false, "aria-expanded": false },
    ),
    {
      "aria-busy": undefined,
      "aria-checked": false,
      "aria-disabled": undefined,
      "aria-expanded": false,
      "aria-selected": undefined,
    },
  );
});
