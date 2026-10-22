---
name: vinden-component-action-bar
description: The Vinden Action bar component: usage rules, Figma variants and properties, tokens, the React component and accessibility. Use when a Vinden screen needs a action bar in Figma or code, for example: **Back and next** in multi-step forms (Post work). **Summary and action** on detail pages (vouch on a work page, express interest on a brief).
---

# Action bar (component)

A phone-only bar fixed to the bottom, carrying the page's main action.

**Use it for:** **Back and next** in multi-step forms (Post work). **Summary and action** on detail pages (vouch on a work page, express interest on a brief).

**Not for:** Desktop, where the action sits in a side panel; more than two buttons.

## In Figma

File Vinden-Design (`zFjDhV7CDaLDVZpqN3dBzU`).
- **Action bar**: page Inputs & navigation, node `48:297`.
  - Variants: Type=Back and next|Summary and action.
  - Colour tokens: bg/surface, border/default, plus nested Button and Vouch score.
  - Text styles: Label/Large.

## Rules

- Padding at the bottom is max(16 px, the safe area). The Tab bar hides while it shows.
- The forward button fills the width. On the last step it becomes the Accent action ("Send for verification").
- Page content gets enough bottom padding that nothing hides behind the bar.

## In code

Paths are under `apps/web/src`.

- `<ActionBar>` in components/Layout.tsx renders `.action-bar.mobile-only`. The work page's older equivalent is `.vouch-dock`.

## Accessibility

- Buttons keep their full labels; nothing is icon-only.

Related skills: vinden-component-mobile-top-bar, vinden-atom-button, vinden-visual-guidelines.
