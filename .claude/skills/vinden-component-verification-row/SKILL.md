---
name: vinden-component-verification-row
description: The Vinden Verification row component: usage rules, Figma variants and properties, tokens, the React component and accessibility. Use when a Vinden screen needs a verification row in Figma or code, for example: Work page Verification; "What happens next" on Post work.
---

# Verification row (component)

One trust check on a piece of work.

**Use it for:** Work page Verification; "What happens next" on Post work.

**Not for:** Generic status lists.

## In Figma

File Vinden-Design (`zFjDhV7CDaLDVZpqN3dBzU`).
- **Verification row**: page Avatar & trust, node `23:81`.
  - Variants: Status=Passed|Missing|Pending.
  - Properties: Title (text), Body (text).
  - Colour tokens: bg/subtle, bg/surface, bg/trust, border/default, icon/inverse, icon/secondary, icon/trust, text/primary, text/secondary, trust/score.
  - Text styles: Label/Default, Caption.

## Rules

- Fixed order: AI check, Club review, Company sign-off.
- **Passed**: blue tick and date. **Pending**: clock, while the check runs or waits its turn. **Missing**: dashed and muted, saying why ("Only for paid briefs").
- Club review applies only to club work; company sign-off only to paid briefs.

## In code

Paths are under `apps/web/src`.

- `<CheckRow icon tone title body status="passed|pending|missing" statusText />` from components/Rows.tsx (`.verify-card`, `.is-pending`, `.is-missing`).

## Accessibility

- Status is in words (visually hidden for the pending clock), never colour alone.

Related skills: vinden-product, vinden-atom-icon-tile, vinden-visual-guidelines.
