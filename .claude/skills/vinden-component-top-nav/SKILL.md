---
name: vinden-component-top-nav
description: The Vinden Top nav component: usage rules, Figma variants and properties, tokens, the React component and accessibility. Use when a Vinden screen needs a top nav in Figma or code, for example: Every desktop screen.
---

# Top nav (component)

Desktop navigation, 768 px and up.

**Use it for:** Every desktop screen.

**Not for:** Phones (use the Mobile top bar and Tab bar).

## In Figma

File Vinden-Design (`zFjDhV7CDaLDVZpqN3dBzU`).
- **Top nav**: page Inputs & navigation, node `48:210`.
  - Properties: Show search (boolean).
  - Colour tokens: bg/page, border/default, plus nested Nav link, Search field, Button, Icon button, Avatar.
  - Text styles: Brand/Wordmark, Label/Medium.

## Rules

- Contents, in order: logo, search (hidden on Home), Explore, Club, Openings and Saved, the Post work Primary button, the theme switch (Moon in light, Sun in dark), notifications, and your avatar.
- Content sits in the 1,200 px container. In Figma, set the current page's nested Nav link to Active.
- Sticky at the top; the category row follows on Home.

## In code

Paths are under `apps/web/src`.

- `Header` in components/Layout.tsx (`.site-header`, `.header-row`, `.main-nav`, `.header-actions`, `.cat-nav`). `ThemeSwitch` (same file) flips `data-theme` on `<html>` and saves the choice; without one the system setting decides.

## Accessibility

- There is a skip link to `#main` before it. The nav has `aria-label="Main"`.

Related skills: vinden-atom-nav-link, vinden-component-tab-bar, vinden-information-architecture, vinden-visual-guidelines.
