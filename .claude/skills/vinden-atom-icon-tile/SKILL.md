---
name: vinden-atom-icon-tile
description: The Vinden Icon tile atom: usage rules, Figma variants and properties, tokens, the React component and accessibility. Use when a Vinden screen needs a icon tile in Figma or code, for example: Verification rows, info rows, option cards, file rows, journey entries.
---

# Icon tile (atom)

A rounded square holding an icon, the leading visual of a row.

**Use it for:** Verification rows, info rows, option cards, file rows, journey entries.

**Not for:** Buttons. A tile is not clickable on its own.

## In Figma

File Vinden-Design (`zFjDhV7CDaLDVZpqN3dBzU`).
- **Icon tile**: page Avatar & trust, node `23:54`.
  - Variants: Tone=Gold|Blue|Lavender; Style=Outlined|Flat; Size=Medium|Small.
  - Properties: Icon (instance swap).
  - Colour tokens: bg/club, bg/highlight, bg/highlight-strong, bg/surface, bg/trust, bg/trust-strong, border/tile, icon/club, icon/default, icon/trust.

## Rules

- **Gold** for progress, events and milestones. **Blue** for trust. **Lavender** for club.
- **Flat** in rows and cards; **Outlined** in journey lists on cream.
- Sizes: Medium 52 px and Small 42 px. Code adds `tile-xs` at 36 px for file rows.

## In code

Paths are under `apps/web/src`.

- `<span className="tile tile-sm tile-flat tile-blue|tile-gold|tile-lav">` with an `<Icon>` inside, `aria-hidden`.

## Accessibility

- Decorative; the row text says what it is.

Related skills: vinden-component-info-row, vinden-component-verification-row, vinden-visual-guidelines.
