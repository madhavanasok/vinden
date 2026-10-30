---
name: vinden-atom-search-field
description: The Vinden Search field atom: usage rules, Figma variants and properties, tokens, the React component and accessibility. Use when a Vinden screen needs a search field in Figma or code, for example: Home hero (Large, with a Search button), the desktop top bar (Medium), the phone Home (Mobile).
---

# Search field (atom)

A pill-shaped search input.

**Use it for:** Home hero (Large, with a Search button), the desktop top bar (Medium), the phone Home (Mobile).

**Not for:** Filtering a short list; use chips.

## In Figma

File Vinden-Design (`zFjDhV7CDaLDVZpqN3dBzU`).
- **Search field**: page Inputs & navigation, node `25:45`.
  - Variants: Size=Large|Medium|Mobile; State=Default|Focused.
  - Properties: Placeholder (text).
  - Colour tokens: action/primary, bg/surface, border/default, border/focus, border/strong, icon/default, text/inverse, text/tertiary.
  - Text styles: Body/Large, Label/Default, Body/Default.

## Rules

- Placeholder: "Search work, skills, people, clubs". Hidden in the top bar on Home, which has its own hero search.
- Focused: blue border and a 3 px ring.

## In code

Paths are under `apps/web/src`.

- `HeaderSearch` in components/Layout.tsx (`<form role="search" className="search header-search">`), which navigates to `/?q=`.

## Accessibility

- `role="search"` on the form and an `aria-label` on the input.

Related skills: vinden-component-top-nav, vinden-visual-guidelines.
