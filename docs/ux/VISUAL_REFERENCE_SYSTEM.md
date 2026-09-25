# Only Signature Visual Reference System

Status: active implementation reference

## Source map

The founder-selected finance-app showcase screenshot supplied on September 24,
2026 controls composition density, surface hierarchy, depth, and component scale.
It does not control product copy, navigation, finance content, browser chrome,
photography, or palette.

| Attribute        | Transfer                                                                                      | Exclude                                                 |
| ---------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| Composition      | Dense vertically connected modules, overlapping blue and paper layers, varied component scale | Literal three-phone layout and finance content          |
| Primary surface  | Dimensional deep-blue field with restrained blue and gold light                               | Purple, photographic hero art, and generic flat fills   |
| Utility surfaces | Compact warm-paper modules nested into the primary field                                      | One raised card around every line of text               |
| Elevation        | Soft tinted ambient shadow, tighter contact shadow, light upper rim                           | Heavy black shadow bands and equal elevation everywhere |
| Geometry         | Deep continuous outer curves, 24-28 point cards, parallel nested radii, pill actions          | Large empty rectangles copied from unrelated content    |
| Typography       | Strong hierarchy, compact operational labels, readable supporting copy                        | Reference wording and unavailable fonts                 |
| Actions          | Primary action integrated into the active content deck; secondary actions remain quiet        | Flow or label changes                                   |

## Locked product constraints

- Preserve the navy, warm-paper, gold, and white brand relationship.
- Preserve all approved copy, routes, storage behavior, StoreKit behavior, export
  formats, privacy guarantees, and the full-name or split-name capture choice.
- Keep the signature baseline visible in capture and previews.
- Keep 44-point touch targets, safe-area behavior, Dynamic Type support, VoiceOver
  semantics, reduced motion, and landscape full-screen signing.

## Construction tokens

- Outer shell radius: 42.
- Major paper or navy panel radius: 28.
- Content card radius: 24.
- Compact control radius: 20; pill controls use a continuous maximum radius.
- Shell elevation: broad blue-black ambient shadow plus a tighter contact shadow.
- Panel elevation: tinted navy shadow, short contact shadow, and a subtle light rim.
- Card elevation: quiet navy ambient shadow and a restrained inner top highlight.
- Lighting direction: upper edge light with lower/right contact shading.

The canonical runtime values live in `apps/mobile/src/components/flow-ui.tsx`
as `flowRadii` and `flowShadows`.

## Density rules

- Fixed customer-flow screens must use the safe-area viewport without unexplained
  empty center regions.
- Work surfaces, comparisons, and previews flex to consume available height before
  typography is reduced.
- Actions sit in an integrated action dock or immediately follow the active task.
- Maximum card heights are permitted only when content below requires the space.
- Sparse completion states use a dimensional focal panel rather than a message
  floating in an empty paper viewport.

## Verification rule

Every visual change must be captured from the coded implementation at 375x667,
430x932, a supported iPad size, and phone landscape where applicable. Browser
preview evidence is preliminary; native simulator and device evidence remain
separate release gates. No TestFlight build is authorized by this document.
