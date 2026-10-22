---
name: vinden-component-info-row
description: The Vinden Info row component: usage rules, Figma variants and properties, tokens, the React component and accessibility. Use when a Vinden screen needs a info row in Figma or code, for example: Next session, milestones, journey entries, notifications, "Posting for this week's task".
---

# Info row (component)

A fact or event with an icon tile.

**Use it for:** Next session, milestones, journey entries, notifications, "Posting for this week's task".

**Not for:** People (use Person row).

## In Figma

File Vinden-Design (`zFjDhV7CDaLDVZpqN3dBzU`).
- **Info row**: page Lists & data, node `46:195`.
  - Variants: Trailing=None|Chevron|Button.
  - Properties: Title (text), Subtitle (text).
  - Colour tokens: text/primary, text/secondary, icon/secondary, plus nested Icon tile, Button.
  - Text styles: Label/Default, Body/Small.

## Rules

- The title says what; the subtitle says when or why.
- Gold tile for progress and events, Blue for trust, Lavender for club.

## In code

Paths are under `apps/web/src`.

- `<InfoRow icon tone title subtitle trailing? />` from components/Rows.tsx. Home's journey rows (`.journey-row`) are the older form.

## Accessibility

- The tile is decorative; the text carries the meaning.

Related skills: vinden-atom-icon-tile, vinden-component-person-row, vinden-visual-guidelines.
