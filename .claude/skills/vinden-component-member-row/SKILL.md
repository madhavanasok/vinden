---
name: vinden-component-member-row
description: The Vinden Member row component: usage rules, Figma variants and properties, tokens, the React component and accessibility. Use when a Vinden screen needs a member row in Figma or code, for example: The Team section of a work page.
---

# Member row (component)

One teammate in Who did what, on a published work.

**Use it for:** The Team section of a work page.

**Not for:** Editing shares (use Teammate row).

## In Figma

File Vinden-Design (`zFjDhV7CDaLDVZpqN3dBzU`).
- **Member row**: page Avatar & trust, node `23:121`.
  - Variants: Split=1|2|3|4.
  - Properties: Name (text), Role (text), Share (text).
  - Colour tokens: bg/surface, border/default, split/1, split/2, split/3, split/4, text/primary, text/secondary, text/trust.
  - Text styles: Label/Default, Body/Small.

## Rules

- Avatar, name, role in the project and share. Split 1 to 4 sets the colour to match the Contribution split order.
- Shares show as unconfirmed until each teammate confirms.

## In code

Paths are under `apps/web/src`.

- Team grid in pages/Work.tsx (`.team-grid`, `.member`, `.share-dot`).

## Accessibility

- Each row links to the person's profile.

Related skills: vinden-component-contribution-split, vinden-component-teammate-row, vinden-visual-guidelines.
