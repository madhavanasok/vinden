---
name: vinden-atom-badge
description: The Vinden Badge atom: usage rules, Figma variants and properties, tokens, the React component and accessibility. Use when a Vinden screen needs a badge in Figma or code, for example: The kind of work above a title: PAID BRIEF, CLUB TASK, TEAM PROJECT.
---

# Badge (atom)

A small outlined classifier set in capitals.

**Use it for:** The kind of work above a title: PAID BRIEF, CLUB TASK, TEAM PROJECT.

**Not for:** Status or verification (use Pill).

## In Figma

File Vinden-Design (`zFjDhV7CDaLDVZpqN3dBzU`).
- **Badge**: page Chips & labels, node `21:84`.
  - Properties: Label (text).
  - Colour tokens: action/primary, text/primary.
  - Text styles: Overline.

## Rules

- Use one or two per title. In Figma the Overline text style sets the caps.
- In code, write the words in sentence case and let CSS uppercase them, so screen readers don't spell them out.

## In code

Paths are under `apps/web/src`.

- `<span className="badge">`. The Task card adds `text-transform: uppercase`. The Work page still writes `w.kind.toUpperCase()`; move it to CSS when touched.

## Accessibility

- Uppercasing in CSS keeps screen readers saying words, not letters.

Related skills: vinden-atom-pill, vinden-visual-guidelines.
