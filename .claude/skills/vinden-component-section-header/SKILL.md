---
name: vinden-component-section-header
description: The Vinden Section header component: usage rules, Figma variants and properties, tokens, the React component and accessibility. Use when a Vinden screen needs a section header in Figma or code, for example: Every content section on Home, Club and Profile.
---

# Section header (component)

A section title, optional one-line subtitle, and See all.

**Use it for:** Every content section on Home, Club and Profile.

**Not for:** Page titles (use h1).

## In Figma

File Vinden-Design (`zFjDhV7CDaLDVZpqN3dBzU`).
- **Section header**: page Inputs & navigation, node `25:128`.
  - Variants: Platform=Desktop|Mobile.
  - Properties: Title (text), Subtitle (text), Show subtitle (boolean), Show See all (boolean).
  - Colour tokens: action/primary, text/primary, text/tertiary.
  - Text styles: Heading/H2, Body/Default, Label/Default, Heading/H3, Body/Small, Label/Medium.

## Rules

- The title says what the section holds; the subtitle says why it matters ("Every rupee goes to the club").
- **Desktop**: H2 and an outlined See all pill. **Mobile**: H3 and an underlined See all link.

## In code

Paths are under `apps/web/src`.

- `.section-head` with `.section-title` (h2), `.section-sub` and `.see-all`.

## Accessibility

- The title is an h2, and the section uses `aria-labelledby` pointing at it.

Related skills: vinden-information-architecture, vinden-visual-guidelines.
