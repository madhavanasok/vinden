---
name: vinden-component-teammate-row
description: The Vinden Teammate row component: usage rules, Figma variants and properties, tokens, the React component and accessibility. Use when a Vinden screen needs a teammate row in Figma or code, for example: Post work step 2, and forming a brief team later.
---

# Teammate row (component)

One teammate's role and share while posting team work.

**Use it for:** Post work step 2, and forming a brief team later.

**Not for:** Showing a published team (use Member row).

## In Figma

File Vinden-Design (`zFjDhV7CDaLDVZpqN3dBzU`).
- **Teammate row**: page Forms, node `44:292`.
  - Variants: Layout=Wide|Stacked.
  - Properties: Name (text), Line (text), Role (text), Share (text).
  - Colour tokens: bg/surface, border/default, border/strong, split/1 to split/4, text/primary, text/secondary, text/tertiary.
  - Text styles: Label/Default, Caption, Body/Large.

## Rules

- Split colour dot, avatar, name and line, a role input and a share input in %, then remove (not shown for you).
- **Wide** on desktop (a grid: who, role, share, remove); **Stacked** on phones (who and remove on top, inputs below).
- Adding or removing someone re-splits evenly. Shares must total 100% before continuing, and the total updates live.

## In code

Paths are under `apps/web/src`.

- `<TeammateRow person line role share color you onRole onShare onRemove />` from components/Forms.tsx (`.teammate`, `.share-input`). Teammates are picked with the `.add-teammate` select from the club's members.

## Accessibility

- Inputs are labelled per person ("Kabir Shah's share, in percent"). Share uses `inputMode="numeric"`.

Related skills: vinden-component-contribution-split, vinden-product, vinden-visual-guidelines.
