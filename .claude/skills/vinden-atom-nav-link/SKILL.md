---
name: vinden-atom-nav-link
description: The Vinden Nav link atom: usage rules, Figma variants and properties, tokens, the React component and accessibility. Use when a Vinden screen needs a nav link in Figma or code, for example: Explore, Club, Openings and Saved in the Top nav.
---

# Nav link (atom)

A desktop top-bar destination.

**Use it for:** Explore, Club, Openings and Saved in the Top nav.

**Not for:** Phones (use the Tab bar) or in-page sections (use Category tab).

## In Figma

File Vinden-Design (`zFjDhV7CDaLDVZpqN3dBzU`).
- **Nav link**: page Inputs & navigation, node `25:107`.
  - Variants: State=Default|Active.
  - Properties: Label (text).
  - Colour tokens: bg/selected, text/primary, text/secondary.
  - Text styles: Label/Medium, Label/Default.

## Rules

- Active gets the navy-50 pill and bold label. Explore stays active on Home, work pages and other people's profiles.

## In code

Paths are under `apps/web/src`.

- `Header` in components/Layout.tsx: `.main-nav a` via `<NavLink>`, with `.active`.

## Accessibility

- `aria-current="page"` on the active link.

Related skills: vinden-component-top-nav, vinden-visual-guidelines.
