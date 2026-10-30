---
name: vinden-component-tab-bar
description: The Vinden Tab bar component: usage rules, Figma variants and properties, tokens, the React component and accessibility. Use when a Vinden screen needs a tab bar in Figma or code, for example: Top-level phone screens: Explore, Communities, Post, Club, Profile.
---

# Tab bar (component)

Phone navigation: a floating bar of five destinations.

**Use it for:** Top-level phone screens: Explore, Club, Post, Openings, Profile.

**Not for:** Desktop, and flows that show an Action bar (Post work), where it is hidden.

## In Figma

File Vinden-Design (`zFjDhV7CDaLDVZpqN3dBzU`).
- **Tab bar**: page Inputs & navigation, node `25:60`.
  - Colour tokens: bg/selected, bg/surface, border/default, icon/default, icon/secondary, text/primary, text/secondary.
  - Text styles: Label/Tab.
- **Tab bar item**: page Inputs & navigation, node `25:59`.
  - Variants: State=Default|Active.
  - Properties: Label (text), Icon (instance swap).
  - Colour tokens: bg/selected, icon/default, icon/secondary, text/primary, text/secondary.
  - Text styles: Label/Tab.

## Rules

- Floats 16 px above the bottom edge plus the safe area, with Shadow/Float.
- Active item: navy-50 pill and bold label. Explore covers Home, Explore, work pages and other people's profiles.
- **Items by account:**
  - **Person:** Explore, Communities, Post, Club (only for club members) and Profile.
  - **Company:** Explore, Problems and Submit.
  - **Visitor:** Explore, Communities and Sign up.
- Flows that bring their own Action bar hide the tab bar: Post work, sign-up, the profile steps, Apply, Create a community, Submit a problem and Register your company.

## In code

Paths are under `apps/web/src`.

- `TabBar` in components/Layout.tsx (`.tabbar`), hidden from 768 px up.

## Accessibility

- `aria-current="page"` on the active item. Labels are always visible (Label/Tab 11 px, the only text under 13 px).

Related skills: vinden-component-mobile-top-bar, vinden-component-action-bar, vinden-visual-guidelines.
