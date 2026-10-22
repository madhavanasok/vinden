---
name: vinden-component-contribution-split
description: The Vinden Contribution split component: usage rules, Figma variants and properties, tokens, the React component and accessibility. Use when a Vinden screen needs a contribution split in Figma or code, for example: Work page Team section; Post work step 2 (updates live).
---

# Contribution split (component)

Who did what, as one bar.

**Use it for:** Work page Team section; Post work step 2 (updates live).

**Not for:** Use it on its own without the rows. Always pair it with Member rows or Teammate rows.

## In Figma

File Vinden-Design (`zFjDhV7CDaLDVZpqN3dBzU`).
- **Contribution split**: page Avatar & trust, node `23:122`.
  - Colour tokens: split/1, split/2, split/3, split/4.

## Rules

- Segment widths are the shares, in the same order and colours as the rows (split/1 to 4).
- In Figma the component shows a four-way example. To show real shares, detach it on the screen and resize the segments, because Figma can't resize layers inside an instance.
- For more than four people, list contributions instead.

## In code

Paths are under `apps/web/src`.

- `.split` with one `<span>` per person (`width: share%`, `background: var(--color-split-N)`), as in pages/Work.tsx and pages/Post.tsx.

## Accessibility

- `role="img"` with a label listing each person and share.

Related skills: vinden-component-member-row, vinden-component-teammate-row, vinden-visual-guidelines.
