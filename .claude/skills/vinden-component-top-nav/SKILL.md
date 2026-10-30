---
name: vinden-component-top-nav
description: The Vinden Top nav component: usage rules, Figma variants and properties, tokens, the React component and accessibility. Use when a Vinden screen needs a top nav in Figma or code, for example: Every desktop screen.
---

# Top nav (component)

Desktop and tablet navigation, 768 px and up.

**Use it for:** Every desktop and tablet screen.

**Not for:** Phones (use the Mobile top bar and Tab bar).

## In Figma

File Vinden-Design (`zFjDhV7CDaLDVZpqN3dBzU`).
- **Top nav**: page Inputs & navigation, node `48:210`.
  - Properties: Show search (boolean).
  - Colour tokens: bg/page, border/default, plus nested Nav link, Search field, Button, Icon button, Avatar.
  - Text styles: Brand/Wordmark, Label/Medium.

## Rules

- **Contents, in order:**
  1. The logo.
  2. Search. It's hidden on Home and Explore, and on tablet, where search lives on Explore.
  3. The nav links for the account.
  4. The main action.
  5. The theme switch (Moon in light, Sun in dark).
  6. The avatar, or the company's square for a company account.
- **Nav links and main action by account:**
  - **Person:** Explore, Communities, and Club (only for club members); the main action is Post work.
  - **Company:** Explore and Problem statements; the main action is Submit a problem.
  - **Visitor (not signed in):** Explore and Communities; then For companies (desktop only) and Sign up.
- There are no Openings, Saved, notifications or category row: none of them is in the feature register.
- Content sits in the 1,200 px container (full width on tablet). In Figma, set the current page's nested Nav link to Active.
- The header is sticky at the top. In the demo, the "Viewing as" Demo bar sits above it; it isn't part of the product.

## In code

Paths are under `apps/web/src`.

- `Header` in components/Layout.tsx (`.site-header`, `.header-row`, `.main-nav`, `.header-actions`). `navFor(me)` picks the links for the account. `ThemeSwitch` (same file) flips `data-theme` on `<html>` and saves the choice; without one the system setting decides.

## Accessibility

- There is a skip link to `#main` before it. The nav has `aria-label="Main"`.

Related skills: vinden-atom-nav-link, vinden-component-tab-bar, vinden-information-architecture, vinden-visual-guidelines.
