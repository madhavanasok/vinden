---
name: vinden-component-board
description: The Vinden Board component (Board column + Board card): columns for things that move through fixed steps, such as club selection and problem statements. Figma variants and properties, tokens, the React Board and accessibility. Use when a Vinden screen shows items by step or stage.
---

# Board (component)

Columns for things that move through fixed steps. Each column shows its Count and says "None" when it's empty; columns never hide.

**Use it for:**
- **Club selection** (`/club/applications`): Motivation form, Screening, Interview, Practical task, Final selection.
- **Problem statements** (`/club/problems`): Problem, Student team, Solution, Proof of Work.

**Not for:** lists without fixed steps (use rows or a card grid).

## In Figma

File Vinden-Design (`zFjDhV7CDaLDVZpqN3dBzU`), page Pages & boards.
- **Board column**: node `107:170`.
  - Variants: State=Items|Empty.
  - Properties: Title (text).
  - Holds a Count instance (Tone=On subtle) and Board card instances.
  - Tokens: bg/subtle fill, border/subtle stroke, radius/2xl, space/12 padding, space/8 gap. The title uses the Overline style in text/secondary.
- **Board card**: node `107:150`.
  - Properties: Title (text), Line (text).
  - Tokens: bg/surface, border/default, radius/lg, space/12.
  - Text styles: Title/Small and Caption.
- **Count**: node `109:132` (see vinden-atom-count).
- An example of the full selection board is in the Board section (`109:141`).

## Rules

- Columns follow the steps in the order the sources give them. Don't reorder them, and don't add steps.
- A card carries who or what, plus one line. The whole card opens the item's detail.
- **Desktop and tablet:** columns side by side, scrolling sideways if they don't fit.
- **Phone:** a sideways rail of columns, each 78% of the screen wide.

## In code

Paths are under `apps/web/src`.

- `<Board label columns={[{ key, title, items: [{ key, content }] }]} />` from components/Page.tsx.
- Put `<Link className="board-card"><b>…</b><span>…</span></Link>` in `content`.
- CSS: `.board`, `.board-col`, `.board-head`, `.board-count`, `.board-items`, `.board-empty`, `.board-card`.

## Accessibility

- The board is a list of columns.
- Each column's accessible name includes its count, e.g. "Screening, 2".

Related skills: vinden-atom-count, vinden-component-page-header, vinden-product.
