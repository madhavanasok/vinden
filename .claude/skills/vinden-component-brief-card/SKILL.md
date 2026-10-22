---
name: vinden-component-brief-card
description: The Vinden Brief card component: usage rules, Figma variants and properties, tokens, the React component and accessibility. Use when a Vinden screen needs a brief card in Figma or code, for example: Home and Club "Live problem statements".
---

# Brief card (component)

A company problem statement.

**Use it for:** Home and Club "Live problem statements".

**Not for:** Openings (roles and internships) until they are designed.

## In Figma

File Vinden-Design (`zFjDhV7CDaLDVZpqN3dBzU`).
- **Brief card**: page Cards, node `27:81`.
  - Properties: Title (text), Company (text), Company line (text), Meta (text), Fee (text), Initial (text).
  - Colour tokens: action/accent, action/primary, bg/highlight, text/on-accent, text/primary, text/secondary, text/tertiary.
  - Text styles: Label/Small, Title/Card, Body/Small, Label/Large, Caption.

## Rules

- Always show the fee and where it goes: "₹35,000 to your club", in Indian grouping.
- One Accent button: View brief. The company chip sits on the cover.

## In code

Paths are under `apps/web/src`.

- `<BriefCard brief />` from components/Cards.tsx.

## Accessibility

- Save has its own label: "Save <title>".

Related skills: vinden-product, vinden-component-cover, vinden-visual-guidelines.
