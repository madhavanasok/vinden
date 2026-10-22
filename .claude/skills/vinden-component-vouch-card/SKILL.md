---
name: vinden-component-vouch-card
description: The Vinden Vouch card component: usage rules, Figma variants and properties, tokens, the React component and accessibility. Use when a Vinden screen needs a vouch card in Figma or code, for example: The Vouches section of a work page.
---

# Vouch card (component)

A written vouch on a work page.

**Use it for:** The Vouches section of a work page.

**Not for:** Comments or reactions.

## In Figma

File Vinden-Design (`zFjDhV7CDaLDVZpqN3dBzU`).
- **Vouch card**: page Cards, node `27:162`.
  - Variants: Weight=High|Low.
  - Colour tokens: bg/surface, bg/trust, bg/subtle, border/default, text/primary, text/secondary, text/tertiary, text/trust.
  - Text styles: Label/Default, Body/Small, Label/Pill, Title/Card, Body/Default, Caption, Label/Small.

## Rules

- Sort by weight, highest first. Always show the voucher's role and years so the weight makes sense.
- Weight=High (7 and up, professionals) gets a Trust pill; Weight=Low (peers) a Neutral pill.

## In code

Paths are under `apps/web/src`.

- `Vouches` in pages/Work.tsx (`.vouch`).

## Accessibility

- Each vouch is an article, with the voucher's name as its heading.

Related skills: vinden-atom-vouch-score, vinden-product, vinden-visual-guidelines.
