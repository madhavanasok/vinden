---
name: vinden-atom-count
description: The Vinden Count atom: a number in a pill showing how many items are in a Board column or behind an in-page tab. Figma variants and properties, tokens and code. Use when a Vinden screen shows a count next to a label.
---

# Count (atom)

A number in a pill: how many items are in a Board column, or behind an in-page tab ("Requests 2").

## In Figma

File Vinden-Design (`zFjDhV7CDaLDVZpqN3dBzU`).
- **Count**: page Pages & boards, node `109:132`.
  - Variants: Tone=On subtle (white pill, inside Board columns) | On surface (tinted pill, next to tabs).
  - Properties: Value (text).
  - Tokens: bg/surface or bg/subtle, text/primary, radius/full, space/4 and space/8 padding.
  - Text style: Label/Pill.

## Rules

- A number only, always next to the label it counts.
- Show 0 rather than hiding the count.

## In code

- `.board-count` (inside `<Board>`) and `.tab-count` (inside `<TabRow>` tabs) in styles.css.

Related skills: vinden-component-board, vinden-atom-category-tab.
