---
name: vinden-atom-chip
description: The Vinden Chip atom: usage rules, Figma variants and properties, tokens, the React component and accessibility. Use when a Vinden screen needs a chip in Figma or code, for example: Filtering a list (Home categories, vouch filters) or picking one short value (the category on Post work).
---

# Chip (atom)

A rounded filter or view switch.

**Use it for:** Filtering a list (Home categories, vouch filters) or picking one short value (the category on Post work).

**Not for:** Actions (use Button), or showing a skill on a piece of work (use Tag).

## In Figma

File Vinden-Design (`zFjDhV7CDaLDVZpqN3dBzU`).
- **Chip**: page Chips & labels, node `21:50`.
  - Variants: Style=Solid|Soft; State=Default|Selected; Size=Medium|Small.
  - Properties: Label (text), Show icon (boolean), Icon (instance swap).
  - Colour tokens: action/primary, bg/selected, bg/subtle, bg/surface, border/strong, text/inverse, text/primary.
  - Text styles: Label/Medium, Label/Small.

## Rules

- **Solid** selection (navy) for the main filter row. **Soft** selection (navy-50) for secondary filters.
- Medium 44 px in filter rows; Small 38 px in compact forms.
- Keep labels to one or two words.

## In code

Paths are under `apps/web/src`.

- `<button className="chip" aria-pressed={selected}>` inside `.chip-row`. Add `.chip-sm` and `.chip-soft` for the variants.

## Accessibility

- `aria-pressed` carries the state. Group related chips with `role="group"` and `aria-labelledby`.

Related skills: vinden-atom-tag, vinden-atom-pill, vinden-visual-guidelines.
