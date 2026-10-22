---
name: vinden-atom-progress-bar
description: The Vinden Progress bar atom: usage rules, Figma variants and properties, tokens, the React component and accessibility. Use when a Vinden screen needs a progress bar in Figma or code, for example: Members who posted this week's task, step progress on phones, profile strength.
---

# Progress bar (atom)

A gold fill on a cream track showing how far along something is.

**Use it for:** Members who posted this week's task, step progress on phones, profile strength.

**Not for:** Scores (use Vouch score).

## In Figma

File Vinden-Design (`zFjDhV7CDaLDVZpqN3dBzU`).
- **Progress bar**: page Lists & data, node `46:113`.
  - Variants: Size=Medium|Small; Value=0|10|20|30|40|50|60|70|80|90|100.
  - Colour tokens: progress/fill, progress/track.

## Rules

- Gold means progress. Always pair the bar with text ("12 of 30 members posted"), because the bar alone fails contrast.
- In Figma, pick the Value variant nearest the real percentage (steps of 10). Figma can't resize layers inside an instance.
- Medium 8 px in cards; Small 6 px under the phone top bar.

## In code

Paths are under `apps/web/src`.

- `<ProgressBar value max label size="sm|md" />` from components/Rows.tsx. Profile strength on Home still uses the older blue `.progress`; move it to ProgressBar when Home is next touched.

## Accessibility

- `role="progressbar"` with `aria-valuenow`, `aria-valuemax` and `aria-label`.

Related skills: vinden-component-task-card, vinden-atom-step, vinden-visual-guidelines.
