---
name: vinden-atom-pill
description: The Vinden Pill atom: usage rules, Figma variants and properties, tokens, the React component and accessibility. Use when a Vinden screen needs a pill in Figma or code, for example: Manager confirmed, Offer letter verified · private, You're a member, Public once verified, Core Team.
---

# Pill (atom)

A small tinted label for a fact the system confirmed.

**Use it for:** Manager confirmed, Offer letter verified · private, You're a member, Public once verified, Core Team.

**Not for:** Something the person can click (use Chip or Button).

## In Figma

File Vinden-Design (`zFjDhV7CDaLDVZpqN3dBzU`).
- **Pill**: page Chips & labels, node `21:80`.
  - Variants: Tone=Trust|Club|Neutral|Highlight|Success.
  - Properties: Label (text), Show icon (boolean), Icon (instance swap).
  - Colour tokens: bg/club, bg/highlight, bg/subtle, bg/success, bg/trust, icon/club, icon/highlight, icon/secondary, icon/success, icon/trust, text/club, text/highlight, text/secondary, text/success, text/trust.
  - Text styles: Label/Pill.

## Rules

- **Trust** (blue): verified by Vinden or a manager. **Club** (lavender): club or private. **Neutral**: low weight or plain info. **Highlight** (gold): a milestone. **Success** (green): a completed system step.
- Text is always the 700 step on its tint, which passes AA. An icon is optional.

- **Status pills (feature register build):**
  - **Work status:** Verified uses Trust; In review and Posted use Neutral with a clock; Changes asked uses Club; "Not yet" is a dashed, unfilled pill. Code: `StatusPill` in components/Status.tsx.
  - **Role verification:**
    - Manager confirmed: Trust with a check.
    - Offer letter verified · private: Club with a lock. The letter itself is never shown.
    - Waiting for confirmation: Neutral with a clock.
    - Code: `RoleStatus` in features/onboarding/RoleStatus.tsx.

## In code

Paths are under `apps/web/src`.

- `.pill` plus `.pill-blue` (Trust), `.pill-lav` (Club) or `.pill-muted` (Neutral). Highlight and Success have no class yet: add `.pill-gold` and `.pill-green` using `--color-bg-highlight`/`--color-text-highlight` and the success tokens.

## Accessibility

- Colour is never the only cue; the words carry the meaning.

Related skills: vinden-atom-badge, vinden-atom-tag, vinden-visual-guidelines.
