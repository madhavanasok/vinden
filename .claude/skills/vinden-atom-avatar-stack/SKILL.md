---
name: vinden-atom-avatar-stack
description: The Vinden Avatar stack atom: usage rules, Figma variants and properties, tokens, the React component and accessibility. Use when a Vinden screen needs a avatar stack in Figma or code, for example: Who posted the task, who joined a brief.
---

# Avatar stack (atom)

Up to four overlapping faces plus a count.

**Use it for:** Who posted the task, who joined a brief.

**Not for:** The only way to see who: always link to or show the full list somewhere.

## In Figma

File Vinden-Design (`zFjDhV7CDaLDVZpqN3dBzU`).
- **Avatar stack**: page Lists & data, node `46:196`.
  - Properties: More (text).
  - Colour tokens: bg/surface (ring), text/secondary, plus nested Avatar.
  - Text styles: Label/Small.

## Rules

- Use Small 32 px avatars, overlapping by 8 px with a 2 px surface ring. "+N" counts the rest.

## In code

Paths are under `apps/web/src`.

- `<AvatarStack people total label />` from components/Rows.tsx. Home's club card still uses the older `.avatar-stack` markup.

## Accessibility

- One `role="img"` with a sentence label ("12 members posted, including Rohan, Meera…").

Related skills: vinden-atom-avatar, vinden-visual-guidelines.
