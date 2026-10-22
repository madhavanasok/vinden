---
name: vinden-component-mobile-top-bar
description: The Vinden Mobile top bar component: usage rules, Figma variants and properties, tokens, the React component and accessibility. Use when a Vinden screen needs a mobile top bar in Figma or code, for example: **Home** type on top-level tabs (logo, notifications, avatar). **Page** type on anything opened from a tab (back, title, optional "Step 2 of 4").
---

# Mobile top bar (component)

The phone top bar, below 768 px.

**Use it for:** **Home** type on top-level tabs (logo, notifications, avatar). **Page** type on anything opened from a tab (back, title, optional "Step 2 of 4").

**Not for:** Desktop.

## In Figma

File Vinden-Design (`zFjDhV7CDaLDVZpqN3dBzU`).
- **Mobile top bar**: page Inputs & navigation, node `48:269`.
  - Variants: Type=Home|Page.
  - Properties: Title (text), Trailing (text), Show trailing (boolean).
  - Colour tokens: bg/page, border/default, text/primary, text/secondary.
  - Text styles: Brand/Wordmark, Heading/H4, Label/Small.

## Rules

- Pair the Home type with the Tab bar. Pair the Page type with an Action bar in flows.
- Keep titles short; the trailing note is for step counts or a single action.

## In code

Paths are under `apps/web/src`.

- `MobileBar` (Home) and `PageBar` (Page) in components/Layout.tsx. Both are `.mobile-bar mobile-only`; `PageBar` adds `.page-bar`.

## Accessibility

- The back button needs `aria-label="Back"`. The page still has an h1, which may be visually hidden on phones.

Related skills: vinden-component-action-bar, vinden-component-tab-bar, vinden-visual-guidelines.
