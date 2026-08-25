# Accessibility Support

**Status:** Implementation requirements and draft App Store answers; no physical-device support claim yet.

## Supported design targets

| Feature                           | Required implementation                                                                                                                                | Publication status                                  |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------- |
| VoiceOver                         | Logical order, headings/roles/states, label-in-name, grouped preview descriptions, status announcements, canvas instructions/direct-interaction/escape | Not verified                                        |
| Voice Control                     | Every touch action has a visible operable name; no gesture-only flow                                                                                   | Not verified                                        |
| Larger Text                       | Semantic scaling to 200%/system maximum, multiline/reflow, vertical preview adaptation                                                                 | Not verified                                        |
| Sufficient Contrast               | Rendered text/control contrast; opaque/high-contrast glass fallbacks                                                                                   | Not verified                                        |
| Differentiate Without Color Alone | Text/shape/state for selection, status, white/transparent, destructive actions                                                                         | Not verified                                        |
| Reduced Motion                    | No continuous/parallax/depth motion required; fades/no motion; haptics supplementary                                                                   | Not verified                                        |
| Voice Control/keyboard on iPad    | Visible focus and keyboard operation for non-drawing tasks                                                                                             | Not verified                                        |
| Captions/audio descriptions       | No audiovisual content in core app                                                                                                                     | Not applicable unless App Preview/media is included |

## Canvas contract

- Visible instruction plus accessible label: `Signature drawing area` or `Initials drawing area`.
- Value: `empty` or `drawing saved, N strokes`; never announce point content.
- Explicit Start/Finish Drawing mode when required to prevent VoiceOver gesture conflict.
- Native direct interaction only through a tested maintained/owned boundary.
- Safe escape that cannot clear work; adjacent controls remain reachable.
- First-stroke and Clear announcements; selected slot and other-slot presence exposed.
- No claim that a screen reader can infer or validate the handwriting shape.

## Layout and interaction

- All targets at least 44×44 points; dominant actions generally at least 56 points.
- No icon-only primary action, swipe-only navigation, tiny dismiss target, or color-only status.
- Full Back row is tappable and destinations are deterministic.
- Side-by-side preview stacks vertically with identical geometry at accessibility sizes/compact widths.
- Text containers do not use fixed heights; controls wrap/stack rather than shrink.
- Focus moves to new heading after navigation and returns to the originating control after dismissal.
- Blocking errors remain visible, explain work safety and next action, and announce once.

## Required physical test matrix

Complete fresh, signature-only, initials-only, both, included-slot later, free export, purchase states, same-set re-export, duplicate draft, rename/delete, Delete All, support, and diagnostics on supported iPhone and iPad with VoiceOver, Voice Control, maximum text, Bold Text, Increase Contrast, Reduce Transparency, Button Shapes, Reduced Motion, portrait/landscape, and iPad keyboard/window changes.

Apple Accessibility Nutrition Labels must remain unselected until every common task passes for each claimed feature/device family. Automated accessibility props and simulator screenshots are supporting evidence only.
