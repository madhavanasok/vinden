---
name: vinden-atom-category-tab
description: The Vinden Category tab atom: usage rules, Figma variants and properties, tokens, the React component and accessibility. Use when a Vinden screen needs a category tab in Figma or code, for example: Home's category row and in-page section tabs (Overview, Verification, Team, Vouches; Club sections).
---

# Category tab (atom)

An underlined text tab.

**Use it for:** Home's category row and in-page section tabs (Overview, Verification, Team, Vouches; Club sections).

**Not for:** Switching between top-level areas (Nav link, Tab bar).

## In Figma

File Vinden-Design (`zFjDhV7CDaLDVZpqN3dBzU`).
- **Category tab**: page Inputs & navigation, node `25:112`.
  - Variants: State=Default|Active.
  - Properties: Label (text).
  - Colour tokens: action/primary, text/primary, text/secondary.
  - Text styles: Body/Default, Label/Default.

## Rules

- Space tabs 28 to 32 px apart. Active means a navy 2 px underline and bold text.
- On phones the row scrolls sideways; never wrap it to two lines.

## In code

Paths are under `apps/web/src`.

- Home: `.cat-nav` in Layout.tsx. In-page: `.page-tabs` (Club page) with anchor links to section ids, which use `scroll-margin-top`.

## Accessibility

- Anchor tabs are links. Use `aria-current` only when a tab really is the current page or view.

Related skills: vinden-atom-nav-link, vinden-information-architecture, vinden-visual-guidelines.
