---
name: vinden-component-empty-state
description: The Vinden Empty state component: what a list shows when it's empty (what's missing plus the next step). Figma properties, tokens, the React EmptyState and accessibility. Use whenever a Vinden list, queue or section can be empty.
---

# Empty state (component)

What a list shows when there's nothing in it: what's missing, and the next step. Never just "No results".

**Use it for:** empty review queues, no applications yet, no problem statements, no posts in a community, an empty learning path.

**Not for:** loading or errors (use the states in pages/Placeholder.tsx).

## In Figma

File Vinden-Design (`zFjDhV7CDaLDVZpqN3dBzU`).
- **Empty state**: page Pages & boards, node `107:174`.
  - Properties: Title (text), Body (text), Show action (boolean).
  - Parts: an Icon tile (Gold, Flat, Medium), the title, one line, and an optional Outline Small button.
  - Tokens:
    - bg/surface with a dashed border/default border;
    - radius/2xl;
    - space/20 padding, space/16 gap.
  - Text styles: Title/Small, Body/Small.

## Rules

- The title says what's missing: "No work waiting for review".
- The body says what will fill it, or what to do.
- The action is the next step, as an Outline button. Never use Accent here.

## In code

Paths are under `apps/web/src`.

- `<EmptyState icon? title body? action? />` from components/Page.tsx.
- CSS: `.empty-state`, `.empty-state-title`.

## Accessibility

- The tile is decorative.

Related skills: vinden-atom-icon-tile, vinden-atom-button, vinden-visual-guidelines.
