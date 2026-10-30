---
name: vinden-atom-avatar
description: The Vinden Avatar atom: usage rules, Figma variants and properties, tokens, the React component and accessibility. Use when a Vinden screen needs a avatar in Figma or code, for example: Every person reference: rows, cards, vouches, teammates.
---

# Avatar (atom)

Initials on a tone; the profile owner gets the sunrise ring.

**Use it for:** Every person reference: rows, cards, vouches, teammates.

**Not for:** Companies (use the company chip with its initial).

## In Figma

File Vinden-Design (`zFjDhV7CDaLDVZpqN3dBzU`).
- **Avatar**: page Avatar & trust, node `22:30`.
  - Variants: Tone=Blue|Orange|Lavender|Gold; Size=Small|Medium|Large.
  - Properties: Initials (text).
  - Colour tokens: bg/club, bg/highlight, bg/trust-strong, bg/warm, text/club, text/highlight, text/trust, text/warm.
- **Avatar / Profile**: page Avatar & trust, node `22:34`.
  - Colour tokens: bg/surface, bg/trust-strong, text/trust.

## Rules

- Tones (Blue, Orange, Lavender, Gold) only tell people apart. They carry no meaning.
- Small 32 px in stacks and teammate rows, Medium 44 px in rows, Large on profiles.
- **Avatar / Profile** (the sunrise ring) appears once per page, only for whose profile you are on.

## In code

Paths are under `apps/web/src`.

- `<Avatar person={p} size={44} ring? decorative? />` from components/Bits.tsx. Tones: `blue | orange | lav | gold`.

## Accessibility

- Use `decorative` when the name is printed beside it; otherwise the avatar has `role="img"` and the person's name.

Related skills: vinden-atom-avatar-stack, vinden-component-person-row, vinden-visual-guidelines.
