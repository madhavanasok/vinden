---
name: vinden-atom-tag
description: The Vinden Tag atom: usage rules, Figma variants and properties, tokens, the React component and accessibility. Use when a Vinden screen needs a tag in Figma or code, for example: Skills on a work page or profile, and skills being added on Post work (removable).
---

# Tag (atom)

An outlined label for a skill.

**Use it for:** Skills on a work page or profile, and skills being added on Post work (removable).

**Not for:** Status (use Pill) or filters (use Chip).

## In Figma

File Vinden-Design (`zFjDhV7CDaLDVZpqN3dBzU`).
- **Tag**: page Chips & labels, node `21:54`.
  - Properties: Label (text).
  - Colour tokens: border/strong, text/primary.
  - Text styles: Label/Small.

## Rules

- One skill per tag, sentence case ("Market sizing").
- Removable tags add a close button with a 40 px hit area. Up to 8 skills per work.

## In code

Paths are under `apps/web/src`.

- `.tag` inside `.tag-row` (a `<ul>` when it is a list). For removable tags, use `.tag.tag-removable` with `<button aria-label="Remove Market sizing">`.

## Accessibility

- Not interactive unless removable.

Related skills: vinden-atom-chip, vinden-visual-guidelines.
