---
name: vinden-atom-stat
description: The Vinden Stat atom: usage rules, Figma variants and properties, tokens, the React component and accessibility. Use when a Vinden screen needs a stat in Figma or code, for example: Club header stats, profile stats, vouch weight.
---

# Stat (atom)

One number that matters, with a few words on what it counts.

**Use it for:** Club header stats, profile stats, vouch weight.

**Not for:** Long labels or numbers that need a chart.

## In Figma

File Vinden-Design (`zFjDhV7CDaLDVZpqN3dBzU`).
- **Stat**: page Lists & data, node `46:120`.
  - Variants: Size=Large|Small.
  - Properties: Value (text), Label (text).
  - Colour tokens: text/primary, text/secondary.
  - Text styles: Figure/Large, Body/Small, Heading/H3.

## Rules

- **Large** (Figure/Large 40) in headers; **Small** (H3 22) in rows of four.
- Numbers use the display face. Rupees use Indian grouping (₹1,40,000).
- Labels are lower case, two to five words.

## In code

Paths are under `apps/web/src`.

- `<Stat value label size="sm|lg" />` from components/Rows.tsx. On Club, four sit in `.club-stats`: a grid of four on desktop, 2 × 2 on phones.

## Accessibility

- Keep the number and label in reading order: value first, then label.

Related skills: vinden-atom-progress-bar, vinden-visual-guidelines.
