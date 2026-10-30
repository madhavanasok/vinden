---
name: vinden-atom-vouch-score
description: The Vinden Vouch score atom: usage rules, Figma variants and properties, tokens, the React component and accessibility. Use when a Vinden screen needs a vouch score in Figma or code, for example: Every work card, the work page header and the vouch action bar.
---

# Vouch score (atom)

A work's vouch weight: the number, five dots and the vouch count, like a rating.

**Use it for:** Every work card, the work page header and the vouch action bar.

**Not for:** Anything that isn't a weighted vouch score.

## In Figma

File Vinden-Design (`zFjDhV7CDaLDVZpqN3dBzU`).
- **Vouch score**: page Avatar & trust, node `22:84`.
  - Variants: Size=Small|Medium|Large.
  - Properties: Score (text), Count (text), Show count (boolean).
  - Colour tokens: text/primary, text/tertiary, trust/score.
  - Text styles: Label/Pill, Caption, Label/Small, Body/Small, Label/Default, Body/Default.
- **Vouch dot**: page Avatar & trust, node `22:53`.
  - Variants: State=Full|Half|Empty; Size=Small|Medium|Large.
  - Colour tokens: border/default, trust/score.

## Rules

- Show the score out of 10 to one decimal, then the dots, then "(14)".
- Dots = score ÷ 2. Below .25 rounds down, .25 to .74 shows a half dot, .75 and up rounds up.
- Always Horizon Blue (`trust/score`). Never show dots without the number.
- New work with no vouches says "New · no vouches yet" instead of 0.0.

## In code

Paths are under `apps/web/src`.

- `<Score score={8.6} count={14} size="sm|lg" />` and `<Dots score />` from components/Bits.tsx. The score itself comes from the API (`scoreFrom` in apps/api/src/score.ts).

## Accessibility

- Dots carry `role="img"` with "Vouch weight 8.6 out of 10".

Related skills: vinden-product, vinden-component-work-card, vinden-visual-guidelines.
